import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { fetchCommonIpAlertDetail, fetchCommonIpAlerts } from '../../api/alerts';
import { useSourceColorContext } from '../../internals/source-colors/SourceColorContext';
import type {
  CommonIpAlertDetail,
  CommonIpAlertListItem,
} from '../../types/alerts';
import { formatUtcDateTimeToParis } from '../../utils/dateUtils';
import { getSourceColor } from '../../utils/sourceColors';

const TABLE_DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

function formatAlertDateTime(isoDate: string): string {
  return formatUtcDateTimeToParis(isoDate, TABLE_DATE_TIME_OPTIONS);
}

function buildSourceOptions(items: CommonIpAlertListItem[]): string[] {
  const uniqueSources = new Set<string>();

  items.forEach((item) => {
    item.associated_sources.forEach((sourceName) => {
      uniqueSources.add(sourceName);
    });
  });

  return Array.from(uniqueSources).sort((left, right) => left.localeCompare(right, 'fr'));
}

function filterAlerts(
  items: CommonIpAlertListItem[],
  selectedSources: string[],
): CommonIpAlertListItem[] {
  if (selectedSources.length === 0) {
    return [];
  }

  return items.filter((item) =>
    selectedSources.some((sourceName) => item.associated_sources.includes(sourceName)),
  );
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

type SourceFilterChipsProps = {
  selectedSources: string[];
  sourceOptions: string[];
  onToggleSource: (sourceName: string) => void;
};

function SourceFilterChips({
  selectedSources,
  sourceOptions,
  onToggleSource,
}: SourceFilterChipsProps) {
  const { sourceColorRegistry } = useSourceColorContext();

  if (sourceOptions.length === 0) {
    return null;
  }

  return (
    <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
      {sourceOptions.map((sourceName) => {
        const isSelected = selectedSources.includes(sourceName);
        const color = getSourceColor({
          sourceName,
          sourceColorRegistry,
        });

        return (
          <Chip
            key={sourceName}
            label={sourceName}
            clickable
            onClick={() => onToggleSource(sourceName)}
            variant={isSelected ? 'filled' : 'outlined'}
            sx={(theme) => ({
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: color,
              color: isSelected ? theme.palette.getContrastText(color) : color,
              backgroundColor: isSelected ? `${color} !important` : 'transparent',
              '&.MuiChip-filled': {
                backgroundColor: `${color} !important`,
                color: `${theme.palette.getContrastText(color)} !important`,
              },
              '&.MuiChip-clickable:hover': {
                backgroundColor: isSelected
                  ? `${color} !important`
                  : alpha(color, 0.12),
              },
              '&.MuiChip-clickable:focusVisible': {
                backgroundColor: isSelected
                  ? `${color} !important`
                  : alpha(color, 0.18),
              },
              '& .MuiChip-label': {
                fontWeight: 500,
              },
            })}
          />
        );
      })}
    </Stack>
  );
}

type AlertDetailContentProps = {
  attackerIp: string;
  refreshToken: number;
};

function AlertDetailContent({ attackerIp, refreshToken }: AlertDetailContentProps) {
  const { sourceColorRegistry } = useSourceColorContext();
  const detailQuery = useQuery({
    queryKey: ['commonIpAlertDetail', attackerIp, refreshToken],
    queryFn: () => fetchCommonIpAlertDetail(attackerIp),
    enabled: attackerIp !== '',
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
        Aucun detail source n&apos;est disponible pour cette IP.
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

            return (
              <TableRow key={`${attackerIp}-${source.source_id}`}>
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
                <TableCell>{formatAlertDateTime(source.first_seen_at)}</TableCell>
                <TableCell>{formatAlertDateTime(source.last_seen_at)}</TableCell>
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
  onToggle: (attackerIp: string) => void;
  refreshToken: number;
};

function CommonIpAlertRow({
  alert,
  isExpanded,
  onToggle,
  refreshToken,
}: CommonIpAlertRowProps) {
  return (
    <React.Fragment>
      <TableRow hover>
        <TableCell padding="checkbox">
          <IconButton
            size="small"
            aria-label={isExpanded ? 'Replier le detail' : 'Afficher le detail'}
            onClick={() => onToggle(alert.attacker_ip)}
          >
            {isExpanded ? <KeyboardArrowUpRoundedIcon /> : <KeyboardArrowDownRoundedIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontFamily: 'monospace' }}>{alert.attacker_ip}</TableCell>
        <TableCell>
          <Chip
            size="small"
            variant="outlined"
            label={formatSourceCount(alert.associated_sources.length)}
          />
        </TableCell>
        <TableCell>{formatAlertDateTime(alert.first_seen_at)}</TableCell>
        <TableCell>{formatAlertDateTime(alert.last_seen_at)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ py: 0 }} colSpan={5}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography component="h4" variant="subtitle2">
                Detail de l&apos;alerte {alert.attacker_ip}
              </Typography>
              <AlertDetailContent
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
  const [refreshToken, setRefreshToken] = React.useState(0);
  const alertsQuery = useQuery({
    queryKey: ['commonIpAlerts', refreshToken],
    queryFn: fetchCommonIpAlerts,
  });
  const [selectedSources, setSelectedSources] = React.useState<string[]>([]);
  const [expandedIp, setExpandedIp] = React.useState<string | null>(null);
  const [hasUserTouchedSourceFilter, setHasUserTouchedSourceFilter] =
    React.useState(false);

  const sourceOptions = React.useMemo(
    () => buildSourceOptions(alertsQuery.data?.items ?? []),
    [alertsQuery.data],
  );
  const filteredAlerts = React.useMemo(
    () => filterAlerts(alertsQuery.data?.items ?? [], selectedSources),
    [alertsQuery.data, selectedSources],
  );

  React.useEffect(() => {
    if (
      expandedIp != null &&
      !filteredAlerts.some((item) => item.attacker_ip === expandedIp)
    ) {
      setExpandedIp(null);
    }
  }, [expandedIp, filteredAlerts]);

  React.useEffect(() => {
    setSelectedSources((currentSelection) => {
      const validSelection = currentSelection.filter((sourceName) =>
        sourceOptions.includes(sourceName),
      );

      if (!hasUserTouchedSourceFilter) {
        return sourceOptions;
      }

      return validSelection;
    });
  }, [hasUserTouchedSourceFilter, sourceOptions]);

  function handleToggleDetail(attackerIp: string) {
    setExpandedIp((currentIp) => (currentIp === attackerIp ? null : attackerIp));
  }

  function handleRefresh() {
    setRefreshToken((currentToken) => currentToken + 1);
  }

  function handleToggleSource(sourceName: string) {
    setHasUserTouchedSourceFilter(true);
    setSelectedSources((currentSelection) =>
      currentSelection.includes(sourceName)
        ? currentSelection.filter((item) => item !== sourceName)
        : [...currentSelection, sourceName],
    );
  }

  const hasRemoteItems = (alertsQuery.data?.items.length ?? 0) > 0;

  return (
    <Stack component="section" id="alerts" spacing={2} sx={{ scrollMarginTop: 144 }}>
      <Stack spacing={0.5}>
        <Typography component="h2" variant="h5">
          Alertes IP communes
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Sélectionnez des IP partagees entre plusieurs sources, avec detail inline par source.
        </Typography>
      </Stack>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2.5}>
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              sx={{ alignItems: { lg: 'center' }, justifyContent: 'space-between', gap: 2 }}
            >
              <Stack spacing={0.5}>
                <Typography component="h3" variant="subtitle2">
                  Liste des alertes
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Sélectionnez une ou plusieurs sources pour filtrer la liste.
                </Typography>
              </Stack>
              <Button
                variant="contained"
                size="small"
                startIcon={<RefreshRoundedIcon fontSize="small" />}
                onClick={handleRefresh}
              >
                Rafraîchir
              </Button>
            </Stack>
            <SourceFilterChips
              selectedSources={selectedSources}
              sourceOptions={sourceOptions}
              onToggleSource={handleToggleSource}
            />
            <Divider />
            {alertsQuery.isLoading ? <LoadingTableState /> : null}
            {alertsQuery.isError ? (
              <Alert severity="warning">
                Impossible de charger la liste des alertes IP communes.
              </Alert>
            ) : null}
            {!alertsQuery.isLoading && !alertsQuery.isError && !hasRemoteItems ? (
              <Alert severity="info">
                Aucune alerte IP commune n&apos;a ete detectee.
              </Alert>
            ) : null}
            {!alertsQuery.isLoading &&
            !alertsQuery.isError &&
            hasRemoteItems &&
            filteredAlerts.length === 0 ? (
              <Alert severity="info">
                Aucune alerte ne correspond aux sources selectionnees.
              </Alert>
            ) : null}
            {!alertsQuery.isLoading &&
            !alertsQuery.isError &&
            filteredAlerts.length > 0 ? (
              <Stack spacing={1.5}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {filteredAlerts.length} alerte{filteredAlerts.length > 1 ? 's' : ''}{' '}
                  visible{filteredAlerts.length > 1 ? 's' : ''}
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
                    sx={{ minWidth: 760 }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell />
                        <TableCell>IP attaquante</TableCell>
                        <TableCell>Sources concernees</TableCell>
                        <TableCell>Premier signalement</TableCell>
                        <TableCell>Dernier signalement</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredAlerts.map((alert) => (
                        <CommonIpAlertRow
                          key={alert.attacker_ip}
                          alert={alert}
                          isExpanded={expandedIp === alert.attacker_ip}
                          onToggle={handleToggleDetail}
                          refreshToken={refreshToken}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Stack>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
