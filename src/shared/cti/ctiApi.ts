import { apiClient } from '../api/client';
import type {
  CtiConfigListResponse,
  CtiConfig,
  CtiConfigUpdatePayload,
  CtiEnrichmentProvider,
  CtiEnrichmentResponseByProvider,
} from './types';

export async function fetchCtiConfigs(): Promise<CtiConfigListResponse> {
  return apiClient.get<CtiConfigListResponse>('/api/cti-config');
}

export async function patchCtiConfig(
  code: string,
  payload: CtiConfigUpdatePayload,
): Promise<CtiConfig> {
  return apiClient.patch<CtiConfig>(`/api/cti-config/${code}`, { body: payload });
}

export async function activateCtiConfig(code: string): Promise<CtiConfig> {
  return apiClient.post<CtiConfig>(`/api/cti-config/${code}/activate`);
}

export async function deactivateCtiConfig(code: string): Promise<CtiConfig> {
  return apiClient.post<CtiConfig>(`/api/cti-config/${code}/deactivate`);
}

export async function deleteCtiApiKey(code: string): Promise<CtiConfig> {
  return apiClient.delete<CtiConfig>(`/api/cti-config/${code}/api-key`);
}

export async function fetchCtiEnrichment<Provider extends CtiEnrichmentProvider>(
  provider: Provider,
  ipAddress: string,
): Promise<CtiEnrichmentResponseByProvider[Provider]> {
  return apiClient.get<CtiEnrichmentResponseByProvider[Provider]>(
    `/api/cti-enrichment/${provider}`,
    {
      query: { ip_address: ipAddress },
    },
  );
}
