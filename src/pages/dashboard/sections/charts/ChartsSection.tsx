import * as React from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import DonutLargeRoundedIcon from '@mui/icons-material/DonutLargeRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SourceRoundedIcon from '@mui/icons-material/SourceRounded';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import CustomDatePicker from '../../../../shared/components/CustomDatePicker';
import AttackTypeDistributionChart from './components/AttackTypeDistributionChart';
import LinearChart from './components/LinearChart';
import SourceDistributionChart from './components/SourceDistributionChart';
import {
  fetchAttacksBySource,
  fetchAttacksBySourceTimeseries,
  fetchAttacksByType,
} from './api/stats';
import type {
  AttackStatsDateRangeQuery,
  AttacksBySourceResponse,
  AttacksBySourceTimeseriesResponse,
  AttacksByTypeResponse,
} from './types/stats';
import {
  buildParisDayBoundaryUtcIso,
  formatDateToParisDayLabel,
  normalizeDayjsDateRange,
  type DayjsDateRange,
} from '../../../../shared/utils/dateUtils';
import { chartsQueryKeys } from './queryKeys';

type DistributionMode = 'source' | 'type';

function createDefaultChartsDateRange(): DayjsDateRange {
  const today = dayjs();

  return {
    from: today.subtract(6, 'day'),
    to: today,
  };
}

function buildAttackStatsDateRangeQuery(
  localDateRange: DayjsDateRange,
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

function buildAttackTypeDistributionData(data: AttacksByTypeResponse | undefined) {
  const items = (data?.items ?? [])
    .slice()
    .sort((left, right) => right.attack_count - left.attack_count)
    .map((item) => ({
      attackType: item.attack_type,
      attackCount: item.attack_count,
      percentage: item.percentage,
    }));

  return {
    items,
    totalAttacks: items.reduce((total, item) => total + item.attackCount, 0),
  };
}

export default function ChartsSection() {
  const [localDateRange, setLocalDateRange] = React.useState<DayjsDateRange>(() =>
    createDefaultChartsDateRange(),
  );
  const [refreshToken, setRefreshToken] = React.useState(0);
  const [distributionMode, setDistributionMode] =
    React.useState<DistributionMode>('source');
  const [hiddenSourceIds, setHiddenSourceIds] = React.useState<Set<number>>(
    () => new Set(),
  );
  const dateRangeQuery = buildAttackStatsDateRangeQuery(localDateRange);
  const timelineQuery = useQuery({
    queryFn: () => fetchAttacksBySourceTimeseries(dateRangeQuery!),
    queryKey: chartsQueryKeys.timeline(
      dateRangeQuery?.from ?? null,
      dateRangeQuery?.to ?? null,
      refreshToken,
    ),
    enabled: dateRangeQuery != null,
  });
  const sourceDistributionQuery = useQuery({
    queryFn: () => fetchAttacksBySource(dateRangeQuery!),
    queryKey: chartsQueryKeys.bySource(
      dateRangeQuery?.from ?? null,
      dateRangeQuery?.to ?? null,
      refreshToken,
    ),
    enabled: dateRangeQuery != null && distributionMode === 'source',
  });
  const attackTypeDistributionQuery = useQuery({
    queryFn: () => fetchAttacksByType(dateRangeQuery!),
    queryKey: chartsQueryKeys.byType(
      dateRangeQuery?.from ?? null,
      dateRangeQuery?.to ?? null,
      refreshToken,
    ),
    enabled: dateRangeQuery != null && distributionMode === 'type',
  });

  const timelineChartData = buildTimelineChartData(timelineQuery.data);
  const sourceDistributionData = buildSourceDistributionData(sourceDistributionQuery.data);
  const attackTypeDistributionData = buildAttackTypeDistributionData(
    attackTypeDistributionQuery.data,
  );
  const isDateRangeIncomplete = localDateRange.from == null || localDateRange.to == null;

  function handleDateChange(field: 'from' | 'to', value: Dayjs | null) {
    setLocalDateRange((currentRange) =>
      normalizeDayjsDateRange(currentRange, field, value),
    );
  }

  function handleRefresh() {
    setRefreshToken((currentToken) => currentToken + 1);
  }

  function handleDistributionModeChange(
    _event: React.MouseEvent<HTMLElement>,
    nextMode: DistributionMode | null,
  ) {
    if (nextMode != null) {
      setDistributionMode(nextMode);
    }
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
            Évolution temporelle et répartition des attaques par source ou par type.
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
          <ToggleButtonGroup
            exclusive
            size="small"
            value={distributionMode}
            onChange={handleDistributionModeChange}
            aria-label="Mode de répartition des attaques"
          >
            <ToggleButton value="source" aria-label="Répartition par source">
              <SourceRoundedIcon fontSize="small" sx={{ mr: 0.75 }} />
              Par source
            </ToggleButton>
            <ToggleButton value="type" aria-label="Répartition par type">
              <DonutLargeRoundedIcon fontSize="small" sx={{ mr: 0.75 }} />
              Par type
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>
      {isDateRangeIncomplete ? (
        <Alert severity="info">
          Sélectionnez une période complète dans cette section pour charger les données
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
          {distributionMode === 'source' ? (
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
          ) : (
            <AttackTypeDistributionChart
              totalAttacks={attackTypeDistributionData.totalAttacks}
              items={attackTypeDistributionData.items}
              isLoading={attackTypeDistributionQuery.isLoading}
              isError={attackTypeDistributionQuery.isError}
              isEmpty={
                !attackTypeDistributionQuery.isLoading &&
                !attackTypeDistributionQuery.isError &&
                attackTypeDistributionData.items.length === 0
              }
            />
          )}
        </Grid>
      </Grid>
    </Stack>
  );
}
