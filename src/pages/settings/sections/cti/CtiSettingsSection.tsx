import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  activateCtiConfig,
  deactivateCtiConfig,
  deleteCtiApiKey,
  fetchCtiConfigs,
  patchCtiConfig,
} from '../../../../shared/cti/ctiApi';
import { ctiQueryKeys } from '../../../../shared/cti/queryKeys';
import type { CtiConfig } from '../../../../shared/cti/types';
import CtiConfigCard from './components/CtiConfigCard';
import DeleteCtiApiKeyDialog from './components/DeleteCtiApiKeyDialog';
import type { CtiAction } from './types/ctiSettingsTypes';

function getSuccessMessage(action: CtiAction): string {
  if (action.action === 'validate') {
    return `${action.label} a été validé avec succès.`;
  }
  if (action.action === 'activate') {
    return `${action.label} a été activé.`;
  }
  if (action.action === 'deactivate') {
    return `${action.label} a été désactivé.`;
  }
  return `La clé API de ${action.label} a été supprimée.`;
}

export default function CtiSettingsSection() {
  const queryClient = useQueryClient();
  const configsQuery = useQuery({
    queryKey: ctiQueryKeys.configs,
    queryFn: fetchCtiConfigs,
  });
  const [apiKeys, setApiKeys] = React.useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [keyToDelete, setKeyToDelete] = React.useState<CtiConfig | null>(null);

  const mutation = useMutation({
    mutationFn: async (input: CtiAction) => {
      if (input.action === 'validate') {
        const normalizedApiKey = input.apiKey?.trim();

        if (normalizedApiKey) {
          await patchCtiConfig(input.code, { api_key: normalizedApiKey });
        }

        return activateCtiConfig(input.code);
      }
      if (input.action === 'activate') {
        return activateCtiConfig(input.code);
      }
      if (input.action === 'deactivate') {
        return deactivateCtiConfig(input.code);
      }
      return deleteCtiApiKey(input.code);
    },
    onMutate: () => {
      setSuccessMessage(null);
    },
    onSuccess: (_data, variables) => {
      setSuccessMessage(getSuccessMessage(variables));

      if (variables.action === 'validate' || variables.action === 'delete-key') {
        setApiKeys((current) => {
          const next = { ...current };
          delete next[variables.code];
          return next;
        });
      }

      if (variables.action === 'delete-key') {
        setKeyToDelete(null);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ctiQueryKeys.configs });
    },
  });

  function handleDeleteCancel() {
    if (!mutation.isPending) {
      mutation.reset();
      setKeyToDelete(null);
    }
  }

  function handleDeleteConfirm() {
    if (keyToDelete) {
      mutation.mutate({
        action: 'delete-key',
        code: keyToDelete.code,
        label: keyToDelete.label,
      });
    }
  }

  if (configsQuery.isLoading) {
    return (
      <Grid container spacing={2} aria-label="Chargement des configurations CTI">
        {[0, 1, 2, 3].map((item) => (
          <Grid key={item} size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" height={280} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (configsQuery.isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => void configsQuery.refetch()}>
            Réessayer
          </Button>
        }
      >
        Impossible de charger les configurations CTI.
      </Alert>
    );
  }

  const configs = configsQuery.data?.items ?? [];

  if (configs.length === 0) {
    return <Alert severity="info">Aucun fournisseur CTI n&apos;est configuré.</Alert>;
  }

  return (
    <Stack component="section" spacing={2} aria-labelledby="cti-settings-title">
      <Stack spacing={0.5}>
        <Typography component="h2" variant="h5" id="cti-settings-title">
          Fournisseurs CTI
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Configure, valide et active indépendamment chaque fournisseur d&apos;enrichissement.
        </Typography>
      </Stack>

      {successMessage ? (
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      ) : null}

      {mutation.isError && mutation.variables?.action !== 'delete-key' ? (
        <Alert severity="error">
          Impossible d&apos;effectuer cette action.{' '}
          {mutation.error instanceof Error ? mutation.error.message : ''}
        </Alert>
      ) : null}

      <Grid container spacing={2}>
        {configs.map((config) => {
          const isCurrentConfig =
            mutation.isPending && mutation.variables?.code === config.code;

          return (
            <Grid key={config.code} size={{ xs: 12, md: 6 }}>
              <CtiConfigCard
                config={config}
                draftApiKey={apiKeys[config.code] ?? ''}
                isBusy={mutation.isPending}
                pendingAction={isCurrentConfig ? mutation.variables.action : null}
                onApiKeyChange={(value) =>
                  setApiKeys((current) => ({ ...current, [config.code]: value }))
                }
                onValidate={(apiKey) =>
                  mutation.mutate({
                    action: 'validate',
                    apiKey,
                    code: config.code,
                    label: config.label,
                  })
                }
                onToggleActive={() =>
                  mutation.mutate({
                    action: config.is_active ? 'deactivate' : 'activate',
                    code: config.code,
                    label: config.label,
                  })
                }
                onDeleteKey={() => {
                  mutation.reset();
                  setSuccessMessage(null);
                  setKeyToDelete(config);
                }}
              />
            </Grid>
          );
        })}
      </Grid>

      <DeleteCtiApiKeyDialog
        open={keyToDelete !== null}
        providerLabel={keyToDelete?.label ?? ''}
        isDeleting={
          mutation.isPending && mutation.variables?.action === 'delete-key'
        }
        errorMessage={
          mutation.isError && mutation.variables?.action === 'delete-key'
            ? mutation.error.message
            : null
        }
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </Stack>
  );
}
