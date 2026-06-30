import * as React from 'react';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type {
  AttacksCollectorConfig,
  AttacksCollectorConfigPayload,
  CollectorType,
} from './types/collectorTypes';
import ValidationStatusChip from '../../../../shared/components/ValidationStatusChip';
import { getCollectorLogo } from '../../../../shared/utils/logo';
import Box from '@mui/material/Box';

type CollectorConfigCardProps = {
  config: AttacksCollectorConfig;
  onDelete: (config: AttacksCollectorConfig) => void;
  onAction: (input: {
    action: string;
    id?: number;
    payload?: AttacksCollectorConfigPayload;
  }) => void;
};

export default function CollectorConfigCard({
  config,
  onAction,
  onDelete,
}: CollectorConfigCardProps) {
  const [form, setForm] = React.useState<AttacksCollectorConfigPayload>({
    name: config.name,
    collector_type: config.collector_type,
    api_key: '',
    email: '',
  });

  React.useEffect(() => {
    setForm({
      name: config.name,
      collector_type: config.collector_type,
      api_key: '',
      email: '',
    });
  }, [config]);

  const savePayload: AttacksCollectorConfigPayload = {
    name: form.name,
    collector_type: form.collector_type,
    ...(form.api_key?.trim() ? { api_key: form.api_key } : {}),
    ...(form.email?.trim() ? { email: form.email } : {}),
  };

  const collectorLogo = getCollectorLogo(config.collector_type);

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 1 }}>
            <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
              {collectorLogo ? (
                <Box
                  component="img"
                  src={collectorLogo}
                  alt={`${config.name} logo`}
                  sx={{ width: 32, height: 32 }}
                />
              ) : null}
              <Typography variant="subtitle2">{config.name}</Typography>
            </Stack>
            <ValidationStatusChip status={config.last_validation_status} />
          </Stack>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Nom"
                value={form.name ?? ''}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  label="Type"
                  value={form.collector_type ?? config.collector_type}
                  onChange={(event) =>
                    setForm((current) => ({
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
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                type="password"
                label="Nouvelle clé API"
                value={form.api_key ?? ''}
                onChange={(event) =>
                  setForm((current) => ({ ...current, api_key: event.target.value }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Nouvelle adresse e-mail"
                value={form.email ?? ''}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
              />
            </Grid>
          </Grid>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
            <Chip size="small" label={config.collector_type.toUpperCase()} />
            <Chip
              size="small"
              color={config.is_active ? 'success' : 'default'}
              label={config.is_active ? 'Actif' : 'Inactif'}
            />
            {config.inventory_requested ? (
              <Chip size="small" color="warning" label="Inventaire demandé" />
            ) : null}
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Clé {config.api_key_hint ?? 'absente'} · e-mail {config.email_hint ?? 'absent'}
          </Typography>
          {config.last_validation_error ? (
            <Alert severity="warning">{config.last_validation_error}</Alert>
          ) : null}
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="contained"
              onClick={() => onAction({ action: 'save', id: config.id, payload: savePayload })}
            >
              Enregistrer
            </Button>
            <Button
              size="small"
              onClick={() =>
                onAction({
                  action: config.is_active ? 'deactivate' : 'activate',
                  id: config.id,
                })
              }
            >
              {config.is_active ? 'Désactiver' : 'Activer'}
            </Button>
            <Button size="small" onClick={() => onAction({ action: 'inventory', id: config.id })}>
              Relancer l&apos;inventaire
            </Button>
            {config.has_api_key ? (
              <Button
                size="small"
                color="warning"
                onClick={() => onAction({ action: 'delete-key', id: config.id })}
              >
                Supprimer la clé
              </Button>
            ) : null}
            {config.has_email ? (
              <Button
                size="small"
                color="warning"
                onClick={() => onAction({ action: 'delete-email', id: config.id })}
              >
                Supprimer l&apos;e-mail
              </Button>
            ) : null}
            <Button
              size="small"
              color="error"
              variant="outlined"
              startIcon={<DeleteOutlineRoundedIcon fontSize="small" />}
              onClick={() => onDelete(config)}
            >
              Supprimer le collecteur
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
