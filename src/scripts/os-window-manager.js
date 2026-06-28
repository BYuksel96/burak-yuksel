const MAIN_APPS = ['resume', 'blog', 'github'];
const FOLDER_APPS = ['downloads', 'bin'];
const GAME_APPS = ['maze', 'quiz'];
const ALL_TARGETS = [...MAIN_APPS, ...FOLDER_APPS, ...GAME_APPS];
const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const isMainApp = (id) => MAIN_APPS.includes(id);
const isFolderApp = (id) => FOLDER_APPS.includes(id);
const isGameApp = (id) => GAME_APPS.includes(id);

const uniqueFolders = (folders) => folders.filter((id, index) => FOLDER_APPS.includes(id) && folders.indexOf(id) === index);

const isTargetOpen = (state, id) => {
  if (isMainApp(id)) return state.activeMainApp === id;
  if (isGameApp(id)) return state.activeGameApp === id;
  return state.openFolders.includes(id);
};

export const bringFolderToFront = (folderZOrder = [], id) => {
  if (!FOLDER_APPS.includes(id)) return uniqueFolders(folderZOrder);

  return [...uniqueFolders(folderZOrder).filter((folderId) => folderId !== id), id];
};

const deriveFolderZOrder = (folderZOrder = [], openFolders = []) => {
  const openFolderSet = new Set(openFolders);
  const orderedOpenFolders = uniqueFolders(folderZOrder).filter((id) => openFolderSet.has(id));
  const missingOpenFolders = openFolders.filter((id) => !orderedOpenFolders.includes(id));

  return [...orderedOpenFolders, ...missingOpenFolders];
};

const deriveFolderPositions = (folderPositions = {}, openFolders = []) =>
  Object.entries(folderPositions).reduce((positions, [id, position]) => {
    if (openFolders.includes(id) && FOLDER_APPS.includes(id) && Number.isFinite(position?.x) && Number.isFinite(position?.y)) {
      positions[id] = position;
    }

    return positions;
  }, {});

export const clampFolderDragPosition = ({ desired, folderRect, screenRect, taskbarRect = null, inset = 8 }) => {
  const maxX = Math.max(inset, screenRect.width - folderRect.width - inset);
  const taskbarTop = Number.isFinite(taskbarRect?.top) ? taskbarRect.top : screenRect.height;
  const maxY = Math.max(inset, taskbarTop - folderRect.height - inset);

  return {
    x: Math.min(Math.max(desired.x, inset), maxX),
    y: Math.min(Math.max(desired.y, inset), maxY),
  };
};

export const shouldOpenDownloadConfirm = ({ pointerMode = 'hover', interactionType, key = '' } = {}) => {
  if (interactionType === 'click') return pointerMode === 'touch';
  if (interactionType === 'dblclick') return pointerMode !== 'touch';
  if (interactionType === 'keydown') return key === 'Enter' || key === ' ';

  return false;
};

export const createLauncherOpenAction = (launcherType, id, state = createInitialOsState()) => {
  if (!['desktop', 'taskbar'].includes(launcherType) || !ALL_TARGETS.includes(id)) {
    return null;
  }

  if (launcherType === 'taskbar' && isTargetOpen(state, id)) {
    return { type: 'close', id };
  }

  return { type: 'open', id };
};

export const getWindowFocusSelector = (id) => {
  if (id === 'maze') return '[data-maze-play]';
  if (id === 'quiz') return '[data-quiz-start-mode]';

  return '[data-os-window-close]';
};

export const getGameReturnFocusSelector = (id) => `[data-os-window-id="bin"] [data-os-game-file][data-os-target="${id}"]`;

export const getWindowCloseActions = (id, kind = '') => {
  if (!ALL_TARGETS.includes(id)) return [];
  if (kind === 'game' || isGameApp(id)) {
    return [
      { type: 'close', id },
      { type: 'open', id: 'bin' },
    ];
  }

  return [{ type: 'close', id }];
};

export const formatOsDateTime = (date = new Date(), locale = undefined) => {
  const parts = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
    .formatToParts(date)
    .reduce((result, part) => {
      if (part.type !== 'literal') {
        result[part.type] = part.value;
      }
      return result;
    }, {});

  if (locale === 'en-US') {
    return `${parts.weekday} ${parts.month} ${parts.day} ${parts.hour}:${parts.minute}`;
  }

  return `${parts.weekday} ${parts.day} ${parts.month} ${parts.hour}:${parts.minute}`;
};

const withDerivedState = (state) => ({
  ...state,
  openFolders: uniqueFolders(state.openFolders),
  folderZOrder: deriveFolderZOrder(state.folderZOrder, uniqueFolders(state.openFolders)),
  folderPositions: deriveFolderPositions(state.folderPositions, uniqueFolders(state.openFolders)),
  isTaskbarCompact: Boolean(state.activeMainApp || state.activeGameApp),
});

export const createInitialOsState = () => ({
  activeMainApp: null,
  activeGameApp: null,
  openFolders: [],
  folderZOrder: [],
  folderPositions: {},
  helpWindowId: null,
  isTaskbarCompact: false,
});

export const reduceOsWindowState = (state, action) => {
  if (!action) {
    return withDerivedState(state);
  }

  if (action.type === 'close-help') {
    return withDerivedState({
      ...state,
      helpWindowId: null,
    });
  }

  if (!ALL_TARGETS.includes(action.id)) {
    return withDerivedState(state);
  }

  if (action.type === 'open') {
    if (isMainApp(action.id)) {
      return withDerivedState({
        ...state,
        activeMainApp: action.id,
        activeGameApp: null,
      });
    }

    if (isFolderApp(action.id)) {
      return withDerivedState({
        ...state,
        openFolders: uniqueFolders([...state.openFolders, action.id]),
        folderZOrder: bringFolderToFront(state.folderZOrder, action.id),
      });
    }

    if (isGameApp(action.id)) {
      return withDerivedState({
        ...state,
        activeMainApp: null,
        activeGameApp: action.id,
      });
    }
  }

  if (action.type === 'close') {
    if (isMainApp(action.id)) {
      return withDerivedState({
        ...state,
        activeMainApp: state.activeMainApp === action.id ? null : state.activeMainApp,
        helpWindowId: state.helpWindowId === action.id ? null : state.helpWindowId,
      });
    }

    if (isGameApp(action.id)) {
      return withDerivedState({
        ...state,
        activeGameApp: state.activeGameApp === action.id ? null : state.activeGameApp,
        helpWindowId: state.helpWindowId === action.id ? null : state.helpWindowId,
      });
    }

    if (isFolderApp(action.id)) {
      const { [action.id]: _closedPosition, ...folderPositions } = state.folderPositions;

      return withDerivedState({
        ...state,
        openFolders: state.openFolders.filter((id) => id !== action.id),
        folderZOrder: state.folderZOrder.filter((id) => id !== action.id),
        folderPositions,
        helpWindowId: state.helpWindowId === action.id ? null : state.helpWindowId,
      });
    }
  }

  if (action.type === 'focus-folder' && isFolderApp(action.id)) {
    return withDerivedState({
      ...state,
      folderZOrder: state.openFolders.includes(action.id) ? bringFolderToFront(state.folderZOrder, action.id) : state.folderZOrder,
    });
  }

  if (action.type === 'move-folder' && isFolderApp(action.id) && state.openFolders.includes(action.id)) {
    return withDerivedState({
      ...state,
      folderPositions: {
        ...state.folderPositions,
        [action.id]: action.position,
      },
      folderZOrder: bringFolderToFront(state.folderZOrder, action.id),
    });
  }

  if (action.type === 'open-help') {
    return withDerivedState({
      ...state,
      helpWindowId: action.id,
    });
  }

  return withDerivedState(state);
};

const getTargetId = (element) => element?.getAttribute('data-os-target') ?? '';

const getWindowId = (element) => element?.closest('[data-os-window]')?.getAttribute('data-os-window-id') ?? '';

const getWindowKind = (element) => element?.closest('[data-os-window]')?.getAttribute('data-os-window-kind') ?? '';

const getFocusableElements = (root) =>
  Array.from(root?.querySelectorAll?.(FOCUSABLE_SELECTOR) ?? []).filter(
    (element) =>
      element instanceof HTMLElement &&
      !element.hidden &&
      !element.closest('[hidden], [aria-hidden="true"]') &&
      element.getAttribute('aria-disabled') !== 'true',
  );

export const initOsWindowManager = (screen) => {
  if (!screen || screen.dataset.osWindowManagerReady === 'true') return;

  screen.dataset.osWindowManagerReady = 'true';

  let state = createInitialOsState();
  const windows = Array.from(screen.querySelectorAll('[data-os-window]'));
  const taskbarItems = Array.from(screen.querySelectorAll('[data-os-launcher="taskbar"]'));
  const desktopItems = Array.from(screen.querySelectorAll('[data-os-launcher="desktop"]'));
  const windowLayer = screen.querySelector('[data-os-window-layer]') || screen;
  const taskbar = screen.querySelector('.os-taskbar');
  const helpDialog = screen.querySelector('[data-os-help-dialog]');
  const helpTitle = helpDialog?.querySelector('[data-os-help-title]');
  const helpCopy = helpDialog?.querySelector('[data-os-help-copy]');
  const helpCloseButton = helpDialog?.querySelector('[data-os-help-close-button]');
  const downloadConfirmDialog = screen.querySelector('[data-os-download-confirm]');
  const downloadConfirmYes = downloadConfirmDialog?.querySelector('[data-os-download-confirm-yes]');
  const statusTime = screen.querySelector('[data-os-status-time]');
  let statusTimeInterval;
  let dragState = null;
  let pendingDownload = null;
  let lastHelpTrigger = null;

  const isWindowOpen = (id) => isTargetOpen(state, id);

  const getHelpSource = (id) => windows.find((windowElement) => windowElement.getAttribute('data-os-window-id') === id);

  const focusElement = (element) => {
    if (element instanceof HTMLElement) {
      element.focus({ preventScroll: true });
      return true;
    }

    return false;
  };

  const focusOpenedWindow = (id) => {
    const windowElement = windows.find((element) => element.getAttribute('data-os-window-id') === id);
    if (!windowElement || windowElement.hidden) return false;

    return focusElement(windowElement.querySelector(getWindowFocusSelector(id))) || focusElement(getFocusableElements(windowElement)[0]);
  };

  const focusGameReturnTarget = (id) =>
    focusElement(screen.querySelector(getGameReturnFocusSelector(id))) ||
    focusElement(screen.querySelector('[data-os-window-id="bin"] [data-os-window-close]')) ||
    focusElement(screen.querySelector('[data-os-launcher="taskbar"][data-os-target="bin"]'));

  const focusHelpDialogTrigger = () => {
    const trigger = lastHelpTrigger;
    lastHelpTrigger = null;

    if (!trigger || !document.contains(trigger) || trigger.closest('[hidden], [aria-hidden="true"]')) return false;

    return focusElement(trigger);
  };

  const trapHelpDialogFocus = (event) => {
    if (!helpDialog || helpDialog.hidden || !state.helpWindowId || event.key !== 'Tab') return false;

    const focusable = getFocusableElements(helpDialog);
    if (!focusable.length) {
      event.preventDefault();
      return true;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!helpDialog.contains(document.activeElement)) {
      event.preventDefault();
      focusElement(first);
      return true;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      focusElement(last);
      return true;
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      focusElement(first);
      return true;
    }

    return false;
  };

  const renderHelpDialog = () => {
    if (!helpDialog) return;

    const source = state.helpWindowId ? getHelpSource(state.helpWindowId) : null;
    const isOpen = Boolean(source);

    helpDialog.hidden = !isOpen;
    helpDialog.setAttribute('aria-hidden', String(!isOpen));

    if (!isOpen) return;

    if (helpTitle) {
      helpTitle.textContent = source.getAttribute('data-os-help-title') || 'Help';
    }

    if (helpCopy) {
      helpCopy.textContent = source.getAttribute('data-os-help-copy') || '';
    }

    helpCloseButton?.focus({ preventScroll: true });
  };

  const render = () => {
    screen.dataset.activeMainApp = state.activeMainApp ?? '';
    screen.dataset.activeGameApp = state.activeGameApp ?? '';
    screen.dataset.taskbarMode = state.isTaskbarCompact ? 'compact' : 'default';

    windows.forEach((windowElement) => {
      const id = windowElement.getAttribute('data-os-window-id') ?? '';
      const kind = windowElement.getAttribute('data-os-window-kind') ?? '';
      const open = isWindowOpen(id);
      const folderPosition = state.folderPositions[id];

      windowElement.hidden = !open;
      windowElement.setAttribute('aria-hidden', String(!open));
      windowElement.setAttribute('data-window-state', open ? 'open' : 'closed');

      if (kind === 'folder') {
        const zIndex = state.folderZOrder.indexOf(id);
        windowElement.style.zIndex = open && zIndex >= 0 ? String(12 + zIndex) : '';

        if (folderPosition) {
          windowElement.style.left = `${folderPosition.x}px`;
          windowElement.style.top = `${folderPosition.y}px`;
          windowElement.style.transform = 'none';
          windowElement.toggleAttribute('data-folder-positioned', true);
        } else {
          windowElement.style.left = '';
          windowElement.style.top = '';
          windowElement.style.transform = '';
          windowElement.toggleAttribute('data-folder-positioned', false);
        }
      }
    });

    taskbarItems.forEach((item) => {
      const id = getTargetId(item);
      const open = isWindowOpen(id);
      const active = state.activeMainApp === id;

      item.setAttribute('aria-pressed', String(open));
      item.toggleAttribute('data-os-open', open);
      item.toggleAttribute('data-os-active', active);
    });

    desktopItems.forEach((item) => {
      const id = getTargetId(item);
      item.toggleAttribute('data-os-open', isWindowOpen(id));
    });

    renderHelpDialog();
  };

  const dispatch = (action) => {
    if (!action) return;

    state = reduceOsWindowState(state, action);
    render();
  };

  const closeHelpDialog = ({ restoreFocus = true } = {}) => {
    const hadOpenHelp = Boolean(state.helpWindowId);
    dispatch({ type: 'close-help', id: state.helpWindowId ?? '' });

    if (hadOpenHelp && restoreFocus) {
      focusHelpDialogTrigger();
    }
  };

  const setHelpDialogOrigin = (button) => {
    if (!helpDialog || !(button instanceof Element)) return;

    const buttonRect = button.getBoundingClientRect();
    const screenRect = screen.getBoundingClientRect();
    const originX = ((buttonRect.left + buttonRect.width / 2 - screenRect.left) / screenRect.width) * 100;
    const originY = ((buttonRect.top + buttonRect.height / 2 - screenRect.top) / screenRect.height) * 100;

    helpDialog.style.setProperty('--help-origin-x', `${originX}%`);
    helpDialog.style.setProperty('--help-origin-y', `${originY}%`);
    helpDialog.dataset.helpOrigin = 'button';
  };

  const updateStatusTime = () => {
    if (!statusTime) return;

    const now = new Date();
    statusTime.textContent = formatOsDateTime(now, navigator.language);
    statusTime.setAttribute('datetime', now.toISOString());
  };

  const updatePointerMode = (event) => {
    if (!event.pointerType) return;

    screen.dataset.osPointer = event.pointerType === 'touch' ? 'touch' : 'hover';
  };

  const getLocalRect = (rect) => {
    const layerRect = windowLayer.getBoundingClientRect();

    return {
      top: rect.top - layerRect.top,
      right: rect.right - layerRect.left,
      bottom: rect.bottom - layerRect.top,
      left: rect.left - layerRect.left,
      width: rect.width,
      height: rect.height,
    };
  };

  const getCurrentFolderPosition = (windowElement, id) => {
    const savedPosition = state.folderPositions[id];
    if (savedPosition) return savedPosition;

    const folderRect = getLocalRect(windowElement.getBoundingClientRect());

    return {
      x: folderRect.left,
      y: folderRect.top,
    };
  };

  const focusFolderWindow = (target) => {
    const folderWindow = target.closest('[data-os-window-kind="folder"]');
    if (!folderWindow) return null;

    const id = folderWindow.getAttribute('data-os-window-id') ?? '';
    dispatch({ type: 'focus-folder', id });

    return folderWindow;
  };

  const startFolderDrag = (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const handle = target.closest('[data-os-folder-drag-handle]');
    if (!handle || target.closest('.os-window-controls')) return;

    const folderWindow = handle.closest('[data-os-window-kind="folder"]');
    if (!(folderWindow instanceof HTMLElement) || folderWindow.hidden) return;

    const id = folderWindow.getAttribute('data-os-window-id') ?? '';
    const startPosition = getCurrentFolderPosition(folderWindow, id);

    event.preventDefault();
    dragState = {
      id,
      element: folderWindow,
      handle,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startPosition,
    };

    folderWindow.toggleAttribute('data-folder-dragging', true);

    if (typeof handle.setPointerCapture === 'function') {
      try {
        handle.setPointerCapture(event.pointerId);
      } catch {
        // Synthetic QA events do not always create an active pointer, but real pointer input does.
      }
    }
  };

  const moveFolderDrag = (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    event.preventDefault();

    const folderRect = dragState.element.getBoundingClientRect();
    const layerRect = windowLayer.getBoundingClientRect();
    const taskbarRect = taskbar?.getBoundingClientRect();
    const nextPosition = clampFolderDragPosition({
      desired: {
        x: dragState.startPosition.x + event.clientX - dragState.startClientX,
        y: dragState.startPosition.y + event.clientY - dragState.startClientY,
      },
      folderRect: {
        width: folderRect.width,
        height: folderRect.height,
      },
      screenRect: {
        width: layerRect.width,
        height: layerRect.height,
      },
      taskbarRect: taskbarRect
        ? {
            top: taskbarRect.top - layerRect.top,
          }
        : null,
    });

    dispatch({ type: 'move-folder', id: dragState.id, position: nextPosition });
  };

  const stopFolderDrag = (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    dragState.element.toggleAttribute('data-folder-dragging', false);

    if (typeof dragState.handle.releasePointerCapture === 'function') {
      try {
        dragState.handle.releasePointerCapture(event.pointerId);
      } catch {
        // Match the guarded capture path for synthetic QA events.
      }
    }

    dragState = null;
  };

  const renderDownloadConfirm = () => {
    if (!downloadConfirmDialog) return;

    const isOpen = Boolean(pendingDownload);
    downloadConfirmDialog.hidden = !isOpen;
    downloadConfirmDialog.setAttribute('aria-hidden', String(!isOpen));

    if (isOpen) {
      downloadConfirmYes?.focus({ preventScroll: true });
    }
  };

  const openDownloadConfirm = (downloadFile) => {
    pendingDownload = {
      url: downloadFile.getAttribute('data-os-download-url') || '',
      name: downloadFile.getAttribute('data-os-download-name') || 'download',
    };

    renderDownloadConfirm();
  };

  const closeDownloadConfirm = () => {
    pendingDownload = null;
    renderDownloadConfirm();
  };

  const triggerPendingDownload = () => {
    if (!pendingDownload?.url) {
      closeDownloadConfirm();
      return;
    }

    const link = document.createElement('a');
    link.href = pendingDownload.url;
    link.download = pendingDownload.name;
    link.style.display = 'none';

    document.body.append(link);
    link.click();
    link.remove();

    closeDownloadConfirm();
  };

  screen.addEventListener('pointerdown', updatePointerMode);
  screen.addEventListener('pointerover', updatePointerMode);
  screen.addEventListener('pointermove', updatePointerMode);

  screen.addEventListener('pointerdown', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    focusFolderWindow(target);
    startFolderDrag(event);
  });

  screen.addEventListener('pointermove', moveFolderDrag);
  screen.addEventListener('pointerup', stopFolderDrag);
  screen.addEventListener('pointercancel', stopFolderDrag);

  screen.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (target.closest('[data-os-download-confirm-yes]')) {
      event.preventDefault();
      triggerPendingDownload();
      return;
    }

    if (target.closest('[data-os-download-confirm-no]')) {
      event.preventDefault();
      closeDownloadConfirm();
      return;
    }

    const taskbarLauncher = target.closest('[data-os-launcher="taskbar"]');
    if (taskbarLauncher) {
      dispatch(createLauncherOpenAction('taskbar', getTargetId(taskbarLauncher), state));
      return;
    }

    const desktopLauncher = target.closest('[data-os-launcher="desktop"]');
    if (desktopLauncher) {
      dispatch(createLauncherOpenAction('desktop', getTargetId(desktopLauncher)));
      return;
    }

    const closeButton = target.closest('[data-os-window-close]');
    if (closeButton) {
      const closeId = getWindowId(closeButton);
      const closeKind = getWindowKind(closeButton);
      getWindowCloseActions(closeId, closeKind).forEach(dispatch);
      if (isGameApp(closeId)) focusGameReturnTarget(closeId);
      return;
    }

    const helpButton = target.closest('[data-os-window-help]');
    if (helpButton) {
      lastHelpTrigger = helpButton instanceof HTMLElement ? helpButton : null;
      setHelpDialogOrigin(helpButton);
      dispatch({ type: 'open-help', id: getWindowId(helpButton) });
      return;
    }

    if (target.closest('[data-os-help-close]')) {
      closeHelpDialog();
      return;
    }

    const downloadFile = target.closest('[data-os-download-file]');
    if (downloadFile) {
      event.preventDefault();

      if (shouldOpenDownloadConfirm({ pointerMode: screen.dataset.osPointer || 'hover', interactionType: 'click' })) {
        openDownloadConfirm(downloadFile);
      } else {
        downloadFile.toggleAttribute('data-os-selected', true);
      }
      return;
    }

    const gameFile = target.closest('[data-os-game-file]');
    if (gameFile) {
      event.preventDefault();
      const gameId = getTargetId(gameFile);
      dispatch({ type: 'open', id: gameId });
      focusOpenedWindow(gameId);
      return;
    }

    const gameExit = target.closest('[data-os-game-exit]');
    if (gameExit) {
      event.preventDefault();
      const gameId = getWindowId(gameExit);
      getWindowCloseActions(gameId, 'game').forEach(dispatch);
      focusGameReturnTarget(gameId);
    }
  });

  screen.addEventListener('dblclick', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const downloadFile = target.closest('[data-os-download-file]');
    if (!downloadFile) return;

    event.preventDefault();

    if (shouldOpenDownloadConfirm({ pointerMode: screen.dataset.osPointer || 'hover', interactionType: 'dblclick' })) {
      openDownloadConfirm(downloadFile);
    }
  });

  screen.addEventListener('keydown', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (trapHelpDialogFocus(event)) {
      return;
    }

    if (event.key === 'Escape' && pendingDownload) {
      closeDownloadConfirm();
      return;
    }

    if (event.key === 'Escape' && state.helpWindowId) {
      closeHelpDialog();
      return;
    }

    const desktopLauncher = target.closest('[data-os-launcher="desktop"]');
    if (desktopLauncher && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      dispatch(createLauncherOpenAction('desktop', getTargetId(desktopLauncher)));
      return;
    }

    const downloadFile = target.closest('[data-os-download-file]');
    if (downloadFile && shouldOpenDownloadConfirm({ pointerMode: screen.dataset.osPointer || 'hover', interactionType: 'keydown', key: event.key })) {
      event.preventDefault();
      openDownloadConfirm(downloadFile);
      return;
    }

    const gameFile = target.closest('[data-os-game-file]');
    if (gameFile && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      const gameId = getTargetId(gameFile);
      dispatch({ type: 'open', id: gameId });
      focusOpenedWindow(gameId);
    }
  });

  updateStatusTime();
  statusTimeInterval = window.setInterval(updateStatusTime, 60000);
  window.addEventListener(
    'pagehide',
    () => {
      if (statusTimeInterval) {
        window.clearInterval(statusTimeInterval);
      }
    },
    { once: true },
  );

  render();
};
