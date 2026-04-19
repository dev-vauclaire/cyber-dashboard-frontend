import dayjs from 'dayjs';
import type { DashboardGlobalDateRange } from '../types/dashboard';
import type { AttackStatsDateRangeQuery } from '../types/stats';

export function createDefaultDashboardGlobalDateRange(): DashboardGlobalDateRange {
  const today = dayjs();

  return {
    from: today.subtract(6, 'day'),
    to: today,
  };
}

export function formatDashboardGlobalDateRange(
  globalDateRange: DashboardGlobalDateRange,
): string {
  const fromLabel = globalDateRange.from?.format('DD/MM/YYYY') ?? 'non definie';
  const toLabel = globalDateRange.to?.format('DD/MM/YYYY') ?? 'non definie';

  return `${fromLabel} -> ${toLabel}`;
}

export function buildDashboardAttackStatsDateRangeQuery(
  globalDateRange: DashboardGlobalDateRange,
): AttackStatsDateRangeQuery | null {
  if (globalDateRange.from == null || globalDateRange.to == null) {
    return null;
  }

  const fromDate = globalDateRange.from.format('YYYY-MM-DD');
  const toDate = globalDateRange.to.format('YYYY-MM-DD');

  return {
    from: `${fromDate}T00:00:00Z`,
    to: `${toDate}T23:59:59Z`,
  };
}
