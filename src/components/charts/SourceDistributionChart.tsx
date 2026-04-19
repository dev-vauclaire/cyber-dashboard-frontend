import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { alpha, styled } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSourceColorContext } from '../../internals/source-colors/SourceColorContext';
import { getSourceColor } from '../../utils/sourceColors';

export type SourceDistributionItem = {
  sourceId: number;
  sourceName: string;
  attackCount: number;
  percentage: number;
  sourceColor?: string | null;
};

type SourceDistributionChartProps = {
  totalAttacks: number;
  items: SourceDistributionItem[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
};

interface StyledTextProps {
  variant: 'primary' | 'secondary';
}

const StyledText = styled('text', {
  shouldForwardProp: (prop) => prop !== 'variant',
})<StyledTextProps>(({ theme }) => ({
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fill: (theme.vars || theme).palette.text.secondary,
  variants: [
    {
      props: {
        variant: 'primary',
      },
      style: {
        fontSize: theme.typography.h5.fontSize,
        fontWeight: theme.typography.h5.fontWeight,
      },
    },
    {
      props: {
        variant: 'secondary',
      },
      style: {
        fontSize: theme.typography.body2.fontSize,
        fontWeight: theme.typography.body2.fontWeight,
      },
    },
  ],
}));

interface PieCenterLabelProps {
  primaryText: string;
  secondaryText: string;
}

function PieCenterLabel({ primaryText, secondaryText }: PieCenterLabelProps) {
  const { width, height, left, top } = useDrawingArea();
  const primaryY = top + height / 2 - 10;
  const secondaryY = primaryY + 24;

  return (
    <React.Fragment>
      <StyledText variant="primary" x={left + width / 2} y={primaryY}>
        {primaryText}
      </StyledText>
      <StyledText variant="secondary" x={left + width / 2} y={secondaryY}>
        {secondaryText}
      </StyledText>
    </React.Fragment>
  );
}

function formatCount(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value);
}

function formatPercentage(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function SourceDistributionChart({
  totalAttacks,
  items,
  isLoading,
  isError,
  isEmpty,
}: SourceDistributionChartProps) {
  const { sourceColorRegistry } = useSourceColorContext();

  return (
    <Card
      variant="outlined"
      sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}
    >
      <CardContent>
        <Typography component="h2" variant="subtitle2">
          Repartition des attaques par source
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Vue globale sur la periode selectionnee, avec couleurs stables par source.
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
            Impossible de charger la repartition des attaques par source.
          </Alert>
        ) : null}
        {isEmpty ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Aucune attaque n&apos;a ete trouvee sur la periode selectionnee.
          </Alert>
        ) : null}
        {!isLoading && !isError && !isEmpty ? (
          <Stack>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
              <PieChart
                colors={items.map((item) =>
                  getSourceColor({
                    sourceId: item.sourceId,
                    sourceName: item.sourceName,
                    sourceColor: item.sourceColor,
                    sourceColorRegistry,
                  }),
                )}
                margin={{
                  left: 80,
                  right: 80,
                  top: 80,
                  bottom: 80,
                }}
                series={[
                  {
                    data: items.map((item) => ({
                      id: item.sourceId,
                      label: item.sourceName,
                      value: item.attackCount,
                    })),
                    innerRadius: 75,
                    outerRadius: 100,
                    paddingAngle: 0,
                    highlightScope: { fade: 'global', highlight: 'item' },
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
              const color = getSourceColor({
                sourceId: item.sourceId,
                sourceName: item.sourceName,
                sourceColor: item.sourceColor,
                sourceColorRegistry,
              });

              return (
                <Stack
                  key={item.sourceId}
                  direction="row"
                  sx={{ alignItems: 'center', gap: 2, pb: 2 }}
                >
                  <Stack sx={{ gap: 1, flexGrow: 1 }}>
                    <Stack
                      direction="row"
                      sx={{
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.sourceName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {formatPercentage(item.percentage)} %
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      aria-label={`Poids de ${item.sourceName}`}
                      value={item.percentage}
                      sx={{
                        backgroundColor: alpha(color, 0.16),
                        [`& .${linearProgressClasses.bar}`]: {
                          backgroundColor: color,
                        },
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
