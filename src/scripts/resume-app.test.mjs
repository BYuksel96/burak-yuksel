import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import * as resumeApp from './resume-app.js';
import { getDefaultTimelineId, parseDescriptionLines } from './resume-app.js';

const readResumeAppSource = () => readFileSync(new URL('../components/os/ResumeApp.astro', import.meta.url), 'utf8');
const readResumeAppStyles = () => readFileSync(new URL('../styles/resume-app.css', import.meta.url), 'utf8');

const getLinkedInTag = (source) => source.match(/<a\b[^>]*class="resume-app__linkedin"[^>]*>/i)?.[0] ?? '';

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

test('Resume.exe LinkedIn action opens a safe real browser tab', () => {
  const source = readResumeAppSource();
  const linkedInTag = getLinkedInTag(source);

  assert.match(source, /const linkedinUrl = ['"]https:\/\/www\.linkedin\.com\/in\/burak-yuksel96\/['"];/);
  assert.match(linkedInTag, /href=\{linkedinUrl\}/);
  assert.match(linkedInTag, /target="_blank"/);
  assert.match(linkedInTag, /rel="noopener noreferrer"/);
  assert.doesNotMatch(source, /<iframe|window\.open|access_token|client_secret|authorization|bearer/i);
});

test('Resume.exe timeline scrolling respects reduced-motion preference', () => {
  const script = readFileSync(new URL('./resume-app.js', import.meta.url), 'utf8');

  assert.equal(resumeApp.getResumeScrollBehavior?.({ matches: true }), 'auto');
  assert.equal(resumeApp.getResumeScrollBehavior?.({ matches: false }), 'smooth');
  assert.equal(resumeApp.getResumeScrollBehavior?.(null), 'smooth');
  assert.match(script, /window\.matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
  assert.match(script, /behavior:\s*getResumeScrollBehavior/);
});

test('Resume.exe mobile layout wraps long timeline titles without horizontal overflow', () => {
  const styles = readResumeAppStyles();
  const mobileRules = styles.match(/@media \(max-width: 760px\) \{[\s\S]*?\n\}/)?.[0] ?? '';

  assert.match(mobileRules, /\.resume-app\s*{[^}]*width:\s*100%;[^}]*height:\s*100%;[^}]*margin:\s*0;/s);
  assert.match(mobileRules, /\.resume-app__selected\s*{[^}]*white-space:\s*normal;[^}]*overflow-wrap:\s*anywhere;/s);
  assert.match(mobileRules, /\.resume-app__file-title\s*{[^}]*white-space:\s*normal;[^}]*overflow-wrap:\s*anywhere;/s);
  assert.match(mobileRules, /\.resume-app__mobile-preview-head h4\s*{[^}]*overflow-wrap:\s*anywhere;/s);
  assert.match(mobileRules, /\.resume-app__detail-scroll\s*{[^}]*overflow-x:\s*hidden;/s);
});
