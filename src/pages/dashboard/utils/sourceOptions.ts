import type { Source } from '../../../shared/sources/types';
import type { SourceColorRegistry } from '../../../shared/sources/utils/sourceColors';
import { getSourceColor } from '../../../shared/sources/utils/sourceColors';

export type SourceOption = {
  value: string;
  label: string;
  color: string;
};

export function buildSourceOptions(
  sources: Source[],
  sourceColorRegistry: SourceColorRegistry,
): SourceOption[] {
  return sources
    .slice()
    .sort((left, right) => left.source_name.localeCompare(right.source_name, 'fr'))
    .map((source) => ({
      value: String(source.source_id),
      label: source.source_name,
      color: getSourceColor({
        sourceId: source.source_id,
        sourceName: source.source_name,
        sourceColor: source.color,
        sourceColorRegistry,
      }),
    }));
}
