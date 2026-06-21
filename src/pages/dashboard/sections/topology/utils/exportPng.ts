function getDocumentCssText(): string {
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

export async function exportElementAsPng(
  element: HTMLElement,
  fileName: string,
  backgroundColor: string,
) {
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
