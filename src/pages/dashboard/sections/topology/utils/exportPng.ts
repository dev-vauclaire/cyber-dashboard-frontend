import { toBlob } from 'html-to-image';

const MUI_COLOR_SCHEME_ATTRIBUTE = 'data-mui-color-scheme';

function getActiveMuiColorScheme(): string | null {
  return (
    document.documentElement.getAttribute(MUI_COLOR_SCHEME_ATTRIBUTE) ??
    document.body.getAttribute(MUI_COLOR_SCHEME_ATTRIBUTE)
  );
}

function applyTemporaryColorScheme(element: HTMLElement, colorScheme: string | null) {
  const previousColorSchemeAttribute = element.getAttribute(MUI_COLOR_SCHEME_ATTRIBUTE);
  const previousColorSchemeStyle = element.style.getPropertyValue('color-scheme');
  const previousColorSchemePriority = element.style.getPropertyPriority('color-scheme');

  if (colorScheme != null && colorScheme !== '') {
    element.setAttribute(MUI_COLOR_SCHEME_ATTRIBUTE, colorScheme);
    element.style.setProperty('color-scheme', colorScheme);
  }

  return () => {
    if (previousColorSchemeAttribute == null) {
      element.removeAttribute(MUI_COLOR_SCHEME_ATTRIBUTE);
    } else {
      element.setAttribute(MUI_COLOR_SCHEME_ATTRIBUTE, previousColorSchemeAttribute);
    }

    if (previousColorSchemeStyle === '') {
      element.style.removeProperty('color-scheme');
    } else {
      element.style.setProperty(
        'color-scheme',
        previousColorSchemeStyle,
        previousColorSchemePriority,
      );
    }
  };
}

function downloadBlob(blob: Blob, fileName: string) {
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = downloadUrl;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 30_000);
}

export async function exportElementAsPng(
  element: HTMLElement,
  fileName: string,
  backgroundColor: string,
) {
  const { height, width } = element.getBoundingClientRect();
  const exportWidth = Math.max(Math.ceil(width), 1);
  const exportHeight = Math.max(Math.ceil(height), 1);
  const restoreColorScheme = applyTemporaryColorScheme(element, getActiveMuiColorScheme());

  try {
    const blob = await toBlob(element, {
      backgroundColor,
      cacheBust: true,
      canvasHeight: exportHeight,
      canvasWidth: exportWidth,
      height: exportHeight,
      includeQueryParams: true,
      pixelRatio: 1,
      width: exportWidth,
    });

    if (blob == null) {
      throw new Error('PNG export blob unavailable');
    }

    downloadBlob(blob, fileName);
  } finally {
    restoreColorScheme();
  }
}
