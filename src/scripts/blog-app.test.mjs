import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  ARCHIVE_TAB_ID,
  buildBlogDisplayAddress,
  buildBlogPath,
  buildLinkedInShareUrl,
  createInitialBlogTabState,
  groupBlogPostsByYearMonth,
  reduceBlogTabState,
  sortBlogPostsLatestFirst,
  toAbsoluteShareUrl,
} from './blog-app.js';

const readBlogAppSource = () => readFileSync(new URL('../components/os/BlogApp.astro', import.meta.url), 'utf8');
const readBlogAppStyles = () => readFileSync(new URL('../styles/blog-app.css', import.meta.url), 'utf8');

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

test('share helpers convert canonical paths to absolute copy and LinkedIn URLs', () => {
  const absolute = toAbsoluteShareUrl('/blog/hello-world/', 'https://example.test');
  const linkedIn = buildLinkedInShareUrl(absolute, 'Read this');

  assert.equal(absolute, 'https://example.test/blog/hello-world/');
  assert.match(linkedIn, /^https:\/\/www\.linkedin\.com\/feed\/\?shareActive=true&text=/);
  assert.match(decodeURIComponent(linkedIn), /Read this https:\/\/example\.test\/blog\/hello-world\//);
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

test('BlogApp CSS is namespaced and covers Markdown article elements', () => {
  const styles = readBlogAppStyles();

  assert.match(styles, /\.blog-app\s/);
  assert.match(styles, /\.blog-app__article\s+h2/);
  assert.match(styles, /\.blog-app__article\s+p/);
  assert.match(styles, /\.blog-app__article\s+ul/);
  assert.match(styles, /\.blog-app__article\s+blockquote/);
  assert.match(styles, /\.blog-app__article\s+pre/);
  assert.match(styles, /\.blog-app__article\s+code/);
  assert.match(styles, /\.blog-app__tabs/);
  assert.match(styles, /overflow-x:\s*auto/);
});
