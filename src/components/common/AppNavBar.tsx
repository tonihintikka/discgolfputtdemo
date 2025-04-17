import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import OfflineIndicator from './OfflineIndicator';

const AppNavBar: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Disc Golf Training
        </Typography>
        <OfflineIndicator />
      </Toolbar>
    </AppBar>
  );
};

export default AppNavBar; 