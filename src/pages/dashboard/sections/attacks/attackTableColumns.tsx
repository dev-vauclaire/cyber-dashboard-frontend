import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import type { AttackRecord } from './types/attackTypes';
import type { SourceColorRegistry } from '../../../../shared/sources/utils/sourceColors';
import { formatDate } from '../../../../shared/utils/dateUtils';
import { getSourceColor } from '../../../../shared/sources/utils/sourceColors';

function renderSourceCell(
  params: GridRenderCellParams<AttackRecord, string>,
  sourceColorRegistry: SourceColorRegistry,
) {
  const color = getSourceColor({
    sourceId: params.row.source_id,
    sourceName: params.row.source_name,
    sourceColorRegistry,
  });

  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: '999px',
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      <Typography variant="body2" noWrap title={params.row.source_name}>
        {params.row.source_name}
      </Typography>
    </Stack>
  );
}

function renderOccurredAtCell(params: GridRenderCellParams<AttackRecord, string>) {
  return <Typography variant="body2">{formatDate(params.value)}</Typography>;
}

export function buildAttackTableColumns(
  sourceColorRegistry: SourceColorRegistry,
): GridColDef<AttackRecord>[] {
  return [
    {
      field: 'occurred_at',
      headerName: 'Survenue',
      minWidth: 165,
      flex: 1,
      sortable: false,
      renderCell: renderOccurredAtCell,
    },
    {
      field: 'source_name',
      headerName: 'Source',
      minWidth: 240,
      flex: 1.4,
      sortable: false,
      renderCell: (params) => renderSourceCell(params, sourceColorRegistry),
    },
    {
      field: 'attacker_ip',
      headerName: 'IP attaquante',
      minWidth: 180,
      flex: 1.1,
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.value ?? ''}
        </Typography>
      ),
    },
  ];
}
