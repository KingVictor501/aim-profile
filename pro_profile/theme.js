// Remember the dark mode switch across page refreshes.
// Loaded right after the switch in index.html, so the saved setting is
// applied before the rest of the page shows (no flash of light mode).
(function () {
  var toggle = document.getElementById("theme-toggle");
  var key = "theme";

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
})();
