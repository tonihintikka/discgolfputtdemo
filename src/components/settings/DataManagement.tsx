import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Divider,
  Alert,
  AlertTitle,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Card,
  CardContent,
  Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import StorageIcon from '@mui/icons-material/Storage';
import { dataManagement, sessionStorage, measurementStorage } from '../../services/storage/storageService';

type DataStats = {
  settings: number;
  sessions: number;
  attempts: number;
  measurements: number;
  total: number;
};

const DataManagement: React.FC = () => {
  const [stats, setStats] = useState<DataStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState<'all' | 'sessions' | 'measurements'>('all');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const loadStats = async () => {
    setLoading(true);
    try {
      const stats = await dataManagement.getStorageStats();
      setStats(stats);
    } catch (error) {
      console.error('Error loading storage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleClearData = (type: 'all' | 'sessions' | 'measurements') => {
    setDialogAction(type);
    setOpenDialog(true);
  };

  const handleConfirmClear = async () => {
    setOpenDialog(false);
    setLoading(true);

    try {
      switch (dialogAction) {
        case 'all':
          await dataManagement.clearAllData();
          setSnackbarMessage('All data cleared successfully');
          break;
        case 'sessions':
          await sessionStorage.clearSessions();
          setSnackbarMessage('Practice sessions cleared successfully');
          break;
        case 'measurements':
          await measurementStorage.clearMeasurements();
          setSnackbarMessage('Distance measurements cleared successfully');
          break;
      }
      
      // Reload stats after clearing
      await loadStats();
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error clearing data:', error);
      setSnackbarMessage('Error clearing data');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const getDialogText = () => {
    switch (dialogAction) {
      case 'all':
        return 'This will permanently delete ALL your data including practice sessions, distance measurements, and settings.';
      case 'sessions':
        return 'This will permanently delete all your practice sessions and attempts.';
      case 'measurements':
        return 'This will permanently delete all your distance measurements.';
      default:
        return '';
    }
  };

  if (loading && !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        <StorageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Data Management
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Local Storage Only</AlertTitle>
        All data is stored locally on your device. No data is sent to any server.
      </Alert>

      <Typography variant="h6" gutterBottom>
        Storage Statistics
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Box sx={{ flex: '1 1 calc(25% - 16px)', minWidth: '120px' }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Practice Sessions
              </Typography>
              <Typography variant="h5">{stats?.sessions || 0}</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 calc(25% - 16px)', minWidth: '120px' }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Putt Attempts
              </Typography>
              <Typography variant="h5">{stats?.attempts || 0}</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 calc(25% - 16px)', minWidth: '120px' }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Measurements
              </Typography>
              <Typography variant="h5">{stats?.measurements || 0}</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 calc(25% - 16px)', minWidth: '120px' }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Total Items
              </Typography>
              <Typography variant="h5">{stats?.total || 0}</Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Typography variant="h6" gutterBottom>
        Clear Data
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => handleClearData('sessions')}
          disabled={loading || (stats?.sessions === 0 && stats?.attempts === 0)}
        >
          Clear Practice Sessions
        </Button>
        
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => handleClearData('measurements')}
          disabled={loading || stats?.measurements === 0}
        >
          Clear Distance Measurements
        </Button>
        
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => handleClearData('all')}
          disabled={loading || stats?.total === 0}
        >
          Clear All Data
        </Button>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>
          {"Confirm Data Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {getDialogText()}
            <br /><br />
            <strong>This action cannot be undone.</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} autoFocus>
            Cancel
          </Button>
          <Button onClick={handleConfirmClear} color="error">
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Paper>
  );
};

export default DataManagement; 