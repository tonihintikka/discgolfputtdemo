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
  Stack,
  CircularProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { DrillSession, DrillType, PuttAttempt } from '../../types/drills';
import { getDrillType } from '../../services/drillService';
import { getSession, getSessionAttempts } from '../../services/storage/storageService';
import DistanceDisplay from '../common/DistanceDisplay';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useLanguage } from '../../context/LanguageContext';

const DrillSummary: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [session, setSession] = useState<DrillSession | undefined>(undefined);
  const [drill, setDrill] = useState<DrillType | undefined>(undefined);
  const [attempts, setAttempts] = useState<PuttAttempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch session data
  useEffect(() => {
    const fetchSessionData = async () => {
      setLoading(true);
      setError(null);
      if (!sessionId) {
        setError(t('summary.errorNoSessionId', 'No session ID provided'));
        setLoading(false);
        return;
      }
      
      try {
        const numericSessionId = parseInt(sessionId);
        // Get session record
        const sessionRecord = await getSession(numericSessionId);
        if (!sessionRecord) {
          setError(t('summary.errorSessionNotFound', 'Session not found'));
          setLoading(false);
          return;
        }
        
        // Get attempts records
        const attemptRecords = await getSessionAttempts(numericSessionId);
        
        // Map attempts to PuttAttempt type
        const puttAttempts: PuttAttempt[] = attemptRecords.map(record => ({
          ...record,
          id: String(record.id),
          drillId: String(sessionRecord.id), // Map sessionId back to drillId for PuttAttempt
          result: record.result as 'hit' | 'miss' // Ensure result is typed correctly
        }));
        
        // Construct the DrillSession object
        const drillSession: DrillSession = {
          ...sessionRecord,
          id: String(sessionRecord.id),
          attempts: puttAttempts
        };
        
        setSession(drillSession);
        
        // Get drill type
        const drillType = getDrillType(drillSession.drillTypeId);
        if (!drillType) {
          setError(t('summary.errorDrillNotFound', 'Drill type not found'));
          setLoading(false);
          return;
        }
        
        setDrill(drillType);
        setAttempts(puttAttempts); // Set the correctly typed attempts
        
      } catch (error) {
        console.error('Error fetching session data:', error);
        setError(t('summary.errorLoading', 'Failed to load session data'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessionData();
  }, [sessionId, t]); // Add t to dependencies
  
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
      <Container maxWidth="md" sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>{t('summary.loading', 'Loading session data...')}</Typography>
      </Container>
    );
  }
  
  if (error || !session || !drill) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">{error || t('summary.errorLoading', 'Failed to load session data')}</Alert>
        <Button 
          variant="contained" 
          onClick={handleBackToDrills}
          sx={{ mt: 2 }}
        >
          {t('common.backToDrills', 'Back to Drills')}
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
          {drill.name} {t('summary.resultsTitle', 'Results')}
        </Typography>
        
        <Box sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t('summary.sessionCompleted', 'Session completed on')} {new Date(session.endTime || Date.now()).toLocaleDateString()} {t('summary.atTime', 'at')} {new Date(session.endTime || Date.now()).toLocaleTimeString()}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6" gutterBottom>
            {t('summary.overallPerformance', 'Overall Performance')}
          </Typography>
          
          <Typography variant="h2" color="primary" sx={{ my: 2 }}>
            {overallStats.percentage.toFixed(1)}%
          </Typography>
          
          <Typography variant="body1">
            {t('summary.madeOfTotal', 'Made {made} of {total} putts', { made: overallStats.made, total: overallStats.total })}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            {t('summary.performanceByDistance', 'Performance by Distance')}
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('summary.tableDistance', 'Distance')}</TableCell>
                  <TableCell align="center">{t('summary.tableAttempts', 'Attempts')}</TableCell>
                  <TableCell align="center">{t('summary.tableMade', 'Made')}</TableCell>
                  <TableCell align="center">{t('summary.tablePercentage', 'Percentage')}</TableCell>
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
            {t('summary.allAttempts', 'All Attempts')}
          </Typography>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('summary.tableRound', 'Round')}</TableCell>
                  <TableCell>{t('summary.tableDistance', 'Distance')}</TableCell>
                  <TableCell>{t('summary.tableStance', 'Stance')}</TableCell>
                  <TableCell align="center">{t('summary.tableResult', 'Result')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attempts.sort((a, b) => a.round - b.round).map((attempt) => (
                  <TableRow key={attempt.id}>
                    <TableCell>{attempt.round}</TableCell>
                    <TableCell>
                      <DistanceDisplay meters={attempt.distance} showIcon={false} variant="body2" />
                    </TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{t(`stances.${attempt.stance}`, attempt.stance)}</TableCell>
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
            {t('common.backToDrills', 'Back to Drills')}
          </Button>
          
          <Button 
            variant="contained" 
            onClick={() => navigate('/drills')}
          >
            {t('summary.newSessionButton', 'New Practice Session')}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default DrillSummary; 