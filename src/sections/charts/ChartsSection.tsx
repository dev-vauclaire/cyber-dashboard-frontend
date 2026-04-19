import { useQuery } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearChart from '../../components/charts/LinearChart';
import SourceDistributionChart from '../../components/charts/SourceDistributionChart';
import { fetchAttacksBySource, fetchAttacksBySourceTimeseries } from '../../api/stats';
import type { DashboardPageControls } from '../../types/dashboard';
import type {
  AttacksBySourceResponse,
  AttacksBySourceTimeseriesResponse,
} from '../../types/stats';
import {
  buildDashboardAttackStatsDateRangeQuery,
  formatDashboardGlobalDateRange,
} from '../../utils/dashboardFilters';
import { formatDateToParisDayLabel } from '../../utils/dateUtils';

function buildTimelineChartData(data: AttacksBySourceTimeseriesResponse | undefined) {
  if (data == null) {
    return {
      labels: [],
      series: [],
      totalAttacks: 0,
    };
  }

  return {
    labels: data.bucket_starts_utc.map((bucketStartUtc) =>
      formatDateToParisDayLabel(bucketStartUtc),
    ),
    series: data.series
      .slice()
      .sort((left, right) => right.attack_count - left.attack_count)
      .map((source) => ({
        sourceId: source.source_id,
        sourceName: source.source_name,
        sourceColor: source.source_color,
        attackCount: source.attack_count,
        data: source.data,
      })),
    totalAttacks: data.total_attacks,
  };
}

function buildSourceDistributionData(data: AttacksBySourceResponse | undefined) {
  if (data == null) {
    return {
      items: [],
      totalAttacks: 0,
    };
  }

  return {
    totalAttacks: data.total_attacks,
    items: data.by_source
      .slice()
      .sort((left, right) => right.attack_count - left.attack_count)
      .map((item) => ({
        sourceId: item.source_id,
        sourceName: item.source_name,
        attackCount: item.attack_count,
        percentage: item.percentage,
      })),
  };
}

type ChartsSectionProps = {
  dashboardControls: DashboardPageControls;
};

export default function ChartsSection({ dashboardControls }: ChartsSectionProps) {
  const dateRangeQuery = buildDashboardAttackStatsDateRangeQuery(
    dashboardControls.globalDateRange,
  );
  const timelineQuery = useQuery({
    queryFn: () => fetchAttacksBySourceTimeseries(dateRangeQuery!),
    queryKey: [
      'chartsTimeline',
      dateRangeQuery?.from ?? null,
      dateRangeQuery?.to ?? null,
      dashboardControls.refreshToken,
    ],
    enabled: dateRangeQuery != null,
  });
  const sourceDistributionQuery = useQuery({
    queryFn: () => fetchAttacksBySource(dateRangeQuery!),
    queryKey: [
      'chartsBySource',
      dateRangeQuery?.from ?? null,
      dateRangeQuery?.to ?? null,
      dashboardControls.refreshToken,
    ],
    enabled: dateRangeQuery != null,
  });

  const timelineChartData = buildTimelineChartData(timelineQuery.data);
  const sourceDistributionData = buildSourceDistributionData(sourceDistributionQuery.data);
  const isDateRangeIncomplete =
    dashboardControls.globalDateRange.from == null || dashboardControls.globalDateRange.to == null;

  return (
    <Stack
      component="section"
      id="charts"
      spacing={2}
      sx={{ scrollMarginTop: 144 }}
    >
      <Stack spacing={0.5}>
        <Typography component="h2" variant="h5">
          Graphiques
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Zone reservee a l'evolution temporelle et a la répartition des attaques par source.
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Periode globale selectionnee :{' '}
          {formatDashboardGlobalDateRange(dashboardControls.globalDateRange)}
        </Typography>
      </Stack>
      {isDateRangeIncomplete ? (
        <Alert severity="info">
          Selectionne une periode complete dans le header pour charger les donnees
          d&apos;analyse.
        </Alert>
      ) : null}
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <LinearChart
            totalAttacks={timelineChartData.totalAttacks}
            labels={timelineChartData.labels}
            series={timelineChartData.series}
            isLoading={timelineQuery.isLoading}
            isError={timelineQuery.isError}
            isEmpty={!timelineQuery.isLoading && !timelineQuery.isError && timelineChartData.series.length === 0}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SourceDistributionChart
            totalAttacks={sourceDistributionData.totalAttacks}
            items={sourceDistributionData.items}
            isLoading={sourceDistributionQuery.isLoading}
            isError={sourceDistributionQuery.isError}
            isEmpty={
              !sourceDistributionQuery.isLoading &&
              !sourceDistributionQuery.isError &&
              sourceDistributionData.items.length === 0
            }
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
