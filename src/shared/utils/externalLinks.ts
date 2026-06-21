type SourceExternalLinkInput = {
  collectorType?: string | null;
  sensorTypeCode?: string | null;
  domainName?: string | null;
  externalId?: string | null;
};

export function getCollectorPortalLabel({
  collectorType,
  sensorTypeCode,
}: Pick<SourceExternalLinkInput, 'collectorType' | 'sensorTypeCode'>): string {
  if (collectorType === 'ogo' || sensorTypeCode === 'waf') {
    return 'OGO';
  }
  if (
    collectorType === 'serenicity' ||
    sensorTypeCode === 'lurio' ||
    sensorTypeCode === 'detoxio'
  ) {
    return 'Serenicity';
  }
  return 'Portail';
}

export function buildSourceExternalUrl({
  collectorType,
  sensorTypeCode,
}: SourceExternalLinkInput): string | null {
  if (collectorType === 'ogo' || sensorTypeCode === 'waf') {
    return `https://dashboard.ogosecurity.com/#/auth/login`;
  }

  if (collectorType === 'serenicity' ||
      sensorTypeCode === 'lurio' ||
      sensorTypeCode === 'detoxio') 
  {
    return `https://control.serenicity.fr/login`;
  }

  return null;
}

export function buildIpTrackerUrl(ipAddress: string): string {
  return `https://www.ip-tracker.org/lookup.php?ip=${encodeURIComponent(ipAddress)}`;
}

export function buildTracerouteUrl(ipAddress: string): string {
  return `https://gsuite.tools/fr/traceroute?host=${encodeURIComponent(ipAddress)}`;
}
