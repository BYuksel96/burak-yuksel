# burak-yuksel

Source for Burak Yuksel's static personal portfolio at `burakyuksel.dev`.

The site is now a one-page Astro 5 portfolio app styled as `Burak OS`: a browser-local desktop shell with internal apps, folders, games, theme controls, and legacy URL fallbacks. It stays fully static for GitHub Pages hosting; there is no backend, database, authentication, or runtime server.

## Experience

- `src/pages/index.astro` boots the Burak OS shell.
- `Resume.exe` presents the resume timeline from `src/content/timeline.json`.
- `Blog.exe` presents Markdown posts from `src/content/blog` in internal tabs.
- `GitHub.exe` fetches public repository data from GitHub without tokens.
- `Downloads` contains the resume PDF behind an OS-local confirmation flow.
- `Bin` contains browser-only easter-egg games: `Maze.exe` and `Quiz.exe`.
- `/resume/`, `/blog/`, and `/blog/[slug]/` are static `noindex` fallback routes into Burak OS. Blog post routes deep-link into `Blog.exe` and open the matching post tab.
- External profile/repository links open in real browser tabs; downloadable assets live under `public/`.

## Project Structure

```text
/
├── public/                  # Static assets, CNAME, favicon/logo, resume PDF
├── src/
│   ├── components/os/       # Burak OS shell, apps, folders, dialogs, games
│   ├── content/
│   │   ├── blog/            # Markdown blog posts
│   │   ├── config.ts        # Astro content schema
│   │   └── timeline.json    # Resume timeline data
│   ├── layouts/             # Shared BaseLayout
│   ├── pages/               # Static routes and legacy fallbacks
│   ├── scripts/             # Browser behavior and focused node tests
│   └── styles/              # OS/app/page styles
├── .github/workflows/       # GitHub Pages deployment
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Commands

- `npm install` - install dependencies from `package-lock.json`.
- `npm run dev` - start Astro locally, usually at `http://localhost:4321`.
- `npm run build` - build the static site into `dist/` and validate content.
- `npm run preview` - preview the production build locally.
- `npm run astro` - run Astro CLI commands.

Focused node tests live in `src/scripts/*.test.mjs` and can be run with `node --test src/scripts/*.test.mjs`.

## Content

Blog posts are Markdown files in `src/content/blog` with frontmatter validated by `src/content/config.ts`. Resume timeline content is stored in `src/content/timeline.json`. The downloadable resume is the static `public/Resume-BURAK-YUKSEL.pdf` asset.

## Deployment

The production site is built as static output and deployed to GitHub Pages through `.github/workflows/deploy.yaml`. `astro.config.mjs` is configured for the custom domain root deployment, and `public/CNAME` contains `burakyuksel.dev`.

## Licensing

Source code and configuration are licensed under the MIT License in `LICENSE`.

Written content and original authored media are licensed separately under Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International in `CONTENT-LICENSE`.

© 2026 Burak Yuksel
