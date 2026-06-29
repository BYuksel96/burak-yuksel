const SELECTOR_SELECT = '[data-resume-select]';
const SELECTOR_PANEL = '[data-resume-panel]';

const toLines = (description) => {
  if (Array.isArray(description)) {
    return description;
  }

  if (typeof description === 'string') {
    return description.split('\n');
  }

  return [];
};

export const getDefaultTimelineId = (items = []) => {
  const current = items.find((item) => item?.current && item?.id);
  if (current) return current.id;

  const last = [...items].reverse().find((item) => item?.id);
  return last?.id ?? '';
};

export const parseDescriptionLines = (description) => {
  const blocks = [];
  let activeList = null;

  const closeList = () => {
    if (activeList) {
      blocks.push(activeList);
      activeList = null;
    }
  };

  toLines(description)
    .map((line) => String(line).trim())
    .filter(Boolean)
    .forEach((line) => {
      if (line.startsWith('-')) {
        if (!activeList) {
          activeList = { type: 'list', items: [] };
        }
        activeList.items.push(line.replace(/^-+\s*/, ''));
        return;
      }

      closeList();

      if (line.endsWith(':')) {
        blocks.push({ type: 'section', html: line });
        return;
      }

      blocks.push({ type: 'paragraph', html: line });
    });

  closeList();
  return blocks;
};

const getEventId = (element) => element?.getAttribute('data-resume-event-id') ?? '';

export const initResumeApp = (root) => {
  if (!root || root.dataset.resumeAppReady === 'true') return;

  root.dataset.resumeAppReady = 'true';

  const selectors = Array.from(root.querySelectorAll(SELECTOR_SELECT));
  const panels = Array.from(root.querySelectorAll(SELECTOR_PANEL));
  const selectedLabel = root.querySelector('[data-resume-selected-label]');

  const setSelected = (id, options = {}) => {
    if (!id) return;

    root.dataset.resumeSelected = id;

    selectors.forEach((selector) => {
      const isActive = getEventId(selector) === id;
      selector.toggleAttribute('data-resume-active', isActive);
      selector.setAttribute('aria-selected', String(isActive));
      selector.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    panels.forEach((panel) => {
      const isActive = getEventId(panel) === id;
      panel.hidden = !isActive;
      panel.toggleAttribute('data-resume-active', isActive);
    });

    const activeSelector = selectors.find((selector) => getEventId(selector) === id);
    const label = activeSelector?.getAttribute('data-resume-title') ?? '';
    if (selectedLabel) {
      selectedLabel.textContent = label;
    }

    if (options.focus && activeSelector instanceof HTMLElement) {
      activeSelector.focus({ preventScroll: true });
    }

    if (options.scroll && activeSelector instanceof HTMLElement) {
      activeSelector.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }
  };

  root.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest(SELECTOR_SELECT) : null;
    if (!target || !root.contains(target)) return;

    event.preventDefault();
    setSelected(getEventId(target), { scroll: false });
  });

  root.addEventListener('keydown', (event) => {
    const target = event.target instanceof Element ? event.target.closest(SELECTOR_SELECT) : null;
    if (!target || !root.contains(target)) return;

    const list = target.closest('[data-resume-list]');
    const scopedSelectors = list ? Array.from(list.querySelectorAll(SELECTOR_SELECT)) : selectors;
    const index = scopedSelectors.indexOf(target);
    if (index < 0) return;

    let nextIndex = index;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      nextIndex = Math.min(index + 1, scopedSelectors.length - 1);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      nextIndex = Math.max(index - 1, 0);
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = scopedSelectors.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const next = scopedSelectors[nextIndex];
    setSelected(getEventId(next), { focus: true, scroll: true });
  });

  const defaultId = root.getAttribute('data-resume-default-id') || getEventId(selectors[0]);
  setSelected(defaultId, { scroll: false });
};

export const initResumeApps = (documentRoot = document) => {
  documentRoot.querySelectorAll('[data-resume-app]').forEach(initResumeApp);
};

if (typeof window !== 'undefined') {
  const setup = () => initResumeApps(document);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup, { once: true });
  } else {
    setup();
  }
}
