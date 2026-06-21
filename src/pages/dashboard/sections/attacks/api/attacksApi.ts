import { apiClient } from '../../../../../shared/api/client';
import type { PaginatedAttacksQuery, PaginatedAttacksResponse } from '../types/attackTypes';

export async function fetchAttacks(
  query?: PaginatedAttacksQuery,
): Promise<PaginatedAttacksResponse> {
  return apiClient.get<PaginatedAttacksResponse>('/api/attacks', {
    query,
  });
}
