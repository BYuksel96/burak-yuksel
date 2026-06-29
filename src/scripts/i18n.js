import { DE_TRANSLATIONS } from './i18n-data-de.js';
import { EN_TRANSLATIONS } from './i18n-data-en.js';
import { ES_TRANSLATIONS } from './i18n-data-es.js';
import { FR_TRANSLATIONS } from './i18n-data-fr.js';
import { TR_TRANSLATIONS } from './i18n-data-tr.js';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', shortCode: 'EN', nativeName: 'English' },
  { code: 'es', shortCode: 'ES', nativeName: 'Espanol' },
  { code: 'fr', shortCode: 'FR', nativeName: 'Francais' },
  { code: 'de', shortCode: 'DE', nativeName: 'Deutsch' },
  { code: 'tr', shortCode: 'TR', nativeName: 'Turkce' },
];

export const LANGUAGE_STORAGE_KEY = 'burak-os-language';
export const LANGUAGE_CHANGE_EVENT = 'burak-os:language-change';

const LANGUAGE_LOCALES = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  tr: 'tr-TR',
};

const TRANSLATIONS = {
  en: EN_TRANSLATIONS,
  es: ES_TRANSLATIONS,
  fr: FR_TRANSLATIONS,
  de: DE_TRANSLATIONS,
  tr: TR_TRANSLATIONS,
};

let activeLanguage = 'en';

export const normalizeLanguage = (language) => {
  const normalized = String(language ?? '').trim().toLowerCase();
  return SUPPORTED_LANGUAGES.some((item) => item.code === normalized) ? normalized : null;
};

export const getLanguageOptions = (active = activeLanguage) => {
  const activeCode = normalizeLanguage(active) ?? 'en';
  return SUPPORTED_LANGUAGES.map((language) => ({
    ...language,
    isActive: language.code === activeCode,
  }));
};

export const createLanguageSessionStore = (getStorage = () => (typeof window !== 'undefined' ? window.sessionStorage : null)) => {
  let memoryLanguage = null;

  return {
    read() {
      try {
        const storedLanguage = normalizeLanguage(getStorage()?.getItem(LANGUAGE_STORAGE_KEY));
        if (storedLanguage) {
          memoryLanguage = storedLanguage;
          return storedLanguage;
        }
      } catch {
        // Some browsers or privacy modes can block storage. Keep a session-memory language instead.
      }

      return memoryLanguage;
    },
    write(language) {
      const nextLanguage = normalizeLanguage(language);
      if (!nextLanguage) return memoryLanguage;

      memoryLanguage = nextLanguage;

      try {
        getStorage()?.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
      } catch {
        // Keep the in-memory value when sessionStorage is unavailable.
      }

      return memoryLanguage;
    },
  };
};

const isPlainObject = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));

const getPathValue = (source, key) =>
  String(key)
    .split('.')
    .reduce((value, segment) => (value && Object.hasOwn(value, segment) ? value[segment] : undefined), source);

const walkLeafKeys = (source, prefix = '') => {
  if (!isPlainObject(source)) return prefix ? [prefix] : [];

  return Object.entries(source).flatMap(([key, value]) => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    return isPlainObject(value) ? walkLeafKeys(value, nextPrefix) : [nextPrefix];
  });
};

export const collectMissingTranslationKeys = () => {
  const englishKeys = walkLeafKeys(EN_TRANSLATIONS);
  const missing = {};

  Object.keys(TRANSLATIONS)
    .filter((language) => language !== 'en')
    .forEach((language) => {
      const missingKeys = englishKeys.filter((key) => getPathValue(TRANSLATIONS[language], key) === undefined);
      if (missingKeys.length) missing[language] = missingKeys;
    });

  return missing;
};

const formatPluralPatterns = (template, values = {}) =>
  String(template).replace(/\{(\w+),\s*plural,\s*one\s*\{([^{}]+)\}\s*other\s*\{([^{}]+)\}\}/g, (_, name, one, other) =>
    Number(values[name]) === 1 ? one : other,
  );

export const interpolate = (template, values = {}) =>
  formatPluralPatterns(template, values).replace(/\{(\w+)\}/g, (match, name) =>
    Object.hasOwn(values, name) ? String(values[name]) : match,
  );

export const translate = (key, language = activeLanguage, values = {}) => {
  const normalized = normalizeLanguage(language) ?? 'en';
  const translatedValue = getPathValue(TRANSLATIONS[normalized], key);
  const fallbackValue = getPathValue(EN_TRANSLATIONS, key);
  const value = translatedValue ?? fallbackValue ?? key;
  return typeof value === 'string' ? interpolate(value, values) : value;
};

export const getActiveLanguage = () => activeLanguage;

export const setActiveLanguage = (language) => {
  activeLanguage = normalizeLanguage(language) ?? 'en';
  return activeLanguage;
};

export const getLanguageLocale = (language = activeLanguage, fallback = LANGUAGE_LOCALES.en) =>
  LANGUAGE_LOCALES[normalizeLanguage(language) ?? ''] ?? fallback;

export const getTranslatedBlogPost = (slug, language = activeLanguage) => {
  const normalizedSlug = String(slug ?? '')
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .replace(/-to-the-max$/, '')
    .toLowerCase();
  const post = translate(`blog.posts.${normalizedSlug}`, language);
  return isPlainObject(post) ? post : {};
};

export const getTranslatedResumeEntry = (id, language = activeLanguage) => {
  const entry = translate(`resume.entries.${id}`, language);
  return isPlainObject(entry) ? entry : {};
};

export const getTranslatedQuizCategoryLabel = (categoryId, language = activeLanguage) =>
  translate(`quiz.categories.${categoryId}`, language);

export const getTranslatedQuizDifficultyLabel = (difficulty, language = activeLanguage) =>
  translate(`quiz.difficulties.${difficulty}`, language);

export const localizeQuizQuestion = (question, language = activeLanguage) => {
  if (!question) return question;

  const translation = translate(`quiz.questions.${question.id}`, language);
  if (!isPlainObject(translation)) return question;

  return {
    ...question,
    prompt: translation.prompt ?? question.prompt,
    scenarioContext: translation.scenarioContext || question.scenarioContext,
    explanation: translation.explanation ?? question.explanation,
    whyItMatters: translation.whyItMatters ?? question.whyItMatters,
    reference: question.reference
      ? {
          ...question.reference,
          title: translation.reference?.title || question.reference.title,
          section: translation.reference?.section || question.reference.section,
        }
      : question.reference,
    choices: question.choices.map((choice) => {
      const sourceChoiceId = choice.sourceChoiceId ?? choice.id;
      return {
        ...choice,
        text: translation.choices?.[sourceChoiceId] ?? choice.text,
      };
    }),
  };
};

const parseVars = (element) => {
  const source = element.getAttribute('data-i18n-vars');
  if (!source) return {};

  try {
    return JSON.parse(source);
  } catch {
    return {};
  }
};

const setElementText = (element, key, language) => {
  const value = translate(key, language, parseVars(element));
  if (typeof value === 'string') element.textContent = value;
};

const setElementHtml = (element, key, language) => {
  if (!element.hasAttribute('data-i18n-original-html')) {
    element.setAttribute('data-i18n-original-html', element.innerHTML);
  }

  if (language === 'en') {
    element.innerHTML = element.getAttribute('data-i18n-original-html') ?? element.innerHTML;
    return;
  }

  const value = translate(key, language, parseVars(element));
  if (typeof value === 'string') element.innerHTML = value;
};

export const applyI18n = (root = document, language = activeLanguage) => {
  const normalized = normalizeLanguage(language) ?? 'en';

  root.querySelectorAll?.('[data-i18n]').forEach((element) => {
    setElementText(element, element.getAttribute('data-i18n'), normalized);
  });

  root.querySelectorAll?.('[data-i18n-html]').forEach((element) => {
    setElementHtml(element, element.getAttribute('data-i18n-html'), normalized);
  });

  ['aria-label', 'title', 'alt'].forEach((attributeName) => {
    const dataName = `data-i18n-${attributeName}`;
    root.querySelectorAll?.(`[${dataName}]`).forEach((element) => {
      const value = translate(element.getAttribute(dataName), normalized, parseVars(element));
      if (typeof value === 'string') element.setAttribute(attributeName, value);
    });
  });
};

const closeLanguageMenu = (toggle, menu) => {
  if (!toggle || !menu) return;
  toggle.setAttribute('aria-expanded', 'false');
  menu.hidden = true;
};

const renderLanguageControl = ({ root, toggle, menu, language }) => {
  const active = normalizeLanguage(language) ?? 'en';
  const current = SUPPORTED_LANGUAGES.find((item) => item.code === active) ?? SUPPORTED_LANGUAGES[0];
  if (toggle) {
    toggle.textContent = current.shortCode;
    toggle.setAttribute('aria-label', translate('os.topbar.languageButtonLabel', active));
    toggle.setAttribute('title', translate('os.topbar.languageButtonLabel', active));
  }

  menu?.querySelectorAll('[data-os-language-option]').forEach((option) => {
    const optionLanguage = option.getAttribute('data-os-language-option');
    option.toggleAttribute('data-active', optionLanguage === active);
    option.setAttribute('aria-checked', String(optionLanguage === active));
  });

  applyI18n(root, active);
};

export const initLanguageMode = (root = document, options = {}) => {
  const store = options.store ?? createLanguageSessionStore();
  const toggle = root.querySelector?.('[data-os-language-toggle]');
  const menu = root.querySelector?.('[data-os-language-menu]');
  const initialLanguage = setActiveLanguage(store.read() ?? options.defaultLanguage ?? 'en');

  if (typeof document !== 'undefined') {
    document.documentElement.lang = initialLanguage;
  }

  renderLanguageControl({ root, toggle, menu, language: initialLanguage });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: { language: initialLanguage } }));
  }

  toggle?.addEventListener('click', (event) => {
    event.preventDefault();
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    if (menu) menu.hidden = isOpen;
  });

  menu?.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('[data-os-language-option]') : null;
    if (!target) return;

    event.preventDefault();
    const nextLanguage = setActiveLanguage(store.write(target.getAttribute('data-os-language-option')) ?? 'en');
    if (typeof document !== 'undefined') document.documentElement.lang = nextLanguage;
    renderLanguageControl({ root, toggle, menu, language: nextLanguage });
    closeLanguageMenu(toggle, menu);
    window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: { language: nextLanguage } }));
  });

  root.addEventListener?.('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target || target.closest('[data-os-language-toggle]') || target.closest('[data-os-language-menu]')) return;
    closeLanguageMenu(toggle, menu);
  });

  root.addEventListener?.('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeLanguageMenu(toggle, menu);
  });

  return initialLanguage;
};
