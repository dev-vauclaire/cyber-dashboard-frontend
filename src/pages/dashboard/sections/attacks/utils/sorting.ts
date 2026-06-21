import type { AttackRecord } from '../types/attackTypes';

export function sortAttacksByOccurredAt(items: AttackRecord[]): AttackRecord[] {
  return items
    .slice()
    .sort(
      (left, right) =>
        new Date(right.occurred_at).getTime() - new Date(left.occurred_at).getTime(),
    );
}
