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
