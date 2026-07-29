# jeffschenck.com

Personal brand site for **Jeff Schenck** — Chief Brand Strategist & Fractional CMO.
Design concept: **"Signal"** — a dark, editorial site where the marketing noise
literally settles into a clear message.

## Stack
Plain static HTML/CSS/JS. No build step, no dependencies, no framework. Fast,
portable, and hostable anywhere (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3).

## Structure
```
index.html          Home  — hero, record/stats, thesis, selected work, services, newsletter, CTA
work.html           Work  — case studies (TreeRaise, BlueDot Cares, Sneakers4Good) + detail
about.html          About — bio, portrait, by-the-numbers, how I work
newsletter.html     Newsletter — signup + latest issues
assets/css/site.css Design system (colors, type, components)
assets/js/site.js   Behaviour (noise field, reveals, counters, thesis reveal, nav, mobile menu)
assets/img/         Images + SVG placeholders (see IMAGES.md)
```

## Design tokens
- Void `#0A0A0C` · Bone `#EFEDE6` · Ember `#FF4D1C` · Dim `#6A6862`
- Display: **Bricolage Grotesque** · Serif accents: **Newsreader** · Labels: **JetBrains Mono**

## Editing content
All copy lives directly in the `.html` files. Search for the text and edit in place.

## Links wired
- **Book a call** → `https://calendly.com/jschenck01/strategy-session-with-jeff-schenck`
- **LinkedIn / Newsletter** → `https://www.linkedin.com/in/jschenck01/`
- **Email** → `jeff@donarus.com`

The newsletter form is a front-end stub that redirects to LinkedIn. To connect a
real provider (Beehiiv, ConvertKit, Mailchimp), point `data-redirect` / the form
action at your provider — see `assets/js/site.js` §7.

## Images
See **[IMAGES.md](IMAGES.md)** for the exact files and sizes to provide. The site
runs today with branded placeholders; real images drop in by filename.

## Local preview
```bash
python3 -m http.server 8000    # then open http://localhost:8000
```

## Accessibility / performance
- Respects `prefers-reduced-motion` (animations disabled).
- Skip link, semantic landmarks, keyboard-accessible nav + mobile menu.
- Lazy-loaded images, system-font fallbacks, no render-blocking JS.
