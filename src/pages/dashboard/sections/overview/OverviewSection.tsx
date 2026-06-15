import { useQuery } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { fetchDashboardOverview } from '../../../../api/dashboard';
import StatCard from '../../../../components/cards/StatCard';
import type { DashboardOverview } from '../../../../types/dashboard';

function formatCount(value: number | undefined) {
  if (value == null) {
    return '--';
  }

  return new Intl.NumberFormat('fr-FR').format(value);
}

function hasDashboardOverviewData(
  data: DashboardOverview | undefined,
): data is DashboardOverview {
  return data != null;
}

const overviewCardDefinitions = [
  {
    key: 'total_attacks',
    title: 'Total des attaques',
    interval: 'Toutes sources confondues',
  },
  {
    key: 'total_common_ip_alerts',
    title: 'Alertes d\'IP communes',
    interval: 'Nombre d\'alertes d\'IP communes a au moins 2 sources',
  },
  {
    key: 'total_active_sources',
    title: 'Sources actives',
    interval: 'Sources actuellement actives',
  },
  {
    key: 'total_inactive_sources',
    title: 'Sources inactives',
    interval: 'Sources actuellement inactives',
  },
] as const;

export default function OverviewSection() {
  const { data, isLoading, isError, isSuccess } = useQuery({
    queryFn: fetchDashboardOverview,
    queryKey: ['dashboardOverview'],
  });
  const isEmpty = isSuccess && !hasDashboardOverviewData(data);

  return (
    <Stack component="section" id="overview" spacing={2} sx={{ scrollMarginTop: 144 }}>
      <Stack spacing={0.5}>
        <Typography component="h2" variant="h5">
          Aperçu global
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Vue synthétique fournie directement par le backend.
        </Typography>
      </Stack>
      <Grid container spacing={2} columns={12}>
        {overviewCardDefinitions.map((card) => (
          <Grid key={card.key} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              title={card.title}
              value={
                isError || isEmpty
                  ? '--'
                  : formatCount(data?.[card.key])
              }
              interval={card.interval}
              isLoading={isLoading}
            />
          </Grid>
        ))}
      </Grid>
      {isError ? (
        <Alert severity="warning">
          Impossible de charger les KPI d&apos;overview pour le moment.
        </Alert>
      ) : null}
      {isEmpty ? (
        <Alert severity="info">
          Aucun indicateur d&apos;overview n&apos;a ete retourne par l&apos;API.
        </Alert>
      ) : null}
    </Stack>
  );
}
