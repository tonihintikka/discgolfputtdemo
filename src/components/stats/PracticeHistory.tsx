import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction,
  Divider,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Container,
  Alert,
  CircularProgress,
  SelectChangeEvent
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useNavigate } from 'react-router-dom';
import { sessionStorage } from '../../services/storage/storageService';
import { DrillSession } from '../../types/drills';
import { getDrillType } from '../../services/drillService';

// Filters for practice sessions
type FilterOption = 'all' | 'week' | 'month' | 'completed';

const PracticeHistory: React.FC = () => {
  const [sessions, setSessions] = useState<DrillSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterOption>('all');
  const navigate = useNavigate();
  
  // Fetch sessions on component mount and when filter changes
  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const allSessions = await sessionStorage.getSessions();
        
        // Apply filters
        let filteredSessions = [...allSessions];
        
        const now = new Date();
        if (filter === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filteredSessions = filteredSessions.filter(session => 
            new Date(session.startTime) >= weekAgo
          );
        } else if (filter === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filteredSessions = filteredSessions.filter(session => 
            new Date(session.startTime) >= monthAgo
          );
        } else if (filter === 'completed') {
          filteredSessions = filteredSessions.filter(session => session.completed);
        }
        
        // Sort by most recent first
        filteredSessions.sort((a, b) => {
          return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
        });
        
        setSessions(filteredSessions);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Failed to load practice history');
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, [filter]);
  
  // Format date for display
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Get drill name from drill type
  const getDrillName = (drillTypeId: string): string => {
    const drillType = getDrillType(drillTypeId);
    return drillType ? drillType.name : 'Unknown Drill';
  };
  
  // Handle view session details
  const handleViewSession = (sessionId: string) => {
    navigate(`/results/${sessionId}`);
  };
  
  // Handle filter change
  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilter(event.target.value as FilterOption);
  };
  
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading practice history...</Typography>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, my: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Practice History
          </Typography>
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="filter-label">Filter</InputLabel>
            <Select
              labelId="filter-label"
              value={filter}
              onChange={handleFilterChange}
              label="Filter"
            >
              <MenuItem value="all">All Sessions</MenuItem>
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
              <MenuItem value="completed">Completed Only</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {sessions.length === 0 ? (
          <Alert severity="info">No practice sessions found. Start practicing to record your sessions!</Alert>
        ) : (
          <List>
            {sessions.map((session) => (
              <React.Fragment key={session.id}>
                <ListItem>
                  <ListItemText
                    primary={getDrillName(session.drillTypeId)}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.6 }} />
                        <Typography variant="body2" component="span">
                          {formatDate(session.startTime)}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {session.completed ? (
                      <Chip 
                        size="small" 
                        label="Completed" 
                        color="success" 
                        sx={{ mr: 1 }}
                      />
                    ) : (
                      <Chip 
                        size="small" 
                        label="Unfinished" 
                        color="warning" 
                        sx={{ mr: 1 }}
                      />
                    )}
                    {session.completed && session.summary && (
                      <Chip 
                        size="small" 
                        label={`${session.summary.makePercentage.toFixed(1)}%`} 
                        color="primary" 
                        sx={{ mr: 1 }}
                      />
                    )}
                    <IconButton 
                      edge="end" 
                      color="primary"
                      onClick={() => handleViewSession(session.id)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default PracticeHistory; 