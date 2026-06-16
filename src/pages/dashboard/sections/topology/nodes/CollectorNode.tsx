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

import { getCollectorLogo } from '../utils/collectorLogos';
import type { CollectorNodeData } from '../types/types';
import { MAX_HEIGHT_NODE } from '../types/types';

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

{ /* Node représentant un collecteur */ }
export default function CollectorNode({ data }: NodeProps<Node<CollectorNodeData, 'collector'>>) {
  const { collector } = data;
  const collectorLogo = getCollectorLogo(collector.collector_type);

  return (
    <Card variant="outlined" sx={{ minWidth: 220, borderRadius: 1, maxHeight: MAX_HEIGHT_NODE }}>
      <Handle type="source" position={Position.Right} />
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
              label={collector.last_validation_status ?? 'Non validé'}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}