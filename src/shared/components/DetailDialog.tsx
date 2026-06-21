import type { ReactNode } from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { DialogProps } from '@mui/material/Dialog';

type DetailDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidth?: DialogProps['maxWidth'];
  children: ReactNode;
};

export default function DetailDialog({
  open,
  onClose,
  title,
  subtitle,
  maxWidth = 'sm',
  children,
}: DetailDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={maxWidth}>
      <DialogTitle sx={{ pr: 7 }}>
        <Stack spacing={0.5}>
          <Typography component="span" variant="h6">
            {title}
          </Typography>
          {subtitle != null && subtitle !== '' ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {subtitle}
            </Typography>
          ) : null}
        </Stack>
        <IconButton
          aria-label="Fermer"
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', top: 14, right: 14 }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
    </Dialog>
  );
}
