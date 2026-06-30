import { PieChart } from '@mui/x-charts/PieChart';
import { alpha } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PieCenterLabel from './PieCenterLabel';
import {
  formatAttackTypeLabel,
  formatCount,
  formatPercentage,
} from '../utils/formatters';

const ATTACK_TYPE_COLORS = [
  '#1976D2',
  '#9C27B0',
  '#2E7D32',
  '#ED6C02',
  '#D32F2F',
  '#00838F',
  '#6D4C41',
  '#5E35B1',
  '#C2185B',
  '#455A64',
] as const;

export type AttackTypeDistributionItem = {
  attackType: string;
  attackCount: number;
  percentage: number;
};

type AttackTypeDistributionChartProps = {
  totalAttacks: number;
  items: AttackTypeDistributionItem[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
};

function getAttackTypeColor(attackType: string): string {
  const hash = Array.from(attackType).reduce(
    (currentHash, character) => (currentHash * 31 + character.charCodeAt(0)) >>> 0,
    0,
  );

  return ATTACK_TYPE_COLORS[hash % ATTACK_TYPE_COLORS.length];
}

export default function AttackTypeDistributionChart({
  totalAttacks,
  items,
  isLoading,
  isError,
  isEmpty,
}: AttackTypeDistributionChartProps) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2">
          Répartition des attaques par type
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Nombre et poids de chaque type sur la période sélectionnée.
        </Typography>
        {isLoading ? (
          <Stack spacing={2} sx={{ pt: 2 }}>
            <Skeleton variant="circular" width={220} height={220} sx={{ mx: 'auto' }} />
            <Skeleton variant="text" width="75%" />
            <Skeleton variant="text" width="60%" />
          </Stack>
        ) : null}
        {isError ? (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Impossible de charger la répartition des attaques par type.
          </Alert>
        ) : null}
        {isEmpty ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Aucun type d&apos;attaque n&apos;a été trouvé sur la période sélectionnée.
          </Alert>
        ) : null}
        {!isLoading && !isError && !isEmpty ? (
          <Stack>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
              <PieChart
                colors={items.map((item) => getAttackTypeColor(item.attackType))}
                margin={{ left: 80, right: 80, top: 80, bottom: 80 }}
                series={[
                  {
                    data: items.map((item) => ({
                      id: item.attackType,
                      label: formatAttackTypeLabel(item.attackType),
                      value: item.attackCount,
                    })),
                    highlightScope: { fade: 'global', highlight: 'item' },
                    innerRadius: 75,
                    outerRadius: 100,
                    paddingAngle: 0,
                  },
                ]}
                height={260}
                width={260}
                hideLegend
              >
                <PieCenterLabel primaryText={formatCount(totalAttacks)} secondaryText="Total" />
              </PieChart>
            </Box>
            {items.map((item) => {
              const color = getAttackTypeColor(item.attackType);

              return (
                <Stack key={item.attackType} direction="row" sx={{ gap: 2, pb: 2 }}>
                  <Stack sx={{ flexGrow: 1, gap: 1, minWidth: 0 }}>
                    <Stack
                      direction="row"
                      sx={{ alignItems: 'center', gap: 2, justifyContent: 'space-between' }}
                    >
                      <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                        {formatAttackTypeLabel(item.attackType)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', flexShrink: 0 }}
                      >
                        {formatCount(item.attackCount)} ({formatPercentage(item.percentage)} %)
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      aria-label={`Poids du type ${formatAttackTypeLabel(item.attackType)}`}
                      value={item.percentage}
                      sx={{
                        backgroundColor: alpha(color, 0.16),
                        [`& .${linearProgressClasses.bar}`]: { backgroundColor: color },
                      }}
                    />
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        ) : null}
      </CardContent>
    </Card>
  );
}
