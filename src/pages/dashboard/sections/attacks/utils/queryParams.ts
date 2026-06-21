import type { GridPaginationModel } from '@mui/x-data-grid';
import type { PaginatedAttacksQuery } from '../types/attackTypes';
import { buildParisDayBoundaryUtcIso } from '../../../../../shared/utils/dateUtils';
import type { AttacksLocalFilters } from '../types/attacksSectionTypes';

export function buildPaginatedAttacksQuery(
  filters: AttacksLocalFilters,
  paginationModel: GridPaginationModel,
): PaginatedAttacksQuery {
  const query: PaginatedAttacksQuery = {
    page: paginationModel.page + 1,
    page_size: paginationModel.pageSize,
  };

  if (filters.sourceId !== '') {
    query.source_id = Number(filters.sourceId);
  }

  if (filters.dateRange.from != null) {
    query.from = buildParisDayBoundaryUtcIso(filters.dateRange.from, 'start');
  }

  if (filters.dateRange.to != null) {
    query.to = buildParisDayBoundaryUtcIso(filters.dateRange.to, 'end');
  }

  return query;
}
