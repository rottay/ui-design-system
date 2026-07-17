import type { ReactNode } from 'react';
import type {
  LocaleTranslations,
  SupportedLocale,
} from '@/foundation/i18n/kernel/contracts';

export interface I18nProviderProps {
  locale: SupportedLocale;
  fallbackLocale?: SupportedLocale;
  customTranslations?: Partial<LocaleTranslations>;
  onLocaleChange?: (locale: SupportedLocale) => void;
  children: ReactNode;
}
