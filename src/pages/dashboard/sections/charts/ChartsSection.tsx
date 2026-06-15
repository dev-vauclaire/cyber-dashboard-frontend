import * as React from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CustomDatePicker from '../../../../components/filters/CustomDatePicker';
import LinearChart from '../../../../components/charts/LinearChart';
import SourceDistributionChart from '../../../../components/charts/SourceDistributionChart';
import { fetchAttacksBySource, fetchAttacksBySourceTimeseries } from '../../../../api/stats';
import type {
  AttackStatsDateRangeQuery,
  AttacksBySourceResponse,
  AttacksBySourceTimeseriesResponse,
} from '../../../../types/stats';
import {
  buildParisDayBoundaryUtcIso,
  formatDateToParisDayLabel,
} from '../../../../utils/dateUtils';

type ChartsLocalDateRange = {
  from: Dayjs | null;
  to: Dayjs | null;
};

function createDefaultChartsDateRange(): ChartsLocalDateRange {
  const today = dayjs();

  return {
    from: today.subtract(6, 'day'),
    to: today,
  };
}

function normalizeLocalDateRange(
  currentRange: ChartsLocalDateRange,
  field: 'from' | 'to',
  nextValue: Dayjs | null,
): ChartsLocalDateRange {
  if (field === 'from') {
    if (nextValue == null) {
      return {
        ...currentRange,
        from: null,
      };
    }

    if (currentRange.to != null && nextValue.isAfter(currentRange.to, 'day')) {
      return {
        from: nextValue,
        to: nextValue,
      };
    }

    return {
      ...currentRange,
      from: nextValue,
    };
  }

  if (nextValue == null) {
    return {
      ...currentRange,
      to: null,
    };
  }

  if (currentRange.from != null && nextValue.isBefore(currentRange.from, 'day')) {
    return {
      from: nextValue,
      to: nextValue,
    };
  }

  return {
    ...currentRange,
    to: nextValue,
  };
}

function buildAttackStatsDateRangeQuery(
  localDateRange: ChartsLocalDateRange,
): AttackStatsDateRangeQuery | null {
  if (localDateRange.from == null || localDateRange.to == null) {
    return null;
  }

  return {
    from: buildParisDayBoundaryUtcIso(localDateRange.from, 'start'),
    to: buildParisDayBoundaryUtcIso(localDateRange.to, 'end'),
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
  const [localDateRange, setLocalDateRange] = React.useState<ChartsLocalDateRange>(() =>
    createDefaultChartsDateRange(),
  );
  const [refreshToken, setRefreshToken] = React.useState(0);
  const [hiddenSourceIds, setHiddenSourceIds] = React.useState<Set<number>>(
    () => new Set(),
  );
  const dateRangeQuery = buildAttackStatsDateRangeQuery(localDateRange);
  const timelineQuery = useQuery({
    queryFn: () => fetchAttacksBySourceTimeseries(dateRangeQuery!),
    queryKey: [
      'chartsTimeline',
      dateRangeQuery?.from ?? null,
      dateRangeQuery?.to ?? null,
      refreshToken,
    ],
    enabled: dateRangeQuery != null,
  });
  const sourceDistributionQuery = useQuery({
    queryFn: () => fetchAttacksBySource(dateRangeQuery!),
    queryKey: [
      'chartsBySource',
      dateRangeQuery?.from ?? null,
      dateRangeQuery?.to ?? null,
      refreshToken,
    ],
    enabled: dateRangeQuery != null,
  });

  const timelineChartData = buildTimelineChartData(timelineQuery.data);
  const sourceDistributionData = buildSourceDistributionData(sourceDistributionQuery.data);
  const isDateRangeIncomplete = localDateRange.from == null || localDateRange.to == null;

  function handleDateChange(field: 'from' | 'to', value: Dayjs | null) {
    setLocalDateRange((currentRange) =>
      normalizeLocalDateRange(currentRange, field, value),
    );
  }

  function handleRefresh() {
    setRefreshToken((currentToken) => currentToken + 1);
  }

  function handleToggleSource(sourceId: number) {
    setHiddenSourceIds((currentHiddenSourceIds) => {
      const nextHiddenSourceIds = new Set(currentHiddenSourceIds);
      if (nextHiddenSourceIds.has(sourceId)) {
        nextHiddenSourceIds.delete(sourceId);
      } else {
        nextHiddenSourceIds.add(sourceId);
      }
      return nextHiddenSourceIds;
    });
  }

  const visibleTimelineTotal = timelineChartData.series
    .filter((item) => !hiddenSourceIds.has(item.sourceId))
    .reduce((sum, item) => sum + item.attackCount, 0);
  const visibleDistributionItems = sourceDistributionData.items.filter(
    (item) => !hiddenSourceIds.has(item.sourceId),
  );
  const visibleDistributionTotal = visibleDistributionItems.reduce(
    (sum, item) => sum + item.attackCount,
    0,
  );
  const sourceDistributionItemsWithVisiblePercentages = sourceDistributionData.items.map(
    (item) => ({
      ...item,
      percentage:
        hiddenSourceIds.has(item.sourceId) || visibleDistributionTotal === 0
          ? 0
          : (item.attackCount / visibleDistributionTotal) * 100,
    }),
  );

  return (
    <Stack component="section" id="charts" spacing={2} sx={{ scrollMarginTop: 144 }}>
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        sx={{ justifyContent: 'space-between', gap: 2, alignItems: { lg: 'flex-start' } }}
      >
        <Stack spacing={0.5}>
          <Typography component="h2" variant="h5">
            Graphiques
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Evolution temporelle et repartition des attaques par source.
          </Typography>
        </Stack>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          sx={{ gap: 1, alignItems: { xs: 'stretch', sm: 'center' }, flexWrap: 'wrap' }}
        >
          <CustomDatePicker
            label="Du"
            value={localDateRange.from}
            onChange={(value) => handleDateChange('from', value)}
            maxDate={localDateRange.to}
          />
          <CustomDatePicker
            label="Au"
            value={localDateRange.to}
            onChange={(value) => handleDateChange('to', value)}
            minDate={localDateRange.from}
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<RefreshRoundedIcon fontSize="small" />}
            onClick={handleRefresh}
          >
            Rafraîchir
          </Button>
        </Stack>
      </Stack>
      {isDateRangeIncomplete ? (
        <Alert severity="info">
          Selectionne une periode complete dans cette section pour charger les donnees
          d&apos;analyse.
        </Alert>
      ) : null}
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <LinearChart
            totalAttacks={visibleTimelineTotal}
            labels={timelineChartData.labels}
            series={timelineChartData.series}
            isLoading={timelineQuery.isLoading}
            isError={timelineQuery.isError}
            hiddenSourceIds={hiddenSourceIds}
            onToggleSource={handleToggleSource}
            isEmpty={
              !timelineQuery.isLoading &&
              !timelineQuery.isError &&
              timelineChartData.series.length === 0
            }
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SourceDistributionChart
            totalAttacks={visibleDistributionTotal}
            items={sourceDistributionItemsWithVisiblePercentages}
            isLoading={sourceDistributionQuery.isLoading}
            isError={sourceDistributionQuery.isError}
            hiddenSourceIds={hiddenSourceIds}
            onToggleSource={handleToggleSource}
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
