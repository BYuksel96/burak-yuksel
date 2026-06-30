import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { QUIZ_QUESTIONS } from './quiz-data.js';
import {
  SUPPORTED_LANGUAGES,
  collectMissingTranslationKeys,
  createLanguageSessionStore,
  getLanguageOptions,
  getLanguageLocale,
  getTranslatedBlogPost,
  getTranslatedResumeEntry,
  localizeQuizQuestion,
  normalizeLanguage,
  translate,
} from './i18n.js';

test('language mode supports English, Spanish, French, German, and Turkish only', () => {
  assert.deepEqual(SUPPORTED_LANGUAGES.map((language) => language.code), ['en', 'es', 'fr', 'de', 'tr']);
  assert.deepEqual(getLanguageOptions('de').map((language) => language.isActive), [false, false, false, true, false]);
  assert.equal(normalizeLanguage('ES'), 'es');
  assert.equal(normalizeLanguage('turkish'), null);
  assert.equal(normalizeLanguage('ja'), null);
});

test('language preference is session-only with an in-memory fallback', () => {
  const storedValues = new Map();
  const store = createLanguageSessionStore(() => ({
    getItem: (key) => storedValues.get(key) ?? null,
    setItem: (key, value) => storedValues.set(key, value),
  }));

  assert.equal(store.read(), null);
  store.write('fr');
  assert.equal(store.read(), 'fr');
  assert.deepEqual([...storedValues.values()], ['fr']);

  const blockedStore = createLanguageSessionStore(() => ({
    getItem: () => {
      throw new Error('storage blocked');
    },
    setItem: () => {
      throw new Error('storage blocked');
    },
  }));

  assert.equal(blockedStore.read(), null);
  blockedStore.write('tr');
  assert.equal(blockedStore.read(), 'tr');

  const source = readFileSync(new URL('./i18n.js', import.meta.url), 'utf8');
  assert.match(source, /sessionStorage/);
  assert.doesNotMatch(source, /localStorage/);
});

test('all non-English dictionaries cover the English key tree', () => {
  assert.deepEqual(collectMissingTranslationKeys(), {});
});

test('translation helper interpolates localized UI copy', () => {
  assert.equal(translate('os.topbar.languageButtonLabel', 'en'), 'Language');
  assert.equal(translate('os.topbar.languageButtonLabel', 'es'), 'Idioma');
  assert.equal(translate('github.count', 'fr', { count: 6 }), '6 depots');
  assert.equal(translate('blog.readMinutesLong', 'de', { minutes: 4 }), '4 Min. Lesezeit');
  assert.equal(translate('downloads.confirmTitle', 'tr'), "Burak'in ozgecmisini indirmeye devam edilsin mi?");
  assert.equal(translate('blog.tagsByKey.vibe-coding', 'tr'), 'Vibe Coding');
  assert.equal(translate('blog.tagsByKey.welcome', 'tr'), 'hos geldiniz');
});

test('language mode exposes stable locales for date formatting', () => {
  assert.equal(getLanguageLocale('en'), 'en-US');
  assert.equal(getLanguageLocale('tr'), 'tr-TR');
  assert.equal(getLanguageLocale('missing', 'en-GB'), 'en-GB');
});

test('content-heavy blog and resume entries have localized session copy', () => {
  const spanishPost = getTranslatedBlogPost('hello-world', 'es');
  assert.equal(spanishPost.title, 'Hola Mundo');
  assert.match(spanishPost.bodyHtml, /Este blog es un hogar para pensar en voz alta/);

  const frenchPost = getTranslatedBlogPost('vibe-coding', 'fr');
  assert.match(frenchPost.bodyHtml, /codage au feeling/i);

  const germanEntry = getTranslatedResumeEntry('university', 'de');
  assert.match(germanEntry.title, /Software Engineering/);
  assert.match(germanEntry.detailHtml, /Universitaet/);

  const turkishEntry = getTranslatedResumeEntry('future', 'tr');
  assert.match(turkishEntry.detailHtml, /kaderle/);
});

test('quiz question localization preserves ids, correctness, and translated answer text', () => {
  const sourceQuestion = QUIZ_QUESTIONS.find((question) => question.id === 'agile-principles-001');
  const translated = localizeQuizQuestion(sourceQuestion, 'tr');

  assert.equal(translated.id, sourceQuestion.id);
  assert.equal(translated.correctChoiceId, sourceQuestion.correctChoiceId);
  assert.equal(translated.choices.length, 4);
  assert.notEqual(translated.prompt, sourceQuestion.prompt);
  assert.notEqual(translated.choices.find((choice) => choice.id === 'b').text, sourceQuestion.choices.find((choice) => choice.id === 'b').text);
  assert.match(translated.explanation, /bireyler/i);
  assert.match(translated.whyItMatters, /teslim/i);
});

test('OS shell exposes a language picker instead of the old inert EN button', () => {
  const osShellSource = readFileSync(new URL('../components/os/OsShell.astro', import.meta.url), 'utf8');
  const osCss = readFileSync(new URL('../styles/os.css', import.meta.url), 'utf8');
  const i18nSource = readFileSync(new URL('./i18n.js', import.meta.url), 'utf8');

  assert.match(osShellSource, /data-os-language-toggle/);
  assert.match(osShellSource, /data-os-language-menu/);
  assert.match(osShellSource, /data-os-language-option/);
  assert.match(osShellSource, /initOsWindowManager\(screen/);
  assert.match(osCss, /\.os-language-menu/);
  assert.match(i18nSource, /window\.dispatchEvent\(new CustomEvent\(LANGUAGE_CHANGE_EVENT/);
});

test('language picker overlays desktop layers for pointer and touch selection', () => {
  const osCss = readFileSync(new URL('../styles/os.css', import.meta.url), 'utf8');
  const topbarRule = osCss.match(/\.os-topbar\s*\{(?<body>[\s\S]*?)\n\}/)?.groups?.body ?? '';
  const menuRule = osCss.match(/\.os-language-menu\s*\{(?<body>[\s\S]*?)\n\}/)?.groups?.body ?? '';

  assert.match(topbarRule, /position:\s*relative;/);
  assert.match(topbarRule, /z-index:\s*4[0-9];/);
  assert.match(menuRule, /pointer-events:\s*auto;/);
  assert.match(menuRule, /z-index:\s*6[0-9];/);
});
