import '@xyflow/react/dist/style.css';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import CloseFullscreenRoundedIcon from '@mui/icons-material/CloseFullscreenRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useColorScheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

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

import { getAveragePosition, getSpacedPositionsByPreferredY, exportElementAsPng } from './utils/utils';

const COLLECTOR_X = 0;
const SOURCE_X = 460;
const ALERT_X = 1300;
const SOURCE_ROW_GAP = OFFSET + MAX_HEIGHT_NODE;
const ALERT_ROW_GAP = OFFSET + MAX_HEIGHT_NODE;
const COLLECTOR_ROW_GAP = OFFSET + MAX_HEIGHT_NODE;
const DEFAULT_MIN_DISTINCT_SOURCE_COUNT = 3;
const DEFAULT_ALERT_LIMIT = 20;

const EXPORT_BACKGROUND_BY_MODE = {
  dark: '#0B1020',
  light: '#FFFFFF',
} as const;
const EDGE_COLORS_BY_MODE = {
  dark: {
    alert: '#F59E0B',
    alertStrong: '#F87171',
    topology: '#94A3B8',
  },
  light: {
    alert: '#ED6C02',
    alertStrong: '#D32F2F',
    topology: '#64748B',
  },
} as const;

{ /* Toutes les nodes */ }
const nodeTypes = {
  collector: CollectorNode,
  source: SourceNode,
  alert: AlertNode,
};

export default function TopologySection() {
  const { mode, systemMode } = useColorScheme();
  const reactFlowColorMode = mode === 'system' ? (systemMode ?? 'light') : (mode ?? 'light');
  const edgeColors = EDGE_COLORS_BY_MODE[reactFlowColorMode];
  const [minDistinctSourceCount, setMinDistinctSourceCount] = useState(DEFAULT_MIN_DISTINCT_SOURCE_COUNT);
  const [alertLimit, setAlertLimit] = useState(DEFAULT_ALERT_LIMIT);
  const [hiddenAlertIds, setHiddenAlertIds] = useState<number[]>([]);
  const [hiddenAlertEdgeIds, setHiddenAlertEdgeIds] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const flowContainerRef = useRef<HTMLDivElement | null>(null);
  const dialogFlowContainerRef = useRef<HTMLDivElement | null>(null);
  const topologyQuery = useQuery({
    queryKey: ['dashboardTopology', minDistinctSourceCount, alertLimit],
    queryFn: () =>
      fetchDashboardTopology({
        alertLimit,
        minDistinctSourceCount,
      }),
  });

  const handleToggleAlertVisibility = useCallback((alertId: number) => {
    const alertLinks = topologyQuery.data?.alert_links ?? [];
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
  }, [topologyQuery.data?.alert_links]);

  const baseGraph = useMemo(() => {
    const collectors = topologyQuery.data?.collectors ?? [];
    const sources = topologyQuery.data?.sources ?? [];
    const alerts = topologyQuery.data?.alerts ?? [];
    const alertLinks = topologyQuery.data?.alert_links ?? [];
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

    let indexForCollectorNotLinked = 0;

    const collectorNodes: Node<CollectorNodeData, 'collector'>[] = collectors.map(
      (collector) => {
        const sourcePositions = sources
          .filter((source) => source.collector_id === collector.id)
          .map((source) => sourceYById.get(source.source_id))
          .filter((position): position is number => position != null);

        const fallbackY = indexForCollectorNotLinked * COLLECTOR_ROW_GAP * -1;

        const y =
          sourcePositions.length > 0
            ? getAveragePosition(sourcePositions, fallbackY)
            : fallbackY;

        if (sourcePositions.length === 0) {
          indexForCollectorNotLinked += 1;
        }

        return {
          id: `collector-${collector.id}`,
          type: 'collector',
          position: {
            x: COLLECTOR_X,
            y,
          },
          data: { collector },
        };
      },
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
        hidden: false,
        onToggleVisibility: handleToggleAlertVisibility,
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
        markerEnd: { type: MarkerType.ArrowClosed, color: edgeColors.topology },
        style: { stroke: edgeColors.topology },
      }));
    const alertEdges: Edge[] = alertLinks.map((link) => ({
      id: `source-${link.source_id}-alert-${link.alert_id}`,
      source: `source-${link.source_id}`,
      target: `alert-${link.alert_id}`,
      label: link.hit_count > 1 ? `${link.hit_count}` : undefined,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: link.hit_count >= 5 ? edgeColors.alertStrong : edgeColors.alert,
      },
      style: { stroke: link.hit_count >= 5 ? edgeColors.alertStrong : edgeColors.alert },
    }));

    return {
      nodes: [...collectorNodes, ...sourceNodes, ...alertNodes],
      edges: [...topologyEdges, ...alertEdges],
    };
  }, [edgeColors, handleToggleAlertVisibility, topologyQuery.data]);

  const hiddenAlertIdSet = useMemo(() => new Set(hiddenAlertIds), [hiddenAlertIds]);
  const hiddenAlertEdgeIdSet = useMemo(() => new Set(hiddenAlertEdgeIds), [hiddenAlertEdgeIds]);

  const nodes = useMemo(
    () =>
      baseGraph.nodes.map((node) => {
        if (node.type !== 'alert') {
          return node;
        }

        const alertNode = node as Node<AlertNodeData, 'alert'>;
        const hidden = hiddenAlertIdSet.has(alertNode.data.alert.alert_id);

        if (alertNode.data.hidden === hidden) {
          return alertNode;
        }

        return {
          ...alertNode,
          data: {
            ...alertNode.data,
            hidden,
          },
        };
      }),
    [baseGraph.nodes, hiddenAlertIdSet],
  );

  const edges = useMemo(
    () =>
      baseGraph.edges.map((edge) => {
        const hidden = hiddenAlertEdgeIdSet.has(edge.id);

        if (edge.hidden === hidden) {
          return edge;
        }

        return {
          ...edge,
          hidden,
        };
      }),
    [baseGraph.edges, hiddenAlertEdgeIdSet],
  );

  const handleExportImage = useCallback(() => {
    const targetElement = isExpanded ? dialogFlowContainerRef.current : flowContainerRef.current;

    if (!targetElement) {
      return;
    }

    void exportElementAsPng(
      targetElement,
      `cyber-dashboard-topology-${new Date().toISOString().slice(0, 10)}.png`,
      EXPORT_BACKGROUND_BY_MODE[reactFlowColorMode],
    );
  }, [isExpanded, reactFlowColorMode]);

  const isEmpty = !topologyQuery.isLoading && nodes.length === 0;
  const renderFilterControls = () => (
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
  );

  const graphContent = (containerRef: React.RefObject<HTMLDivElement | null>, height: number | string) => (
    <Box
      ref={containerRef}
      sx={{
        height,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: EXPORT_BACKGROUND_BY_MODE[reactFlowColorMode],
      }}
    >
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
  );

  const handleRefresh = () => {
    topologyQuery.refetch();
    setHiddenAlertIds([]);
    setHiddenAlertEdgeIds([]);
  }

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
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between' }}
      >
        {renderFilterControls()}
        <Stack direction="row" spacing={1} sx={{ justifyContent: { xs: 'flex-end', md: 'initial' } }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<RefreshRoundedIcon fontSize="small" />}
              onClick={handleRefresh}
            >
              Rafraîchir
            </Button>
          <Tooltip title="Exporter en image">
            <IconButton aria-label="Exporter la topologie en image" onClick={handleExportImage}>
              <DownloadRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Agrandir">
            <IconButton aria-label="Agrandir la topologie" onClick={() => setIsExpanded(true)}>
              <OpenInFullRoundedIcon />
            </IconButton>
          </Tooltip>
        </Stack>
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
            graphContent(flowContainerRef, 460)
          ) : null}
        </CardContent>
      </Card>
      <Dialog fullScreen open={isExpanded} onClose={() => setIsExpanded(false)}>
        <DialogTitle>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between' }}
          >
            <Typography component="span" variant="h6">
              Topologie
            </Typography>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              sx={{ alignItems: { xs: 'stretch', md: 'center' } }}
            >
              {renderFilterControls()}
              <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                <Tooltip title="Exporter en image">
                  <IconButton aria-label="Exporter la topologie agrandie en image" onClick={handleExportImage}>
                    <DownloadRoundedIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Réduire">
                  <IconButton aria-label="Réduire la topologie" onClick={() => setIsExpanded(false)}>
                    <CloseFullscreenRoundedIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          {graphContent(dialogFlowContainerRef, 'calc(100vh - 120px)')}
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
