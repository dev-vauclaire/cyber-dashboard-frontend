import type { IsoUtcDateTimeString } from '../types/common';

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
  | 'virustotal'
  | 'ipinfo';

export type AbuseIpdbCategoryPercentage = {
  category_code: number;
  percentage: number;
};

export type AbuseIpdbEnrichmentResponse = {
  ip_address: string;
  abuse_confidence_score: number;
  country_code: string | null;
  isp: string | null;
  last_reported_at: IsoUtcDateTimeString | null;
  total_reports: number;
  category_percentages: AbuseIpdbCategoryPercentage[];
};

export type GreyNoiseEnrichmentResponse = {
  ip_address: string;
  classification: string | null;
  name: string | null;
  link: string | null;
  last_seen: string | null;
};

export type IpDataEnrichmentResponse = {
  ip_address: string;
  country_name: string | null;
  asn_name: string | null;
  is_threat: boolean;
};

export type IpinfoEnrichmentResponse = {
  ip_address: string;
  asn: string | null;
  as_name: string | null;
  as_domain: string | null;
  country_code: string | null;
  country: string | null;
  continent_code: string | null;
  continent: string | null;
};

export type RdapEnrichmentResponse = {
  ip_address: string;
  name: string | null;
  country: string | null;
  abuse_contact_email: string | null;
  start_address: string | null;
  end_address: string | null;
};

export type ShodanEnrichmentResponse = {
  ip_address: string;
  organization: string | null;
  asn: string | null;
  country_name: string | null;
  hostnames: string[];
  exposed_ports: string[];
  services: string[];
  known_vulnerabilities_count: number;
  vulnerabilities: string[];
  last_observed_at: IsoUtcDateTimeString | null;
};

export type VirusTotalAnalysisStats = {
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
  timeout: number;
};

export type VirusTotalEnrichmentResponse = {
  ip_address: string;
  reputation: number;
  country_code: string | null;
  as_owner: string | null;
  last_analysis_stats: VirusTotalAnalysisStats;
};

export type CtiEnrichmentResponseByProvider = {
  abuseipdb: AbuseIpdbEnrichmentResponse;
  greynoise: GreyNoiseEnrichmentResponse;
  ipdata: IpDataEnrichmentResponse;
  ipinfo: IpinfoEnrichmentResponse;
  rdap: RdapEnrichmentResponse;
  shodan: ShodanEnrichmentResponse;
  virustotal: VirusTotalEnrichmentResponse;
};
