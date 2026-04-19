import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { GridColDef, GridRenderCellParams, GridRowsProp } from '@mui/x-data-grid';
import { formatUtcDateTimeToParis } from '../../utils/dateUtils';
import { getSourceColor } from '../../utils/sourceColors';

type AttackTableRow = {
  id: number;
  source_id: number;
  source_name: string;
  sensor_type_code: string;
  attacker_ip: string;
  attack_type: string;
  occurred_at: string;
  collected_at: string;
};

function renderSourceCell(params: GridRenderCellParams<AttackTableRow, string>) {
  const color = getSourceColor({
    sourceId: params.row.source_id,
    sourceName: params.row.source_name,
  });

  return (
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
      <Typography variant="body2" noWrap>
        {params.row.source_name}
      </Typography>
    </Stack>
  );
}

function renderAttackTypeCell(params: GridRenderCellParams<AttackTableRow, string>) {
  return (
    <Chip
      label={(params.value ?? '').toUpperCase()}
      size="small"
      variant="outlined"
      sx={{ minWidth: 64 }}
    />
  );
}

function renderParisDateCell(params: GridRenderCellParams<AttackTableRow, string>) {
  return (
    <Typography variant="body2">
      {formatUtcDateTimeToParis(params.value ?? '', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })}
    </Typography>
  );
}

export const columns: GridColDef<AttackTableRow>[] = [
  {
    field: 'occurred_at',
    headerName: 'Survenue',
    minWidth: 140,
    flex: 0.9,
    renderCell: renderParisDateCell,
  },
  {
    field: 'source_name',
    headerName: 'Source',
    minWidth: 220,
    flex: 1.3,
    renderCell: renderSourceCell,
  },
  {
    field: 'sensor_type_code',
    headerName: 'Capteur',
    minWidth: 120,
    flex: 0.8,
  },
  {
    field: 'attacker_ip',
    headerName: 'IP attaquante',
    minWidth: 170,
    flex: 1.1,
  },
  {
    field: 'attack_type',
    headerName: 'Type',
    minWidth: 100,
    flex: 0.7,
    renderCell: renderAttackTypeCell,
  },
  {
    field: 'collected_at',
    headerName: 'Collecte',
    minWidth: 140,
    flex: 0.9,
    renderCell: renderParisDateCell,
  },
];

export const rows: GridRowsProp<AttackTableRow> = [
  {
    id: 501234,
    source_id: 2,
    source_name: 'LURIO CHV SI',
    sensor_type_code: 'lurio',
    attacker_ip: '45.148.10.152/32',
    occurred_at: '2026-04-19T09:01:08Z',
    collected_at: '2026-04-19T09:46:53Z',
    attack_type: 'ssh',
  },
  {
    id: 501273,
    source_id: 3,
    source_name: 'LURIO CHV 4G',
    sensor_type_code: 'lurio',
    attacker_ip: '77.68.98.125/32',
    occurred_at: '2026-04-19T09:00:37Z',
    collected_at: '2026-04-19T09:46:53Z',
    attack_type: 'ssh',
  },
  {
    id: 501301,
    source_id: 10,
    source_name: 'DETOXIO Scanner',
    sensor_type_code: 'detoxio',
    attacker_ip: '185.91.127.81/32',
    occurred_at: '2026-04-19T08:58:12Z',
    collected_at: '2026-04-19T09:42:19Z',
    attack_type: 'rdp',
  },
  {
    id: 501322,
    source_id: 1,
    source_name: 'WAF Portail',
    sensor_type_code: 'waf',
    attacker_ip: '193.124.20.244/32',
    occurred_at: '2026-04-19T08:52:44Z',
    collected_at: '2026-04-19T09:39:07Z',
    attack_type: 'http',
  },
  {
    id: 501336,
    source_id: 2,
    source_name: 'LURIO CHV SI',
    sensor_type_code: 'lurio',
    attacker_ip: '41.111.215.65/32',
    occurred_at: '2026-04-19T08:49:03Z',
    collected_at: '2026-04-19T09:31:58Z',
    attack_type: 'smb',
  },
  {
    id: 501377,
    source_id: 3,
    source_name: 'LURIO CHV 4G',
    sensor_type_code: 'lurio',
    attacker_ip: '78.128.112.74/32',
    occurred_at: '2026-04-19T08:45:18Z',
    collected_at: '2026-04-19T09:26:42Z',
    attack_type: 'ssh',
  },
  {
    id: 501398,
    source_id: 10,
    source_name: 'DETOXIO Scanner',
    sensor_type_code: 'detoxio',
    attacker_ip: '89.248.172.16/32',
    occurred_at: '2026-04-19T08:40:11Z',
    collected_at: '2026-04-19T09:21:12Z',
    attack_type: 'ftp',
  },
  {
    id: 501420,
    source_id: 1,
    source_name: 'WAF Portail',
    sensor_type_code: 'waf',
    attacker_ip: '203.55.131.19/32',
    occurred_at: '2026-04-19T08:35:41Z',
    collected_at: '2026-04-19T09:19:24Z',
    attack_type: 'http',
  },
  {
    id: 501447,
    source_id: 2,
    source_name: 'LURIO CHV SI',
    sensor_type_code: 'lurio',
    attacker_ip: '198.44.140.21/32',
    occurred_at: '2026-04-19T08:30:59Z',
    collected_at: '2026-04-19T09:11:33Z',
    attack_type: 'ssh',
  },
  {
    id: 501489,
    source_id: 3,
    source_name: 'LURIO CHV 4G',
    sensor_type_code: 'lurio',
    attacker_ip: '103.174.136.77/32',
    occurred_at: '2026-04-19T08:21:06Z',
    collected_at: '2026-04-19T09:03:10Z',
    attack_type: 'rdp',
  },
];
