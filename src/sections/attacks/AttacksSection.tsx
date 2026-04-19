import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CustomizedDataGrid from '../../components/data-display/CustomizedDataGrid';
import type { DashboardPageControls } from '../../types/dashboard';
import { formatDashboardGlobalDateRange } from '../../utils/dashboardFilters';

type AttacksSectionProps = {
  dashboardControls: DashboardPageControls;
};

export default function AttacksSection({ dashboardControls }: AttacksSectionProps) {
  return (
    <Stack
      component="section"
      id="attacks"
      spacing={2}
      data-refresh-token={dashboardControls.refreshToken}
      sx={{ scrollMarginTop: 144 }}
    >
      <Stack spacing={0.5}>
        <Typography component="h2" variant="h5">
          Table des attaques
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Base paginee et filtrable prete a etre branchee sur l'endpoint
          `/api/attacks/`.
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          La future requete de table sera pilotee par :{' '}
          {formatDashboardGlobalDateRange(dashboardControls.globalDateRange)}
        </Typography>
      </Stack>
      <Card variant="outlined">
        <CardContent sx={{ px: { xs: 1, md: 2 }, py: 2 }}>
          <CustomizedDataGrid />
        </CardContent>
      </Card>
    </Stack>
  );
}
