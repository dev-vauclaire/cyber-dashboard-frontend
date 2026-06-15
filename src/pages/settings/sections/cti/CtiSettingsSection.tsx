import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  activateCtiConfig,
  deactivateCtiConfig,
  deleteCtiApiKey,
  fetchCtiConfigs,
  patchCtiConfig,
} from '../../../../api/cti';
import ValidationStatusChip from '../../components/ValidationStatusChip';

type CtiAction = {
  code: string;
  action: 'activate' | 'deactivate' | 'delete-key' | 'save-key';
  apiKey?: string;
};

export default function CtiSettingsSection() {
  const queryClient = useQueryClient();
  const configsQuery = useQuery({ queryKey: ['ctiConfigs'], queryFn: fetchCtiConfigs });
  const [apiKeys, setApiKeys] = React.useState<Record<string, string>>({});
  const mutation = useMutation({
    mutationFn: async ({ code, action, apiKey }: CtiAction) => {
      if (action === 'activate') return activateCtiConfig(code);
      if (action === 'deactivate') return deactivateCtiConfig(code);
      if (action === 'delete-key') return deleteCtiApiKey(code);
      return patchCtiConfig(code, { api_key: apiKey });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ctiConfigs'] }),
  });

  return (
    <Stack spacing={2}>
      {mutation.isError ? <Alert severity="warning">{mutation.error.message}</Alert> : null}
      {configsQuery.isError ? (
        <Alert severity="warning">Impossible de charger les configurations CTI.</Alert>
      ) : null}
      <Grid container spacing={2}>
        {(configsQuery.data?.items ?? []).map((config) => (
          <Grid key={config.code} size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 1 }}>
                    <Typography variant="subtitle2">{config.label}</Typography>
                    <ValidationStatusChip status={config.last_validation_status} />
                  </Stack>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {config.has_api_key
                      ? `Clé enregistrée ${config.api_key_hint ?? ''}`
                      : 'Aucune clé enregistrée'}
                  </Typography>
                  {config.is_key_required ? (
                    <TextField
                      size="small"
                      label="Nouvelle clé API"
                      type="password"
                      value={apiKeys[config.code] ?? ''}
                      onChange={(event) =>
                        setApiKeys((current) => ({
                          ...current,
                          [config.code]: event.target.value,
                        }))
                      }
                    />
                  ) : null}
                  {config.last_validation_error ? (
                    <Alert severity="warning">{config.last_validation_error}</Alert>
                  ) : null}
                  <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
                    {config.is_key_required ? (
                      <Button
                        size="small"
                        startIcon={<SaveRoundedIcon fontSize="small" />}
                        disabled={(apiKeys[config.code] ?? '').trim() === ''}
                        onClick={() =>
                          mutation.mutate({
                            code: config.code,
                            action: 'save-key',
                            apiKey: apiKeys[config.code],
                          })
                        }
                      >
                        Enregistrer
                      </Button>
                    ) : null}
                    <Button
                      size="small"
                      variant={config.is_active ? 'outlined' : 'contained'}
                      onClick={() =>
                        mutation.mutate({
                          code: config.code,
                          action: config.is_active ? 'deactivate' : 'activate',
                        })
                      }
                    >
                      {config.is_active ? 'Désactiver' : 'Activer'}
                    </Button>
                    {config.has_api_key ? (
                      <Button
                        size="small"
                        color="warning"
                        startIcon={<DeleteOutlineRoundedIcon fontSize="small" />}
                        onClick={() =>
                          mutation.mutate({ code: config.code, action: 'delete-key' })
                        }
                      >
                        Supprimer la clé
                      </Button>
                    ) : null}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
