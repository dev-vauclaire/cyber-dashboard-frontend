import * as React from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearChart from '../../components/charts/LinearChart';
import SourceDistributionChart from '../../components/charts/SourceDistributionChart';
import { fetchAttacksBySource, fetchAttacksBySourceTimeseries } from '../../api/stats';
import type {
  AttackStatsDateRangeQuery,
  AttacksBySourceResponse,
  AttacksBySourceTimeseriesResponse,
} from '../../types/stats';
import { formatDateToParisDayLabel } from '../../utils/dateUtils';

type ChartsLocalDateRange = {
  from: Dayjs;
  to: Dayjs;
};

function createDefaultChartsDateRange(): ChartsLocalDateRange {
  const today = dayjs();

  return {
    from: today.subtract(6, 'day'),
    to: today,
  };
}

function formatLocalDateRange(localDateRange: ChartsLocalDateRange): string {
  return `${localDateRange.from.format('DD/MM/YYYY')} -> ${localDateRange.to.format('DD/MM/YYYY')}`;
}

function buildAttackStatsDateRangeQuery(
  localDateRange: ChartsLocalDateRange,
): AttackStatsDateRangeQuery {
  const fromDate = localDateRange.from.format('YYYY-MM-DD');
  const toDate = localDateRange.to.format('YYYY-MM-DD');

  return {
    from: `${fromDate}T00:00:00Z`,
    to: `${toDate}T23:59:59Z`,
  };
}

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

export default function ChartsSection() {
  const localDateRange = React.useMemo(() => createDefaultChartsDateRange(), []);
  const dateRangeQuery = buildAttackStatsDateRangeQuery(localDateRange);
  const timelineQuery = useQuery({
    queryFn: () => fetchAttacksBySourceTimeseries(dateRangeQuery),
    queryKey: ['chartsTimeline', dateRangeQuery.from, dateRangeQuery.to],
  });
  const sourceDistributionQuery = useQuery({
    queryFn: () => fetchAttacksBySource(dateRangeQuery),
    queryKey: ['chartsBySource', dateRangeQuery.from, dateRangeQuery.to],
  });

  const timelineChartData = buildTimelineChartData(timelineQuery.data);
  const sourceDistributionData = buildSourceDistributionData(sourceDistributionQuery.data);

  return (
    <Stack component="section" id="charts" spacing={2} sx={{ scrollMarginTop: 144 }}>
      <Stack spacing={0.5}>
        <Typography component="h2" variant="h5">
          Graphiques
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Evolution temporelle et repartition des attaques par source.
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Periode par defaut : {formatLocalDateRange(localDateRange)}
        </Typography>
      </Stack>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <LinearChart
            totalAttacks={timelineChartData.totalAttacks}
            labels={timelineChartData.labels}
            series={timelineChartData.series}
            isLoading={timelineQuery.isLoading}
            isError={timelineQuery.isError}
            isEmpty={
              !timelineQuery.isLoading &&
              !timelineQuery.isError &&
              timelineChartData.series.length === 0
            }
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
