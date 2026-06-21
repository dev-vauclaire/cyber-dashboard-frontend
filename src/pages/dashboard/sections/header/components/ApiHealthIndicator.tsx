import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { fetchApiHealth } from '../api/healthApi';
import { headerQueryKeys } from '../queryKeys';

const HEALTH_REFRESH_INTERVAL_MS = 30_000;

type HealthIndicatorState = {
  color: 'error.main' | 'success.main';
  label: string;
  tooltip: string;
};

export default function ApiHealthIndicator() {
  const healthQuery = useQuery({
    queryFn: ({ signal }) => fetchApiHealth(signal),
    queryKey: headerQueryKeys.apiHealth,
    refetchInterval: HEALTH_REFRESH_INTERVAL_MS,
    retry: false,
    staleTime: HEALTH_REFRESH_INTERVAL_MS / 2,
  });
  const isHealthy = healthQuery.isSuccess && healthQuery.data.status.toLowerCase() === 'ok';
  const state: HealthIndicatorState = isHealthy
    ? {
        color: 'success.main',
        label: 'API disponible',
        tooltip: 'Le service API répond correctement.',
      }
    : {
        color: 'error.main',
        label: 'API indisponible',
        tooltip: healthQuery.isError
          ? 'Le service API ne répond pas. Une nouvelle vérification sera effectuée automatiquement.'
          : 'Le service API a retourné un état inattendu.',
      };

  if (healthQuery.isPending) {
    return (
      <Tooltip title="Vérification de la disponibilité de l'API.">
        <Stack
          component="span"
          direction="row"
          role="status"
          aria-live="polite"
          sx={{ alignItems: 'center', gap: 0.75, minHeight: 32 }}
        >
          <CircularProgress size={10} thickness={6} />
          <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
            Vérification API
          </Typography>
        </Stack>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={state.tooltip}>
      <Stack
        component="span"
        direction="row"
        role="status"
        aria-live="polite"
        sx={{ alignItems: 'center', gap: 0.75, minHeight: 32 }}
      >
        <Box
          aria-hidden
          sx={{
            bgcolor: state.color,
            borderRadius: '50%',
            boxShadow: (theme) => `0 0 0 3px ${theme.palette[state.color.split('.')[0] as 'error' | 'success'].main}22`,
            flexShrink: 0,
            height: 8,
            width: 8,
          }}
        />
        <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
          {state.label}
        </Typography>
      </Stack>
    </Tooltip>
  );
}
