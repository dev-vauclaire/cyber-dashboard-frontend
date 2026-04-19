import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { LineChart } from '@mui/x-charts/LineChart';
import { getSourceColor } from '../../utils/sourceColors';

const timelineLabels = ['13 Apr', '14 Apr', '15 Apr', '16 Apr', '17 Apr', '18 Apr', '19 Apr'];

const sourceSeries = [
  {
    sourceId: 2,
    sourceName: 'LURIO CHV SI',
    data: [28, 35, 31, 42, 38, 45, 54],
  },
  {
    sourceId: 3,
    sourceName: 'LURIO CHV 4G',
    data: [18, 16, 22, 19, 24, 28, 26],
  },
  {
    sourceId: 10,
    sourceName: 'DETOXIO Scanner',
    data: [9, 12, 14, 11, 16, 19, 23],
  },
];

export default function LinearChart() {
  const totalPreview = sourceSeries.reduce(
    (total, source) => total + source.data[source.data.length - 1],
    0,
  );

  return (
    <Card variant="outlined" sx={{ width: '100%', height: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Evolution des attaques
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
            <Typography variant="h4" component="p">
              {totalPreview}
            </Typography>
            <Chip size="small" color="info" label="Demo" />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Apercu du composant timeline. Les series utiliseront la meme couleur par
            source dans toute la V1.
          </Typography>
        </Stack>
        <LineChart
          colors={sourceSeries.map((source) =>
            getSourceColor({
              sourceId: source.sourceId,
              sourceName: source.sourceName,
            }),
          )}
          xAxis={[
            {
              scaleType: 'point',
              data: timelineLabels,
              height: 24,
            },
          ]}
          yAxis={[{ width: 50 }]}
          series={sourceSeries.map((source) => ({
            id: source.sourceName,
            label: source.sourceName,
            data: source.data,
            showMark: false,
            curve: 'linear',
          }))}
          height={280}
          margin={{ left: 0, right: 20, top: 20, bottom: 0 }}
          grid={{ horizontal: true }}
        />
      </CardContent>
    </Card>
  );
}
