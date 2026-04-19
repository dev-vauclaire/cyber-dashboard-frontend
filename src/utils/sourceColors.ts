import type { Source, SourceColorInput } from '../types/sources';

const SOURCE_COLOR_PALETTE = [
  '#0F766E',
  '#2563EB',
  '#B45309',
  '#047857',
  '#BE123C',
  '#4F46E5',
  '#0369A1',
  '#475569',
];

export type SourceColorRegistry = ReadonlyMap<string, string>;

function hashLabel(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function getSourceColorKey({ sourceId, sourceName }: Pick<SourceColorInput, 'sourceId' | 'sourceName'>) {
  return `${sourceId ?? ''}-${sourceName.trim().toLowerCase()}`;
}

function normalizeSourceName(sourceName: string) {
  return sourceName.trim().toLowerCase();
}

function getSourceIdRegistryKey(sourceId: SourceColorInput['sourceId']) {
  return sourceId == null ? null : `id:${String(sourceId)}`;
}

function getSourceNameRegistryKey(sourceName: SourceColorInput['sourceName']) {
  return `name:${normalizeSourceName(sourceName)}`;
}

function getRegistrySourceColorByKey(
  registryKey: string | null,
  sourceColorRegistry: SourceColorInput['sourceColorRegistry'],
) {
  if (registryKey == null || sourceColorRegistry == null) {
    return null;
  }

  const color = sourceColorRegistry.get(registryKey);

  if (color == null || color.trim() === '') {
    return null;
  }

  return color;
}

function getRegistrySourceColor({
  sourceId,
  sourceName,
  sourceColorRegistry,
}: Pick<SourceColorInput, 'sourceId' | 'sourceName' | 'sourceColorRegistry'>) {
  const sourceIdColor = getRegistrySourceColorByKey(
    getSourceIdRegistryKey(sourceId),
    sourceColorRegistry,
  );

  if (sourceIdColor != null) {
    return sourceIdColor;
  }

  return getRegistrySourceColorByKey(
    getSourceNameRegistryKey(sourceName),
    sourceColorRegistry,
  );
}

export function buildSourceColorRegistry(sources: Source[]): SourceColorRegistry {
  return new Map(
    sources.flatMap((source) => {
      if (source.color == null || source.color.trim() === '') {
        return [];
      }

      return [
        [`id:${String(source.source_id)}`, source.color] as const,
        [`name:${normalizeSourceName(source.source_name)}`, source.color] as const,
      ];
    }),
  );
}

export function resolveSourceColor({
  sourceId,
  sourceName,
  sourceColor,
  sourceColorRegistry,
}: SourceColorInput) {
  if (sourceColorRegistry != null) {
    const registryColor = getRegistrySourceColor({
      sourceId,
      sourceName,
      sourceColorRegistry,
    });

    if (registryColor != null) {
      return registryColor;
    }
  } else if (sourceColor != null && sourceColor.trim() !== '') {
    return sourceColor;
  }

  const lookupKey = getSourceColorKey({ sourceId, sourceName });
  const paletteIndex = hashLabel(lookupKey) % SOURCE_COLOR_PALETTE.length;

  return SOURCE_COLOR_PALETTE[paletteIndex];
}

export const getSourceColor = resolveSourceColor;
