import { buildParisDayBoundaryUtcIso } from '../../../../../shared/utils/dateUtils';
import type { CommonIpAlertsQuery } from '../types/alertTypes';
import type {
  AlertPaginationModel,
  AlertsLocalFilters,
} from '../types/alertsSectionTypes';

export function buildCommonIpAlertsQuery(
  filters: AlertsLocalFilters,
  paginationModel: AlertPaginationModel,
): CommonIpAlertsQuery {
  const query: CommonIpAlertsQuery = {
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
  };

  if (filters.sourceIds.length > 0) {
    query.source_id = filters.sourceIds.map((sourceId) => Number(sourceId));
  }

  if (filters.dateRange.from != null) {
    query.from = buildParisDayBoundaryUtcIso(filters.dateRange.from, 'start');
  }

  if (filters.dateRange.to != null) {
    query.to = buildParisDayBoundaryUtcIso(filters.dateRange.to, 'end');
  }

  if (filters.minDistinctSourceCount !== '') {
    query.min_distinct_source_count = Number(filters.minDistinctSourceCount);
  }

  return query;
}
