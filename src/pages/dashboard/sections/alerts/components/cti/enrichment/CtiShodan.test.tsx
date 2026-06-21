import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ShodanEnrichmentResponse } from '../../../../../../../shared/cti/types';
import CtiShodan from './CtiShodan';

const SHODAN_RESPONSE: ShodanEnrichmentResponse = {
  ip_address: '203.0.113.10',
  organization: 'Example organization',
  asn: 'AS64500',
  country_name: 'France',
  hostnames: ['gateway.example.test', 'vpn.example.test'],
  exposed_ports: ['22/tcp', '443/tcp'],
  services: ['OpenSSH', 'HTTPS'],
  known_vulnerabilities_count: 2,
  vulnerabilities: ['CVE-2024-0001', 'CVE-2024-0002'],
  last_observed_at: '2026-06-20T12:00:00Z',
};

describe('CtiShodan', () => {
  it('displays Shodan hostnames, services and vulnerabilities', () => {
    render(
      <CtiShodan
        query={{
          data: SHODAN_RESPONSE,
          isError: false,
          isLoading: false,
        }}
      />,
    );

    expect(screen.getByText("Noms d'hôte (2)")).toBeInTheDocument();
    expect(screen.getByText('gateway.example.test')).toBeInTheDocument();
    expect(screen.getByText('OpenSSH')).toBeInTheDocument();
    expect(screen.getByText('CVE-2024-0001')).toBeInTheDocument();
  });
});
