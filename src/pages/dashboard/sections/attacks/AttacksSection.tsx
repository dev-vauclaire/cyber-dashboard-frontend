import * as React from 'react';
import { type Dayjs } from 'dayjs';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { GridPaginationModel, GridRowParams } from '@mui/x-data-grid';
import { fetchAttacks } from '../../../../api/attacks';
import { fetchSources } from '../../../../api/sources';
import CustomizedDataGrid from '../../../../components/data-display/CustomizedDataGrid';
import AttackDetailDialog from '../../../../components/dialogs/AttackDetailDialog';
import CustomDatePicker from '../../../../components/filters/CustomDatePicker';
import { useSourceColorContext } from '../../../../internals/source-colors/SourceColorContext';
import type { AttackRecord, PaginatedAttacksQuery } from '../../../../types/attacks';
import type { Source } from '../../../../types/sources';
import { buildParisDayBoundaryUtcIso } from '../../../../utils/dateUtils';
import { getSourceColor } from '../../../../utils/sourceColors';
import { buildAttackTableColumns } from './attackTableColumns';

type AttacksLocalDateRange = {
  from: Dayjs | null;
  to: Dayjs | null;
};

type AttacksLocalFilters = {
  sourceId: string;
  dateRange: AttacksLocalDateRange;
};

type SourceOption = {
  value: string;
  label: string;
  color: string;
};

const DEFAULT_PAGINATION_MODEL: GridPaginationModel = {
  page: 0,
  pageSize: 20,
};

const EMPTY_FILTERS: AttacksLocalFilters = {
  sourceId: '',
  dateRange: {
    from: null,
    to: null,
  },
};

function normalizeLocalDateRange(
  currentRange: AttacksLocalDateRange,
  field: 'from' | 'to',
  nextValue: Dayjs | null,
): AttacksLocalDateRange {
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

function buildPaginatedAttacksQuery(
  filters: AttacksLocalFilters,
  paginationModel: GridPaginationModel,
): PaginatedAttacksQuery {
  const query: PaginatedAttacksQuery = {
    page: paginationModel.page + 1,
    page_size: paginationModel.pageSize,
  };

  if (filters.sourceId !== '') {
    query.source_id = Number(filters.sourceId);
  }

  if (filters.dateRange.from != null) {
    query.from = buildParisDayBoundaryUtcIso(filters.dateRange.from, 'start');
  }

  if (filters.dateRange.to != null) {
    query.to = buildParisDayBoundaryUtcIso(filters.dateRange.to, 'end');
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

function sortAttacksByOccurredAt(items: AttackRecord[]): AttackRecord[] {
  return items
    .slice()
    .sort(
      (left, right) =>
        new Date(right.occurred_at).getTime() - new Date(left.occurred_at).getTime(),
    );
}

function SourceOptionLabel({ color, label }: { color: string; label: string }) {
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
      <Typography variant="body2" noWrap title={label}>
        {label}
      </Typography>
    </Stack>
  );
}

export default function AttacksSection() {
  const { sourceColorRegistry } = useSourceColorContext();
  const [filters, setFilters] = React.useState<AttacksLocalFilters>(EMPTY_FILTERS);
  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>(
    DEFAULT_PAGINATION_MODEL,
  );
  const [selectedAttack, setSelectedAttack] = React.useState<AttackRecord | null>(null);

  const sourcesQuery = useQuery({
    queryKey: ['sourcesColorRegistry'],
    queryFn: fetchSources,
    staleTime: 5 * 60 * 1000,
  });

  const attacksQueryParams = React.useMemo(
    () => buildPaginatedAttacksQuery(filters, paginationModel),
    [filters, paginationModel],
  );

  const attacksQuery = useQuery({
    queryKey: ['attacks', attacksQueryParams],
    queryFn: () => fetchAttacks(attacksQueryParams),
    placeholderData: keepPreviousData,
  });

  const sourceOptions = React.useMemo(
    () => buildSourceOptions(sourcesQuery.data?.items ?? [], sourceColorRegistry),
    [sourceColorRegistry, sourcesQuery.data],
  );
  const rows = React.useMemo(
    () => sortAttacksByOccurredAt(attacksQuery.data?.items ?? []),
    [attacksQuery.data],
  );
  const columns = React.useMemo(
    () => buildAttackTableColumns(sourceColorRegistry),
    [sourceColorRegistry],
  );
  const isTableLoading = attacksQuery.isPending || attacksQuery.isFetching;

  function resetPage() {
    setPaginationModel((currentPaginationModel) => ({
      ...currentPaginationModel,
      page: 0,
    }));
  }

  function handleSourceFilterChange(event: SelectChangeEvent<string>) {
    const nextValue = event.target.value;

    setFilters((currentFilters) => ({
      ...currentFilters,
      sourceId: nextValue,
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

  function handlePaginationModelChange(nextPaginationModel: GridPaginationModel) {
    setPaginationModel(nextPaginationModel);
  }

  function handleRowClick(params: GridRowParams<AttackRecord>) {
    setSelectedAttack(params.row);
  }

  return (
    <Stack component="section" id="attacks" spacing={2} sx={{ scrollMarginTop: 144 }}>
      <Stack spacing={0.5}>
        <Typography component="h2" variant="h5">
          Table des attaques
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Consultation paginee des attaques. La table reste volontairement simple,
          et les details complementaires sont consultables dans la modal.
        </Typography>
      </Stack>

      <Card variant="outlined">
        <CardContent sx={{ px: { xs: 1, md: 2 }, py: 2 }}>
          <Stack spacing={2}>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, lg: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="attacks-source-label">Source</InputLabel>
                  <Select
                    labelId="attacks-source-label"
                    label="Source"
                    value={filters.sourceId}
                    onChange={handleSourceFilterChange}
                    disabled={sourcesQuery.isLoading}
                    renderValue={(value) => {
                      if (value === '') {
                        return 'Toutes les sources';
                      }

                      const selectedOption = sourceOptions.find(
                        (option) => option.value === value,
                      );

                      if (selectedOption == null) {
                        return value;
                      }

                      return (
                        <SourceOptionLabel
                          color={selectedOption.color}
                          label={selectedOption.label}
                        />
                      );
                    }}
                  >
                    <MenuItem value="">Toutes les sources</MenuItem>
                    {sourceOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <SourceOptionLabel color={option.color} label={option.label} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, lg: 8 }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  sx={{
                    gap: 1,
                    alignItems: { xs: 'stretch', sm: 'center' },
                    justifyContent: { lg: 'flex-start' },
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
                    onClick={() => {
                      void attacksQuery.refetch();
                    }}
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

            {attacksQuery.isError ? (
              <Alert severity="error">
                Impossible de charger les attaques. Verifie le backend puis reessaie.
                {attacksQuery.error instanceof Error ? ` (${attacksQuery.error.message})` : ''}
              </Alert>
            ) : null}

            {!isTableLoading && !attacksQuery.isError && rows.length === 0 ? (
              <Alert severity="info">
                Aucune attaque ne correspond aux filtres locaux selectionnes.
              </Alert>
            ) : null}

            <Stack spacing={1}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Pagination cote serveur, plus recentes en premier.
              </Typography>
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <CustomizedDataGrid
                  columns={columns}
                  rows={rows}
                  isLoading={isTableLoading}
                  rowCount={attacksQuery.data?.pagination.total_items ?? 0}
                  paginationModel={paginationModel}
                  onPaginationModelChange={handlePaginationModelChange}
                  onRowClick={handleRowClick}
                  pageSizeOptions={[10, 20, 50]}
                  sx={{ minWidth: 720 }}
                />
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <AttackDetailDialog
        attack={selectedAttack}
        open={selectedAttack != null}
        onClose={() => setSelectedAttack(null)}
      />
    </Stack>
  );
}
