import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import { buildPaginatedAttacksQuery } from './queryParams';

describe('buildPaginatedAttacksQuery', () => {
  it('maps pagination and filters to API query params', () => {
    expect(
      buildPaginatedAttacksQuery(
        {
          sourceId: '42',
          dateRange: {
            from: dayjs('2026-06-18'),
            to: dayjs('2026-06-19'),
          },
        },
        { page: 2, pageSize: 20 },
      ),
    ).toMatchObject({
      page: 3,
      page_size: 20,
      source_id: 42,
    });
  });
});
