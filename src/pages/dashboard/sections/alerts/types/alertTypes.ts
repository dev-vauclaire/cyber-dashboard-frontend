import type {
  DateRangeQuery,
  IsoUtcDateTimeString,
  Pagination,
} from '../../../../../shared/types/common';

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
  sensor_type_code: string | null;
  collector_type: string | null;
  domain_name: string | null;
  external_id: string | null;
  first_seen_at: IsoUtcDateTimeString;
  last_seen_at: IsoUtcDateTimeString;
  hit_count: number;
};

export type CommonIpAlertDetail = {
  attacker_ip: string;
  sources: CommonIpAlertSourceDetail[];
};

export type AlertEmailPayload = {
  recipient: string;
  subject: string;
  body: string;
};

export type AlertEmailResponse = {
  alert_id: number;
  recipient: string;
  sent: boolean;
};
