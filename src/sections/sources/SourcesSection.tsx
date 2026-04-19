import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { DashboardPageControls } from '../../types/dashboard';

type SourcesSectionProps = {
  dashboardControls: DashboardPageControls;
};

export default function SourcesSection({ dashboardControls }: SourcesSectionProps) {
  return (
    <Stack
      component="section"
      id="sources"
      spacing={2}
      data-refresh-token={dashboardControls.refreshToken}
      sx={{ scrollMarginTop: 144 }}
    >
      <Stack spacing={0.5}>
        <Typography component="h2" variant="h5">
          Sources
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Emplacement prepare pour l'inventaire, le renommage et
          l'activation/desactivation.
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Le refresh global du header sera egalement reutilise ici.
        </Typography>
      </Stack>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography component="h3" variant="subtitle2" gutterBottom>
                Inventaire par type de capteur
              </Typography>
              <Stack spacing={1.5}>
                <Skeleton variant="rounded" height={52} />
                <Skeleton variant="rounded" height={52} />
                <Skeleton variant="rounded" height={52} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography component="h3" variant="subtitle2" gutterBottom>
                Actions sur les sources
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Cette colonne accueillera la liste active/inactive, le renommage inline et
                le toggle d'activation.
              </Typography>
              <Stack spacing={1.5}>
                <Skeleton variant="rounded" height={64} />
                <Skeleton variant="rounded" height={64} />
                <Skeleton variant="rounded" height={64} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
