export type DashboardOverview = {
  total_attacks: number;
  total_common_ip_alerts: number;
  total_active_sources: number;
  total_inactive_sources: number;
};

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

export type DashboardTopologyResponse = {
  collectors: DashboardTopologyCollector[];
  sources: DashboardTopologySource[];
};

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
