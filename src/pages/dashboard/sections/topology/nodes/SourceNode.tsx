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

import { getSourceLogo } from '../utils/sourceLogo';
import type { SourceNodeData } from '../types/types';
import { MAX_HEIGHT_NODE } from '../types/types';


{ /* Node représentant une source */ }
export default function SourceNode({ data }: NodeProps<Node<SourceNodeData, 'source'>>) {
  const { source } = data;
  const sourceLogo = getSourceLogo(source.sensor_type_code);
  const hasSyncError =
    source.last_inventory_status === 'failed' || source.last_collection_status === 'failed';

  return (
    <Card variant="outlined" sx={{ minWidth: 240, borderRadius: 1, maxHeight: MAX_HEIGHT_NODE }}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack spacing={1}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
            {sourceLogo ? (
              <Box
                component="img"
                src={sourceLogo}
                alt={`${source.sensor_type_code} logo`}
                sx={{
                  width: 30,
                  height: 30,
                  objectFit: 'contain',
                  flexShrink: 0,
                }}
              />
            ) : (
              <AccountTreeRoundedIcon color="inherit" fontSize="small" />
            )}
            <Typography variant="subtitle2" noWrap title={source.source_name}>
              {source.source_name}
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
            <Chip size="small" label={source.sensor_type_label} />
            <Chip
              size="small"
              color={source.source_is_active ? 'success' : 'default'}
              variant="outlined"
              label={source.source_is_active ? 'Active' : 'Inactive'}
            />
            <Chip
              size="small"
              color={source.alert_count > 0 ? 'warning' : 'default'}
              variant="outlined"
              label={`${source.alert_count} alerte${source.alert_count > 1 ? 's' : ''}`}
            />
            {hasSyncError ? (
              <Chip size="small" color="error" variant="outlined" label="Sync erreur" />
            ) : null}
          </Stack>
          {source.last_inventory_error_message || source.last_collection_error_message ? (
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              {source.last_inventory_error_message ?? source.last_collection_error_message}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}