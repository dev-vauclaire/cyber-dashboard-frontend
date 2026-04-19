export type DashboardOverview = {
  total_attacks: number;
  total_common_ip_alerts: number;
  total_active_sources: number;
  total_inactive_sources: number;
};

export type DashboardSectionId =
  | 'overview'
  | 'charts'
  | 'alerts'
  | 'attacks'
  | 'sources';

export type DashboardSectionLink = {
  id: DashboardSectionId;
  label: string;
};

export type SourceColorDescriptor = {
  sourceId?: number | string;
  sourceName: string;
  color?: string | null;
};
