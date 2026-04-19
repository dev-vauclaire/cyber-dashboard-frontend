import type { DateRangeQuery, IsoUtcDateTimeString, Pagination } from './common';

export type AttackRecord = {
  id: number;
  source_id: number;
  source_name: string;
  sensor_type_code: string;
  attacker_ip: string;
  occurred_at: IsoUtcDateTimeString;
  collected_at: IsoUtcDateTimeString;
  attack_type: string;
};

export type PaginatedAttacksResponse = {
  pagination: Pagination;
  items: AttackRecord[];
};

export type PaginatedAttacksQuery = DateRangeQuery & {
  source_id?: number;
  attack_type?: string;
  page?: number;
  page_size?: number;
  sensor_type?: string;
};
