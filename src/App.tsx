import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline, Box } from '@mui/material'
import { createTheme } from '@mui/material/styles'

// Common components
import AppNavBar from './components/common/AppNavBar'
import BottomNav from './components/common/BottomNav'

// Drill components
import { DrillSelection } from './components/drills/DrillSelection'
import DrillInstructions from './components/drills/DrillInstructions'
import ActiveDrill from './components/drills/ActiveDrill'
import DrillSummary from './components/drills/DrillSummary'

// Distance component
import DistanceMeter from './components/distance/DistanceMeter'

// History component
import HistoryPage from './pages/HistoryPage'

// Pedometer component
import PedometerPage from './pages/PedometerPage'

// Settings component
import SettingsPage from './pages/SettingsPage'

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
          <AppNavBar />
          
          <Box 
            sx={{ 
              flexGrow: 1, 
              overflow: 'auto', 
              py: 2,
              pb: { xs: 7, sm: 7 }, // Add bottom padding to account for navigation
              // Safe area padding for iPhone X and newer
              '@supports (padding-bottom: env(safe-area-inset-bottom))': {
                paddingBottom: 'calc(56px + env(safe-area-inset-bottom))'
              }
            }}
          >
            <Routes>
              <Route path="/" element={<Navigate to="/drills" replace />} />
              <Route path="/drills" element={<DrillSelection onDrillSelect={(drill) => console.log('Drill selected:', drill.id)} />} />
              <Route path="/drills/:drillId" element={<DrillInstructions />} />
              <Route path="/practice/:drillId" element={<DrillInstructions />} />
              <Route path="/practice/:drillId/active" element={<ActiveDrill />} />
              <Route path="/results/:sessionId" element={<DrillSummary />} />
              <Route path="/distance" element={<PedometerPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Box>
          
          <BottomNav />
        </Box>
      </Router>
    </ThemeProvider>
  )
}

export default App
