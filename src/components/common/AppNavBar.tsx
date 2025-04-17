import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import OfflineIndicator from './OfflineIndicator';
import { useLanguage } from '../../context/LanguageContext';

const AppNavBar: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {t('appName', 'Disc Golf Training')}
        </Typography>
        <OfflineIndicator />
      </Toolbar>
    </AppBar>
  );
};

export default AppNavBar; 