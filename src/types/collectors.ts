import type { IsoUtcDateTimeString } from './common';

export type CollectorType = 'ogo' | 'serenicity';

export type AttacksCollectorConfig = {
  id: number;
  name: string;
  collector_type: CollectorType;
  is_active: boolean;
  inventory_requested: boolean;
  has_email: boolean;
  email_hint: string | null;
  has_api_key: boolean;
  api_key_hint: string | null;
  last_validation_status: string | null;
  last_validation_at: IsoUtcDateTimeString | null;
  last_validation_error: string | null;
  created_at: IsoUtcDateTimeString;
  updated_at: IsoUtcDateTimeString;
};

export type AttacksCollectorConfigListResponse = {
  items: AttacksCollectorConfig[];
};

export type AttacksCollectorConfigPayload = {
  name?: string;
  collector_type?: CollectorType;
  api_key?: string;
  email?: string;
};

export type AttacksCollectorInventoryRequestResponse = {
  attacks_collector_config_id: number;
  inventory_requested: boolean;
  updated_at: IsoUtcDateTimeString;
};
