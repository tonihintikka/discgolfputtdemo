import React from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useLanguage } from '../../context/LanguageContext';

interface LanguageSwitcherProps {
  onLanguageChange?: (language: string) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ onLanguageChange }) => {
  const { language, changeLanguage } = useLanguage();
  
  const handleLanguageChange = (
    event: React.MouseEvent<HTMLElement>,
    newLanguage: string | null,
  ) => {
    if (newLanguage !== null) {
      // Update language in context
      changeLanguage(newLanguage);
      
      // Call the callback if provided
      if (onLanguageChange) {
        onLanguageChange(newLanguage);
      }
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