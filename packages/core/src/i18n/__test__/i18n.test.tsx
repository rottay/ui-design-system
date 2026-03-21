/**
 * Test del sistema i18n
 * Design System Rottay - Wave 0 - Agente D
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { I18nProvider } from '../context/I18nProvider';
import { useTranslation } from '../hooks/useTranslation';
import { useLocale } from '../hooks/useLocale';
import {
  formatDate,
  formatNumber,
  formatCurrency,
  formatRelativeTime,
  formatFileSize,
} from '../_internal/utils/formatters';

describe('i18n System', () => {
  describe('I18nProvider', () => {
    it('should provide translation function', () => {
      const { result } = renderHook(() => useTranslation(), {
        wrapper: ({ children }) => (
          <I18nProvider locale="es">{children}</I18nProvider>
        ),
      });

      expect(result.current.t('common.yes')).toBe('Sí');
      expect(result.current.locale).toBe('es');
    });

    it('should support namespaced translations', () => {
      const { result } = renderHook(() => useTranslation('components'), {
        wrapper: ({ children }) => (
          <I18nProvider locale="es">{children}</I18nProvider>
        ),
      });

      expect(result.current.t('avatar.loading')).toBe('Cargando avatar...');
    });

    it('should interpolate parameters', () => {
      const { result } = renderHook(() => useTranslation('components'), {
        wrapper: ({ children }) => (
          <I18nProvider locale="es">{children}</I18nProvider>
        ),
      });

      expect(result.current.t('pagination.page', { current: 1, total: 10 }))
        .toBe('Página 1 de 10');
    });
  });

  describe('useLocale', () => {
    it('should provide locale config', () => {
      const { result } = renderHook(() => useLocale(), {
        wrapper: ({ children }) => (
          <I18nProvider locale="es">{children}</I18nProvider>
        ),
      });

      expect(result.current.locale).toBe('es');
      expect(result.current.config.name).toBe('Español');
      expect(result.current.config.direction).toBe('ltr');
    });
  });

  describe('Formatters', () => {
    it('should format dates', () => {
      const date = new Date('2025-12-25');
      const formatted = formatDate(date, 'es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      expect(formatted).toContain('diciembre');
      expect(formatted).toContain('2025');
    });

    it('should format numbers', () => {
      const formatted = formatNumber(1234567.89, 'es-ES');
      expect(formatted).toContain('1');
      expect(formatted).toContain('234');
    });

    it('should format currency', () => {
      const formatted = formatCurrency(1234.56, 'es-ES', 'EUR');
      expect(formatted).toContain('1');
      expect(formatted).toContain('234');
    });

    it('should format file sizes', () => {
      expect(formatFileSize(1024, 'es-ES')).toContain('KB');
      expect(formatFileSize(1048576, 'es-ES')).toContain('MB');
      expect(formatFileSize(1073741824, 'es-ES')).toContain('GB');
    });
  });

  describe('Multiple locales', () => {
    it('should translate to English', () => {
      const { result } = renderHook(() => useTranslation(), {
        wrapper: ({ children }) => (
          <I18nProvider locale="en">{children}</I18nProvider>
        ),
      });

      expect(result.current.t('common.yes')).toBe('Yes');
    });

    it('should translate to Portuguese', () => {
      const { result } = renderHook(() => useTranslation(), {
        wrapper: ({ children }) => (
          <I18nProvider locale="pt">{children}</I18nProvider>
        ),
      });

      expect(result.current.t('common.yes')).toBe('Sim');
    });

    it('should translate to French', () => {
      const { result } = renderHook(() => useTranslation(), {
        wrapper: ({ children }) => (
          <I18nProvider locale="fr">{children}</I18nProvider>
        ),
      });

      expect(result.current.t('common.yes')).toBe('Oui');
    });

    it('should support Arabic and expose rtl direction', () => {
      const { result } = renderHook(() => useLocale(), {
        wrapper: ({ children }) => (
          <I18nProvider locale="ar">{children}</I18nProvider>
        ),
      });

      expect(result.current.locale).toBe('ar');
      expect(result.current.config.direction).toBe('rtl');
    });

    it('should use real Arabic copy instead of falling back to English', () => {
      const { result } = renderHook(() => useTranslation('components'), {
        wrapper: ({ children }) => (
          <I18nProvider locale="ar">{children}</I18nProvider>
        ),
      });

      expect(result.current.t('button.save')).toBe('حفظ');
      expect(result.current.t('surfaces.chat.send')).toBe('إرسال');
    });
  });
});
