export type DashboardSectionId =
  | 'overview'
  | 'topology'
  | 'charts'
  | 'alerts'
  | 'attacks'
  | 'sources';

export type DashboardSectionLink = {
  id: DashboardSectionId;
  label: string;
};

export const DASHBOARD_SECTION_LINKS: DashboardSectionLink[] = [
  { id: 'overview', label: 'Aperçu global' },
  { id: 'topology', label: 'Topologie' },
  { id: 'charts', label: 'Graphiques' },
  { id: 'alerts', label: 'Alertes' },
  { id: 'attacks', label: 'Attaques' }
];
