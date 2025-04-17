import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Import translation files directly
import enTranslations from '../locales/en/app-text.json';
import fiTranslations from '../locales/fi/app-text.json';

// Type for translations
interface Translations {
  [key: string]: any;
}

// Language context interface
interface LanguageContextType {
  language: string;
  translations: Translations;
  changeLanguage: (lang: string) => void;
  t: (key: string, defaultText?: string) => string;
}

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  translations: enTranslations,
  changeLanguage: () => {},
  t: () => '',
});

// Helper function to get nested properties from an object using a dot-notated path
const getNestedValue = (obj: any, path: string, defaultValue: string = ''): string => {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return defaultValue;
    }
  }
  
  return typeof result === 'string' ? result : defaultValue;
};

// Provider component
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Initialize language from localStorage or navigator
  const [language, setLanguage] = useState<string>(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) return savedLanguage;
    
    const browserLang = navigator.language.substring(0, 2).toLowerCase();
    return browserLang === 'fi' ? 'fi' : 'en';
  });
  
  // Determine which translations to use
  const [translations, setTranslations] = useState<Translations>(
    language === 'fi' ? fiTranslations : enTranslations
  );
  
  // Update translations when language changes
  useEffect(() => {
    setTranslations(language === 'fi' ? fiTranslations : enTranslations);
    localStorage.setItem('preferredLanguage', language);
    
    // You could also update document.documentElement.lang here
    document.documentElement.lang = language;
  }, [language]);
  
  // Translation function
  const t = (key: string, defaultText: string = key): string => {
    return getNestedValue(translations, key, defaultText);
  };
  
  // Change language function
  const changeLanguage = (lang: string) => {
    setLanguage(lang);
  };
  
  // Context value
  const contextValue: LanguageContextType = {
    language,
    translations,
    changeLanguage,
    t,
  };
  
  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for using the language context
export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext; 