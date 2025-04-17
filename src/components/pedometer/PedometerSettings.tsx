import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Slider,
  FormControl,
  FormControlLabel,
  Switch,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  InputAdornment,
  Divider
} from '@mui/material';
import { usePedometerService } from '../../services/pedometer/pedometerService';
import type { PedometerSettings, CalibrationSession } from '../../services/pedometer/pedometerService';
import { formatDistance } from '../../services/pedometer/distanceCalculation';

interface PedometerSettingsProps {
  open: boolean;
  onClose: () => void;
}

const PedometerSettings: React.FC<PedometerSettingsProps> = ({ open, onClose }) => {
  const pedometer = usePedometerService();
  const [settings, setSettings] = useState<PedometerSettings>({ ...pedometer.settings });
  const [calibrationDistance, setCalibrationDistance] = useState<number>(10);
  const [showCalibration, setShowCalibration] = useState<boolean>(false);
  
  // Handle height change
  const handleHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const height = parseInt(event.target.value);
    if (!isNaN(height) && height > 0) {
      setSettings({ ...settings, userHeight: height });
    }
  };

  // Handle sensitivity change
  const handleSensitivityChange = (_event: any, value: number | number[]) => {
    setSettings({ ...settings, sensitivity: value as number });
  };

  // Handle sensor preference change
  const handleSensorPreferenceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, useHardwareSensor: event.target.checked });
  };

  // Handle using calibrated step length
  const handleUseCalibrated = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, useCalibrated: event.target.checked });
  };

  // Handle calibration distance change
  const handleCalibrationDistanceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const distance = parseFloat(event.target.value);
    if (!isNaN(distance) && distance > 0) {
      setCalibrationDistance(distance);
    }
  };

  // Start the calibration process
  const startCalibration = async () => {
    setShowCalibration(true);
    // Reset steps before starting
    pedometer.resetTracking();
    await pedometer.startTracking();
  };

  // Finish calibration
  const finishCalibration = async () => {
    if (pedometer.steps > 0) {
      try {
        await pedometer.calibrateStepLength(calibrationDistance);
        // Refresh our settings to reflect the new calibrated value
        setSettings({ 
          ...settings, 
          calibratedStepLength: pedometer.settings.calibratedStepLength,
          useCalibrated: true 
        });
      } catch (error) {
        console.error('Calibration failed:', error);
      }
    }
    
    await pedometer.stopTracking();
    setShowCalibration(false);
  };

  // Cancel calibration
  const cancelCalibration = async () => {
    await pedometer.stopTracking();
    setShowCalibration(false);
  };

  // Save all settings
  const saveSettings = async () => {
    await pedometer.saveSettings(settings);
    onClose();
  };

  // Format date for display
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Pedometer Settings</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Typography variant="h6">Sensor Options</Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.useHardwareSensor}
                  onChange={handleSensorPreferenceChange}
                  color="primary"
                />
              }
              label="Use hardware step sensor when available"
            />
            
            <Typography variant="body2" color="text.secondary">
              {pedometer.hardwareSensorAvailable 
                ? "Hardware step sensor is available on this device" 
                : "No hardware step sensor detected, using accelerometer"}
            </Typography>

            <Divider />
            
            <Typography variant="h6">Step Detection</Typography>
            
            <Box>
              <Typography gutterBottom>
                Sensitivity
              </Typography>
              <Slider
                value={settings.sensitivity}
                onChange={handleSensitivityChange}
                min={1}
                max={10}
                step={1}
                marks
                valueLabelDisplay="auto"
                aria-labelledby="sensitivity-slider"
              />
              <Typography variant="caption" color="text.secondary">
                Higher sensitivity may detect more steps but include false positives
              </Typography>
            </Box>

            <Divider />
            
            <Typography variant="h6">Step Length</Typography>
            
            <TextField
              label="Your Height"
              type="number"
              value={settings.userHeight || ''}
              onChange={handleHeightChange}
              InputProps={{
                endAdornment: <InputAdornment position="end">cm</InputAdornment>,
              }}
              fullWidth
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.useCalibrated}
                  onChange={handleUseCalibrated}
                  color="primary"
                  disabled={!settings.calibratedStepLength}
                />
              }
              label="Use calibrated step length"
            />
            
            {settings.calibratedStepLength && (
              <Typography variant="body2">
                Your calibrated step length: {(settings.calibratedStepLength * 100).toFixed(1)} cm
              </Typography>
            )}
            
            <Button 
              variant="outlined" 
              color="primary"
              onClick={startCalibration}
              disabled={showCalibration || pedometer.isTracking}
            >
              Calibrate Step Length
            </Button>
            
            {pedometer.calibrationHistory.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Calibration History
                </Typography>
                <Stack spacing={1}>
                  {pedometer.calibrationHistory.slice(0, 3).map((session: CalibrationSession, index: number) => (
                    <Card variant="outlined" key={index} sx={{ p: 1 }}>
                      <Typography variant="body2">
                        {formatDate(session.timestamp)}
                      </Typography>
                      <Typography variant="body2">
                        {session.stepsTaken} steps over {session.knownDistance} meters
                      </Typography>
                      <Typography variant="body2">
                        Step length: {(session.calculatedStepLength * 100).toFixed(1)} cm
                      </Typography>
                    </Card>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button onClick={saveSettings} color="primary" variant="contained">
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Calibration Dialog */}
      <Dialog open={showCalibration}>
        <DialogTitle>Calibrate Step Length</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Walk a known distance while counting steps.
          </DialogContentText>
          
          <Box sx={{ my: 3, textAlign: 'center' }}>
            <Typography variant="h2">
              {pedometer.steps}
            </Typography>
            <Typography variant="subtitle1">
              steps
            </Typography>
          </Box>
          
          <TextField
            label="Distance Walked"
            type="number"
            value={calibrationDistance}
            onChange={handleCalibrationDistanceChange}
            InputProps={{
              endAdornment: <InputAdornment position="end">m</InputAdornment>,
            }}
            fullWidth
            margin="normal"
          />
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            For best results, walk at least 10 meters in a straight line.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelCalibration} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={finishCalibration} 
            color="primary" 
            variant="contained"
            disabled={pedometer.steps === 0}
          >
            Finish Calibration
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PedometerSettings; 