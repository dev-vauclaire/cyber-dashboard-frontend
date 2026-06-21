import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type SourceOptionLabelProps = {
  color: string;
  label: string;
  noWrap?: boolean;
};

export default function SourceOptionLabel({
  color,
  label,
  noWrap = true,
}: SourceOptionLabelProps) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: '999px',
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      <Typography variant="body2" noWrap={noWrap} title={label}>
        {label}
      </Typography>
    </Stack>
  );
}
