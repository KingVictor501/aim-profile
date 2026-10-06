// Remember the dark mode switch across page refreshes.
// Loaded right after the switch in index.html, so the saved setting is
// applied before the rest of the page shows (no flash of light mode).
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
