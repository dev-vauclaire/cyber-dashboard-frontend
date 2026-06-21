import CtiFieldList from './CtiFieldList';
import CtiProviderCard from './CtiProviderCard';
import CtiToolContent from './CtiToolContent';
import { getCtiEntries } from './helpers';
import type { GreyNoiseEnrichmentResponse } from '../../../../../../../shared/cti/types';
import type { CtiToolComponentProps } from './types';

const FIELD_KEYS = [
  'classification',
  'name',
  'last_seen',
  'link',
] as const satisfies readonly (keyof GreyNoiseEnrichmentResponse)[];

export default function CtiGreynoise({ query }: CtiToolComponentProps<'greynoise'>) {
  const entries = getCtiEntries(query.data, FIELD_KEYS);

  return (
    <CtiProviderCard provider="greynoise" query={query} indicatorCount={entries.length}>
      <CtiToolContent>
        <CtiFieldList entries={entries} />
      </CtiToolContent>
    </CtiProviderCard>
  );
}
