import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { fetchCtiConfigs, fetchCtiEnrichment } from '../../../../../../shared/cti/ctiApi';
import { ctiQueryKeys } from '../../../../../../shared/cti/queryKeys';
import type { CtiEnrichmentProvider } from '../../../../../../shared/cti/types';
import {
  buildIpTrackerUrl,
  buildTracerouteUrl,
} from '../../../../../../shared/utils/externalLinks';
import CtiAbuseipdb from './enrichment/CtiAbuseipdb';
import CtiGreynoise from './enrichment/CtiGreynoise';
import CtiIpdata from './enrichment/CtiIpdata';
import CtiIpinfo from './enrichment/CtiIpinfo';
import CtiRdap from './enrichment/CtiRdap';
import CtiShodan from './enrichment/CtiShodan';
import CtiVirustotal from './enrichment/CtiVirustotal';
import { PROVIDER_ORDER } from './enrichment/constants';
import type { CtiToolComponentProps } from './enrichment/types';

type CtiEnrichmentDialogProps = {
  actions?: ReactNode;
  ipAddress: string | null;
  leadingContent?: ReactNode;
  open: boolean;
  onClose: () => void;
};

type CtiToolQueryContainerProps = {
  enabled: boolean;
  ipAddress: string | null;
};

function createCtiToolQueryContainer<Provider extends CtiEnrichmentProvider>(
  provider: Provider,
  ToolComponent: ComponentType<CtiToolComponentProps<Provider>>,
): ComponentType<CtiToolQueryContainerProps> {
  return function CtiToolQueryContainer({ enabled, ipAddress }) {
    const query = useQuery({
      queryKey: ctiQueryKeys.enrichment(provider, ipAddress),
      queryFn: () => {
        if (ipAddress == null) {
          throw new Error('Adresse IP absente');
        }

        return fetchCtiEnrichment(provider, ipAddress);
      },
      enabled: enabled && ipAddress != null,
      staleTime: 30 * 1000,
    });

    return <ToolComponent query={query} />;
  };
}

const CTI_TOOL_COMPONENTS: Record<
  CtiEnrichmentProvider,
  ComponentType<CtiToolQueryContainerProps>
> = {
  abuseipdb: createCtiToolQueryContainer('abuseipdb', CtiAbuseipdb),
  greynoise: createCtiToolQueryContainer('greynoise', CtiGreynoise),
  ipdata: createCtiToolQueryContainer('ipdata', CtiIpdata),
  rdap: createCtiToolQueryContainer('rdap', CtiRdap),
  shodan: createCtiToolQueryContainer('shodan', CtiShodan),
  virustotal: createCtiToolQueryContainer('virustotal', CtiVirustotal),
  ipinfo: createCtiToolQueryContainer('ipinfo', CtiIpinfo),
};

export default function CtiEnrichmentDialog({
  actions,
  ipAddress,
  leadingContent,
  open,
  onClose,
}: CtiEnrichmentDialogProps) {
  const [copiedIpAddress, setCopiedIpAddress] = useState<string | null>(null);
  const configsQuery = useQuery({
    queryKey: ctiQueryKeys.configs,
    queryFn: fetchCtiConfigs,
    enabled: open,
    staleTime: 60 * 1000,
  });
  const activeProviders = PROVIDER_ORDER.filter((provider) =>
    configsQuery.data?.items.some((config) => config.code === provider && config.is_active),
  );
  const ipTrackerUrl = ipAddress == null ? null : buildIpTrackerUrl(ipAddress);
  const tracerouteUrl = ipAddress == null ? null : buildTracerouteUrl(ipAddress);
  const isIpCopied = open && ipAddress != null && copiedIpAddress === ipAddress;

  useEffect(() => {
    if (!isIpCopied) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCopiedIpAddress(null);
    }, 1500);

    return () => window.clearTimeout(timeoutId);
  }, [isIpCopied]);

  function handleClose() {
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            width: '100%',
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1.5 }}>
        <Stack
          direction="row"
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}
        >
          <Stack spacing={0.75} sx={{ minWidth: 0 }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
              <PublicRoundedIcon color="primary" fontSize="small" />
              <Typography component="span" variant="h6">
                Enrichissement CTI
              </Typography>
            </Stack>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
              {ipAddress ? (
                <CopyToClipboard
                  text={ipAddress}
                  onCopy={(_, result) => {
                    setCopiedIpAddress(result ? ipAddress : null);
                  }}
                >
                  <Box component="span" sx={{ display: 'inline-flex' }}>
                    <Tooltip title={isIpCopied ? 'Adresse IP copiée' : 'Copier l’adresse IP'}>
                      <Chip
                        clickable
                        icon={<ContentCopyRoundedIcon />}
                        size="small"
                        variant="outlined"
                        label={ipAddress}
                        sx={{ fontFamily: 'monospace' }}
                      />
                    </Tooltip>
                  </Box>
                </CopyToClipboard>
              ) : (
                <Chip
                  size="small"
                  variant="outlined"
                  label="Adresse IP non renseignée"
                  sx={{ fontFamily: 'monospace' }}
                />
              )}
              {ipTrackerUrl ? (
                <Tooltip title="Ouvrir IP Tracker">
                  <IconButton
                    component="a"
                    href={ipTrackerUrl}
                    target="_blank"
                    rel="noreferrer"
                    size="small"
                    aria-label="Ouvrir IP Tracker"
                  >
                    <TravelExploreRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : null}
              {tracerouteUrl ? (
                <Tooltip title="Ouvrir traceroute">
                  <IconButton
                    component="a"
                    href={tracerouteUrl}
                    target="_blank"
                    rel="noreferrer"
                    size="small"
                    aria-label="Ouvrir traceroute"
                  >
                    <RouteRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : null}
              {actions}
            </Stack>
          </Stack>
          <IconButton aria-label="Fermer" onClick={handleClose} size="small">
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2}>
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
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))' },
              gap: 2,
            }}
          >
            {leadingContent != null ? (
              <Box sx={{ gridColumn: '1 / -1' }}>
                {leadingContent}
              </Box>
            ) : null}
            {activeProviders.map((provider) => {
              const CtiToolComponent = CTI_TOOL_COMPONENTS[provider];

              return (
                <CtiToolComponent
                  key={provider}
                  enabled={open}
                  ipAddress={ipAddress}
                />
              );
            })}
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
