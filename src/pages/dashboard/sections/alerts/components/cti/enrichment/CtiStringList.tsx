import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type CtiStringListProps = {
  color?: 'default' | 'error' | 'primary';
  emptyLabel: string;
  items: string[];
  title: string;
};

export default function CtiStringList({
  color = 'default',
  emptyLabel,
  items,
  title,
}: CtiStringListProps) {
  return (
    <Stack spacing={1} sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {title} ({items.length})
      </Typography>
      {items.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {emptyLabel}
        </Typography>
      ) : (
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
          {items.map((item) => (
            <Chip
              key={item}
              color={color}
              label={item}
              size="small"
              variant="outlined"
              sx={{
                height: 'auto',
                maxWidth: '100%',
                '& .MuiChip-label': {
                  overflowWrap: 'anywhere',
                  py: 0.5,
                  whiteSpace: 'normal',
                },
              }}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
