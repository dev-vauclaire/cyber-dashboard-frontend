import '@xyflow/react/dist/style.css';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import {
  Handle,
  Position,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import type { AlertNodeData } from '../types/types';
import { MAX_HEIGHT_NODE } from '../types/types';

{ /* Node représentant une alerte */ }
export default function AlertNode({ data }: NodeProps<Node<AlertNodeData, 'alert'>>) {
  const { alert, hidden, onToggleVisibility } = data;

  return (
    <Card
      variant="outlined"
      sx={{
        minWidth: 230,
        maxHeight: MAX_HEIGHT_NODE,
        opacity: hidden ? 0.4 : 1,
        borderRadius: 1,
        borderColor: alert.distinct_source_count >= 5 ? 'error.main' : 'warning.main',
      }}
    >
      <Handle type="target" position={Position.Left} />
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack spacing={1}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
              <WarningAmberRoundedIcon color="warning" fontSize="small" />
              <Typography variant="subtitle2" noWrap title={alert.attacker_ip}>
                {alert.attacker_ip}
              </Typography>
            </Stack>
            <Tooltip title={hidden ? 'Afficher les liens' : 'Masquer les liens'}>
              <IconButton
                aria-label={hidden ? 'Afficher les liens de cette alerte' : 'Masquer les liens de cette alerte'}
                size="small"
                onClick={() => onToggleVisibility(alert.alert_id)}
              >
                {hidden ? (
                  <VisibilityOffRoundedIcon fontSize="inherit" />
                ) : (
                  <VisibilityRoundedIcon fontSize="inherit" />
                )}
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
            <Chip
              size="small"
              color={alert.distinct_source_count >= 5 ? 'error' : 'warning'}
              label={`${alert.distinct_source_count} sources`}
            />
            <Chip size="small" variant="outlined" label={`Alerte #${alert.alert_id}`} />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Dernière détection {new Date(alert.last_seen_at).toLocaleString()}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
