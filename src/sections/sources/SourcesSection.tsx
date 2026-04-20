import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  fetchSourceInventory,
  fetchSources,
  patchSourceActiveStatus,
  patchSourceColor,
  patchSourceName,
} from '../../api/sources';
import { useSourceColorContext } from '../../internals/source-colors/SourceColorContext';
import type { Source, SourceInventoryItem } from '../../types/sources';
import { getSourceColor } from '../../utils/sourceColors';

const SOURCES_QUERY_KEY = ['sourcesColorRegistry'] as const;
const SOURCES_INVENTORY_QUERY_KEY = ['sourcesInventory'] as const;

type SourceMutationVariables = {
  sourceId: number;
};

function sortSources(items: Source[]): Source[] {
  return items.slice().sort((left, right) => {
    if (left.is_active !== right.is_active) {
      return left.is_active ? -1 : 1;
    }

    return left.source_name.localeCompare(right.source_name, 'fr');
  });
}

function sortInventoryItems(items: SourceInventoryItem[]): SourceInventoryItem[] {
  return items
    .slice()
    .sort((left, right) => left.sensor_type_label.localeCompare(right.sensor_type_label, 'fr'));
}

function getSourceStatusLabel(isActive: boolean): string {
  return isActive ? 'Active' : 'Inactive';
}

function getSensorTypeLabel(source: Source): string {
  return source.sensor_type_label.trim() === ''
    ? source.sensor_type_code.toUpperCase()
    : source.sensor_type_label;
}

function InventorySummaryCard({
  items,
  isLoading,
  isError,
}: {
  items: SourceInventoryItem[];
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading) {
    return (
      <Stack spacing={1.5}>
        <Skeleton variant="rounded" height={54} />
        <Skeleton variant="rounded" height={54} />
        <Skeleton variant="rounded" height={54} />
      </Stack>
    );
  }

  if (isError) {
    return (
      <Alert severity="warning">
        Impossible de charger l&apos;inventaire agrege des sources.
      </Alert>
    );
  }

  if (items.length === 0) {
    return (
      <Alert severity="info">
        Aucun inventaire de source n&apos;est disponible pour le moment.
      </Alert>
    );
  }

  return (
    <Stack spacing={1.5}>
      {items.map((item) => (
        <Stack
          key={item.sensor_type_code}
          direction="row"
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            py: 1.25,
            px: 1.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack spacing={0.25}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {item.sensor_type_label}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {item.sensor_type_code.toUpperCase()}
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Chip size="small" color="success" variant="outlined" label={`${item.active_count} active${item.active_count > 1 ? 's' : ''}`} />
            <Chip size="small" color="default" variant="outlined" label={`${item.inactive_count} inactive${item.inactive_count > 1 ? 's' : ''}`} />
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}

export default function SourcesSection() {
  const queryClient = useQueryClient();
  const { sourceColorRegistry } = useSourceColorContext();
  const [editingSourceId, setEditingSourceId] = React.useState<number | null>(null);
  const [draftSourceName, setDraftSourceName] = React.useState('');

  const sourcesQuery = useQuery({
    queryKey: SOURCES_QUERY_KEY,
    queryFn: fetchSources,
    staleTime: 5 * 60 * 1000,
  });
  const inventoryQuery = useQuery({
    queryKey: SOURCES_INVENTORY_QUERY_KEY,
    queryFn: fetchSourceInventory,
    staleTime: 5 * 60 * 1000,
  });

  async function refreshSourceQueries() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: SOURCES_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: SOURCES_INVENTORY_QUERY_KEY }),
    ]);
  }

  const renameMutation = useMutation({
    mutationFn: async ({
      sourceId,
      sourceName,
    }: SourceMutationVariables & { sourceName: string }) => {
      await patchSourceName(sourceId, { source_name: sourceName });
    },
    onSuccess: async () => {
      setEditingSourceId(null);
      setDraftSourceName('');
      await refreshSourceQueries();
    },
  });
  const statusMutation = useMutation({
    mutationFn: async ({
      sourceId,
      isActive,
    }: SourceMutationVariables & { isActive: boolean }) => {
      await patchSourceActiveStatus(sourceId, { is_active: isActive });
    },
    onSuccess: refreshSourceQueries,
  });
  const colorMutation = useMutation({
    mutationFn: async ({
      sourceId,
      color,
    }: SourceMutationVariables & { color: string }) => {
      await patchSourceColor(sourceId, { color });
    },
    onSuccess: refreshSourceQueries,
  });

  const sources = React.useMemo(
    () => sortSources(sourcesQuery.data?.items ?? []),
    [sourcesQuery.data],
  );
  const inventoryItems = React.useMemo(
    () => sortInventoryItems(inventoryQuery.data?.items ?? []),
    [inventoryQuery.data],
  );
  const activeSourcesCount = React.useMemo(
    () => sources.filter((source) => source.is_active).length,
    [sources],
  );
  const inactiveSourcesCount = sources.length - activeSourcesCount;

  const mutationError =
    renameMutation.error ?? statusMutation.error ?? colorMutation.error ?? null;

  function getPendingSourceId(
    mutation: {
      isPending: boolean;
      variables?: SourceMutationVariables;
    },
  ) {
    if (!mutation.isPending) {
      return null;
    }

    return mutation.variables?.sourceId ?? null;
  }

  function isRowBusy(sourceId: number): boolean {
    return [
      getPendingSourceId(renameMutation),
      getPendingSourceId(statusMutation),
      getPendingSourceId(colorMutation),
    ].includes(sourceId);
  }

  function handleStartEditing(source: Source) {
    setEditingSourceId(source.source_id);
    setDraftSourceName(source.source_name);
  }

  function handleCancelEditing() {
    setEditingSourceId(null);
    setDraftSourceName('');
  }

  async function handleSubmitRename(source: Source) {
    const nextSourceName = draftSourceName.trim();

    if (nextSourceName === '' || nextSourceName === source.source_name) {
      handleCancelEditing();
      return;
    }

    await renameMutation.mutateAsync({
      sourceId: source.source_id,
      sourceName: nextSourceName,
    });
  }

  async function handleToggleSourceStatus(source: Source, isActive: boolean) {
    await statusMutation.mutateAsync({
      sourceId: source.source_id,
      isActive,
    });
  }

  async function handleChangeSourceColor(source: Source, color: string) {
    const normalizedColor = color.toUpperCase();

    if (source.color?.toUpperCase() === normalizedColor) {
      return;
    }

    await colorMutation.mutateAsync({
      sourceId: source.source_id,
      color: normalizedColor,
    });
  }

  return (
    <Stack component="section" id="sources" spacing={2} sx={{ scrollMarginTop: 144 }}>
      <Stack spacing={0.5}>
        <Typography component="h2" variant="h5">
          Sources
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Liste des sources actives et inactives, avec renommage, statut et couleur
          modifiables inline.
        </Typography>
      </Stack>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack spacing={0.5}>
                  <Typography component="h3" variant="subtitle2">
                    Inventaire par type de capteur
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Resume simple des sources actives et inactives par famille de capteurs.
                  </Typography>
                </Stack>
                <InventorySummaryCard
                  items={inventoryItems}
                  isLoading={inventoryQuery.isLoading}
                  isError={inventoryQuery.isError}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  sx={{ justifyContent: 'space-between', gap: 1.5, alignItems: 'flex-start' }}
                >
                  <Stack spacing={0.5}>
                    <Typography component="h3" variant="subtitle2">
                      Actions sur les sources
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {activeSourcesCount} active{activeSourcesCount > 1 ? 's' : ''} ·{' '}
                      {inactiveSourcesCount} inactive{inactiveSourcesCount > 1 ? 's' : ''}
                    </Typography>
                  </Stack>
                </Stack>

                {mutationError instanceof Error ? (
                  <Alert severity="warning">
                    Impossible d&apos;enregistrer la modification. {mutationError.message}
                  </Alert>
                ) : null}

                {sourcesQuery.isLoading ? (
                  <Stack spacing={1.5}>
                    <Skeleton variant="rounded" height={68} />
                    <Skeleton variant="rounded" height={68} />
                    <Skeleton variant="rounded" height={68} />
                  </Stack>
                ) : null}

                {sourcesQuery.isError ? (
                  <Alert severity="warning">
                    Impossible de charger la liste des sources.
                    {sourcesQuery.error instanceof Error ? ` (${sourcesQuery.error.message})` : ''}
                  </Alert>
                ) : null}

                {!sourcesQuery.isLoading && !sourcesQuery.isError && sources.length === 0 ? (
                  <Alert severity="info">
                    Aucune source n&apos;a ete retournee par le backend.
                  </Alert>
                ) : null}

                {!sourcesQuery.isLoading && !sourcesQuery.isError && sources.length > 0 ? (
                  <TableContainer sx={{ maxHeight: 560, overflow: 'auto' }}>
                    <Table stickyHeader aria-label="Sources">
                      <TableHead>
                        <TableRow>
                          <TableCell>Source</TableCell>
                          <TableCell>Type de capteur</TableCell>
                          <TableCell>Statut</TableCell>
                          <TableCell>Couleur</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sources.map((source) => {
                          const isEditing = editingSourceId === source.source_id;
                          const isBusy = isRowBusy(source.source_id);
                          const currentColor = getSourceColor({
                            sourceId: source.source_id,
                            sourceName: source.source_name,
                            sourceColor: source.color,
                            sourceColorRegistry,
                          });

                          return (
                            <TableRow key={source.source_id} hover>
                              <TableCell sx={{ minWidth: 260 }}>
                                <Stack spacing={1}>
                                  {isEditing ? (
                                    <React.Fragment>
                                      <TextField
                                        size="small"
                                        value={draftSourceName}
                                        onChange={(event) =>
                                          setDraftSourceName(event.target.value)
                                        }
                                        disabled={renameMutation.isPending}
                                        autoFocus
                                      />
                                      <Stack direction="row" sx={{ gap: 0.5 }}>
                                        <Tooltip title="Enregistrer le nouveau nom">
                                          <span>
                                            <IconButton
                                              size="small"
                                              color="primary"
                                              onClick={() => {
                                                void handleSubmitRename(source);
                                              }}
                                              disabled={
                                                renameMutation.isPending ||
                                                draftSourceName.trim() === ''
                                              }
                                            >
                                              <CheckRoundedIcon fontSize="small" />
                                            </IconButton>
                                          </span>
                                        </Tooltip>
                                        <Tooltip title="Annuler">
                                          <span>
                                            <IconButton
                                              size="small"
                                              onClick={handleCancelEditing}
                                              disabled={renameMutation.isPending}
                                            >
                                              <CloseRoundedIcon fontSize="small" />
                                            </IconButton>
                                          </span>
                                        </Tooltip>
                                      </Stack>
                                    </React.Fragment>
                                  ) : (
                                    <Stack
                                      direction="row"
                                      sx={{ gap: 1, alignItems: 'center', minWidth: 0 }}
                                    >
                                      <Box
                                        sx={{
                                          width: 10,
                                          height: 10,
                                          borderRadius: '999px',
                                          backgroundColor: currentColor,
                                          flexShrink: 0,
                                        }}
                                      />
                                      <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 600 }}
                                        noWrap
                                        title={source.source_name}
                                      >
                                        {source.source_name}
                                      </Typography>
                                      <Tooltip title="Renommer la source">
                                        <span>
                                          <IconButton
                                            size="small"
                                            onClick={() => handleStartEditing(source)}
                                            disabled={isBusy}
                                          >
                                            <EditRoundedIcon fontSize="small" />
                                          </IconButton>
                                        </span>
                                      </Tooltip>
                                      {isBusy ? <CircularProgress size={16} /> : null}
                                    </Stack>
                                  )}
                                </Stack>
                              </TableCell>
                              <TableCell sx={{ minWidth: 180 }}>
                                <Stack spacing={0.25}>
                                  <Typography variant="body2">
                                    {getSensorTypeLabel(source)}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {source.sensor_type_code.toUpperCase()}
                                  </Typography>
                                </Stack>
                              </TableCell>
                              <TableCell sx={{ minWidth: 170 }}>
                                <Stack direction="row" sx={{ gap: 1.25, alignItems: 'center' }}>
                                  <Switch
                                    checked={source.is_active}
                                    onChange={(event) => {
                                      void handleToggleSourceStatus(
                                        source,
                                        event.target.checked,
                                      );
                                    }}
                                    disabled={isBusy}
                                    size="small"
                                  />
                                  <Chip
                                    size="small"
                                    color={source.is_active ? 'success' : 'default'}
                                    variant="outlined"
                                    label={getSourceStatusLabel(source.is_active)}
                                  />
                                </Stack>
                              </TableCell>
                              <TableCell sx={{ minWidth: 150 }}>
                                <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                                  <Box
                                    component="input"
                                    type="color"
                                    value={currentColor}
                                    aria-label={`Couleur de ${source.source_name}`}
                                    onChange={(event) => {
                                      void handleChangeSourceColor(
                                        source,
                                        event.target.value,
                                      );
                                    }}
                                    disabled={isBusy}
                                    sx={{
                                      width: 42,
                                      height: 32,
                                      p: 0,
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      borderRadius: 1,
                                      backgroundColor: 'transparent',
                                      cursor: isBusy ? 'default' : 'pointer',
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
                                  >
                                    {currentColor.toUpperCase()}
                                  </Typography>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
