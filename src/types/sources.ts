import type { IsoUtcDateTimeString } from './common';

export type Source = {
  source_id: number;
  source_name: string;
  domain_name: string | null;
  is_active: boolean;
  created_at: IsoUtcDateTimeString;
  sensor_type_code: string;
  color: string | null;
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

export type PatchSourceColorPayload = {
  color: string;
};

export type SourceColorInput = {
  sourceId?: number | string;
  sourceName: string;
  sourceColor?: string | null;
  sourceColorRegistry?: ReadonlyMap<string, string>;
};
