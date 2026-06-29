import { LANGUAGE_CHANGE_EVENT, applyI18n, getActiveLanguage, getLanguageLocale, translate } from './i18n.js';

export const GITHUB_REPOS_ENDPOINT = 'https://api.github.com/users/BYuksel96/repos?sort=updated&per_page=6';

export const formatRepoUpdatedDate = (dateValue, language = 'en') => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return translate('github.unknownDate', language);

  return new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : getLanguageLocale(language, 'en-GB'), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

export const formatCommitCount = (count, language = 'en') => {
  if (!Number.isInteger(count) || count < 0) return 'Commits unavailable';
  if (language !== 'en') return translate('github.commitCount', language, { count });
  return `${count} ${count === 1 ? 'commit' : 'commits'}`;
};

export const normalizeGitHubRepo = (repo = {}) => {
  const stars = Number(repo?.stargazers_count);
  const fullName = String(repo?.full_name || `BYuksel96/${repo?.name || ''}`).replace(/\/+$/g, '');
  const defaultBranch = String(repo?.default_branch || 'main');

  return {
    name: String(repo?.name || 'Untitled repository'),
    description: String(repo?.description || '').trim() || 'No description provided.',
    language: String(repo?.language || '').trim() || 'Unknown',
    stars: Number.isFinite(stars) ? stars : 0,
    updatedAt: repo?.updated_at ?? '',
    updatedLabel: formatRepoUpdatedDate(repo?.updated_at),
    htmlUrl: String(repo?.html_url || 'https://github.com/BYuksel96'),
    fullName,
    defaultBranch,
    commitCount: null,
    commitLabel: 'Commits unavailable',
  };
};

export const normalizeGitHubRepos = (repos = []) =>
  (Array.isArray(repos) ? repos : [])
    .filter((repo) => repo && typeof repo === 'object' && repo.name)
    .map(normalizeGitHubRepo);

export const buildCommitCountEndpoint = (repo = {}) => {
  const [owner, name] = String(repo.fullName || '').split('/');
  if (!owner || !name) return '';

  const defaultBranch = String(repo.defaultBranch || 'main');
  return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/commits?sha=${encodeURIComponent(defaultBranch)}&per_page=1`;
};

export const readCommitCountFromResponse = async (response) => {
  const linkHeader = response?.headers?.get?.('Link') || response?.headers?.get?.('link') || '';
  const lastLink = linkHeader
    .split(',')
    .map((part) => part.trim())
    .find((part) => /rel="last"/.test(part));

  if (lastLink) {
    const url = lastLink.match(/<([^>]+)>/)?.[1];
    const page = url ? Number(new URL(url).searchParams.get('page')) : NaN;
    if (Number.isInteger(page) && page >= 0) return page;
  }

  const commits = await response.json();
  return Array.isArray(commits) ? commits.length : 0;
};

export const fetchGitHubCommitCount = async (fetchImpl = fetch, repo = {}) => {
  const endpoint = buildCommitCountEndpoint(repo);
  if (!endpoint) throw new Error('Repository full name is missing.');

  const response = await fetchImpl(endpoint, {
    headers: {
      Accept: 'application/vnd.github+json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub commits request failed with status ${response.status}`);
  }

  return readCommitCountFromResponse(response);
};

const withCommitCount = async (fetchImpl, repo) => {
  try {
    const commitCount = await fetchGitHubCommitCount(fetchImpl, repo);
    return {
      ...repo,
      commitCount,
      commitLabel: formatCommitCount(commitCount),
    };
  } catch {
    return repo;
  }
};

export const createInitialGitHubState = () => ({
  status: 'idle',
  repos: [],
  message: '',
});

export const reduceGitHubState = (state = createInitialGitHubState(), action = null) => {
  if (!action) return state;

  if (action.type === 'load' || action.type === 'retry') {
    return {
      status: 'loading',
      repos: [],
      message: '',
    };
  }

  if (action.type === 'success') {
    if (state.status === 'success') return state;

    const repos = Array.isArray(action.repos) ? action.repos : [];
    return {
      status: repos.length ? 'success' : 'empty',
      repos,
      message: '',
    };
  }

  if (action.type === 'error') {
    return {
      status: 'error',
      repos: [],
      message: String(action.message || 'GitHub repositories could not be loaded.'),
    };
  }

  return state;
};

export const fetchGitHubRepos = async (fetchImpl = fetch, endpoint = GITHUB_REPOS_ENDPOINT) => {
  const response = await fetchImpl(endpoint, {
    headers: {
      Accept: 'application/vnd.github+json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed with status ${response.status}`);
  }

  const repos = normalizeGitHubRepos(await response.json());
  return Promise.all(repos.map((repo) => withCommitCount(fetchImpl, repo)));
};

const setHidden = (element, isHidden) => {
  if (!element) return;

  element.hidden = isHidden;
  element.setAttribute('aria-hidden', String(isHidden));
};

const setText = (root, selector, text) => {
  const element = root.querySelector(selector);
  if (element) element.textContent = text;
};

const renderRepoCard = (template, repo) => {
  const card = template.content.firstElementChild.cloneNode(true);
  const link = card.querySelector('[data-github-repo-link]');
  const language = getActiveLanguage();
  const description = repo.description === 'No description provided.' ? translate('github.noDescription', language) : repo.description;
  const repoLanguage = repo.language === 'Unknown' ? translate('github.unknownLanguage', language) : repo.language;

  setText(card, '[data-github-repo-name]', repo.name);
  setText(card, '[data-github-repo-description]', description);
  setText(card, '[data-github-repo-language]', repoLanguage);
  setText(card, '[data-github-repo-stars]', String(repo.stars));
  setText(card, '[data-github-repo-commits]', Number.isInteger(repo.commitCount) ? formatCommitCount(repo.commitCount, language) : translate('github.commitsUnavailable', language));
  setText(card, '[data-github-repo-updated]', formatRepoUpdatedDate(repo.updatedAt, language));

  if (link) {
    link.href = repo.htmlUrl;
    link.setAttribute('aria-label', translate('github.openRepo', language, { name: repo.name }));
  }

  applyI18n(card, language);

  return card;
};

export const renderGitHubApp = (root, state) => {
  if (!root) return;

  const loading = root.querySelector('[data-github-loading]');
  const error = root.querySelector('[data-github-error]');
  const empty = root.querySelector('[data-github-empty]');
  const success = root.querySelector('[data-github-success]');
  const grid = root.querySelector('[data-github-repo-grid]');
  const template = root.querySelector('[data-github-repo-template]');
  const statusText = root.querySelector('[data-github-status]');
  const count = root.querySelector('[data-github-count]');
  const errorMessage = root.querySelector('[data-github-error-message]');

  root.dataset.githubStatus = state.status;
  setHidden(loading, state.status !== 'loading');
  setHidden(error, state.status !== 'error');
  setHidden(empty, state.status !== 'empty');
  setHidden(success, state.status !== 'success');

  if (statusText) {
    statusText.textContent =
      state.status === 'loading'
        ? translate('github.loadingTitle')
        : state.status === 'error'
          ? translate('github.unable')
          : state.status === 'empty'
            ? translate('github.noneReturned')
            : state.status === 'success'
              ? translate('github.loaded')
              : translate('github.waiting');
  }

  if (count) {
    count.textContent = translate('github.count', getActiveLanguage(), { count: state.repos.length });
    count.setAttribute('data-i18n-vars', JSON.stringify({ count: state.repos.length }));
  }

  if (errorMessage) {
    errorMessage.textContent = state.message;
  }

  if (grid && template && state.status === 'success') {
    grid.replaceChildren(...state.repos.map((repo) => renderRepoCard(template, repo)));
  }
};

export const initGitHubApp = (root, options = {}) => {
  if (!root || root.dataset.githubAppReady === 'true') return;

  root.dataset.githubAppReady = 'true';

  let state = createInitialGitHubState();
  const endpoint = root.getAttribute('data-github-endpoint') || GITHUB_REPOS_ENDPOINT;
  const windowElement = root.closest('[data-os-window]');
  const fetchImpl = options.fetchImpl || window.fetch.bind(window);

  const isWindowOpen = () =>
    !windowElement || (!windowElement.hidden && windowElement.getAttribute('data-window-state') === 'open');

  const dispatch = (action) => {
    state = reduceGitHubState(state, action);
    renderGitHubApp(root, state);
  };

  const loadRepos = async (force = false) => {
    if (!force && state.status !== 'idle') return;
    if (state.status === 'loading') return;

    dispatch({ type: force ? 'retry' : 'load' });

    try {
      dispatch({ type: 'success', repos: await fetchGitHubRepos(fetchImpl, endpoint) });
    } catch (error) {
      dispatch({ type: 'error', message: error instanceof Error ? error.message : String(error) });
    }
  };

  const loadWhenOpen = () => {
    if (isWindowOpen() && state.status === 'idle') {
      loadRepos();
    }
  };

  root.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('[data-github-retry]') : null;
    if (!target || !root.contains(target)) return;

    event.preventDefault();
    loadRepos(true);
  });

  if (windowElement) {
    const observer = new MutationObserver(loadWhenOpen);
    observer.observe(windowElement, {
      attributes: true,
      attributeFilter: ['hidden', 'data-window-state'],
    });
  }

  window.addEventListener(LANGUAGE_CHANGE_EVENT, () => {
    renderGitHubApp(root, state);
  });

  renderGitHubApp(root, state);
  loadWhenOpen();
};

export const initGitHubApps = (documentRoot = document) => {
  documentRoot.querySelectorAll('[data-github-app]').forEach(initGitHubApp);
};

if (typeof window !== 'undefined') {
  const setup = () => initGitHubApps(document);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup, { once: true });
  } else {
    setup();
  }
}
