import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import test from 'node:test';

import * as osManager from './os-window-manager.js';
import {
  bringFolderToFront,
  clampFolderDragPosition,
  createInitialOsState,
  createLauncherOpenAction,
  formatOsDateTime,
  getGameReturnFocusSelector,
  getWindowCloseActions,
  getWindowFocusSelector,
  parseOsStartupHash,
  reduceOsWindowState,
  shouldOpenDownloadConfirm,
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

test('folder z-order moves the opened or pressed folder to the front', () => {
  let state = createInitialOsState();

  state = reduceOsWindowState(state, { type: 'open', id: 'downloads' });
  assert.deepEqual(state.folderZOrder, ['downloads']);

  state = reduceOsWindowState(state, { type: 'open', id: 'bin' });
  assert.deepEqual(state.folderZOrder, ['downloads', 'bin']);

  state = reduceOsWindowState(state, { type: 'focus-folder', id: 'downloads' });
  assert.deepEqual(state.folderZOrder, ['bin', 'downloads']);
  assert.deepEqual(bringFolderToFront(['downloads', 'bin'], 'bin'), ['downloads', 'bin']);
});

test('closing a folder clears help, z-order, and drag position while keeping other folders intact', () => {
  let state = createInitialOsState();

  state = reduceOsWindowState(state, { type: 'open', id: 'downloads' });
  state = reduceOsWindowState(state, { type: 'open', id: 'bin' });
  state = reduceOsWindowState(state, { type: 'move-folder', id: 'downloads', position: { x: 48, y: 64 } });
  state = reduceOsWindowState(state, { type: 'open-help', id: 'downloads' });
  state = reduceOsWindowState(state, { type: 'close', id: 'downloads' });

  assert.deepEqual(state.openFolders, ['bin']);
  assert.deepEqual(state.folderZOrder, ['bin']);
  assert.equal(state.helpWindowId, null);
  assert.equal(state.folderPositions.downloads, undefined);
});

test('folder drag positions are clamped inside the OS screen above the taskbar', () => {
  const result = clampFolderDragPosition({
    desired: { x: 900, y: 700 },
    folderRect: { width: 320, height: 220 },
    screenRect: { width: 1000, height: 800 },
    taskbarRect: { top: 720 },
    inset: 12,
  });

  assert.deepEqual(result, { x: 668, y: 488 });
  assert.deepEqual(
    clampFolderDragPosition({
      desired: { x: -40, y: -24 },
      folderRect: { width: 320, height: 220 },
      screenRect: { width: 1000, height: 800 },
      taskbarRect: { top: 720 },
      inset: 12,
    }),
    { x: 12, y: 12 },
  );
});

test('saved folder positions can be re-clamped after viewport changes', () => {
  assert.deepEqual(
    osManager.clampFolderPositionMap?.({
      positions: {
        downloads: { x: 860, y: 640 },
        bin: { x: -30, y: 24 },
      },
      folderRects: {
        downloads: { width: 320, height: 220 },
        bin: { width: 260, height: 180 },
      },
      screenRect: { width: 800, height: 700 },
      taskbarRect: { top: 620 },
      inset: 10,
    }),
    {
      downloads: { x: 470, y: 390 },
      bin: { x: 10, y: 24 },
    },
  );
});

test('download confirmation opens on desktop double-click and touch single tap only', () => {
  assert.equal(shouldOpenDownloadConfirm({ pointerMode: 'hover', interactionType: 'click' }), false);
  assert.equal(shouldOpenDownloadConfirm({ pointerMode: 'hover', interactionType: 'dblclick' }), true);
  assert.equal(shouldOpenDownloadConfirm({ pointerMode: 'touch', interactionType: 'click' }), true);
  assert.equal(shouldOpenDownloadConfirm({ pointerMode: 'touch', interactionType: 'dblclick' }), false);
  assert.equal(shouldOpenDownloadConfirm({ pointerMode: 'hover', interactionType: 'keydown', key: 'Enter' }), true);
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

test('fullscreen game windows are exclusive and compact the taskbar', () => {
  let state = createInitialOsState();

  state = reduceOsWindowState(state, { type: 'open', id: 'bin' });
  state = reduceOsWindowState(state, { type: 'open', id: 'maze' });
  assert.equal(state.activeGameApp, 'maze');
  assert.equal(state.activeMainApp, null);
  assert.deepEqual(state.openFolders, ['bin']);
  assert.equal(state.isTaskbarCompact, true);

  state = reduceOsWindowState(state, { type: 'open', id: 'quiz' });
  assert.equal(state.activeGameApp, 'quiz');
  assert.equal(state.activeMainApp, null);
  assert.deepEqual(state.openFolders, ['bin']);
  assert.equal(state.isTaskbarCompact, true);

  state = reduceOsWindowState(state, { type: 'close', id: 'quiz' });
  assert.equal(state.activeGameApp, null);
  assert.deepEqual(state.openFolders, ['bin']);
  assert.equal(state.isTaskbarCompact, false);
});

test('game windows define explicit launch and return focus targets', () => {
  assert.equal(getWindowFocusSelector('maze'), '[data-maze-play]');
  assert.equal(getWindowFocusSelector('quiz'), '[data-quiz-start-mode]');
  assert.equal(getWindowFocusSelector('bin'), '[data-os-window-close]');
  assert.equal(getGameReturnFocusSelector('maze'), '[data-os-window-id="bin"] [data-os-game-file][data-os-target="maze"]');
  assert.equal(getGameReturnFocusSelector('quiz'), '[data-os-window-id="bin"] [data-os-game-file][data-os-target="quiz"]');
});

test('closing a game window routes back to Bin before restoring focus', () => {
  assert.deepEqual(getWindowCloseActions('maze', 'game'), [
    { type: 'close', id: 'maze' },
    { type: 'open', id: 'bin' },
  ]);
  assert.deepEqual(getWindowCloseActions('quiz', 'game'), [
    { type: 'close', id: 'quiz' },
    { type: 'open', id: 'bin' },
  ]);
  assert.deepEqual(getWindowCloseActions('downloads', 'folder'), [{ type: 'close', id: 'downloads' }]);
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

test('launcher focus helpers prefer the opener type before falling back to matching launchers', () => {
  assert.deepEqual(osManager.getLauncherFocusSelectors?.('resume', 'desktop'), [
    '[data-os-launcher="desktop"][data-os-target="resume"]',
    '[data-os-launcher="taskbar"][data-os-target="resume"]',
  ]);
  assert.deepEqual(osManager.getLauncherFocusSelectors?.('downloads', 'taskbar'), [
    '[data-os-launcher="taskbar"][data-os-target="downloads"]',
    '[data-os-launcher="desktop"][data-os-target="downloads"]',
  ]);
  assert.deepEqual(osManager.getLauncherFocusSelectors?.('maze', 'desktop'), []);
});

test('modal focus helper wraps Tab and Shift+Tab within visible controls', () => {
  assert.equal(osManager.getNextModalFocusIndex?.({ currentIndex: 0, focusableCount: 2, shiftKey: true }), 1);
  assert.equal(osManager.getNextModalFocusIndex?.({ currentIndex: 1, focusableCount: 2, shiftKey: false }), 0);
  assert.equal(osManager.getNextModalFocusIndex?.({ currentIndex: 0, focusableCount: 2, shiftKey: false }), 1);
  assert.equal(osManager.getNextModalFocusIndex?.({ currentIndex: -1, focusableCount: 2, shiftKey: false }), 0);
  assert.equal(osManager.getNextModalFocusIndex?.({ currentIndex: 0, focusableCount: 0, shiftKey: false }), -1);
});

test('formats browser-local status time without seconds', () => {
  const date = new Date('2026-06-11T22:14:30');

  assert.equal(formatOsDateTime(date, 'en-GB'), 'Thu 11 Jun 22:14');
  assert.equal(formatOsDateTime(date, 'en-US'), 'Thu Jun 11 22:14');
  assert.match(formatOsDateTime(date, 'tr-TR'), /Haz/);
});

test('non-blog window controls expose localized aria and title hooks', () => {
  const source = readFileSync(new URL('../components/os/OsWindow.astro', import.meta.url), 'utf8');

  assert.match(source, /data-i18n-aria-label="os\.controls\.closeWindow"/);
  assert.match(source, /data-i18n-title="os\.controls\.closeWindow"/);
  assert.match(source, /data-i18n-aria-label="os\.controls\.minimiseUnavailable"/);
  assert.match(source, /data-i18n-title="os\.controls\.minimiseUnavailable"/);
  assert.match(source, /data-i18n-aria-label="os\.controls\.openHelp"/);
});

test('status time refreshes from the active language on language changes', () => {
  const source = readFileSync(new URL('./os-window-manager.js', import.meta.url), 'utf8');

  assert.match(source, /getLanguageLocale\(getActiveLanguage\(\),\s*'en-GB'\)/);
  assert.match(source, /LANGUAGE_CHANGE_EVENT[\s\S]*updateStatusTime\(\)/);
});

test('startup hashes resolve to OS app and Blog.exe deep-link routes', () => {
  assert.deepEqual(parseOsStartupHash('#app=resume'), { id: 'resume', blogSlug: '' });
  assert.deepEqual(parseOsStartupHash('#app=blog'), { id: 'blog', blogSlug: '' });
  assert.deepEqual(parseOsStartupHash('#blog=vibe-coding-to-the-max'), { id: 'blog', blogSlug: 'vibe-coding-to-the-max' });
  assert.deepEqual(parseOsStartupHash('#blog=vibe%20coding'), { id: 'blog', blogSlug: 'vibe coding' });
  assert.equal(parseOsStartupHash('#app=maze'), null);
  assert.equal(parseOsStartupHash('#app=unknown'), null);
  assert.equal(parseOsStartupHash(''), null);
});

test('OS theme helpers keep overrides session-scoped with a memory fallback', async () => {
  const manager = await import('./os-window-manager.js');

  assert.equal(typeof manager.resolveOsTheme, 'function');
  assert.equal(typeof manager.getNextOsTheme, 'function');
  assert.equal(typeof manager.createOsThemeSessionStore, 'function');
  assert.equal(manager.resolveOsTheme({ storedTheme: 'light', prefersLight: false }), 'light');
  assert.equal(manager.resolveOsTheme({ storedTheme: 'dark', prefersLight: true }), 'dark');
  assert.equal(manager.resolveOsTheme({ storedTheme: null, prefersLight: true }), 'light');
  assert.equal(manager.resolveOsTheme({ storedTheme: 'sepia', prefersLight: true }), 'light');
  assert.equal(manager.resolveOsTheme({ storedTheme: null, prefersLight: false }), 'dark');
  assert.equal(manager.getNextOsTheme('dark'), 'light');
  assert.equal(manager.getNextOsTheme('light'), 'dark');

  const storedValues = new Map();
  const store = manager.createOsThemeSessionStore(() => ({
    getItem: (key) => storedValues.get(key) ?? null,
    setItem: (key, value) => storedValues.set(key, value),
  }));
  assert.equal(store.read(), null);
  store.write('light');
  assert.equal(store.read(), 'light');
  assert.deepEqual([...storedValues.values()], ['light']);

  const blockedStore = manager.createOsThemeSessionStore(() => ({
    getItem: () => {
      throw new Error('storage blocked');
    },
    setItem: () => {
      throw new Error('storage blocked');
    },
  }));
  assert.equal(blockedStore.read(), null);
  blockedStore.write('dark');
  assert.equal(blockedStore.read(), 'dark');

  const windowManagerSource = readFileSync(new URL('./os-window-manager.js', import.meta.url), 'utf8');
  assert.match(windowManagerSource, /sessionStorage/);
  assert.doesNotMatch(windowManagerSource, /localStorage/);
});

test('lock screen helpers distinguish desktop enter from touch swipe unlocks', async () => {
  const manager = await import('./os-window-manager.js');

  assert.equal(typeof manager.getLockScreenInstruction, 'function');
  assert.equal(typeof manager.shouldUnlockLockScreen, 'function');
  assert.deepEqual(manager.getLockScreenInstruction('hover'), {
    mode: 'desktop',
    copy: 'Press Enter key to unlock',
  });
  assert.deepEqual(manager.getLockScreenInstruction('touch'), {
    mode: 'touch',
    copy: 'Swipe up to unlock',
  });
  assert.equal(manager.shouldUnlockLockScreen({ pointerMode: 'hover', interactionType: 'keydown', key: 'Enter' }), true);
  assert.equal(manager.shouldUnlockLockScreen({ pointerMode: 'hover', interactionType: 'keydown', key: ' ' }), false);
  assert.equal(
    manager.shouldUnlockLockScreen({ pointerMode: 'touch', interactionType: 'swipe', swipeStartY: 220, swipeEndY: 140 }),
    true,
  );
  assert.equal(
    manager.shouldUnlockLockScreen({ pointerMode: 'touch', interactionType: 'swipe', swipeStartY: 220, swipeEndY: 196 }),
    false,
  );
  assert.equal(manager.shouldUnlockLockScreen({ pointerMode: 'touch', interactionType: 'keydown', key: 'Enter' }), false);
});

test('topbar theme toggle and lock screen expose accessible animated affordances', () => {
  const osShellSource = readFileSync(new URL('../components/os/OsShell.astro', import.meta.url), 'utf8');
  const osCss = readFileSync(new URL('../styles/os.css', import.meta.url), 'utf8');

  assert.match(osShellSource, /data-os-theme-toggle/);
  assert.match(osShellSource, /aria-label="Switch to light theme"/);
  assert.match(osShellSource, /aria-pressed="false"/);
  assert.match(osShellSource, /os-theme-icon--sun/);
  assert.match(osShellSource, /os-theme-icon--moon/);
  assert.match(osShellSource, /data-os-lock-button/);
  assert.match(osShellSource, /data-os-lock-screen/);
  assert.match(osShellSource, /Press Enter key to unlock/);
  assert.match(osShellSource, /Swipe up to unlock/);
  assert.match(osShellSource, /data-os-lock-swipe-cue/);
  assert.match(osCss, /\.os-theme-icon/);
  assert.match(osCss, /\.os-body\[data-os-theme='light'\]/);
  assert.match(osCss, /\.os-body\[data-os-theme='dark'\]/);
  assert.match(osCss, /@keyframes\s+osLockSwipeCue/);
  assert.match(osCss, /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*\.os-theme-icon/);
  assert.match(osCss, /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*\.os-lock-swipe-cue/);
});

test('taskbar uses custom labels instead of native tooltip or dot indicators', () => {
  const taskbarSource = readFileSync(new URL('../components/os/Taskbar.astro', import.meta.url), 'utf8');
  const osCss = readFileSync(new URL('../styles/os.css', import.meta.url), 'utf8');
  const windowManagerSource = readFileSync(new URL('./os-window-manager.js', import.meta.url), 'utf8');

  assert.match(taskbarSource, /class="taskbar-label"/);
  assert.doesNotMatch(taskbarSource, /\s+title=/);
  assert.doesNotMatch(osCss, /\.taskbar-item\[data-os-open\]\s+\.taskbar-icon::after/);
  assert.match(osCss, /\.os-taskbar\s*\{[\s\S]*overflow:\s*visible;/);
  assert.match(osCss, /\.taskbar-items\s*\{[\s\S]*overflow:\s*visible;/);
  assert.match(osCss, /--taskbar-icon-lift:\s*-10px;/);
  assert.match(osCss, /--taskbar-icon-scale:\s*1\.12;/);
  assert.match(osCss, /transform:\s*translate\(-50%,\s*-50%\)\s*translateY\(var\(--taskbar-icon-lift\)\)\s*scale\(var\(--taskbar-icon-scale\)\);/);
  assert.match(osCss, /\.os-screen:not\(\[data-os-pointer='touch'\]\)\s+\.taskbar-item:hover\s+\.taskbar-icon,\s*\n\.taskbar-item:focus-visible\s+\.taskbar-icon\s*\{[\s\S]*translateY\(var\(--taskbar-icon-lift\)\)\s*scale\(var\(--taskbar-icon-scale\)\)/);
  assert.match(osCss, /\.os-screen:not\(\[data-os-pointer='touch'\]\)\s+\.taskbar-item:hover\s+\.taskbar-label,\s*\n\.taskbar-item:focus-visible\s+\.taskbar-label,\s*\n\.taskbar-item\[data-os-open\]\s+\.taskbar-label,\s*\n\.taskbar-item\[data-os-active\]\s+\.taskbar-label\s*\{[\s\S]*opacity:\s*1;/);
  assert.match(windowManagerSource, /dataset\.osPointer/);
  assert.match(windowManagerSource, /pointerType === 'touch'/);
  assert.match(windowManagerSource, /pointerdown/);
  assert.match(windowManagerSource, /pointerover/);
  assert.doesNotMatch(osCss, /@media\s*\(any-hover:\s*hover\)/);
  assert.doesNotMatch(osCss, /@media\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)/);
  assert.doesNotMatch(osCss, /overflow-y:\s*hidden;/);
});

test('mobile compact taskbar remains readable while a main app is open', () => {
  const osCss = readFileSync(new URL('../styles/os.css', import.meta.url), 'utf8');

  assert.match(osCss, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.os-screen\[data-taskbar-mode='compact'\]\s+\.os-taskbar\s*\{[\s\S]*scale\(0\.92\);/);
  assert.match(osCss, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.os-screen\[data-taskbar-mode='compact'\]\s+\.taskbar-icon\s*\{[\s\S]*width:\s*2\.65rem;[\s\S]*height:\s*2\.65rem;/);
  assert.match(osCss, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.os-screen\[data-taskbar-mode='compact'\]\s+\.taskbar-label\s*\{[\s\S]*font-size:\s*0\.54rem;/);
  assert.match(osCss, /@media\s*\(max-width:\s*460px\)\s*\{[\s\S]*\.os-screen\[data-taskbar-mode='compact'\]\s+\.taskbar-icon\s*\{[\s\S]*width:\s*2\.55rem;[\s\S]*height:\s*2\.55rem;/);
  assert.match(osCss, /@media\s*\(max-width:\s*460px\)\s*\{[\s\S]*\.os-screen\[data-taskbar-mode='compact'\]\s+\.taskbar-label\s*\{[\s\S]*font-size:\s*0\.56rem;/);
  assert.match(osCss, /@media\s*\(max-width:\s*380px\)\s*\{[\s\S]*\.os-screen\[data-taskbar-mode='compact'\]\s+\.taskbar-label\s*\{[\s\S]*font-size:\s*0\.52rem;/);
});

test('mobile taskbar sits lower and keeps labels clear of icons', () => {
  const osCss = readFileSync(new URL('../styles/os.css', import.meta.url), 'utf8');

  assert.match(osCss, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.os-taskbar\s*\{[\s\S]*bottom:\s*0\.36rem;/);
  assert.match(osCss, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.taskbar-label\s*\{[\s\S]*top:\s*calc\(50% \+ 1\.16rem\);/);
  assert.match(osCss, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.os-screen\[data-taskbar-mode='compact'\]\s+\.os-taskbar\s*\{[\s\S]*bottom:\s*0\.4rem;/);
  assert.match(osCss, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.os-screen\[data-taskbar-mode='compact'\]\s+\.taskbar-label\s*\{[\s\S]*top:\s*calc\(50% \+ 1\.24rem\);/);
});

test('phone-sized landscape viewports show portrait lock without affecting tablets', () => {
  const osShellSource = readFileSync(new URL('../components/os/OsShell.astro', import.meta.url), 'utf8');
  const osCss = readFileSync(new URL('../styles/os.css', import.meta.url), 'utf8');

  assert.match(osShellSource, /class="os-orientation-lock"/);
  assert.match(osShellSource, /Rotate your device to portrait/);
  assert.match(osCss, /\.os-orientation-lock\s*\{[\s\S]*display:\s*none;/);
  assert.match(osCss, /@media\s*\(max-width:\s*980px\)\s*and\s*\(max-height:\s*560px\)\s*and\s*\(orientation:\s*landscape\)\s*\{/);
  assert.match(osCss, /@media\s*\(max-width:\s*980px\)\s*and\s*\(max-height:\s*560px\)\s*and\s*\(orientation:\s*landscape\)\s*\{[\s\S]*\.os-orientation-lock\s*\{[\s\S]*display:\s*grid;/);
});

test('Blog.exe window renders the BlogApp and explains internal tabs in help copy', () => {
  const osShellSource = readFileSync(new URL('../components/os/OsShell.astro', import.meta.url), 'utf8');

  assert.match(osShellSource, /import BlogApp from '\.\/BlogApp\.astro';/);
  assert.match(osShellSource, /window\.id === 'blog'[\s\S]*<BlogApp \/>/);
  assert.match(osShellSource, /Archive entries open posts in internal tabs/);
  assert.doesNotMatch(osShellSource, /Phase 5 content pending/);
});

test('GitHub window renders GitHubApp and explains latest public repositories in help copy', () => {
  const osShellSource = readFileSync(new URL('../components/os/OsShell.astro', import.meta.url), 'utf8');

  assert.match(osShellSource, /import GitHubApp from '\.\/GitHubApp\.astro';/);
  assert.match(osShellSource, /window\.id === 'github'[\s\S]*<GitHubApp \/>/);
  assert.match(osShellSource, /latest public GitHub repositories/);
  assert.doesNotMatch(osShellSource, /Phase 6 content pending/);
});

test('Downloads and Bin windows render real folder content and updated help copy', () => {
  const osShellSource = readFileSync(new URL('../components/os/OsShell.astro', import.meta.url), 'utf8');
  const downloadsSource = readFileSync(new URL('../components/os/DownloadsFolder.astro', import.meta.url), 'utf8');
  const binSource = readFileSync(new URL('../components/os/BinFolder.astro', import.meta.url), 'utf8');
  const osWindowSource = readFileSync(new URL('../components/os/OsWindow.astro', import.meta.url), 'utf8');

  assert.match(osShellSource, /import DownloadsFolder from '\.\/DownloadsFolder\.astro';/);
  assert.match(osShellSource, /import BinFolder from '\.\/BinFolder\.astro';/);
  assert.match(osShellSource, /window\.id === 'downloads'[\s\S]*<DownloadsFolder \/>/);
  assert.match(osShellSource, /window\.id === 'bin'[\s\S]*<BinFolder \/>/);
  assert.match(osShellSource, /DownloadConfirmDialog/);
  assert.match(osShellSource, /downloadable files/);
  assert.match(osShellSource, /easter eggs/);
  assert.match(downloadsSource, /Click on file to download/);
  assert.match(downloadsSource, /Resume-BURAK-YUKSEL\.pdf/);
  assert.match(downloadsSource, /data-os-download-file/);
  assert.match(binSource, /Maze\.exe/);
  assert.match(binSource, /Quiz\.exe/);
  assert.match(binSource, /data-os-game-file/);
  assert.match(osWindowSource, /data-os-folder-drag-handle/);
  assert.doesNotMatch(osShellSource, /Downloads is an empty placeholder/);
  assert.doesNotMatch(osShellSource, /Bin is an empty placeholder/);
});

test('Maze.exe help copy is a concise reference for exit, controls, scoring, hazards, storage, and music', () => {
  const osShellSource = readFileSync(new URL('../components/os/OsShell.astro', import.meta.url), 'utf8');

  assert.match(osShellSource, /escape through the visible opening in the exterior wall/);
  assert.match(osShellSource, /Arrow keys or WASD/);
  assert.match(osShellSource, /touch D-pad/);
  assert.match(osShellSource, /Collectibles award additional points/);
  assert.match(osShellSource, /Dynamic gateway shifts begin at Level 3/);
  assert.match(osShellSource, /first monster begins at Level 6/);
  assert.match(osShellSource, /second monster begins at Level 11/);
  assert.match(osShellSource, /Monster contact immediately ends the run/);
  assert.match(osShellSource, /High scores are stored locally/);
  assert.match(osShellSource, /Exit to Bin ends the current run/);
  assert.match(osShellSource, /Music can be enabled or disabled/);
});

test('download confirmation dialog uses OS-local Yes and No actions', () => {
  const dialogSource = readFileSync(new URL('../components/os/DownloadConfirmDialog.astro', import.meta.url), 'utf8');
  const osCss = readFileSync(new URL('../styles/os.css', import.meta.url), 'utf8');

  assert.match(dialogSource, /Continue download Burak's Resume\?/);
  assert.match(dialogSource, /data-os-download-confirm-yes/);
  assert.match(dialogSource, /data-os-download-confirm-no/);
  assert.match(dialogSource, />\s*Yes\s*</);
  assert.match(dialogSource, />\s*No\s*</);
  assert.match(osCss, /\.os-download-confirm-layer/);
});

test('download confirmation traps keyboard focus and restores the opener on close', () => {
  const windowManagerSource = readFileSync(new URL('./os-window-manager.js', import.meta.url), 'utf8');

  assert.match(windowManagerSource, /lastDownloadTrigger/);
  assert.match(windowManagerSource, /focusDownloadConfirmTrigger/);
  assert.match(windowManagerSource, /trapDownloadConfirmFocus/);
  assert.match(windowManagerSource, /getFocusableElements\(downloadConfirmDialog\)/);
  assert.match(windowManagerSource, /event\.key !== 'Tab'/);
  assert.match(windowManagerSource, /closeDownloadConfirm\(\{\s*restoreFocus:\s*true\s*\}\)/);
});

test('Downloads links the protected resume PDF through the browser download flow only', () => {
  const downloadsSource = readFileSync(new URL('../components/os/DownloadsFolder.astro', import.meta.url), 'utf8');
  const windowManagerSource = readFileSync(new URL('./os-window-manager.js', import.meta.url), 'utf8');
  const pdfUrl = new URL('../../public/Resume-BURAK-YUKSEL.pdf', import.meta.url);

  assert.equal(existsSync(pdfUrl), true);
  assert.equal(statSync(pdfUrl).isFile(), true);
  assert.match(downloadsSource, /data-os-download-url="\/Resume-BURAK-YUKSEL\.pdf"/);
  assert.match(downloadsSource, /data-os-download-name="Resume-BURAK-YUKSEL\.pdf"/);
  assert.match(downloadsSource, /aria-label="Download Resume-BURAK-YUKSEL\.pdf"/);
  assert.equal([...downloadsSource.matchAll(/data-os-download-url=/g)].length, 1);
  assert.match(windowManagerSource, /const link = document\.createElement\('a'\);[\s\S]*link\.href = pendingDownload\.url;[\s\S]*link\.download = pendingDownload\.name;[\s\S]*document\.body\.append\(link\);[\s\S]*link\.click\(\);[\s\S]*link\.remove\(\);/);
  assert.doesNotMatch(downloadsSource, /data:application\/pdf|base64|<iframe/i);
  assert.doesNotMatch(windowManagerSource, /Resume-BURAK-YUKSEL\.pdf|Blob|FileReader|createObjectURL|XMLHttpRequest|fetch\s*\(/);
});

test('folder windows default above the taskbar and expose a drag affordance', () => {
  const osCss = readFileSync(new URL('../styles/os.css', import.meta.url), 'utf8');

  assert.match(osCss, /\.os-window--folder\s*\{[\s\S]*top:\s*calc\(50% - 2\.7rem\);/);
  assert.match(osCss, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.os-window--folder\s*\{[\s\S]*top:\s*calc\(50% - 1rem\);/);
  assert.match(osCss, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.os-window--folder\s*\{[\s\S]*width:\s*min\(calc\(100% - 2\.4rem\),\s*24rem\);/);
  assert.match(osCss, /\.os-window--folder\s+\.os-window-topbar\s*\{[\s\S]*cursor:\s*grab;[\s\S]*touch-action:\s*none;/);
  assert.match(osCss, /\.os-window--folder\[data-folder-dragging\]\s+\.os-window-topbar\s*\{[\s\S]*cursor:\s*grabbing;/);
});

test('GitHub.exe lets GitHubApp fill the whole OS window body', () => {
  const osCss = readFileSync(new URL('../styles/os.css', import.meta.url), 'utf8');
  const githubCss = readFileSync(new URL('../styles/github-app.css', import.meta.url), 'utf8');

  assert.match(osCss, /\.os-window--github\s+\.os-window-body\s*\{[\s\S]*padding:\s*0;[\s\S]*overflow:\s*hidden;[\s\S]*place-items:\s*stretch;/);
  assert.match(osCss, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.os-window--github\s+\.os-window-body\s*\{[\s\S]*padding:\s*0;[\s\S]*overflow:\s*hidden;[\s\S]*place-items:\s*stretch;/);
  assert.match(githubCss, /\.github-app\s*\{[\s\S]*width:\s*100%;[\s\S]*height:\s*100%;/);
});

test('Resume.exe fills the mobile OS window body on small screens', () => {
  const osCss = readFileSync(new URL('../styles/os.css', import.meta.url), 'utf8');
  const resumeCss = readFileSync(new URL('../styles/resume-app.css', import.meta.url), 'utf8');

  assert.match(osCss, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.os-window--resume\s+\.os-window-body\s*\{[\s\S]*padding:\s*0;[\s\S]*overflow:\s*hidden;[\s\S]*place-items:\s*stretch;/);
  assert.match(resumeCss, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.resume-app\s*\{[\s\S]*width:\s*100%;[\s\S]*height:\s*100%;[\s\S]*margin:\s*0;/);
});

test('shared OS controls use visible glyphs and keep minimise disabled', () => {
  const osWindowSource = readFileSync(new URL('../components/os/OsWindow.astro', import.meta.url), 'utf8');
  const helpDialogSource = readFileSync(new URL('../components/os/HelpDialog.astro', import.meta.url), 'utf8');
  const osCss = readFileSync(new URL('../styles/os.css', import.meta.url), 'utf8');

  assert.match(osWindowSource, /<span aria-hidden="true">X<\/span>/);
  assert.match(helpDialogSource, /<span aria-hidden="true">X<\/span>/);
  assert.match(osWindowSource, /os-window-control--minimise[\s\S]*disabled/);
  assert.match(osWindowSource, /<span aria-hidden="true">-<\/span>/);
  assert.match(osWindowSource, /<span aria-hidden="true">\?<\/span>/);
  assert.match(osCss, /\.os-window-control--minimise\s*\{[\s\S]*var\(--os-muted\)[\s\S]*opacity:\s*0\.[0-9]+;/);
});

test('shared help dialog traps keyboard focus and restores the help opener', () => {
  const windowManagerSource = readFileSync(new URL('./os-window-manager.js', import.meta.url), 'utf8');

  assert.match(windowManagerSource, /lastHelpTrigger/);
  assert.match(windowManagerSource, /focusHelpDialogTrigger/);
  assert.match(windowManagerSource, /trapHelpDialogFocus/);
  assert.match(windowManagerSource, /event\.key !== 'Tab'/);
  assert.match(windowManagerSource, /trapModalFocus\(event,\s*helpDialog\)/);
  assert.match(windowManagerSource, /getFocusableElements\(root\)/);
});

test('launcher open and close paths move focus between launchers and opened windows', () => {
  const windowManagerSource = readFileSync(new URL('./os-window-manager.js', import.meta.url), 'utf8');

  assert.match(windowManagerSource, /rememberLauncherTrigger/);
  assert.match(windowManagerSource, /focusLauncherForTarget/);
  assert.match(windowManagerSource, /dispatch\(createLauncherOpenAction\('taskbar'[\s\S]*focusOpenedWindow\(getTargetId\(taskbarLauncher\)\)/);
  assert.match(windowManagerSource, /dispatch\(createLauncherOpenAction\('desktop'[\s\S]*focusOpenedWindow\(getTargetId\(desktopLauncher\)\)/);
  assert.match(windowManagerSource, /focusLauncherForTarget\(closeId\)/);
  assert.match(windowManagerSource, /if \(isGameApp\(closeId\)\) focusGameReturnTarget\(closeId\);/);
});

test('OS startup hash opens redirected legacy destinations inside the shell', () => {
  const windowManagerSource = readFileSync(new URL('./os-window-manager.js', import.meta.url), 'utf8');

  assert.match(windowManagerSource, /applyStartupHashRoute/);
  assert.match(windowManagerSource, /parseOsStartupHash\(window\.location\.hash\)/);
  assert.match(windowManagerSource, /dispatch\(\{\s*type:\s*'open',\s*id:\s*route\.id\s*\}\)/);
  assert.match(windowManagerSource, /data-blog-deep-link/);
  assert.match(windowManagerSource, /blog-app:open-deep-link/);
  assert.match(windowManagerSource, /window\.addEventListener\('hashchange',\s*applyStartupHashRoute/);
});

test('folder drag positions are re-clamped on resize and orientation changes', () => {
  const windowManagerSource = readFileSync(new URL('./os-window-manager.js', import.meta.url), 'utf8');

  assert.match(windowManagerSource, /reclampFolderPositions/);
  assert.match(windowManagerSource, /window\.addEventListener\('resize',\s*reclampFolderPositions/);
  assert.match(windowManagerSource, /window\.addEventListener\('orientationchange',\s*reclampFolderPositions/);
});

test('Blog.exe uses its own chrome as the window topbar', () => {
  const osWindowSource = readFileSync(new URL('../components/os/OsWindow.astro', import.meta.url), 'utf8');
  const blogAppSource = readFileSync(new URL('../components/os/BlogApp.astro', import.meta.url), 'utf8');
  const osCss = readFileSync(new URL('../styles/os.css', import.meta.url), 'utf8');

  assert.match(osWindowSource, /id !== 'blog'/);
  assert.match(osWindowSource, /os-window--\$\{id\}/);
  assert.match(osCss, /\.os-window--blog\s+\.os-window-body\s*\{[\s\S]*padding:\s*0;/);
  assert.match(osCss, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.os-window--blog\s+\.os-window-body\s*\{[\s\S]*padding:\s*0;/);
  assert.match(osCss, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.os-window--blog\s*\{[\s\S]*border-radius:\s*0;/);
  assert.match(blogAppSource, /header class="blog-app__chrome"[\s\S]*data-blog-window-chrome/);
});
