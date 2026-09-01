import type { Locale } from '@/config/i18n';

export function parseMonth(value: string): Date {
  const [year, month] = value.split('-').map(Number);
  return new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, 1));
}

export function formatMonthYear(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(parseMonth(value));
}

export function monthsBetween(start: string, end: string | null): number {
  const from = parseMonth(start);
  const to = end ? parseMonth(end) : new Date();

  const months =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    (to.getUTCMonth() - from.getUTCMonth());

  return Math.max(0, months) + 1;
}

export type Duration = { years: number; months: number };

export function toDuration(totalMonths: number): Duration {
  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
  };
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatMetric(
  value: number,
  locale: Locale,
  prefix?: string,
  suffix?: string,
): string {
  return `${prefix ?? ''}${formatNumber(value, locale)}${suffix ?? ''}`;
}
