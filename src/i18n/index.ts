import ar from './locales/ar/common.json'
import en from './locales/en/common.json'

export type Locale = 'ar' | 'en'
export type TranslationKeys = typeof ar

const translations: Record<Locale, TranslationKeys> = { ar, en }

export function t(key: string, locale: Locale = 'ar', params?: Record<string, string>): string {
  const keys = key.split('.')
  let value: unknown = translations[locale]

  for (const k of keys) {
    if (value && typeof value === 'object' && k in (value as Record<string, unknown>)) {
      value = (value as Record<string, unknown>)[k]
    } else {
      return key
    }
  }

  if (typeof value !== 'string') return key

  if (params) {
    return Object.entries(params).reduce(
      (acc, [paramKey, paramValue]) => acc.replace(`{${paramKey}}`, paramValue),
      value
    )
  }

  return value
}

export function useTranslation(locale: Locale = 'ar') {
  return {
    t: (key: string, params?: Record<string, string>) => t(key, locale, params),
    locale,
  }
}
