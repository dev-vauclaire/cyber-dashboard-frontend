import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import {
  activateSmtpConfig,
  deactivateSmtpConfig,
  deleteSmtpPassword,
  fetchSmtpConfig,
  patchSmtpConfig,
  testSmtpConfig,
} from './api/smtpApi';
import { smtpQueryKeys } from './queryKeys';
import type { SmtpConfigUpdatePayload } from './types/smtpTypes';
import ValidationStatusChip from '../../../../shared/components/ValidationStatusChip';

type SmtpAction = 'activate' | 'deactivate' | 'delete-password' | 'save' | 'test';

export default function EmailSettingsSection() {
  const queryClient = useQueryClient();
  const smtpQuery = useQuery({ queryKey: smtpQueryKeys.config, queryFn: fetchSmtpConfig });
  const [form, setForm] = React.useState<SmtpConfigUpdatePayload>({});
  const mutation = useMutation({
    mutationFn: async (action: SmtpAction) => {
      if (action === 'activate') return activateSmtpConfig();
      if (action === 'deactivate') return deactivateSmtpConfig();
      if (action === 'delete-password') return deleteSmtpPassword();
      if (action === 'test') return testSmtpConfig();
      return patchSmtpConfig(form);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: smtpQueryKeys.config }),
  });

  React.useEffect(() => {
    if (smtpQuery.data == null) return;
    setForm({
      smtp_host: smtpQuery.data.smtp_host,
      smtp_port: smtpQuery.data.smtp_port,
      smtp_user: smtpQuery.data.smtp_user,
      smtp_from: smtpQuery.data.smtp_from,
      smtp_from_name: smtpQuery.data.smtp_from_name,
      auto_email_enabled: smtpQuery.data.auto_email_enabled,
    });
  }, [smtpQuery.data]);

  function updateForm<K extends keyof SmtpConfigUpdatePayload>(
    key: K,
    value: SmtpConfigUpdatePayload[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          {mutation.isError ? <Alert severity="warning">{mutation.error.message}</Alert> : null}
          {smtpQuery.isError ? (
            <Alert severity="warning">Impossible de charger la configuration SMTP.</Alert>
          ) : null}
          {smtpQuery.data ? (
            <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
              <Chip
                size="small"
                color={smtpQuery.data.is_active ? 'success' : 'default'}
                label={smtpQuery.data.is_active ? 'SMTP actif' : 'SMTP inactif'}
              />
              <ValidationStatusChip status={smtpQuery.data.last_validation_status} />
              {smtpQuery.data.has_smtp_password ? (
                <Chip size="small" label={`Mot de passe ${smtpQuery.data.smtp_password_hint}`} />
              ) : null}
            </Stack>
          ) : null}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Hôte SMTP"
                value={form.smtp_host ?? ''}
                onChange={(event) => updateForm('smtp_host', event.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Port SMTP"
                value={form.smtp_port ?? ''}
                onChange={(event) => updateForm('smtp_port', Number(event.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Utilisateur"
                value={form.smtp_user ?? ''}
                onChange={(event) => updateForm('smtp_user', event.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Adresse d'expédition"
                value={form.smtp_from ?? ''}
                onChange={(event) => updateForm('smtp_from', event.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Nom expéditeur"
                value={form.smtp_from_name ?? ''}
                onChange={(event) => updateForm('smtp_from_name', event.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                type="password"
                label="Nouveau mot de passe SMTP"
                onChange={(event) => updateForm('smtp_password', event.target.value)}
              />
            </Grid>
          </Grid>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
            <Button variant="contained" onClick={() => mutation.mutate('save')}>
              Enregistrer
            </Button>
            <Button onClick={() => mutation.mutate('test')}>Tester</Button>
            <Button
              onClick={() =>
                mutation.mutate(smtpQuery.data?.is_active ? 'deactivate' : 'activate')
              }
            >
              {smtpQuery.data?.is_active ? 'Désactiver' : 'Activer'}
            </Button>
            <Button color="warning" onClick={() => mutation.mutate('delete-password')}>
              Supprimer le mot de passe
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
