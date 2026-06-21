import CtiFieldList from './CtiFieldList';
import CtiProviderCard from './CtiProviderCard';
import CtiProviderPieChart from './CtiProviderPieChart';
import CtiToolContent from './CtiToolContent';
import { ABUSEIPDB_CATEGORIES_URL } from './constants';
import { getCtiEntries } from './helpers';
import type { AbuseIpdbEnrichmentResponse } from '../../../../../../../shared/cti/types';
import type { ChartItem, CtiToolComponentProps } from './types';

const FIELD_KEYS = [
  'abuse_confidence_score',
  'total_reports',
  'last_reported_at',
  'isp',
] as const satisfies readonly (keyof AbuseIpdbEnrichmentResponse)[];
const CATEGORY_COLORS = ['#0B6BCB', '#9C27B0', '#ED6C02', '#2E7D32', '#D32F2F', '#64748B'];

function buildCategoryChartData(
  payload: AbuseIpdbEnrichmentResponse | undefined,
): ChartItem[] {
  return (payload?.category_percentages ?? [])
    .filter((item) => item.percentage > 0)
    .map((item) => ({
      id: String(item.category_code),
      label: `Catégorie ${item.category_code}`,
      value: item.percentage,
    }));
}

export default function CtiAbuseipdb({ query }: CtiToolComponentProps<'abuseipdb'>) {
  const entries = getCtiEntries(query.data, FIELD_KEYS);
  const categoryData = buildCategoryChartData(query.data);

  return (
    <CtiProviderCard provider="abuseipdb" query={query} indicatorCount={entries.length}>
      <CtiToolContent>
        <CtiProviderPieChart
          colors={CATEGORY_COLORS}
          items={categoryData}
          title="Catégories de signalement"
          titleHref={ABUSEIPDB_CATEGORIES_URL}
        />
        <CtiFieldList entries={entries} />
      </CtiToolContent>
    </CtiProviderCard>
  );
}
