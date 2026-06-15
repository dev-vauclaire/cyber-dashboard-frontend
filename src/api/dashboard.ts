import { apiClient } from './client';
import type { DashboardOverview, DashboardTopologyResponse } from '../types/dashboard';

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  return apiClient.get<DashboardOverview>('/api/dashboard/overview');
}

export async function fetchDashboardTopology(): Promise<DashboardTopologyResponse> {
  return apiClient.get<DashboardTopologyResponse>('/api/dashboard/topology');
}
