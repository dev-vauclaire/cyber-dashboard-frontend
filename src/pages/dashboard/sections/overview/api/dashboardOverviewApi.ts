import { apiClient } from '../../../../../shared/api/client';
import type { DashboardOverview } from '../types/dashboardOverviewTypes';

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  return apiClient.get<DashboardOverview>('/api/dashboard/overview');
}
