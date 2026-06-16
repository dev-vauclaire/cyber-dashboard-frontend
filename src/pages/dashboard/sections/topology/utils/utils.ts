
{/* function qui calcul une moyenne */}
export function getAveragePosition(values: number[], fallback: number): number {
  if (values.length === 0) {
    return fallback;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
{/* Fonction qui replace les positions des éléments pour éviter les collisions */}
export function getSpacedPositionsByPreferredY(
  preferredPositions: Array<{ id: number; y: number }>,
  minimumGap: number,
): Map<number, number> {
  {/* On commence par trier les positions préférées par ordre croissant de y */}
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

{/* Fonction qui récupère le CSS du document */}
export function getDocumentCssText(): string {
  return Array.from(document.styleSheets)
    .map((styleSheet) => {
      try {
        return Array.from(styleSheet.cssRules)
          .map((rule) => rule.cssText)
          .join('\n');
      } catch {
        return '';
      }
    })
    .join('\n');
}

{/* Fonction qui exporte un élément HTML en PNG */}
export async function exportElementAsPng(element: HTMLElement, fileName: string, backgroundColor: string) {
  const { height, width } = element.getBoundingClientRect();
  const exportWidth = Math.max(Math.ceil(width), 1);
  const exportHeight = Math.max(Math.ceil(height), 1);
  const clonedElement = element.cloneNode(true) as HTMLElement;
  clonedElement.style.background = backgroundColor;
  clonedElement.style.height = `${exportHeight}px`;
  clonedElement.style.width = `${exportWidth}px`;

  const cssText = getDocumentCssText();
  const serializedNode = new XMLSerializer().serializeToString(clonedElement);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${exportWidth}" height="${exportHeight}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width:${exportWidth}px;height:${exportHeight}px;background:${backgroundColor};">
          <style>${cssText}</style>
          ${serializedNode}
        </div>
      </foreignObject>
    </svg>
  `;
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Topology export image failed to load'));
      image.src = svgUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = exportWidth;
    canvas.height = exportHeight;
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas context unavailable');
    }

    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, exportWidth, exportHeight);
    context.drawImage(image, 0, 0);

    const downloadUrl = canvas.toDataURL('image/png');
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = fileName;
    anchor.click();
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}
