import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (isOnline) return null;
  
  return (
    <Box 
      sx={{ 
        bgcolor: 'warning.main', 
        color: 'warning.contrastText', 
        p: 1, 
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1
      }}
    >
      <WifiOffIcon fontSize="small" />
      <Typography variant="body2">
        You are currently offline. Some features may be limited.
      </Typography>
    </Box>
  );
};

export default OfflineIndicator; 