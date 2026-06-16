import type { DashboardSectionLink } from '../pages/dashboard/sections/topology/types/types';

export const DASHBOARD_SECTION_LINKS: DashboardSectionLink[] = [
  { id: 'overview', label: 'Aperçu global' },
  { id: 'topology', label: 'Topologie' },
  { id: 'charts', label: 'Graphiques' },
  { id: 'alerts', label: 'Alertes' },
  { id: 'attacks', label: 'Attaques' }
];
