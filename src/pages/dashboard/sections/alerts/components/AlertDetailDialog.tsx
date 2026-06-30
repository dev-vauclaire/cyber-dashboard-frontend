import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { fetchCommonIpAlertDetail } from '../api/alertsApi';
import AlertEmailDialog from './AlertEmailDialog';
import { alertsQueryKeys } from '../queryKeys';
import { fetchSmtpConfig } from '../../../../settings/sections/emails/api/smtpApi';
import { smtpQueryKeys } from '../../../../settings/sections/emails/queryKeys';
import type { CommonIpAlertListItem } from '../types/alertTypes';
import CtiEnrichmentDialog from './cti/CtiEnrichmentDialog';
import { useSourceColorContext } from '../../../../../shared/sources/providers/sourceColorContext';
import { formatDate } from '../../../../../shared/utils/dateUtils';
import {
  buildSourceExternalUrl,
  getCollectorPortalLabel,
} from '../../../../../shared/utils/externalLinks';
import { getSourceColor } from '../../../../../shared/sources/utils/sourceColors';
import { buildDetailSummary } from '../utils/formatters';
import AlertCtiDetailBox from './AlertCtiDetailBox';

type AlertDetailDialogProps = {
  open: boolean;
  onClose: () => void;
  alert: CommonIpAlertListItem | null;
  refreshToken: number;
};

export default function AlertDetailDialog({
  open,
  onClose,
  alert,
  refreshToken,
}: AlertDetailDialogProps) {
  const { sourceColorRegistry } = useSourceColorContext();
  const [isCtiOpen, setIsCtiOpen] = React.useState(false);
  const [isEmailOpen, setIsEmailOpen] = React.useState(false);
  const alertId = alert?.id ?? 0;
  const detailQuery = useQuery({
    queryKey: alertsQueryKeys.commonIpAlertDetail(alertId, refreshToken),
    queryFn: () => fetchCommonIpAlertDetail(alertId),
    enabled: open && alertId > 0,
  });
  const smtpConfigQuery = useQuery({
    queryKey: smtpQueryKeys.config,
    queryFn: fetchSmtpConfig,
    enabled: open,
  });
  const canOpenCti = alert?.attacker_ip != null && alert.attacker_ip.trim() !== '';
  const isSmtpActive = smtpConfigQuery.data?.is_active === true;
  const canOpenEmail = alert?.id != null && canOpenCti && isSmtpActive && !smtpConfigQuery.isFetching;
  const emailButtonTooltip =
    smtpConfigQuery.isFetching
      ? 'Vérification de la configuration SMTP en cours'
      : smtpConfigQuery.isError
        ? 'Configuration SMTP indisponible'
      : isSmtpActive
        ? ''
        : 'Configuration SMTP inactive';

  function handleClose() {
    setIsCtiOpen(false);
    setIsEmailOpen(false);

    onClose();
  }

  function handleCtiClose() {
    setIsCtiOpen(false);
    setIsEmailOpen(false);
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1 }}>
        <DialogTitle>
          Détail de l&apos;alerte{alert ? ` ${alert.attacker_ip}` : ''}
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleClose}>Fermer</Button>
        </DialogActions>
      </Stack>
      <DialogContent>
        {detailQuery.isLoading ? (
          <Stack spacing={1.25} sx={{ py: 1 }}>
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="rounded" height={38} />
            <Skeleton variant="rounded" height={38} />
          </Stack>
        ) : null}

        {detailQuery.isError ? (
          <Alert severity="warning" sx={{ mt: 1 }}>
            Impossible de charger le détail de cette alerte.
          </Alert>
        ) : null}

        {!detailQuery.isLoading &&
        !detailQuery.isError &&
        (detailQuery.data == null || detailQuery.data.sources.length === 0) ? (
          <Alert severity="info" sx={{ mt: 1 }}>
            Aucun détail source n&apos;est disponible pour cette alerte.
          </Alert>
        ) : null}

        {!detailQuery.isLoading &&
        !detailQuery.isError &&
        detailQuery.data != null &&
        detailQuery.data.sources.length > 0 ? (
          <Stack spacing={1.5} sx={{ py: 1.5 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {buildDetailSummary(detailQuery.data)}
            </Typography>
            <TableContainer>
              <Table size="small" aria-label={`Détail de ${alert?.attacker_ip ?? "l'alerte"}`}>
                <TableHead>
                  <TableRow>
                    <TableCell>Source</TableCell>
                    <TableCell>Premier signalement</TableCell>
                    <TableCell>Dernier signalement</TableCell>
                    <TableCell>Occurrences</TableCell>
                    <TableCell>Portail</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detailQuery.data.sources.map((source) => {
                    const color = getSourceColor({
                      sourceId: source.source_id,
                      sourceName: source.source_name,
                      sourceColorRegistry,
                    });
                    const collectorLabel = getCollectorPortalLabel({
                      collectorType: source.collector_type,
                      sensorTypeCode: source.sensor_type_code,
                    });
                    const externalUrl = buildSourceExternalUrl({
                      collectorType: source.collector_type,
                      sensorTypeCode: source.sensor_type_code,
                      domainName: source.domain_name,
                      externalId: source.external_id,
                    });

                    return (
                      <TableRow key={`${alertId}-${source.source_id}`}>
                        <TableCell>
                          <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '999px',
                                backgroundColor: color,
                                flexShrink: 0,
                              }}
                            />
                            <Typography variant="body2">{source.source_name}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{formatDate(source.first_seen_at)}</TableCell>
                        <TableCell>{formatDate(source.last_seen_at)}</TableCell>
                        <TableCell>{source.hit_count}</TableCell>
                        <TableCell>
                          {externalUrl ? (
                            <Tooltip title={`Ouvrir ${collectorLabel}`}>
                              <IconButton
                                component="a"
                                href={externalUrl}
                                target="_blank"
                                rel="noreferrer"
                                size="small"
                                aria-label={`Ouvrir ${collectorLabel}`}
                              >
                                <OpenInNewRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Chip size="small" variant="outlined" label={collectorLabel} />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          justifyContent: 'flex-end',
          px: 3,
          py: 2,
        }}
      >
        <Button
          variant="contained"
          startIcon={<TravelExploreRoundedIcon fontSize="small" />}
          disabled={!canOpenCti}
          onClick={() => setIsCtiOpen(true)}
          sx={{
            '&&': {
              backgroundColor: '#8F00FF',
              backgroundImage: 'none',
              borderColor: '#8F00FF',
              boxShadow: 'none',
              color: '#FFFFFF',
            },
            '&& .MuiButton-startIcon': { color: '#FFFFFF' },
            '&&:hover': {
              backgroundColor: '#7B00D9',
              backgroundImage: 'none',
              borderColor: '#7B00D9',
              boxShadow: 'none',
              color: '#FFFFFF',
            },
            '&&.Mui-disabled': {
              backgroundColor: 'action.disabledBackground',
              color: 'action.disabled',
            },
          }}
        >
          CTI
        </Button>
      </DialogActions>
      <CtiEnrichmentDialog
        open={isCtiOpen}
        ipAddress={alert?.attacker_ip ?? null}
        actions={
          <Tooltip title={emailButtonTooltip}>
            <span>
              <Button
                variant="contained"
                size="small"
                startIcon={<MailOutlineRoundedIcon fontSize="small" />}
                disabled={!canOpenEmail}
                onClick={() => setIsEmailOpen(true)}
                sx={{
                  '&&': {
                    backgroundColor: '#00BFFF',
                    backgroundImage: 'none',
                    borderColor: '#00BFFF',
                    boxShadow: 'none',
                    color: '#FFFFFF',
                  },
                  '&& .MuiButton-startIcon': { color: '#FFFFFF' },
                  '&&:hover': {
                    backgroundColor: '#00A8E0',
                    backgroundImage: 'none',
                    borderColor: '#00A8E0',
                    boxShadow: 'none',
                    color: '#FFFFFF',
                  },
                  '&&.Mui-disabled': {
                    backgroundColor: 'action.disabledBackground',
                    color: 'action.disabled',
                  },
                }}
              >
                Envoyer un e-mail
              </Button>
            </span>
          </Tooltip>
        }
        leadingContent={
          alert != null ? (
            <AlertCtiDetailBox
              detail={detailQuery.data}
              isError={detailQuery.isError}
              isLoading={detailQuery.isLoading}
            />
          ) : null
        }
        onClose={handleCtiClose}
      />
      <AlertEmailDialog
        open={isEmailOpen}
        alertId={alert?.id ?? null}
        ipAddress={alert?.attacker_ip ?? null}
        onClose={() => setIsEmailOpen(false)}
      />
    </Dialog>
  );
}
