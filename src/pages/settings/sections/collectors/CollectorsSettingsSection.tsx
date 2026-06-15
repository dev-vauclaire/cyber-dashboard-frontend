import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import {
  activateAttacksCollectorConfig,
  createAttacksCollectorConfig,
  deactivateAttacksCollectorConfig,
  deleteAttacksCollectorApiKey,
  deleteAttacksCollectorEmail,
  fetchAttacksCollectorConfigs,
  patchAttacksCollectorConfig,
  requestAttacksCollectorInventory,
} from '../../../../api/collectors';
import type {
  AttacksCollectorConfigPayload,
  CollectorType,
} from '../../../../types/collectors';
import CollectorConfigCard from './CollectorConfigCard';

type CollectorAction = {
  action: string;
  id?: number;
  payload?: AttacksCollectorConfigPayload;
};

export default function CollectorsSettingsSection() {
  const queryClient = useQueryClient();
  const configsQuery = useQuery({
    queryKey: ['attacksCollectorConfigs'],
    queryFn: fetchAttacksCollectorConfigs,
  });
  const [draft, setDraft] = React.useState<
    Required<Pick<AttacksCollectorConfigPayload, 'collector_type' | 'name'>> &
      AttacksCollectorConfigPayload
  >({
    name: '',
    collector_type: 'ogo',
  });
  const mutation = useMutation({
    mutationFn: async ({ action, id, payload }: CollectorAction) => {
      if (action === 'create') return createAttacksCollectorConfig(draft);
      if (action === 'save' && id != null && payload != null) {
        return patchAttacksCollectorConfig(id, payload);
      }
      if (action === 'activate' && id != null) return activateAttacksCollectorConfig(id);
      if (action === 'deactivate' && id != null) return deactivateAttacksCollectorConfig(id);
      if (action === 'delete-key' && id != null) return deleteAttacksCollectorApiKey(id);
      if (action === 'delete-email' && id != null) return deleteAttacksCollectorEmail(id);
      if (action === 'inventory' && id != null) return requestAttacksCollectorInventory(id);
      throw new Error('Action collecteur invalide');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attacksCollectorConfigs'] }),
  });

  return (
    <Stack spacing={2}>
      {mutation.isError ? <Alert severity="warning">{mutation.error.message}</Alert> : null}
      {configsQuery.isError ? (
        <Alert severity="warning">Impossible de charger les collecteurs.</Alert>
      ) : null}
      <Card variant="outlined">
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Nom"
                value={draft.name}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, name: event.target.value }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  label="Type"
                  value={draft.collector_type}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      collector_type: event.target.value as CollectorType,
                    }))
                  }
                >
                  <MenuItem value="ogo">OGO</MenuItem>
                  <MenuItem value="serenicity">Serenicity</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => mutation.mutate({ action: 'create' })}
              >
                Créer
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Grid container spacing={2}>
        {(configsQuery.data?.items ?? []).map((config) => (
          <Grid key={config.id} size={{ xs: 12, md: 6 }}>
            <CollectorConfigCard config={config} onAction={(input) => mutation.mutate(input)} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
