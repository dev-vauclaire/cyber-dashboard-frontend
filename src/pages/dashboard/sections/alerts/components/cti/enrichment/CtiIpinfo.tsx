import CtiFieldList from './CtiFieldList';
import CtiProviderCard from './CtiProviderCard';
import CtiToolContent from './CtiToolContent';
import { getCtiEntries } from './helpers';
import type { IpinfoEnrichmentResponse } from '../../../../../../../shared/cti/types';
import type { CtiToolComponentProps } from './types';

const FIELD_KEYS = [
  'asn',
  'as_name',
  'as_domain',
  'country',
  'country_code',
  'continent',
  'continent_code',
] as const satisfies readonly (keyof IpinfoEnrichmentResponse)[];

export default function CtiIpinfo({ query }: CtiToolComponentProps<'ipinfo'>) {
  const entries = getCtiEntries(query.data, FIELD_KEYS);

  return (
    <CtiProviderCard provider="ipinfo" query={query} indicatorCount={entries.length}>
      <CtiToolContent>
        <CtiFieldList entries={entries} />
      </CtiToolContent>
    </CtiProviderCard>
  );
}
