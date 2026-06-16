export type DashboardTopologyCollector = {
  id: number;
  name: string;
  collector_type: 'ogo' | 'serenicity';
  is_active: boolean;
  inventory_requested: boolean;
  last_validation_status: string | null;
  last_validation_at: string | null;
  last_validation_error: string | null;
};

export type CollectorNodeData = {
  collector: DashboardTopologyCollector;
};

export type DashboardTopologySource = {
  source_id: number;
  source_name: string;
  source_color: string | null;
  source_is_active: boolean;
  sensor_type_code: string;
  sensor_type_label: string;
  collector_id: number | null;
  collector_type: 'ogo' | 'serenicity' | null;
  alert_count: number;
  domain_name: string | null;
  external_id: string | null;
  last_inventory_at: string | null;
  last_inventory_status: string | null;
  last_inventory_success_at: string | null;
  last_inventory_error_at: string | null;
  last_inventory_error_message: string | null;
  last_collection_status: string | null;
  last_collection_success_at: string | null;
  last_collection_error_at: string | null;
  last_collection_error_message: string | null;
};

export type SourceNodeData = {
  source: DashboardTopologySource;
};

export type DashboardTopologyAlert = {
  alert_id: number;
  attacker_ip: string;
  distinct_source_count: number;
  first_seen_at: string;
  last_seen_at: string;
};

export type AlertNodeData = {
  alert: DashboardTopologyAlert;
  hidden: boolean;
  onToggleVisibility: (alertId: number) => void;
};

export type DashboardTopologyAlertLink = {
  alert_id: number;
  source_id: number;
  first_seen_at: string;
  last_seen_at: string;
  hit_count: number;
};

export type DashboardTopologyResponse = {
  collectors: DashboardTopologyCollector[];
  sources: DashboardTopologySource[];
  alerts: DashboardTopologyAlert[];
  alert_links: DashboardTopologyAlertLink[];
};

export type DashboardSectionId =
  | 'overview'
  | 'topology'
  | 'charts'
  | 'alerts'
  | 'attacks';

export type DashboardSectionLink = {
  id: DashboardSectionId;
  label: string;
};

{/* Constantes pour la taille des nodes */}
export const MAX_HEIGHT_NODE = 150;
/* Constantes pour le décalage des nodes */
export const OFFSET = 10;
