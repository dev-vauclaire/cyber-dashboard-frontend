import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSourceColorContext } from '../../internals/source-colors/SourceColorContext';
import { getSourceColor } from '../../utils/sourceColors';

export type SourceLegendItem = {
  sourceId: number;
  sourceName: string;
  sourceColor?: string | null;
  meta?: string;
  isHidden?: boolean;
};

type SourceLegendProps = {
  items: SourceLegendItem[];
  onToggleItem?: (sourceId: number) => void;
};

export default function SourceLegend({ items, onToggleItem }: SourceLegendProps) {
  const { sourceColorRegistry } = useSourceColorContext();

  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1.5, pt: 2 }}>
      {items.map((item) => {
        const color = getSourceColor({
          sourceId: item.sourceId,
          sourceName: item.sourceName,
          sourceColor: item.sourceColor,
          sourceColorRegistry,
        });

        return (
          <ButtonBase
            key={item.sourceId}
            component="button"
            onClick={() => onToggleItem?.(item.sourceId)}
            disabled={onToggleItem == null}
            sx={{
              alignItems: 'center',
              borderRadius: 1,
              display: 'inline-flex',
              gap: 1,
              opacity: item.isHidden ? 0.45 : 1,
              p: 0.5,
              textAlign: 'left',
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '999px',
                backgroundColor: item.isHidden ? 'text.disabled' : color,
                flexShrink: 0,
              }}
            />
            <Stack spacing={0}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  lineHeight: 1.2,
                  textDecoration: item.isHidden ? 'line-through' : 'none',
                }}
              >
                {item.sourceName}
              </Typography>
              {item.meta ? (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {item.meta}
                </Typography>
              ) : null}
            </Stack>
          </ButtonBase>
        );
      })}
    </Stack>
  );
}
