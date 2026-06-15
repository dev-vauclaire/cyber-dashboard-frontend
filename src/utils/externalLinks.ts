const OGO_WEB_BASE_URL = 'https://ogo.example.local';
const SERENICITY_WEB_BASE_URL = 'https://serenicity.example.local';

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
  domainName,
  externalId,
}: SourceExternalLinkInput): string | null {
  if ((collectorType === 'ogo' || sensorTypeCode === 'waf') && domainName) {
    return `${OGO_WEB_BASE_URL}/${encodeURIComponent(domainName)}`;
  }

  if (
    (collectorType === 'serenicity' ||
      sensorTypeCode === 'lurio' ||
      sensorTypeCode === 'detoxio') &&
    externalId
  ) {
    return `${SERENICITY_WEB_BASE_URL}/${encodeURIComponent(externalId)}`;
  }

  return null;
}
