import { FIELD_LABELS } from './constants';
import type { CtiFieldEntry } from './types';

export function formatValue(value: unknown): string {
  if (value == null || value === '') {
    return 'Non disponible';
  }
  if (typeof value === 'boolean') {
    return value ? 'Oui' : 'Non';
  }
  if (Array.isArray(value)) {
    return value.length === 0 ? 'Non disponible' : value.join(', ');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

export function getFieldLabel(key: string): string {
  return FIELD_LABELS[key] ?? key;
}

export function getCtiEntries<Payload extends object>(
  payload: Payload | undefined,
  fieldKeys: readonly (keyof Payload & string)[],
): CtiFieldEntry[] {
  return fieldKeys.map((key) => [key, payload?.[key]] as const);
}
