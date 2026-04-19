import { apiClient } from './client';
import type {
  AttackStatsDateRangeQuery,
  AttackSummary,
  AttacksBySourceResponse,
  AttacksByTypeResponse,
} from '../types/stats';

export async function fetchAttackSummary(
  query: AttackStatsDateRangeQuery,
): Promise<AttackSummary> {
  return apiClient.get<AttackSummary>('/api/stats/attacks/summary', {
    query,
  });
}

export async function fetchAttacksBySource(
  query: AttackStatsDateRangeQuery,
): Promise<AttacksBySourceResponse> {
  return apiClient.get<AttacksBySourceResponse>('/api/stats/attacks/by-source', {
    query,
  });
}

export async function fetchAttacksByType(
  query: AttackStatsDateRangeQuery,
): Promise<AttacksByTypeResponse> {
  return apiClient.get<AttacksByTypeResponse>('/api/stats/attacks/by-type', {
    query,
  });
}
