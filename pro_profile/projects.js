// Projects section.
//
// The cards are not written in the HTML. They are drawn from the `projects`
// array below. Adding or deleting a project changes the array first, then
// renderProjects() clears the list and redraws every card from the array.
(function () {
  var projects = [
    {
      name: "Marketing Analytics Dashboard",
      description: "A Looker Studio dashboard that pulls GA4 and ad platform data into one weekly view of leads, spend, and cost per lead."
    },
    {
      name: "AI Follow-Up Assistant",
      description: "An automation that drafts follow-up emails from CRM notes, so sales reps can review and send them in seconds."
    }
  ];

  var form = document.getElementById("project-form");
  var nameInput = document.getElementById("project-name");
  var descriptionInput = document.getElementById("project-description");
  var list = document.getElementById("project-list");
  var emptyMessage = document.getElementById("project-empty");
  var status = document.getElementById("project-status"); // read aloud by screen readers

  // Loop through the array and build one card per project:
  // <li><article><h3>name</h3><p>description</p><button>×</button></article></li>
  function renderProjects() {
    list.replaceChildren(); // remove the old cards

    projects.forEach(function (project, index) {
      var item = document.createElement("li");
      var card = document.createElement("article");
      card.className = "project-card";

      // textContent, not innerHTML, so typed text can never become HTML
      var heading = document.createElement("h3");
      heading.textContent = project.name;

      var description = document.createElement("p");
      description.textContent = project.description;

      var deleteButton = document.createElement("button");
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
    var removed = projects.splice(index, 1)[0];
    renderProjects();
    status.textContent = "Deleted " + removed.name + ".";

    // The button that had focus is gone. Move focus to the card that took
    // its place (or the last card), or back to the form if none are left.
    var buttons = list.querySelectorAll(".project-delete");
    var next = buttons[Math.min(index, buttons.length - 1)];
    (next || nameInput).focus();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // stop the page from reloading

    // "required" accepts a field of only spaces, so check the trimmed text
    var name = nameInput.value.trim();
    var description = descriptionInput.value.trim();
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
})();
