import type { SourceColorInput } from '../types/sources';

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

export function resolveSourceColor({
  sourceId,
  sourceName,
  sourceColor,
}: SourceColorInput) {
  if (sourceColor != null && sourceColor.trim() !== '') {
    return sourceColor;
  }

  const lookupKey = getSourceColorKey({ sourceId, sourceName });
  const paletteIndex = hashLabel(lookupKey) % SOURCE_COLOR_PALETTE.length;

  return SOURCE_COLOR_PALETTE[paletteIndex];
}

export const getSourceColor = resolveSourceColor;
