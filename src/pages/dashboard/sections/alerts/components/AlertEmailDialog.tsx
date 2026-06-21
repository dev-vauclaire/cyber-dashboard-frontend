import * as React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { fetchCtiEnrichment } from '../../../../../shared/cti/ctiApi';
import { ctiQueryKeys } from '../../../../../shared/cti/queryKeys';
import { sendCommonIpAlertEmail } from '../api/alertsApi';

type AlertEmailDialogProps = {
  alertId: number | null;
  ipAddress: string | null;
  open: boolean;
  onClose: () => void;
};

function buildDefaultSubject(ipAddress: string | null): string {
  return ipAddress == null ? 'Alerte cyber' : `Alerte cyber concernant ${ipAddress}`;
}

function buildDefaultBody(ipAddress: string | null): string {
  return [
    'Bonjour,',
    '',
    `Nous avons observe une activite malveillante associee a l'adresse IP ${ipAddress ?? ''}.`,
    'Merci de verifier les journaux associes et de prendre les mesures appropriees.',
    '',
    'Cordialement,',
  ].join('\n');
}

function fetchRdapEmailDefault(ipAddress: string | null) {
  if (ipAddress == null) {
    throw new Error('Adresse IP absente');
  }

  return fetchCtiEnrichment('rdap', ipAddress);
}

export default function AlertEmailDialog({
  alertId,
  ipAddress,
  open,
  onClose,
}: AlertEmailDialogProps) {
  const [recipient, setRecipient] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [body, setBody] = React.useState('');
  const rdapQuery = useQuery({
    queryKey: ctiQueryKeys.rdapEmailDefault(ipAddress),
    queryFn: () => fetchRdapEmailDefault(ipAddress),
    enabled: open && ipAddress != null,
    staleTime: 5 * 60 * 1000,
  });
  const sendMutation = useMutation({
    mutationFn: () => {
      if (alertId == null) {
        throw new Error('Alerte absente');
      }

      return sendCommonIpAlertEmail(alertId, {
        recipient,
        subject,
        body,
      });
    },
    onSuccess: onClose,
  });

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setSubject(buildDefaultSubject(ipAddress));
    setBody(buildDefaultBody(ipAddress));
    setRecipient('');
  }, [ipAddress, open]);

  React.useEffect(() => {
    const abuseContact = rdapQuery.data?.abuse_contact_email;
    if (abuseContact != null && abuseContact !== '' && recipient === '') {
      setRecipient(abuseContact);
    }
  }, [rdapQuery.data, recipient]);

  const canSend =
    alertId != null &&
    recipient.trim() !== '' &&
    subject.trim() !== '' &&
    body.trim() !== '' &&
    !sendMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Prévisualisation email · {ipAddress}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {rdapQuery.isError ? (
            <Alert severity="info">
              Contact abuse RDAP indisponible. Renseigne le destinataire manuellement.
            </Alert>
          ) : null}
          {sendMutation.isError ? (
            <Alert severity="warning">
              Impossible d&apos;envoyer l&apos;email.
              {sendMutation.error instanceof Error ? ` ${sendMutation.error.message}` : ''}
            </Alert>
          ) : null}
          <TextField
            label="Destinataire"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Sujet"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Message"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            fullWidth
            multiline
            minRows={8}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          disabled={!canSend}
          onClick={() => {
            sendMutation.mutate();
          }}
        >
          Envoyer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
