import '@xyflow/react/dist/style.css';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useColorScheme } from '@mui/material/styles';
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react';
import { fetchDashboardTopology } from './api/api';

import CollectorNode from './nodes/CollectorNode';
import SourceNode from './nodes/SourceNode';
import AlertNode from './nodes/AlertNode';

import type { SourceNodeData } from './types/types';
import type { CollectorNodeData } from './types/types';
import type { AlertNodeData } from './types/types';

import { MAX_HEIGHT_NODE, OFFSET } from './types/types';

const COLLECTOR_X = 0;
const SOURCE_X = 460;
const ALERT_X = 1300;
const SOURCE_ROW_GAP = OFFSET + MAX_HEIGHT_NODE;
const ALERT_ROW_GAP = OFFSET + MAX_HEIGHT_NODE;
const COLLECTOR_ROW_GAP = OFFSET + MAX_HEIGHT_NODE;
const DEFAULT_MIN_DISTINCT_SOURCE_COUNT = 3;
const DEFAULT_ALERT_LIMIT = 10;

{ /* Toutes les nodes */ }
const nodeTypes = {
  collector: CollectorNode,
  source: SourceNode,
  alert: AlertNode,
};

function getAveragePosition(values: number[], fallback: number): number {
  if (values.length === 0) {
    return fallback;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getSpacedPositionsByPreferredY(
  preferredPositions: Array<{ id: number; y: number }>,
  minimumGap: number,
): Map<number, number> {
  const sortedPositions = [...preferredPositions].sort((first, second) => first.y - second.y);
  const spacedPositions = new Map<number, number>();
  const collisionGroups: Array<Array<{ id: number; y: number }>> = [];

  for (const position of sortedPositions) {
    const currentGroup = collisionGroups[collisionGroups.length - 1];
    const previousPosition = currentGroup?.[currentGroup.length - 1];

    if (!currentGroup || !previousPosition || position.y - previousPosition.y >= minimumGap) {
      collisionGroups.push([position]);
    } else {
      currentGroup.push(position);
    }
  }

  for (const group of collisionGroups) {
    const groupCenter = getAveragePosition(
      group.map((position) => position.y),
      group[0]?.y ?? 0,
    );
    const firstY = Math.max(0, groupCenter - ((group.length - 1) * minimumGap) / 2);

    group.forEach((position, index) => {
      spacedPositions.set(position.id, firstY + index * minimumGap);
    });
  }

  let previousY: number | null = null;
  for (const position of sortedPositions) {
    const currentY: number = spacedPositions.get(position.id) ?? position.y;
    const nextY: number = previousY == null ? currentY : Math.max(currentY, previousY + minimumGap);
    spacedPositions.set(position.id, nextY);
    previousY = nextY;
  }

  return spacedPositions;
}

export default function TopologySection() {
  const { mode, systemMode } = useColorScheme();
  const reactFlowColorMode = mode === 'system' ? (systemMode ?? 'light') : (mode ?? 'light');
  const [minDistinctSourceCount, setMinDistinctSourceCount] = useState(DEFAULT_MIN_DISTINCT_SOURCE_COUNT);
  const [alertLimit, setAlertLimit] = useState(DEFAULT_ALERT_LIMIT);
  const [hiddenAlertIds, setHiddenAlertIds] = useState<number[]>([]);
  const [hiddenAlertEdgeIds, setHiddenAlertEdgeIds] = useState<string[]>([]);
  const topologyQuery = useQuery({
    queryKey: ['dashboardTopology', minDistinctSourceCount, alertLimit],
    queryFn: () =>
      fetchDashboardTopology({
        alertLimit,
        minDistinctSourceCount,
      }),
  });

  const { nodes, edges } = useMemo(() => {
    const collectors = topologyQuery.data?.collectors ?? [];
    const sources = topologyQuery.data?.sources ?? [];
    const alerts = topologyQuery.data?.alerts ?? [];
    const alertLinks = topologyQuery.data?.alert_links ?? [];
    const hiddenAlertIdSet = new Set(hiddenAlertIds);
    const hiddenAlertEdgeIdSet = new Set(hiddenAlertEdgeIds);
    const sourceYById = new Map(
      sources.map((source, index) => [source.source_id, index * SOURCE_ROW_GAP]),
    );
    const alertFallbackYById = new Map(
      alerts.map((alert, index) => [alert.alert_id, index * ALERT_ROW_GAP]),
    );
    const alertPreferredPositions = alerts.map((alert, index) => ({
      id: alert.alert_id,
      y: getAveragePosition(
        alertLinks
          .filter((link) => link.alert_id === alert.alert_id)
          .map((link) => sourceYById.get(link.source_id))
          .filter((position): position is number => position != null),
        alertFallbackYById.get(alert.alert_id) ?? index * ALERT_ROW_GAP,
      ),
    }));
    const alertYById = getSpacedPositionsByPreferredY(alertPreferredPositions, ALERT_ROW_GAP);

    const collectorNodes: Node<CollectorNodeData, 'collector'>[] = collectors.map(
      (collector, index) => ({
        id: `collector-${collector.id}`,
        type: 'collector',
        position: {
          x: COLLECTOR_X,
          y: getAveragePosition(
            sources
              .filter((source) => source.collector_id === collector.id)
              .map((source) => sourceYById.get(source.source_id))
              .filter((position): position is number => position != null),
            index * COLLECTOR_ROW_GAP,
          ),
        },
        data: { collector },
      }),
    );
    {/* Calcul la position des sources */}
    const sourceNodes: Node<SourceNodeData, 'source'>[] = sources.map((source, index) => ({
      id: `source-${source.source_id}`,
      type: 'source',
      position: { x: SOURCE_X, y: sourceYById.get(source.source_id) ?? index * SOURCE_ROW_GAP },
      data: { source },
    }));
    {/* Calcul la position des alertes */}
    const alertNodes: Node<AlertNodeData, 'alert'>[] = alerts.map((alert, index) => ({
      id: `alert-${alert.alert_id}`,
      type: 'alert',
      position: {
        x: ALERT_X,
        y: alertYById.get(alert.alert_id) ?? index * ALERT_ROW_GAP,
      },
      data: {
        alert,
        hidden: hiddenAlertIdSet.has(alert.alert_id),
        onToggleVisibility: (alertId: number) => {
          const relatedEdgeIds = alertLinks
            .filter((link) => link.alert_id === alertId)
            .map((link) => `source-${link.source_id}-alert-${link.alert_id}`);

          setHiddenAlertIds((currentIds) =>
            currentIds.includes(alertId)
              ? currentIds.filter((currentId) => currentId !== alertId)
              : [...currentIds, alertId],
          );
          setHiddenAlertEdgeIds((currentIds) => {
            const currentIdSet = new Set(currentIds);
            const shouldShow =
              relatedEdgeIds.length > 0 && relatedEdgeIds.every((edgeId) => currentIdSet.has(edgeId));

            if (shouldShow) {
              return currentIds.filter((currentId) => !relatedEdgeIds.includes(currentId));
            }

            return Array.from(new Set([...currentIds, ...relatedEdgeIds]));
          });
        },
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
    const alertEdges: Edge[] = alertLinks.map((link) => ({
      id: `source-${link.source_id}-alert-${link.alert_id}`,
      source: `source-${link.source_id}`,
      target: `alert-${link.alert_id}`,
      label: link.hit_count > 1 ? `${link.hit_count}` : undefined,
      hidden: hiddenAlertEdgeIdSet.has(`source-${link.source_id}-alert-${link.alert_id}`),
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: link.hit_count >= 5 ? 'error.main' : 'warning.main' },
    }));

    return {
      nodes: [...collectorNodes, ...sourceNodes, ...alertNodes],
      edges: [...topologyEdges, ...alertEdges],
    };
  }, [hiddenAlertEdgeIds, hiddenAlertIds, topologyQuery.data]);

  const isEmpty = !topologyQuery.isLoading && nodes.length === 0;

  return (
    <Stack component="section" id="topology" spacing={2} sx={{ scrollMarginTop: 144 }}>
      <Stack spacing={0.5}>
        <Typography component="h2" variant="h5">
          Topologie
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Vue topologique des collecteurs, des sources et de leurs alertes associées.
        </Typography>
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Sources distinctes min."
          type="number"
          size="small"
          value={minDistinctSourceCount}
          slotProps={{
            htmlInput: { min: 2 },
          }}
          onChange={(event) => {
            const nextValue = Number(event.target.value);
            setMinDistinctSourceCount(Number.isFinite(nextValue) && nextValue >= 2 ? nextValue : 2);
            setHiddenAlertIds([]);
            setHiddenAlertEdgeIds([]);
          }}
        />
        <TextField
          label="Limite alertes"
          type="number"
          size="small"
          value={alertLimit}
          slotProps={{
            htmlInput: { min: 1, max: 500 },
          }}
          onChange={(event) => {
            const nextValue = Number(event.target.value);
            setAlertLimit(Number.isFinite(nextValue) && nextValue >= 1 ? Math.min(nextValue, 50) : 1);
            setHiddenAlertIds([]);
            setHiddenAlertEdgeIds([]);
          }}
        />
      </Stack>

      <Card variant="outlined">
        <CardContent>
          {topologyQuery.isLoading ? <Skeleton variant="rounded" height={420} /> : null}
          {topologyQuery.isError ? (
            <Alert severity="warning">
              Impossible de charger la topologie.
            </Alert>
          ) : null}
          {isEmpty ? (
            <Alert severity="info">Les données sont vides.</Alert>
          ) : null}
          {!topologyQuery.isLoading && !topologyQuery.isError && !isEmpty ? (
            <Box sx={{ height: 460, border: '1px solid', borderColor: 'divider' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                colorMode={reactFlowColorMode}
              >
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
