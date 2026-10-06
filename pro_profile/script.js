// Skills section: skill cards, their tooltips, and the "add a skill" form.
//
// The cards are not written in the HTML. They are drawn from the `skills`
// array below. Adding or removing a skill changes the array first, saves it
// to localStorage, then renderSkills() clears the list and redraws the
// cards from the array. On page load the saved array is read back, so
// changes survive a reload. A first visit starts from DEFAULT_SKILLS.
//
// The filter buttons only change which cards are drawn. They never change
// the skills array itself, so nothing is lost or saved by filtering.
//
// Each .skill-card <button> controls the <aside> named in its aria-controls.
// - Mouse (hover: hover and pointer: fine): hovering a card opens its
//   tooltip; it closes ~200ms after the pointer leaves both card and tooltip.
// - Touch: tapping a card toggles its tooltip; tapping outside closes it.
// - Keyboard: Enter/Space toggles; Escape closes and returns focus to the card.
// Only one tooltip is open at a time.
(function () {
  // level is one of: "learning", "practicing", "confident".
  // description is optional; without one, the tooltip describes the level.
  const DEFAULT_SKILLS = [
    {
      name: "Technical & On-Page SEO",
      level: "confident",
      description: "Uncover keyword gaps and quick wins, fix technical issues, and build internal linking structures that grow organic traffic."
    },
    {
      name: "Paid Search",
      level: "confident",
      description: "Plan, launch, and optimize Google and Bing campaigns that turn search intent into qualified leads."
    },
    {
      name: "Marketing Analytics & Dashboards",
      level: "confident",
      description: "Set up clean tracking with GA4 and Google Tag Manager, then turn the data into Looker Studio dashboards that leaders can act on."
    },
    {
      name: "CRM & Marketing Automation",
      level: "confident",
      description: "Connect HubSpot and Salesforce data, build automated email sequences, and A/B test them to put the right message in front of the right people."
    },
    {
      name: "AI Entrepreneurship",
      level: "practicing",
      description: "Bring AI and automation into everyday marketing workflows so small businesses can do more with less."
    },
    {
      name: "Web Development",
      level: "practicing",
      description: "Build SEO-ready websites and reusable landing page templates that scale as a business grows."
    }
  ];

  const LEVEL_LABELS = {
    learning: "Learning",
    practicing: "Practicing",
    confident: "Confident"
  };

  const LEVEL_DESCRIPTIONS = {
    learning: "Currently learning this skill.",
    practicing: "Using this skill regularly and building experience.",
    confident: "Comfortable using this skill on client work."
  };

  const STORAGE_KEY = "skills";

  // The list the page shows and changes. Filled from localStorage (or the
  // defaults); add and remove change it with push() and splice().
  const skills = loadSkills();

  const list = document.getElementById("skill-list");
  const form = document.getElementById("skill-form");
  const nameInput = document.getElementById("skill-name");
  const levelSelect = document.getElementById("skill-level");
  const emptyMessage = document.getElementById("skill-empty");
  const filterGroup = document.getElementById("skill-filters");
  const filterButtons = filterGroup.querySelectorAll("button");
  const count = document.getElementById("skill-count");
  const status = document.getElementById("skill-status"); // read aloud by screen readers

  const mouseQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  const CLOSE_DELAY = 200; // ms before a hover tooltip closes
  const EDGE = 16;         // px a tooltip must stay away from the screen edges

  let openCard;   // the card whose tooltip is open (undefined when none)
  let closeTimer; // pending hover-close timer (undefined when none)
  let lastPointerType = "mouse";
  let activeFilter = "all"; // "all" or one of the levels

  // ---- Saving to localStorage --------------------------------------------

  // Read the saved array. Falls back to the defaults on a first visit
  // (nothing saved yet), or if the saved text is unreadable or storage is
  // blocked (e.g. private browsing). An empty saved array stays empty, so
  // removing every skill also survives a reload.
  function loadSkills() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter(isValidSkill);
      }
    } catch (e) {
      // Fall through to the defaults below
    }
    return DEFAULT_SKILLS.slice(); // a copy, so the defaults stay untouched
  }

  // Skip saved entries edited into a shape the cards can't show
  function isValidSkill(skill) {
    return typeof skill === "object" && !!skill &&
      typeof skill.name === "string" && skill.name.trim() !== "" &&
      Object.hasOwn(LEVEL_LABELS, skill.level) &&
      (!("description" in skill) || typeof skill.description === "string");
  }

  function saveSkills() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(skills));
    } catch (e) {
      // Storage is blocked or full: the change still shows on the page,
      // it just won't be remembered after a reload.
    }
  }

  // ---- Rendering ---------------------------------------------------------

  // Loop through the array and build one card per skill:
  // <li>
  //   <button class="skill-card">name <small class="skill-level">level</small></button>
  //   <button class="skill-remove">×</button>
  //   <aside class="skill-tooltip"><p>description</p><button>×</button></aside>
  // </li>
  function renderSkills() {
    close(false);           // an open tooltip's card is about to be removed
    list.replaceChildren(); // remove the old cards so none are duplicated

    // Pair each skill with its place in the full array before filtering.
    // The remove button needs that original index, not its filtered position.
    const visible = skills
      .map(function (skill, index) {
        return { skill: skill, index: index };
      })
      .filter(function (entry) {
        return activeFilter === "all" || entry.skill.level === activeFilter;
      });

    visible.forEach(function (entry, position) {
      const skill = entry.skill;
      const index = entry.index;
      const cardId = "skill-card-" + (index + 1);
      const tipId = "skill-tip-" + (index + 1);

      const item = document.createElement("li");

      // textContent, not innerHTML, so typed text can never become HTML
      const card = document.createElement("button");
      card.type = "button";
      card.className = "skill-card";
      card.id = cardId;
      card.setAttribute("aria-expanded", "false");
      card.setAttribute("aria-controls", tipId);
      card.textContent = skill.name;

      const level = document.createElement("small");
      level.className = "skill-level";
      level.dataset.level = skill.level;
      level.textContent = LEVEL_LABELS[skill.level];
      card.append(level);

      const tooltip = document.createElement("aside");
      tooltip.className = "skill-tooltip";
      tooltip.id = tipId;
      tooltip.setAttribute("aria-labelledby", cardId);
      tooltip.hidden = true;

      const text = document.createElement("p");
      text.textContent = skill.description || LEVEL_DESCRIPTIONS[skill.level];

      const closeButton = document.createElement("button");
      closeButton.type = "button";
      closeButton.className = "tooltip-close";
      closeButton.setAttribute("aria-label", "Close");
      closeButton.textContent = "×";

      tooltip.append(text, closeButton);

      // A separate button, not inside the card: a <button> can't hold another.
      // It remembers this skill's index so the handler knows which to remove.
      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "skill-remove";
      removeButton.textContent = "×";
      removeButton.setAttribute("aria-label", "Remove " + skill.name);
      removeButton.addEventListener("click", function () {
        removeSkill(index, position);
      });

      item.append(card, removeButton, tooltip);
      list.append(item);

      setUpCard(card);
    });

    // Empty message: none at all, or none at the chosen level
    if (skills.length === 0) {
      emptyMessage.textContent = "No skills yet. Add one above.";
    } else {
      emptyMessage.textContent = "No " + activeFilter + " skills yet.";
    }
    emptyMessage.hidden = visible.length > 0;

    count.textContent = "Showing " + visible.length + " of " + skills.length +
      (skills.length === 1 ? " skill" : " skills");

    // Highlight the active filter button
    filterButtons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.filter === activeFilter));
    });
  }

  // ---- Filter by level ---------------------------------------------------

  // One listener on the group handles all four buttons
  filterGroup.addEventListener("click", function (event) {
    const button = event.target.closest("button");
    if (!button) return;

    activeFilter = button.dataset.filter;
    renderSkills();
    status.textContent = count.textContent + "."; // e.g. "Showing 3 of 7 skills."
  });

  // ---- Remove a skill ----------------------------------------------------

  // index: the skill's place in the full skills array (what to remove).
  // position: its place among the cards on screen (where focus goes next).
  function removeSkill(index, position) {
    const removed = skills.splice(index, 1)[0]; // take it out of the array
    saveSkills();                               // remember the change
    renderSkills();                             // redraw from the array
    status.textContent = "Removed " + removed.name + ". " + count.textContent + ".";

    // The button that had focus is gone. Move focus to the remove button of
    // the card that took its place (or the last one), or to the form if no
    // cards are showing.
    const buttons = list.querySelectorAll(".skill-remove");
    const next = buttons[Math.min(position, buttons.length - 1)];
    (next || nameInput).focus();
  }

  // ---- Add a skill -------------------------------------------------------

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // stop the page from reloading

    // "required" accepts a field of only spaces, so check the trimmed text
    const name = nameInput.value.trim();
    const level = levelSelect.value;
    const duplicate = skills.some(function (skill) {
      return skill.name.toLowerCase() === name.toLowerCase();
    });
    nameInput.setCustomValidity(
      !name ? "Please enter a skill name." :
      duplicate ? "That skill is already listed." : ""
    );
    if (!form.reportValidity()) return;

    skills.push({ name: name, level: level });
    saveSkills();

    // If the new skill wouldn't match the active filter, switch to All so
    // it doesn't seem to vanish
    if (activeFilter !== "all" && activeFilter !== level) activeFilter = "all";
    renderSkills();

    form.reset();
    status.textContent = "Added " + name + " (" + LEVEL_LABELS[level] + "). " + count.textContent + ".";
    nameInput.focus(); // ready to add another
  });

  // Clear the "please enter" message as soon as the user starts typing
  nameInput.addEventListener("input", function () {
    nameInput.setCustomValidity("");
  });

  // ---- Tooltips ----------------------------------------------------------

  function tooltipFor(card) {
    return document.getElementById(card.getAttribute("aria-controls"));
  }

  function isMouse(event) {
    return event.pointerType === "mouse" && mouseQuery.matches;
  }

  function cancelClose() {
    clearTimeout(closeTimer);
    closeTimer = undefined;
  }

  function scheduleClose() {
    cancelClose();
    closeTimer = setTimeout(function () { close(false); }, CLOSE_DELAY);
  }

  function open(card) {
    cancelClose();
    if (openCard === card) return;
    if (openCard) close(false);

    const tooltip = tooltipFor(card);
    tooltip.hidden = false;
    card.setAttribute("aria-expanded", "true");
    openCard = card;
    keepOnScreen(tooltip);
  }

  function close(returnFocus) {
    cancelClose();
    if (!openCard) return;

    const card = openCard;
    openCard = undefined;
    card.setAttribute("aria-expanded", "false");
    if (returnFocus) card.focus();
    tooltipFor(card).hidden = true;
  }

  // Slide the tooltip sideways if it would poke past either screen edge,
  // and flip it below the card if there's no room above or it would cover
  // the add-a-skill form (the form spans the full width, so only the
  // vertical position matters).
  function keepOnScreen(tooltip) {
    tooltip.style.setProperty("--shift", "0px");
    tooltip.classList.remove("is-below");

    const rect = tooltip.getBoundingClientRect();
    const maxRight = document.documentElement.clientWidth - EDGE;
    let shift = 0;
    if (rect.left < EDGE) {
      shift = EDGE - rect.left;
    } else if (rect.right > maxRight) {
      shift = maxRight - rect.right;
    }
    tooltip.style.setProperty("--shift", shift + "px");

    const coversForm = rect.top < form.getBoundingClientRect().bottom;
    if (rect.top < EDGE || coversForm) tooltip.classList.add("is-below");
  }

  // Called by renderSkills() for every new card. Cards are rebuilt on each
  // render, so their listeners are attached here rather than once on load.
  function setUpCard(card) {
    const item = card.parentElement; // the <li> holding the card and tooltip
    const tooltip = tooltipFor(card);

    card.addEventListener("click", function (event) {
      // A mouse click on a card that hover already opened keeps it open.
      // Taps and keyboard presses (detail === 0) toggle it.
      const mouseClick = event.detail > 0 && lastPointerType === "mouse" && mouseQuery.matches;
      if (openCard === card && !mouseClick) {
        close(false);
      } else {
        open(card);
      }
    });

    // pointerenter/leave on the <li> cover both the card and its tooltip
    item.addEventListener("pointerenter", function (event) {
      if (isMouse(event)) open(card);
    });

    item.addEventListener("pointerleave", function (event) {
      if (isMouse(event) && openCard === card) scheduleClose();
    });

    // Tabbing away from the card and its tooltip closes it
    item.addEventListener("focusout", function (event) {
      if (openCard === card && !item.contains(event.relatedTarget)) close(false);
    });

    tooltip.querySelector(".tooltip-close").addEventListener("click", function () {
      close(true);
    });
  }

  // Page-wide listeners: attached once, they work for every card.
  // Remember how the user is pointing, and close on taps/clicks outside.
  // pointerdown (not click) so it also fires on iOS for taps on plain text.
  document.addEventListener("pointerdown", function (event) {
    lastPointerType = event.pointerType;
    if (openCard && !openCard.parentElement.contains(event.target)) close(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && openCard) close(true);
  });

  window.addEventListener("resize", function () {
    if (openCard) keepOnScreen(tooltipFor(openCard));
  });

  renderSkills(); // draw the cards on page load
})();
