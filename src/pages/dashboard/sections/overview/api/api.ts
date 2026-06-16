import { apiClient } from '../../../../../api/client';
import type { DashboardOverview } from '../types/types';

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  return apiClient.get<DashboardOverview>('/api/dashboard/overview');
}
