import CtiFieldList from './CtiFieldList';
import CtiProviderCard from './CtiProviderCard';
import CtiToolContent from './CtiToolContent';
import { getCtiEntries } from './helpers';
import type { RdapEnrichmentResponse } from '../../../../../../../shared/cti/types';
import type { CtiToolComponentProps } from './types';

const FIELD_KEYS = [
  'start_address',
  'end_address',
  'name',
  'country',
  'abuse_contact_email',
] as const satisfies readonly (keyof RdapEnrichmentResponse)[];

export default function CtiRdap({ query }: CtiToolComponentProps<'rdap'>) {
  const entries = getCtiEntries(query.data, FIELD_KEYS);

  return (
    <CtiProviderCard provider="rdap" query={query} indicatorCount={entries.length}>
      <CtiToolContent>
        <CtiFieldList entries={entries} />
      </CtiToolContent>
    </CtiProviderCard>
  );
}
