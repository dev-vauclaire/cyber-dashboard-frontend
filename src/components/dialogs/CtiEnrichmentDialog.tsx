import { useQueries, useQuery } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PieChart } from '@mui/x-charts/PieChart';
import { fetchCtiConfigs, fetchCtiEnrichment } from '../../api/cti';
import type { CtiEnrichmentProvider } from '../../types/cti';

type CtiEnrichmentDialogProps = {
  ipAddress: string | null;
  open: boolean;
  onClose: () => void;
};

const PROVIDER_ORDER: CtiEnrichmentProvider[] = [
  'virustotal',
  'abuseipdb',
  'ipdata',
  'rdap',
  'greynoise',
  'shodan',
];

const PROVIDER_LABELS: Record<CtiEnrichmentProvider, string> = {
  abuseipdb: 'AbuseIPDB',
  greynoise: 'GreyNoise',
  ipdata: 'IPData',
  rdap: 'RDAP',
  shodan: 'Shodan',
  virustotal: 'VirusTotal',
};

const VIRUS_TOTAL_STAT_LABELS: Record<string, string> = {
  malicious: 'Malicious',
  suspicious: 'Suspicious',
  harmless: 'Harmless',
  undetected: 'Undetected',
  timeout: 'Timeout',
};

const VIRUS_TOTAL_STAT_COLORS = ['#D32F2F', '#ED6C02', '#2E7D32', '#64748B', '#7B1FA2'];
const ABUSEIPDB_CATEGORY_COLORS = ['#0B6BCB', '#9C27B0', '#ED6C02', '#2E7D32', '#D32F2F', '#64748B'];

type ChartItem = {
  id: string;
  label: string;
  value: number;
};

function formatValue(value: unknown): string {
  if (value == null || value === '') {
    return 'Non disponible';
  }
  if (Array.isArray(value)) {
    return value.length === 0 ? 'Non disponible' : value.join(', ');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value != null && !Array.isArray(value);
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  return null;
}

function buildVirusTotalChartData(payload: Record<string, unknown>): ChartItem[] {
  const stats = payload.last_analysis_stats;

  if (!isRecord(stats)) {
    return [];
  }

  return Object.entries(VIRUS_TOTAL_STAT_LABELS)
    .map(([key, label]) => ({
      id: key,
      label,
      value: coerceNumber(stats[key]) ?? 0,
    }))
    .filter((item) => item.value > 0);
}

function buildAbuseIpdbCategoryChartData(payload: Record<string, unknown>): ChartItem[] {
  const categoryPercentages = payload.category_percentages;

  if (!Array.isArray(categoryPercentages)) {
    return [];
  }

  return categoryPercentages
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const categoryCode = coerceNumber(item.category_code);
      const percentage = coerceNumber(item.percentage);

      if (categoryCode == null || percentage == null || percentage <= 0) {
        return null;
      }

      return {
        id: String(categoryCode),
        label: `Catégorie ${categoryCode}`,
        value: percentage,
      };
    })
    .filter((item): item is ChartItem => item != null);
}

function getProviderChartData(
  provider: CtiEnrichmentProvider,
  payload: Record<string, unknown>,
): { colors: string[]; items: ChartItem[]; title: string } | null {
  if (provider === 'virustotal') {
    return {
      colors: VIRUS_TOTAL_STAT_COLORS,
      items: buildVirusTotalChartData(payload),
      title: 'Répartition des analyses',
    };
  }

  if (provider === 'abuseipdb') {
    return {
      colors: ABUSEIPDB_CATEGORY_COLORS,
      items: buildAbuseIpdbCategoryChartData(payload),
      title: 'Catégories de signalement',
    };
  }

  return null;
}

function ProviderPieChart({
  colors,
  items,
  title,
}: {
  colors: string[];
  items: ChartItem[];
  title: string;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Stack spacing={1}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <PieChart
          colors={colors}
          height={220}
          width={280}
          margin={{ left: 18, right: 18, top: 18, bottom: 18 }}
          series={[
            {
              data: items,
              innerRadius: 48,
              outerRadius: 82,
              paddingAngle: 1,
              highlightScope: { fade: 'global', highlight: 'item' },
            },
          ]}
        />
      </Box>
    </Stack>
  );
}

function getRelevantEntries(provider: CtiEnrichmentProvider, payload: Record<string, unknown>) {
  const keysByProvider: Record<CtiEnrichmentProvider, string[]> = {
    virustotal: ['reputation', 'country_code', 'as_owner'],
    abuseipdb: ['abuse_confidence_score', 'total_reports', 'last_reported_at', 'isp'],
    ipdata: ['country_name', 'asn_name', 'is_threat'],
    rdap: ['start_address', 'end_address', 'name', 'country', 'abuse_contact_email'],
    greynoise: ['classification', 'name', 'last_seen', 'link'],
    shodan: [
      'organization',
      'asn',
      'country_name',
      'exposed_ports',
      'known_vulnerabilities_count',
      'last_observed_at',
    ],
  };

  return keysByProvider[provider].map((key) => [key, payload[key]] as const);
}

export default function CtiEnrichmentDialog({
  ipAddress,
  open,
  onClose,
}: CtiEnrichmentDialogProps) {
  const configsQuery = useQuery({
    queryKey: ['ctiConfigs'],
    queryFn: fetchCtiConfigs,
    enabled: open,
    staleTime: 60 * 1000,
  });
  const activeProviders = PROVIDER_ORDER.filter((provider) =>
    configsQuery.data?.items.some((config) => config.code === provider && config.is_active),
  );
  const enrichmentQueries = useQueries({
    queries: activeProviders.map((provider) => ({
      queryKey: ['ctiEnrichment', provider, ipAddress],
      queryFn: () => fetchCtiEnrichment(provider, ipAddress!),
      enabled: open && ipAddress != null,
      staleTime: 30 * 1000,
    })),
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Enrichissement CTI · {ipAddress}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {configsQuery.isLoading ? <Skeleton variant="rounded" height={120} /> : null}
          {configsQuery.isError ? (
            <Alert severity="warning">
              Impossible de charger la configuration CTI active.
            </Alert>
          ) : null}
          {!configsQuery.isLoading && !configsQuery.isError && activeProviders.length === 0 ? (
            <Alert severity="info">
              Aucun fournisseur CTI actif. Active un outil CTI dans les paramètres.
            </Alert>
          ) : null}
          {activeProviders.map((provider, index) => {
            const query = enrichmentQueries[index];
            const payload = (query.data ?? {}) as Record<string, unknown>;
            const chartData = getProviderChartData(provider, payload);

            return (
              <Stack
                key={provider}
                spacing={1}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5 }}
              >
                <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 1 }}>
                  <Typography variant="subtitle2">{PROVIDER_LABELS[provider]}</Typography>
                  <Chip
                    size="small"
                    color={query.isError ? 'warning' : 'success'}
                    variant="outlined"
                    label={query.isError ? 'Erreur' : 'Actif'}
                  />
                </Stack>
                <Divider />
                {query.isLoading ? <Skeleton variant="rounded" height={74} /> : null}
                {query.isError ? (
                  <Alert severity="warning">
                    Données indisponibles pour {PROVIDER_LABELS[provider]}.
                  </Alert>
                ) : null}
                {!query.isLoading && !query.isError ? (
                  <Stack spacing={1.5}>
                    {chartData != null ? (
                      <ProviderPieChart
                        colors={chartData.colors}
                        items={chartData.items}
                        title={chartData.title}
                      />
                    ) : null}
                    <Stack spacing={0.75}>
                      {getRelevantEntries(provider, payload).map(([key, value]) => (
                        <Stack
                          key={key}
                          direction={{ xs: 'column', sm: 'row' }}
                          sx={{ justifyContent: 'space-between', gap: 1 }}
                        >
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {key}
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {formatValue(value)}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                ) : null}
              </Stack>
            );
          })}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
