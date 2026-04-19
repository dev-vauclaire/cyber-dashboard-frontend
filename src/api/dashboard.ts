import { apiClient } from './client';
import type { DashboardOverview } from '../types/dashboard';

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  return apiClient.get<DashboardOverview>('/api/dashboard/overview');
}
