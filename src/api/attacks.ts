import { apiClient } from './client';
import type { PaginatedAttacksQuery, PaginatedAttacksResponse } from '../types/attacks';

export async function fetchAttacks(
  query?: PaginatedAttacksQuery,
): Promise<PaginatedAttacksResponse> {
  return apiClient.get<PaginatedAttacksResponse>('/api/attacks', {
    query,
  });
}
