import type { CtiEnrichmentProvider } from './types';

export const ctiQueryKeys = {
  configs: ['ctiConfigs'] as const,
  enrichment: (provider: CtiEnrichmentProvider, ipAddress: string | null) =>
    ['ctiEnrichment', provider, ipAddress] as const,
  rdapEmailDefault: (ipAddress: string | null) =>
    ['ctiEnrichment', 'rdap', ipAddress, 'email-default'] as const,
};
