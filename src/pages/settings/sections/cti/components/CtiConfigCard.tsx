import * as React from 'react';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { CtiConfig } from '../../../../../shared/cti/types';
import ValidationStatusChip from '../../../../../shared/components/ValidationStatusChip';
import { formatDate } from '../../../../../shared/utils/dateUtils';
import type { CtiActionName } from '../types/ctiSettingsTypes';
import { getCtiToolLogo } from '../../../../../shared/utils/logo';
import Box from '@mui/material/Box';

type CtiConfigCardProps = {
  config: CtiConfig;
  draftApiKey: string;
  isBusy: boolean;
  pendingAction: CtiActionName | null;
  onApiKeyChange: (value: string) => void;
  onDeleteKey: () => void;
  onToggleActive: () => void;
  onValidate: (apiKey?: string) => void;
};

function getValidationButtonLabel(config: CtiConfig, draftApiKey: string): string {
  if (draftApiKey.trim() !== '') {
    return config.is_active
      ? 'Enregistrer et revalider'
      : 'Enregistrer, valider et activer';
  }

  if (config.has_api_key) {
    return config.is_active ? 'Revalider' : 'Revalider et activer';
  }

  return config.is_active ? 'Revalider' : 'Valider et activer';
}

export default function CtiConfigCard({
  config,
  draftApiKey,
  isBusy,
  pendingAction,
  onApiKeyChange,
  onDeleteKey,
  onToggleActive,
  onValidate,
}: CtiConfigCardProps) {
  const [showApiKey, setShowApiKey] = React.useState(false);
  const hasDraftApiKey = draftApiKey.trim() !== '';
  const isValidating = pendingAction === 'validate';
  const isTogglingActive = pendingAction === 'activate' || pendingAction === 'deactivate';
  const isValidationDisabled =
    isBusy || (config.is_key_required && !config.has_api_key && !hasDraftApiKey);
  const isActivationDisabled =
    isBusy || (!config.is_active && config.is_key_required && !config.has_api_key);

  const ctiToolLogo = getCtiToolLogo(config.code);

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}
          >
            <Stack spacing={0.5}>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                {ctiToolLogo ? (
                  <Box
                    component="img"
                    src={ctiToolLogo}
                    alt={`${config.label} logo`}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : null}
                <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {config.label}
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {config.last_validation_at
                  ? `Dernière validation : ${formatDate(config.last_validation_at)}`
                  : 'Jamais validé'}
              </Typography>
            </Stack>
            <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Chip
                size="small"
                color={config.is_active ? 'success' : 'default'}
                variant="outlined"
                label={config.is_active ? 'Actif' : 'Inactif'}
              />
              <ValidationStatusChip status={config.last_validation_status} />
            </Stack>
          </Stack>

          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {config.has_api_key
                ? `Clé enregistrée ${config.api_key_hint ?? ''}`
                : config.is_key_required
                  ? 'Aucune clé enregistrée'
                  : 'Ce fournisseur ne nécessite pas de clé API'}
            </Typography>
            {config.is_key_required ? (
              <TextField
                fullWidth
                size="small"
                label={config.has_api_key ? 'Remplacer la clé API' : 'Clé API'}
                type={showApiKey ? 'text' : 'password'}
                value={draftApiKey}
                disabled={isBusy}
                onChange={(event) => onApiKeyChange(event.target.value)}
                helperText={
                  config.has_api_key
                    ? 'Laissez ce champ vide pour revalider la clé enregistrée.'
                    : 'Une clé est requise avant la première validation.'
                }
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={showApiKey ? 'Masquer la clé' : 'Afficher la clé'}>
                          <IconButton
                            edge="end"
                            size="small"
                            aria-label={showApiKey ? 'Masquer la clé API' : 'Afficher la clé API'}
                            onClick={() => setShowApiKey((current) => !current)}
                          >
                            {showApiKey ? (
                              <VisibilityOffRoundedIcon fontSize="small" />
                            ) : (
                              <VisibilityRoundedIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            ) : null}
          </Stack>

          {config.last_validation_error ? (
            <Alert severity="warning">{config.last_validation_error}</Alert>
          ) : null}

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 1.5 }}
          >
            <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.is_active}
                    disabled={isActivationDisabled}
                    onChange={onToggleActive}
                    inputProps={{ 'aria-label': `${config.is_active ? 'Désactiver' : 'Activer'} ${config.label}` }}
                  />
                }
                label={config.is_active ? 'Activé' : 'Désactivé'}
              />
              {isTogglingActive ? (
                <CircularProgress size={16} aria-label={`Mise à jour de ${config.label}`} />
              ) : null}
            </Stack>

            <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="contained"
                disabled={isValidationDisabled}
                startIcon={
                  isValidating ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <CheckCircleOutlineRoundedIcon fontSize="small" />
                  )
                }
                onClick={() => onValidate(hasDraftApiKey ? draftApiKey : undefined)}
              >
                {getValidationButtonLabel(config, draftApiKey)}
              </Button>
              {config.has_api_key ? (
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  disabled={isBusy}
                  startIcon={<DeleteOutlineRoundedIcon fontSize="small" />}
                  onClick={onDeleteKey}
                >
                  Supprimer la clé
                </Button>
              ) : null}
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
