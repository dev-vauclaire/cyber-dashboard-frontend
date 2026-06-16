import ogoLogo from '../../../../../../assets/ogo_logo.png';
import serenicityLogo from '../../../../../../assets/serenicity_logo.png';

const COLLECTOR_LOGOS: Record<string, string> = {
  ogo: ogoLogo,
  serenicity: serenicityLogo,
};

export function getCollectorLogo(collectorType: string | null | undefined): string | null {
  if (!collectorType) {
    return null;
  }

  return COLLECTOR_LOGOS[collectorType.toLowerCase()] ?? null;
}
