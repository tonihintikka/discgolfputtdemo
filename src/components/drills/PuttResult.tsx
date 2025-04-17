import React from 'react';
import { Box, Button, Stack } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { useLanguage } from '../../context/LanguageContext';

interface PuttResultProps {
  onResult: (result: 'hit' | 'miss') => void;
  disabled?: boolean;
}

const PuttResult: React.FC<PuttResultProps> = ({
  onResult,
  disabled = false
}) => {
  const { t } = useLanguage();
  
  return (
    <Stack
      direction="row"
      spacing={2}
      justifyContent="center"
      sx={{ my: 2 }}
    >
      <Button
        variant="contained"
        color="success"
        size="large"
        disabled={disabled}
        onClick={() => onResult('hit')}
        startIcon={<CheckCircleOutlineIcon />}
        sx={{
          px: 4,
          py: 1.5,
          borderRadius: 2,
          fontSize: '1.1rem',
          fontWeight: 'bold'
        }}
      >
        {t('common.madeIt', 'Made It')}
      </Button>
      
      <Button
        variant="contained"
        color="error"
        size="large"
        disabled={disabled}
        onClick={() => onResult('miss')}
        startIcon={<HighlightOffIcon />}
        sx={{
          px: 4,
          py: 1.5,
          borderRadius: 2,
          fontSize: '1.1rem',
          fontWeight: 'bold'
        }}
      >
        {t('common.missed', 'Missed')}
      </Button>
    </Stack>
  );
};

export default PuttResult; 