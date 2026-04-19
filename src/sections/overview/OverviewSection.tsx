import { useQuery } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { fetchDashboardOverview } from '../../api/dashboard';
import StatCard from '../../components/cards/StatCard';

function formatCount(value: number | undefined) {
  if (value == null) {
    return '';
  }

  return new Intl.NumberFormat('fr-FR').format(value);
}

export default function OverviewSection() {
  const { data, isLoading, isError } = useQuery({
    queryFn: fetchDashboardOverview,
    queryKey: ['dashboardOverview'],
  });

  return (
    <Stack component="section" id="overview" spacing={2} sx={{ scrollMarginTop: 144 }}>
      <Stack spacing={0.5}>
        <Typography component="h2" variant="h5">
          Overview
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Premiere carte de synthese, alignee sur l'endpoint documente
          `/api/dashboard/overview`.
        </Typography>
      </Stack>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Total des attaques"
            value={isError ? 'Indisponible' : formatCount(data?.total_attacks)}
            interval="Volume global"
            isLoading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Alertes IP communes"
            value={isError ? 'Indisponible' : formatCount(data?.total_common_ip_alerts)}
            interval="Correlation common IP"
            isLoading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Sources actives"
            value={isError ? 'Indisponible' : formatCount(data?.total_active_sources)}
            interval="Sources actuellement actives"
            isLoading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Sources inactives"
            value={isError ? 'Indisponible' : formatCount(data?.total_inactive_sources)}
            interval="Sources actuellement inactives"
            isLoading={isLoading}
          />
        </Grid>
      </Grid>
      {isError ? (
        <Alert severity="warning">
          L'overview n'a pas pu etre chargee. La structure frontend reste en place pour
          la suite.
        </Alert>
      ) : null}
    </Stack>
  );
}
