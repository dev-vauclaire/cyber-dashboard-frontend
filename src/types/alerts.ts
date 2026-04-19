import type { IsoUtcDateTimeString } from './common';

export type CommonIpAlertListItem = {
  attacker_ip: string;
  associated_sources: string[];
  first_seen_at: IsoUtcDateTimeString;
  last_seen_at: IsoUtcDateTimeString;
};

export type CommonIpAlertsListResponse = {
  items: CommonIpAlertListItem[];
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
