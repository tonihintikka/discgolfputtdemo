import { createTheme } from '@mui/material/styles';

// Disc golf inspired color palette
// Green for field/grass, blue for sky, accent colors for disc golf elements
const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50', // Grass green
      light: '#80E27E',
      dark: '#087f23',
      contrastText: '#fff',
    },
    secondary: {
      main: '#2196F3', // Sky blue
      light: '#6EC6FF',
      dark: '#0069C0',
      contrastText: '#fff',
    },
    error: {
      main: '#F44336',
    },
    warning: {
      main: '#FF9800',
    },
    info: {
      main: '#03A9F4',
    },
    success: {
      main: '#4CAF50',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#263238',
      secondary: '#546E7A',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export default theme; 