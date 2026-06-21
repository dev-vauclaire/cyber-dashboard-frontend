export function getAveragePosition(values: number[], fallback: number): number {
  if (values.length === 0) {
    return fallback;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function getSpacedPositionsByPreferredY(
  preferredPositions: Array<{ id: number; y: number }>,
  minimumGap: number,
): Map<number, number> {
  const sortedPositions = [...preferredPositions].sort((first, second) => first.y - second.y);
  const spacedPositions = new Map<number, number>();
  const collisionGroups: Array<Array<{ id: number; y: number }>> = [];

  for (const position of sortedPositions) {
    const currentGroup = collisionGroups[collisionGroups.length - 1];
    const previousPosition = currentGroup?.[currentGroup.length - 1];

    if (!currentGroup || !previousPosition || position.y - previousPosition.y >= minimumGap) {
      collisionGroups.push([position]);
    } else {
      currentGroup.push(position);
    }
  }

  for (const group of collisionGroups) {
    const groupCenter = getAveragePosition(
      group.map((position) => position.y),
      group[0]?.y ?? 0,
    );
    const firstY = Math.max(0, groupCenter - ((group.length - 1) * minimumGap) / 2);

    group.forEach((position, index) => {
      spacedPositions.set(position.id, firstY + index * minimumGap);
    });
  }

  let previousY: number | null = null;
  for (const position of sortedPositions) {
    const currentY: number = spacedPositions.get(position.id) ?? position.y;
    const nextY: number = previousY == null ? currentY : Math.max(currentY, previousY + minimumGap);
    spacedPositions.set(position.id, nextY);
    previousY = nextY;
  }

  return spacedPositions;
}
