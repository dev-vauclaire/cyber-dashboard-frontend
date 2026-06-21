import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';

type DeleteCtiApiKeyDialogProps = {
  errorMessage: string | null;
  isDeleting: boolean;
  open: boolean;
  providerLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteCtiApiKeyDialog({
  errorMessage,
  isDeleting,
  open,
  providerLabel,
  onCancel,
  onConfirm,
}: DeleteCtiApiKeyDialogProps) {
  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={isDeleting ? undefined : onCancel}
      aria-labelledby="delete-cti-api-key-title"
    >
      <DialogTitle id="delete-cti-api-key-title">Supprimer la clé API ?</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <DialogContentText>
            La clé enregistrée pour « {providerLabel} » sera définitivement supprimée.
          </DialogContentText>
          <Alert severity="warning">
            Les enrichissements nécessitant cette clé ne fonctionneront plus tant qu&apos;une
            nouvelle clé valide ne sera pas enregistrée.
          </Alert>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={isDeleting} onClick={onCancel}>
          Annuler
        </Button>
        <Button
          color="error"
          variant="contained"
          loading={isDeleting}
          startIcon={<DeleteForeverRoundedIcon fontSize="small" />}
          onClick={onConfirm}
        >
          Supprimer définitivement
        </Button>
      </DialogActions>
    </Dialog>
  );
}
