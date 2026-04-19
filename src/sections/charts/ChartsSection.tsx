import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearChart from '../../components/charts/LinearChart';
import ProtocoleBySource from '../../components/charts/ProtocoleBySource';

export default function ChartsSection() {
  return (
    <Stack component="section" id="charts" spacing={2} sx={{ scrollMarginTop: 144 }}>
      <Stack spacing={0.5}>
        <Typography component="h2" variant="h5">
          Charts
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Zone reservee a l'evolution temporelle et a la repartition par source.
        </Typography>
      </Stack>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <LinearChart />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <ProtocoleBySource />
        </Grid>
      </Grid>
    </Stack>
  );
}
