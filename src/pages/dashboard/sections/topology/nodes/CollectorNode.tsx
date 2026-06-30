import '@xyflow/react/dist/style.css';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {
  Handle,
  Position,
  type Node,
  type NodeProps,
} from '@xyflow/react';

import { getCollectorLogo } from '../../../../../shared/utils/logo';
import type { CollectorNodeData } from '../types/topologyTypes';
import { MAX_HEIGHT_NODE, MAX_WIDTH_NODE, MIN_WIDTH_NODE, MIN_HEIGHT_NODE } from '../utils/constants';

function statusColor(status: string | null | undefined): 'default' | 'error' | 'success' | 'warning' {
  if (status === 'success') {
    return 'success';
  }
  if (status === 'failed') {
    return 'error';
  }
  if (status === 'not_tested' || status === 'not_run') {
    return 'warning';
  }
  return 'default';
}

function statusLabel(status: string | null | undefined): string {
  if (status === 'success') {
    return 'Valide';
  }
  if (status === 'failed') {
    return 'Invalide';
  }
  if (status === 'not_tested' || status === 'not_run') {
    return 'Non testé';
  }
  return 'Non validé';
}

{ /* Node représentant un collecteur */ }
export default function CollectorNode({ data }: NodeProps<Node<CollectorNodeData, 'collector'>>) {
  const { collector, isTopologySwapped } = data;
  const collectorLogo = getCollectorLogo(collector.collector_type);

  return (
    <Card variant="outlined" sx={{ minWidth: MIN_WIDTH_NODE, minHeight: MIN_HEIGHT_NODE, maxWidth: MAX_WIDTH_NODE, maxHeight: MAX_HEIGHT_NODE, borderRadius: 1}}>
      <Handle type="source" position={isTopologySwapped ? Position.Left : Position.Right} />
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack spacing={1}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
            {collectorLogo ? (
              <Box
                component="img"
                src={collectorLogo}
                alt={`${collector.collector_type} logo`}
                sx={{
                  width: 45,
                  height: 45,
                  objectFit: 'contain',
                  flexShrink: 0,
                }}
              />
            ) : (
              <AccountTreeRoundedIcon color="inherit" fontSize="small" />
            )}
            <Typography variant="subtitle2" noWrap title={collector.name}>
              {collector.name}
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
            <Chip size="small" label={collector.collector_type.toUpperCase()} />
            <Chip
              size="small"
              color={collector.is_active ? 'success' : 'default'}
              variant="outlined"
              label={collector.is_active ? 'Actif' : 'Inactif'}
            />
            <Chip
              size="small"
              color={statusColor(collector.last_validation_status)}
              variant="outlined"
              label={statusLabel(collector.last_validation_status)}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
