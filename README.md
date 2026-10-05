# Doc Carson — Personal Profile Page

A simple, responsive personal profile page built with plain HTML and CSS — no frameworks, no build step.

## What's inside

- **About**: a short professional bio
- **Skills**: a list of core skills
- **Contact**: a contact form with built-in HTML validation (name, email, phone, subject, message)
- **Navigation**: a menu that collapses into a toggle button on small screens, using CSS only (no JavaScript)
- **Dark mode**: a switch in the top right turns dark mode on and off, and remembers your choice after a refresh (`theme.js`)
- **Responsive layout**: mobile-first styles that adapt at 768px (tablet) and 1024px (desktop)

> Note: the contact form is front-end only. It isn't connected to a server, so submissions aren't sent anywhere.

## Project structure

```
.
├── pro_profile/
│   ├── index.html   # Page markup
│   ├── styles.css   # Styles and responsive breakpoints
│   └── theme.js     # Remembers the dark mode setting
├── LICENSE
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
