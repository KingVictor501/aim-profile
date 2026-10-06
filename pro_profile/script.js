// Skill cards and their tooltips.
//
// Each .skill-card <button> controls the <aside> named in its aria-controls.
// - Mouse (hover: hover and pointer: fine): hovering a card opens its
//   tooltip; it closes ~200ms after the pointer leaves both card and tooltip.
// - Touch: tapping a card toggles its tooltip; tapping outside closes it.
// - Keyboard: Enter/Space toggles; Escape closes and returns focus to the card.
// Only one tooltip is open at a time.
(function () {
  const cards = document.querySelectorAll(".skill-card");
  const mouseQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  const CLOSE_DELAY = 200; // ms before a hover tooltip closes
  const EDGE = 16;         // px a tooltip must stay away from the screen edges

  let openCard;   // the card whose tooltip is open (undefined when none)
  let closeTimer; // pending hover-close timer (undefined when none)
  let lastPointerType = "mouse";

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
  // and flip it below the card if there's no room above.
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

    if (rect.top < EDGE) tooltip.classList.add("is-below");
  }

  cards.forEach(function (card) {
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
  });

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
})();
