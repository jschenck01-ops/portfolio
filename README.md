# Strata — Portfolio Template Replica

A faithful, hand-built replica of the [Strata](https://www.framer.com/community/marketplace/templates/strata/)
Framer template — a dark, minimal, typography-driven portfolio for designers &
art directors.

Built as a self-contained static site: no build step, no framework.

## Structure

```
├── index.html            # single-page portfolio (hero, work, about, contact)
├── projects/
│   └── project.html      # case-study detail page
├── css/
│   ├── style.css         # core styles + design tokens
│   └── project.css       # case-study page styles
├── js/
│   └── main.js           # nav, reveal-on-scroll, floating project preview
└── assets/               # SVG project thumbnails
```

## Features

- Responsive layout (desktop → mobile) with a mobile menu
- Sticky, blur-on-scroll navigation
- Reveal-on-scroll animations (IntersectionObserver)
- Floating image preview on project hover (desktop)
- Infinite marquee of services
- `prefers-reduced-motion` support
- System-font fallback with Google Fonts (Inter + Instrument Serif)

## Running

Open `index.html` in a browser, or serve locally:

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

## Design tokens

| Token      | Value       | Use                    |
|------------|-------------|------------------------|
| `--bg`     | `#0a0a0a`   | Page background        |
| `--fg`     | `#f4f2ee`   | Primary text           |
| `--muted`  | `#8a8a86`   | Secondary text         |
| `--line`   | `rgba(255,255,255,.10)` | Hairline borders |

Content (names, clients, projects) is placeholder — swap it for your own.
