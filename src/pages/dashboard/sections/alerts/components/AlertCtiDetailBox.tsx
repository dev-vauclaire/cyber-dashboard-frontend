import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { CommonIpAlertDetail, CommonIpAlertSourceDetail } from '../types/alertTypes';
import { useSourceColorContext } from '../../../../../shared/sources/providers/sourceColorContext';
import { getSourceColor } from '../../../../../shared/sources/utils/sourceColors';
import CtiProviderPieChart from './cti/enrichment/CtiProviderPieChart';

type AlertCtiDetailBoxProps = {
  detail: CommonIpAlertDetail | undefined;
  isError: boolean;
  isLoading: boolean;
};

{/* Calcul la durée d'observation d'une alerte à partir de ses sources */}
function formatDurationFromSources(sources: CommonIpAlertSourceDetail[]): string {
  if (sources.length === 0) {
    return 'Indisponible';
  }

  const timestamps = sources.flatMap((source) => [
    Date.parse(source.first_seen_at),
    Date.parse(source.last_seen_at),
  ]);
  const validTimestamps = timestamps.filter((timestamp) => !Number.isNaN(timestamp));

  if (validTimestamps.length === 0) {
    return 'Indisponible';
  }

  const durationMs = Math.max(...validTimestamps) - Math.min(...validTimestamps);
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  if (durationMs < minuteMs) {
    return 'Signal ponctuel';
  }

  if (durationMs < hourMs) {
    return `${Math.ceil(durationMs / minuteMs)} min`;
  }

  if (durationMs < dayMs) {
    const hours = Math.floor(durationMs / hourMs);
    const minutes = Math.round((durationMs % hourMs) / minuteMs);

    return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
  }

  const days = Math.floor(durationMs / dayMs);
  const hours = Math.round((durationMs % dayMs) / hourMs);

  return hours > 0 ? `${days} j ${hours} h` : `${days} j`;
}

{/* Calcule le pourcentage d'occurrences d'une source par rapport au total observé */}
function formatHitShare(hitCount: number, totalHits: number): string {
  if (totalHits <= 0) {
    return '0 %';
  }

  return `${((hitCount / totalHits) * 100).toLocaleString('fr-FR', {
    maximumFractionDigits: 1,
  })} %`;
}

export default function AlertCtiDetailBox({
  detail,
  isError,
  isLoading,
}: AlertCtiDetailBoxProps) {
  const { sourceColorRegistry } = useSourceColorContext();
  const sources = detail?.sources ?? [];
  const totalHits = sources.reduce((sum, source) => sum + source.hit_count, 0);
  const sortedSources = [...sources].sort((sourceA, sourceB) => {
    if (sourceA.hit_count !== sourceB.hit_count) {
      return sourceB.hit_count - sourceA.hit_count;
    }

    return sourceA.source_name.localeCompare(sourceB.source_name);
  });
  const sourceHitChartItems = sortedSources.map((source) => ({
    id: String(source.source_id),
    label: source.source_name,
    value: source.hit_count,
  }));
  const sourceHitChartColors = sortedSources.map((source) =>
    getSourceColor({
      sourceId: source.source_id,
      sourceName: source.source_name,
      sourceColorRegistry,
    }),
  );
  const observationDuration = formatDurationFromSources(sources);
  const hasSourceContext = !isLoading && !isError && sources.length > 0;

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ justifyContent: 'space-between', gap: 1, alignItems: { sm: 'center' } }}
        >
          <Stack spacing={0.25}>
            <Typography component="h3" variant="subtitle2">
              Synthèse utile avant lecture des enrichissements CTI externes
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
            {isLoading ? (
              <Chip size="small" variant="outlined" label="Chargement" />
            ) : null}
            {!isLoading && !isError && sources.length === 0 ? (
              <Chip size="small" variant="outlined" label="Contexte indisponible" />
            ) : null}
            {hasSourceContext ? (
              <Chip
                size="small"
                color="primary"
                variant="outlined"
                label={`${totalHits.toLocaleString('fr-FR')} occurrence${totalHits > 1 ? 's' : ''} au total`}
              />
            ) : null}
            {hasSourceContext ? (
              <Chip
                size="small"
                variant="outlined"
                label={`Durée observée ${observationDuration}`}
              />
            ) : null}
          </Stack>
        </Stack>

        {hasSourceContext ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(260px, 0.9fr) 1fr' },
              gap: 2,
              alignItems: 'start',
            }}
          >
            <CtiProviderPieChart
              colors={sourceHitChartColors}
              items={sourceHitChartItems}
              title="Répartition des occurrences par source"
            />
            <Stack spacing={1}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Détail par source : nom, dernière vue et part des occurrences sur le total observé.
              </Typography>
              <Stack
                spacing={0.75}
                sx={{
                  maxHeight: 242,
                  overflowY: 'auto',
                  pr: 0.5,
                }}
              >
                {sortedSources.map((source, index) => (
                  <Box
                    key={source.source_id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 1,
                      alignItems: 'center',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      px: 1,
                      py: 0.75,
                    }}
                  >
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '999px',
                        bgcolor: sourceHitChartColors[index],
                      }}
                    />
                    <Typography variant="body2" noWrap>
                      {source.source_name}
                    </Typography>
                  </Box>
                    <Typography variant="body2" noWrap>
                      {new Date(source.last_seen_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                    </Typography>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={formatHitShare(source.hit_count, totalHits)}
                    />
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Box>
        ) : null}

        {isLoading ? <Skeleton variant="rounded" height={86} /> : null}
        {isError ? (
          <Alert severity="warning">
            Le détail source de l&apos;alerte est indisponible pour le moment.
          </Alert>
        ) : null}
        {!isLoading && !isError && sources.length === 0 ? (
          <Alert severity="info">Aucun contexte source n&apos;est disponible.</Alert>
        ) : null}
      </Stack>
    </Box>
  );
}
