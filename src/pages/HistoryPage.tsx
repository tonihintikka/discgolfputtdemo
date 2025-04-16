import React from 'react';
import { Container, Box, Typography, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import PracticeHistory from '../components/stats/PracticeHistory';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const HistoryPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%', pt: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="history tabs">
            <Tab label="Practice History" {...a11yProps(0)} />
            <Tab label="Distance Measurements" {...a11yProps(1)} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <PracticeHistory />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" color="text.secondary">
              Distance History Coming Soon...
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              We'll show your distance measurements history here in a future update.
            </Typography>
          </Box>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default HistoryPage; 