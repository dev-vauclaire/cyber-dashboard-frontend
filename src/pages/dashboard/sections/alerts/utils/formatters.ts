import type { SourceOption } from '../../../utils/sourceOptions';
import type { CommonIpAlertDetail } from '../types/alertTypes';

export function formatSourceCount(value: number): string {
  return `${value} source${value > 1 ? 's' : ''}`;
}

export function buildDetailSummary(detail: CommonIpAlertDetail | undefined): string {
  if (detail == null) {
    return '';
  }

  const totalHits = detail.sources.reduce((sum, source) => sum + source.hit_count, 0);

  return `${detail.sources.length} source${detail.sources.length > 1 ? 's' : ''} · ${totalHits} occurrence${totalHits > 1 ? 's' : ''}`;
}

export function formatSelectedSources(
  sourceIds: string[],
  sourceOptions: SourceOption[],
) {
  if (sourceIds.length === 0) {
    return 'Toutes les sources';
  }

  const selectedLabels = sourceIds
    .map((sourceId) => sourceOptions.find((option) => option.value === sourceId)?.label)
    .filter((label): label is string => label != null);

  if (selectedLabels.length === 0) {
    return `${sourceIds.length} source${sourceIds.length > 1 ? 's' : ''}`;
  }

  if (selectedLabels.length <= 2) {
    return selectedLabels.join(', ');
  }

  return `${selectedLabels.length} sources sélectionnées`;
}
