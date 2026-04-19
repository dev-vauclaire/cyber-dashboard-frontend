import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';

export type StatCardProps = {
  title: string;
  value: string;
  interval?: string;
  isLoading: boolean;
  color?: string;
};

export default function StatCard({
  title,
  value,
  interval,
  isLoading,
  color,
}: StatCardProps) {
  return (
    <Card variant="outlined" sx={{ height: '100%', flexGrow: 1 }}>
      <CardContent>
        {/* Title */}
        <Typography component="h2" variant="subtitle2" gutterBottom>
          {title}
        </Typography>
        <Stack
          direction="column"
          sx={{ justifyContent: 'space-between', flexGrow: '1', gap: 1 }}
        >
          <Stack sx={{ justifyContent: 'space-between' }}>
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center' }}
            >
              {/* Value */}
              { isLoading ? (
                <Skeleton variant="text" width={40} height={80} />
              ) : (
                <Typography variant="h4" component="p" sx={{ color: color }}>
                  {value}
                </Typography>
              )}
            </Stack>
            {/* Interval */}
            { isLoading ? (
              <Skeleton variant="text" width={100} height={15} />
            ) : (
              interval && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {interval}
                </Typography>
              )
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
