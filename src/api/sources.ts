import { apiClient } from './client';
import type {
  PatchSourceActiveStatusPayload,
  PatchSourceNamePayload,
  SourceInventoryResponse,
  SourcesListResponse,
} from '../types/sources';

export async function fetchSources(): Promise<SourcesListResponse> {
  return apiClient.get<SourcesListResponse>('/api/sources');
}

export async function fetchSourceInventory(): Promise<SourceInventoryResponse> {
  return apiClient.get<SourceInventoryResponse>('/api/sources/inventory');
}

export async function patchSourceName(
  sourceId: number,
  payload: PatchSourceNamePayload,
): Promise<void> {
  await apiClient.patch(`/api/sources/${sourceId}/name`, {
    body: payload,
  });
}

export async function patchSourceActiveStatus(
  sourceId: number,
  payload: PatchSourceActiveStatusPayload,
): Promise<void> {
  await apiClient.patch(`/api/sources/${sourceId}/is_active`, {
    body: payload,
  });
}
