import dayjs from 'dayjs';
import type { DashboardGlobalDateRange } from '../types/dashboard';

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
