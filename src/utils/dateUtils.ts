export const PARIS_TIME_ZONE = 'Europe/Paris';

const DEFAULT_DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: PARIS_TIME_ZONE,
};

export function formatUtcDateTimeToParis(
  isoDate: string,
  options: Intl.DateTimeFormatOptions = DEFAULT_DATE_TIME_OPTIONS,
): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('fr-FR', {
    ...DEFAULT_DATE_TIME_OPTIONS,
    ...options,
    timeZone: PARIS_TIME_ZONE,
  });
}
