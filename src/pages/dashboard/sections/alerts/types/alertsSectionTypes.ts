import type { DayjsDateRange } from '../../../../../shared/utils/dateUtils';

export type AlertsLocalFilters = {
  sourceIds: string[];
  dateRange: DayjsDateRange;
  minDistinctSourceCount: string;
};

export type AlertPaginationModel = {
  page: number;
  pageSize: number;
};
