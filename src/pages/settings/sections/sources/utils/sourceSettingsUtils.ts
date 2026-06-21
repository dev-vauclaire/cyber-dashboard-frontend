import type { Source, SourceInventoryItem } from '../../../../../shared/sources/types';

export function sortSources(items: Source[]): Source[] {
  return items.slice().sort((left, right) => {
    if (left.is_active !== right.is_active) {
      return left.is_active ? -1 : 1;
    }

    return left.source_name.localeCompare(right.source_name, 'fr');
  });
}

export function sortInventoryItems(items: SourceInventoryItem[]): SourceInventoryItem[] {
  return items
    .slice()
    .sort((left, right) => left.sensor_type_label.localeCompare(right.sensor_type_label, 'fr'));
}

export function getSourceStatusLabel(isActive: boolean): string {
  return isActive ? 'Active' : 'Inactive';
}

export function getSensorTypeLabel(source: Source): string {
  return source.sensor_type_label.trim() === ''
    ? source.sensor_type_code.toUpperCase()
    : source.sensor_type_label;
}
