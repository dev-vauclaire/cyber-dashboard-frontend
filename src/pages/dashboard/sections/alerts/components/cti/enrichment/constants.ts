import type { CtiEnrichmentProvider } from '../../../../../../../shared/cti/types';

export const PROVIDER_ORDER: CtiEnrichmentProvider[] = [
  'virustotal',
  'abuseipdb',
  'ipdata',
  'rdap',
  'greynoise',
  'shodan',
];

export const PROVIDER_LABELS: Record<CtiEnrichmentProvider, string> = {
  abuseipdb: 'AbuseIPDB',
  greynoise: 'GreyNoise',
  ipdata: 'IPData',
  rdap: 'RDAP',
  shodan: 'Shodan',
  virustotal: 'VirusTotal',
};

export const FIELD_LABELS: Record<string, string> = {
  abuse_confidence_score: 'Score AbuseIPDB',
  abuse_contact_email: 'Contact abuse',
  as_owner: 'Propriétaire AS',
  asn: 'ASN',
  asn_name: 'Nom ASN',
  classification: 'Classification',
  country: 'Pays',
  country_code: 'Code pays',
  country_name: 'Pays',
  end_address: 'Fin de plage',
  exposed_ports: 'Ports exposés',
  is_threat: 'Menace détectée',
  isp: 'Fournisseur',
  known_vulnerabilities_count: 'Vulnérabilités connues',
  last_observed_at: 'Dernière observation',
  last_reported_at: 'Dernier signalement',
  last_seen: 'Dernière détection',
  link: 'Lien',
  name: 'Nom',
  organization: 'Organisation',
  reputation: 'Réputation',
  start_address: 'Début de plage',
  total_reports: 'Signalements',
};

export const ABUSEIPDB_CATEGORIES_URL = 'https://www.abuseipdb.com/categories';
