import assert from 'node:assert/strict';
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

test('formats browser-local status time without seconds', () => {
  const date = new Date('2026-06-11T22:14:30');

  assert.equal(formatOsDateTime(date, 'en-GB'), 'Thu 11 Jun 22:14');
  assert.equal(formatOsDateTime(date, 'en-US'), 'Thu Jun 11 22:14');
});
