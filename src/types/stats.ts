import type { IsoUtcDateTimeString } from './common';

export type AttackStatsDateRangeQuery = {
  from: IsoUtcDateTimeString;
  to: IsoUtcDateTimeString;
};

export type AttackSummary = {
  from_at: IsoUtcDateTimeString;
  to_at: IsoUtcDateTimeString;
  total_attacks: number;
};

export type AttacksBySourceItem = {
  source_id: number;
  source_name: string;
  attack_count: number;
  percentage: number;
};

export type AttacksBySourceResponse = AttackSummary & {
  by_source: AttacksBySourceItem[];
};

export type AttacksBySourceTimeseriesItem = {
  source_id: number;
  source_name: string;
  source_color: string | null;
  source_is_active_current: boolean;
  attack_count: number;
  data: number[];
};

export type AttacksBySourceTimeseriesResponse = {
  from: IsoUtcDateTimeString;
  to: IsoUtcDateTimeString;
  bucket: 'day';
  total_attacks: number;
  bucket_starts_utc: IsoUtcDateTimeString[];
  series: AttacksBySourceTimeseriesItem[];
};

export type AttacksByTypeItem = {
  attack_type: string;
  attack_count: number;
  percentage: number;
};

export type AttacksByTypeResponse = {
  from_at: IsoUtcDateTimeString;
  to_at: IsoUtcDateTimeString;
  items: AttacksByTypeItem[];
};
