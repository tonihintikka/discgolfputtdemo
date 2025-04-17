import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  BottomNavigation, 
  BottomNavigationAction, 
  Paper
} from '@mui/material';
import AdjustIcon from '@mui/icons-material/Adjust'; // Icon for Drills
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk'; // Icon for Distance
import HistoryIcon from '@mui/icons-material/History'; // Icon for History
import SettingsIcon from '@mui/icons-material/Settings'; // Icon for Settings

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the current route path to set the active tab
  const getCurrentValue = () => {
    const path = location.pathname;
    if (path.includes('/drills')) return 0;
    if (path.includes('/distance')) return 1;
    if (path.includes('/history')) return 2;
    if (path.includes('/settings')) return 3;
    return 0; // Default to drills tab
  };
  
  const [value, setValue] = useState(getCurrentValue());
  
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    
    // Navigate based on the selected tab
    switch (newValue) {
      case 0:
        navigate('/drills');
        break;
      case 1:
        navigate('/distance');
        break;
      case 2:
        navigate('/history');
        break;
      case 3:
        navigate('/settings');
        break;
      default:
        navigate('/drills');
    }
  };
  
  return (
    <Box sx={{ width: '100%', position: 'fixed', bottom: 0, zIndex: 1000 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          paddingBottom: 'env(safe-area-inset-bottom)',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        <BottomNavigation
          value={value}
          onChange={handleChange}
          showLabels
        >
          <BottomNavigationAction 
            label="Drills" 
            icon={<AdjustIcon />} 
          />
          <BottomNavigationAction 
            label="Distance" 
            icon={<DirectionsWalkIcon />} 
          />
          <BottomNavigationAction 
            label="History" 
            icon={<HistoryIcon />} 
          />
          <BottomNavigationAction 
            label="Settings" 
            icon={<SettingsIcon />} 
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default BottomNav; 