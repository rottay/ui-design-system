"use client";

export { DEFAULT_FALLBACK_LOCALE } from "../../../../foundation/i18n/kernel/contracts";
export { LOCALE_CONFIGS } from "../../../../foundation/i18n/runtime/catalog/configuration";
export { useLocale } from "../../../../infrastructure/runtime/i18n/composition/locale";
export {
  I18nProvider,
  useI18nContext,
} from "../../../../infrastructure/runtime/i18n/runtime/context/provider";
