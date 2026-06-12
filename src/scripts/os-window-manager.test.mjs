import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  createInitialOsState,
  createLauncherOpenAction,
  formatOsDateTime,
  reduceOsWindowState,
} from './os-window-manager.js';

test('main apps are exclusive and compact the taskbar', () => {
  let state = createInitialOsState();

  state = reduceOsWindowState(state, { type: 'open', id: 'resume' });
  assert.equal(state.activeMainApp, 'resume');
  assert.deepEqual(state.openFolders, []);
  assert.equal(state.isTaskbarCompact, true);

  state = reduceOsWindowState(state, { type: 'open', id: 'blog' });
  assert.equal(state.activeMainApp, 'blog');
  assert.deepEqual(state.openFolders, []);
  assert.equal(state.isTaskbarCompact, true);
});

test('folder windows stay independent from main apps', () => {
  let state = createInitialOsState();

  state = reduceOsWindowState(state, { type: 'open', id: 'downloads' });
  assert.equal(state.activeMainApp, null);
  assert.deepEqual(state.openFolders, ['downloads']);
  assert.equal(state.isTaskbarCompact, false);

  state = reduceOsWindowState(state, { type: 'open', id: 'github' });
  assert.equal(state.activeMainApp, 'github');
  assert.deepEqual(state.openFolders, ['downloads']);
  assert.equal(state.isTaskbarCompact, true);

  state = reduceOsWindowState(state, { type: 'open', id: 'bin' });
  assert.equal(state.activeMainApp, 'github');
  assert.deepEqual(state.openFolders, ['downloads', 'bin']);
  assert.equal(state.isTaskbarCompact, true);
});

test('closing windows updates only the matching window family', () => {
  let state = createInitialOsState();

  state = reduceOsWindowState(state, { type: 'open', id: 'resume' });
  state = reduceOsWindowState(state, { type: 'open', id: 'bin' });
  state = reduceOsWindowState(state, { type: 'close', id: 'resume' });

  assert.equal(state.activeMainApp, null);
  assert.deepEqual(state.openFolders, ['bin']);
  assert.equal(state.isTaskbarCompact, false);

  state = reduceOsWindowState(state, { type: 'close', id: 'bin' });
  assert.equal(state.activeMainApp, null);
  assert.deepEqual(state.openFolders, []);
  assert.equal(state.isTaskbarCompact, false);
});

test('launcher open actions support single-click desktop and taskbar paths', () => {
  assert.deepEqual(createLauncherOpenAction('desktop', 'resume'), { type: 'open', id: 'resume' });
  assert.deepEqual(createLauncherOpenAction('taskbar', 'downloads'), { type: 'open', id: 'downloads' });
  assert.equal(createLauncherOpenAction('desktop', ''), null);
});

test('taskbar launcher toggles an already-open matching target closed', () => {
  let state = createInitialOsState();
  state = reduceOsWindowState(state, { type: 'open', id: 'resume' });

  assert.deepEqual(createLauncherOpenAction('taskbar', 'resume', state), { type: 'close', id: 'resume' });
  assert.deepEqual(createLauncherOpenAction('desktop', 'resume', state), { type: 'open', id: 'resume' });

  state = reduceOsWindowState(state, { type: 'open', id: 'downloads' });
  assert.deepEqual(createLauncherOpenAction('taskbar', 'downloads', state), { type: 'close', id: 'downloads' });
  assert.deepEqual(createLauncherOpenAction('taskbar', 'blog', state), { type: 'open', id: 'blog' });
});

test('formats browser-local status time without seconds', () => {
  const date = new Date('2026-06-11T22:14:30');

  assert.equal(formatOsDateTime(date, 'en-GB'), 'Thu 11 Jun 22:14');
  assert.equal(formatOsDateTime(date, 'en-US'), 'Thu Jun 11 22:14');
});

test('taskbar uses custom labels instead of native tooltip or dot indicators', () => {
  const taskbarSource = readFileSync(new URL('../components/os/Taskbar.astro', import.meta.url), 'utf8');
  const osCss = readFileSync(new URL('../styles/os.css', import.meta.url), 'utf8');

  assert.match(taskbarSource, /class="taskbar-label"/);
  assert.doesNotMatch(taskbarSource, /\s+title=/);
  assert.doesNotMatch(osCss, /\.taskbar-item\[data-os-open\]\s+\.taskbar-icon::after/);
  assert.match(osCss, /\.os-taskbar\s*\{[\s\S]*overflow:\s*visible;/);
  assert.match(osCss, /\.taskbar-items\s*\{[\s\S]*overflow:\s*visible;/);
  assert.match(osCss, /--taskbar-icon-lift:\s*-10px;/);
  assert.match(osCss, /--taskbar-icon-scale:\s*1\.12;/);
  assert.match(osCss, /transform:\s*translate\(-50%,\s*-50%\)\s*translateY\(var\(--taskbar-icon-lift\)\)\s*scale\(var\(--taskbar-icon-scale\)\);/);
  assert.match(osCss, /\.taskbar-item:hover\s+\.taskbar-icon,\s*\n\.taskbar-item:focus-visible\s+\.taskbar-icon\s*\{[\s\S]*translateY\(var\(--taskbar-icon-lift\)\)\s*scale\(var\(--taskbar-icon-scale\)\)/);
  assert.match(osCss, /\.taskbar-item:hover\s+\.taskbar-label,\s*\n\.taskbar-item:focus-visible\s+\.taskbar-label,\s*\n\.taskbar-item\[data-os-open\]\s+\.taskbar-label,\s*\n\.taskbar-item\[data-os-active\]\s+\.taskbar-label\s*\{[\s\S]*opacity:\s*1;/);
  assert.doesNotMatch(osCss, /@media\s*\(any-hover:\s*hover\)/);
  assert.doesNotMatch(osCss, /@media\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)/);
  assert.doesNotMatch(osCss, /overflow-y:\s*hidden;/);
});
