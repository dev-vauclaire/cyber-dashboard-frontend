export const PARIS_LOCALE = 'fr-FR';
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

export function isValidUtcDateTime(value: string): boolean {
  return !Number.isNaN(new Date(value).getTime());
}

export function formatUtcDateTimeToParis(
  isoDate: string,
  options: Intl.DateTimeFormatOptions = DEFAULT_DATE_TIME_OPTIONS,
): string {
  if (!isValidUtcDateTime(isoDate)) {
    return '';
  }

  const date = new Date(isoDate);

  return date.toLocaleString(PARIS_LOCALE, {
    ...DEFAULT_DATE_TIME_OPTIONS,
    ...options,
    timeZone: PARIS_TIME_ZONE,
  });
}

export function formatUtcDateToParis(
  isoDate: string,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  },
): string {
  return formatUtcDateTimeToParis(isoDate, options);
}

function normalizeDateInput(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function formatDateToParisDayLabel(value: Date | string): string {
  const date = normalizeDateInput(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString(PARIS_LOCALE, {
    timeZone: PARIS_TIME_ZONE,
    day: '2-digit',
    month: 'short',
  });
}
