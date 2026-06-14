export const ARCHIVE_TAB_ID = 'archive';

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const SHORT_MONTH_LABELS = MONTH_LABELS.map((month) => month.slice(0, 3));
const SELECTOR_TAB = '[role="tab"][data-blog-tab]';
const SHARE_COPY = 'Checkout this latest post by Burak Yuksel that I just read! Definitely worth the read!';

const getPostDate = (post) => post?.pubDate ?? post?.data?.pubDate ?? post?.date;

export const getUtcDateParts = (dateValue) => {
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  const monthIndex = date.getUTCMonth();

  return {
    year: date.getUTCFullYear(),
    monthIndex,
    monthLabel: MONTH_LABELS[monthIndex] ?? '',
    shortMonthLabel: SHORT_MONTH_LABELS[monthIndex] ?? '',
    day: date.getUTCDate(),
  };
};

export const getUtcDateTimestamp = (dateValue) => {
  const parts = getUtcDateParts(dateValue);
  return Date.UTC(parts.year, parts.monthIndex, parts.day);
};

export const formatBlogDate = (dateValue, variant = 'long') => {
  const parts = getUtcDateParts(dateValue);
  const month = variant === 'short' ? parts.shortMonthLabel : parts.monthLabel;

  if (variant === 'row') {
    return `${parts.shortMonthLabel} ${String(parts.day).padStart(2, '0')}`;
  }

  return `${month} ${String(parts.day).padStart(2, '0')}, ${parts.year}`;
};

export const sortBlogPostsLatestFirst = (posts = []) =>
  [...posts].sort((a, b) => getUtcDateTimestamp(getPostDate(b)) - getUtcDateTimestamp(getPostDate(a)));

export const groupBlogPostsByYearMonth = (posts = []) => {
  const groups = [];

  sortBlogPostsLatestFirst(posts).forEach((post) => {
    const { year, monthIndex, monthLabel } = getUtcDateParts(getPostDate(post));
    let yearGroup = groups.find((group) => group.year === year);

    if (!yearGroup) {
      yearGroup = { year, months: [] };
      groups.push(yearGroup);
    }

    let monthGroup = yearGroup.months.find((month) => month.monthIndex === monthIndex);
    if (!monthGroup) {
      monthGroup = { monthIndex, monthLabel, posts: [] };
      yearGroup.months.push(monthGroup);
    }

    monthGroup.posts.push(post);
  });

  return groups;
};

const normaliseBase = (base = '/') => {
  if (!base || base === '/') return '/';
  const withLeadingSlash = base.startsWith('/') ? base : `/${base}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
};

export const buildBlogPath = (base = '/', slug = '') => {
  const cleanSlug = String(slug).replace(/^\/+|\/+$/g, '');
  return `${normaliseBase(base)}blog/${cleanSlug}/`.replace(/\/{2,}/g, '/');
};

export const buildBlogDisplayAddress = (path = '') => {
  const cleanPath = path ? String(path).replace(/^\/+/, '') : 'blog/archive';
  return `burak-os://${cleanPath}`;
};

export const toAbsoluteShareUrl = (path, origin) => new URL(path, origin).toString();

export const buildLinkedInShareUrl = (absoluteUrl, text = SHARE_COPY) => {
  const prefilled = `${text} ${absoluteUrl}`;
  return `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(prefilled)}`;
};

export const estimateReadMinutes = (text = '', wordsPerMinute = 140) => {
  const words = String(text)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
};

const uniquePostIds = (ids = []) => ids.filter((id, index) => id && ids.indexOf(id) === index);

export const createInitialBlogTabState = () => ({
  activeTabId: ARCHIVE_TAB_ID,
  openPostIds: [],
});

export const reduceBlogTabState = (state = createInitialBlogTabState(), action = null) => {
  if (!action) return { ...state, openPostIds: uniquePostIds(state.openPostIds) };

  const openPostIds = uniquePostIds(state.openPostIds);

  if (action.type === 'open-post' && action.id) {
    return {
      activeTabId: action.id,
      openPostIds: uniquePostIds([...openPostIds, action.id]),
    };
  }

  if (action.type === 'activate-tab') {
    if (action.id === ARCHIVE_TAB_ID || openPostIds.includes(action.id)) {
      return { activeTabId: action.id, openPostIds };
    }
    return { ...state, openPostIds };
  }

  if (action.type === 'close-tab') {
    if (!action.id || action.id === ARCHIVE_TAB_ID || !openPostIds.includes(action.id)) {
      return { ...state, openPostIds };
    }

    const closingIndex = openPostIds.indexOf(action.id);
    const nextOpenPostIds = openPostIds.filter((id) => id !== action.id);
    const nextActive =
      state.activeTabId === action.id
        ? nextOpenPostIds[closingIndex] ?? nextOpenPostIds[closingIndex - 1] ?? ARCHIVE_TAB_ID
        : state.activeTabId;

    return {
      activeTabId: nextActive,
      openPostIds: nextOpenPostIds,
    };
  }

  if (action.type === 'back-to-archive') {
    return {
      activeTabId: ARCHIVE_TAB_ID,
      openPostIds: action.id ? openPostIds.filter((id) => id !== action.id) : openPostIds,
    };
  }

  return { ...state, openPostIds };
};

const getTabId = (element) => element?.getAttribute('data-blog-tab-id') ?? '';
const getPostId = (element) => element?.getAttribute('data-blog-post-id') ?? getTabId(element);

const copyToClipboard = async (text) => {
  if (!text) return false;

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback handled below.
    }
  }

  const helper = document.createElement('textarea');
  helper.value = text;
  helper.setAttribute('readonly', 'true');
  helper.style.position = 'absolute';
  helper.style.left = '-9999px';
  document.body.appendChild(helper);
  helper.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(helper);
  return copied;
};

export const initBlogApp = (root) => {
  if (!root || root.dataset.blogAppReady === 'true') return;

  root.dataset.blogAppReady = 'true';

  let state = createInitialBlogTabState();
  let toastTimer = null;

  const tabList = root.querySelector('[data-blog-tabs]');
  const address = root.querySelector('[data-blog-address]');
  const toast = root.querySelector('[data-blog-copy-toast]');

  const getTabs = () => Array.from(root.querySelectorAll(SELECTOR_TAB));
  const getTabById = (id) => getTabs().find((tab) => getTabId(tab) === id);
  const getPanelById = (id) => root.querySelector(`[data-blog-panel][data-blog-tab-id="${CSS.escape(id)}"]`);
  const getPostPanel = (id) => root.querySelector(`[data-blog-post-panel][data-blog-post-id="${CSS.escape(id)}"]`);

  const setSharePanelOpen = (panel, isOpen) => {
    const shareButton = panel?.querySelector('[data-blog-share]');
    const shareMenu = panel?.querySelector('[data-blog-share-menu]');
    if (!shareButton || !shareMenu) return;

    shareButton.setAttribute('aria-expanded', String(isOpen));
    shareMenu.hidden = !isOpen;
    shareMenu.setAttribute('aria-hidden', String(!isOpen));
  };

  const closeAllShareMenus = () => {
    root.querySelectorAll('[data-blog-post-panel]').forEach((panel) => setSharePanelOpen(panel, false));
  };

  const showCopyToast = () => {
    if (!toast) return;

    toast.toggleAttribute('data-visible', true);
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.toggleAttribute('data-visible', false);
    }, 1600);
  };

  const focusTab = (id) => {
    const tab = getTabById(id);
    if (tab instanceof HTMLElement) {
      tab.focus({ preventScroll: true });
      tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }
  };

  const render = (options = {}) => {
    const activeId = state.activeTabId;
    root.dataset.blogActiveTab = activeId;

    getTabs().forEach((tab) => {
      const id = getTabId(tab);
      const isArchive = id === ARCHIVE_TAB_ID;
      const isOpen = isArchive || state.openPostIds.includes(id);
      const isActive = activeId === id;
      const wrapper = tab.closest('[data-blog-tab-wrap]');

      if (wrapper instanceof HTMLElement) {
        wrapper.hidden = !isOpen;
      }

      tab.setAttribute('aria-selected', String(isActive));
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
      tab.toggleAttribute('data-blog-active', isActive);
    });

    root.querySelectorAll('[data-blog-panel]').forEach((panel) => {
      const id = getTabId(panel);
      const isActive = activeId === id;
      panel.hidden = !isActive;
      panel.toggleAttribute('data-blog-active', isActive);
    });

    if (address) {
      const activePanel = getPanelById(activeId);
      const canonicalPath = activePanel?.getAttribute('data-blog-canonical-path') ?? '';
      address.textContent = buildBlogDisplayAddress(activeId === ARCHIVE_TAB_ID ? '' : canonicalPath);
    }

    closeAllShareMenus();

    if (options.focus) {
      focusTab(activeId);
    }
  };

  const dispatch = (action, options = {}) => {
    state = reduceBlogTabState(state, action);
    render(options);
  };

  const activateRelativeTab = (currentTab, key) => {
    const tabs = getTabs().filter((tab) => !tab.closest('[data-blog-tab-wrap]')?.hidden);
    const index = tabs.indexOf(currentTab);
    if (index < 0) return;

    let nextIndex = index;
    if (key === 'ArrowRight') nextIndex = Math.min(index + 1, tabs.length - 1);
    if (key === 'ArrowLeft') nextIndex = Math.max(index - 1, 0);
    if (key === 'Home') nextIndex = 0;
    if (key === 'End') nextIndex = tabs.length - 1;

    const nextTab = tabs[nextIndex];
    if (!nextTab) return;

    dispatch({ type: 'activate-tab', id: getTabId(nextTab) }, { focus: true });
  };

  root.addEventListener('click', async (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const archiveLink = target.closest('[data-blog-open-post]');
    if (archiveLink && root.contains(archiveLink)) {
      event.preventDefault();
      dispatch({ type: 'open-post', id: getPostId(archiveLink) }, { focus: true });
      return;
    }

    const closeButton = target.closest('[data-blog-close-tab]');
    if (closeButton && root.contains(closeButton)) {
      event.preventDefault();
      event.stopPropagation();
      dispatch({ type: 'close-tab', id: getPostId(closeButton) }, { focus: true });
      return;
    }

    const tab = target.closest(SELECTOR_TAB);
    if (tab && root.contains(tab)) {
      event.preventDefault();
      dispatch({ type: 'activate-tab', id: getTabId(tab) }, { focus: false });
      return;
    }

    const backButton = target.closest('[data-blog-back]');
    if (backButton && root.contains(backButton)) {
      event.preventDefault();
      dispatch({ type: 'back-to-archive', id: getPostId(backButton) }, { focus: true });
      return;
    }

    const shareButton = target.closest('[data-blog-share]');
    if (shareButton && root.contains(shareButton)) {
      const panel = shareButton.closest('[data-blog-post-panel]');
      const shareMenu = panel?.querySelector('[data-blog-share-menu]');
      const isOpen = !shareMenu?.hidden;
      closeAllShareMenus();
      setSharePanelOpen(panel, !isOpen);
      return;
    }

    const shareAction = target.closest('[data-blog-share-action]');
    if (shareAction && root.contains(shareAction)) {
      const panel = shareAction.closest('[data-blog-post-panel]');
      const canonicalPath = panel?.getAttribute('data-blog-canonical-path') ?? '';
      const shareUrl = toAbsoluteShareUrl(canonicalPath, window.location.origin);
      const action = shareAction.getAttribute('data-blog-share-action');

      if (action === 'copy') {
        if (await copyToClipboard(shareUrl)) {
          showCopyToast();
        }
        closeAllShareMenus();
        return;
      }

      if (action === 'linkedin') {
        window.open(buildLinkedInShareUrl(shareUrl), '_blank', 'noopener,noreferrer');
        closeAllShareMenus();
        return;
      }
    }

    const activeShareMenu = root.querySelector('[data-blog-share-menu]:not([hidden])');
    if (activeShareMenu && !target.closest('[data-blog-share-menu]') && !target.closest('[data-blog-share]')) {
      closeAllShareMenus();
    }
  });

  root.addEventListener('keydown', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    if (event.key === 'Escape') {
      closeAllShareMenus();
      return;
    }

    const tab = target.closest(SELECTOR_TAB);
    if (!tab || !root.contains(tab)) return;

    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      activateRelativeTab(tab, event.key);
      return;
    }

    if (event.key === 'Delete' && getTabId(tab) !== ARCHIVE_TAB_ID) {
      event.preventDefault();
      dispatch({ type: 'close-tab', id: getTabId(tab) }, { focus: true });
    }
  });

  tabList?.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    tabList.scrollLeft += event.deltaY;
  });

  render({ focus: false });
};

export const initBlogApps = (documentRoot = document) => {
  documentRoot.querySelectorAll('[data-blog-app]').forEach(initBlogApp);
};
