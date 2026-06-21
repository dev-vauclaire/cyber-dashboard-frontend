import type { ReactNode } from 'react';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { CtiEnrichmentProvider } from '../../../../../../../shared/cti/types';
import { getCtiToolLogo } from '../../../../../../../shared/utils/logo';
import { PROVIDER_LABELS } from './constants';

function getProviderStatus(query: { isError: boolean; isLoading: boolean }) {
  if (query.isLoading) {
    return {
      color: 'default',
      label: 'Chargement',
    } as const;
  }

  if (query.isError) {
    return {
      color: 'warning',
      label: 'Erreur',
    } as const;
  }

  return {
    color: 'success',
    label: 'Disponible',
  } as const;
}

export default function CtiProviderCard({
  children,
  indicatorCount,
  provider,
  query,
}: {
  children: ReactNode;
  indicatorCount: number;
  provider: CtiEnrichmentProvider;
  query: { isError: boolean; isLoading: boolean };
}) {
  const status = getProviderStatus(query);
  const providerLogo = getCtiToolLogo(provider);

  return (
    <Card variant="outlined" sx={{ height: '100%', borderRadius: 1 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}
          >
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'primary.main',
                  bgcolor: 'transparent',
                  flexShrink: 0,
                }}
              >
                {providerLogo ? (
                  <Box
                    component="img"
                    src={providerLogo}
                    alt={`${PROVIDER_LABELS[provider]} logo`}
                    sx={{
                      width: 24,
                      height: 24,
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <SecurityRoundedIcon fontSize="small" />
                )}
              </Box>
              <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap>
                  {PROVIDER_LABELS[provider]}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {indicatorCount} indicateurs
                </Typography>
              </Stack>
            </Stack>
            <Chip size="small" color={status.color} variant="outlined" label={status.label} />
          </Stack>

          <Divider />

          {query.isLoading ? (
            <Stack spacing={1}>
              <Skeleton variant="rounded" height={36} />
              <Skeleton variant="rounded" height={36} />
              <Skeleton variant="rounded" height={36} />
            </Stack>
          ) : null}

          {query.isError ? (
            <Alert severity="warning">
              Données indisponibles pour {PROVIDER_LABELS[provider]}.
            </Alert>
          ) : null}

          {!query.isLoading && !query.isError ? children : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
