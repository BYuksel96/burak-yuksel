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

- Convert the website into a one-page responsive “Burak OS” portfolio web app.
- Preserve the existing core content and destinations:
  - Resume timeline
  - Blog archive and posts
  - GitHub profile/repositories
  - LinkedIn link
  - Downloadable CV

- Keep the site static: no backend, database, auth, or runtime server.
- Everything should open inside the created OS/monitor interface except external links, which open in the real browser.

### Visual Concept

- The website should load directly into a monitor/OS-style interface.
- Style direction: clean, smart, minimal Linux-inspired OS.
- Must be responsive across desktop, laptop, tablet, mobile, and smaller screens.
- Support light/dark mode using user system preference.
- If no user preference is detected, default to dark mode.
- Dark theme base/background should retain the current grey tone: `#5f6368`.

### Initial Load

- On page load, show the monitor/OS screen.
- Centre text: `Burak OS Loading...`
- Animate the dots sequentially like a loading screen.
- After around 2–3 seconds, reveal the main OS desktop.

### OS Desktop

- Desktop icons should appear near the top-left, responsive as screen size changes:
  - `Resume.exe`
  - `Blog.exe`
  - `GitHub`
  - `Bin`

- A rounded taskbar should sit bottom-centre with a small gap between it and the bottom of the monitor.
- Taskbar order:
  - Resume app
  - Blog app
  - GitHub app
  - separator `|`
  - Downloads folder
  - Bin

- GitHub icon should use the standard GitHub logo.
- Other icons can be custom-designed but should match the OS style.

### Icon Interaction

- Taskbar icons open with one click.
- Desktop icons open with one click.
- Main apps open inside the monitor/OS, not through normal page navigation.
- External links such as LinkedIn and GitHub repo links open in a new real browser tab.

### Main App Window Behaviour

Applies to:

- `Resume.exe`
- `Blog.exe`
- `GitHub`

Behaviour:

- Open as fullscreen apps inside the OS/monitor.
- Keep the taskbar visible, but shrink it by around 50% while a main app is open.
- Highlight the active app in the taskbar.
- Opening another main app closes the current main app and opens the selected one.
- Closing the active app returns the user to the OS desktop.
- If no main app is open, taskbar returns to original size.

### App Top Bar

Each app/folder should have a top bar with:

- Close button in the top-left.
- Disabled/greyed-out minimise button.
- `?` help button.
- App/folder title centred in the top bar.
- A divider/bar below the title area.

Close button:

- Highlights red on hover.
- On touch/mobile devices, show red by default because hover is not available.

Help button:

- Opens a small centred dialog.
- Dialog slightly fades/dims the rest of the monitor.
- Dialog closes by clicking outside it or pressing its small `x` button.

### Resume.exe

- Preserve current resume/timeline content from `src/content/timeline.json`.
- Redesign the resume timeline to feel more polished, interactive, clean, and OS-themed.
- Keep the timeline concept but improve the look, feel, and usability.
- Include a LinkedIn link somewhere appropriate.
- LinkedIn should open in a new real browser tab.
- Help dialog should explain that Resume.exe is an interactive timeline of Burak’s professional history, experience, and achievements.

### Blog.exe

- Keep the current blog content structure and general layout:
  - grouped by year
  - months nested under years
  - latest posts first

- Present Blog.exe as an internal browser-style app.
- First tab is the main blog archive/list.
- Clicking a blog post opens it in a new internal browser tab.
- The original blog list tab remains open on the left.
- New blog post tab has an `x` close button on the right side of the tab.
- Inside the post content area, keep:
  - `BACK TO BLOG`
  - `SHARE`

- `BACK TO BLOG` closes the current post tab and returns to the main blog list tab.
- `SHARE` should continue to work as before.
- Help dialog should explain that Blog.exe contains Burak’s blog posts and opens posts as tabs inside the app.

### GitHub App

- Do not use an iframe for `github.com`.
- Fetch public repositories without GitHub login or token.
- Use:
  `https://api.github.com/users/beyuksel96/repos?sort=updated&per_page=6`
- Do not expose API keys or tokens in frontend code.
- Include loading and error states.
- Show each repo with:
  - repo name
  - description
  - primary language
  - stars
  - last updated date
  - button/link to open the repo on GitHub in a new real browser tab

- Help dialog should explain that the app displays Burak’s latest public GitHub repositories.

### Bin

- Opens as a folder window, not fullscreen.
- Loads centre/centre inside the OS/monitor.
- Should be approximately half the available height between the top of the OS screen and the taskbar.
- Can be moveable if reasonable to implement; otherwise static is acceptable.
- Taskbar does not shrink when Bin is opened.
- Empty for now, but structure should allow future easter eggs to be added.
- Include the same top-bar controls and help dialog.
- Help dialog should explain that Bin is currently empty but may contain easter eggs later.

### Downloads

- Opens as a folder window, same behaviour as Bin.
- Taskbar does not shrink when Downloads is opened.
- Contains downloadable resume/CV file, e.g. `resume.pdf`.
- Clicking the file downloads it to the user’s device.
- Include helper text such as: `Click on file to download`.
- Help dialog should explain that Downloads contains files the user can download, currently the resume/CV.

### Implementation Guardrails

- Preserve existing content where possible.
- Prefer reusable components for:
  - OS shell
  - monitor frame
  - loading screen
  - desktop icons
  - taskbar
  - app windows
  - folder windows
  - help dialogs
  - resume timeline
  - blog browser/tabs
  - GitHub repo cards

- Avoid large duplicated page-local scripts where practical.
- Be careful with current dirty file: `public/Resume-BURAK-YUKSEL.pdf`.
- Run `npm run build` before marking a phase complete.
- No lint script currently exists unless one is added during the revamp.
- Update this `BRAIN.md` after each meaningful milestone, blocker, verification result, or handoff note.

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
- Ninth visual/UX correction on 2026-06-12: fixed mobile/tablet sticky taskbar hover after closing apps/folders. Touch pointer input now marks the OS screen with `data-os-pointer="touch"`, which suppresses hover-only taskbar lift/label rules while leaving open state and keyboard focus behavior unchanged.
- Ninth visual/UX correction files changed: `src/scripts/os-window-manager.js`, `src/styles/os.css`, `src/scripts/os-window-manager.test.mjs`, and `BRAIN.md`.
- Ninth visual/UX correction decision: desktop/laptop hover remains active unless the current pointer mode is touch; mouse/pen pointer movement restores hover behavior on hybrid devices. Open taskbar items still show lifted icons and labels on mobile/tablet while open.
- Ninth visual/UX correction preserved boundary: no Resume timeline/content migration, Blog tabs/content, GitHub API fetching, downloadable CV behaviour, real Downloads content, real Bin content, backend behaviour, folder dragging, or Phase 4+ behavior was added.
- Ninth visual/UX correction verification: focused taskbar/state test `node --test src/scripts/os-window-manager.test.mjs` passed with 7 tests after a failing red check caught ungated touch hover; `npm run build` passed and generated 5 pages. `package.json` still has no lint script, and protected resume/blog/content/PDF paths had no diff. Playwright was not available locally without installing dependencies, so rendered QA was not run.

### Phase 4: Resume.exe

- Status: implemented on 2026-06-12 on branch `feature/portfolio_revamp`; two-pane layout correction completed on 2026-06-12.
- Files changed:
  - `src/components/os/OsShell.astro`
  - `src/components/os/ResumeApp.astro`
  - `src/scripts/os-window-manager.test.mjs`
  - `src/scripts/resume-app.js`
  - `src/scripts/resume-app.test.mjs`
  - `src/styles/os.css`
  - `src/styles/resume-app.css`
  - `BRAIN.md`
- Design decision: Resume.exe now uses the approved Career File Explorer concept as a cleaner two-pane app. Existing timeline events render as selectable career files in a timeline-aware archive list on the left and a selected file preview/inspector on the right. The redundant middle Timeline Stack pane was removed. Mobile collapses to a single career file list with the selected event preview expanded inline.
- Content decision: Resume.exe reuses only `src/content/timeline.json` and its existing image references. The timeline JSON was not modified, and existing mojibake/encoding artifacts were preserved.
- Interaction decision: the default selected event prefers `current: true` and falls back to the final timeline item. Click, keyboard arrow/Home/End navigation, active states, and contained inspector/mobile preview scrolling are handled by `src/scripts/resume-app.js`.
- Link/help decision: Resume.exe includes the existing LinkedIn URL and opens it in a new browser tab. Resume.exe help copy now describes it as an interactive timeline of Burak's professional history, experience, and achievements.
- Styling decision: new Resume.exe styling is namespaced under `.resume-app` and uses existing OS CSS tokens. The left file list preserves chronology with prominent dates and current state treatment in compact explorer rows; the later archive rail/marker treatment was removed after review to restore the cleaner Career Files style. The inspector is flattened so the panel itself is the main content surface, with internal padding and dividers instead of a large nested rounded content card. A scoped `.resume-app [hidden]` rule fixes hidden inspector/mobile preview panels after rendered QA showed class display rules overriding the browser hidden attribute.
- Mobile responsive decision: phone-sized open-app taskbar controls are larger and more readable in compact mode. Phone-sized landscape viewports now show an OS portrait-mode lock overlay instead of attempting to render the Resume.exe app in an unusably short viewport; tablet landscape is deliberately unaffected.
- Phase boundary: no Blog.exe content/tabs, GitHub API fetching, Downloads file download behaviour, real Downloads content, real Bin contents, folder dragging, backend behaviour, timeline JSON edits, blog route/content edits, or PDF changes were added.
- Verification: `node --test src/scripts/resume-app.test.mjs` passed with 5 tests after failing red checks caught the old third Timeline Stack pane and the unwanted Career Files rail/marker styling. `node --test src/scripts/os-window-manager.test.mjs` passed with 9 tests after failing red checks caught the tiny mobile compact taskbar and missing phone landscape lock. `npm run build` passed and generated 5 pages. `package.json` still has no lint script. Edge headless CDP rendered QA opened Resume.exe on desktop and mobile, selected timeline events, confirmed no `.resume-app__timeline` pane is rendered, confirmed LinkedIn `target="_blank"` and `rel="noreferrer"`, verified desktop two-column inspector behavior, verified mobile inline preview behavior, verified the compact Career Files row style, verified larger phone compact taskbar sizing, verified the phone landscape lock, verified tablet landscape remains unlocked, and screenshots were inspected for the flattened inspector surface.
- Handoff notes: Phase 5 should start Blog.exe only. Keep `/resume/` and existing blog routes available until Phase 8 cleanup decisions are explicitly made.

### Phase 5: Blog.exe

- Status: implemented on 2026-06-14 on branch `feature/portfolio_revamp`.
- Files changed:
  - `src/components/os/OsShell.astro`
  - `src/components/os/BlogApp.astro`
  - `src/scripts/blog-app.js`
  - `src/scripts/blog-app.test.mjs`
  - `src/scripts/os-window-manager.test.mjs`
  - `src/styles/blog-app.css`
  - `BRAIN.md`
- Architecture decision: Blog.exe renders the existing Astro blog collection at build time inside the OS window through `BlogApp.astro`. Markdown files under `src/content/blog` remain the only blog content source. Existing `/blog/` and `/blog/[slug]/` routes remain in place and unchanged.
- Routing/share decision: each post stores its canonical blog path using the Astro base path, avoiding double slashes. Blog.exe share actions convert that path to an absolute URL with the current browser origin before copying or opening LinkedIn, so the OS homepage URL is not shared accidentally.
- Tab interaction decision: Blog.exe uses a permanent archive tab as the first leftmost internal tab with no close control. Archive entries open build-rendered post panels in internal tabs; opening an already open post activates the existing tab. Post close controls are separate buttons from the tab buttons. Closing an inactive tab leaves the active tab alone; closing the active tab activates the right neighbor, then the left neighbor, then the archive. `BACK TO BLOG` closes the active post tab and activates the archive.
- Accessibility/responsive decision: the internal tablist uses `role="tablist"`, `role="tab"`, associated `tabpanel` elements, roving tab focus with Arrow/Home/End keys, descriptive close labels, and focus restoration after close/back actions. The tab strip scrolls horizontally on small screens instead of compressing tabs into unusable widths. Blog.exe article CSS is namespaced under `.blog-app` and covers the Markdown elements used by current posts, including headings, paragraphs, lists, links, blockquotes, images, inline code, and code blocks.
- State decision: `src/scripts/blog-app.js` initializes idempotently and keeps open tabs/active tab in DOM-backed browser state while the OS window is closed and reopened during the same page session. No localStorage, sessionStorage, iframe, runtime generated-page fetching, scraping, new dependency, or duplicate Markdown data source was added.
- Phase boundary: no GitHub API fetching, Downloads/CV download behavior, real Bin content, language switching, shutdown behavior, folder dragging, Phase 8 route cleanup, or unrelated OS refactoring was added. `public/Resume-BURAK-YUKSEL.pdf` was not modified.
- Verification: `node --test src/scripts/blog-app.test.mjs` passed with 10 tests, `node --test src/scripts/os-window-manager.test.mjs` passed with 10 tests, `node --test src/scripts/resume-app.test.mjs` passed with 5 tests, and `npm run build` passed with 5 pages generated. `package.json` still has no lint script. Edge headless CDP rendered QA covered desktop, tablet, and mobile Blog.exe archive grouping/order, post opening, duplicate-tab activation, archive tab permanence, active/inactive close behavior, `BACK TO BLOG`, keyboard tab navigation/focus, long tab-title truncation, horizontal tab overflow, article scrolling and Markdown formatting, Copy Link and LinkedIn canonical URLs, reopening Blog.exe after closing its OS window, existing `/blog/`, an existing individual blog route, and absence of mobile viewport overflow.
- Correction on 2026-06-14: Blog.exe now uses its own `.blog-app__chrome` as the app window topbar, with the shared OS close/minimise/help controls moved into that chrome and the duplicate generic Blog window topbar suppressed. Shared OS close controls use visible `X` glyphs, minimise remains disabled and greyed, and help keeps the `?` glyph. Blog.exe post count indicators were removed.
- Correction layout/interaction decision: post actions now read `Back to Posts` and `Share`, live in the article header, and are repeated as small icon-only actions at the bottom of the scrollable article body. The article card stays framed with a visible rounded bottom edge while only `.blog-app__article-body` scrolls. Post tags are labelled `Tags:` and are clickable; selecting a tag replaces the current post tab content with same-tab tag results and a `Back to Post` control, without opening another tab or duplicating Markdown content.
- Correction verification: `node --test src/scripts/blog-app.test.mjs` passed with 17 tests, `node --test src/scripts/os-window-manager.test.mjs` passed with 12 tests, `node --test src/scripts/resume-app.test.mjs` passed with 5 tests, and `npm run build` passed with 5 pages generated. Edge headless CDP rendered QA on desktop, tablet, and mobile verified no duplicate Blog topbar, OS control glyphs, no post count indicators, `Back to Posts`, clickable tags and same-tab tag results, canonical Copy Link and LinkedIn URLs, bottom icon actions at the end of the article, internal article-body scrolling, Blog help/close/reopen behavior, and no mobile horizontal overflow. No new dependency, Playwright, Phase 6+ behavior, legacy route cleanup, or PDF change was added.
- Second correction on 2026-06-14: widened the desktop/laptop Blog.exe article card to `min(72rem, 100%)`, removed the small-screen Blog.exe body padding gap introduced by main-window mobile padding, made touch devices show Back/Share controls in their active colours without relying on hover, made bottom share menus inline on touch and scrolled into view when opened, lowered the mobile compact taskbar slightly, moved taskbar labels down, and capped/shrank short-phone article headers so the scrollable Markdown body remains reachable.
- Second correction verification: `node --test src/scripts/blog-app.test.mjs` passed with 20 tests, `node --test src/scripts/os-window-manager.test.mjs` passed with 13 tests, `node --test src/scripts/resume-app.test.mjs` passed with 5 tests, and `npm run build` passed with 5 pages generated. `package.json` still has no lint script. Edge headless CDP rendered QA verified desktop article width, tablet layout, phone post-body gap removal, touch button colours, visible bottom share menu items, active/inactive close behavior, duplicate-tab activation, archive permanence, `Back to Posts`, keyboard tab navigation/focus, canonical Copy Link/LinkedIn URLs, reopen state, existing `/blog/` and `/blog/vibe-coding-to-the-max/` routes, Markdown scrolling/formatting, horizontal tab overflow on small phone, taskbar spacing, and no mobile viewport overflow. No new dependency, Playwright, Phase 6+ behavior, legacy route cleanup, or `public/Resume-BURAK-YUKSEL.pdf` change was added.
- Third correction on 2026-06-14: desktop/laptop Blog.exe article cards now use `min(100%, calc(50% + 36rem))`, which halves the remaining side gutter compared with the previous 72rem cap while staying bounded by the post panel. On mobile, `.blog-app__panel--post` explicitly resets the legacy global `article` padding/background/radius/shadow so the active post surface fills squarely into the OS window body corners. On iPhone SE and similarly short phones, the post header and Markdown body now share one continuous `.blog-app__article-scroll` container instead of split header/body scrolling.
- Third correction verification: `node --test src/scripts/blog-app.test.mjs` passed with 20 tests, `node --test src/scripts/os-window-manager.test.mjs` passed with 13 tests, `node --test src/scripts/resume-app.test.mjs` passed with 5 tests, and `npm run build` passed with 5 pages generated. `package.json` still has no lint script. Edge headless CDP rendered QA verified desktop 1920px article width at about 1445px with 162px side gutters, tablet no-overflow layout, iPhone SE post panel padding/radius/background reset, one continuous short-phone post scroll, visible bottom share menu within the post frame, Blog.exe close/reopen tab persistence, existing `/blog/` and `/blog/vibe-coding-to-the-max/` routes, and no mobile viewport overflow. No new dependency, Playwright, Phase 6+ behavior, legacy route cleanup, or `public/Resume-BURAK-YUKSEL.pdf` change was added.
- Fourth correction on 2026-06-14: iPhone SE/small-phone Blog.exe share menus now overlay within the article instead of participating in the header/footer button layout. The header Share menu is anchored to the article header rather than the narrow share button wrapper, and the footer Share menu is anchored to a full-width article footer so it opens as a usable content-width panel above the footer controls. Both remain absolute overlays, keeping Back/Share buttons stable and avoiding horizontal scroll.
- Fourth correction verification: `node --test src/scripts/blog-app.test.mjs` passed with 21 tests, `node --test src/scripts/os-window-manager.test.mjs` passed with 13 tests, `node --test src/scripts/resume-app.test.mjs` passed with 5 tests, and `npm run build` passed with 5 pages generated. Edge headless CDP rendered QA on iPhone SE verified the top and bottom share menus are absolute overlays, remain within the post scroll frame, do not move the surrounding buttons, do not create horizontal scroll, and keep the page at `documentWidth === 375`. No new dependency, Playwright, Phase 6+ behavior, legacy route cleanup, or `public/Resume-BURAK-YUKSEL.pdf` change was added.
- Fifth correction on 2026-06-14: Blog.exe bottom Share menus now use the same absolute overlay model across coarse-pointer/touch devices instead of becoming static in the footer layout. This removes the iPhone 14 Pro Max style vertical gap while keeping SE footer Back/Share icon buttons adjacent. Desktop/laptop bottom Share menus are positioned from the article footer/back-button edge so the menu opens fully inside the post card instead of clipping off the left side.
- Fifth correction verification: `node --test src/scripts/blog-app.test.mjs` passed with 22 tests, `node --test src/scripts/os-window-manager.test.mjs` passed with 13 tests, `node --test src/scripts/resume-app.test.mjs` passed with 5 tests, and `npm run build` passed with 5 pages generated. `package.json` still has no lint script. Edge headless CDP rendered QA covered 430px iPhone 14 Pro Max touch, 375px iPhone SE touch, and 1440px desktop hover bottom Share interactions; verified compact 8px footer button gaps, absolute share-menu positioning, no horizontal overflow, menu visibility within the post frame on 430px and desktop, desktop menu alignment to the Back button edge, top Share no-overflow on 430px touch, and existing `/blog/` plus `/blog/hello-world/` routes returning 200. No new dependency, Playwright, Phase 6+ behavior, legacy route cleanup, or `public/Resume-BURAK-YUKSEL.pdf` change was added.
- Sixth correction on 2026-06-14: Blog.exe post-header Back to Posts and Share controls now stay grouped through the mid-width mobile band from 421px to 760px. The `max-width: 760px` header action group no longer stretches across the one-column article header, while the existing `max-width: 420px` full-width adjacent button treatment remains intact.
- Sixth correction verification: `node --test src/scripts/blog-app.test.mjs` passed with 23 tests, `node --test src/scripts/os-window-manager.test.mjs` passed with 13 tests, `node --test src/scripts/resume-app.test.mjs` passed with 5 tests, and `npm run build` passed with 5 pages generated. Edge headless CDP rendered QA measured 420px, 422px, 757px, and 761px Blog.exe post-header controls; 422px and 757px now shrink-wrap to the Back/Share pair with an 8.31px gap and zero extra action width, 420px keeps the full-width adjacent pair, 761px keeps the desktop grouped pair, and all checked widths had no horizontal document overflow. Existing `/blog/` and `/blog/vibe-coding-to-the-max/` routes returned 200. No new dependency, Playwright, Phase 6+ behavior, legacy route cleanup, or `public/Resume-BURAK-YUKSEL.pdf` change was added.
- Seventh correction on 2026-06-14: Blog.exe top Share menus in the mid-width mobile band now anchor to the full post-header action group instead of the narrow Share button wrapper. The menu left edge aligns with the Back to Posts button from 421px to 760px, shifting the menu right to avoid left-side clipping, while the existing `max-width: 420px` full-width menu treatment remains intact.
- Seventh correction verification: `node --test src/scripts/blog-app.test.mjs` passed with 23 tests, `node --test src/scripts/os-window-manager.test.mjs` passed with 13 tests, `node --test src/scripts/resume-app.test.mjs` passed with 5 tests, and `npm run build` passed with 5 pages generated. `package.json` still has no lint script. Edge headless CDP rendered QA measured 630px, 422px, 757px, and 420px Blog.exe top Share menu placement; at 630px, 422px, and 757px the menu left edge matched Back to Posts exactly, stayed inside the article X bounds, and produced no document/app overflow. The 420px check kept the existing small-phone overlay treatment within the article. Existing `/blog/` and `/blog/vibe-coding-to-the-max/` routes returned 200. No new dependency, Playwright, Phase 6+ behavior, legacy route cleanup, or `public/Resume-BURAK-YUKSEL.pdf` change was added.
- Eighth correction on 2026-06-15: Blog.exe Copy Link share-menu actions now include a decorative chain icon before the label, matching the existing LinkedIn icon+text pattern while keeping the button's accessible text as Copy Link.
- Eighth correction verification: added a focused BlogApp markup guard for both Copy Link actions and verified the red/green cycle. `node --test src/scripts/blog-app.test.mjs` passed with 24 tests and `npm run build` passed with 5 pages generated. `package.json` still has no lint script. No new dependency, Phase 6+ behavior, legacy route cleanup, or `public/Resume-BURAK-YUKSEL.pdf` change was added.
- Handoff notes: Phase 6 should start GitHub app only. Keep existing blog routes available until Phase 8 route cleanup decisions are explicitly made.

### Phase 6: GitHub app

- Status: implemented on 2026-06-26 on branch `feature/portfolio_revamp`.
- Files changed:
  - `src/components/os/OsShell.astro`
  - `src/components/os/GitHubApp.astro`
  - `src/scripts/github-app.js`
  - `src/scripts/github-app.test.mjs`
  - `src/scripts/os-window-manager.test.mjs`
  - `src/styles/os.css`
  - `src/styles/github-app.css`
  - `BRAIN.md`
- Endpoint correction: the original master-plan endpoint used `beyuksel96`, which returned GitHub API `404 Not Found` during live verification. Existing site links use `BYuksel96`, and `https://api.github.com/users/BYuksel96/repos?sort=updated&per_page=6` returned public repository data, so Phase 6 uses the working `BYuksel96` endpoint.
- Architecture decision: GitHub remains an exclusive fullscreen main app controlled by the existing OS window manager. `GitHubApp.astro` replaces only the GitHub placeholder content, while `src/scripts/github-app.js` owns public API fetching, repo normalization, loading/error/empty/success rendering, and retry behavior.
- Fetch/state decision: the app fetches on first GitHub window open by observing the existing OS window open state. It does not fetch on page load, does not use tokens/auth headers, does not iframe GitHub, and does not persist data in localStorage or sessionStorage.
- UI decision: GitHub.exe uses an OS repo explorer layout with a connection/sidebar panel and responsive repository cards showing repo name, description fallback, language fallback, star count, default-branch commit count, last updated date, and an external GitHub link opening in a real browser tab.
- Commit-count decision: after the repo list loads, the browser makes one unauthenticated commits request per repo using the repo `full_name` and `default_branch`, with `per_page=1`. The app reads GitHub's `Link` header `rel="last"` page number as the default-branch commit count. If a commit-count request fails or is rate-limited, that repo still renders with `Commits unavailable`.
- Responsive correction decision: GitHub.exe owns the full `.os-window-body` surface with zero padding and stretch alignment. On mobile widths the GitHub workspace becomes a vertical scrolling layout, the connection/sidebar panel remains readable, metadata stays visible as compact tiles, and very small widths collapse the metadata to one column instead of cropping or hiding it.
- Phase boundary: no Downloads/Bin work, download behavior, route cleanup, language/shutdown behavior, folder dragging, backend behavior, new dependency, or `public/Resume-BURAK-YUKSEL.pdf` change was added.
- Verification: focused red/green tests were added for GitHub helpers, commit-count pagination parsing, commit-count fallback, state transitions, markup, responsive CSS, mobile sidebar readability, full-window body fit, and OS shell wiring. `node --test src/scripts/github-app.test.mjs src/scripts/os-window-manager.test.mjs src/scripts/blog-app.test.mjs src/scripts/resume-app.test.mjs` passed with 53 tests and 0 failures, and `env ASTRO_TELEMETRY_DISABLED=1 npm run build` passed with 5 pages generated. Localhost returned HTTP 200 and generated output contained the GitHub app, commit-count rendering, full-window GitHub body rules, and compact mobile sidebar rules. Live GitHub commit endpoint verification for `BYuksel96/PureOrigins` previously returned HTTP 200 with `rel="last"` page 36. Browser plugin, Playwright, Puppeteer, and local Chromium were unavailable, so screenshot/DOM rendered QA was not run.
- Handoff notes: Phase 7 should start Downloads and Bin only. Keep GitHub endpoint as `BYuksel96` unless the public profile changes.

## Running Log

- 2026-06-26: Phase 6 final responsive completion recorded. GitHub.exe now fills the OS window body, and the mobile layout keeps the connection/sidebar content readable by stacking the workspace, preserving metadata as compact tiles, and allowing vertical scrolling instead of cropping. Fresh verification passed with 53 Node tests, `npm run build`, generated-output CSS checks, and localhost HTTP 200. No Phase 7+ work, new dependency, route cleanup, or PDF change was added.
- 2026-06-26: Phase 6 GitHub app commit-count enhancement completed. GitHub.exe repo cards now show default-branch commit counts by reading the commits API pagination `Link` header, with per-repo fallback to `Commits unavailable` if GitHub blocks a count request. `node --test src/scripts/github-app.test.mjs` passed with 8 tests, OS/Blog/Resume focused tests passed, `npm run build` passed, localhost returned HTTP 200, generated output contained `data-github-repo-commits`, and live `BYuksel96/PureOrigins` commit endpoint returned `rel="last"` page 36. No Phase 7+ work, new dependency, route cleanup, or PDF change was added.
- 2026-06-26: Phase 6 GitHub app completed. Added GitHub.exe repo explorer with first-open public API fetch, loading/error/empty/success states, retry, responsive repo cards, external repo links, and updated help copy. Corrected the master-plan GitHub API username from non-working `beyuksel96` to existing site profile `BYuksel96` after live API verification. `node --test src/scripts/github-app.test.mjs`, `node --test src/scripts/os-window-manager.test.mjs`, `node --test src/scripts/blog-app.test.mjs`, `node --test src/scripts/resume-app.test.mjs`, and `npm run build` passed. Localhost and generated-output checks passed; screenshot/DOM rendered QA was blocked because Browser plugin, Playwright, Puppeteer, and local Chromium were unavailable. No Phase 7+ work, new dependency, route cleanup, or PDF change was added.
- 2026-06-15: Phase 5 Blog.exe Copy Link icon polish completed. Added an aria-hidden chain icon to both Copy Link share-menu actions and split share-menu icon styling into copy/linkedin modifiers. The focused BlogApp test failed before the markup change, then `node --test src/scripts/blog-app.test.mjs` passed with 24 tests and `npm run build` passed. No lint script exists; no Phase 6+ work, new dependency, legacy route cleanup, or `public/Resume-BURAK-YUKSEL.pdf` change was added.
- 2026-06-14: Phase 5 Blog.exe top Share menu alignment correction completed. In the 421px-760px band, the header Share menu now positions from the full action group so its left edge lines up with Back to Posts instead of clipping off the article's left side. `node --test src/scripts/blog-app.test.mjs` passed with 23 tests, `node --test src/scripts/os-window-manager.test.mjs` passed with 13 tests, `node --test src/scripts/resume-app.test.mjs` passed with 5 tests, and `npm run build` passed. Edge headless CDP rendered QA measured 630px, 422px, 757px, and 420px top Share placement, route smoke checks, PDF unchanged status, and horizontal overflow. No lint script exists; no Phase 6+ work, Playwright dependency, legacy route cleanup, or `public/Resume-BURAK-YUKSEL.pdf` change was added.
- 2026-06-14: Phase 5 Blog.exe mid-width header-actions correction completed. Fixed the 421px-760px responsive band where the article header made Back to Posts and Share stretch to opposite sides; the action group now shrink-wraps on mid-width mobile/tablet while <=420px keeps the full-width adjacent button layout. `node --test src/scripts/blog-app.test.mjs` passed with 23 tests, `node --test src/scripts/os-window-manager.test.mjs` passed with 13 tests, `node --test src/scripts/resume-app.test.mjs` passed with 5 tests, and `npm run build` passed. Edge headless CDP rendered QA measured 420px, 422px, 757px, and 761px controls, route smoke checks, and horizontal overflow. No lint script exists; no Phase 6+ work, Playwright dependency, legacy route cleanup, or `public/Resume-BURAK-YUKSEL.pdf` change was added.
- 2026-06-14: Phase 5 Blog.exe cross-touch/desktop share-menu correction completed. Changed bottom Share menus back to absolute overlays for all touch/coarse-pointer layouts, kept SE footer icon buttons adjacent by preventing the footer share wrapper from flex-growing, and aligned desktop/laptop bottom Share menus to the article footer/back-button edge so they do not clip. `node --test src/scripts/blog-app.test.mjs` passed with 22 tests, `node --test src/scripts/os-window-manager.test.mjs` passed with 13 tests, `node --test src/scripts/resume-app.test.mjs` passed with 5 tests, and `npm run build` passed. Edge headless CDP rendered QA covered iPhone 14 Pro Max touch, iPhone SE touch, desktop hover, top Share no-overflow, menu bounds, stable button positions, route smoke checks, and horizontal overflow. No lint script exists; no Phase 6+ work, Playwright dependency, legacy route cleanup, or `public/Resume-BURAK-YUKSEL.pdf` change was added.
- 2026-06-14: Phase 5 Blog.exe iPhone SE share-menu correction completed. Re-anchored small-phone top and bottom share menus as absolute overlays inside the article frame, with the footer spanning the article content so the bottom menu no longer shrinks between the icon buttons. `node --test src/scripts/blog-app.test.mjs` passed with 21 tests, `node --test src/scripts/os-window-manager.test.mjs` passed with 13 tests, `node --test src/scripts/resume-app.test.mjs` passed with 5 tests, and `npm run build` passed. Edge headless CDP rendered QA covered iPhone SE top Share and bottom Share interactions, menu bounds, stable button positions, horizontal overflow, and viewport width. No lint script exists; no Phase 6+ work, Playwright dependency, legacy route cleanup, or `public/Resume-BURAK-YUKSEL.pdf` change was added.
- 2026-06-14: Phase 5 Blog.exe desktop/mobile correction completed. Replaced the desktop post card cap with `min(100%, calc(50% + 36rem))` to halve the remaining grey gutter, reset mobile `.blog-app__panel--post` legacy global `article` styling so the post panel is square/flush, and changed short-phone posts to one continuous scroll surface for header plus Markdown body. `node --test src/scripts/blog-app.test.mjs` passed with 20 tests, `node --test src/scripts/os-window-manager.test.mjs` passed with 13 tests, `node --test src/scripts/resume-app.test.mjs` passed with 5 tests, and `npm run build` passed. Edge headless CDP rendered QA covered desktop/tablet/iPhone SE screenshots, share menu visibility, reopen state, existing blog routes, and mobile viewport overflow. No lint script exists; no Phase 6+ work, Playwright dependency, legacy route cleanup, or `public/Resume-BURAK-YUKSEL.pdf` change was added.
- 2026-06-14: Phase 5 Blog.exe responsive/touch correction completed. Widened the desktop article card, made mobile Blog.exe post panels flush with the OS window body, set touch Back/Share controls to their active colours, made bottom share menus visible inline and scrolled into view, lowered the mobile taskbar/labels, and constrained short-phone post headers so article scrolling remains reachable. `node --test src/scripts/blog-app.test.mjs` passed with 20 tests, `node --test src/scripts/os-window-manager.test.mjs` passed with 13 tests, `node --test src/scripts/resume-app.test.mjs` passed with 5 tests, and `npm run build` passed. Edge headless CDP rendered QA covered desktop/tablet/mobile Blog.exe layout, tab interactions, canonical sharing, reopen state, existing blog routes, mobile taskbar spacing, share menu visibility, and viewport overflow. No lint script exists; no Phase 6+ work, Playwright dependency, legacy route cleanup, or `public/Resume-BURAK-YUKSEL.pdf` change was added.
- 2026-06-14: Phase 5 Blog.exe correction completed. Replaced Blog.exe's duplicate topbar with `.blog-app__chrome` containing real OS controls, removed post count indicators, aligned post actions inside the article header, changed `Back to Blog` to `Back to Posts`, added bottom icon actions, moved scrolling inside `.blog-app__article-body`, and added clickable same-tab tag results. Shared OS controls now show `X`, disabled grey `-`, and `?` consistently for OS windows/help. `node --test src/scripts/blog-app.test.mjs` passed with 17 tests, `node --test src/scripts/os-window-manager.test.mjs` passed with 12 tests, `node --test src/scripts/resume-app.test.mjs` passed with 5 tests, and `npm run build` passed. Edge headless CDP rendered QA covered desktop/tablet/mobile Blog.exe corrections, canonical sharing, help/close/reopen, bottom actions, tag results, and mobile overflow. No Phase 6+ work, Playwright dependency, legacy route cleanup, or `public/Resume-BURAK-YUKSEL.pdf` change was added.
- 2026-06-14: Phase 5 Blog.exe completed. Added build-time rendered Blog.exe archive/post tab UI backed by the existing Markdown collection, canonical path/share helpers, idempotent vanilla JS tab state, namespaced Blog.exe article styling, and focused Node tests. Preserved existing `/blog/` and individual blog routes, left `public/Resume-BURAK-YUKSEL.pdf` unchanged, and added no Phase 6+ behavior. `node --test src/scripts/blog-app.test.mjs`, `node --test src/scripts/os-window-manager.test.mjs`, `node --test src/scripts/resume-app.test.mjs`, and `npm run build` passed. No lint script exists. Edge headless CDP rendered QA covered Blog.exe desktop/tablet/mobile interactions, canonical sharing, reopening state, existing blog routes, and mobile overflow.
- 2026-06-12: Phase 4 mobile responsive correction completed. Increased phone-sized compact/open-app taskbar icon and label sizing so Resume.exe taskbar controls remain readable when an app is open. Added a phone-sized landscape portrait-mode lock overlay for unusably short mobile landscape viewports while leaving tablet landscape unaffected. Preserved `src/content/timeline.json`, old `/resume/`, blog routes/content, and `public/Resume-BURAK-YUKSEL.pdf`. No Blog/GitHub/Downloads/Bin Phase 5+ content or behavior added. Added focused CSS/markup guard tests. `node --test src/scripts/os-window-manager.test.mjs` passed with 9 tests, `node --test src/scripts/resume-app.test.mjs` passed with 5 tests, and `npm run build` passed with 5 pages generated. No lint script exists. Edge headless CDP rendered QA covered phone portrait Resume.exe, phone landscape lock, and tablet landscape Resume.exe.
- 2026-06-12: Phase 4 Resume.exe Career Files style correction completed. Removed the left-pane archive rail and per-row timeline dots, restoring compact explorer rows with icon, title, date, active border, and current badge matching the requested Career Files style. Preserved `src/content/timeline.json`, old `/resume/`, blog routes/content, and `public/Resume-BURAK-YUKSEL.pdf`. No Blog/GitHub/Downloads/Bin Phase 5+ content or behavior added. Added a focused CSS guard test against the rail/marker regression. `node --test src/scripts/resume-app.test.mjs` passed with 5 tests, `node --test src/scripts/os-window-manager.test.mjs` passed with 7 tests, and `npm run build` passed with 5 pages generated. No lint script exists. Edge headless CDP rendered QA confirmed Discover remains the default active/current file and the Career Files pane uses compact explorer rows.
- 2026-06-12: Phase 4 Resume.exe layout correction completed. Removed the redundant middle Timeline Stack pane and kept Resume.exe as a two-pane Career File Explorer: left timeline-aware archive/file list, right flattened File Preview/Inspector. Preserved `src/content/timeline.json`, old `/resume/`, blog routes/content, and `public/Resume-BURAK-YUKSEL.pdf`. No Blog/GitHub/Downloads/Bin Phase 5+ content or behavior added. Added a focused guard test that fails if the separate timeline stack returns. `node --test src/scripts/resume-app.test.mjs` passed with 4 tests, `node --test src/scripts/os-window-manager.test.mjs` passed with 7 tests, and `npm run build` passed with 5 pages generated. No lint script exists. Edge headless CDP rendered QA covered desktop two-pane Resume.exe selection and mobile inline preview selection.
- 2026-06-12: Phase 4 Resume.exe completed. Added Career File Explorer app UI inside the existing Resume.exe OS window with selectable career files, timeline stack, inspector, mobile inline selected preview, LinkedIn external action, and updated help copy. Preserved `src/content/timeline.json`, old `/resume/`, blog routes/content, and `public/Resume-BURAK-YUKSEL.pdf`. No Blog/GitHub/Downloads/Bin Phase 5+ content or behavior added. `node --test src/scripts/resume-app.test.mjs`, `node --test src/scripts/os-window-manager.test.mjs`, and `npm run build` passed. No lint script exists. Edge headless CDP rendered QA covered desktop and mobile Resume.exe selection.
- 2026-06-12: Phase 3 mobile/tablet sticky taskbar hover correction completed. Added pointer-mode tracking to suppress hover-only lift/label styles after touch input, so closed taskbar items return to idle after closing an app/folder while desktop/laptop hover remains intact. No Phase 4+ content or behavior added. `node --test src/scripts/os-window-manager.test.mjs` passed with 7 tests. `npm run build` passed. No lint script exists. Protected resume/blog/content/PDF paths had no diff. Playwright was unavailable locally without installing dependencies.
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

- Archive/backup the current site implementation so the previous design can be restored later.
- Inspect current repo structure and identify files that will be reused.
- Create the initial one-page OS shell skeleton.
- Decide component/file structure for the revamp.
- Update `BRAIN.md` with archive location, structure decisions, and verification notes.
- Run `npm run build`.

### Phase 2: OS desktop and responsive shell

- Build loading screen with `Burak OS Loading...` animated dots.
- Build monitor/OS desktop layout.
- Add desktop icons.
- Add bottom-centre rounded taskbar.
- Add light/dark theme handling, defaulting to dark if no preference.
- Make shell responsive across desktop, tablet, mobile, and small screens.
- Update `BRAIN.md`.
- Run `npm run build`.

### Phase 3: Window/app system

- Implement fullscreen app window behaviour for Resume, Blog, and GitHub.
- Implement folder window behaviour for Downloads and Bin.
- Add top-bar controls: close, disabled minimise, and help.
- Add help dialog pattern with backdrop close and x close.
- Add active taskbar highlighting.
- Add taskbar shrink behaviour only for main apps.
- Ensure opening one main app closes another.
- Update `BRAIN.md`.
- Run `npm run build`.

### Phase 4: Resume.exe

- Move existing resume timeline content into the new OS app experience.
- Redesign timeline UI/UX.
- Preserve existing timeline data and meaning.
- Add LinkedIn link opening in a new browser tab.
- Add Resume.exe help dialog copy.
- Update `BRAIN.md`.
- Run `npm run build`.

### Phase 5: Blog.exe

- Move existing blog archive/list into browser-style app.
- Preserve year/month/latest-first grouping.
- Implement internal blog tabs.
- Opening a post creates a new internal tab.
- Add close tab behaviour.
- Keep `BACK TO BLOG` and `SHARE` behaviours.
- Add Blog.exe help dialog copy.
- Update `BRAIN.md`.
- Run `npm run build`.

### Phase 6: GitHub app

- Fetch public repos from GitHub API without auth/token.
- Add loading and error states.
- Display repo cards with name, description, language, stars, updated date, and external GitHub link.
- Add GitHub app help dialog copy.
- Update `BRAIN.md`.
- Run `npm run build`.

### Phase 7: Downloads and Bin

- Implement Bin folder window, empty for now but ready for future easter eggs.
- Implement Downloads folder window.
- Add downloadable resume/CV file.
- Add helper text telling users to click the file to download.
- Add folder help dialogs.
- Confirm taskbar does not shrink for folders.
- Update `BRAIN.md`.
- Run `npm run build`.

### Phase 8: Polish, accessibility, and final verification

- Improve responsive behaviour and mobile/touch UX.
- Check keyboard/focus/accessibility basics.
- Check reduced-motion handling where practical.
- Remove dead code from old page flows where safe.
- Verify external links open correctly.
- Verify downloadable CV works.
- Verify static build output.
- Update README if needed.
- Update `BRAIN.md` with final handoff notes.
- Run final `npm run build`.

NOTE: Codex must not attempt the full revamp in one pass. It should work in phases, update this file after each phase, and run build/lint checks before marking a phase complete. If no lint script exists, record that clearly rather than inventing one.
