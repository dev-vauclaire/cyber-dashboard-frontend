import type { Dayjs } from 'dayjs';

const PARIS_LOCALE = 'fr-FR';
const PARIS_TIME_ZONE = 'Europe/Paris';

export type DayjsDateRange = {
  from: Dayjs | null;
  to: Dayjs | null;
};

const PARIS_DATE_TIME_FORMATTER = new Intl.DateTimeFormat(PARIS_LOCALE, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: PARIS_TIME_ZONE,
  hourCycle: 'h23',
});

function parseDate(value: string | null | undefined): Date | null {
  if (value == null || value.trim() === '') {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getDateTimePart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
) {
  return parts.find((part) => part.type === type)?.value ?? '';
}

export function formatDate(dateString: string | null | undefined): string {
  const date = parseDate(dateString);

  if (date == null) {
    return '';
  }

  const parts = PARIS_DATE_TIME_FORMATTER.formatToParts(date);
  const day = getDateTimePart(parts, 'day');
  const month = getDateTimePart(parts, 'month');
  const year = getDateTimePart(parts, 'year');
  const hour = getDateTimePart(parts, 'hour');
  const minute = getDateTimePart(parts, 'minute');
  const second = getDateTimePart(parts, 'second');

  return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
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

function parseTimeZoneOffsetMinutes(value: string): number {
  if (value === 'GMT' || value === 'UTC') {
    return 0;
  }

  const match = value.match(/(?:GMT|UTC)([+-])(\d{1,2})(?::?(\d{2}))?/);

  if (match == null) {
    return 0;
  }

  const [, sign, hours, minutes] = match;
  const totalMinutes = Number(hours) * 60 + Number(minutes ?? '0');

  return sign === '-' ? -totalMinutes : totalMinutes;
}

function getTimeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const timeZoneName =
    formatter.formatToParts(date).find((part) => part.type === 'timeZoneName')?.value ??
    'GMT';

  return parseTimeZoneOffsetMinutes(timeZoneName);
}

export function buildParisDayBoundaryUtcIso(
  value: Dayjs,
  boundary: 'start' | 'end',
): string {
  const hours = boundary === 'start' ? 0 : 23;
  const minutes = boundary === 'start' ? 0 : 59;
  const seconds = boundary === 'start' ? 0 : 59;
  const milliseconds = boundary === 'start' ? 0 : 999;
  const utcGuess = new Date(
    Date.UTC(
      value.year(),
      value.month(),
      value.date(),
      hours,
      minutes,
      seconds,
      milliseconds,
    ),
  );
  const offsetMinutes = getTimeZoneOffsetMinutes(utcGuess, PARIS_TIME_ZONE);

  return new Date(utcGuess.getTime() - offsetMinutes * 60 * 1000).toISOString();
}

export function normalizeDayjsDateRange(
  currentRange: DayjsDateRange,
  field: keyof DayjsDateRange,
  nextValue: Dayjs | null,
): DayjsDateRange {
  if (field === 'from') {
    if (nextValue == null) {
      return {
        ...currentRange,
        from: null,
      };
    }

    if (currentRange.to != null && nextValue.isAfter(currentRange.to, 'day')) {
      return {
        from: nextValue,
        to: nextValue,
      };
    }

    return {
      ...currentRange,
      from: nextValue,
    };
  }

  if (nextValue == null) {
    return {
      ...currentRange,
      to: null,
    };
  }

  if (currentRange.from != null && nextValue.isBefore(currentRange.from, 'day')) {
    return {
      from: nextValue,
      to: nextValue,
    };
  }

  return {
    ...currentRange,
    to: nextValue,
  };
}
