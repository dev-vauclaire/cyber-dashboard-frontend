import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { formatValue, getFieldLabel } from './helpers';
import type { CtiFieldEntry } from './types';

function CtiFieldRow({ fieldKey, value }: { fieldKey: string; value: unknown }) {
  const formattedValue = formatValue(value);
  const isLink =
    typeof value === 'string' &&
    (fieldKey === 'link' || value.startsWith('http://') || value.startsWith('https://'));

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'minmax(132px, 0.42fr) minmax(0, 1fr)' },
        gap: { xs: 0.25, sm: 1.5 },
        alignItems: 'baseline',
        py: 0.75,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-of-type': {
          borderBottom: 0,
        },
      }}
    >
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {getFieldLabel(fieldKey)}
      </Typography>
      {isLink ? (
        <Link
          href={formattedValue}
          target="_blank"
          rel="noreferrer"
          underline="hover"
          variant="body2"
          sx={{ minWidth: 0, overflowWrap: 'anywhere' }}
        >
          {formattedValue}
        </Link>
      ) : (
        <Typography
          variant="body2"
          sx={{
            color: formattedValue === 'Non disponible' ? 'text.secondary' : 'text.primary',
            minWidth: 0,
            overflowWrap: 'anywhere',
          }}
        >
          {formattedValue}
        </Typography>
      )}
    </Box>
  );
}

export default function CtiFieldList({ entries }: { entries: CtiFieldEntry[] }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      {entries.map(([key, value]) => (
        <CtiFieldRow key={key} fieldKey={key} value={value} />
      ))}
    </Box>
  );
}
