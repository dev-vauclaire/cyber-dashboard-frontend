import { apiClient } from './client';
import type {
  AttacksCollectorConfig,
  AttacksCollectorConfigListResponse,
  AttacksCollectorConfigPayload,
  AttacksCollectorInventoryRequestResponse,
} from '../types/collectors';

export async function fetchAttacksCollectorConfigs(): Promise<AttacksCollectorConfigListResponse> {
  return apiClient.get<AttacksCollectorConfigListResponse>('/api/attacks-collector-config');
}

export async function createAttacksCollectorConfig(
  payload: Required<Pick<AttacksCollectorConfigPayload, 'collector_type' | 'name'>> &
    AttacksCollectorConfigPayload,
): Promise<AttacksCollectorConfig> {
  return apiClient.post<AttacksCollectorConfig>('/api/attacks-collector-config', {
    body: payload,
  });
}

export async function patchAttacksCollectorConfig(
  configId: number,
  payload: AttacksCollectorConfigPayload,
): Promise<AttacksCollectorConfig> {
  return apiClient.patch<AttacksCollectorConfig>(
    `/api/attacks-collector-config/${configId}`,
    { body: payload },
  );
}

export async function activateAttacksCollectorConfig(
  configId: number,
): Promise<AttacksCollectorConfig> {
  return apiClient.post<AttacksCollectorConfig>(
    `/api/attacks-collector-config/${configId}/activate`,
  );
}

export async function deactivateAttacksCollectorConfig(
  configId: number,
): Promise<AttacksCollectorConfig> {
  return apiClient.post<AttacksCollectorConfig>(
    `/api/attacks-collector-config/${configId}/deactivate`,
  );
}

export async function deleteAttacksCollectorApiKey(
  configId: number,
): Promise<AttacksCollectorConfig> {
  return apiClient.delete<AttacksCollectorConfig>(
    `/api/attacks-collector-config/${configId}/api-key`,
  );
}

export async function deleteAttacksCollectorEmail(
  configId: number,
): Promise<AttacksCollectorConfig> {
  return apiClient.delete<AttacksCollectorConfig>(
    `/api/attacks-collector-config/${configId}/email`,
  );
}

export async function requestAttacksCollectorInventory(
  configId: number,
): Promise<AttacksCollectorInventoryRequestResponse> {
  return apiClient.post<AttacksCollectorInventoryRequestResponse>(
    `/api/attacks-collector-config/${configId}/request-inventory`,
  );
}
