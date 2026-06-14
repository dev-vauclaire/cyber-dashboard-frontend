import type { DateRangeQuery, IsoUtcDateTimeString, Pagination } from './common';

export type CommonIpAlertListItem = {
  id: number;
  attacker_ip: string;
  distinct_source_count: number;
  first_seen_at: IsoUtcDateTimeString;
  last_seen_at: IsoUtcDateTimeString;
};

export type CommonIpAlertsListResponse = {
  pagination: Pagination;
  items: CommonIpAlertListItem[];
};

export type CommonIpAlertsQuery = DateRangeQuery & {
  page?: number;
  limit?: number;
  source_id?: number[];
  min_distinct_source_count?: number;
};

export type CommonIpAlertSourceDetail = {
  source_id: number;
  source_name: string;
  first_seen_at: IsoUtcDateTimeString;
  last_seen_at: IsoUtcDateTimeString;
  hit_count: number;
};

export type CommonIpAlertDetail = {
  attacker_ip: string;
  sources: CommonIpAlertSourceDetail[];
};
