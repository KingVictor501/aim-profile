# Prompt Trace: Skills Section

How the Skills section was built with Claude Code: what I asked for, what Claude generated, and how each step was verified. Every feature was tested in headless Chrome with automated scripts, and the screenshots were reviewed.

---

## 1. Turn the hardcoded skills into a JavaScript array

**What I asked**
> Refactor the skills section in index.html. Instead of hardcoding each skill as an `<li>` tag, create a JavaScript array called `skills` at the top of the script — each item should be an object with `name` and `level` properties. Write a `renderSkills()` function that clears the skills list and loops through the array, creating a styled `<li>` for each skill. Call `renderSkills()` on page load. Then add a small form above the list — an input for the skill name, a dropdown for level (learning/practicing/confident), and an 'Add' button. When submitted, push the new skill to the array and call `renderSkills()` again.

**What Claude generated**
- Removed the six hardcoded `<li>` skills from `index.html` and left an empty `<ul id="skill-list">`.
- Added `const skills = [...]` at the top of `script.js` (not inline in `index.html`, to match how `projects.js` is organised). Each skill has `name`, `level`, and its original tooltip `description`, so no tooltip text was lost.
- `renderSkills()` clears the list with `list.replaceChildren()`, then builds each card with `document.createElement` and `textContent`.
- A form with a name input, a level dropdown and an Add button. The submit handler calls `e.preventDefault()`, pushes the skill, and calls `renderSkills()`.
- Moved the tooltip setup into `setUpCard()`, called for each new card. The old code attached listeners once on load, so redrawn cards would have lost their tooltips.
- A three-dot level meter on each card (●●○).

**What I verified**
| Check | Result |
|---|---|
| Data lives in a JS array, not HTML | ✅ No skill `<li>` or skill names left in `index.html` |
| Render clears the list before redrawing | ✅ 6 → 7 → 8 cards after adds, no duplicates |
| Submit calls `e.preventDefault()` | ✅ No page reload (checked with a marker variable that would be lost on reload) |
| A new skill actually shows up | ✅ Typed "Python", chose Learning, clicked Add: a 7th card appeared |
| `const` vs `let` | ✅ `const` array, changed only with `.push()` |

**Problems found and fixed during testing**
- My first CSS made "Entrepreneurship" break as "Entrepreneurshi / p". Measuring showed the original word was 0.1px wider than its space. Fixed by trimming the card's right padding.
- A very long skill name with no spaces made the page scroll sideways on phones. Fixed with `minmax(0, 1fr)` grid columns.

---

## 2. Add a remove button to each skill

**What I asked**
> Add a "remove" button on each item (hint: the handler needs the item's index)

**What Claude generated**
- A × button on each card. A `<button>` can't go inside the card, which is already a `<button>`, so the × is a separate button shown as a badge on the card's corner.
- Each button's click handler remembers its card's index: `removeSkill(index)` → `skills.splice(index, 1)` → `renderSkills()`.

**What I verified**
- ✅ Removing the first, a middle, the last and a newly added skill each removes the right one.
- ✅ Removing the 3rd item twice in a row removes the right skill both times, because each redraw gives every button a fresh index.
- ✅ Keyboard (Enter/Space), focus moves to the next ×, and the screen-reader message is announced.

**Problem found and fixed during testing**
- A top-row tooltip opened over the new form and blocked the Add button. Tooltips now open below the card when they'd cover the form.

---

## 3. Save skills in localStorage

**What I asked**
> Store the array in localStorage so items persist on reload

**What Claude generated**
- `loadSkills()` runs `JSON.parse(localStorage.getItem("skills"))` on load, falling back to the six defaults on a first visit.
- `saveSkills()` runs `localStorage.setItem("skills", JSON.stringify(skills))` after every add and remove.
- Both are wrapped in `try`/`catch`, so blocked storage or corrupted data can't break the page.

**What I verified**
- ✅ Added and removed skills survive a reload, and closing and reopening the browser.
- ✅ Removing every skill survives a reload (the defaults don't come back).
- ✅ Corrupted or non-array saved data loads the defaults with no crash. Broken individual entries are skipped.
- ✅ If storage is blocked, the page still works.

---

## 4. Remove buttons: removed, then restored

**What I asked**
> I only want the cards in the project section to have the ability to delete

then

> ok revert back to how it was before I requested the change

**What Claude generated**
- First removed the skill × buttons and kept the Projects delete button. Then restored the skill × buttons exactly as before.

**What I verified**
- ✅ After the revert, all three earlier test runs (remove, save/reload, add) pass again.

---

## 5. Filter buttons and a count

**What I asked**
> Add three filter buttons above the skills list: 'All', 'Learning', 'Practicing', 'Confident'. When a button is clicked, filter the skills array to only include items matching that level (or show all if 'All' is clicked). Re-render the list after filtering. Highlight the active button with a different background color. Show a count below the list: 'Showing 3 of 7 skills'.

**What Claude generated**
- Four buttons (the prompt says "three" but lists four), marked with `aria-pressed` so screen readers announce the active one.
- An `activeFilter` variable. `renderSkills()` builds a **new** array for display: `skills.map(...).filter(...)`. The `skills` array itself is never changed.
- Each × still removes by the skill's position in the **full** array, not its position on screen. Otherwise, under a filter, × would remove the wrong skill.
- An empty message for each case ("No learning skills yet." or "No skills yet. Add one above.") and the count "Showing X of Y skills".
- The active button uses inverted colours, so it stands out in both light and dark mode.

**What I verified**
| Check | Result |
|---|---|
| Filter changes what's displayed | ✅ Confident → 4, Practicing → 2, Learning → 0, All → 6 |
| Empty result | ✅ "No learning skills yet." with "Showing 0 of 6 skills" |
| Filter + add | ✅ A matching skill appears; a non-matching one switches the view to All so it's visible |
| Filter + remove | ✅ Removing "Web Development" under Practicing removed Web Development, not the 2nd skill overall |
| Count updates | ✅ On every filter click, add and remove; says "1 skill" for one |

---

## Quality check

| Requirement | Evidence |
|---|---|
| At least one working filter, sort or search | ✅ The level filter shows only matching skills for each of the 4 buttons |
| The original array is unchanged (filtering creates a derived view) | ✅ **Code:** `visible = skills.map(...).filter(...)` creates new arrays, and the filter handler only sets `activeFilter` and redraws. **Runtime:** after 8 filter clicks the "All" view is identical, and nothing is written to storage. I also added a skill while the Practicing filter was showing only 3 cards. Adding saves the whole in-memory array, and that save held all 7 skills in their original order, hidden ones included. |
| Empty state without errors or a blank section | ✅ The empty filter shows "No learning skills yet." plus the count and the filter buttons. An empty list shows "No skills yet. Add one above." No JavaScript errors in any state. |
| Prompt trace | ✅ This document |
