const MAIN_APPS = ['resume', 'blog', 'github'];
const FOLDER_APPS = ['downloads', 'bin'];
const ALL_TARGETS = [...MAIN_APPS, ...FOLDER_APPS];

const isMainApp = (id) => MAIN_APPS.includes(id);
const isFolderApp = (id) => FOLDER_APPS.includes(id);

const uniqueFolders = (folders) => folders.filter((id, index) => FOLDER_APPS.includes(id) && folders.indexOf(id) === index);

const isTargetOpen = (state, id) => (isMainApp(id) ? state.activeMainApp === id : state.openFolders.includes(id));

export const createLauncherOpenAction = (launcherType, id, state = createInitialOsState()) => {
  if (!['desktop', 'taskbar'].includes(launcherType) || !ALL_TARGETS.includes(id)) {
    return null;
  }

  if (launcherType === 'taskbar' && isTargetOpen(state, id)) {
    return { type: 'close', id };
  }

  return { type: 'open', id };
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
  isTaskbarCompact: Boolean(state.activeMainApp),
});

export const createInitialOsState = () => ({
  activeMainApp: null,
  openFolders: [],
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
      });
    }

    if (isFolderApp(action.id)) {
      return withDerivedState({
        ...state,
        openFolders: uniqueFolders([...state.openFolders, action.id]),
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

    if (isFolderApp(action.id)) {
      return withDerivedState({
        ...state,
        openFolders: state.openFolders.filter((id) => id !== action.id),
        helpWindowId: state.helpWindowId === action.id ? null : state.helpWindowId,
      });
    }
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

export const initOsWindowManager = (screen) => {
  if (!screen || screen.dataset.osWindowManagerReady === 'true') return;

  screen.dataset.osWindowManagerReady = 'true';

  let state = createInitialOsState();
  const windows = Array.from(screen.querySelectorAll('[data-os-window]'));
  const taskbarItems = Array.from(screen.querySelectorAll('[data-os-launcher="taskbar"]'));
  const desktopItems = Array.from(screen.querySelectorAll('[data-os-launcher="desktop"]'));
  const helpDialog = screen.querySelector('[data-os-help-dialog]');
  const helpTitle = helpDialog?.querySelector('[data-os-help-title]');
  const helpCopy = helpDialog?.querySelector('[data-os-help-copy]');
  const helpCloseButton = helpDialog?.querySelector('[data-os-help-close-button]');
  const statusTime = screen.querySelector('[data-os-status-time]');
  let statusTimeInterval;

  const isWindowOpen = (id) => isTargetOpen(state, id);

  const getHelpSource = (id) => windows.find((windowElement) => windowElement.getAttribute('data-os-window-id') === id);

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
    screen.dataset.taskbarMode = state.isTaskbarCompact ? 'compact' : 'default';

    windows.forEach((windowElement) => {
      const id = windowElement.getAttribute('data-os-window-id') ?? '';
      const open = isWindowOpen(id);

      windowElement.hidden = !open;
      windowElement.setAttribute('aria-hidden', String(!open));
      windowElement.setAttribute('data-window-state', open ? 'open' : 'closed');
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

  screen.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

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
      dispatch({ type: 'close', id: getWindowId(closeButton) });
      return;
    }

    const helpButton = target.closest('[data-os-window-help]');
    if (helpButton) {
      setHelpDialogOrigin(helpButton);
      dispatch({ type: 'open-help', id: getWindowId(helpButton) });
      return;
    }

    if (target.closest('[data-os-help-close]')) {
      dispatch({ type: 'close-help', id: state.helpWindowId ?? '' });
    }
  });

  screen.addEventListener('keydown', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (event.key === 'Escape' && state.helpWindowId) {
      dispatch({ type: 'close-help', id: state.helpWindowId });
      return;
    }

    const desktopLauncher = target.closest('[data-os-launcher="desktop"]');
    if (desktopLauncher && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      dispatch(createLauncherOpenAction('desktop', getTargetId(desktopLauncher)));
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
