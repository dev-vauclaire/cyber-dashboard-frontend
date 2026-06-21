import { apiClient } from '../../../../../shared/api/client';
import type {
  AttackStatsDateRangeQuery,
  AttackSummary,
  AttacksBySourceResponse,
  AttacksBySourceTimeseriesResponse,
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

export async function fetchAttacksBySourceTimeseries(
  query: AttackStatsDateRangeQuery,
): Promise<AttacksBySourceTimeseriesResponse> {
  return apiClient.get<AttacksBySourceTimeseriesResponse>(
    '/api/stats/attacks/by-source-timeseries',
    {
      query,
    },
  );
}

export async function fetchAttacksByType(
  query: AttackStatsDateRangeQuery,
): Promise<AttacksByTypeResponse> {
  return apiClient.get<AttacksByTypeResponse>('/api/stats/attacks/by-type', {
    query,
  });
}
