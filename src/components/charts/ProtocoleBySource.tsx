import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { alpha, styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getSourceColor } from '../../utils/sourceColors';

const sources = [
  { sourceId: 2, sourceName: 'LURIO CHV SI', percentage: 48, attackCount: 2480 },
  { sourceId: 3, sourceName: 'LURIO CHV 4G', percentage: 31, attackCount: 1590 },
  { sourceId: 10, sourceName: 'DETOXIO Scanner', percentage: 17, attackCount: 890 },
  { sourceId: 1, sourceName: 'WAF Portail', percentage: 4, attackCount: 220 },
];

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

export default function ProtocoleBySource() {
  const totalAttacks = sources.reduce((total, source) => total + source.attackCount, 0);

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
          Apercu du donut et de la legende avec couleur centralisee par source.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
          <PieChart
            colors={sources.map((source) =>
              getSourceColor({
                sourceId: source.sourceId,
                sourceName: source.sourceName,
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
                data: sources.map((source) => ({
                  id: source.sourceId,
                  label: source.sourceName,
                  value: source.attackCount,
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
            <PieCenterLabel primaryText={String(totalAttacks)} secondaryText="Total" />
          </PieChart>
        </Box>
        {sources.map((source) => {
          const color = getSourceColor({
            sourceId: source.sourceId,
            sourceName: source.sourceName,
          });

          return (
            <Stack
              key={source.sourceId}
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
                    {source.sourceName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {source.percentage}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  aria-label={`Poids de ${source.sourceName}`}
                  value={source.percentage}
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
      </CardContent>
    </Card>
  );
}
