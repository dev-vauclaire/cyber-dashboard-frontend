/* Logo des types de collecteurs */
import ogoLogo from '../../../assets/ogo_logo.png';
import serenicityLogo from '../../../assets/serenicity_logo.png';

/* Logo des types de capteurs */
import detoxioLogo from '../../../assets/detoxio_logo.png';
import lurioLogo from '../../../assets/lurio_logo.png';
import wafLogo from '../../../assets/waf_logo.png';

/* Logos des outils CTI */
import abuseipdbLogo from '../../../assets/abuseipdb_logo.png';
import greynoiseLogo from '../../../assets/greynoise_logo.png';
import ipdataLogo from '../../../assets/ipdata_logo.png';
import rdapLogo from '../../../assets/rdap_logo.png';
import shodanLogo from '../../../assets/shodan_logo.png';
import virustotalLogo from '../../../assets/virustotal_logo.png';
import ipinfologo from '../../../assets/ipinfo_logo.png'

const COLLECTOR_LOGOS: Record<string, string> = {
  ogo: ogoLogo,
  serenicity: serenicityLogo,
};

const SOURCE_LOGOS: Record<string, string> = {
    detoxio: detoxioLogo,
    lurio: lurioLogo,
    waf: wafLogo,
};

const CTI_TOOL_LOGOS: Record<string, string> = {
  abuseipdb: abuseipdbLogo,
  greynoise: greynoiseLogo,
  ipdata: ipdataLogo,
  rdap: rdapLogo,
  shodan: shodanLogo,
  virustotal: virustotalLogo,
  ipinfo: ipinfologo,
};

export function getCollectorLogo(collectorType: string | null | undefined): string | null {
  if (!collectorType) {
    return null;
  }

  return COLLECTOR_LOGOS[collectorType.toLowerCase()] ?? null;
}

export function getSourceLogo(sourceType: string | null | undefined): string | null {
  if (!sourceType) {
    return null;
  }

  return SOURCE_LOGOS[sourceType.toLowerCase()] ?? null;
}

export function getCtiToolLogo(toolName: string | null | undefined): string | null {
  if (!toolName) {
    return null;
  }

  return CTI_TOOL_LOGOS[toolName.toLowerCase()] ?? null;
}
