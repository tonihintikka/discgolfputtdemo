import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  Stack,
  Chip
} from '@mui/material';
import { StanceType } from '../../types/drills';

interface StanceSelectorProps {
  value: StanceType;
  onChange: (stance: StanceType) => void;
  variant?: 'standard' | 'filled' | 'outlined';
  disabled?: boolean;
  size?: 'small' | 'medium';
  chipMode?: boolean;
}

const stanceOptions: { value: StanceType; label: string; }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'straddle', label: 'Straddle' },
  { value: 'knee', label: 'Knee' },
  { value: 'forehand', label: 'Forehand' },
  { value: 'turbo', label: 'Turbo' },
  { value: 'throw-in', label: 'Throw-in' }
];

const StanceSelector: React.FC<StanceSelectorProps> = ({
  value,
  onChange,
  variant = 'outlined',
  disabled = false,
  size = 'medium',
  chipMode = false
}) => {
  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value as StanceType);
  };

  if (chipMode) {
    return (
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {stanceOptions.map(option => (
          <Chip
            key={option.value}
            label={option.label}
            onClick={() => onChange(option.value)}
            variant={value === option.value ? 'filled' : 'outlined'}
            color={value === option.value ? 'primary' : 'default'}
            disabled={disabled}
            sx={{ 
              fontWeight: value === option.value ? 'bold' : 'normal',
              minWidth: '80px'
            }}
          />
        ))}
      </Stack>
    );
  }

  return (
    <FormControl fullWidth variant={variant} disabled={disabled} size={size}>
      <InputLabel id="stance-selector-label">Stance</InputLabel>
      <Select
        labelId="stance-selector-label"
        value={value}
        label="Stance"
        onChange={handleChange}
      >
        {stanceOptions.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default StanceSelector; 