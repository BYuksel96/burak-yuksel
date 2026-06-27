import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  bringFolderToFront,
  clampFolderDragPosition,
  createInitialOsState,
  createLauncherOpenAction,
  formatOsDateTime,
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
  assert.match(binSource, /data-os-game-file/);
  assert.doesNotMatch(binSource, /Quiz|Scrum/i);
  assert.match(osWindowSource, /data-os-folder-drag-handle/);
  assert.doesNotMatch(osShellSource, /Downloads is an empty placeholder/);
  assert.doesNotMatch(osShellSource, /Bin is an empty placeholder/);
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
