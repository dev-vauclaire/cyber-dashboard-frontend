import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { LineChart } from '@mui/x-charts/LineChart';
import SourceLegend, { type SourceLegendItem } from './SourceLegend';
import { useSourceColorContext } from '../../../../../shared/sources/providers/sourceColorContext';
import { getSourceColor } from '../../../../../shared/sources/utils/sourceColors';
import { formatCount } from '../utils/formatters';

type LinearChartSeries = {
  sourceId: number;
  sourceName: string;
  attackCount: number;
  sourceColor?: string | null;
  data: number[];
};

type LinearChartProps = {
  totalAttacks: number;
  labels: string[];
  series: LinearChartSeries[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  hiddenSourceIds?: ReadonlySet<number>;
  onToggleSource?: (sourceId: number) => void;
};

function buildLegendItems(
  series: LinearChartSeries[],
  hiddenSourceIds: ReadonlySet<number>,
): SourceLegendItem[] {
  return series.map((item) => ({
    sourceId: item.sourceId,
    sourceName: item.sourceName,
    sourceColor: item.sourceColor,
    isHidden: hiddenSourceIds.has(item.sourceId),
    meta: `${formatCount(item.attackCount)} attaques`,
  }));
}

export default function LinearChart({
  totalAttacks,
  labels,
  series,
  isLoading,
  isError,
  isEmpty,
  hiddenSourceIds = new Set<number>(),
  onToggleSource,
}: LinearChartProps) {
  const { sourceColorRegistry } = useSourceColorContext();
  const visibleSeries = series.filter((item) => !hiddenSourceIds.has(item.sourceId));

  return (
    <Card variant="outlined" sx={{ width: '100%', height: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Évolution des attaques dans le temps
        </Typography>
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: 'center', sm: 'flex-start' },
              alignItems: 'center',
              gap: 1,
            }}
          >
            {isLoading ? (
              <Skeleton variant="text" width={90} height={48} />
            ) : (
              <Typography variant="h4" component="p">
                {formatCount(totalAttacks)}
              </Typography>
            )}
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Une courbe par source, agrégée par jour sur la période sélectionnée.
          </Typography>
        </Stack>
        {isLoading ? (
          <Stack spacing={2} sx={{ pt: 2 }}>
            <Skeleton variant="rounded" height={280} />
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="55%" />
          </Stack>
        ) : null}
        {isError ? (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Impossible de charger l&apos;évolution des attaques pour cette période.
          </Alert>
        ) : null}
        {isEmpty ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Aucune attaque n&apos;a été trouvée sur la période sélectionnée.
          </Alert>
        ) : null}
        {!isLoading && !isError && !isEmpty ? (
          <Stack>
            <LineChart
              colors={visibleSeries.map((item) =>
                getSourceColor({
                  sourceId: item.sourceId,
                  sourceName: item.sourceName,
                  sourceColor: item.sourceColor,
                  sourceColorRegistry,
                }),
              )}
              xAxis={[
                {
                  scaleType: 'point',
                  data: labels,
                  height: 24,
                },
              ]}
              yAxis={[{ width: 50 }]}
              series={visibleSeries.map((item) => ({
                id: item.sourceName,
                label: item.sourceName,
                data: item.data,
                showMark: false,
                curve: 'linear',
              }))}
              height={280}
              margin={{ left: 0, right: 20, top: 20, bottom: 0 }}
              grid={{ horizontal: true }}
              hideLegend
            />
            <SourceLegend
              items={buildLegendItems(series, hiddenSourceIds)}
              onToggleItem={onToggleSource}
            />
          </Stack>
        ) : null}
      </CardContent>
    </Card>
  );
}
