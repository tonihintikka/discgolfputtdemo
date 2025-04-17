import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, Typography, Box, List, 
  ListItem, ListItemText, Button, CircularProgress,
  Divider, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionStorage } from '../../services/storage/storageService';
import { getDrillById, startDrillSession } from '../../services/drillService';
import { formatDate } from '../../utils/formatters';
import { useLanguage } from '../../context/LanguageContext';
import DifficultyLevel from './DifficultyLevel';
import { DrillType, DrillSession } from '../../types/drills';

// Extended DrillType that includes DrillRound[] instead of number for rounds
interface DrillWithRounds extends Omit<DrillType, 'rounds'> {
  rounds: Array<{
    round: number;
    distance: number;
    stance?: string;
    instructions?: string;
  }>;
}

const DrillInstructions: React.FC = () => {
  const { drillId } = useParams<{ drillId: string }>();
  const [drill, setDrill] = useState<DrillWithRounds | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSessions, setActiveSessions] = useState<DrillSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!drillId) {
          setError('No drill ID provided');
          setLoading(false);
          return;
        }

        const drillData = await getDrillById(drillId);
        if (!drillData) {
          setError(`Drill with ID ${drillId} not found`);
          setLoading(false);
          return;
        }

        setDrill(drillData);
        
        // Get any active sessions for this drill
        const sessions = await sessionStorage.getStartedDrillSessions();
        setActiveSessions(sessions.filter(s => s.drillTypeId === drillId));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching drill:', err);
        setError('Failed to load drill data');
        setLoading(false);
      }
    };

    fetchData();
  }, [drillId]);

  const handleStartDrill = async () => {
    if (!drill) return;
    
    try {
      const sessionId = await startDrillSession(drill.id);
      navigate(`/drills/active/${sessionId}`);
    } catch (err) {
      console.error('Error starting drill:', err);
      setError('Failed to start drill session');
    }
  };

  const handleContinueDrill = (sessionId: string) => {
    navigate(`/drills/active/${sessionId}`);
  };

  const handleCancelActiveDrill = async (sessionId: string) => {
    try {
      await sessionStorage.stopCurrentSession(sessionId);
      const sessions = await sessionStorage.getStartedDrillSessions();
      setActiveSessions(sessions.filter(s => s.drillTypeId === drillId));
    } catch (err) {
      console.error('Error cancelling drill:', err);
      setError('Failed to cancel drill session');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !drill) {
    return (
      <Box p={2}>
        <Typography color="error">{error || 'Drill not found'}</Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/drills')}
          sx={{ mt: 2 }}
        >
          {t('common.backToDrills', 'Back to Drills')}
        </Button>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Card variant="outlined">
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" component="h1" gutterBottom>
              {drill.name}
            </Typography>
            <DifficultyLevel level={drill.difficulty} />
          </Box>
          
          <Typography variant="h6" gutterBottom>
            {t('pages.drills.description', 'Description')}
          </Typography>
          <Typography paragraph>
            {drill.description}
          </Typography>
          
          {drill.rounds && drill.rounds.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                {t('pages.drills.rounds', 'Rounds')}
              </Typography>
              <List dense>
                {drill.rounds.map((round, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${t('pages.drills.round', 'Round')} ${index + 1}`}
                      secondary={`${round.distance}m ${round.stance ? `- ${t(`stances.${round.stance}`, round.stance)}` : ''}`}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
          
          <Typography variant="h6" gutterBottom mt={2}>
            {t('pages.drills.instructions', 'Instructions')}
          </Typography>
          {drill.instructions && (
            <List>
              {typeof drill.instructions === 'string' ? (
                <ListItem alignItems="flex-start">
                  <ListItemText primary={drill.instructions} />
                </ListItem>
              ) : Array.isArray(drill.instructions) ? (
                drill.instructions.map((instruction: string, index: number) => (
                  <ListItem key={index} alignItems="flex-start">
                    <ListItemText
                      primary={`${index + 1}. ${instruction}`}
                    />
                  </ListItem>
                ))
              ) : null}
            </List>
          )}
          
          {activeSessions.length > 0 && (
            <Box mt={3}>
              <Divider sx={{ mb: 2 }} />
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>
                    {t('pages.drills.activeSessions', 'Active Sessions')} ({activeSessions.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {activeSessions.map((session) => (
                      <ListItem key={session.id}>
                        <ListItemText
                          primary={formatDate(new Date(session.startTime))}
                          secondary={`${t('pages.drills.progress', 'Progress')}: ${session.attempts.length || 0} ${t('common.putts', 'putts')}`}
                        />
                        <Box>
                          <Button 
                            size="small" 
                            onClick={() => handleContinueDrill(session.id)}
                            sx={{ mr: 1 }}
                          >
                            {t('common.continue', 'Continue')}
                          </Button>
                          <Button 
                            size="small" 
                            color="error" 
                            onClick={() => handleCancelActiveDrill(session.id)}
                          >
                            {t('common.cancel', 'Cancel')}
                          </Button>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
          
          <Box mt={3} display="flex" justifyContent="space-between">
            <Button 
              variant="outlined" 
              onClick={() => navigate('/drills')}
            >
              {t('common.back', 'Back')}
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleStartDrill}
            >
              {t('pages.drills.startDrill', 'Start Drill')}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DrillInstructions; 