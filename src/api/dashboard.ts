import type { DashboardOverview } from '../types/dashboard';

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  const response = await fetch('/api/dashboard/overview');

  if (!response.ok) {
    throw new Error("Erreur lors du chargement de l'overview");
  }

  return response.json() as Promise<DashboardOverview>;
}
