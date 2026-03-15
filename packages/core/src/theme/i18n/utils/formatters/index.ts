/**
 * Utilidades de formateo i18n
 * Design System Rottay - Wave 0 - Agente D
 */

import { errorInDev } from '../../../../core/utils/runtime-logger';

/**
 * Formatea una fecha según el locale.
 */
export function formatDate(
  date: Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    };

    return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
  } catch (error) {
    errorInDev('Error formatting date:', error);
    return date.toLocaleDateString();
  }
}

/**
 * Formatea un número según el locale.
 */
export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions
): string {
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch (error) {
    errorInDev('Error formatting number:', error);
    return value.toString();
  }
}

/**
 * Formatea una cantidad de dinero según el locale.
 */
export function formatCurrency(
  value: number,
  locale: string,
  currency: string = 'USD'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  } catch (error) {
    errorInDev('Error formatting currency:', error);
    return `${currency} ${value.toFixed(2)}`;
  }
}

/**
 * Formatea una fecha relativa ("hace 5 minutos").
 */
export function formatRelativeTime(
  date: Date,
  locale: string
): string {
  try {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Calcular la unidad apropiada
    const units: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
      { unit: 'year', seconds: 31536000 },
      { unit: 'month', seconds: 2592000 },
      { unit: 'week', seconds: 604800 },
      { unit: 'day', seconds: 86400 },
      { unit: 'hour', seconds: 3600 },
      { unit: 'minute', seconds: 60 },
      { unit: 'second', seconds: 1 },
    ];

    for (const { unit, seconds } of units) {
      const value = Math.floor(diffInSeconds / seconds);
      if (value !== 0) {
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
        return rtf.format(-value, unit);
      }
    }

    // Si la diferencia es 0, devolver "ahora"
    return locale.startsWith('es') ? 'ahora' :
           locale.startsWith('pt') ? 'agora' :
           locale.startsWith('fr') ? 'maintenant' :
           'now';
  } catch (error) {
    errorInDev('Error formatting relative time:', error);
    return formatDate(date, locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

/**
 * Formatea un porcentaje según el locale.
 */
export function formatPercent(
  value: number,
  locale: string,
  decimals: number = 0
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch (error) {
    errorInDev('Error formatting percent:', error);
    return `${(value * 100).toFixed(decimals)}%`;
  }
}

/**
 * Formatea un rango de fechas según el locale.
 */
export function formatDateRange(
  startDate: Date,
  endDate: Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    };

    // Usar Intl.DateTimeFormat con formatRange si está disponible
    const formatter = new Intl.DateTimeFormat(locale, defaultOptions) as any;

    if (typeof formatter.formatRange === 'function') {
      return formatter.formatRange(startDate, endDate);
    }

    // Fallback: formatear las fechas por separado
    const start = formatter.format(startDate);
    const end = formatter.format(endDate);
    const separator = locale.startsWith('es') || locale.startsWith('pt') ? ' - ' : ' – ';
    return `${start}${separator}${end}`;
  } catch (error) {
    errorInDev('Error formatting date range:', error);
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  }
}

/**
 * Formatea un tamaño de archivo en bytes a formato legible (KB, MB, GB).
 */
export function formatFileSize(
  bytes: number,
  locale: string,
  decimals: number = 2
): string {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  return `${formatNumber(value, locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} ${sizes[i]}`;
}

/**
 * Formatea una lista de elementos según el locale.
 */
export function formatList(
  items: string[],
  locale: string,
  type: 'conjunction' | 'disjunction' = 'conjunction'
): string {
  try {
    // Intl.ListFormat puede no estar disponible en todos los entornos
    if (typeof (Intl as any).ListFormat === 'function') {
      const ListFormat = (Intl as any).ListFormat;
      return new ListFormat(locale, {
        style: 'long',
        type,
      }).format(items);
    }

    // Fallback manual
    const separator = type === 'conjunction' ?
      (locale.startsWith('es') ? ' y ' :
       locale.startsWith('pt') ? ' e ' :
       locale.startsWith('fr') ? ' et ' : ' and ') :
      (locale.startsWith('es') || locale.startsWith('pt') ? ' o ' :
       locale.startsWith('fr') ? ' ou ' : ' or ');

    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return items.join(separator);

    return items.slice(0, -1).join(', ') + separator + items[items.length - 1];
  } catch (error) {
    errorInDev('Error formatting list:', error);
    return items.join(', ');
  }
}
