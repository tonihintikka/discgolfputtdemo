import React, { useState, useEffect } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

interface LanguageSwitcherProps {
  onLanguageChange?: (language: string) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ onLanguageChange }) => {
  // Initialize language state with saved preference or default to browser language or English
  const [language, setLanguage] = useState<string>(() => {
    // Check localStorage first
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) return savedLanguage;
    
    // Then try browser language
    const browserLang = navigator.language.substring(0, 2).toLowerCase();
    return browserLang === 'fi' ? 'fi' : 'en';
  });
  
  // Effect to notify parent component of initial language on mount
  useEffect(() => {
    if (onLanguageChange) {
      onLanguageChange(language);
    }
  }, []);
  
  const handleLanguageChange = (
    event: React.MouseEvent<HTMLElement>,
    newLanguage: string | null,
  ) => {
    if (newLanguage !== null) {
      setLanguage(newLanguage);
      
      // Store selected language in localStorage
      localStorage.setItem('preferredLanguage', newLanguage);
      
      // Call the callback if provided
      if (onLanguageChange) {
        onLanguageChange(newLanguage);
      }
      
      // In a real implementation with i18next, we would also do:
      // i18n.changeLanguage(newLanguage);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Select Language / Valitse kieli
      </Typography>
      
      <ToggleButtonGroup
        value={language}
        exclusive
        onChange={handleLanguageChange}
        aria-label="language selection"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="en" aria-label="English">
          English
        </ToggleButton>
        <ToggleButton value="fi" aria-label="Finnish">
          Suomi
        </ToggleButton>
      </ToggleButtonGroup>
      
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {language === 'en' 
          ? 'Current language: English' 
          : 'Nykyinen kieli: Suomi'}
      </Typography>
    </Box>
  );
};

export default LanguageSwitcher; 