import * as React from 'react';
import { type Dayjs } from 'dayjs';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { fetchCommonIpAlerts } from './api/alertsApi';
import { alertsQueryKeys } from './queryKeys';
import type { CommonIpAlertListItem } from './types/alertTypes';
import { fetchSources } from '../../../../shared/sources/api';
import { sourcesQueryKeys } from '../../../../shared/sources/queryKeys';
import CustomDatePicker from '../../../../shared/components/CustomDatePicker';
import { useSourceColorContext } from '../../../../shared/sources/providers/sourceColorContext';
import { normalizeDayjsDateRange } from '../../../../shared/utils/dateUtils';
import SourceOptionLabel from '../../utils/SourceOptionLabel';
import { buildSourceOptions } from '../../utils/sourceOptions';
import CommonIpAlertRow from './components/CommonIpAlertRow';
import LoadingTableState from './components/LoadingTableState';
import type {
  AlertPaginationModel,
  AlertsLocalFilters,
} from './types/alertsSectionTypes';
import { formatSelectedSources } from './utils/formatters';
import { buildCommonIpAlertsQuery } from './utils/queryParams';
import AlertDetailDialog from './components/AlertDetailDialog';

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

export default function AlertsSection() {
  const { sourceColorRegistry } = useSourceColorContext();
  const [refreshToken, setRefreshToken] = React.useState(0);
  const [filters, setFilters] = React.useState<AlertsLocalFilters>(EMPTY_FILTERS);
  const [paginationModel, setPaginationModel] = React.useState<AlertPaginationModel>(DEFAULT_PAGINATION_MODEL);
  const [expandedAlert, setExpandedAlert] = React.useState<CommonIpAlertListItem | null>(null);

  const sourcesQuery = useQuery({
    queryKey: sourcesQueryKeys.colorRegistry,
    queryFn: fetchSources,
    staleTime: 5 * 60 * 1000,
  });

  const alertsQueryParams = React.useMemo(
    () => buildCommonIpAlertsQuery(filters, paginationModel),
    [filters, paginationModel],
  );

  const alertsQuery = useQuery({
    queryKey: alertsQueryKeys.commonIpAlerts(alertsQueryParams, refreshToken),
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
    if (expandedAlert != null && !rows.some((item) => item.id === expandedAlert.id)) {
      setExpandedAlert(null);
    }
  }, [expandedAlert, rows]);

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
      dateRange: normalizeDayjsDateRange(currentFilters.dateRange, field, value),
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
          Consultez les alertes IP communes détectées par plusieurs sources. Cliquez sur une alerte pour voir ses détails, lancer un enrichissement CTI ciblé et envoyer un rapport d&apos;incident au contact de signalement d&apos;abus.
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
                Impossible de charger la liste des sources. Le filtre source peut être
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
                Aucune alerte IP commune ne correspond aux filtres sélectionnés.
              </Alert>
            ) : null}
            {!alertsQuery.isError && (rows.length > 0 || totalItems > 0) ? (
              <Stack spacing={1.5}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Triée par nombre de sources distinctes.
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
                          onClick={() => setExpandedAlert(alert)}
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
      <AlertDetailDialog
        open={expandedAlert !== null}
        onClose={() => setExpandedAlert(null)}
        alert={expandedAlert}
        refreshToken={refreshToken}
      />
    </Stack>
  );
}
