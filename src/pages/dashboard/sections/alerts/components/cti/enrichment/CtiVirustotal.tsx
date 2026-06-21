import CtiFieldList from './CtiFieldList';
import CtiProviderCard from './CtiProviderCard';
import CtiProviderPieChart from './CtiProviderPieChart';
import CtiToolContent from './CtiToolContent';
import { getCtiEntries } from './helpers';
import type {
  VirusTotalAnalysisStats,
  VirusTotalEnrichmentResponse,
} from '../../../../../../../shared/cti/types';
import type { ChartItem, CtiToolComponentProps } from './types';

const FIELD_KEYS = [
  'reputation',
  'country_code',
  'as_owner',
] as const satisfies readonly (keyof VirusTotalEnrichmentResponse)[];
const STAT_COLORS = ['#D32F2F', '#ED6C02', '#2E7D32', '#64748B', '#7B1FA2'];
const STAT_DEFINITIONS = [
  { key: 'malicious', label: 'Malicious' },
  { key: 'suspicious', label: 'Suspicious' },
  { key: 'harmless', label: 'Harmless' },
  { key: 'undetected', label: 'Undetected' },
  { key: 'timeout', label: 'Timeout' },
] as const satisfies readonly { key: keyof VirusTotalAnalysisStats; label: string }[];

function buildAnalysisChartData(
  payload: VirusTotalEnrichmentResponse | undefined,
): ChartItem[] {
  return STAT_DEFINITIONS.map(({ key, label }) => ({
    id: key,
    label,
    value: payload?.last_analysis_stats[key] ?? 0,
  })).filter((item) => item.value > 0);
}

export default function CtiVirustotal({ query }: CtiToolComponentProps<'virustotal'>) {
  const entries = getCtiEntries(query.data, FIELD_KEYS);
  const analysisData = buildAnalysisChartData(query.data);

  return (
    <CtiProviderCard provider="virustotal" query={query} indicatorCount={entries.length}>
      <CtiToolContent>
        <CtiProviderPieChart
          colors={STAT_COLORS}
          items={analysisData}
          title="Répartition des analyses"
        />
        <CtiFieldList entries={entries} />
      </CtiToolContent>
    </CtiProviderCard>
  );
}
