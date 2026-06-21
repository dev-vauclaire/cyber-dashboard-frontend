import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PieChart } from '@mui/x-charts/PieChart';
import type { ChartItem } from './types';

export default function CtiProviderPieChart({
  colors,
  items,
  title,
  titleHref,
}: {
  colors: string[];
  items: ChartItem[];
  title: string;
  titleHref?: string;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Stack spacing={1} sx={{ minWidth: 0 }}>
      {titleHref ? (
        <Link
          href={titleHref}
          target="_blank"
          rel="noreferrer"
          underline="hover"
          variant="caption"
          sx={{ alignSelf: 'flex-start', color: 'text.secondary' }}
        >
          {title}
        </Link>
      ) : (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {title}
        </Typography>
      )}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'background.default',
          minHeight: 220,
        }}
      >
        <PieChart
          colors={colors}
          height={220}
          width={260}
          margin={{ left: 18, right: 18, top: 18, bottom: 18 }}
          series={[
            {
              data: items,
              innerRadius: 48,
              outerRadius: 82,
              paddingAngle: 1,
              highlightScope: { fade: 'global', highlight: 'item' },
            },
          ]}
        />
      </Box>
    </Stack>
  );
}
