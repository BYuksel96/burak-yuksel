import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const readGitHubAppSource = () => readFileSync(new URL('../components/os/GitHubApp.astro', import.meta.url), 'utf8');
const readGitHubAppScript = () => readFileSync(new URL('./github-app.js', import.meta.url), 'utf8');
const readGitHubAppStyles = () => readFileSync(new URL('../styles/github-app.css', import.meta.url), 'utf8');

const getTagByAttribute = (source, attribute) => source.match(new RegExp(`<a\\b[^>]*${attribute}[^>]*>`, 'i'))?.[0] ?? '';

test('uses the working unauthenticated public repos endpoint for the existing site GitHub profile', async () => {
  const { GITHUB_REPOS_ENDPOINT } = await import('./github-app.js');

  assert.equal(GITHUB_REPOS_ENDPOINT, 'https://api.github.com/users/BYuksel96/repos?sort=updated&per_page=6');
});

test('normalizes GitHub repos for card rendering', async () => {
  const { normalizeGitHubRepo, normalizeGitHubRepos } = await import('./github-app.js');

  assert.deepEqual(
    normalizeGitHubRepo({
      name: 'portfolio-os',
      description: '',
      language: null,
      stargazers_count: 4,
      updated_at: '2026-06-20T14:05:00Z',
      html_url: 'https://github.com/BYuksel96/portfolio-os',
    }),
    {
      name: 'portfolio-os',
      description: 'No description provided.',
      language: 'Unknown',
      stars: 4,
      updatedLabel: '20 Jun 2026',
      htmlUrl: 'https://github.com/BYuksel96/portfolio-os',
      fullName: 'BYuksel96/portfolio-os',
      defaultBranch: 'main',
      commitCount: null,
      commitLabel: 'Commits unavailable',
    },
  );

  assert.deepEqual(normalizeGitHubRepos([{ name: 'one' }, null, { name: 'two' }]).map((repo) => repo.name), [
    'one',
    'two',
  ]);
});

test('builds default-branch commit count endpoints', async () => {
  const { buildCommitCountEndpoint } = await import('./github-app.js');

  assert.equal(
    buildCommitCountEndpoint({
      fullName: 'BYuksel96/portfolio-os',
      defaultBranch: 'feature/test branch',
    }),
    'https://api.github.com/repos/BYuksel96/portfolio-os/commits?sha=feature%2Ftest%20branch&per_page=1',
  );
});

test('reads commit counts from GitHub pagination or visible response length', async () => {
  const { readCommitCountFromResponse } = await import('./github-app.js');

  assert.equal(
    await readCommitCountFromResponse({
      headers: {
        get: () =>
          '<https://api.github.com/repositories/1/commits?per_page=1&page=2>; rel="next", <https://api.github.com/repositories/1/commits?per_page=1&page=42>; rel="last"',
      },
      json: async () => [{ sha: 'abc' }],
    }),
    42,
  );

  assert.equal(
    await readCommitCountFromResponse({
      headers: { get: () => '' },
      json: async () => [{ sha: 'only' }],
    }),
    1,
  );
});

test('fetches commit counts for repos and degrades unavailable counts gracefully', async () => {
  const { fetchGitHubRepos } = await import('./github-app.js');
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);

    if (url === 'https://example.test/repos') {
      return {
        ok: true,
        json: async () => [
          {
            name: 'one',
            full_name: 'BYuksel96/one',
            default_branch: 'main',
            html_url: 'https://github.com/BYuksel96/one',
          },
          {
            name: 'two',
            full_name: 'BYuksel96/two',
            default_branch: 'develop',
            html_url: 'https://github.com/BYuksel96/two',
          },
        ],
      };
    }

    if (url.includes('/BYuksel96/one/commits')) {
      return {
        ok: true,
        headers: {
          get: () => '<https://api.github.com/repos/BYuksel96/one/commits?sha=main&per_page=1&page=7>; rel="last"',
        },
        json: async () => [{ sha: 'abc' }],
      };
    }

    return {
      ok: false,
      status: 403,
      headers: { get: () => '' },
      json: async () => ({ message: 'rate limited' }),
    };
  };

  const repos = await fetchGitHubRepos(fetchImpl, 'https://example.test/repos');

  assert.deepEqual(
    repos.map((repo) => ({ name: repo.name, commitCount: repo.commitCount, commitLabel: repo.commitLabel })),
    [
      { name: 'one', commitCount: 7, commitLabel: '7 commits' },
      { name: 'two', commitCount: null, commitLabel: 'Commits unavailable' },
    ],
  );
  assert.equal(calls.length, 3);
});

test('reducer moves through loading, success, error, retry, and duplicate success states', async () => {
  const { createInitialGitHubState, reduceGitHubState } = await import('./github-app.js');

  let state = createInitialGitHubState();
  assert.equal(state.status, 'idle');

  state = reduceGitHubState(state, { type: 'load' });
  assert.equal(state.status, 'loading');
  assert.deepEqual(state.repos, []);

  state = reduceGitHubState(state, { type: 'success', repos: [{ name: 'one' }] });
  assert.equal(state.status, 'success');
  assert.deepEqual(state.repos, [{ name: 'one' }]);

  state = reduceGitHubState(state, { type: 'success', repos: [{ name: 'ignored' }] });
  assert.equal(state.status, 'success');
  assert.deepEqual(state.repos, [{ name: 'one' }]);

  state = reduceGitHubState(createInitialGitHubState(), { type: 'error', message: 'Rate limited' });
  assert.equal(state.status, 'error');
  assert.equal(state.message, 'Rate limited');

  state = reduceGitHubState(state, { type: 'retry' });
  assert.equal(state.status, 'loading');
  assert.equal(state.message, '');
});

test('GitHubApp markup includes state containers, retry, external links, and no iframe or token text', () => {
  assert.equal(existsSync(new URL('../components/os/GitHubApp.astro', import.meta.url)), true);

  const source = readGitHubAppSource();

  assert.match(source, /data-github-app/);
  assert.match(source, /data-github-loading/);
  assert.match(source, /data-github-error/);
  assert.match(source, /data-github-empty/);
  assert.match(source, /data-github-success/);
  assert.match(source, /data-github-retry/);
  assert.match(source, /data-github-repo-template/);
  assert.match(source, /data-github-repo-commits/);
  assert.match(source, /target="_blank"/);
  assert.match(source, /rel="noopener noreferrer"/);
  assert.doesNotMatch(source, /<iframe/i);
  assert.doesNotMatch(source, /token|authorization/i);
});

test('GitHub profile and repo links open safe browser tabs without iframe or token behavior', () => {
  const source = readGitHubAppSource();
  const script = readGitHubAppScript();
  const profileLink = getTagByAttribute(source, 'data-github-profile-link');
  const repoLink = getTagByAttribute(source, 'data-github-repo-link');

  assert.match(profileLink, /href="https:\/\/github\.com\/BYuksel96"/);
  assert.match(profileLink, /target="_blank"/);
  assert.match(profileLink, /rel="noopener noreferrer"/);
  assert.match(repoLink, /href="https:\/\/github\.com\/BYuksel96"/);
  assert.match(repoLink, /target="_blank"/);
  assert.match(repoLink, /rel="noopener noreferrer"/);
  assert.match(script, /link\.href = repo\.htmlUrl;/);
  assert.doesNotMatch(`${source}\n${script}`, /<iframe|window\.open|access_token|client_secret|api[_-]?key|authorization|bearer/i);
});

test('GitHubApp CSS is namespaced and includes responsive single-column behavior', () => {
  assert.equal(existsSync(new URL('../styles/github-app.css', import.meta.url)), true);

  const styles = readGitHubAppStyles();

  assert.match(styles, /\.github-app\s/);
  assert.match(styles, /\.github-app__repo-grid/);
  assert.match(styles, /grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(100%,\s*18rem\),\s*1fr\)\)/);
  assert.match(styles, /@media\s*\(max-width:\s*760px\)/);
  assert.match(styles, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.github-app__repo-grid\s*\{[\s\S]*grid-template-columns:\s*1fr;/);
  assert.doesNotMatch(styles, /\.blog-app/);
  assert.doesNotMatch(styles, /\.resume-app/);
});

test('GitHubApp compact layout keeps the connection sidebar readable', () => {
  const styles = readGitHubAppStyles();

  assert.match(styles, /@media\s*\(max-width:\s*760px\)[\s\S]*\.github-app__workspace\s*\{[\s\S]*grid-auto-rows:\s*max-content;[\s\S]*align-content:\s*start;[\s\S]*overflow-y:\s*auto;/);
  assert.match(styles, /@media\s*\(max-width:\s*760px\)[\s\S]*\.github-app__sidebar\s*\{[\s\S]*grid-template-rows:\s*auto;[\s\S]*overflow:\s*visible;/);
  assert.match(styles, /@media\s*\(max-width:\s*760px\)[\s\S]*\.github-app__meta-list\s*\{[\s\S]*display:\s*grid;[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(styles, /@media\s*\(max-width:\s*420px\)[\s\S]*\.github-app__meta-list\s*\{[\s\S]*grid-template-columns:\s*1fr;/);
});

test('GitHubApp mobile layout wraps long repository text without horizontal overflow', () => {
  const styles = readGitHubAppStyles();
  const mobileRules = styles.match(/@media \(max-width: 760px\) \{[\s\S]*?\n\}/)?.[0] ?? '';

  assert.match(mobileRules, /\.github-app__status-card span:not\(\.github-app__status-dot\)\s*\{[^}]*white-space:\s*normal;[^}]*overflow-wrap:\s*anywhere;/s);
  assert.match(mobileRules, /\.github-app__profile strong\s*\{[^}]*overflow-wrap:\s*anywhere;/s);
  assert.match(mobileRules, /\.github-app__profile p\s*\{[^}]*overflow-wrap:\s*anywhere;/s);
  assert.match(mobileRules, /\.github-app__repo-card h4\s*\{[^}]*white-space:\s*normal;[^}]*overflow-wrap:\s*anywhere;/s);
  assert.match(mobileRules, /\.github-app__repo-card p\s*\{[^}]*overflow-wrap:\s*anywhere;/s);
  assert.match(mobileRules, /\.github-app__repo-meta span\s*\{[^}]*overflow-wrap:\s*anywhere;/s);
});
