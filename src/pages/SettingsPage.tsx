import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  Switch, 
  ListItemSecondaryAction,
  Button,
  Alert,
  Snackbar
} from '@mui/material';
import LanguageSwitcher from '../components/settings/LanguageSwitcher';
import DeleteIcon from '@mui/icons-material/Delete';

const SettingsPage: React.FC = () => {
  // State for various settings
  const [darkMode, setDarkMode] = useState(false);
  const [saveSteps, setSaveSteps] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Handle language change
  const handleLanguageChange = (language: string) => {
    setSnackbarMessage(`Language changed to ${language === 'en' ? 'English' : 'Finnish'}`);
    setSnackbarOpen(true);
  };
  
  // Handle data clearing
  const handleClearData = () => {
    // In a real implementation, we would clear localStorage or IndexedDB data
    setSnackbarMessage('All app data has been cleared');
    setSnackbarOpen(true);
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      
      {/* Language Settings */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Language Settings
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <LanguageSwitcher onLanguageChange={handleLanguageChange} />
      </Paper>
      
      {/* App Preferences */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          App Preferences
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List disablePadding>
          <ListItem>
            <ListItemText 
              primary="Dark Mode" 
              secondary="Use dark color scheme throughout the app"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="Save Step Data" 
              secondary="Store step counts and distances for later review"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={saveSteps}
                onChange={(e) => setSaveSteps(e.target.checked)}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="Notifications" 
              secondary="Enable push notifications (practice reminders, etc.)"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>
      
      {/* Data Management */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Data Management
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" paragraph>
          Clear all application data including saved sessions, settings, and cached content.
          This action cannot be undone.
        </Typography>
        
        <Button 
          variant="outlined" 
          color="error" 
          startIcon={<DeleteIcon />}
          onClick={handleClearData}
        >
          Clear All Data
        </Button>
      </Paper>
      
      {/* About Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          About
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" paragraph>
          Disc Golf Training PWA
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Version 1.0.0
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 2 }}>
          Made with ❤️ for disc golfers
        </Typography>
      </Paper>
      
      {/* Feedback snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default SettingsPage; 