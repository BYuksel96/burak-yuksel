import { LANGUAGE_CHANGE_EVENT, getActiveLanguage, getLanguageLocale, translate } from './i18n.js';

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

export const formatBlogDate = (dateValue, variant = 'long', language = 'en') => {
  const parts = getUtcDateParts(dateValue);
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  const locale = getLanguageLocale(language, 'en-US');

  if (variant === 'row') {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: '2-digit',
      timeZone: 'UTC',
    }).format(date);
  }

  if (variant === 'month') {
    return new Intl.DateTimeFormat(locale, {
      month: 'long',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(parts.year, parts.monthIndex, 1)));
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
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

export const toBlogPostUid = (slug = '') =>
  String(slug)
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const normalizeBlogDeepLinkSlug = (value = '') => {
  let cleanValue = String(value ?? '').trim();
  if (!cleanValue) return '';

  if (cleanValue.startsWith('#')) {
    const hashValue = cleanValue.slice(1);
    const hashParams = new URLSearchParams(hashValue);
    cleanValue = hashParams.get('blog') ?? hashValue.replace(/^blog=/, '');
  }

  try {
    cleanValue = new URL(cleanValue).pathname;
  } catch {
    // Plain slugs and relative paths are handled below.
  }

  cleanValue = cleanValue.split('?')[0].split('#')[0];

  try {
    cleanValue = decodeURIComponent(cleanValue);
  } catch {
    // Keep the original value if it is not valid percent-encoding.
  }

  const segments = cleanValue.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  const slug = segments.at(-1) ?? cleanValue;
  return slug.trim().toLowerCase();
};

const createBlogDeepLinkRecord = (record = {}) => {
  const slug = record.slug ?? record.id ?? record.uid ?? '';

  return {
    uid: record.uid ?? toBlogPostUid(slug),
    slug,
    canonicalSlug: record.canonicalSlug ?? record.routeSlug ?? record.data?.canonicalSlug ?? '',
    canonicalPath: record.canonicalPath ?? record.path ?? record.href ?? '',
  };
};

const getBlogDeepLinkRecords = (source = []) => {
  if (Array.isArray(source)) {
    return source.map(createBlogDeepLinkRecord);
  }

  return Array.from(source?.querySelectorAll?.('[data-blog-post-panel]') ?? []).map((panel) =>
    createBlogDeepLinkRecord({
      uid: getPostId(panel),
      canonicalPath: panel.getAttribute('data-blog-canonical-path') ?? '',
    }),
  );
};

const getBlogDeepLinkCandidates = (record = {}) =>
  [record.slug, record.uid, record.canonicalSlug, record.routeSlug, record.canonicalPath, record.path, record.href]
    .map(normalizeBlogDeepLinkSlug)
    .filter(Boolean);

export const resolveBlogDeepLinkUid = (source = [], deepLinkSlug = '') => {
  const targetSlug = normalizeBlogDeepLinkSlug(deepLinkSlug);
  if (!targetSlug) return '';

  const match = getBlogDeepLinkRecords(source).find((record) => getBlogDeepLinkCandidates(record).includes(targetSlug));
  return match?.uid ?? '';
};

export const createBlogDeepLinkOpenAction = (source = [], deepLinkSlug = '') => {
  const id = resolveBlogDeepLinkUid(source, deepLinkSlug);
  return id ? { type: 'open-post', id } : null;
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

export const getBlogScrollBehavior = (reducedMotionQuery = null) => (reducedMotionQuery?.matches ? 'auto' : 'smooth');

export const estimateReadMinutes = (text = '', wordsPerMinute = 140) => {
  const words = String(text)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
};

export const normalizeBlogTag = (tag = '') => {
  const label = String(tag).trim();
  const key = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return { key, label };
};

const getLocalizedTagLabel = (tagKey = '', fallback = '') => {
  const translated = translate(`blog.tagsByKey.${tagKey}`, getActiveLanguage());
  return translated === `blog.tagsByKey.${tagKey}` ? fallback : translated;
};

const updateLocalizedBlogDates = (root) => {
  root.querySelectorAll('[data-blog-date]').forEach((element) => {
    const dateValue = element.getAttribute('data-blog-date');
    const variant = element.getAttribute('data-blog-date-variant') || 'long';
    element.textContent = formatBlogDate(dateValue, variant, getActiveLanguage());
  });

  root.querySelectorAll('[data-blog-month-label]').forEach((element) => {
    const year = Number(element.getAttribute('data-blog-year'));
    const monthIndex = Number(element.getAttribute('data-blog-month-index'));
    const label = formatBlogDate(new Date(Date.UTC(year, monthIndex, 1)), 'month', getActiveLanguage());
    element.textContent = label;

    const section = element.closest('[data-blog-month-section]');
    if (section && label) section.setAttribute('aria-label', `${label} ${year}`);
  });
};

const uniquePostIds = (ids = []) => ids.filter((id, index) => id && ids.indexOf(id) === index);

const normalizeTagViews = (tagViews = {}, openPostIds = []) =>
  Object.fromEntries(Object.entries(tagViews).filter(([id]) => openPostIds.includes(id)));

const removeTagView = (tagViews = {}, id = '') => {
  const nextTagViews = { ...tagViews };
  delete nextTagViews[id];
  return nextTagViews;
};

export const createInitialBlogTabState = () => ({
  activeTabId: ARCHIVE_TAB_ID,
  openPostIds: [],
  tagViews: {},
});

export const reduceBlogTabState = (state = createInitialBlogTabState(), action = null) => {
  if (!action) {
    const openPostIds = uniquePostIds(state.openPostIds);
    return { ...state, openPostIds, tagViews: normalizeTagViews(state.tagViews, openPostIds) };
  }

  const openPostIds = uniquePostIds(state.openPostIds);
  const tagViews = normalizeTagViews(state.tagViews, openPostIds);

  if (action.type === 'open-post' && action.id) {
    const nextOpenPostIds = uniquePostIds([...openPostIds, action.id]);
    return {
      activeTabId: action.id,
      openPostIds: nextOpenPostIds,
      tagViews: normalizeTagViews(removeTagView(tagViews, action.id), nextOpenPostIds),
    };
  }

  if (action.type === 'activate-tab') {
    if (action.id === ARCHIVE_TAB_ID || openPostIds.includes(action.id)) {
      return { activeTabId: action.id, openPostIds, tagViews };
    }
    return { ...state, openPostIds, tagViews };
  }

  if (action.type === 'close-tab') {
    if (!action.id || action.id === ARCHIVE_TAB_ID || !openPostIds.includes(action.id)) {
      return { ...state, openPostIds, tagViews };
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
      tagViews: normalizeTagViews(removeTagView(tagViews, action.id), nextOpenPostIds),
    };
  }

  if (action.type === 'back-to-archive') {
    const nextOpenPostIds = action.id ? openPostIds.filter((id) => id !== action.id) : openPostIds;
    return {
      activeTabId: ARCHIVE_TAB_ID,
      openPostIds: nextOpenPostIds,
      tagViews: normalizeTagViews(action.id ? removeTagView(tagViews, action.id) : tagViews, nextOpenPostIds),
    };
  }

  if (action.type === 'show-tag' && action.id && openPostIds.includes(action.id)) {
    const normalizedTag = normalizeBlogTag(action.tag);
    if (!normalizedTag.key) return { ...state, openPostIds, tagViews };

    return {
      activeTabId: action.id,
      openPostIds,
      tagViews: {
        ...tagViews,
        [action.id]: normalizedTag,
      },
    };
  }

  if (action.type === 'clear-tag' && action.id) {
    return {
      activeTabId: action.id,
      openPostIds,
      tagViews: removeTagView(tagViews, action.id),
    };
  }

  return { ...state, openPostIds, tagViews };
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
  const reducedMotionQuery =
    typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  const getTabs = () => Array.from(root.querySelectorAll(SELECTOR_TAB));
  const getTabById = (id) => getTabs().find((tab) => getTabId(tab) === id);
  const getPanelById = (id) => root.querySelector(`[data-blog-panel][data-blog-tab-id="${CSS.escape(id)}"]`);

  const setShareWrapOpen = (shareWrap, isOpen) => {
    const shareButton = shareWrap?.querySelector('[data-blog-share]');
    const shareMenu = shareWrap?.querySelector('[data-blog-share-menu]');
    if (!shareButton || !shareMenu) return;

    shareButton.setAttribute('aria-expanded', String(isOpen));
    shareMenu.hidden = !isOpen;
    shareMenu.setAttribute('aria-hidden', String(!isOpen));
  };

  const closeAllShareMenus = () => {
    root.querySelectorAll('[data-blog-share-wrap]').forEach((shareWrap) => setShareWrapOpen(shareWrap, false));
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
      tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: getBlogScrollBehavior(reducedMotionQuery) });
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

    root.querySelectorAll('[data-blog-post-panel]').forEach((panel) => {
      const id = getPostId(panel);
      const tagView = state.tagViews[id] ?? null;
      const postView = panel.querySelector('[data-blog-post-view]');
      const tagResults = panel.querySelector('[data-blog-tag-results]');

      if (postView instanceof HTMLElement) {
        postView.hidden = Boolean(tagView);
      }

      if (tagResults instanceof HTMLElement) {
        tagResults.hidden = !tagView;
        tagResults.toggleAttribute('data-blog-tag-active', Boolean(tagView));
      }

      if (!tagView || !(tagResults instanceof HTMLElement)) return;

      const title = tagResults.querySelector('[data-blog-tag-title]');
      const count = tagResults.querySelector('[data-blog-tag-count]');
      let visibleCount = 0;

      tagResults.querySelectorAll('[data-blog-tag-result-row]').forEach((row) => {
        const keys = (row.getAttribute('data-blog-tag-keys') ?? '').split('|');
        const isMatch = keys.includes(tagView.key);
        row.hidden = !isMatch;
        if (isMatch) visibleCount += 1;
      });

      if (title) {
        title.textContent = translate('blog.postsTagged', getActiveLanguage(), {
          tag: getLocalizedTagLabel(tagView.key, tagView.label),
        });
      }

      if (count) {
        count.textContent = translate('blog.matchingPosts', getActiveLanguage(), { count: visibleCount });
      }
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

  const openBlogDeepLink = (deepLinkSlug = '', options = {}) => {
    const action = createBlogDeepLinkOpenAction(root, deepLinkSlug);
    if (!action) return false;

    dispatch(action, options);
    return true;
  };

  const getPendingBlogDeepLink = () => root.getAttribute('data-blog-deep-link') ?? root.dataset.blogDeepLink ?? '';

  const clearPendingBlogDeepLink = () => {
    delete root.dataset.blogDeepLink;
    root.removeAttribute('data-blog-deep-link');
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

    const tagButton = target.closest('[data-blog-open-tag]');
    if (tagButton && root.contains(tagButton)) {
      event.preventDefault();
      dispatch({ type: 'show-tag', id: getPostId(tagButton), tag: tagButton.getAttribute('data-blog-tag') }, { focus: false });
      return;
    }

    const clearTagButton = target.closest('[data-blog-clear-tag]');
    if (clearTagButton && root.contains(clearTagButton)) {
      event.preventDefault();
      dispatch({ type: 'clear-tag', id: getPostId(clearTagButton) }, { focus: false });
      return;
    }

    const shareButton = target.closest('[data-blog-share]');
    if (shareButton && root.contains(shareButton)) {
      const shareWrap = shareButton.closest('[data-blog-share-wrap]');
      const shareMenu = shareWrap?.querySelector('[data-blog-share-menu]');
      const isOpen = !shareMenu?.hidden;
      closeAllShareMenus();
      setShareWrapOpen(shareWrap, !isOpen);
      if (isOpen === false && shareMenu instanceof HTMLElement) {
        shareMenu.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
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
        window.open(buildLinkedInShareUrl(shareUrl, translate('blog.shareCopy', getActiveLanguage())), '_blank', 'noopener,noreferrer');
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

  root.addEventListener('blog-app:open-deep-link', (event) => {
    const deepLinkSlug = event.detail?.slug ?? getPendingBlogDeepLink();
    if (openBlogDeepLink(deepLinkSlug, { focus: Boolean(event.detail?.focus) })) {
      clearPendingBlogDeepLink();
    }
  });

  window.addEventListener(LANGUAGE_CHANGE_EVENT, () => {
    updateLocalizedBlogDates(root);
    render({ focus: false });
  });

  updateLocalizedBlogDates(root);

  const pendingBlogDeepLink = getPendingBlogDeepLink();
  if (pendingBlogDeepLink && openBlogDeepLink(pendingBlogDeepLink, { focus: false })) {
    clearPendingBlogDeepLink();
  } else {
    render({ focus: false });
  }
};

export const initBlogApps = (documentRoot = document) => {
  documentRoot.querySelectorAll('[data-blog-app]').forEach(initBlogApp);
};
