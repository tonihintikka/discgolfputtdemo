import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate, Link as RouterLink } from 'react-router-dom'
import { ThemeProvider, CssBaseline, Container, Box, AppBar, Toolbar, Typography, IconButton, Button } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import StraightenIcon from '@mui/icons-material/Straighten'; // Icon for Distance Meter
import AdjustIcon from '@mui/icons-material/Adjust'; // Icon for Drills
import HistoryIcon from '@mui/icons-material/History'; // Icon for History
import { createTheme } from '@mui/material/styles'
import OfflineIndicator from './components/common/OfflineIndicator'

// Drill components
import DrillSelection from './components/drills/DrillSelection'
import DrillInstructions from './components/drills/DrillInstructions'
import ActiveDrill from './components/drills/ActiveDrill'
import DrillSummary from './components/drills/DrillSummary'

// Distance component
import DistanceMeter from './components/distance/DistanceMeter'

// History component
import HistoryPage from './pages/HistoryPage'

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Green color similar to disc golf courses
    },
    secondary: {
      main: '#f57c00', // Orange for contrast
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <AppBar position="static">
            <Toolbar>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="home"
                sx={{ mr: 2 }}
                component={RouterLink} to="/drills"
              >
                <AdjustIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Disc Golf Training
              </Typography>
              
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/distance"
                startIcon={<StraightenIcon />}
                sx={{ mr: 1 }}
              >
                Distance
              </Button>
              
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/history"
                startIcon={<HistoryIcon />}
              >
                History
              </Button>
              
              <OfflineIndicator />
            </Toolbar>
          </AppBar>
          
          <Box sx={{ flexGrow: 1, overflow: 'auto', py: 2 }}>
            <Routes>
              <Route path="/" element={<Navigate to="/drills" replace />} />
              <Route path="/drills" element={<DrillSelection onSelectDrill={(id) => {}} />} />
              <Route path="/practice/:drillId" element={<DrillInstructions />} />
              <Route path="/practice/:drillId/active" element={<ActiveDrill />} />
              <Route path="/results/:sessionId" element={<DrillSummary />} />
              <Route path="/distance" element={<DistanceMeter />} />
              <Route path="/history" element={<HistoryPage />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  )
}

export default App
