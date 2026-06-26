# Repository Guidelines

## Project Structure & Module Organization
This is an Astro 5 static personal website. File-based routes live in `src/pages`, including the home page, resume page, blog index, and individual blog posts. Shared page chrome is in `src/layouts/BaseLayout.astro`. Page-specific styles are grouped in `src/styles`, while content data lives in `src/content`: blog posts are Markdown files under `src/content/blog`, and resume timeline entries are stored in `src/content/timeline.json`. Static assets, the downloadable resume PDF, favicon/logo files, and `CNAME` live in `public`. GitHub Pages deployment is configured in `.github/workflows/deploy.yaml`.

## Build, Test, and Development Commands
- `npm install` installs dependencies from `package-lock.json`.
- `npm run dev` starts the Astro dev server, usually at `http://localhost:4321`.
- `npm run build` builds the static site into `dist/` and validates Astro content.
- `npm run preview` serves the production build locally for final checks.
- `npm run astro` runs the Astro CLI for framework-specific tasks.

## Coding Style & Naming Conventions
Use two-space indentation in Astro, TypeScript, CSS, JSON, and Markdown frontmatter. Prefer single quotes in TypeScript and Astro frontmatter code. Keep route filenames aligned with Astro conventions, such as `index.astro` for route roots and `[slug].astro` for dynamic blog routes. Blog posts should use kebab-case filenames and include frontmatter matching `src/content/config.ts`: `title`, `description`, `pubDate`, and `tags`, with `canonicalSlug` or `updatedDate` when needed. Keep generated output such as `dist/` and `.astro/` out of commits.

## Testing Guidelines
There is no unit, lint, or end-to-end test script currently defined. Treat `npm run build` as the required verification step before opening a pull request. For visual or interaction changes, also run `npm run preview` and manually check desktop and mobile widths, especially the resume timeline, blog modal/share behavior, and navigation.

## Commit & Pull Request Guidelines
Recent history uses short, descriptive commit subjects such as `Fix timeline rendering issues...` and `Update blog posts...`; follow that style and name the affected area when helpful. Pull requests should include a summary, validation performed, linked issue if one exists, and screenshots or short screen recordings for UI changes. Note any content updates separately from code changes because source code and written content use different licenses.

## Agent-Specific Instructions
Read `BRAIN.md` before broad changes; it records current project context, risks, and handoff notes. Keep changes narrowly scoped and preserve the fully static architecture unless the task explicitly asks otherwise.
