import Chip from '@mui/material/Chip';

type ValidationStatusChipProps = {
  status: string | null;
};

export default function ValidationStatusChip({ status }: ValidationStatusChipProps) {
  const color = status === 'success' ? 'success' : status === 'failed' ? 'error' : 'warning';

  return (
    <Chip
      size="small"
      color={color}
      variant="outlined"
      label={status ?? 'not_tested'}
    />
  );
}
