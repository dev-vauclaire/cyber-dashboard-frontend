import '@xyflow/react/dist/style.css';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import { fetchDashboardTopology } from '../../../../api/dashboard';
import type {
  DashboardTopologyCollector,
  DashboardTopologySource,
} from '../../../../types/dashboard';
import { getSourceColor } from '../../../../utils/sourceColors';
import { useSourceColorContext } from '../../../../internals/source-colors/SourceColorContext';

type CollectorNodeData = {
  collector: DashboardTopologyCollector;
};

type SourceNodeData = {
  source: DashboardTopologySource;
  color: string;
};

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

function CollectorNode({ data }: NodeProps<Node<CollectorNodeData, 'collector'>>) {
  const { collector } = data;

  return (
    <Card variant="outlined" sx={{ minWidth: 220, borderRadius: 1 }}>
      <Handle type="source" position={Position.Right} />
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack spacing={1}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
            <AccountTreeRoundedIcon color="primary" fontSize="small" />
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

function SourceNode({ data }: NodeProps<Node<SourceNodeData, 'source'>>) {
  const { source, color } = data;
  const hasSyncError =
    source.last_inventory_status === 'failed' || source.last_collection_status === 'failed';

  return (
    <Card variant="outlined" sx={{ minWidth: 240, borderRadius: 1 }}>
      <Handle type="target" position={Position.Left} />
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack spacing={1}>
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

const nodeTypes = {
  collector: CollectorNode,
  source: SourceNode,
};

export default function TopologySection() {
  const { sourceColorRegistry } = useSourceColorContext();
  const topologyQuery = useQuery({
    queryKey: ['dashboardTopology'],
    queryFn: fetchDashboardTopology,
  });

  const { nodes, edges } = useMemo(() => {
    const collectors = topologyQuery.data?.collectors ?? [];
    const sources = topologyQuery.data?.sources ?? [];
    const collectorNodes: Node<CollectorNodeData, 'collector'>[] = collectors.map(
      (collector, index) => ({
        id: `collector-${collector.id}`,
        type: 'collector',
        position: { x: 0, y: index * 150 },
        data: { collector },
      }),
    );
    const sourceNodes: Node<SourceNodeData, 'source'>[] = sources.map((source, index) => ({
      id: `source-${source.source_id}`,
      type: 'source',
      position: { x: 420, y: index * 125 },
      data: {
        source,
        color: getSourceColor({
          sourceId: source.source_id,
          sourceName: source.source_name,
          sourceColor: source.source_color,
          sourceColorRegistry,
        }),
      },
    }));
    const topologyEdges: Edge[] = sources
      .filter((source) => source.collector_id != null)
      .map((source) => ({
        id: `collector-${source.collector_id}-source-${source.source_id}`,
        source: `collector-${source.collector_id}`,
        target: `source-${source.source_id}`,
        animated:
          source.last_inventory_status === 'failed' ||
          source.last_collection_status === 'failed',
      }));

    return { nodes: [...collectorNodes, ...sourceNodes], edges: topologyEdges };
  }, [sourceColorRegistry, topologyQuery.data]);

  const isEmpty = !topologyQuery.isLoading && nodes.length === 0;

  return (
    <Stack component="section" id="topology" spacing={2} sx={{ scrollMarginTop: 144 }}>
      <Stack spacing={0.5}>
        <Typography component="h2" variant="h5">
          Cartographie
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Vue des collecteurs, de leurs sources et des alertes associees.
        </Typography>
      </Stack>
      <Card variant="outlined">
        <CardContent>
          {topologyQuery.isLoading ? <Skeleton variant="rounded" height={420} /> : null}
          {topologyQuery.isError ? (
            <Alert severity="warning">
              Impossible de charger la cartographie des collecteurs et sources.
            </Alert>
          ) : null}
          {isEmpty ? (
            <Alert severity="info">Aucune relation collecteur/source disponible.</Alert>
          ) : null}
          {!topologyQuery.isLoading && !topologyQuery.isError && !isEmpty ? (
            <Box sx={{ height: 460, border: '1px solid', borderColor: 'divider' }}>
              <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
                <Background />
                <Controls />
              </ReactFlow>
            </Box>
          ) : null}
        </CardContent>
      </Card>
    </Stack>
  );
}
