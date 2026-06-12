import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { getDefaultTimelineId, parseDescriptionLines } from './resume-app.js';

const readResumeAppSource = () => readFileSync(new URL('../components/os/ResumeApp.astro', import.meta.url), 'utf8');
const readResumeAppStyles = () => readFileSync(new URL('../styles/resume-app.css', import.meta.url), 'utf8');

test('default resume selection prefers current timeline item', () => {
  const items = [
    { id: 'first', current: false },
    { id: 'active', current: true },
    { id: 'future', current: false },
  ];

  assert.equal(getDefaultTimelineId(items), 'active');
});

test('default resume selection falls back to final item when no current item exists', () => {
  const items = [
    { id: 'first', current: false },
    { id: 'last', current: false },
  ];

  assert.equal(getDefaultTimelineId(items), 'last');
});

test('description parser preserves trusted html and groups bullets after section headings', () => {
  const blocks = parseDescriptionLines([
    '<strong><em>Opening line</em></strong>',
    'Delivery:',
    '- First outcome',
    '- <b>Second</b> outcome',
    'Closing paragraph',
  ]);

  assert.deepEqual(blocks, [
    { type: 'paragraph', html: '<strong><em>Opening line</em></strong>' },
    { type: 'section', html: 'Delivery:' },
    { type: 'list', items: ['First outcome', '<b>Second</b> outcome'] },
    { type: 'paragraph', html: 'Closing paragraph' },
  ]);
});

test('Resume.exe uses a two-pane explorer without a separate timeline stack', () => {
  const source = readResumeAppSource();

  assert.match(source, /resume-app__sidebar/);
  assert.match(source, /resume-app__inspector/);
  assert.doesNotMatch(source, /resume-app__timeline\b/);
  assert.doesNotMatch(source, /Timeline Stack/);
});

test('Career Files pane uses compact explorer rows without rail markers', () => {
  const styles = readResumeAppStyles();

  assert.doesNotMatch(styles, /\.resume-app__file-list::before/);
  assert.doesNotMatch(styles, /\.resume-app__file::before/);
  assert.match(styles, /\.resume-app__file-list\s*{[^}]*padding:\s*0\.58rem;/s);
  assert.match(styles, /\.resume-app__file-wrap\s*{[^}]*min-width:\s*0;[^}]*}/s);
});
