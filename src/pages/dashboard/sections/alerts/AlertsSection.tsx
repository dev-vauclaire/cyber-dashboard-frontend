import * as React from 'react';
import { type Dayjs } from 'dayjs';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { fetchCommonIpAlertDetail, fetchCommonIpAlerts } from '../../../../api/alerts';
import { fetchSources } from '../../../../api/sources';
import AlertEmailDialog from '../../../../components/dialogs/AlertEmailDialog';
import CtiEnrichmentDialog from '../../../../components/dialogs/CtiEnrichmentDialog';
import CustomDatePicker from '../../../../components/filters/CustomDatePicker';
import { useSourceColorContext } from '../../../../internals/source-colors/SourceColorContext';
import type {
  CommonIpAlertDetail,
  CommonIpAlertListItem,
  CommonIpAlertsQuery,
} from '../../../../types/alerts';
import type { Source } from '../../../../types/sources';
import { buildParisDayBoundaryUtcIso, formatDate } from '../../../../utils/dateUtils';
import { buildSourceExternalUrl, getCollectorPortalLabel } from '../../../../utils/externalLinks';
import { getSourceColor } from '../../../../utils/sourceColors';

type AlertsLocalDateRange = {
  from: Dayjs | null;
  to: Dayjs | null;
};

type AlertsLocalFilters = {
  sourceIds: string[];
  dateRange: AlertsLocalDateRange;
  minDistinctSourceCount: string;
};

type AlertPaginationModel = {
  page: number;
  pageSize: number;
};

type SourceOption = {
  value: string;
  label: string;
  color: string;
};

const DEFAULT_PAGINATION_MODEL: AlertPaginationModel = {
  page: 0,
  pageSize: 20,
};

const EMPTY_FILTERS: AlertsLocalFilters = {
  sourceIds: [],
  dateRange: {
    from: null,
    to: null,
  },
  minDistinctSourceCount: '',
};

function normalizeLocalDateRange(
  currentRange: AlertsLocalDateRange,
  field: 'from' | 'to',
  nextValue: Dayjs | null,
): AlertsLocalDateRange {
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

function buildCommonIpAlertsQuery(
  filters: AlertsLocalFilters,
  paginationModel: AlertPaginationModel,
): CommonIpAlertsQuery {
  const query: CommonIpAlertsQuery = {
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
  };

  if (filters.sourceIds.length > 0) {
    query.source_id = filters.sourceIds.map((sourceId) => Number(sourceId));
  }

  if (filters.dateRange.from != null) {
    query.from = buildParisDayBoundaryUtcIso(filters.dateRange.from, 'start');
  }

  if (filters.dateRange.to != null) {
    query.to = buildParisDayBoundaryUtcIso(filters.dateRange.to, 'end');
  }

  if (filters.minDistinctSourceCount !== '') {
    query.min_distinct_source_count = Number(filters.minDistinctSourceCount);
  }

  return query;
}

function buildSourceOptions(
  sources: Source[],
  sourceColorRegistry: ReturnType<typeof useSourceColorContext>['sourceColorRegistry'],
): SourceOption[] {
  return sources
    .slice()
    .sort((left, right) => left.source_name.localeCompare(right.source_name, 'fr'))
    .map((source) => ({
      value: String(source.source_id),
      label: source.source_name,
      color: getSourceColor({
        sourceId: source.source_id,
        sourceName: source.source_name,
        sourceColor: source.color,
        sourceColorRegistry,
      }),
    }));
}

function formatSourceCount(value: number): string {
  return `${value} source${value > 1 ? 's' : ''}`;
}

function buildDetailSummary(detail: CommonIpAlertDetail | undefined): string {
  if (detail == null) {
    return '';
  }

  const totalHits = detail.sources.reduce((sum, source) => sum + source.hit_count, 0);

  return `${detail.sources.length} source${detail.sources.length > 1 ? 's' : ''} · ${totalHits} hit${totalHits > 1 ? 's' : ''}`;
}

function SourceOptionLabel({
  color,
  label,
  noWrap = true,
}: {
  color: string;
  label: string;
  noWrap?: boolean;
}) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: '999px',
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      <Typography variant="body2" noWrap={noWrap} title={label}>
        {label}
      </Typography>
    </Stack>
  );
}

function formatSelectedSources(sourceIds: string[], sourceOptions: SourceOption[]) {
  if (sourceIds.length === 0) {
    return 'Toutes les sources';
  }

  const selectedLabels = sourceIds
    .map((sourceId) => sourceOptions.find((option) => option.value === sourceId)?.label)
    .filter((label): label is string => label != null);

  if (selectedLabels.length === 0) {
    return `${sourceIds.length} source${sourceIds.length > 1 ? 's' : ''}`;
  }

  if (selectedLabels.length <= 2) {
    return selectedLabels.join(', ');
  }

  return `${selectedLabels.length} sources selectionnees`;
}

function LoadingTableState() {
  return (
    <Stack spacing={1.25} sx={{ pt: 1 }}>
      <Skeleton variant="rounded" height={42} />
      <Skeleton variant="rounded" height={42} />
      <Skeleton variant="rounded" height={42} />
      <Skeleton variant="rounded" height={42} />
    </Stack>
  );
}

type AlertDetailContentProps = {
  alertId: number;
  attackerIp: string;
  refreshToken: number;
};

function AlertDetailContent({
  alertId,
  attackerIp,
  refreshToken,
}: AlertDetailContentProps) {
  const { sourceColorRegistry } = useSourceColorContext();
  const detailQuery = useQuery({
    queryKey: ['commonIpAlertDetail', alertId, refreshToken],
    queryFn: () => fetchCommonIpAlertDetail(alertId),
    enabled: alertId > 0,
  });

  if (detailQuery.isLoading) {
    return (
      <Stack spacing={1.25} sx={{ py: 1 }}>
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="rounded" height={38} />
        <Skeleton variant="rounded" height={38} />
      </Stack>
    );
  }

  if (detailQuery.isError) {
    return (
      <Alert severity="warning" sx={{ mt: 1 }}>
        Impossible de charger le detail de cette alerte.
      </Alert>
    );
  }

  if (detailQuery.data == null || detailQuery.data.sources.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 1 }}>
        Aucun detail source n&apos;est disponible pour cette alerte.
      </Alert>
    );
  }

  return (
    <Stack spacing={1.5} sx={{ py: 1.5 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {buildDetailSummary(detailQuery.data)}
      </Typography>
      <Table size="small" aria-label={`Detail de ${attackerIp}`}>
        <TableHead>
          <TableRow>
            <TableCell>Source</TableCell>
            <TableCell>Portail</TableCell>
            <TableCell>Premier signalement</TableCell>
            <TableCell>Dernier signalement</TableCell>
            <TableCell align="right">Hits</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {detailQuery.data.sources.map((source) => {
            const color = getSourceColor({
              sourceId: source.source_id,
              sourceName: source.source_name,
              sourceColorRegistry,
            });
            const collectorLabel = getCollectorPortalLabel({
              collectorType: source.collector_type,
              sensorTypeCode: source.sensor_type_code,
            });
            const externalUrl = buildSourceExternalUrl({
              collectorType: source.collector_type,
              sensorTypeCode: source.sensor_type_code,
              domainName: source.domain_name,
              externalId: source.external_id,
            });

            return (
              <TableRow key={`${alertId}-${source.source_id}`}>
                <TableCell>
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '999px',
                        backgroundColor: color,
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2">{source.source_name}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  {externalUrl ? (
                    <Tooltip title={`Ouvrir ${collectorLabel}`}>
                      <IconButton
                        component="a"
                        href={externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        size="small"
                        aria-label={`Ouvrir ${collectorLabel}`}
                      >
                        <OpenInNewRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Chip
                      size="small"
                      variant="outlined"
                      label={collectorLabel}
                    />
                  )}
                </TableCell>
                <TableCell>{formatDate(source.first_seen_at)}</TableCell>
                <TableCell>{formatDate(source.last_seen_at)}</TableCell>
                <TableCell align="right">{source.hit_count}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Stack>
  );
}

type CommonIpAlertRowProps = {
  alert: CommonIpAlertListItem;
  isExpanded: boolean;
  onToggle: (alertId: number) => void;
  onOpenCti: (ipAddress: string) => void;
  onOpenEmail: (alert: CommonIpAlertListItem) => void;
  refreshToken: number;
};

function CommonIpAlertRow({
  alert,
  isExpanded,
  onToggle,
  onOpenCti,
  onOpenEmail,
  refreshToken,
}: CommonIpAlertRowProps) {
  return (
    <React.Fragment>
      <TableRow hover>
        <TableCell padding="checkbox">
          <IconButton
            size="small"
            aria-label={isExpanded ? 'Replier le detail' : 'Afficher le detail'}
            onClick={() => onToggle(alert.id)}
          >
            {isExpanded ? <KeyboardArrowUpRoundedIcon /> : <KeyboardArrowDownRoundedIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{alert.id}</TableCell>
        <TableCell sx={{ fontFamily: 'monospace' }}>{alert.attacker_ip}</TableCell>
        <TableCell>
          <Chip
            size="small"
            variant="outlined"
            label={formatSourceCount(alert.distinct_source_count)}
          />
        </TableCell>
        <TableCell>{formatDate(alert.first_seen_at)}</TableCell>
        <TableCell>{formatDate(alert.last_seen_at)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ py: 0 }} colSpan={6}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ px: 2, py: 1 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                sx={{ justifyContent: 'space-between', gap: 1, alignItems: { sm: 'center' } }}
              >
                <Typography component="h4" variant="subtitle2">
                  Detail de l&apos;alerte #{alert.id} · {alert.attacker_ip}
                </Typography>
                <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<TravelExploreRoundedIcon fontSize="small" />}
                    onClick={() => onOpenCti(alert.attacker_ip)}
                  >
                    CTI
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<MailOutlineRoundedIcon fontSize="small" />}
                    onClick={() => onOpenEmail(alert)}
                  >
                    Envoyer un email
                  </Button>
                </Stack>
              </Stack>
              <AlertDetailContent
                alertId={alert.id}
                attackerIp={alert.attacker_ip}
                refreshToken={refreshToken}
              />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function AlertsSection() {
  const { sourceColorRegistry } = useSourceColorContext();
  const [refreshToken, setRefreshToken] = React.useState(0);
  const [filters, setFilters] = React.useState<AlertsLocalFilters>(EMPTY_FILTERS);
  const [paginationModel, setPaginationModel] =
    React.useState<AlertPaginationModel>(DEFAULT_PAGINATION_MODEL);
  const [expandedAlertId, setExpandedAlertId] = React.useState<number | null>(null);
  const [ctiIpAddress, setCtiIpAddress] = React.useState<string | null>(null);
  const [emailAlert, setEmailAlert] = React.useState<CommonIpAlertListItem | null>(null);

  const sourcesQuery = useQuery({
    queryKey: ['sourcesColorRegistry'],
    queryFn: fetchSources,
    staleTime: 5 * 60 * 1000,
  });

  const alertsQueryParams = React.useMemo(
    () => buildCommonIpAlertsQuery(filters, paginationModel),
    [filters, paginationModel],
  );

  const alertsQuery = useQuery({
    queryKey: ['commonIpAlerts', alertsQueryParams, refreshToken],
    queryFn: () => fetchCommonIpAlerts(alertsQueryParams),
    placeholderData: keepPreviousData,
  });

  const sourceOptions = React.useMemo(
    () => buildSourceOptions(sourcesQuery.data?.items ?? [], sourceColorRegistry),
    [sourceColorRegistry, sourcesQuery.data],
  );
  const rows = React.useMemo(
    () => alertsQuery.data?.items ?? [],
    [alertsQuery.data],
  );
  const totalItems = alertsQuery.data?.pagination.total_items ?? 0;
  const isTableLoading = alertsQuery.isPending || alertsQuery.isFetching;

  React.useEffect(() => {
    if (expandedAlertId != null && !rows.some((item) => item.id === expandedAlertId)) {
      setExpandedAlertId(null);
    }
  }, [expandedAlertId, rows]);

  function resetPage() {
    setPaginationModel((currentPaginationModel) => ({
      ...currentPaginationModel,
      page: 0,
    }));
  }

  function handleSourceFilterChange(event: SelectChangeEvent<string[]>) {
    const nextValue = event.target.value;

    setFilters((currentFilters) => ({
      ...currentFilters,
      sourceIds: typeof nextValue === 'string' ? nextValue.split(',') : nextValue,
    }));
    resetPage();
  }

  function handleDateChange(field: 'from' | 'to', value: Dayjs | null) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      dateRange: normalizeLocalDateRange(currentFilters.dateRange, field, value),
    }));
    resetPage();
  }

  function handleMinDistinctSourceCountChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const nextValue = event.target.value;

    setFilters((currentFilters) => ({
      ...currentFilters,
      minDistinctSourceCount: nextValue === '' ? '' : String(Math.max(1, Number(nextValue))),
    }));
    resetPage();
  }

  function handleToggleDetail(alertId: number) {
    setExpandedAlertId((currentId) => (currentId === alertId ? null : alertId));
  }

  function handleRefresh() {
    setRefreshToken((currentToken) => currentToken + 1);
  }

  function handlePageChange(_event: unknown, nextPage: number) {
    setPaginationModel((currentPaginationModel) => ({
      ...currentPaginationModel,
      page: nextPage,
    }));
  }

  function handleRowsPerPageChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPaginationModel({
      page: 0,
      pageSize: Number(event.target.value),
    });
  }

  return (
    <Stack component="section" id="alerts" spacing={2} sx={{ scrollMarginTop: 144 }}>
      <Stack spacing={0.5}>
        <Typography component="h2" variant="h5">
          Alertes IP communes
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Consultation paginee des IP partagees entre plusieurs sources, avec detail
          inline par source.
        </Typography>
      </Stack>
      <Card variant="outlined">
        <CardContent sx={{ px: { xs: 1, md: 2 }, py: 2 }}>
          <Stack spacing={2.5}>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, lg: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="alerts-source-label" shrink>
                    Sources
                  </InputLabel>
                  <Select
                    multiple
                    labelId="alerts-source-label"
                    label="Sources"
                    value={filters.sourceIds}
                    onChange={handleSourceFilterChange}
                    disabled={sourcesQuery.isLoading}
                    displayEmpty
                    renderValue={(value) =>
                      formatSelectedSources(value as string[], sourceOptions)
                    }
                  >
                    {sourceOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Checkbox
                          size="small"
                          checked={filters.sourceIds.includes(option.value)}
                        />
                        <ListItemText
                          primary={
                            <SourceOptionLabel
                              color={option.color}
                              label={option.label}
                              noWrap={false}
                            />
                          }
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Sources distinctes min."
                  value={filters.minDistinctSourceCount}
                  onChange={handleMinDistinctSourceCountChange}
                  slotProps={{
                    htmlInput: {
                      min: 1,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, lg: 5 }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  sx={{
                    gap: 1,
                    alignItems: { xs: 'stretch', sm: 'center' },
                    justifyContent: { lg: 'flex-end' },
                    flexWrap: 'wrap',
                  }}
                >
                  <CustomDatePicker
                    label="Du"
                    value={filters.dateRange.from}
                    onChange={(value) => handleDateChange('from', value)}
                    maxDate={filters.dateRange.to}
                  />
                  <CustomDatePicker
                    label="Au"
                    value={filters.dateRange.to}
                    onChange={(value) => handleDateChange('to', value)}
                    minDate={filters.dateRange.from}
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
              </Grid>
            </Grid>

            {sourcesQuery.isError ? (
              <Alert severity="warning">
                Impossible de charger la liste des sources. Le filtre source peut etre
                incomplet.
                {sourcesQuery.error instanceof Error ? ` (${sourcesQuery.error.message})` : ''}
              </Alert>
            ) : null}

            <Divider />

            {isTableLoading && rows.length === 0 ? <LoadingTableState /> : null}
            {alertsQuery.isError ? (
              <Alert severity="warning">
                Impossible de charger la liste des alertes IP communes.
                {alertsQuery.error instanceof Error ? ` (${alertsQuery.error.message})` : ''}
              </Alert>
            ) : null}
            {!isTableLoading && !alertsQuery.isError && totalItems === 0 ? (
              <Alert severity="info">
                Aucune alerte IP commune ne correspond aux filtres selectionnes.
              </Alert>
            ) : null}
            {!alertsQuery.isError && (rows.length > 0 || totalItems > 0) ? (
              <Stack spacing={1.5}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Pagination cote serveur, triee par nombre de sources distinctes.
                </Typography>
                <TableContainer
                  sx={{
                    maxHeight: 520,
                    overflow: 'auto',
                  }}
                >
                  <Table
                    stickyHeader
                    aria-label="Alertes IP communes"
                    sx={{ minWidth: 820 }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell />
                        <TableCell>ID</TableCell>
                        <TableCell>IP attaquante</TableCell>
                        <TableCell>Sources distinctes</TableCell>
                        <TableCell>Premier signalement</TableCell>
                        <TableCell>Dernier signalement</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((alert) => (
                        <CommonIpAlertRow
                          key={alert.id}
                          alert={alert}
                          isExpanded={expandedAlertId === alert.id}
                          onToggle={handleToggleDetail}
                          onOpenCti={setCtiIpAddress}
                          onOpenEmail={setEmailAlert}
                          refreshToken={refreshToken}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={totalItems}
                  page={paginationModel.page}
                  rowsPerPage={paginationModel.pageSize}
                  rowsPerPageOptions={[10, 20, 50, 100]}
                  labelRowsPerPage="Alertes par page"
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                />
              </Stack>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
      <CtiEnrichmentDialog
        open={ctiIpAddress != null}
        ipAddress={ctiIpAddress}
        onClose={() => setCtiIpAddress(null)}
      />
      <AlertEmailDialog
        open={emailAlert != null}
        alertId={emailAlert?.id ?? null}
        ipAddress={emailAlert?.attacker_ip ?? null}
        onClose={() => setEmailAlert(null)}
      />
    </Stack>
  );
}
