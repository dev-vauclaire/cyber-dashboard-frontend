import detoxioLogo from '../../../../../../assets/detoxio_logo.png';
import lurioLogo from '../../../../../../assets/lurio_logo.png';
import wafLogo from '../../../../../../assets/waf_logo.png';

const SOURCE_LOGOS: Record<string, string> = {
    detoxio: detoxioLogo,
    lurio: lurioLogo,
    waf: wafLogo,
};

export function getSourceLogo(sourceType: string | null | undefined): string | null {
  if (!sourceType) {
    return null;
  }

  return SOURCE_LOGOS[sourceType.toLowerCase()] ?? null;
}
