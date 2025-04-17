import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { CircularProgress, Box } from '@mui/material'
import './index.css'
import App from './App.tsx'
// Temporarily comment out i18n until we can fix issues
// import './config/i18n'

// Basic loading fallback component
const LoadingFallback = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<LoadingFallback />}>
      <App />
    </Suspense>
  </StrictMode>,
)
