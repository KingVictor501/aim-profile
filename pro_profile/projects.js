// Projects section.
//
// The cards are not written in the HTML. They are drawn from the `projects`
// array below. Adding or deleting a project changes the array first, then
// renderProjects() clears the list and redraws every card from the array.
(function () {
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
    const next = buttons[Math.min(index, buttons.length - 1)];
    (next || nameInput).focus();
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
})();
