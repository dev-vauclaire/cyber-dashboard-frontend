import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSourceColorContext } from '../../internals/source-colors/SourceColorContext';
import { getSourceColor } from '../../utils/sourceColors';

export type SourceLegendItem = {
  sourceId: number;
  sourceName: string;
  sourceColor?: string | null;
  meta?: string;
};

type SourceLegendProps = {
  items: SourceLegendItem[];
};

export default function SourceLegend({ items }: SourceLegendProps) {
  const { sourceColorRegistry } = useSourceColorContext();

  return (
    <Stack
      direction="row"
      sx={{ flexWrap: 'wrap', gap: 1.5, pt: 2 }}
    >
      {items.map((item) => {
        const color = getSourceColor({
          sourceId: item.sourceId,
          sourceName: item.sourceName,
          sourceColor: item.sourceColor,
          sourceColorRegistry,
        });

        return (
          <Stack
            key={item.sourceId}
            direction="row"
            sx={{ alignItems: 'center', gap: 1 }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '999px',
                backgroundColor: color,
                flexShrink: 0,
              }}
            />
            <Stack spacing={0}>
              <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                {item.sourceName}
              </Typography>
              {item.meta ? (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {item.meta}
                </Typography>
              ) : null}
            </Stack>
          </Stack>
        );
      })}
    </Stack>
  );
}
