import CtiFieldList from './CtiFieldList';
import CtiProviderCard from './CtiProviderCard';
import CtiToolContent from './CtiToolContent';
import { getCtiEntries } from './helpers';
import type { IpDataEnrichmentResponse } from '../../../../../../../shared/cti/types';
import type { CtiToolComponentProps } from './types';

const FIELD_KEYS = [
  'country_name',
  'asn_name',
  'is_threat',
] as const satisfies readonly (keyof IpDataEnrichmentResponse)[];

export default function CtiIpdata({ query }: CtiToolComponentProps<'ipdata'>) {
  const entries = getCtiEntries(query.data, FIELD_KEYS);

  return (
    <CtiProviderCard provider="ipdata" query={query} indicatorCount={entries.length}>
      <CtiToolContent>
        <CtiFieldList entries={entries} />
      </CtiToolContent>
    </CtiProviderCard>
  );
}
