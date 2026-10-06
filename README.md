# Doc Carson — Personal Profile Site

A simple, responsive three-page personal site built with plain HTML, CSS and JavaScript — no frameworks, no build step.

## Pages

| Page | File | Contents |
|---|---|---|
| Home | `index.html` | Name, tagline, short intro, links to the other pages, and the contact form |
| About | `about.html` | Professional bio and the Skills section |
| Projects | `projects.html` | The Projects section |

Every page shares the same nav bar, dark mode switch, footer, stylesheet (`styles.css`) and script (`scripts.js`).

## What's inside

- **About** (`about.html`): a short professional bio
- **Skills** (`about.html`): interactive cards drawn from a JavaScript array, each showing a level (learning, practicing or confident). Add a skill with the form above the list, or remove one with its × button. Filter buttons (All, Learning, Practicing, Confident) show only one level, with a count below the list ("Showing 3 of 7 skills"). Hover (mouse) or tap (touch) a card to see a tooltip describing that skill. Changes are saved in your browser (localStorage), so they're still there after a reload
- **Projects** (`projects.html`): project cards drawn from a JavaScript array. Add a project with the form, or delete one with its × button. Changes last until you reload or leave the page
- **Contact** (`index.html`): a contact form that checks each field as you fill it in and shows a clear message under any field with a problem: name, email (must end in .com, .gov, .edu, .org or .mil) and phone (10 digits, with or without hyphens or parentheses), plus a required message
- **Navigation**: a nav bar at the top of every page linking Home, About and Projects. The current page's link is highlighted (marked with `aria-current="page"`). On small screens it collapses into a menu button, using CSS only (no JavaScript)
- **Dark mode**: a switch in the top right turns dark mode on and off, and remembers your choice after a refresh and across pages. Press **Alt+T** (**Option+T** on a Mac) to toggle it from the keyboard
- **Accessibility**: a skip link, visible keyboard focus, full keyboard support, WCAG AA color contrast in both themes, and support for reduced motion and Windows High Contrast mode
- **Responsive layout**: mobile-first styles that adapt at 768px (tablet) and 1024px (desktop)

> Note: the contact form is front-end only. It isn't connected to a server, so submissions aren't sent anywhere.

## Project structure

```
.
├── pro_profile/
│   ├── index.html     # Home page: intro and contact form
│   ├── about.html     # About page: bio and skills
│   ├── projects.html  # Projects page
│   ├── styles.css     # Shared styles for every page
│   └── scripts.js     # Shared JavaScript: dark mode, skills, projects
├── LICENSE
├── PROMPT_TRACE.md
└── README.md
```

## How to view it

**Option 1: open the file directly**

1. Clone the repo:
   ```
   git clone https://github.com/KingVictor501/aim-profile.git
   ```
2. Open `pro_profile/index.html` in any web browser (double-click it, or drag it into a browser window).

**Option 2: run a local server**

From the project folder:

```
cd pro_profile
python3 -m http.server 8000
```

Then go to http://localhost:8000.

To check the responsive layout, resize the browser window or use your browser's device toolbar (in Chrome: DevTools → Toggle device toolbar).

## License

The code (HTML and CSS) is released under the [MIT License](LICENSE). The personal content on the page, such as the bio, is © 2026 Doc Carson, all rights reserved.
