import type { IsoUtcDateTimeString } from './common';

export type CtiConfig = {
  id: number;
  code: string;
  label: string;
  is_key_required: boolean;
  is_active: boolean;
  has_api_key: boolean;
  api_key_hint: string | null;
  last_validation_status: string | null;
  last_validation_at: IsoUtcDateTimeString | null;
  last_validation_error: string | null;
  created_at: IsoUtcDateTimeString;
  updated_at: IsoUtcDateTimeString;
};

export type CtiConfigListResponse = {
  items: CtiConfig[];
};

export type CtiConfigUpdatePayload = {
  label?: string;
  api_key?: string;
};

export type CtiEnrichmentProvider =
  | 'abuseipdb'
  | 'greynoise'
  | 'ipdata'
  | 'rdap'
  | 'shodan'
  | 'virustotal';

export type CtiEnrichmentResponse = Record<string, unknown>;
