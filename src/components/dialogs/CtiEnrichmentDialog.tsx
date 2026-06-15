import { useQueries, useQuery } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
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

function getRelevantEntries(provider: CtiEnrichmentProvider, payload: Record<string, unknown>) {
  const keysByProvider: Record<CtiEnrichmentProvider, string[]> = {
    virustotal: ['reputation', 'country_code', 'as_owner', 'last_analysis_stats'],
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
                ) : null}
              </Stack>
            );
          })}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
