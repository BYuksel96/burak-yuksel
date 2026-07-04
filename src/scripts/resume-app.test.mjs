import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import test from 'node:test';

import * as resumeApp from './resume-app.js';
import { getDefaultTimelineId, parseDescriptionLines } from './resume-app.js';

const readResumeAppSource = () => readFileSync(new URL('../components/os/ResumeApp.astro', import.meta.url), 'utf8');
const readResumeAppStyles = () => readFileSync(new URL('../styles/resume-app.css', import.meta.url), 'utf8');
const readTimeline = () => JSON.parse(readFileSync(new URL('../content/timeline.json', import.meta.url), 'utf8'));

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

test('Resume.exe timeline marks the career break as current after Discover and Capital One', () => {
  const timeline = readTimeline();
  const discover = timeline.find((item) => item.id === 'discover');
  const careerBreak = timeline.find((item) => item.id === 'careerBreak');
  const currentItems = timeline.filter((item) => item.current);

  assert.equal(discover.title, 'Discover Financial Services / Capital One');
  assert.equal(discover.date, 'Mar 2024 - Apr 2026');
  assert.equal(discover.current, false);
  assert.match(discover.description.join('\n'), /Agile & Technical Programme Manager \(Mar 2025 - Apr 2026\)/);
  assert.match(discover.description.join('\n'), /Scrum Master \(Mar 2024 - Mar 2025\)/);
  assert.equal(careerBreak.title, 'Career Break');
  assert.equal(careerBreak.date, 'Apr 2026 - Present');
  assert.equal(careerBreak.imageSrc, '/career-break-beach.png');
  assert.equal(existsSync(new URL('../../public/career-break-beach.png', import.meta.url)), true);
  assert.ok(statSync(new URL('../../public/career-break-beach.png', import.meta.url)).size > 1024);
  assert.equal(readFileSync(new URL('../../public/career-break-beach.png', import.meta.url)).subarray(1, 4).toString('utf8'), 'PNG');
  assert.match(careerBreak.description.join('\n'), /Taking time to travel, recharge and enjoy the freedom to choose what comes next/);
  assert.match(careerBreak.description.join('\n'), /currently travelling, enjoying life and exploring what I want the next chapter to look like/);
  assert.match(careerBreak.description.join('\n'), /personal projects and making the most of the freedom to decide what comes next/);
  assert.deepEqual(currentItems.map((item) => item.id), ['careerBreak']);
  assert.equal(timeline.findIndex((item) => item.id === 'careerBreak'), timeline.findIndex((item) => item.id === 'future') - 1);
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
