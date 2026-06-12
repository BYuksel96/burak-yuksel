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
* Desktop icons open with one click.
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

## Phase Handoffs

### Phase 1: Archive and foundation

- Status: implemented on 2026-06-11 on branch `feature/portfolio_revamp`.
- Archive location: `archive/2026-06-11-pre-os-revamp/`.
- Archive contents: tracked source/config/content/docs/workflow/public image assets, plus `ARCHIVE-NOTE.md`.
- Archive exclusions: `node_modules/`, `dist/`, `.astro/`, `.git/`, and protected `public/Resume-BURAK-YUKSEL.pdf`.
- Files changed for foundation:
  - `src/pages/index.astro`
  - `src/components/os/OsShell.astro`
  - `src/components/os/MonitorFrame.astro`
  - `src/styles/os.css`
  - `BRAIN.md`
  - `archive/2026-06-11-pre-os-revamp/`
- Structure decision: new OS-specific Astro components live under `src/components/os/`; OS styling is isolated in `src/styles/os.css`; homepage route mounts only the OS shell.
- Current homepage behavior: static monitor/OS foundation only. No loading sequence, desktop icons, taskbar, app windows, folder windows, GitHub fetching, Downloads, Bin, Resume.exe, or Blog.exe behavior yet.
- Preserved routes/content: `src/pages/resume.astro`, `src/pages/blog/*`, `src/content/timeline.json`, and `src/content/blog/*` were left functionally untouched.
- Verification: `npm run build` passed after Phase 1 and generated 5 pages.
- Lint note: `package.json` has no lint script; no lint command was run or invented.

### Phase 2: OS desktop and responsive shell

- Status: implemented on 2026-06-11 on branch `feature/portfolio_revamp`.
- Files changed:
  - `src/components/os/OsShell.astro`
  - `src/components/os/LoadingScreen.astro`
  - `src/components/os/DesktopIcon.astro`
  - `src/components/os/Taskbar.astro`
  - `src/styles/os.css`
  - `BRAIN.md`
- Structure decision: Phase 2 visual shell pieces are split into reusable Astro components so Phase 3 can attach app/window behavior to stable `data-os-target` IDs.
- Current homepage behavior: CSS-timed `Burak OS Loading...` screen, responsive monitor desktop, top-left visual desktop icons, bottom-centre visual taskbar, and system light/dark theme support.
- Theme decision: dark remains the default CSS path and keeps the `#5f6368` base; light mode is supplied with `prefers-color-scheme: light`.
- Placeholder decision: desktop icons and taskbar items are visual only. Taskbar items are disabled buttons; no app opening, window management, folders, help dialogs, GitHub fetching, resume/blog migration, or download behavior exists yet.
- Preserved routes/content: `src/pages/resume.astro`, `src/pages/blog/*`, `src/content/*`, and `public/Resume-BURAK-YUKSEL.pdf` were not modified in Phase 2.
- Verification: `npm run build` passed after Phase 2 and generated 5 pages.
- Lint note: `package.json` has no lint script; no lint command was run or invented.
- Remaining work: Phase 3 should add the window/app system, active taskbar state, folder windows, and help dialogs using the placeholder component structure.
- Correction on 2026-06-11: removed the physical monitor stand/base and power-light treatment. `MonitorFrame.astro` now renders only the OS viewport wrapper, while `os.css` sizes the shell as an approximately 90vw x 90vh screen surface on desktop/laptop and uses symmetric mobile-safe padding to avoid horizontal overflow.
- Correction files changed: `src/components/os/MonitorFrame.astro`, `src/styles/os.css`, and `BRAIN.md`.
- Correction preserved behavior: loading screen, desktop icons, taskbar, and light/dark theme remain; no Phase 3+ behavior was added.
- Correction verification: `npm run build` passed and generated 5 pages. `package.json` still has no lint script.
- Loading/viewport correction on 2026-06-11: `OsShell.astro` now starts the OS screen in `data-boot-state="booting"` and uses a minimal component-local script to reveal the desktop after 2500ms. `os.css` keeps the loading layer as the first visible state, improves sequential dot animation, and removes fixed monitor/aspect-ratio sizing by making the OS viewport fill the padded browser area: 24px page padding on desktop/laptop and 12px on tablet/mobile.
- Loading/viewport correction files changed: `src/components/os/OsShell.astro`, `src/styles/os.css`, and `BRAIN.md`.
- Loading/viewport correction preserved behavior: desktop icons and taskbar remain inert visual placeholders; no app windows, click/open behavior, folders, help dialogs, GitHub fetching, Resume.exe, Blog.exe, Downloads, or Bin functionality was added.
- Loading/viewport correction verification: `npm run build` passed and generated 5 pages. `package.json` still has no lint script.

### Phase 3: Window/app system

- Status: implemented on 2026-06-11 on branch `feature/portfolio_revamp`.
- Files changed:
  - `src/components/os/OsShell.astro`
  - `src/components/os/DesktopIcon.astro`
  - `src/components/os/Taskbar.astro`
  - `src/components/os/OsWindow.astro`
  - `src/components/os/HelpDialog.astro`
  - `src/scripts/os-window-manager.js`
  - `src/scripts/os-window-manager.test.mjs`
  - `src/styles/os.css`
  - `BRAIN.md`
- State decision: `resume`, `blog`, and `github` are exclusive fullscreen main apps controlled by one `activeMainApp`; `downloads` and `bin` are independent centred folder windows controlled by `openFolders` and can coexist with the desktop or a main app.
- Current homepage behavior: taskbar icons and desktop icons open with one click; main apps show fullscreen placeholder shells; Downloads and Bin show centred placeholder/empty folder shells; taskbar highlights open/active targets and shrinks only while a main app is open; all windows have close, disabled minimise, help, centred title, and divider controls.
- Mobile decision: folder windows stay centred and modal-like on small screens; no draggable or complex multi-window behaviour was added.
- Help decision: one shared monitor-local help dialog is reused for all windows and closes through the backdrop, its `x` button, or Escape.
- Phase boundary: Resume timeline/content migration, Blog archive/tabs/content, GitHub API fetching, downloadable CV behaviour, and real Downloads/Bin contents were deliberately not added.
- Preserved routes/content: `src/pages/resume.astro`, `src/pages/blog/*`, `src/content/*`, and `public/Resume-BURAK-YUKSEL.pdf` were not modified in Phase 3.
- Verification: focused state reducer test `node --test src/scripts/os-window-manager.test.mjs` passed with 3 tests; `npm run build` passed and generated 5 pages. `package.json` still has no lint script.
- Visual/UX correction on 2026-06-11: removed the desktop double-click requirement, replaced the OS top-right coloured dots with a menu/status bar (`Burak OS`, browser-local date/time, inert language/shutdown buttons), polished app/folder window chrome, kept folder windows centred/modal-like with no dragging, and redesigned the taskbar as a rounded dock with larger icon tiles, hover/focus labels, active/open state, and a clean vertical divider.
- Visual/UX correction files changed: `src/components/os/OsShell.astro`, `src/components/os/DesktopIcon.astro`, `src/components/os/Taskbar.astro`, `src/components/os/OsWindow.astro`, `src/scripts/os-window-manager.js`, `src/scripts/os-window-manager.test.mjs`, `src/styles/os.css`, and `BRAIN.md`.
- Visual/UX correction preserved boundary: no Resume timeline/content migration, Blog tabs/content, GitHub API fetching, downloadable CV behaviour, real Downloads content, real Bin content, folder dragging, cookies, localStorage, location permission, tracking, or backend behaviour was added.
- Visual/UX correction verification: focused state/status test `node --test src/scripts/os-window-manager.test.mjs` passed with 5 tests; `npm run build` passed and generated 5 pages. `package.json` still has no lint script.
- Second visual/UX correction on 2026-06-11: taskbar now toggles the same open main app or folder closed, main-app taskbar compacting is mild instead of 50%, main app windows leave balanced space between the OS top bar and taskbar, open/active taskbar dots sit at the top-left of icon tiles, desktop hover labels sit below icon tiles without the outer hover-square effect, language button uses inverted colours, and help dialog/window controls were restyled with an origin-style help animation.
- Second visual/UX correction files changed: `src/components/os/HelpDialog.astro`, `src/scripts/os-window-manager.js`, `src/scripts/os-window-manager.test.mjs`, `src/styles/os.css`, and `BRAIN.md`.
- Second visual/UX correction preserved boundary: folder dragging remains deferred; no Resume timeline/content migration, Blog tabs/content, GitHub API fetching, downloadable CV behaviour, real Downloads content, real Bin content, cookies, localStorage, location permission, tracking, or backend behaviour was added.
- Second visual/UX correction verification: focused state/status test `node --test src/scripts/os-window-manager.test.mjs` passed with 6 tests; `npm run build` passed and generated 5 pages. `package.json` still has no lint script.
- Third visual/UX correction on 2026-06-12: mobile taskbar now uses content width with capped side margins instead of stretching near full-width, taskbar icon tiles are vertically centred within the dock, open/active blue dots sit inside the bottom-centre of each rounded icon tile, and shared close/minimise/help controls were reduced and restyled with darker glossy red, muted amber, and darker glossy green treatments.
- Third visual/UX correction files changed: `src/styles/os.css` and `BRAIN.md`.
- Third visual/UX correction decision: CSS-only polish; no Phase 3 state model or architecture changes were needed, and folder dragging remains deferred.
- Third visual/UX correction preserved boundary: no Resume timeline/content migration, Blog tabs/content, GitHub API fetching, downloadable CV behaviour, real Downloads content, real Bin content, cookies, localStorage, location permission, tracking, backend behaviour, or folder dragging was added.
- Third visual/UX correction verification: focused state/status test `node --test src/scripts/os-window-manager.test.mjs` passed with 6 tests; `npm run build` passed and generated 5 pages. `package.json` still has no lint script, and protected resume/blog/content/PDF paths had no diff.
- Fourth visual/UX correction on 2026-06-12: removed the taskbar open-state blue dot entirely, reserved a label row inside each taskbar item, and made hover/focus/open taskbar icon tiles lift and scale modestly within the dock area. Open taskbar items now keep their label visible on desktop and touch/mobile, while desktop hover/focus still reveals labels for closed items.
- Fourth visual/UX correction files changed: `src/styles/os.css` and `BRAIN.md`.
- Fourth visual/UX correction decision: CSS-only polish using the existing `data-os-open` and `data-os-active` state attributes; no Phase 3 reducer or launcher behavior changes were needed.
- Fourth visual/UX correction preserved boundary: no Resume timeline/content migration, Blog tabs/content, GitHub API fetching, downloadable CV behaviour, real Downloads content, real Bin content, backend behaviour, folder dragging, or Phase 4+ behavior was added.
- Fourth visual/UX correction verification: focused state/status test `node --test src/scripts/os-window-manager.test.mjs` passed with 6 tests; `npm run build` passed and generated 5 pages. `package.json` still has no lint script.
- Fifth visual/UX correction on 2026-06-12: corrected the taskbar hover/open label implementation after the previous dock polish made the taskbar too tall and left native browser tooltips active. Removed taskbar button `title` attributes, kept `aria-label`s, made labels custom UI only, and changed taskbar items to compact absolute icon/label positioning so idle icons sit centred while hover/focus/open states lift and slightly enlarge the icon tile.
- Fifth visual/UX correction files changed: `src/components/os/Taskbar.astro`, `src/styles/os.css`, `src/scripts/os-window-manager.test.mjs`, and `BRAIN.md`.
- Fifth visual/UX correction decision: active/open state is now represented by the lifted icon tile plus visible label instead of a dot; mobile/touch relies on the open state label/lift, while desktop hover/focus reveals the same label/lift for closed items.
- Fifth visual/UX correction preserved boundary: no Resume timeline/content migration, Blog tabs/content, GitHub API fetching, downloadable CV behaviour, real Downloads content, real Bin content, backend behaviour, folder dragging, or Phase 4+ behavior was added.
- Fifth visual/UX correction verification: focused state/markup test `node --test src/scripts/os-window-manager.test.mjs` passed with 7 tests after a failing red check caught the old `title` attribute; `npm run build` passed and generated 5 pages. `package.json` still has no lint script, and protected resume/blog/content/PDF paths had no diff.
- Sixth visual/UX correction on 2026-06-12: tightened the taskbar dock hover/open implementation so desktop hover/focus/open icon tiles stay centred at idle, then lift with `translateY(-10px)` and scale to `1.12`; labels remain custom taskbar UI under each tile, and open/active items use the same lifted label-visible treatment.
- Sixth visual/UX correction files changed: `src/components/os/Taskbar.astro`, `src/styles/os.css`, `src/scripts/os-window-manager.test.mjs`, and `BRAIN.md`.
- Sixth visual/UX correction decision: taskbar wrappers now keep visible overflow so lifted icons and labels are not clipped; mobile/touch still depends on open state rather than hover, with smaller responsive lift values to prevent horizontal overflow.
- Sixth visual/UX correction preserved boundary: no Resume timeline/content migration, Blog tabs/content, GitHub API fetching, downloadable CV behaviour, real Downloads content, real Bin content, backend behaviour, folder dragging, or Phase 4+ behavior was added.
- Sixth visual/UX correction verification: focused taskbar/state test `node --test src/scripts/os-window-manager.test.mjs` passed with 7 tests after a failing red check caught the old smaller lift value; `npm run build` passed and generated 5 pages. `package.json` still has no lint script, and protected resume/blog/content/PDF paths had no diff. Playwright was not available locally without installing dependencies, so rendered QA was not run.
- Seventh visual/UX correction on 2026-06-12: fixed the desktop/laptop taskbar hover trigger by changing the hover lift/label media query from primary fine-pointer detection to `any-hover: hover`. This keeps hover-capable laptops/desktops lifting tiles and revealing labels even if the device also has a touch input.
- Seventh visual/UX correction files changed: `src/styles/os.css`, `src/scripts/os-window-manager.test.mjs`, and `BRAIN.md`.
- Seventh visual/UX correction decision: open/focus state remains global, touch-only mobile still relies on open state, and hover behavior is enabled only for devices with any hover-capable input.
- Seventh visual/UX correction preserved boundary: no Resume timeline/content migration, Blog tabs/content, GitHub API fetching, downloadable CV behaviour, real Downloads content, real Bin content, backend behaviour, folder dragging, or Phase 4+ behavior was added.
- Seventh visual/UX correction verification: focused taskbar/state test `node --test src/scripts/os-window-manager.test.mjs` passed with 7 tests after a failing red check caught the old `(hover: hover) and (pointer: fine)` media query; `npm run build` passed and generated 5 pages. `package.json` still has no lint script. Playwright was not available locally without installing dependencies, so rendered QA was not run.
- Eighth visual/UX correction on 2026-06-12: removed media-query gating from the taskbar hover lift/label rules and made `.taskbar-item:hover` and `.taskbar-item:focus-visible` explicit top-level selectors. Hover now directly applies the same lifted icon transform and visible label style as open state.
- Eighth visual/UX correction files changed: `src/styles/os.css`, `src/scripts/os-window-manager.test.mjs`, and `BRAIN.md`.
- Eighth visual/UX correction decision: the actual hover mechanism no longer depends on hover/pointer media feature reporting; touch-only mobile still works through open state after tapping a taskbar item.
- Eighth visual/UX correction preserved boundary: no Resume timeline/content migration, Blog tabs/content, GitHub API fetching, downloadable CV behaviour, real Downloads content, real Bin content, backend behaviour, folder dragging, or Phase 4+ behavior was added.
- Eighth visual/UX correction verification: focused taskbar/state test `node --test src/scripts/os-window-manager.test.mjs` passed with 7 tests after a failing red check caught hover lift still being media-gated; `npm run build` passed and generated 5 pages. `package.json` still has no lint script, and protected resume/blog/content/PDF paths had no diff. Playwright was not available locally without installing dependencies, so rendered QA was not run.

## Running Log
- 2026-06-12: Phase 3 taskbar hover mechanism correction completed. Made `.taskbar-item:hover` directly lift the icon tile with the same dock transform as open state and directly reveal the custom label underneath; removed media-query dependency from the hover mechanism. No Phase 4+ content or behavior added. `node --test src/scripts/os-window-manager.test.mjs` passed with 7 tests. `npm run build` passed. No lint script exists. Protected resume/blog/content/PDF paths had no diff. Playwright was unavailable locally without installing dependencies.
- 2026-06-12: Phase 3 taskbar hover trigger correction completed. Root cause was the hover lift/label CSS being gated by primary fine-pointer media detection, so some touch-capable laptops/desktops could show open-state lift but not hover lift. Changed the hover block to `@media (any-hover: hover)`, keeping touch-only mobile open-state based. No Phase 4+ content or behavior added. `node --test src/scripts/os-window-manager.test.mjs` passed with 7 tests. `npm run build` passed. No lint script exists. Playwright was unavailable locally without installing dependencies.
- 2026-06-12: Phase 3 taskbar/dock hover correction completed again. Desktop hover/focus/open taskbar tiles now use a centred idle state and lift with `translateY(-10px) scale(1.12)`, open/active labels remain visible custom UI below the tile, taskbar wrappers use visible overflow, and mobile/touch open state keeps the label/lift without hover dependency. No Phase 4+ content or behavior added. `node --test src/scripts/os-window-manager.test.mjs` passed with 7 tests. `npm run build` passed. No lint script exists. Protected resume/blog/content/PDF paths had no diff. Playwright was unavailable locally without installing dependencies.
- 2026-06-12: Phase 3 taskbar/dock hover correction completed. Removed native taskbar tooltips, kept custom labels inside taskbar items, restored centred idle icon positioning, made hover/focus/open lift and scale only the icon tile, and kept open labels visible on desktop/tablet/mobile. No Phase 4+ content or behavior added. `node --test src/scripts/os-window-manager.test.mjs` passed with 7 tests. `npm run build` passed. No lint script exists.
- 2026-06-12: Phase 3 taskbar/dock polish correction completed. Removed the blue open dot, added contained lift/scale states for hover/focus/open taskbar icon tiles, kept open labels visible across desktop/tablet/mobile, and adjusted taskbar/window spacing to avoid clipping. No Phase 4+ content or behavior added. `node --test src/scripts/os-window-manager.test.mjs` passed with 6 tests. `npm run build` passed. No lint script exists.
- 2026-06-12: Phase 3 mobile taskbar/control polish completed. Tightened narrow-mobile taskbar width, vertically centred taskbar icon tiles, moved the open dot inside the bottom-centre of each icon tile, and refined smaller glossy window/help controls. No Phase 4+ content or behavior added. `node --test src/scripts/os-window-manager.test.mjs` passed with 6 tests. `npm run build` passed. No lint script exists.
- 2026-06-11: Second Phase 3 visual/UX correction completed. Added taskbar toggle-close behavior, moved taskbar open dots to icon tile top-left, reduced main-app taskbar shrink to mild scaling, adjusted main app window spacing above the taskbar, removed the desktop outer hover-square effect, restyled controls/help dialog, added help-origin animation hooks, and inverted the `EN` button. No Phase 4+ content or behavior added. `node --test src/scripts/os-window-manager.test.mjs` passed with 6 tests. `npm run build` passed. No lint script exists.
- 2026-06-11: Phase 3 visual/UX correction completed. Desktop icons now open with one click; OS top bar now shows `Burak OS`, browser-local date/time, inert language/shutdown controls; app/folder windows and taskbar/dock were polished for desktop/tablet/mobile; dragging remains deferred. No Phase 4+ content or behavior added. `node --test src/scripts/os-window-manager.test.mjs` passed with 5 tests. `npm run build` passed. No lint script exists.
- 2026-06-11: Phase 3 window/app system completed. Added reusable OS window/help components, taskbar and desktop launcher wiring, fullscreen placeholder app shells, independent centred placeholder folder windows, active/open taskbar state, main-app-only taskbar shrink, and shared help dialog behavior. No Phase 4+ behavior or real app/folder content added. `node --test src/scripts/os-window-manager.test.mjs` passed. `npm run build` passed. No lint script exists.
- 2026-06-11: Phase 2 loading/viewport correction completed. Loading screen is now the first visible state for about 2.5 seconds with clearer sequential dots; OS shell fills the browser area more aggressively using viewport height and symmetric 24px/12px page padding; taskbar remains inside the OS viewport. `npm run build` passed. No lint script exists. No Phase 3+ behavior added.
- 2026-06-11: Phase 2 correction completed. Removed physical monitor stand/base, converted shell to a thin OS viewport filling roughly 90% of the browser area on desktop/laptop, tightened mobile sizing/padding to prevent horizontal overflow, and kept all icons/taskbar items as inert placeholders. `npm run build` passed. No lint script exists.
- 2026-06-11: Phase 2 OS desktop/responsive shell completed. Added loading screen, desktop icon placeholders, visual taskbar, responsive monitor layout, and light/dark theme CSS. No Phase 3+ behavior added. `npm run build` passed. No lint script exists. Resume/blog/content files and protected resume PDF remained untouched.
- 2026-06-11: Phase 1 archive/foundation completed. Current implementation archived at `archive/2026-06-11-pre-os-revamp/`; homepage now renders the static `Burak OS` monitor shell; later app behavior remains queued for Phases 2-8. `npm run build` passed. No lint script exists.
- 2026-06-11: Created operational brain for website revamp. Repo inspected as Astro static personal site on `feature/mobile_optimisation`; `npm run build` previously verified successfully with 5 generated pages. Existing dirty tracked file: `public/Resume-BURAK-YUKSEL.pdf`.

## Next Work Queue

These phases come from `Revamp Master Plan / Source of Truth` - Review this section again for the phases if more context is needed. Execute in order. Do not attempt the full revamp in one pass.

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
