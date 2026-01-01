# burak-yuksel

This repository contains the source code and content for my personal professional website.

The site serves as:
- My online CV
- A timeline of my career and experience
- A blog for long-form writing on topics such as delivery, leadership, and engineering
- A central hub linking to my GitHub and professional profiles

The website is intentionally designed to be:
- Clean and minimal
- Fully static
- Fast, accessible, and responsive
- Easy to maintain over time

---

## 🧱 Tech Stack

- **Astro** — static site generation
- **Markdown** — blog content
- **JSON** — structured CV timeline data
- **CSS + JavaScript** — styling and interaction
- **GSAP** — animations and scroll-based effects
- **GitHub Pages** — hosting and deployment

No backend, database, or authentication is used.

---

## 📂 Project Structure (High Level)

- `/src/pages` — site pages (home, CV, blog)
- `/src/components` — reusable UI components
- `/src/content/blog` — blog posts written in Markdown
- `/src/content/timeline.json` — CV timeline data
- `/public` — static assets (including downloadable CV PDF)

---

## ✍️ Writing & Publishing

Blog posts are written as Markdown files with metadata (title, date, tags, read time).  
Publishing a new article is as simple as adding a new file and pushing to the repository.

The CV timeline is driven from structured data, allowing updates without touching layout code.

---

## Project Structure
```
/
├── public/
├── src/
│   ├── content/
│   │   ├── blog/         # Markdown posts
│   │   └── config.ts     # Content collections schema
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/            # File-based routes
│   │   ├── index.astro
│   │   └── blog/
│   │       ├── [slug].astro
│   │       └── index.astro
│   └── styles/
│       └── global.css
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

---

## Commands
- `npm install` — install dependencies
- `npm run dev` — start local dev server at `http://localhost:4321`
- `npm run build` — build the static site to `dist/`
- `npm run preview` — preview the production build locally

---

## GitHub Pages Setup
1. Update `site` and `base` in `astro.config.mjs` to match your repo. Example for a repo named `burak-yuksel`:  
   ```js
   export default defineConfig({
     site: 'https://<your-username>.github.io/burak-yuksel',
     base: '/burak-yuksel/',
     output: 'static',
   });
   ```
2. Build the site: `npm run build` (outputs to `dist/`).
3. Deploy `dist/` to GitHub Pages (e.g., push with a `gh-pages` branch or configure Pages to serve from `dist` via GitHub Actions).

Markdown posts live in `src/content/blog`. Frontmatter is validated by the schema in `src/content/config.ts`, and the routes are generated statically for GitHub Pages-friendly hosting.

---

## 🔐 Licensing

This repository uses **two licenses**, applied intentionally:

### Source Code
All source code and configuration files are licensed under the **MIT License**.

See `LICENSE` for details.

### Written Content
All written content (blog posts, CV text, timeline descriptions) is licensed under:

**Creative Commons Attribution–NonCommercial–NoDerivatives 4.0 (CC BY-NC-ND 4.0)**

This allows free reading and sharing with attribution, while preventing commercial use or modification.

See `CONTENT-LICENSE.md` for details.

---

## 📌 Notes

- This is a personal, professional project.
- The design and animations are intentionally opinionated.
- Content reflects my own experience and views.

---

© 2026 Burak Yuksel
