import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { AttackRecord } from '../types/attackTypes';
import DetailDialog from '../../../../../shared/components/DetailDialog';
import { useSourceColorContext } from '../../../../../shared/sources/providers/sourceColorContext';
import { formatDate } from '../../../../../shared/utils/dateUtils';
import { getSourceColor } from '../../../../../shared/sources/utils/sourceColors';

type AttackDetailDialogProps = {
  attack: AttackRecord | null;
  open: boolean;
  onClose: () => void;
};

type DetailRowProps = {
  label: string;
  value: ReactNode;
};

function formatAttackTypeLabel(attackType: AttackRecord['attack_type']): string {
  if (attackType == null || attackType.trim() === '') {
    return 'Non renseigné';
  }

  return attackType.toUpperCase();
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}

export default function AttackDetailDialog({
  attack,
  open,
  onClose,
}: AttackDetailDialogProps) {
  const { sourceColorRegistry } = useSourceColorContext();

  if (attack == null) {
    return null;
  }

  const sourceColor = getSourceColor({
    sourceId: attack.source_id,
    sourceName: attack.source_name,
    sourceColorRegistry,
  });
  const attackTypeLabel = formatAttackTypeLabel(attack.attack_type);

  return (
    <DetailDialog
      open={open}
      onClose={onClose}
      title={`Attaque ${attack.id}`}
      subtitle="Structure simple, prête à être enrichie dans une future fenêtre de détail."
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ gap: 1.5, justifyContent: 'space-between', alignItems: 'flex-start' }}
        >
          <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '999px',
                backgroundColor: sourceColor,
                flexShrink: 0,
              }}
            />
            <Typography variant="subtitle1">{attack.source_name}</Typography>
          </Stack>
          <Chip label={attackTypeLabel} size="small" variant="outlined" />
        </Stack>
        <Divider />
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ gap: 2, flexWrap: 'wrap' }}
          useFlexGap
        >
          <DetailRow label="IP attaquante" value={<code>{attack.attacker_ip}</code>} />
          <DetailRow label="Type de capteur" value={attack.sensor_type_code.toUpperCase()} />
          <DetailRow label="Type d'attaque" value={attackTypeLabel} />
          <DetailRow label="Survenue" value={formatDate(attack.occurred_at)} />
          <DetailRow label="Collecte" value={formatDate(attack.collected_at)} />
        </Stack>
      </Stack>
    </DetailDialog>
  );
}
