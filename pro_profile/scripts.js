// Shared JavaScript for every page (index.html, about.html, projects.html).
//
// 1. Dark mode runs straight away. This file is loaded right after the dark
//    mode switch in each page's <header>, so the saved setting is applied
//    before the rest of the page shows (no flash of light mode).
// 2. The Skills, Projects and Contact code waits until the page has finished
//    loading (DOMContentLoaded), then runs only on the page that has that
//    section.

// ==========================================================================
// 1. Dark mode
// ==========================================================================
// Remember the dark mode switch across page refreshes and between pages.
// Runs immediately (see the note at the top of this file).
(function () {
  const toggle = document.getElementById("theme-toggle");
  const key = "theme";

  try {
    toggle.checked = localStorage.getItem(key) === "dark";
  } catch (e) {
    // Storage is blocked (e.g. private browsing): the switch still works,
    // it just won't be remembered.
  }

  toggle.addEventListener("change", function () {
    try {
      localStorage.setItem(key, toggle.checked ? "dark" : "light");
    } catch (e) {}
  });

  // Keyboard shortcut: Alt+T (Option+T on a Mac) flips dark mode.
  // It needs a modifier key so it can't fire by accident while typing or
  // using voice control (WCAG 2.1.4). event.code is the physical T key,
  // because on a Mac Option+T types "†" rather than "t".
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
  if (isMac) document.querySelector("#theme-shortcut kbd").textContent = "Option";

  document.addEventListener("keydown", function (event) {
    if (event.code !== "KeyT" || !event.altKey) return;
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.repeat) return;

    event.preventDefault(); // don't type "†" or open a browser menu
    toggle.checked = !toggle.checked;
    // Fire "change" so the choice is saved, just like clicking the switch
    toggle.dispatchEvent(new Event("change"));
  });
})();

// True when this page has an element with the given id. querySelectorAll
// returns an empty list (never "nothing") when there's no match.
function pageHas(id) {
  return document.querySelectorAll("#" + id).length > 0;
}

// ==========================================================================
// 2. Skills (about.html)
// ==========================================================================
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
function initSkills() {
  // Only the page with the Skills section has #skill-list
  if (!pageHas("skill-list")) return;

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

  let closeTimer = 0; // pending hover-close timer (0 when none; real ids are above 0)
  let lastPointerType = "mouse";
  let activeFilter = "all"; // "all" or one of the levels

  // ---- Saving to localStorage --------------------------------------------

  // Read the saved array. Falls back to the defaults on a first visit
  // (nothing saved yet), or if the saved text is unreadable or storage is
  // blocked (e.g. private browsing). An empty saved array stays empty, so
  // removing every skill also survives a reload.
  function loadSkills() {
    try {
      // getItem gives back nothing on a first visit; "" stands in for that
      const saved = localStorage.getItem(STORAGE_KEY) || "";
      if (saved !== "") {
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
      // Skills added from the form have no description; describe the level
      text.textContent = "description" in skill ? skill.description : LEVEL_DESCRIPTIONS[skill.level];

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

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = button.dataset.filter;
      renderSkills();
      status.textContent = count.textContent + "."; // e.g. "Showing 3 of 7 skills."
    });
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
    if (buttons.length > 0) {
      buttons[Math.min(position, buttons.length - 1)].focus();
    } else {
      nameInput.focus();
    }
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

  // Which tooltip is open is read from the page, not kept in a variable:
  // an open card has aria-expanded="true". querySelectorAll returns an empty
  // list when none is open, so there is no "nothing" value to check for.
  function isOpen(card) {
    return card.getAttribute("aria-expanded") === "true";
  }

  function openCards() {
    return list.querySelectorAll('.skill-card[aria-expanded="true"]'); // at most one
  }

  function cancelClose() {
    clearTimeout(closeTimer); // clearTimeout(0) safely does nothing
    closeTimer = 0;
  }

  function scheduleClose() {
    cancelClose();
    closeTimer = setTimeout(function () { close(false); }, CLOSE_DELAY);
  }

  function open(card) {
    cancelClose();
    if (isOpen(card)) return;
    close(false); // only one tooltip open at a time

    const tooltip = tooltipFor(card);
    tooltip.hidden = false;
    card.setAttribute("aria-expanded", "true");
    keepOnScreen(tooltip);
  }

  function close(returnFocus) {
    cancelClose();
    openCards().forEach(function (card) {
      card.setAttribute("aria-expanded", "false");
      if (returnFocus) card.focus();
      tooltipFor(card).hidden = true;
    });
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
      if (isOpen(card) && !mouseClick) {
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
      if (isMouse(event) && isOpen(card)) scheduleClose();
    });

    // Tabbing away from the card and its tooltip closes it
    item.addEventListener("focusout", function (event) {
      if (isOpen(card) && !item.contains(event.relatedTarget)) close(false);
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
    openCards().forEach(function (card) {
      if (!card.parentElement.contains(event.target)) close(false);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && openCards().length > 0) close(true);
  });

  window.addEventListener("resize", function () {
    openCards().forEach(function (card) {
      keepOnScreen(tooltipFor(card));
    });
  });

  renderSkills(); // draw the cards on page load
}

// ==========================================================================
// 3. Projects (projects.html)
// ==========================================================================
// Projects section.
//
// The cards are not written in the HTML. They are drawn from the `projects`
// array below. Adding or deleting a project changes the array first, then
// renderProjects() clears the list and redraws every card from the array.
function initProjects() {
  // Only the page with the Projects section has #project-list
  if (!pageHas("project-list")) return;

  const projects = [
    {
      name: "Marketing Analytics Dashboard",
      description: "A Looker Studio dashboard that pulls GA4 and ad platform data into one weekly view of leads, spend, and cost per lead."
    },
    {
      name: "AI Follow-Up Assistant",
      description: "An automation that drafts follow-up emails from CRM notes, so sales reps can review and send them in seconds."
    }
  ];

  const form = document.getElementById("project-form");
  const nameInput = document.getElementById("project-name");
  const descriptionInput = document.getElementById("project-description");
  const list = document.getElementById("project-list");
  const emptyMessage = document.getElementById("project-empty");
  const status = document.getElementById("project-status"); // read aloud by screen readers

  // Loop through the array and build one card per project:
  // <li><article><h3>name</h3><p>description</p><button>×</button></article></li>
  function renderProjects() {
    list.replaceChildren(); // remove the old cards

    projects.forEach(function (project, index) {
      const item = document.createElement("li");
      const card = document.createElement("article");
      card.className = "project-card";

      // textContent, not innerHTML, so typed text can never become HTML
      const heading = document.createElement("h3");
      heading.textContent = project.name;

      const description = document.createElement("p");
      description.textContent = project.description;

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "project-delete";
      deleteButton.textContent = "×";
      deleteButton.setAttribute("aria-label", "Delete " + project.name);
      deleteButton.addEventListener("click", function () {
        deleteProject(index);
      });

      card.append(heading, description, deleteButton);
      item.append(card);
      list.append(item);
    });

    emptyMessage.hidden = projects.length > 0;
  }

  function deleteProject(index) {
    const removed = projects.splice(index, 1)[0];
    renderProjects();
    status.textContent = "Deleted " + removed.name + ".";

    // The button that had focus is gone. Move focus to the card that took
    // its place (or the last card), or back to the form if none are left.
    const buttons = list.querySelectorAll(".project-delete");
    if (buttons.length > 0) {
      buttons[Math.min(index, buttons.length - 1)].focus();
    } else {
      nameInput.focus();
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // stop the page from reloading

    // "required" accepts a field of only spaces, so check the trimmed text
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    nameInput.setCustomValidity(name ? "" : "Please enter a project name.");
    descriptionInput.setCustomValidity(description ? "" : "Please enter a description.");
    if (!form.reportValidity()) return;

    projects.push({ name: name, description: description });
    renderProjects();

    form.reset();
    status.textContent = "Added " + name + ".";
    nameInput.focus(); // ready to add another
  });

  // Clear the "please enter" message as soon as the user starts typing
  [nameInput, descriptionInput].forEach(function (input) {
    input.addEventListener("input", function () {
      input.setCustomValidity("");
    });
  });

  renderProjects();
}

// ==========================================================================
// 4. Contact form (index.html)
// ==========================================================================
// The form has novalidate, so the browser never shows its own pop-ups.
// Instead each field is checked:
// - when you leave it (blur), and then again on every keystroke, so you see
//   what's wrong while you type, not only after clicking Send;
// - all at once when you click Send.
// The HTML attributes (required, type="email", pattern, minlength) are still
// the rules: the code reads their results from el.validity and turns them
// into clear messages, plus checks HTML can't do (allowed email endings,
// exactly 10 phone digits).
function initContact() {
  if (!pageHas("contact-form")) return;

  const form = document.getElementById("contact-form");
  const status = document.getElementById("contact-status");
  const ALLOWED_EMAIL_ENDINGS = ["com", "gov", "edu", "org", "mil"];

  const fields = {
    name: document.getElementById("name"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    message: document.getElementById("message")
  };

  // Each returns an error message, or "" when the field is fine
  const validators = {
    name: function (el) {
      const value = el.value.trim();
      if (value === "") return "Please enter your name.";
      if (value.length < 2) return "Name must be at least 2 characters.";
      if (el.validity.patternMismatch) return "Use letters, spaces, hyphens, apostrophes and periods only.";
      return "";
    },

    email: function (el) {
      const value = el.value.trim();
      if (value === "") return "Please enter your email address.";
      // type="email" accepts "a@b", so also require a dotted domain
      if (el.validity.typeMismatch || !/^[^\s@]+@([a-z0-9-]+\.)+[a-z]{2,}$/i.test(value)) {
        return "Enter a valid email, like name@example.com.";
      }
      const ending = value.split(".").pop().toLowerCase();
      if (!ALLOWED_EMAIL_ENDINGS.includes(ending)) {
        return "Email must end in .com, .gov, .edu, .org or .mil.";
      }
      return "";
    },

    phone: function (el) {
      const value = el.value.trim();
      if (value === "") return "Please enter your phone number.";
      if (!/^[\d\s()-]+$/.test(value)) return "Use only digits, hyphens, spaces and parentheses.";
      const digits = value.replace(/\D/g, "").length;
      if (digits !== 10) {
        return "Phone number must have 10 digits (you've entered " + digits + ").";
      }
      // 10 digits, but in an odd arrangement like "55-51234-567"
      if (el.validity.patternMismatch) return "Use a format like 555-123-4567 or (555) 123-4567.";
      return "";
    },

    message: function (el) {
      if (el.value.trim() === "") return "Please enter a message.";
      return "";
    }
  };

  const touched = new Set(); // fields the user has left at least once

  // Characters that can never be right, shown the moment they're typed
  // instead of waiting until you leave the field
  const badCharacters = {
    name: /[^\p{L}\p{M}' .-]/u,
    phone: /[^\d\s()-]/
  };

  function validateField(name) {
    const el = fields[name];
    const message = validators[name](el);
    const field = el.parentElement; // the <p class="field">

    document.getElementById(name + "-error").textContent = message;
    el.setAttribute("aria-invalid", message ? "true" : "false");
    field.classList.toggle("is-invalid", message !== "");
    field.classList.toggle("is-valid", message === "");
    return message === "";
  }

  function clearField(name) {
    const el = fields[name];
    document.getElementById(name + "-error").textContent = "";
    el.removeAttribute("aria-invalid");
    el.parentElement.classList.remove("is-valid", "is-invalid");
  }

  Object.keys(fields).forEach(function (name) {
    const el = fields[name];

    // Leaving a field checks it, but only once something was typed, so
    // tabbing through an empty form doesn't fill it with errors
    el.addEventListener("blur", function () {
      if (el.value === "" && !touched.has(name)) return;
      touched.add(name);
      validateField(name);
    });

    // After that, re-check on every keystroke so the message updates live
    el.addEventListener("input", function () {
      if (name in badCharacters && badCharacters[name].test(el.value)) touched.add(name);
      if (touched.has(name)) validateField(name);
      status.textContent = "";
      status.className = "form-status";
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // stop the page from reloading

    const invalid = Object.keys(fields).filter(function (name) {
      touched.add(name);
      return !validateField(name);
    });

    if (invalid.length > 0) {
      status.className = "form-status is-error";
      status.textContent = "Please fix " + invalid.length + (invalid.length === 1 ? " field" : " fields") + " above.";
      fields[invalid[0]].focus();
      return;
    }

    // The form isn't connected to a server yet, so nothing is sent.
    // (Once it is, skip sending when the hidden honeypot field is filled in:
    // only bots fill it.)
    const name = fields.name.value.trim();
    form.reset(); // also clears the messages, via the reset listener below
    status.className = "form-status is-success";
    status.textContent = "Thanks, " + name + "! Your message is ready to send.";
  });

  // Reset clears the messages and colours as well as the fields
  form.addEventListener("reset", function () {
    touched.clear();
    Object.keys(fields).forEach(clearField);
    status.textContent = "";
    status.className = "form-status";
  });
}

// Run the page-specific parts once the page's HTML has been read
document.addEventListener("DOMContentLoaded", function () {
  initSkills();
  initProjects();
  initContact();
});
