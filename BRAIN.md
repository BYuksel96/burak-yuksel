# BRAIN.md

## Purpose
This is the operational memory for the personal website revamp. Read this file first before working in the repo, then inspect only the files relevant to the task.

Keep it compact and update it when there is a meaningful decision, implementation milestone, verification result, blocker, or handoff note. Prefer facts and links to source files over long narrative.

## Current Snapshot
- Project: Burak Yuksel personal/professional website.
- Stack: Astro 5 static site, Markdown blog content, JSON resume timeline, CSS, page-local browser JavaScript.
- Hosting: GitHub Pages with custom domain `burakyuksel.dev`.
- Branch at brain creation: `feature/mobile_optimisation`.
- Current dirty state at brain creation: `public/Resume-BURAK-YUKSEL.pdf` is modified and should not be overwritten casually.
- Latest verified build at brain creation: `npm run build` succeeds and generates 5 static pages.

## Project Shape
- `src/pages/index.astro`: landing hub with animated name intro and circular links to Resume, Blog, and GitHub.
- `src/pages/resume.astro`: resume/CV timeline page backed by `src/content/timeline.json`, with GSAP timeline animation, modal details, floating desktop links, and mobile nav.
- `src/pages/blog/index.astro`: blog list grouped by year, renders Markdown content into modal previews, supports copy/LinkedIn sharing.
- `src/pages/blog/[slug].astro`: statically generated single-post pages using `canonicalSlug` when present.
- `src/layouts/BaseLayout.astro`: shared HTML shell, SEO/Open Graph/Twitter metadata, optional header, footer, and body class hooks.
- `src/content/config.ts`: Astro content collection schema for blog frontmatter.
- `src/styles/global.css`: base theme, landing hub, shared starter styles.
- `src/styles/cv.css`: resume timeline, modal, floating icons, mobile nav, fixed footer layout.
- `src/styles/blog.css`: blog list, post modal, single post layout, sharing UI, mobile adaptations.
- `public/`: images, favicon/logo assets, downloadable resume PDF, and `CNAME`.
- `.github/workflows/deploy.yaml`: builds and deploys GitHub Pages from pushes to `main`, plus manual dispatch.

## Current UX
- Home is a minimal animated hub rather than a conventional portfolio homepage.
- Resume is the richest page: animated vertical timeline, circular image cards, modal expansion, fixed footer, and responsive/mobile nav.
- Blog index works as both an archive and reader: clicking a post opens a modal while each post also has a static route.
- Blog single pages duplicate much of the navigation/share behavior from the blog index.
- Desktop quick links use fixed floating flip cards; below roughly `1500px`, they switch to a compact hamburger-style mobile nav.
- Visual style is currently monochrome grey, circular/flip interactions, glowing cards, and page-level animations.

## Tech & Commands
- Package manager: npm with `package-lock.json`.
- Main scripts:
  - `npm run dev`: start Astro dev server.
  - `npm run build`: build static output to `dist/`.
  - `npm run preview`: preview built site locally.
  - `npm run astro`: pass-through Astro CLI.
- Dependencies at brain creation: only `astro` in `package.json`.
- GSAP is loaded from CDN in `index.astro` and `resume.astro`, not installed as an npm dependency.
- No lint, format, unit test, or e2e scripts are currently defined.
- `dist/` exists locally but is not tracked by git.

## Known Decisions
- Keep the site fully static: no backend, database, auth, or runtime server.
- Blog content lives in Markdown under `src/content/blog` and is validated by Astro content collections.
- Resume timeline content lives in `src/content/timeline.json`.
- Deployment targets GitHub Pages from `main` with `astro.config.mjs` configured for `https://burakyuksel.dev` and `/` base.
- Use `BaseLayout.astro` for shared metadata and page shell, while major page UX currently remains page-local.

## Risks / Cleanup Candidates
- README appears stale in places: it mentions `src/components` and GSAP as stack/dependency context, but no `src/components` directory exists and GSAP is CDN-loaded.
- Some text output/content shows mojibake/encoding artifacts in README and timeline strings; preserve intent carefully if editing copy.
- Inline navigation, share UI, icons, and modal logic are repeated across resume/blog pages and could benefit from component extraction during the revamp.
- Page-local JavaScript is large, especially in `resume.astro`; changes need careful browser verification across mobile, desktop, resize, and reduced-motion cases.
- CSS is spread by page but selectors overlap names like `.card`, `.face`, `.floating-icons`, and `.mobile-nav`; watch for cross-page side effects.
- `public/Resume-BURAK-YUKSEL.pdf` was already modified before this brain file was created; treat it as user-owned unless explicitly asked to update it.

## Running Log
- 2026-06-11: Created operational brain for website revamp. Repo inspected as Astro static personal site on `feature/mobile_optimisation`; `npm run build` previously verified successfully with 5 generated pages. Existing dirty tracked file: `public/Resume-BURAK-YUKSEL.pdf`.

## Next Work Queue
- Decide the revamp direction: keep animated hub/timeline concept, simplify into a more conventional professional portfolio, or blend both.
- Refresh stale docs once the revamp direction is chosen.
- Consider extracting repeated nav/share/icon/modal patterns into Astro components.
- Audit copy and encoding artifacts before polishing public content.
- Add at least one lightweight verification path beyond build, such as a documented manual browser checklist or Playwright smoke checks if the revamp increases interaction complexity.
