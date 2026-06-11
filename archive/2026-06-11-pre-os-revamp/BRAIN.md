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

## Revamp Master Plan / Source of Truth

Source: User revamp brief provided on 2026-06-11. The `Next Work Queue` phases below come from this plan and should be executed in order. Do not attempt the full revamp in one pass.

### End State

* Convert the website into a one-page responsive “Burak OS” portfolio web app.
* Preserve the existing core content and destinations:

  * Resume timeline
  * Blog archive and posts
  * GitHub profile/repositories
  * LinkedIn link
  * Downloadable CV
* Keep the site static: no backend, database, auth, or runtime server.
* Everything should open inside the created OS/monitor interface except external links, which open in the real browser.

### Visual Concept

* The website should load directly into a monitor/OS-style interface.
* Style direction: clean, smart, minimal Linux-inspired OS.
* Must be responsive across desktop, laptop, tablet, mobile, and smaller screens.
* Support light/dark mode using user system preference.
* If no user preference is detected, default to dark mode.
* Dark theme base/background should retain the current grey tone: `#5f6368`.

### Initial Load

* On page load, show the monitor/OS screen.
* Centre text: `Burak OS Loading...`
* Animate the dots sequentially like a loading screen.
* After around 2–3 seconds, reveal the main OS desktop.

### OS Desktop

* Desktop icons should appear near the top-left, responsive as screen size changes:

  * `Resume.exe`
  * `Blog.exe`
  * `GitHub`
  * `Bin`
* A rounded taskbar should sit bottom-centre with a small gap between it and the bottom of the monitor.
* Taskbar order:

  * Resume app
  * Blog app
  * GitHub app
  * separator `|`
  * Downloads folder
  * Bin
* GitHub icon should use the standard GitHub logo.
* Other icons can be custom-designed but should match the OS style.

### Icon Interaction

* Taskbar icons open with one click.
* Desktop icons open with double click.
* Main apps open inside the monitor/OS, not through normal page navigation.
* External links such as LinkedIn and GitHub repo links open in a new real browser tab.

### Main App Window Behaviour

Applies to:

* `Resume.exe`
* `Blog.exe`
* `GitHub`

Behaviour:

* Open as fullscreen apps inside the OS/monitor.
* Keep the taskbar visible, but shrink it by around 50% while a main app is open.
* Highlight the active app in the taskbar.
* Opening another main app closes the current main app and opens the selected one.
* Closing the active app returns the user to the OS desktop.
* If no main app is open, taskbar returns to original size.

### App Top Bar

Each app/folder should have a top bar with:

* Close button in the top-left.
* Disabled/greyed-out minimise button.
* `?` help button.
* App/folder title centred in the top bar.
* A divider/bar below the title area.

Close button:

* Highlights red on hover.
* On touch/mobile devices, show red by default because hover is not available.

Help button:

* Opens a small centred dialog.
* Dialog slightly fades/dims the rest of the monitor.
* Dialog closes by clicking outside it or pressing its small `x` button.

### Resume.exe

* Preserve current resume/timeline content from `src/content/timeline.json`.
* Redesign the resume timeline to feel more polished, interactive, clean, and OS-themed.
* Keep the timeline concept but improve the look, feel, and usability.
* Include a LinkedIn link somewhere appropriate.
* LinkedIn should open in a new real browser tab.
* Help dialog should explain that Resume.exe is an interactive timeline of Burak’s professional history, experience, and achievements.

### Blog.exe

* Keep the current blog content structure and general layout:

  * grouped by year
  * months nested under years
  * latest posts first
* Present Blog.exe as an internal browser-style app.
* First tab is the main blog archive/list.
* Clicking a blog post opens it in a new internal browser tab.
* The original blog list tab remains open on the left.
* New blog post tab has an `x` close button on the right side of the tab.
* Inside the post content area, keep:

  * `BACK TO BLOG`
  * `SHARE`
* `BACK TO BLOG` closes the current post tab and returns to the main blog list tab.
* `SHARE` should continue to work as before.
* Help dialog should explain that Blog.exe contains Burak’s blog posts and opens posts as tabs inside the app.

### GitHub App

* Do not use an iframe for `github.com`.
* Fetch public repositories without GitHub login or token.
* Use:
  `https://api.github.com/users/beyuksel96/repos?sort=updated&per_page=6`
* Do not expose API keys or tokens in frontend code.
* Include loading and error states.
* Show each repo with:

  * repo name
  * description
  * primary language
  * stars
  * last updated date
  * button/link to open the repo on GitHub in a new real browser tab
* Help dialog should explain that the app displays Burak’s latest public GitHub repositories.

### Bin

* Opens as a folder window, not fullscreen.
* Loads centre/centre inside the OS/monitor.
* Should be approximately half the available height between the top of the OS screen and the taskbar.
* Can be moveable if reasonable to implement; otherwise static is acceptable.
* Taskbar does not shrink when Bin is opened.
* Empty for now, but structure should allow future easter eggs to be added.
* Include the same top-bar controls and help dialog.
* Help dialog should explain that Bin is currently empty but may contain easter eggs later.

### Downloads

* Opens as a folder window, same behaviour as Bin.
* Taskbar does not shrink when Downloads is opened.
* Contains downloadable resume/CV file, e.g. `resume.pdf`.
* Clicking the file downloads it to the user’s device.
* Include helper text such as: `Click on file to download`.
* Help dialog should explain that Downloads contains files the user can download, currently the resume/CV.

### Implementation Guardrails

* Preserve existing content where possible.
* Prefer reusable components for:

  * OS shell
  * monitor frame
  * loading screen
  * desktop icons
  * taskbar
  * app windows
  * folder windows
  * help dialogs
  * resume timeline
  * blog browser/tabs
  * GitHub repo cards
* Avoid large duplicated page-local scripts where practical.
* Be careful with current dirty file: `public/Resume-BURAK-YUKSEL.pdf`.
* Run `npm run build` before marking a phase complete.
* No lint script currently exists unless one is added during the revamp.
* Update this `BRAIN.md` after each meaningful milestone, blocker, verification result, or handoff note.

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

These phases come from `Revamp Master Plan / Source of Truth`. Execute in order. Do not attempt the full revamp in one pass.

### Phase 1: Archive and foundation

* Archive/backup the current site implementation so the previous design can be restored later.
* Inspect current repo structure and identify files that will be reused.
* Create the initial one-page OS shell skeleton.
* Decide component/file structure for the revamp.
* Update `BRAIN.md` with archive location, structure decisions, and verification notes.
* Run `npm run build`.

### Phase 2: OS desktop and responsive shell

* Build loading screen with `Burak OS Loading...` animated dots.
* Build monitor/OS desktop layout.
* Add desktop icons.
* Add bottom-centre rounded taskbar.
* Add light/dark theme handling, defaulting to dark if no preference.
* Make shell responsive across desktop, tablet, mobile, and small screens.
* Update `BRAIN.md`.
* Run `npm run build`.

### Phase 3: Window/app system

* Implement fullscreen app window behaviour for Resume, Blog, and GitHub.
* Implement folder window behaviour for Downloads and Bin.
* Add top-bar controls: close, disabled minimise, and help.
* Add help dialog pattern with backdrop close and x close.
* Add active taskbar highlighting.
* Add taskbar shrink behaviour only for main apps.
* Ensure opening one main app closes another.
* Update `BRAIN.md`.
* Run `npm run build`.

### Phase 4: Resume.exe

* Move existing resume timeline content into the new OS app experience.
* Redesign timeline UI/UX.
* Preserve existing timeline data and meaning.
* Add LinkedIn link opening in a new browser tab.
* Add Resume.exe help dialog copy.
* Update `BRAIN.md`.
* Run `npm run build`.

### Phase 5: Blog.exe

* Move existing blog archive/list into browser-style app.
* Preserve year/month/latest-first grouping.
* Implement internal blog tabs.
* Opening a post creates a new internal tab.
* Add close tab behaviour.
* Keep `BACK TO BLOG` and `SHARE` behaviours.
* Add Blog.exe help dialog copy.
* Update `BRAIN.md`.
* Run `npm run build`.

### Phase 6: GitHub app

* Fetch public repos from GitHub API without auth/token.
* Add loading and error states.
* Display repo cards with name, description, language, stars, updated date, and external GitHub link.
* Add GitHub app help dialog copy.
* Update `BRAIN.md`.
* Run `npm run build`.

### Phase 7: Downloads and Bin

* Implement Bin folder window, empty for now but ready for future easter eggs.
* Implement Downloads folder window.
* Add downloadable resume/CV file.
* Add helper text telling users to click the file to download.
* Add folder help dialogs.
* Confirm taskbar does not shrink for folders.
* Update `BRAIN.md`.
* Run `npm run build`.

### Phase 8: Polish, accessibility, and final verification

* Improve responsive behaviour and mobile/touch UX.
* Check keyboard/focus/accessibility basics.
* Check reduced-motion handling where practical.
* Remove dead code from old page flows where safe.
* Verify external links open correctly.
* Verify downloadable CV works.
* Verify static build output.
* Update README if needed.
* Update `BRAIN.md` with final handoff notes.
* Run final `npm run build`.

NOTE: Codex must not attempt the full revamp in one pass. It should work in phases, update this file after each phase, and run build/lint checks before marking a phase complete. If no lint script exists, record that clearly rather than inventing one.
