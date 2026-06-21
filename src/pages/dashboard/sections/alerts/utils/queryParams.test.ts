import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import { buildCommonIpAlertsQuery } from './queryParams';

describe('buildCommonIpAlertsQuery', () => {
  it('maps local filters to API query params', () => {
    expect(
      buildCommonIpAlertsQuery(
        {
          sourceIds: ['1', '3'],
          dateRange: {
            from: dayjs('2026-06-18'),
            to: dayjs('2026-06-19'),
          },
          minDistinctSourceCount: '2',
        },
        { page: 1, pageSize: 50 },
      ),
    ).toMatchObject({
      limit: 50,
      min_distinct_source_count: 2,
      page: 2,
      source_id: [1, 3],
    });
  });
});
