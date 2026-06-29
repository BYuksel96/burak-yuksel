import { LANGUAGE_CHANGE_EVENT, getActiveLanguage, getLanguageLocale, translate } from './i18n.js';

const MAIN_APPS = ['resume', 'blog', 'github'];
const FOLDER_APPS = ['downloads', 'bin'];
const GAME_APPS = ['maze', 'quiz'];
const ALL_TARGETS = [...MAIN_APPS, ...FOLDER_APPS, ...GAME_APPS];
const STARTUP_HASH_APPS = [...MAIN_APPS, ...FOLDER_APPS];
const OS_THEMES = ['dark', 'light'];
const OS_THEME_STORAGE_KEY = 'burak-os-theme';
const LOCK_SWIPE_MIN_DISTANCE = 48;
const LOCK_SCREEN_INSTRUCTIONS = {
  desktop: {
    mode: 'desktop',
    copy: 'Press Enter key to unlock',
  },
  touch: {
    mode: 'touch',
    copy: 'Swipe up to unlock',
  },
};
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

const normalizeOsTheme = (theme) => (OS_THEMES.includes(theme) ? theme : null);

export const resolveOsTheme = ({ storedTheme = null, prefersLight = false } = {}) => normalizeOsTheme(storedTheme) ?? (prefersLight ? 'light' : 'dark');

export const getNextOsTheme = (theme) => (normalizeOsTheme(theme) === 'light' ? 'dark' : 'light');

export const createOsThemeSessionStore = (getStorage = () => (typeof window !== 'undefined' ? window.sessionStorage : null)) => {
  let memoryTheme = null;

  return {
    read() {
      try {
        const storedTheme = normalizeOsTheme(getStorage()?.getItem(OS_THEME_STORAGE_KEY));
        if (storedTheme) {
          memoryTheme = storedTheme;
          return storedTheme;
        }
      } catch {
        // Some browsers or privacy modes can block storage. The session still gets an in-memory preference.
      }

      return memoryTheme;
    },
    write(theme) {
      const nextTheme = normalizeOsTheme(theme);
      if (!nextTheme) return memoryTheme;

      memoryTheme = nextTheme;

      try {
        getStorage()?.setItem(OS_THEME_STORAGE_KEY, nextTheme);
      } catch {
        // Keep the in-memory value when sessionStorage is unavailable.
      }

      return memoryTheme;
    },
  };
};

export const getLockScreenInstruction = (pointerMode = 'hover') =>
  pointerMode === 'touch' ? { ...LOCK_SCREEN_INSTRUCTIONS.touch } : { ...LOCK_SCREEN_INSTRUCTIONS.desktop };

export const shouldUnlockLockScreen = ({
  pointerMode = 'hover',
  interactionType,
  key = '',
  swipeStartY,
  swipeEndY,
  swipeMinDistance = LOCK_SWIPE_MIN_DISTANCE,
} = {}) => {
  if (pointerMode === 'touch') {
    return (
      interactionType === 'swipe' &&
      Number.isFinite(swipeStartY) &&
      Number.isFinite(swipeEndY) &&
      swipeStartY - swipeEndY >= swipeMinDistance
    );
  }

  return interactionType === 'keydown' && key === 'Enter';
};

export const parseOsStartupHash = (hash = '') => {
  const hashValue = String(hash ?? '').trim().replace(/^#/, '');
  if (!hashValue) return null;

  const params = new URLSearchParams(hashValue);
  const blogSlug = params.get('blog') ?? '';
  if (blogSlug) return { id: 'blog', blogSlug };

  const appId = params.get('app') ?? '';
  if (STARTUP_HASH_APPS.includes(appId)) return { id: appId, blogSlug: '' };

  return null;
};

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

export const clampFolderPositionMap = ({ positions = {}, folderRects = {}, screenRect, taskbarRect = null, inset = 8 } = {}) =>
  Object.entries(positions).reduce((nextPositions, [id, position]) => {
    const folderRect = folderRects[id];
    if (!FOLDER_APPS.includes(id) || !folderRect || !Number.isFinite(position?.x) || !Number.isFinite(position?.y)) {
      return nextPositions;
    }

    nextPositions[id] = clampFolderDragPosition({
      desired: position,
      folderRect,
      screenRect,
      taskbarRect,
      inset,
    });

    return nextPositions;
  }, {});

export const shouldOpenDownloadConfirm = ({ pointerMode = 'hover', interactionType, key = '' } = {}) => {
  if (interactionType === 'click') return pointerMode === 'touch';
  if (interactionType === 'dblclick') return pointerMode !== 'touch';
  if (interactionType === 'keydown') return key === 'Enter' || key === ' ';

  return false;
};

export const getLauncherFocusSelectors = (id, preferredLauncherType = '') => {
  if (!ALL_TARGETS.includes(id) || isGameApp(id)) return [];

  const fallbackTypes = ['desktop', 'taskbar'];
  const launcherTypes = fallbackTypes.includes(preferredLauncherType)
    ? [preferredLauncherType, ...fallbackTypes.filter((type) => type !== preferredLauncherType)]
    : fallbackTypes;

  return launcherTypes.map((type) => `[data-os-launcher="${type}"][data-os-target="${id}"]`);
};

export const getNextModalFocusIndex = ({ currentIndex = -1, focusableCount = 0, shiftKey = false } = {}) => {
  if (focusableCount <= 0) return -1;
  if (currentIndex < 0) return shiftKey ? focusableCount - 1 : 0;

  return (currentIndex + (shiftKey ? -1 : 1) + focusableCount) % focusableCount;
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

  if (action.type === 'clamp-folder' && isFolderApp(action.id) && state.openFolders.includes(action.id)) {
    return withDerivedState({
      ...state,
      folderPositions: {
        ...state.folderPositions,
        [action.id]: action.position,
      },
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
  const themeToggle = screen.querySelector('[data-os-theme-toggle]');
  const lockButton = screen.querySelector('[data-os-lock-button]');
  const lockScreen = screen.querySelector('[data-os-lock-screen]');
  const themeRoot = document.body?.classList.contains('os-body') ? document.body : screen.closest('.os-body');
  const themeStore = createOsThemeSessionStore();
  let statusTimeInterval;
  let dragState = null;
  let pendingDownload = null;
  let lastHelpTrigger = null;
  let lastDownloadTrigger = null;
  let lastLockTrigger = null;
  const launcherTriggers = new Map();
  let lockSwipeStartY = null;
  let isLockScreenOpen = false;
  let activeTheme = resolveOsTheme({
    storedTheme: themeStore.read(),
    prefersLight: window.matchMedia?.('(prefers-color-scheme: light)')?.matches ?? false,
  });

  const isWindowOpen = (id) => isTargetOpen(state, id);

  const getHelpSource = (id) => windows.find((windowElement) => windowElement.getAttribute('data-os-window-id') === id);

  const focusElement = (element) => {
    if (element instanceof HTMLElement) {
      element.focus({ preventScroll: true });
      return true;
    }

    return false;
  };

  const renderTheme = () => {
    if (themeRoot) {
      themeRoot.dataset.osTheme = activeTheme;
    }

    screen.dataset.osTheme = activeTheme;

    if (!themeToggle) return;

    const nextTheme = getNextOsTheme(activeTheme);
    const nextThemeLabel = translate(nextTheme === 'light' ? 'os.topbar.themeLight' : 'os.topbar.themeDark');
    themeToggle.setAttribute('aria-pressed', String(activeTheme === 'light'));
    themeToggle.setAttribute('aria-label', nextThemeLabel);
    themeToggle.setAttribute('title', nextThemeLabel);
  };

  const toggleTheme = () => {
    activeTheme = themeStore.write(getNextOsTheme(activeTheme)) ?? activeTheme;
    renderTheme();
  };

  const renderLockMode = () => {
    if (!lockScreen) return;

    const instruction = getLockScreenInstruction(screen.dataset.osPointer || 'hover');
    const copy = translate(instruction.mode === 'touch' ? 'os.lock.touch' : 'os.lock.desktop');
    lockScreen.dataset.osLockMode = instruction.mode;
    lockScreen.setAttribute('aria-label', copy);
  };

  const renderLockScreen = ({ focus = false } = {}) => {
    if (!lockScreen) return;

    renderLockMode();
    lockScreen.hidden = !isLockScreenOpen;
    lockScreen.setAttribute('aria-hidden', String(!isLockScreenOpen));
    screen.toggleAttribute('data-os-locked', isLockScreenOpen);

    if (isLockScreenOpen && focus) {
      focusElement(lockScreen);
    }
  };

  const openLockScreen = (trigger) => {
    if (!lockScreen) return;

    lastLockTrigger = trigger instanceof HTMLElement ? trigger : null;
    isLockScreenOpen = true;
    dragState = null;
    lockSwipeStartY = null;
    renderLockScreen({ focus: true });
  };

  const closeLockScreen = () => {
    if (!isLockScreenOpen) return;

    isLockScreenOpen = false;
    lockSwipeStartY = null;
    renderLockScreen();

    if (!focusElement(lastLockTrigger)) {
      focusElement(lockButton);
    }
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

  const rememberLauncherTrigger = (launcher) => {
    const id = getTargetId(launcher);
    const type = launcher?.getAttribute('data-os-launcher') ?? '';
    if (!id || isGameApp(id) || !(launcher instanceof HTMLElement)) return;

    launcherTriggers.set(id, { type, element: launcher });
  };

  const focusLauncherForTarget = (id) => {
    const remembered = launcherTriggers.get(id);
    if (remembered?.element && document.contains(remembered.element) && !remembered.element.closest('[hidden], [aria-hidden="true"]')) {
      return focusElement(remembered.element);
    }

    return getLauncherFocusSelectors(id, remembered?.type).some((selector) => focusElement(screen.querySelector(selector)));
  };

  const focusHelpDialogTrigger = () => {
    const trigger = lastHelpTrigger;
    lastHelpTrigger = null;

    if (!trigger || !document.contains(trigger) || trigger.closest('[hidden], [aria-hidden="true"]')) return false;

    return focusElement(trigger);
  };

  const focusDownloadConfirmTrigger = () => {
    const trigger = lastDownloadTrigger;
    lastDownloadTrigger = null;

    if (!trigger || !document.contains(trigger) || trigger.closest('[hidden], [aria-hidden="true"]')) return false;

    return focusElement(trigger);
  };

  const trapModalFocus = (event, root) => {
    const focusable = getFocusableElements(root);
    const nextIndex = getNextModalFocusIndex({
      currentIndex: focusable.indexOf(document.activeElement),
      focusableCount: focusable.length,
      shiftKey: event.shiftKey,
    });

    if (nextIndex < 0) {
      event.preventDefault();
      return true;
    }

    const isOutside = !root.contains(document.activeElement);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const shouldWrap = isOutside || (event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last);

    if (!shouldWrap) return false;

    event.preventDefault();
    focusElement(focusable[nextIndex]);
    return true;
  };

  const trapHelpDialogFocus = (event) => {
    if (!helpDialog || helpDialog.hidden || !state.helpWindowId || event.key !== 'Tab') return false;

    return trapModalFocus(event, helpDialog);
  };

  const trapDownloadConfirmFocus = (event) => {
    if (!downloadConfirmDialog || downloadConfirmDialog.hidden || !pendingDownload || event.key !== 'Tab') return false;

    const confirmControls = getFocusableElements(downloadConfirmDialog).filter(
      (element) =>
        element.matches('[data-os-download-confirm-yes], [data-os-download-confirm-no]') &&
        !element.classList.contains('os-download-confirm-backdrop'),
    );
    const focusRoot = {
      contains: (element) => downloadConfirmDialog.contains(element),
    };
    const nextIndex = getNextModalFocusIndex({
      currentIndex: confirmControls.indexOf(document.activeElement),
      focusableCount: confirmControls.length,
      shiftKey: event.shiftKey,
    });

    if (nextIndex < 0) {
      event.preventDefault();
      return true;
    }

    const first = confirmControls[0];
    const last = confirmControls[confirmControls.length - 1];
    const shouldWrap =
      !focusRoot.contains(document.activeElement) ||
      !confirmControls.includes(document.activeElement) ||
      (event.shiftKey && document.activeElement === first) ||
      (!event.shiftKey && document.activeElement === last);

    if (!shouldWrap) return false;

    event.preventDefault();
    focusElement(confirmControls[nextIndex]);
    return true;
  };

  const renderHelpDialog = () => {
    if (!helpDialog) return;

    const source = state.helpWindowId ? getHelpSource(state.helpWindowId) : null;
    const isOpen = Boolean(source);

    helpDialog.hidden = !isOpen;
    helpDialog.setAttribute('aria-hidden', String(!isOpen));

    if (!isOpen) return;

    if (helpTitle) {
      const titleKey = source.getAttribute('data-os-help-title-key') ?? '';
      helpTitle.textContent = titleKey ? translate(titleKey, getActiveLanguage()) : source.getAttribute('data-os-help-title') || translate('os.controls.help');
    }

    if (helpCopy) {
      const copyKey = source.getAttribute('data-os-help-copy-key') ?? '';
      helpCopy.textContent = copyKey ? translate(copyKey, getActiveLanguage()) : source.getAttribute('data-os-help-copy') || '';
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
    statusTime.textContent = formatOsDateTime(now, getLanguageLocale(getActiveLanguage(), 'en-GB'));
    statusTime.setAttribute('datetime', now.toISOString());
  };

  const updatePointerMode = (event) => {
    if (!event.pointerType) return;

    screen.dataset.osPointer = event.pointerType === 'touch' ? 'touch' : 'hover';
    renderLockMode();
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

  const reclampFolderPositions = () => {
    const layerRect = windowLayer.getBoundingClientRect();
    const taskbarBounds = taskbar?.getBoundingClientRect();
    const folderRects = Object.fromEntries(
      windows
        .filter((windowElement) => windowElement.getAttribute('data-os-window-kind') === 'folder' && !windowElement.hidden)
        .map((windowElement) => {
          const id = windowElement.getAttribute('data-os-window-id') ?? '';
          const rect = windowElement.getBoundingClientRect();
          return [id, { width: rect.width, height: rect.height }];
        }),
    );
    const nextPositions = clampFolderPositionMap({
      positions: state.folderPositions,
      folderRects,
      screenRect: {
        width: layerRect.width,
        height: layerRect.height,
      },
      taskbarRect: taskbarBounds
        ? {
            top: taskbarBounds.top - layerRect.top,
          }
        : null,
    });

    Object.entries(nextPositions).forEach(([id, position]) => {
      const current = state.folderPositions[id];
      if (!current || current.x !== position.x || current.y !== position.y) {
        dispatch({ type: 'clamp-folder', id, position });
      }
    });
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
    lastDownloadTrigger = downloadFile instanceof HTMLElement ? downloadFile : null;
    pendingDownload = {
      url: downloadFile.getAttribute('data-os-download-url') || '',
      name: downloadFile.getAttribute('data-os-download-name') || 'download',
    };

    renderDownloadConfirm();
  };

  const closeDownloadConfirm = ({ restoreFocus = true } = {}) => {
    const hadPendingDownload = Boolean(pendingDownload);
    pendingDownload = null;
    renderDownloadConfirm();

    if (hadPendingDownload && restoreFocus) {
      focusDownloadConfirmTrigger();
    }
  };

  const triggerPendingDownload = () => {
    if (!pendingDownload?.url) {
      closeDownloadConfirm({ restoreFocus: true });
      return;
    }

    const link = document.createElement('a');
    link.href = pendingDownload.url;
    link.download = pendingDownload.name;
    link.style.display = 'none';

    document.body.append(link);
    link.click();
    link.remove();

    closeDownloadConfirm({ restoreFocus: true });
  };

  const applyStartupHashRoute = () => {
    const route = parseOsStartupHash(window.location.hash);
    if (!route) return false;

    dispatch({ type: 'open', id: route.id });
    focusOpenedWindow(route.id);

    if (route.blogSlug) {
      const blogRoot = screen.querySelector('[data-blog-app]');
      if (blogRoot instanceof HTMLElement) {
        blogRoot.setAttribute('data-blog-deep-link', route.blogSlug);
        blogRoot.dispatchEvent(
          new CustomEvent('blog-app:open-deep-link', {
            detail: {
              slug: route.blogSlug,
              focus: true,
            },
          }),
        );
      }
    }

    return true;
  };

  screen.addEventListener('pointerdown', updatePointerMode);
  screen.addEventListener('pointerover', updatePointerMode);
  screen.addEventListener('pointermove', updatePointerMode);

  screen.addEventListener('pointerdown', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (isLockScreenOpen) {
      if (target.closest('[data-os-lock-screen]')) {
        event.preventDefault();
        lockSwipeStartY = event.clientY;
        focusElement(lockScreen);
      }
      return;
    }

    focusFolderWindow(target);
    startFolderDrag(event);
  });

  screen.addEventListener('pointermove', (event) => {
    if (isLockScreenOpen) return;

    moveFolderDrag(event);
  });

  screen.addEventListener('pointerup', (event) => {
    if (isLockScreenOpen) {
      const target = event.target;
      const isLockTarget = target instanceof Element && target.closest('[data-os-lock-screen]');

      if (isLockTarget) {
        event.preventDefault();

        if (
          shouldUnlockLockScreen({
            pointerMode: screen.dataset.osPointer || 'hover',
            interactionType: 'swipe',
            swipeStartY: lockSwipeStartY,
            swipeEndY: event.clientY,
          })
        ) {
          closeLockScreen();
        } else {
          focusElement(lockScreen);
        }
      }

      lockSwipeStartY = null;
      return;
    }

    stopFolderDrag(event);
  });

  screen.addEventListener('pointercancel', (event) => {
    if (isLockScreenOpen) {
      lockSwipeStartY = null;
      return;
    }

    stopFolderDrag(event);
  });

  screen.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (isLockScreenOpen) {
      event.preventDefault();
      focusElement(lockScreen);
      return;
    }

    if (target.closest('[data-os-theme-toggle]')) {
      event.preventDefault();
      toggleTheme();
      return;
    }

    const lockTrigger = target.closest('[data-os-lock-button]');
    if (lockTrigger) {
      event.preventDefault();
      openLockScreen(lockTrigger);
      return;
    }

    if (target.closest('[data-os-download-confirm-yes]')) {
      event.preventDefault();
      triggerPendingDownload();
      return;
    }

    if (target.closest('[data-os-download-confirm-no]')) {
      event.preventDefault();
      closeDownloadConfirm({ restoreFocus: true });
      return;
    }

    const taskbarLauncher = target.closest('[data-os-launcher="taskbar"]');
    if (taskbarLauncher) {
      rememberLauncherTrigger(taskbarLauncher);
      dispatch(createLauncherOpenAction('taskbar', getTargetId(taskbarLauncher), state));
      if (isWindowOpen(getTargetId(taskbarLauncher))) focusOpenedWindow(getTargetId(taskbarLauncher));
      else focusLauncherForTarget(getTargetId(taskbarLauncher));
      return;
    }

    const desktopLauncher = target.closest('[data-os-launcher="desktop"]');
    if (desktopLauncher) {
      rememberLauncherTrigger(desktopLauncher);
      dispatch(createLauncherOpenAction('desktop', getTargetId(desktopLauncher)));
      focusOpenedWindow(getTargetId(desktopLauncher));
      return;
    }

    const closeButton = target.closest('[data-os-window-close]');
    if (closeButton) {
      const closeId = getWindowId(closeButton);
      const closeKind = getWindowKind(closeButton);
      getWindowCloseActions(closeId, closeKind).forEach(dispatch);
      if (isGameApp(closeId)) focusGameReturnTarget(closeId);
      else focusLauncherForTarget(closeId);
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

    if (isLockScreenOpen) {
      if (shouldUnlockLockScreen({ pointerMode: screen.dataset.osPointer || 'hover', interactionType: 'keydown', key: event.key })) {
        event.preventDefault();
        closeLockScreen();
      } else if (target.closest('[data-os-lock-screen]')) {
        event.preventDefault();
        focusElement(lockScreen);
      }
      return;
    }

    if (trapHelpDialogFocus(event)) {
      return;
    }

    if (trapDownloadConfirmFocus(event)) {
      return;
    }

    if (event.key === 'Escape' && pendingDownload) {
      closeDownloadConfirm({ restoreFocus: true });
      return;
    }

    if (event.key === 'Escape' && state.helpWindowId) {
      closeHelpDialog();
      return;
    }

    const desktopLauncher = target.closest('[data-os-launcher="desktop"]');
    if (desktopLauncher && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      rememberLauncherTrigger(desktopLauncher);
      dispatch(createLauncherOpenAction('desktop', getTargetId(desktopLauncher)));
      focusOpenedWindow(getTargetId(desktopLauncher));
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

  window.addEventListener('resize', reclampFolderPositions);
  window.addEventListener('orientationchange', reclampFolderPositions);
  window.addEventListener('hashchange', applyStartupHashRoute);
  window.addEventListener(LANGUAGE_CHANGE_EVENT, () => {
    updateStatusTime();
    renderTheme();
    renderLockMode();
    renderHelpDialog();
  });
  renderTheme();
  renderLockScreen();
  render();
  applyStartupHashRoute();
};
