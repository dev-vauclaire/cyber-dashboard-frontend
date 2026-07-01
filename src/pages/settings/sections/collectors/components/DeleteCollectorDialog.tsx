import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';

type DeleteCollectorDialogProps = {
  collectorName: string;
  errorMessage: string | null;
  isDeleting: boolean;
  open: boolean;
  supportsEmail: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteCollectorDialog({
  collectorName,
  errorMessage,
  isDeleting,
  open,
  supportsEmail,
  onCancel,
  onConfirm,
}: DeleteCollectorDialogProps) {
  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={isDeleting ? undefined : onCancel}
      aria-labelledby="delete-collector-dialog-title"
    >
      <DialogTitle id="delete-collector-dialog-title">Supprimer le collecteur ?</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <DialogContentText>
            La configuration « {collectorName} » sera définitivement supprimée, ainsi que
            {supportsEmail
              ? ' sa clé API et son adresse e-mail associées.'
              : ' sa clé API associée.'}
          </DialogContentText>
          <Alert severity="warning">
            Cette action est irréversible. Les prochaines collectes de cette configuration
            seront interrompues.
          </Alert>
          {errorMessage != null ? <Alert severity="error">{errorMessage}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={isDeleting}>
          Annuler
        </Button>
        <Button
          color="error"
          variant="contained"
          startIcon={<DeleteForeverRoundedIcon fontSize="small" />}
          loading={isDeleting}
          onClick={onConfirm}
        >
          Supprimer définitivement
        </Button>
      </DialogActions>
    </Dialog>
  );
}
