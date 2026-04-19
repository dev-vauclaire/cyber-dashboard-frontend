import type { SourceColorDescriptor } from '../types/dashboard';

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

export function getSourceColor({ sourceId, sourceName, color }: SourceColorDescriptor) {
  if (color != null && color.trim() !== '') {
    return color;
  }

  const lookupKey = `${sourceId ?? ''}-${sourceName.trim().toLowerCase()}`;
  const paletteIndex = hashLabel(lookupKey) % SOURCE_COLOR_PALETTE.length;

  return SOURCE_COLOR_PALETTE[paletteIndex];
}
