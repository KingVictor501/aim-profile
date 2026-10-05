# Doc Carson — Personal Profile Page

A simple, responsive personal profile page built with plain HTML and CSS — no frameworks, no build step.

## What's inside

- **About**: a short professional bio
- **Skills**: a list of core skills
- **Contact**: a contact form with built-in HTML validation (name, email, phone, subject, message)
- **Navigation**: a menu that collapses into a toggle button on small screens, using CSS only (no JavaScript)
- **Responsive layout**: mobile-first styles that adapt at 768px (tablet) and 1024px (desktop)

> Note: the contact form is front-end only. It isn't connected to a server, so submissions aren't sent anywhere.

## Project structure

```
.
├── week_4_day_1_afternoon/
│   ├── index.html   # Page markup
│   └── styles.css   # Styles and responsive breakpoints
├── LICENSE
└── README.md
```

## How to view it

**Option 1: open the file directly**

1. Clone the repo:
   ```
   git clone https://github.com/KingVictor501/aim-profile.git
   ```
2. Open `week_4_day_1_afternoon/index.html` in any web browser (double-click it, or drag it into a browser window).

**Option 2: run a local server**

From the project folder:

```
cd week_4_day_1_afternoon
python3 -m http.server 8000
```

Then go to http://localhost:8000.

To check the responsive layout, resize the browser window or use your browser's device toolbar (in Chrome: DevTools → Toggle device toolbar).

## License

The code (HTML and CSS) is released under the [MIT License](LICENSE). The personal content on the page, such as the bio, is © 2026 Doc Carson, all rights reserved.
