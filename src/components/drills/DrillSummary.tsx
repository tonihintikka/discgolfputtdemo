import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Container,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { DrillSession, DrillType, PuttAttempt } from '../../types/drills';
import { getDrillType } from '../../services/drillService';
import { getSession, getSessionAttempts } from '../../services/storage/storageService';
import DistanceDisplay from '../common/DistanceDisplay';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const DrillSummary: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<DrillSession | undefined>(undefined);
  const [drill, setDrill] = useState<DrillType | undefined>(undefined);
  const [attempts, setAttempts] = useState<PuttAttempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch session data
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }
      
      try {
        // Get session
        const sessionData = await getSession(parseInt(sessionId));
        if (!sessionData) {
          setError('Session not found');
          setLoading(false);
          return;
        }
        
        setSession(sessionData);
        
        // Get drill type
        const drillType = getDrillType(sessionData.drillTypeId);
        if (!drillType) {
          setError('Drill type not found');
          setLoading(false);
          return;
        }
        
        setDrill(drillType);
        
        // Get attempts
        const sessionAttempts = await getSessionAttempts(parseInt(sessionId));
        setAttempts(sessionAttempts);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching session data:', error);
        setError('Failed to load session data');
        setLoading(false);
      }
    };
    
    fetchSessionData();
  }, [sessionId]);
  
  // Group attempts by distance
  const getAttemptsByDistance = () => {
    const attemptsByDistance: Record<number, { total: number, made: number }> = {};
    
    attempts.forEach(attempt => {
      const distance = attempt.distance;
      
      if (!attemptsByDistance[distance]) {
        attemptsByDistance[distance] = { total: 0, made: 0 };
      }
      
      attemptsByDistance[distance].total += 1;
      
      if (attempt.result === 'hit') {
        attemptsByDistance[distance].made += 1;
      }
    });
    
    return Object.entries(attemptsByDistance).map(([distance, stats]) => ({
      distance: parseFloat(distance),
      total: stats.total,
      made: stats.made,
      percentage: stats.total > 0 ? (stats.made / stats.total) * 100 : 0
    })).sort((a, b) => a.distance - b.distance);
  };
  
  // Calculate overall statistics
  const getOverallStats = () => {
    const total = attempts.length;
    const made = attempts.filter(a => a.result === 'hit').length;
    
    return {
      total,
      made,
      percentage: total > 0 ? (made / total) * 100 : 0
    };
  };
  
  const handleBackToDrills = () => {
    navigate('/drills');
  };
  
  if (loading) {
    return (
      <Container maxWidth="md">
        <Alert severity="info">Loading session data...</Alert>
      </Container>
    );
  }
  
  if (error || !session || !drill) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">{error || 'Failed to load session data'}</Alert>
        <Button 
          variant="contained" 
          onClick={handleBackToDrills}
          sx={{ mt: 2 }}
        >
          Back to Drills
        </Button>
      </Container>
    );
  }
  
  const overallStats = getOverallStats();
  const attemptsByDistance = getAttemptsByDistance();
  
  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {drill.name} Results
        </Typography>
        
        <Box sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Session completed on {new Date(session.endTime || Date.now()).toLocaleDateString()} at {new Date(session.endTime || Date.now()).toLocaleTimeString()}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6" gutterBottom>
            Overall Performance
          </Typography>
          
          <Typography variant="h2" color="primary" sx={{ my: 2 }}>
            {overallStats.percentage.toFixed(1)}%
          </Typography>
          
          <Typography variant="body1">
            Made {overallStats.made} of {overallStats.total} putts
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            Performance by Distance
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Distance</TableCell>
                  <TableCell align="center">Attempts</TableCell>
                  <TableCell align="center">Made</TableCell>
                  <TableCell align="center">Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attemptsByDistance.map((stats) => (
                  <TableRow key={stats.distance}>
                    <TableCell>
                      <DistanceDisplay meters={stats.distance} showIcon={false} variant="body2" />
                    </TableCell>
                    <TableCell align="center">{stats.total}</TableCell>
                    <TableCell align="center">{stats.made}</TableCell>
                    <TableCell align="center">
                      <Typography 
                        variant="body2" 
                        color={stats.percentage >= 50 ? 'success.main' : 'error.main'}
                        fontWeight="bold"
                      >
                        {stats.percentage.toFixed(1)}%
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            All Attempts
          </Typography>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Round</TableCell>
                  <TableCell>Distance</TableCell>
                  <TableCell>Stance</TableCell>
                  <TableCell align="center">Result</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attempts.sort((a, b) => a.round - b.round).map((attempt) => (
                  <TableRow key={attempt.id}>
                    <TableCell>{attempt.round}</TableCell>
                    <TableCell>
                      <DistanceDisplay meters={attempt.distance} showIcon={false} variant="body2" />
                    </TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{attempt.stance}</TableCell>
                    <TableCell align="center">
                      {attempt.result === 'hit' 
                        ? <CheckCircleIcon color="success" /> 
                        : <CancelIcon color="error" />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button 
            variant="outlined" 
            onClick={handleBackToDrills}
          >
            Back to Drills
          </Button>
          
          <Button 
            variant="contained" 
            onClick={() => navigate('/drills')}
          >
            New Practice Session
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default DrillSummary; 