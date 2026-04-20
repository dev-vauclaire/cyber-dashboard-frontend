import {
  DataGrid,
  type DataGridProps,
  type GridColDef,
  type GridPaginationModel,
  type GridRowsProp,
} from '@mui/x-data-grid';
import type { SxProps, Theme } from '@mui/material/styles';

type CustomizedDataGridProps = {
  columns: GridColDef[];
  rows: GridRowsProp;
  isLoading?: boolean;
  rowCount?: number;
  paginationModel?: GridPaginationModel;
  onPaginationModelChange?: DataGridProps['onPaginationModelChange'];
  onRowClick?: DataGridProps['onRowClick'];
  pageSizeOptions?: number[];
  sx?: SxProps<Theme>;
};

export default function CustomizedDataGrid({
  columns,
  rows,
  isLoading = false,
  rowCount = 0,
  paginationModel,
  onPaginationModelChange,
  onRowClick,
  pageSizeOptions = [10, 20, 50],
  sx,
}: CustomizedDataGridProps) {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      loading={isLoading}
      rowCount={rowCount}
      pagination
      paginationMode="server"
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      onRowClick={onRowClick}
      getRowClassName={(params) =>
        params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
      }
      pageSizeOptions={pageSizeOptions}
      disableColumnResize
      disableRowSelectionOnClick
      density="compact"
      sx={[
        {
          minHeight: 520,
          border: 0,
        },
        ...(Array.isArray(sx) ? sx : sx == null ? [] : [sx]),
      ]}
      slotProps={{
        filterPanel: {
          filterFormProps: {
            logicOperatorInputProps: {
              variant: 'outlined',
              size: 'small',
            },
            columnInputProps: {
              variant: 'outlined',
              size: 'small',
              sx: { mt: 'auto' },
            },
            operatorInputProps: {
              variant: 'outlined',
              size: 'small',
              sx: { mt: 'auto' },
            },
            valueInputProps: {
              InputComponentProps: {
                variant: 'outlined',
                size: 'small',
              },
            },
          },
        },
      }}
    />
  );
}
