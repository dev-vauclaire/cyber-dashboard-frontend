import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function AlertsSection() {
  return (
    <Stack component="section" id="alerts" spacing={2} sx={{ scrollMarginTop: 144 }}>
      <Stack spacing={0.5}>
        <Typography component="h2" variant="h5">
          Alertes IP communes
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Structure reservee a la liste des IP partagees et a leur detail inline.
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Cette section sera reprise ensuite avec ses propres filtres locaux.
        </Typography>
      </Stack>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography component="h3" variant="subtitle2" gutterBottom>
                Liste des alertes
              </Typography>
              <Stack spacing={1.5}>
                <Skeleton variant="rounded" height={58} />
                <Skeleton variant="rounded" height={58} />
                <Skeleton variant="rounded" height={58} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography component="h3" variant="subtitle2" gutterBottom>
                Detail d'une alerte
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Cette zone accueillera le detail d'une IP selectionnee sans quitter la
                page.
              </Typography>
              <Stack spacing={1.5}>
                <Skeleton variant="text" width="45%" />
                <Skeleton variant="rounded" height={88} />
                <Skeleton variant="rounded" height={88} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
