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

#### Window behaviour

- Opens as an independent folder window rather than a fullscreen main app.
- Opens centred horizontally and vertically within the usable Burak OS desktop area.
- Its position and dimensions must account for the top OS bar and taskbar.
- Should be approximately half of the usable height between the top OS bar and the taskbar.
- Must remain fully visible within the OS viewport on desktop, tablet and mobile.
- Uses the same folder-window structure and visual language as Downloads.
- Includes:
  - close control
  - disabled minimise control
  - help control
  - centred window title

- Clicking its active taskbar item again closes the Bin window.
- Opening or closing Bin must not close the active fullscreen main app.
- Opening Bin must not cause the taskbar to shrink.
- Folder dragging remains deferred and must not be added as part of the initial Bin or Easter-egg implementation.

#### Initial state

- Bin remains empty until its dedicated Easter-egg phases are implemented.
- The empty state should feel intentional rather than unfinished.
- Initial help copy should explain that Bin is currently empty but may contain Easter eggs later.
- The internal structure should allow future file-style launchers to be added without redesigning the folder window.

#### Future Easter-egg content

Bin will later contain two launchable game files:

1. A black-and-white 8-bit maze game.
2. An Agile Coach/Scrum Master definitions quiz game.

These games should appear as file-style items inside the Bin folder rather than being permanently visible elsewhere on the desktop.

Selecting a game file should launch that game inside the Burak OS interface. The precise game-window behaviour and lifecycle will be defined during the dedicated game-planning phases.

The Bin implementation should be divided into:

- Phase 7: Bin folder structure and game-file launcher foundation.
- Phase 7A: Maze game.
- Phase 7B: Agile/Scrum quiz game.
- Phase 7C: Combined integration and polish only if required after both games are complete.

Do not implement the two games as part of the initial Bin folder task.

#### Future help behaviour

Before the games are implemented, the help dialog should explain that Bin is currently empty and may contain Easter eggs later.

After the games are implemented, update the help dialog to explain:

- Bin contains hidden Burak OS Easter eggs.
- Game files can be opened from inside the folder.
- Each game runs entirely within the browser.
- Progress or high scores may be stored locally where applicable.

#### Technical constraints

- Keep the website fully static.
- Do not introduce a backend, database, authentication or runtime server.
- Do not introduce a game framework without a compelling and approved reason.
- Use Astro, scoped CSS and vanilla browser JavaScript.
- Keep Bin and game-specific styling and scripts appropriately namespaced.
- Do not modify `public/Resume-BURAK-YUKSEL.pdf`.
- Do not implement unrelated Phase 8 cleanup or broader OS refactoring.

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

### Phase 7: Downloads and Bin

- Status: implemented on 2026-06-27 on branch `feature/portfolio_revamp`.
- Files changed:
  - `src/components/os/OsShell.astro`
  - `src/components/os/OsWindow.astro`
  - `src/components/os/DownloadsFolder.astro`
  - `src/components/os/BinFolder.astro`
  - `src/components/os/DownloadConfirmDialog.astro`
  - `src/scripts/os-window-manager.js`
  - `src/scripts/os-window-manager.test.mjs`
  - `src/styles/os.css`
  - `BRAIN.md`
- Content decision: Downloads now shows helper text and one file item labeled `Resume-BURAK-YUKSEL.pdf`; Bin renders an empty-state folder ready for later easter eggs. Folder help copy now describes the real Downloads/Bin behavior instead of Phase 3 placeholders.
- Download decision: mouse/desktop users open the download confirmation with a double-click; touch users open it with a single tap. The monitor-local confirmation asks `Continue download Burak's Resume?` with `Yes` and `No`; `Yes` downloads the existing `/Resume-BURAK-YUKSEL.pdf` path and `No`, backdrop click, or Escape cancels.
- PDF decision: `public/Resume-BURAK-YUKSEL.pdf` was deliberately not modified in Phase 7; the UI links to the existing public asset path only.
- Folder behavior decision: Downloads and Bin remain independent folder windows, do not compact the taskbar by themselves, move to the front when opened or pressed, and can be dragged by their top bars with mouse or touch. Drag state is session-only and resets when the folder closes or the page reloads.
- Responsive decision: folder positions are bounded within the OS desktop layer above the taskbar. The responsive folder width/offset was adjusted after rendered QA so phone-sized drag has visible movement while staying clear of the dock.
- Phase boundary: no Phase 8 theme toggle, Bin games/easter eggs, route cleanup, backend behavior, new dependency, or resume PDF asset update was added.
- Verification: focused red/green tests covered folder z-order, drag clamping, close/reset behavior, Downloads/Bin markup, confirmation dialog markup, desktop double-click versus touch tap activation, and responsive folder CSS guards. `node --test src/scripts/os-window-manager.test.mjs src/scripts/blog-app.test.mjs src/scripts/resume-app.test.mjs src/scripts/github-app.test.mjs` passed with 60 tests and 0 failures, and `env ASTRO_TELEMETRY_DISABLED=1 npm run build` passed with 5 pages generated. Headless Chrome CDP rendered QA passed for the previous narrow responsive failure band, then for 1280x800 desktop and 390x844 phone viewports, checking folder opening, taskbar non-compaction, default dock clearance, desktop double-click confirmation, phone tap confirmation, top-bar dragging, z-order, and taskbar bounds. Browser plugin, Playwright, and Puppeteer were unavailable, but local Chrome was available for CDP QA.
- Handoff notes: Phase 8 should start polish/accessibility/final verification only. The Phase 8 notes below now include future top-bar light/dark toggle work and Bin easter-egg games, but those were not implemented in Phase 7.

### Phase 7A: Maze game

- Status: implemented on 2026-06-27 on branch `feature/portfolio_revamp`.
- Files changed:
  - `src/components/os/OsShell.astro`
  - `src/components/os/OsWindow.astro`
  - `src/components/os/BinFolder.astro`
  - `src/components/os/MazeGame.astro`
  - `src/scripts/os-window-manager.js`
  - `src/scripts/os-window-manager.test.mjs`
  - `src/scripts/maze-game.js`
  - `src/scripts/maze-game.test.mjs`
  - `src/scripts/maze-generation.js`
  - `src/scripts/maze-input.js`
  - `src/scripts/maze-pathfinding.js`
  - `src/scripts/maze-renderer.js`
  - `src/scripts/maze-rng.js`
  - `src/scripts/maze-state.js`
  - `src/scripts/maze-storage.js`
  - `src/styles/os.css`
  - `src/styles/maze-game.css`
  - `BRAIN.md`
- Architecture decision: Maze.exe is a Bin-only game file launcher that opens a fullscreen `kind="game"` OS window. It is not present on the desktop or taskbar. Opening Maze.exe compacts the taskbar like a fullscreen app while keeping Bin open underneath; closing Maze.exe stops the run, resets Maze state to idle, and returns the taskbar to default sizing.
- Game logic decision: Maze generation is dependency-free canvas gameplay backed by pure modules for seeded RNG, maze generation, pathfinding/enemy decisions, scoring/difficulty state, storage, input, and rendering. Level 1 uses a 3x3 central spawn room, four rings, an exterior boundary, and one exterior exit. Later levels add one ring per level and cap at 49x49. Each level is generated from scratch and remains solvable with dead ends, braided loops, reachable collectibles, and reachable exits.
- Difficulty decision: scoring uses +25 collectibles, `100 + level * 20` level completion, and an optional +100 full-sweep bonus. Dynamic internal gateways begin at Level 6 and use optional braided edges so closing them cannot invalidate the maze; gateways warn before toggling and do not close on the player or monsters. Monsters begin at Level 11, become more memory/route-biased at Level 16, and two monsters appear at Level 21 with capped speed and decision intervals.
- Lifecycle/storage decision: gameplay supports keyboard Arrow/WASD controls, touch D-pad controls, countdown before each level, HUD level/score/high score, collision game-over, and local high-score persistence with safe in-memory fallback when storage is unavailable. Closing the game stops active gameplay; page hiding pauses active gameplay.
- Phase boundary: Phase 7B Agile/Scrum quiz, quiz data/question bank, Phase 7C combined integration, Phase 8 cleanup/theme work, GitHub changes, unrelated Downloads changes, folder dragging changes, language/shutdown behavior, route cleanup, new dependencies, Playwright, backend behavior, and `public/Resume-BURAK-YUKSEL.pdf` changes were not added.
- Verification: red/green Maze tests were added first and verified failing before implementation. `node --test src/scripts/maze-game.test.mjs src/scripts/os-window-manager.test.mjs src/scripts/blog-app.test.mjs src/scripts/resume-app.test.mjs src/scripts/github-app.test.mjs` passed with 69 tests and 0 failures. `git diff --check` passed. `env ASTRO_TELEMETRY_DISABLED=1 npm run build` passed and generated 5 pages. Local Astro dev server returned 200 after escalation for localhost binding. Headless Chrome CDP rendered QA passed at 1280x800 desktop and 390x844 mobile, checking Bin-only Maze.exe launch, countdown, playing state, HUD, nonblank canvas pixels, keyboard/touch controls visible, Maze window above Bin, no mobile horizontal overflow, no console errors, only `Maze.exe` as a Bin game file, close cleanup to idle, Bin remaining open, and taskbar returning to default.
- Correction on 2026-06-28: Maze exits are now true exterior wall openings. Generation opens exactly one outward boundary segment on a non-corner boundary cell, `getExteriorOpenings()` guards that only one exterior opening exists, dynamic gateways remain internal and cannot close or replace the exit, and level completion is tied to traversing the exit opening. The renderer no longer paints a faux exit over a closed wall; it leaves the wall segment absent and draws a small monochrome pulsing doorway marker outside the opening, with a static reduced-motion path.
- Correction UX/audio decision: the start screen now includes semantic `HOW TO PLAY` guidance before Play, explaining the wall opening objective, Arrow/WASD and touch D-pad controls, optional collectibles, random levels, Level 6 gateways, Level 11 monsters, monster collision ending the run, and the `3, 2, 1` countdown. Maze help now acts as a concise permanent reference and includes the visible exterior opening, controls, collectibles, gateway/monster thresholds, local high scores, Exit to Bin, and music controls.
- Music decision: Maze music is an original procedural Web Audio chiptune loop in `src/scripts/maze-audio.js`, with no dependency or asset fetch. Music defaults off and uses `burakOs.mazeMusicEnabled.v1`; preference storage falls back to page-session memory if localStorage is unavailable. Start and game-over toggles share one preference and expose `aria-pressed`. Audio contexts are created only after eligible user gestures, reused across starts, stopped on toggle-off, Exit to Bin, Maze close, replacement/hide lifecycle, page hide, and pagehide, and guarded against duplicate scheduling/overlapping loops.
- Correction verification: focused red/green tests were added for exterior opening behavior, gateway invariance, exit traversal completion, onboarding/help copy, reduced-motion indicator hooks, music preference persistence/fallback, no-autoplay/idempotent player behavior, and lifecycle stop actions. `node --test src/scripts/maze-game.test.mjs` passed with 13 tests, `node --test src/scripts/os-window-manager.test.mjs` passed with 23 tests, and `node --test src/scripts/maze-game.test.mjs src/scripts/os-window-manager.test.mjs src/scripts/blog-app.test.mjs src/scripts/resume-app.test.mjs src/scripts/github-app.test.mjs` passed with 74 tests. `git diff --check` passed, `package.json` still has no lint script, and `env ASTRO_TELEMETRY_DISABLED=1 npm run build` passed with 5 pages generated.
- Correction rendered QA: local Astro dev server plus headless Chrome CDP checked `1440x900`, `1280x800`, `820x1180`, `390x844`, and `375x667`. Screenshots verified readable How to Play copy, Play/music controls without overflow, the genuine wall opening and outside marker at the exit, keyboard route traversal completing Level 1 through the opening, touch D-pad visibility, reduced-motion media support, game-over music control layout, Exit to Bin cleanup, reopen preference sync, no autoplay before toggle/play, one reused audio context, no duplicate contexts after completion/reopen, and stopped scheduling after toggle-off/Exit to Bin. Audio was lifecycle-instrumented with a fake AudioContext in headless QA; final subjective volume/timbre can still be balanced by ear in a real browser if desired.
- Second correction on 2026-06-28: Maze difficulty timing was retuned without starting Phase 7B or Phase 7C. Dynamic gateway shifts now begin at Level 3. The first monster is available at Level 6 and the second at Level 11, but monsters only spawn after countdown once the player's current graph/path distance from the original central spawn area is at least five cells. Returning near the spawn area before evaluation postpones the spawn. Monster profiles now become more route-aware from Level 6 and gain stronger route evaluation, memory, and coordination at Level 11 without depending only on raw speed.
- Second correction gateway decision: dynamic gateway events now choose a local paired shift around the player: one safe currently open internal gateway closes while a different safe currently closed internal gateway opens. The selection radius scales by maze size, avoids occupied or immediately adjacent gateway endpoints, revalidates after the warning delay, preserves the exterior exit/opening, keeps player-to-exit and start-to-exit paths, keeps at least one legal player move, and postpones the event if no safe local pair exists.
- Second correction copy decision: Maze onboarding and Help now describe Level 3 gateway shifts, Level 6 delayed first-monster behavior, and the Level 11 second monster so the visible instructions match gameplay.
- Second correction verification: new red/green tests were added for Level 3 gateways, Level 6/11 monster thresholds, path-distance delayed spawning, movement-count non-triggering, smarter Level 6 and Level 11 behavior, coordinated two-monster routing, local paired gateway shifts, solvability, legal player movement, unsafe-event postponement, and untouched exterior exits. `node --test src/scripts/maze-game.test.mjs` passed with 19 tests, `node --test src/scripts/os-window-manager.test.mjs` passed with 23 tests, and the focused combined suite `node --test src/scripts/maze-game.test.mjs src/scripts/os-window-manager.test.mjs src/scripts/blog-app.test.mjs src/scripts/resume-app.test.mjs src/scripts/github-app.test.mjs` passed with 80 tests. `git diff --check` passed, `package.json` still has no lint script, and `env ASTRO_TELEMETRY_DISABLED=1 npm run build` passed with 5 pages generated.
- Second correction rendered QA: Browser plugin and Playwright were unavailable, so local headless Chrome CDP was used against `http://127.0.0.1:4321/`. Viewports `1440x900`, `1280x800`, `820x1180`, `390x844`, and `375x667` verified Maze launch from Bin, updated onboarding threshold copy, visible Play/music controls, no horizontal overflow, visible touch D-pad, nonblank canvas after countdown, and zero console issues. Browser-side module checks verified Level 3 open/closed gateway candidates, safe local close/open shifts, preserved exterior exit, player-to-exit solvability, retained legal movement, Level 6 one-monster profile, Level 11 two-monster profile with stronger intelligence, delayed spawn blocking near spawn/countdown, valid far spawn allowance, and unique Level 11 spawn cells. Screenshots were saved under `/private/tmp/burak-maze-phase7a-tuning-qa`.
- Handoff notes: Phase 7B should start Agile/Scrum quiz only. Phase 7C remains deferred and should only happen if combined integration/polish is required after both games are complete.

### Phase 7B: Agile/Scrum Quiz game

- Status: implemented on 2026-06-28 on branch `feature/portfolio_revamp`.
- Files changed:
  - `.gitignore`
  - `src/components/os/OsShell.astro`
  - `src/components/os/BinFolder.astro`
  - `src/components/os/QuizGame.astro`
  - `src/scripts/os-window-manager.js`
  - `src/scripts/os-window-manager.test.mjs`
  - `src/scripts/maze-game.test.mjs`
  - `src/scripts/quiz-data.js`
  - `src/scripts/quiz-state.js`
  - `src/scripts/quiz-storage.js`
  - `src/scripts/quiz-game.js`
  - `src/scripts/quiz-game.test.mjs`
  - `src/styles/quiz-game.css`
  - `BRAIN.md`
- Architecture decision: Quiz.exe is a second Bin-only file launcher beside Maze.exe. It opens as an exclusive fullscreen `kind="game"` window, compacts the taskbar, keeps Bin open underneath, has no desktop or taskbar launcher, and returns to Bin on close or Exit to Bin through the existing OS game lifecycle.
- Mode decision: Quiz.exe starts on a mode-select screen with Arcade Terminal and Coach Console. Arcade Terminal is the fast mode with 3 lives, score, level, current streak, local high score, one-at-a-time questions, explicit feedback, and game-over summary. Coach Console is a slower 12-question session with no lives or timer, per-answer explanations, `Why this matters` guidance, optional static source links, and a category summary.
- Arcade rules decision: scoring constants live in `src/scripts/quiz-state.js`. Correct answers start at 100 points, use a capped level multiplier up to 1.6, and streak multipliers of 1x for streak 0-2, 1.5x for 3-5, and 2x for 6+. Level increases after every 5 correct answers and never drops after mistakes. Question selection uses a shuffled eligible deck, avoids repeats until the deck exhausts, avoids immediate repeats after reshuffle, and progressively weights difficulty toward intermediate/advanced questions at higher levels.
- Coach/progress decision: Coach sessions select 12 non-repeating questions across the six approved categories with balanced difficulty and weak-area weighting that cannot dominate the session. Category labels only become persistently weak after at least 3 stored attempts; earlier language uses `Still gathering data`, `Needs more attempts`, or `Early indication`.
- Question-bank decision: the starter bank has 36 static questions across Agile principles, Scrum, Kanban and flow, Delivery and programme management, Stakeholders/dependencies/risk, and Facilitation/coaching/team health. Framework questions use static supporting references for Scrum Guide 2020, Agile Manifesto values/principles, and Kanban Guide May 2025. Practical delivery, programme, TPM, Agile PM, Delivery Manager, stakeholder and coaching scenarios are written as contextual best-response questions.
- Storage/reset decision: Quiz progress uses `burakOs.quiz.progress.v1` with schema version 1 and safe in-memory fallback if localStorage is unavailable. Stored state includes Arcade high score, Coach category attempts/correct counts, per-question seen/correct counts, total Coach attempts, and last selected mode. Reset Progress requires confirmation, clears Quiz keys only, updates the start summary immediately, and leaves Maze high score/music keys untouched.
- Accessibility/interaction decision: answers are semantic buttons with visible selected/correct/incorrect states, live-region feedback, explicit Next progression, keyboard shortcuts `1-4` and `A-D` only while an active question can accept input, focus moves into questions/feedback/summaries, touch targets stay large, and reduced-motion rules remove decorative transitions.
- Small-screen correction: on 2026-06-28, Quiz answer rows were adjusted to content-size vertically on narrow screens so long answer text cannot escape into the next answer. Feedback now remains as a normal block after answer D and scrolls into view when shown, preventing selected answer states from visually covering the explanation.
- Answer-randomization correction: on 2026-06-28, Quiz question choices began randomizing display labels at draw time for both Arcade and Coach. The static bank remains readable, but runtime questions preserve the original source correct answer internally and remap it to the shuffled A-D label so long/correct answers no longer teach players to choose B.
- Mobile start-screen correction: on 2026-06-28, the Quiz start screen was top-aligned on mobile so the `Recovered training program` eyebrow remains visible instead of being clipped above the scroll area when the mode cards make the menu taller than the viewport.
- Phase boundary: Phase 7C combined integration/polish, Maze gameplay changes, Downloads changes, GitHub/Blog/Resume changes, route cleanup, theme toggle, language/shutdown behavior, folder dragging changes, Playwright installation, new dependencies, backend behavior, and `public/Resume-BURAK-YUKSEL.pdf` changes were not added. The only integration correction was registering Quiz.exe in the existing game-window path and updating old tests that previously asserted Quiz did not exist.
- Verification: red/green tests were added first for the Quiz question bank, Arcade state/scoring/deck behavior, answer-label randomization, Coach session/progress/summary behavior, mobile start-screen top alignment, storage fallback/reset boundaries, keyboard shortcut capture, lifecycle/source guards, and OS integration. The final focused combined suite `node --test src/scripts/quiz-game.test.mjs src/scripts/os-window-manager.test.mjs src/scripts/maze-game.test.mjs src/scripts/blog-app.test.mjs src/scripts/resume-app.test.mjs src/scripts/github-app.test.mjs` passed with 101 tests and 0 failures after the mobile start-screen correction. `git diff --check` passed. `env ASTRO_TELEMETRY_DISABLED=1 npm run build` passed with 5 pages generated. `package.json` still has no lint script.
- Rendered QA: Browser plugin and Playwright were unavailable, so local headless Chrome CDP was used against `http://127.0.0.1:4321/`. Viewports `1440x900`, `1280x800`, `820x1180`, `390x844`, and `375x667` verified Bin displays Maze.exe and Quiz.exe, Quiz launches only from Bin, taskbar compaction/default restore, Arcade correct answers/Level 2 progression/streak/score, Arcade game-over/high-score persistence, Coach 12-question session/summary, Coach source/guidance feedback, progress persistence after close/reopen, Reset Progress clearing Quiz only while preserving Maze high score, keyboard answer shortcuts, standard close and Exit to Bin, large mobile controls, no horizontal overflow, and zero console issues. Screenshots were saved under `/private/tmp/burak-quiz-phase7b-qa`.
- Small-screen rendered QA: after the correction, local headless Chrome CDP against `http://127.0.0.1:4322/` verified Coach and Arcade answer/feedback flows at `390x844` and `375x667`. Measurements confirmed no answer-label escape, no answer-row overlap, no horizontal overflow, feedback after answer D, feedback visible after auto-scroll, and no console issues. Screenshots were saved under `/private/tmp/burak-quiz-small-screen-fix-qa`.
- Answer-randomization rendered QA: local headless Chrome CDP against `http://127.0.0.1:4323/` sampled seeded Arcade and Coach starts at `390x844`. Arcade correct labels appeared under A, B, C and D across samples; Coach correct labels appeared under A, B and D across samples. Clicking the visible correct answer was accepted in both modes, including Arcade A and Coach D screenshots saved under `/private/tmp/burak-quiz-answer-shuffle-qa`.
- Mobile start-screen rendered QA: local headless Chrome CDP against `http://127.0.0.1:4324/` verified the Quiz start menu at `390x844` and `375x667`. Measurements confirmed the `Recovered training program` eyebrow sits inside the visible start-screen viewport, the start screen begins at scroll position 0, and there is no horizontal overflow. Screenshots were saved under `/private/tmp/burak-quiz-start-crop-qa`.
- Handoff notes: Phase 7C remains optional and should start only if combined Maze/Quiz integration polish is genuinely needed after playtesting. Content/balance follow-up can tune question wording, difficulty weights, scoring, and Coach weak-area weighting after real use, but no further Phase 7C or Phase 8 work was started.

### Phase 7C: Combined game integration and accessibility polish

- Status: implemented on 2026-06-28 on branch `feature/portfolio_revamp`.
- Files changed:
  - `src/scripts/os-window-manager.js`
  - `src/scripts/os-window-manager.test.mjs`
  - `src/scripts/maze-game.test.mjs`
  - `src/styles/maze-game.css`
  - `BRAIN.md`
- Scope decision: Phase 7C stayed an audit-plus-tiny-fixes pass for the completed Bin games. No new game mechanics, quiz content, storage schema, dependency, Playwright setup, backend behavior, Phase 8 theme/accessibility sweep, route cleanup, Downloads/GitHub/Blog/Resume work, or PDF change was added.
- Lifecycle/accessibility fix: game file activation now moves focus into the opened game (`Maze.exe` Play, `Quiz.exe` Arcade Terminal), game close and `Exit to Bin` always route back through Bin, and focus returns to the relevant Bin game file. This keeps keyboard users out of hidden/underlying controls while preserving the existing exclusive fullscreen game-window lifecycle.
- Help-dialog accessibility fix: the shared Help dialog now records its opener, focuses the close control on open, traps Tab/Shift+Tab inside the dialog while open, closes on Escape/backdrop/x, and restores focus to the original help button when possible. This was treated as a practical WCAG/WAI-ARIA-aligned improvement, not a formal certification.
- Mobile Maze control polish: the desktop/fine-pointer row layout for Maze controls is now limited to widths of at least 761px. Narrow mobile viewports keep the spatial D-pad placement even in browser environments that report a fine pointer, and mobile D-pad buttons remain at least 40px in rendered QA.
- Verification: red/green tests were added for game focus targets, game close-to-Bin actions, Help focus trapping/restoration, and narrow-mobile Maze D-pad placement. The final focused combined suite `node --test src/scripts/quiz-game.test.mjs src/scripts/os-window-manager.test.mjs src/scripts/maze-game.test.mjs src/scripts/blog-app.test.mjs src/scripts/resume-app.test.mjs src/scripts/github-app.test.mjs` passed with 105 tests and 0 failures. `git diff --check` passed. `env ASTRO_TELEMETRY_DISABLED=1 npm run build` passed with 5 pages generated. `package.json` still has no lint script.
- Rendered QA: Browser plugin was not available, so local headless Chrome CDP was used against `http://127.0.0.1:4321/`. Viewports `1440x900`, `1280x800`, `820x1180`, `390x844`, and `375x667` verified Bin contains both games, neither game has a desktop/taskbar launcher, Quiz and Maze keyboard launch move focus into the game, close restores Bin/taskbar/focus, Help traps/restores focus, Quiz shortcuts do not leak on non-question screens or into Maze, active Quiz answer shortcuts still work, Maze and Quiz remain exclusive, no horizontal overflow appears, reduced-motion media emulation remains usable, mobile D-pad geometry is stable, and no relevant console issues were reported. Screenshots were saved under `/private/tmp/burak-phase7c-qa-rerun`.
- Handoff notes: Phase 7 is now complete from the Bin/game perspective. Phase 8 can take over broader site polish, accessibility review, README cleanup, external-link/download verification, and the planned top-bar light/dark toggle.

### Phase 8: Polish, accessibility, and final verification

- Status: implemented on 2026-06-29 after Phase 7C. Phase 8A localization was completed separately after Phase 8 core.
- Docs closeout ownership: Phase 8 code/test implementation was already complete before this documentation pass. Agent E changed only `README.md` and `BRAIN.md`, and did not edit code, `public/Resume-BURAK-YUKSEL.pdf`, or other downloadable/binary assets.
- Theme decision: the OS top bar now has a session-only sun/moon theme toggle with animated state changes and reduced-motion handling.
- Lock-screen decision: the power button now opens a lock-screen easter egg. Desktop unlocks with Enter; touch unlocks with Swipe up and a bouncing arrow. Reduced-motion behavior is handled.
- Responsive/accessibility polish: Phase 8 added modal and focus improvements, download confirmation focus trap/restore, launcher/window focus return, game shortcut blocking behind modals/lock, reduced-motion-aware Blog/Resume scrolling, short-mobile Maze overlay top alignment, and folder position re-clamping on resize/orientation.
- Legacy route behavior: `/resume/`, `/blog/`, and `/blog/[slug]/` are now static `noindex` fallback/redirect routes into Burak OS. Blog post routes deep-link into `Blog.exe` and open the matching post tab.
- Link/download verification: external tabs were hardened for safe opening, the GitHub profile link was verified, the LinkedIn `rel` was hardened, and the CV download path was guarded. `public/Resume-BURAK-YUKSEL.pdf` was not mutated.
- Verification baseline before Phase 8: `node --test src/scripts/*.test.mjs` passed 105/105, and `env ASTRO_TELEMETRY_DISABLED=1 npm run build` passed with 5 pages.
- Final verification: `node --test src/scripts/*.test.mjs` passed 128/128; `env ASTRO_TELEMETRY_DISABLED=1 npm run build` passed with 6 pages generated, including `/blog/vibe-coding/`; `git diff --check` passed.
- Local/static QA: local static server HTTP checks passed for `/`, `/blog/vibe-coding-to-the-max/`, and `/Resume-BURAK-YUKSEL.pdf` with HTTP 200, and the PDF served as `application/pdf`.
- Rendered QA: Chrome/CDP QA passed against `http://127.0.0.1:4322/` for homepage boot/theme/lock, legacy resume redirect, legacy blog post deep link, mobile no-overflow, mobile touch lock/unlock, download confirmation and PDF path, and no console/runtime errors or warnings. Screenshots were saved under `/private/tmp/burak-phase8-rendered-qa/`.
- Post-Phase 8 mobile correction: Resume.exe no longer truncates or horizontally clips the long university title on phone/tablet layouts. Mobile rules now keep the app within the visible window body, wrap the selected label, Career Files row title, and inline preview title, and hide horizontal overflow inside detail content. Verification passed with the focused red/green resume regression, 129/129 script tests, `npm run build`, and Chrome/CDP QA at `430x932`; screenshot saved at `/private/tmp/burak-resume-mobile-qa/resume-mobile-university.png`.
- Post-Phase 8 preventive mobile hardening: Blog.exe and GitHub now have matching long-text guardrails for future post titles, tab titles, archive rows, article headings, status text, profile text, repository names/descriptions, metadata, and links. Verification used focused red/green CSS regressions plus Chrome/CDP QA at `430x932` with injected long strings; screenshots saved under `/private/tmp/burak-blog-github-longtext-qa/`.
- Post-Phase 8 short-phone Resume/Quiz correction: Resume.exe now lets the app fill the mobile OS window body instead of inheriting generic main-window padding, and Quiz.exe mobile summary screens top-align both Coach Console and Arcade Terminal results so score/progress lines are not cropped under the window topbar. Verification passed with focused red/green regressions, 133/133 script tests, `env ASTRO_TELEMETRY_DISABLED=1 npm run build`, and Chrome/CDP QA at `375x667`; screenshots saved under `/private/tmp/burak-resume-quiz-short-mobile-qa/`.
- Handoff notes: Phase 8 core is complete and Phase 8A localization is recorded below. Future work should be treated as content/translation copy tuning, not another structural phase, unless the user opens a new scope.

### Phase 8A: Session-only localization

- Status: implemented on 2026-06-29 after Phase 8 core and corrections.
- Scope decision: the top-bar language picker now supports English, Spanish, French, German, and Turkish. The old inert `EN` control is a real session-only language menu.
- Storage decision: language preference uses `sessionStorage` through `src/scripts/i18n.js`, with an in-memory fallback when storage is unavailable. No `localStorage`, cookies, backend, dependency, or deployment architecture change was added.
- Translation decision: website-owned UI and in-page content are localized through `src/scripts/i18n-data-en.js`, `src/scripts/i18n-data-es.js`, `src/scripts/i18n-data-fr.js`, `src/scripts/i18n-data-de.js`, and `src/scripts/i18n-data-tr.js`. Downloadable files/PDFs remain untouched and untranslated.
- Integration decision: `data-i18n`, `data-i18n-html`, and localized attribute hooks cover the OS shell, top bar, desktop/taskbar launchers, help/download dialogs, Resume.exe, Blog.exe, GitHub.exe, Downloads, Bin, Maze.exe, and Quiz.exe. Blog/resume HTML restores the original English markup when language returns to `EN`.
- Agent split: ES, FR, DE, and TR dictionaries were implemented by language-specific subagents, then integrated and corrected centrally for shared UI consistency.
- Verification: focused i18n red/green coverage was added in `src/scripts/i18n.test.mjs`; review-fix regressions now cover selected-language date formatting, translated Blog tags, translated window-control attributes, and Quiz feedback repainting during language changes. `node --test src/scripts/*.test.mjs` passed 147/147 after the review fixes; `env ASTRO_TELEMETRY_DISABLED=1 npm run build` passed with 6 generated pages; `git diff --check` passed.
- Rendered QA: Browser plugin was unavailable, so local static `dist/` plus headless Chrome/CDP was used against `http://127.0.0.1:4322/`. QA verified page identity, nonblank shell, no framework overlay, no console issues, EN initial state, ES/FR/DE/TR language switching, localized desktop/taskbar/window/app text, Turkish top-bar clock, Blog month/date/tag localization, Quiz question/answer/feedback repainting while feedback was open, session-only reload persistence on mobile, and zero horizontal overflow at `390x844`. Screenshots were saved at `/private/tmp/burak-phase8a-language-desktop-tr.png` and `/private/tmp/burak-phase8a-language-mobile-tr.png`; review-fix QA output came from `/private/tmp/burak-phase8a-review-fix-qa.mjs`.
- Post-Phase 8A language-menu pointer correction: the first language QA used DOM `.click()`, which missed a real hit-testing issue where the visible menu sat under `.os-desktop` for mouse/touch input. The top bar now establishes a high stacking layer, the language menu receives pointer events above OS icons/windows/taskbar, and lock/orientation overlays remain above the top bar. A focused regression now guards the language picker stacking rules, and Chrome/CDP coordinate QA verifies real desktop mouse and mobile touch selection.
- Asset boundary: `public/Resume-BURAK-YUKSEL.pdf` and other downloadable/binary assets were not mutated.
- Handoff notes: Phase 8A completes the requested localization scope. Any future language work should be copy-editing/translation-quality review or adding a new explicitly requested language, with downloadable PDFs still excluded unless the user asks otherwise.

## Running Log

- 2026-06-30: Post-Phase 8A language menu pointer/touch correction completed. Root cause was a stacking/hit-testing gap: the menu was visible but real pointer hits landed on `.os-desktop`, so keyboard activation worked while mouse/tap selection failed. Added a failing i18n/CSS regression first, raised the top-bar/language-menu stacking layer, preserved lock/orientation overlays above it, and made the menu explicitly pointer-interactive. Verification passed with focused i18n tests, full `node --test src/scripts/*.test.mjs` at 148/148, `env ASTRO_TELEMETRY_DISABLED=1 npm run build` with 6 pages, and headless Chrome/CDP coordinate QA against `http://127.0.0.1:4322/`: desktop mouse hit selected `DE`, mobile touch hit selected `TR`, both updated `document.lang`, session storage, toggle labels, and localized desktop labels. No downloadable PDF change was made.
- 2026-06-29: Phase 8A session-only localization completed. Added the real top-bar language menu for English, Spanish, French, German, and Turkish; introduced shared i18n helpers and per-language dictionaries; localized OS chrome, windows, dialogs, Resume.exe, Blog.exe, GitHub.exe, Downloads, Bin, Maze.exe, and Quiz.exe website text while leaving downloadable PDFs untouched. Language preference is session-only with storage fallback, and no dependency, backend, cookie, or localStorage behavior was added. Verification before docs passed with 140/140 script tests, `env ASTRO_TELEMETRY_DISABLED=1 npm run build` with 6 pages, `git diff --check`, and Chrome/CDP rendered QA against the built static site for desktop/mobile language switching, localized visible text, mobile no-overflow, and zero console issues. Screenshots were saved at `/private/tmp/burak-phase8a-language-desktop-tr.png` and `/private/tmp/burak-phase8a-language-mobile-tr.png`. No downloadable PDF change was made.
- 2026-06-29: Phase 8A final review fixes completed. Addressed reviewer findings by repainting Quiz.exe prompts/answers/feedback when language changes mid-feedback, dispatching the initial language event for dynamic text initialized before stored language application, formatting the top-bar clock plus Blog/GitHub dates from the selected language, localizing Blog tag labels including hidden post tags, and translating generic non-Blog window-control labels/tooltips. Verification passed with focused 118/118 review-fix tests, full 147/147 script tests, `env ASTRO_TELEMETRY_DISABLED=1 npm run build` with 6 pages, `git diff --check`, and Chrome/CDP rendered QA confirming Turkish clock/month/date/tags, Quiz feedback repaint, mobile Turkish session reload, no horizontal overflow, and zero console issues. No downloadable PDF change was made.
- 2026-06-29: Post-Phase 8 short-phone Resume.exe and Quiz.exe mobile correction completed. Root causes were Resume.exe missing the same mobile full-window body override already used by Blog/GitHub/games, and Quiz summary screens inheriting centered grid alignment on short phone viewports. Added failing regressions first, then made Resume.exe fill the mobile OS window body and top-aligned Coach Console plus Arcade Terminal summaries. Verification passed with `node --test src/scripts/os-window-manager.test.mjs`, `node --test src/scripts/quiz-game.test.mjs`, full `node --test src/scripts/*.test.mjs` at 133/133, `env ASTRO_TELEMETRY_DISABLED=1 npm run build` with 6 pages, no `public/Resume-BURAK-YUKSEL.pdf` diff, and Chrome/CDP QA at `375x667`; screenshots were saved under `/private/tmp/burak-resume-quiz-short-mobile-qa/`.
- 2026-06-29: Post-Phase 8 Blog.exe/GitHub long-text mobile hardening completed. Added mobile wrapping/overflow guardrails so future long Blog post titles, tab titles, archive titles/descriptions, tag labels, GitHub status/profile text, repo names/descriptions, repo metadata, and repo links do not recreate the Resume.exe horizontal clipping issue. Added failing CSS regressions first for Blog.exe and GitHub, then verified focused suites and Chrome/CDP rendered QA at `430x932` with injected long unbroken strings. Screenshots were saved under `/private/tmp/burak-blog-github-longtext-qa/`. No downloadable PDF change was made.
- 2026-06-29: Post-Phase 8 Resume.exe mobile/tablet title overflow correction completed. Root cause was mobile Resume.exe retaining full-bleed negative margins plus single-line selected/file-title text rules, causing the long university entry to truncate when collapsed and overflow when expanded. Added a failing CSS regression first, then changed phone/tablet Resume.exe layout to stay within the window body, wrap long selected/file/preview titles, and prevent horizontal detail overflow. Verification passed with `node --test src/scripts/resume-app.test.mjs`, `node --test src/scripts/*.test.mjs` with 129/129 tests, `npm run build` with 6 generated pages, and Chrome/CDP rendered QA at `430x932` against `http://127.0.0.1:4321/#app=resume`; screenshot saved at `/private/tmp/burak-resume-mobile-qa/resume-mobile-university.png`. No downloadable PDF change was made.
- 2026-06-29: Phase 8 core polish/accessibility/final verification completed. Added a session-only top-bar sun/moon theme toggle, power-button lock-screen easter egg with Enter and touch swipe unlock paths, modal/focus/focus-return improvements, reduced-motion-aware Blog/Resume scrolling, game shortcut blocking behind modals/lock, short-mobile Maze overlay top alignment, folder resize/orientation re-clamping, static noindex legacy route fallbacks into Burak OS, Blog.exe post deep links, and link/download hardening. Phase 8A localization was not started. Baseline before work passed with 105/105 Node tests and a 5-page build; final verification passed with 128/128 Node tests, `env ASTRO_TELEMETRY_DISABLED=1 npm run build` with 6 pages including `/blog/vibe-coding/`, `git diff --check`, static HTTP 200 checks for `/`, `/blog/vibe-coding-to-the-max/`, and `/Resume-BURAK-YUKSEL.pdf` with the PDF served as `application/pdf`, plus Chrome/CDP rendered QA against `http://127.0.0.1:4322/` with screenshots in `/private/tmp/burak-phase8-rendered-qa/`. The resume PDF was not mutated.
- 2026-06-28: Phase 7C combined game integration and accessibility polish completed. Tightened shared OS game focus behavior so Maze.exe and Quiz.exe focus their first meaningful control on launch, return focus to their Bin file on close/Exit to Bin, and keep Bin/taskbar state restored. The shared Help dialog now traps Tab/Shift+Tab and restores focus to the opener. Maze mobile D-pad layout now keeps spatial placement on narrow viewports even when a browser reports fine-pointer input. Added red/green regression tests; the focused combined suite passed with 105 tests, `git diff --check` passed, `env ASTRO_TELEMETRY_DISABLED=1 npm run build` passed, no lint script exists, and headless Chrome CDP QA passed at 1440x900, 1280x800, 820x1180, 390x844, and 375x667 with screenshots in `/private/tmp/burak-phase7c-qa-rerun`. No Phase 8 work, new dependency, Playwright setup, gameplay/content change, unrelated app change, backend behavior, route cleanup, or PDF change was added.
- 2026-06-28: Phase 7B mobile start-screen correction completed. The Quiz start screen now top-aligns its content on mobile so the `Recovered training program` eyebrow is visible instead of clipped above the scroll area. Added a regression test for mobile start-screen alignment; the focused combined suite passed with 101 tests, `git diff --check` passed, `env ASTRO_TELEMETRY_DISABLED=1 npm run build` passed, and headless Chrome CDP QA at 390x844 and 375x667 confirmed the eyebrow is inside the visible viewport with screenshots in `/private/tmp/burak-quiz-start-crop-qa`. No Maze gameplay, Phase 7C, unrelated app, dependency, backend, route cleanup, or PDF changes were added.
- 2026-06-28: Phase 7B answer-randomization correction completed. Runtime Quiz questions now shuffle visible A-D answer labels in both Arcade and Coach while preserving the source correct answer internally, so the authored question bank can remain readable without making B a positional cue. Added red/green tests for remapping, Arcade correctness, Coach correctness, and rerandomization safety. The focused combined suite passed with 100 tests, `git diff --check` passed, `env ASTRO_TELEMETRY_DISABLED=1 npm run build` passed, and headless Chrome CDP QA at 390x844 confirmed varied correct labels and accepted correct clicks in both modes. No Maze gameplay, Phase 7C, unrelated app, dependency, backend, route cleanup, or PDF changes were added.
- 2026-06-28: Phase 7B small-screen Quiz correction completed. Answer buttons now content-size vertically and wrap long answer text inside their own boxes on narrow screens. Answer feedback remains below answer D and scrolls into view after selection, preventing selected correct/incorrect answer states from covering explanations. Added a regression test for mobile answer/feedback layout; the focused combined suite passed with 98 tests, `git diff --check` passed, `env ASTRO_TELEMETRY_DISABLED=1 npm run build` passed, and headless Chrome CDP QA passed for Coach and Arcade flows at 390x844 and 375x667 with screenshots in `/private/tmp/burak-quiz-small-screen-fix-qa`. No Maze gameplay, Phase 7C, unrelated app, dependency, backend, route cleanup, or PDF changes were added.
- 2026-06-28: Phase 7B Agile/Scrum Quiz game completed. Added Bin-only `Quiz.exe` beside Maze.exe, a fullscreen Burak OS game window, Arcade Terminal mode, Coach Console mode, a 36-question static Agile delivery bank, local Quiz progress/high-score persistence with fallback, Quiz-only reset confirmation, answer feedback with explanations and source links where applicable, keyboard shortcuts `1-4` and `A-D`, and responsive terminal styling. Final verification passed with 97 focused Node tests, `git diff --check`, `env ASTRO_TELEMETRY_DISABLED=1 npm run build`, and local headless Chrome CDP rendered QA at 1440x900, 1280x800, 820x1180, 390x844, and 375x667 with screenshots in `/private/tmp/burak-quiz-phase7b-qa`. Maze gameplay, Phase 7C, Phase 8 work, new dependencies, route cleanup, backend behavior, unrelated app changes, and PDF changes were not started.
- 2026-06-28: Phase 7A Maze tuning correction completed. Dynamic gateway shifts now begin at Level 3 and run as local paired alterations that close one safe nearby open internal gateway while opening one safe nearby closed internal gateway; unsafe local events are postponed and the exterior exit remains untouched. Monsters now become available at Level 6 and Level 11, spawn from the original central area only after countdown once the player is at least five graph/path cells from that central spawn area, and use progressively stronger route/memory/coordination behavior without uncapped speed. Maze onboarding and Help copy now reflect Level 3, Level 6, and Level 11 thresholds. Red/green tests were added first, `node --test src/scripts/maze-game.test.mjs` passed with 19 tests, `node --test src/scripts/os-window-manager.test.mjs` passed with 23 tests, the combined focused suite passed with 80 tests, `git diff --check` passed, no lint script exists, `env ASTRO_TELEMETRY_DISABLED=1 npm run build` passed, and headless Chrome CDP QA passed at 1440x900, 1280x800, 820x1180, 390x844, and 375x667 with screenshots in `/private/tmp/burak-maze-phase7a-tuning-qa`. Phase 7B quiz, Phase 7C integration, new dependencies, Playwright installation, unrelated OS/Bin/Downloads/GitHub changes, route cleanup, and PDF changes were not started.
- 2026-06-28: Phase 7A Maze visual/onboarding/audio correction completed. The exit is now a real exterior wall opening with one outward boundary segment removed and a small reduced-motion-aware doorway marker outside it; dynamic gateways stay internal and cannot affect the exit. Added start-screen `HOW TO PLAY`, expanded Maze help, optional original procedural Web Audio music, shared start/game-over `MUSIC: ON/OFF` toggles, `burakOs.mazeMusicEnabled.v1` persistence with memory fallback, and idempotent audio lifecycle cleanup for close, Exit to Bin, app replacement, page hide, and pagehide. `node --test src/scripts/maze-game.test.mjs` passed with 13 tests, `node --test src/scripts/os-window-manager.test.mjs` passed with 23 tests, the combined focused suite passed with 74 tests, `git diff --check` passed, no lint script exists, `env ASTRO_TELEMETRY_DISABLED=1 npm run build` passed, and headless Chrome CDP QA passed at 1440x900, 1280x800, 820x1180, 390x844, and 375x667. Audio lifecycle was instrumented in headless Chrome; subjective music balancing remains a by-ear follow-up if desired. Phase 7B quiz, Phase 7C integration, new dependencies, Playwright, unrelated OS/Bin/Downloads/GitHub changes, route cleanup, and PDF changes were not started.
- 2026-06-27: Phase 7A Maze game completed. Added Bin-only `Maze.exe`, a fullscreen Burak OS game window, canvas-rendered monochrome 8-bit maze gameplay, seeded solvable maze generation, reachable collectibles, scoring, local high-score fallback, countdown flow, dynamic gateway safety rules from Level 6, monster difficulty thresholds from Level 11/16/21, keyboard and touch controls, close/page-hide lifecycle cleanup, and focused tests. `node --test src/scripts/maze-game.test.mjs src/scripts/os-window-manager.test.mjs src/scripts/blog-app.test.mjs src/scripts/resume-app.test.mjs src/scripts/github-app.test.mjs` passed with 69 tests, `git diff --check` passed, `env ASTRO_TELEMETRY_DISABLED=1 npm run build` passed, and headless Chrome CDP rendered QA passed on desktop and mobile. Phase 7B quiz, Phase 7C integration, Phase 8 work, new dependencies, route cleanup, folder dragging changes, Downloads changes, GitHub changes, and PDF changes were not started.
- 2026-06-27: Phase 7 Downloads and Bin completed. Added real Downloads/Bin folder contents, OS-local resume download confirmation with desktop double-click and touch single-tap activation, bounded top-bar dragging with front-on-press z-order, and responsive folder adjustments to keep folders clear of the taskbar. `public/Resume-BURAK-YUKSEL.pdf` was left unchanged and linked at the existing public path. `node --test src/scripts/os-window-manager.test.mjs src/scripts/blog-app.test.mjs src/scripts/resume-app.test.mjs src/scripts/github-app.test.mjs` passed with 60 tests, `env ASTRO_TELEMETRY_DISABLED=1 npm run build` passed, and headless Chrome CDP rendered QA passed at narrow responsive, 1280x800 desktop, and 390x844 phone viewports. No Phase 8 theme/game work, new dependency, route cleanup, backend behavior, or PDF asset change was added.
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

- Implement the complete design of Bin folder window and then implement it, empty for now but ready for future easter eggs.
- Implement the complete design of the Downloads folder window and then implement it.
- Add downloadable resume/CV file.
- Add helper text telling users to click the file to download.
- Add folder help dialogs.
- Confirm taskbar does not shrink for folders.
- Download and Bin folders can be dragged and moved across the screen (in mobile this will be achieved similarly by holding down the top bar and dragging across the screen).
- Phase 7A: Maze game.
- Phase 7B: Agile/Scrum quiz game.
- Phase 7C: Combined integration and polish only if required after both games are complete.
- Keep reviewing the Revamp Master Plan / Source of Truth to give you a deeper understanding of what needs to be done and review in-depth the inputted commentary in the terminal.
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
- Add light and dark mode to the top bar next to EN, light will be sun icon, dark is moon, add some sort of animation to this icon when it is toggled.

NOTE: Codex must not attempt the full revamp in one pass. It should work in phases, update this file after each phase, and run build/lint checks before marking a phase complete. If no lint script exists, record that clearly rather than inventing one.
