import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  
  const handleLanguageChange = (
    event: React.MouseEvent<HTMLElement>,
    newLanguage: string,
  ) => {
    if (newLanguage !== null) {
      i18n.changeLanguage(newLanguage);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Select Language / Valitse kieli
      </Typography>
      
      <ToggleButtonGroup
        value={i18n.language}
        exclusive
        onChange={handleLanguageChange}
        aria-label="language selection"
      >
        <ToggleButton value="en" aria-label="English">
          English
        </ToggleButton>
        <ToggleButton value="fi" aria-label="Finnish">
          Suomi
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default LanguageSwitcher; 