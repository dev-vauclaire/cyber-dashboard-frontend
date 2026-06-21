import { describe, expect, it } from 'vitest';
import { buildSourceColorRegistry, getSourceColor } from './sourceColors';
import type { Source } from '../types';

const baseSource: Source = {
  color: '#123456',
  created_at: '2026-06-19T00:00:00Z',
  domain_name: null,
  is_active: true,
  sensor_type_code: 'waf',
  sensor_type_label: 'WAF',
  source_id: 1,
  source_name: 'WAF Paris',
};

describe('sourceColors', () => {
  it('uses configured source colors before generated colors', () => {
    const registry = buildSourceColorRegistry([baseSource]);

    expect(
      getSourceColor({
        sourceId: baseSource.source_id,
        sourceName: baseSource.source_name,
        sourceColorRegistry: registry,
      }),
    ).toBe('#123456');
  });

  it('uses the API source color when the registry has no matching source', () => {
    expect(
      getSourceColor({
        sourceId: baseSource.source_id,
        sourceName: baseSource.source_name,
        sourceColor: '#ABCDEF',
        sourceColorRegistry: new Map(),
      }),
    ).toBe('#ABCDEF');
  });
});
