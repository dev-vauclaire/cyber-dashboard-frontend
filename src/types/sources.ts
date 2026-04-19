import type { IsoUtcDateTimeString } from './common';

export type Source = {
  source_id: number;
  source_name: string;
  source_external_id: string;
  is_active: boolean;
  created_at: IsoUtcDateTimeString;
  sensor_type_code: string;
  sensor_type_label: string;
};

export type SourcesListResponse = {
  items: Source[];
};

export type SourceInventoryItem = {
  sensor_type_code: string;
  sensor_type_label: string;
  active_count: number;
  inactive_count: number;
};

export type SourceInventoryResponse = {
  items: SourceInventoryItem[];
};

export type PatchSourceNamePayload = {
  source_name: string;
};

export type PatchSourceActiveStatusPayload = {
  is_active: boolean;
};

export type SourceColorInput = {
  sourceId?: number | string;
  sourceName: string;
  sourceColor?: string | null;
};
