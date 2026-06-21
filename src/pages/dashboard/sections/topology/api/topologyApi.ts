import { apiClient } from '../../../../../shared/api/client';
import type { DashboardTopologyResponse } from '../types/topologyTypes';

type DashboardTopologyQuery = {
  minDistinctSourceCount?: number;
  alertLimit?: number;
};

export async function fetchDashboardTopology({
  alertLimit,
  minDistinctSourceCount,
}: DashboardTopologyQuery = {}): Promise<DashboardTopologyResponse> {
  return apiClient.get<DashboardTopologyResponse>('/api/dashboard/topology', {
    query: {
      alert_limit: alertLimit,
      min_distinct_source_count: minDistinctSourceCount,
    },
  });
}