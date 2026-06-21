import CtiFieldList from './CtiFieldList';
import CtiProviderCard from './CtiProviderCard';
import CtiStringList from './CtiStringList';
import CtiToolContent from './CtiToolContent';
import { getCtiEntries } from './helpers';
import type { ShodanEnrichmentResponse } from '../../../../../../../shared/cti/types';
import type { CtiToolComponentProps } from './types';

const FIELD_KEYS = [
  'organization',
  'asn',
  'country_name',
  'exposed_ports',
  'known_vulnerabilities_count',
  'last_observed_at',
] as const satisfies readonly (keyof ShodanEnrichmentResponse)[];

export default function CtiShodan({ query }: CtiToolComponentProps<'shodan'>) {
  const entries = getCtiEntries(query.data, FIELD_KEYS);
  const hostnames = query.data?.hostnames ?? [];
  const services = query.data?.services ?? [];
  const vulnerabilities = query.data?.vulnerabilities ?? [];
  const indicatorCount =
    entries.length + hostnames.length + services.length + vulnerabilities.length;

  return (
    <CtiProviderCard provider="shodan" query={query} indicatorCount={indicatorCount}>
      <CtiToolContent>
        <CtiFieldList entries={entries} />
        <CtiStringList
          title="Noms d'hôte"
          items={hostnames}
          emptyLabel="Aucun nom d'hôte signalé."
        />
        <CtiStringList
          color="primary"
          title="Services détectés"
          items={services}
          emptyLabel="Aucun service identifié."
        />
        <CtiStringList
          color="error"
          title="Vulnérabilités"
          items={vulnerabilities}
          emptyLabel="Aucune vulnérabilité connue."
        />
      </CtiToolContent>
    </CtiProviderCard>
  );
}
