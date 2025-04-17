import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// We will load translations directly for now
// Later, we can explore loading them dynamically
import translationEN from '../locales/en/translation.json';
import translationFI from '../locales/fi/translation.json';

const resources = {
  en: {
    translation: translationEN
  },
  fi: {
    translation: translationFI
  }
};

i18n
  // Detect user language
  // Learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // Init i18next
  // For all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: true, // Set to false in production
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    resources: resources,
    // Language detection options
    detection: {
      // Order and from where user language should be detected
      order: ['localStorage', 'navigator'],
      // Cache user language in localStorage
      caches: ['localStorage'],
    },
  });

export default i18n; 