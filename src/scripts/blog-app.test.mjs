import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import * as blogApp from './blog-app.js';
import {
  ARCHIVE_TAB_ID,
  buildBlogDisplayAddress,
  buildBlogPath,
  buildLinkedInShareUrl,
  createInitialBlogTabState,
  formatBlogDate,
  groupBlogPostsByYearMonth,
  normalizeBlogTag,
  reduceBlogTabState,
  sortBlogPostsLatestFirst,
  toAbsoluteShareUrl,
} from './blog-app.js';

const readBlogAppSource = () => readFileSync(new URL('../components/os/BlogApp.astro', import.meta.url), 'utf8');
const readBlogAppScript = () => readFileSync(new URL('./blog-app.js', import.meta.url), 'utf8');
const readBlogAppStyles = () => readFileSync(new URL('../styles/blog-app.css', import.meta.url), 'utf8');
const readResumePageSource = () => readFileSync(new URL('../pages/resume.astro', import.meta.url), 'utf8');
const readBlogIndexPageSource = () => readFileSync(new URL('../pages/blog/index.astro', import.meta.url), 'utf8');
const readBlogSlugPageSource = () => readFileSync(new URL('../pages/blog/[slug].astro', import.meta.url), 'utf8');

test('groups posts by UTC year and month with latest posts first', () => {
  const posts = sortBlogPostsLatestFirst([
    { id: 'older', pubDate: new Date('2025-12-31T23:00:00.000Z') },
    { id: 'latest', pubDate: new Date('2026-02-14T00:00:00.000Z') },
    { id: 'same-month', pubDate: new Date('2026-02-11T00:00:00.000Z') },
  ]);

  const groups = groupBlogPostsByYearMonth(posts);

  assert.deepEqual(
    groups.map((year) => ({
      year: year.year,
      months: year.months.map((month) => ({
        label: month.monthLabel,
        posts: month.posts.map((post) => post.id),
      })),
    })),
    [
      { year: 2026, months: [{ label: 'February', posts: ['latest', 'same-month'] }] },
      { year: 2025, months: [{ label: 'December', posts: ['older'] }] },
    ],
  );
});

test('builds canonical blog paths from Astro base without double slashes', () => {
  assert.equal(buildBlogPath('/', 'hello-world'), '/blog/hello-world/');
  assert.equal(buildBlogPath('/portfolio/', '/vibe-coding-to-the-max/'), '/portfolio/blog/vibe-coding-to-the-max/');
  assert.equal(buildBlogPath('', 'post'), '/blog/post/');
});

test('builds internal browser display addresses from preserved blog paths', () => {
  assert.equal(buildBlogDisplayAddress('/blog/hello-world/'), 'burak-os://blog/hello-world/');
  assert.equal(buildBlogDisplayAddress('/portfolio/blog/post/'), 'burak-os://portfolio/blog/post/');
  assert.equal(buildBlogDisplayAddress(''), 'burak-os://blog/archive');
});

test('formats blog dates using the active language locale', () => {
  const date = new Date('2026-06-20T14:05:00Z');

  assert.equal(formatBlogDate(date, 'long', 'en'), 'June 20, 2026');
  assert.equal(formatBlogDate(date, 'row', 'en'), 'Jun 20');
  assert.match(formatBlogDate(date, 'long', 'tr'), /Haziran|Haz/);
  assert.match(formatBlogDate(date, 'row', 'de'), /Juni|Jun/);
});

test('resolves canonical and entry slugs to existing Blog.exe post uids', () => {
  const records = [
    {
      slug: 'vibe-coding',
      canonicalSlug: 'vibe-coding-to-the-max',
      canonicalPath: '/blog/vibe-coding-to-the-max/',
    },
    {
      slug: 'hello-world',
      canonicalPath: '/blog/hello-world/',
    },
  ];

  assert.equal(blogApp.resolveBlogDeepLinkUid?.(records, 'vibe-coding-to-the-max'), 'vibe-coding');
  assert.equal(blogApp.resolveBlogDeepLinkUid?.(records, '/blog/vibe-coding/'), 'vibe-coding');
  assert.equal(blogApp.resolveBlogDeepLinkUid?.(records, 'https://burakyuksel.dev/blog/hello-world/'), 'hello-world');
  assert.equal(blogApp.resolveBlogDeepLinkUid?.(records, '#blog=missing-post'), '');
});

test('builds reducer actions for Blog.exe deep links when a post exists', () => {
  const records = [{ slug: 'vibe-coding', canonicalSlug: 'vibe-coding-to-the-max' }];
  const action = blogApp.createBlogDeepLinkOpenAction?.(records, '#blog=vibe-coding-to-the-max');

  assert.deepEqual(action, { type: 'open-post', id: 'vibe-coding' });
  assert.equal(blogApp.createBlogDeepLinkOpenAction?.(records, '#blog=missing-post'), null);
});

test('Blog.exe consumes startup and custom-event deep links after initialization', () => {
  const script = readBlogAppScript();

  assert.match(script, /data-blog-deep-link/);
  assert.match(script, /openBlogDeepLink/);
  assert.match(script, /createBlogDeepLinkOpenAction\(root,\s*deepLinkSlug\)/);
  assert.match(script, /blog-app:open-deep-link/);
  assert.match(script, /delete root\.dataset\.blogDeepLink/);
});

test('tab reducer keeps archive permanent and prevents duplicate post tabs', () => {
  let state = createInitialBlogTabState();

  state = reduceBlogTabState(state, { type: 'open-post', id: 'hello-world' });
  state = reduceBlogTabState(state, { type: 'open-post', id: 'vibe-coding' });
  state = reduceBlogTabState(state, { type: 'open-post', id: 'hello-world' });
  state = reduceBlogTabState(state, { type: 'close-tab', id: ARCHIVE_TAB_ID });

  assert.equal(state.activeTabId, 'hello-world');
  assert.deepEqual(state.openPostIds, ['hello-world', 'vibe-coding']);
});

test('closing inactive tabs does not activate them first', () => {
  let state = createInitialBlogTabState();
  state = reduceBlogTabState(state, { type: 'open-post', id: 'hello-world' });
  state = reduceBlogTabState(state, { type: 'open-post', id: 'vibe-coding' });
  state = reduceBlogTabState(state, { type: 'activate-tab', id: 'hello-world' });

  state = reduceBlogTabState(state, { type: 'close-tab', id: 'vibe-coding' });

  assert.equal(state.activeTabId, 'hello-world');
  assert.deepEqual(state.openPostIds, ['hello-world']);
});

test('closing the active post tab activates a sensible neighbour before archive', () => {
  let state = createInitialBlogTabState();
  state = reduceBlogTabState(state, { type: 'open-post', id: 'first' });
  state = reduceBlogTabState(state, { type: 'open-post', id: 'second' });
  state = reduceBlogTabState(state, { type: 'open-post', id: 'third' });
  state = reduceBlogTabState(state, { type: 'activate-tab', id: 'second' });

  state = reduceBlogTabState(state, { type: 'close-tab', id: 'second' });
  assert.equal(state.activeTabId, 'third');

  state = reduceBlogTabState(state, { type: 'close-tab', id: 'third' });
  assert.equal(state.activeTabId, 'first');

  state = reduceBlogTabState(state, { type: 'close-tab', id: 'first' });
  assert.equal(state.activeTabId, ARCHIVE_TAB_ID);
});

test('back-to-blog closes the current post and returns to archive', () => {
  let state = createInitialBlogTabState();
  state = reduceBlogTabState(state, { type: 'open-post', id: 'hello-world' });
  state = reduceBlogTabState(state, { type: 'back-to-archive', id: 'hello-world' });

  assert.equal(state.activeTabId, ARCHIVE_TAB_ID);
  assert.deepEqual(state.openPostIds, []);
});

test('tag views replace the current post content without opening another tab', () => {
  let state = createInitialBlogTabState();
  state = reduceBlogTabState(state, { type: 'open-post', id: 'vibe-coding' });
  state = reduceBlogTabState(state, { type: 'show-tag', id: 'vibe-coding', tag: 'Vibe Coding' });

  assert.equal(state.activeTabId, 'vibe-coding');
  assert.deepEqual(state.openPostIds, ['vibe-coding']);
  assert.deepEqual(state.tagViews, {
    'vibe-coding': { key: 'vibe-coding', label: 'Vibe Coding' },
  });

  state = reduceBlogTabState(state, { type: 'clear-tag', id: 'vibe-coding' });

  assert.equal(state.activeTabId, 'vibe-coding');
  assert.deepEqual(state.openPostIds, ['vibe-coding']);
  assert.deepEqual(state.tagViews, {});
});

test('closing a post tab clears its tag results view', () => {
  let state = createInitialBlogTabState();
  state = reduceBlogTabState(state, { type: 'open-post', id: 'hello-world' });
  state = reduceBlogTabState(state, { type: 'show-tag', id: 'hello-world', tag: 'blog' });
  state = reduceBlogTabState(state, { type: 'close-tab', id: 'hello-world' });

  assert.equal(state.activeTabId, ARCHIVE_TAB_ID);
  assert.deepEqual(state.openPostIds, []);
  assert.deepEqual(state.tagViews, {});
});

test('normalizes blog tags for same-tab tag result matching', () => {
  assert.deepEqual(normalizeBlogTag('Vibe Coding'), { key: 'vibe-coding', label: 'Vibe Coding' });
  assert.deepEqual(normalizeBlogTag('  AI  '), { key: 'ai', label: 'AI' });
});

test('share helpers convert canonical paths to absolute copy and LinkedIn URLs', () => {
  const absolute = toAbsoluteShareUrl('/blog/hello-world/', 'https://example.test');
  const linkedIn = buildLinkedInShareUrl(absolute, 'Read this');

  assert.equal(absolute, 'https://example.test/blog/hello-world/');
  assert.match(linkedIn, /^https:\/\/www\.linkedin\.com\/feed\/\?shareActive=true&text=/);
  assert.match(decodeURIComponent(linkedIn), /Read this https:\/\/example\.test\/blog\/hello-world\//);
});

test('BlogApp LinkedIn sharing opens a safe external browser tab with the canonical post URL', () => {
  const script = readBlogAppScript();
  const linkedIn = new URL(buildLinkedInShareUrl('https://burakyuksel.dev/blog/hello-world/', 'Read this'));

  assert.equal(linkedIn.origin, 'https://www.linkedin.com');
  assert.equal(linkedIn.pathname, '/feed/');
  assert.equal(linkedIn.searchParams.get('shareActive'), 'true');
  assert.equal(linkedIn.searchParams.get('text'), 'Read this https://burakyuksel.dev/blog/hello-world/');
  assert.match(script, /const shareUrl = toAbsoluteShareUrl\(canonicalPath,\s*window\.location\.origin\);/);
  assert.match(script, /window\.open\(buildLinkedInShareUrl\(shareUrl,\s*translate\('blog\.shareCopy',\s*getActiveLanguage\(\)\)\),\s*'_blank',\s*'noopener,noreferrer'\);/);
});

test('BlogApp markup uses proper tab semantics and separate close controls', () => {
  const source = readBlogAppSource();

  assert.match(source, /role="tablist"/);
  assert.match(source, /role="tab"/);
  assert.match(source, /role="tabpanel"/);
  assert.match(source, /aria-controls=\{`blog-panel-\$\{post\.uid\}`\}/);
  assert.match(source, /aria-labelledby=\{`blog-tab-\$\{post\.uid\}`\}/);
  assert.match(source, /data-blog-close-tab/);
  assert.match(source, /Close .* tab/);
  assert.doesNotMatch(source, /<iframe/i);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
});

test('BlogApp chrome replaces duplicate OS header and hides post count indicators', () => {
  const source = readBlogAppSource();

  assert.match(source, /data-blog-window-chrome/);
  assert.match(source, /data-os-window-close/);
  assert.match(source, /data-os-window-help/);
  assert.doesNotMatch(source, /blog-app__count/);
  assert.doesNotMatch(source, /indexed/);
});

test('BlogApp renders clickable tags and same-tab tag result panels', () => {
  const source = readBlogAppSource();

  assert.match(source, />Tags:\s*</);
  assert.match(source, /data-blog-open-tag/);
  assert.match(source, /data-i18n=\{`blog\.tagsByKey\.\$\{tag\.key\}`\}/);
  assert.match(source, /data-blog-tag-results/);
  assert.match(source, /data-blog-clear-tag/);
  assert.match(source, /data-blog-open-post/);
  assert.doesNotMatch(source, /post\.tags\.join/);
});

test('BlogApp marks date surfaces for language reformatting', () => {
  const source = readBlogAppSource();
  const script = readBlogAppScript();

  assert.match(source, /data-blog-date=\{post\.dateIso\}/);
  assert.match(source, /data-blog-month-label/);
  assert.match(source, /data-blog-month-section/);
  assert.match(script, /updateLocalizedBlogDates/);
  assert.match(script, /formatBlogDate\(dateValue,\s*variant,\s*getActiveLanguage\(\)\)/);
});

test('BlogApp places Back to Posts and Share actions in the article head and footer', () => {
  const source = readBlogAppSource();

  assert.match(source, /Back to Posts/);
  assert.doesNotMatch(source, /Back to Blog/);
  assert.match(source, /blog-app__article-head[\s\S]*data-blog-back[\s\S]*data-blog-share/);
  assert.match(source, /blog-app__article-foot[\s\S]*data-blog-back[\s\S]*data-blog-share/);
});

test('BlogApp share menus pair Copy Link with a chain icon', () => {
  const source = readBlogAppSource();
  const copyActions = [...source.matchAll(/data-blog-share-action="copy"[\s\S]*?Copy Link/g)];

  assert.equal(copyActions.length, 2);
  copyActions.forEach((action) => {
    assert.match(action[0], /blog-app__share-icon--copy/);
    assert.match(action[0], /aria-hidden="true"/);
  });
  assert.match(source, /blog-app__share-icon--linkedin[\s\S]*Share on LinkedIn/);
});

test('BlogApp CSS is namespaced and covers Markdown article elements', () => {
  const styles = readBlogAppStyles();

  assert.match(styles, /\.blog-app\s/);
  assert.match(styles, /\.blog-app__article-body\s+h2/);
  assert.match(styles, /\.blog-app__article-body\s+p/);
  assert.match(styles, /\.blog-app__article-body\s+ul/);
  assert.match(styles, /\.blog-app__article-body\s+blockquote/);
  assert.match(styles, /\.blog-app__article-body\s+pre/);
  assert.match(styles, /\.blog-app__article-body\s+code/);
  assert.match(styles, /\.blog-app__tabs/);
  assert.match(styles, /overflow-x:\s*auto/);
});

test('BlogApp article card stays framed while only the article body scrolls', () => {
  const styles = readBlogAppStyles();

  assert.match(styles, /\.blog-app__article-scroll\s*\{[\s\S]*overflow:\s*hidden;/);
  assert.match(styles, /\.blog-app__article\s*\{[\s\S]*width:\s*min\(100%,\s*calc\(50% \+ 36rem\)\);/);
  assert.match(styles, /\.blog-app__article\s*\{[\s\S]*height:\s*100%;[\s\S]*grid-template-rows:\s*auto minmax\(0,\s*1fr\);[\s\S]*overflow:\s*hidden;/);
  assert.match(styles, /\.blog-app__article-body\s*\{[\s\S]*overflow:\s*auto;/);
});

test('BlogApp mobile layout fills the post panel and keeps article body reachable', () => {
  const styles = readBlogAppStyles();

  assert.match(styles, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.blog-app__post-view\s*\{[\s\S]*display:\s*grid;/);
  assert.match(styles, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.blog-app__panel--post\s*\{[\s\S]*padding:\s*0;[\s\S]*border-radius:\s*0;[\s\S]*background:\s*transparent;[\s\S]*box-shadow:\s*none;/);
  assert.match(styles, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.blog-app__post-view,[\s\S]*\.blog-app__article-scroll\s*\{[\s\S]*width:\s*100%;/);
  assert.match(styles, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.blog-app__article-scroll\s*\{[\s\S]*background:\s*var\(--blog-panel\);/);
  assert.match(styles, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.blog-app__article-scroll\s*\{[\s\S]*padding:\s*0;/);
  assert.match(styles, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.blog-app__article\s*\{[\s\S]*width:\s*100%;/);
  assert.match(styles, /@media\s*\(max-width:\s*420px\)\s*and\s*\(max-height:\s*760px\)\s*\{[\s\S]*\.blog-app__article-scroll\s*\{[\s\S]*overflow:\s*auto;/);
  assert.match(styles, /@media\s*\(max-width:\s*420px\)\s*and\s*\(max-height:\s*760px\)\s*\{[\s\S]*\.blog-app__article\s*\{[\s\S]*height:\s*auto;[\s\S]*display:\s*block;/);
  assert.match(styles, /@media\s*\(max-width:\s*420px\)\s*and\s*\(max-height:\s*760px\)\s*\{[\s\S]*\.blog-app__article-head\s*\{[\s\S]*max-height:\s*none;[\s\S]*overflow:\s*visible;/);
  assert.match(styles, /@media\s*\(max-width:\s*420px\)\s*and\s*\(max-height:\s*760px\)\s*\{[\s\S]*\.blog-app__article-body\s*\{[\s\S]*overflow:\s*visible;/);
});

test('BlogApp mid-width mobile keeps header post actions grouped', () => {
  const styles = readBlogAppStyles();

  assert.match(styles, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.blog-app__post-actions\s*\{[\s\S]*justify-self:\s*start;[\s\S]*justify-content:\s*flex-start;/);
  assert.match(styles, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.blog-app__article-head\s+\.blog-app__share-wrap\s*\{[\s\S]*position:\s*static;/);
  assert.match(styles, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.blog-app__article-head\s+\.blog-app__share-menu\s*\{[\s\S]*left:\s*0;[\s\S]*right:\s*auto;/);
  assert.match(styles, /@media\s*\(max-width:\s*420px\)\s*\{[\s\S]*\.blog-app__article-head\s+\.blog-app__post-actions\s*\{[\s\S]*justify-self:\s*stretch;/);
});

test('BlogApp touch devices show action buttons in active colours and overlay bottom share menus', () => {
  const styles = readBlogAppStyles();

  assert.match(styles, /@media\s*\(hover:\s*none\),\s*\(pointer:\s*coarse\)\s*\{[\s\S]*\.blog-app__back,[\s\S]*\.blog-app__icon-action--back\s*\{[\s\S]*color:\s*var\(--blog-green\);/);
  assert.match(styles, /@media\s*\(hover:\s*none\),\s*\(pointer:\s*coarse\)\s*\{[\s\S]*\.blog-app__share,[\s\S]*\.blog-app__icon-action--share\s*\{[\s\S]*color:\s*var\(--os-amber\);/);
  assert.match(styles, /@media\s*\(hover:\s*none\),\s*\(pointer:\s*coarse\)\s*\{[\s\S]*\.blog-app__article-foot\s*\{[\s\S]*width:\s*100%;[\s\S]*flex-wrap:\s*nowrap;/);
  assert.match(styles, /@media\s*\(hover:\s*none\),\s*\(pointer:\s*coarse\)\s*\{[\s\S]*\.blog-app__share-wrap--icon\s*\{[\s\S]*flex:\s*0 0 auto;/);
  assert.match(styles, /@media\s*\(hover:\s*none\),\s*\(pointer:\s*coarse\)\s*\{[\s\S]*\.blog-app__share-wrap--icon\s+\.blog-app__share-menu--bottom\s*\{[\s\S]*position:\s*absolute;[\s\S]*left:\s*0;[\s\S]*right:\s*0;[\s\S]*width:\s*auto;/);
  assert.doesNotMatch(styles, /\.blog-app__share-wrap--icon\s+\.blog-app__share-menu--bottom\s*\{[^}]*position:\s*static;/);
});

test('BlogApp short-phone share menus overlay within the article instead of shifting layout', () => {
  const styles = readBlogAppStyles();

  assert.match(styles, /@media\s*\(max-width:\s*420px\)\s*\{[\s\S]*\.blog-app__article-head,[\s\S]*\.blog-app__article-foot\s*\{[\s\S]*position:\s*relative;/);
  assert.match(styles, /@media\s*\(max-width:\s*420px\)\s*\{[\s\S]*\.blog-app__article-foot\s*\{[\s\S]*width:\s*100%;/);
  assert.match(styles, /@media\s*\(max-width:\s*420px\)\s*\{[\s\S]*\.blog-app__article-head\s+\.blog-app__post-actions\s*\{[\s\S]*position:\s*static;/);
  assert.match(styles, /@media\s*\(max-width:\s*420px\)\s*\{[\s\S]*\.blog-app__article-head\s+\.blog-app__share-wrap,[\s\S]*\.blog-app__article-foot\s+\.blog-app__share-wrap--icon\s*\{[\s\S]*position:\s*static;/);
  assert.match(styles, /@media\s*\(max-width:\s*420px\)\s*\{[\s\S]*\.blog-app__article-foot\s+\.blog-app__share-wrap--icon\s*\{[\s\S]*flex:\s*0 0 auto;/);
  assert.match(styles, /@media\s*\(max-width:\s*420px\)\s*\{[\s\S]*\.blog-app__article-head\s+\.blog-app__share-menu\s*\{[\s\S]*position:\s*absolute;[\s\S]*left:\s*0\.68rem;[\s\S]*right:\s*0\.68rem;[\s\S]*width:\s*auto;/);
  assert.match(styles, /@media\s*\(max-width:\s*420px\)\s*\{[\s\S]*\.blog-app__article-foot\s+\.blog-app__share-menu--bottom\s*\{[\s\S]*position:\s*absolute;[\s\S]*left:\s*0;[\s\S]*right:\s*0;[\s\S]*width:\s*auto;/);
});

test('BlogApp desktop bottom share menu opens from the back-button edge', () => {
  const styles = readBlogAppStyles();

  assert.match(styles, /\.blog-app__article-foot\s+\.blog-app__share-wrap--icon\s*\{[\s\S]*position:\s*static;/);
  assert.match(styles, /\.blog-app__article-foot\s+\.blog-app__share-menu--bottom\s*\{[\s\S]*left:\s*0;[\s\S]*right:\s*auto;/);
});

test('BlogApp reveals opened share menus inside scrollable post panels', () => {
  const script = readBlogAppScript();

  assert.match(script, /shareMenu\.scrollIntoView/);
  assert.match(script, /block:\s*'nearest'/);
  assert.match(script, /inline:\s*'nearest'/);
});

test('BlogApp smooth tab scrolling respects reduced-motion preference', () => {
  const script = readBlogAppScript();

  assert.equal(blogApp.getBlogScrollBehavior?.({ matches: true }), 'auto');
  assert.equal(blogApp.getBlogScrollBehavior?.({ matches: false }), 'smooth');
  assert.equal(blogApp.getBlogScrollBehavior?.(null), 'smooth');
  assert.match(script, /window\.matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
  assert.match(script, /behavior:\s*getBlogScrollBehavior/);
});

test('BlogApp mobile layout wraps long titles without horizontal overflow', () => {
  const styles = readBlogAppStyles();
  const mobileRules = styles.match(/@media \(max-width: 760px\) \{[\s\S]*?\n\}/)?.[0] ?? '';

  assert.match(mobileRules, /\.blog-app__address span\s*\{[^}]*white-space:\s*normal;[^}]*overflow-wrap:\s*anywhere;/s);
  assert.match(mobileRules, /\.blog-app__tab-title\s*\{[^}]*white-space:\s*normal;[^}]*overflow-wrap:\s*anywhere;/s);
  assert.match(mobileRules, /\.blog-app__entry-title\s*\{[^}]*white-space:\s*normal;[^}]*overflow-wrap:\s*anywhere;/s);
  assert.match(mobileRules, /\.blog-app__entry-description\s*\{[^}]*white-space:\s*normal;[^}]*overflow-wrap:\s*anywhere;/s);
  assert.match(mobileRules, /\.blog-app__article-head h3\s*\{[^}]*overflow-wrap:\s*anywhere;/s);
  assert.match(mobileRules, /\.blog-app__tag-results-head h3\s*\{[^}]*overflow-wrap:\s*anywhere;/s);
  assert.match(mobileRules, /\.blog-app__tag-result-tags\s*\{[^}]*white-space:\s*normal;[^}]*overflow-wrap:\s*anywhere;/s);
});

test('legacy resume and blog routes are static noindex redirects into Burak OS', () => {
  const resumePage = readResumePageSource();
  const blogIndexPage = readBlogIndexPageSource();
  const blogSlugPage = readBlogSlugPageSource();

  assert.match(resumePage, /#app=resume/);
  assert.match(blogIndexPage, /#app=blog/);
  assert.match(blogSlugPage, /#blog=\$\{encodeURIComponent\(deepLinkSlug\)\}/);

  [resumePage, blogIndexPage, blogSlugPage].forEach((source) => {
    assert.match(source, /<meta name="robots" content="noindex, follow" \/>/);
    assert.match(source, /http-equiv="refresh"/);
    assert.match(source, /window\.location\.replace/);
    assert.match(source, /rel="canonical"/);
    assert.doesNotMatch(source, /styles\/cv\.css/);
    assert.doesNotMatch(source, /styles\/blog\.css/);
  });
});

test('legacy blog post route generates canonical and entry slug fallbacks without Markdown imports', () => {
  const source = readBlogSlugPageSource();

  assert.match(source, /params:\s*\{\s*slug:\s*routeSlug\s*\}/);
  assert.match(source, /post\.data\.canonicalSlug/);
  assert.match(source, /post\.slug/);
  assert.doesNotMatch(source, /post\.render\(/);
  assert.doesNotMatch(source, /<Content \/>/);
});
