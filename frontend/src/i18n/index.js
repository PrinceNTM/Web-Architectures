import { createContext, createElement, useContext, useEffect, useMemo, useState } from 'react'
import de from './locales/de.json'
import en from './locales/en.json'

const dictionaries = {
  de,
  en,
}

const profileLanguageToLocale = {
  deutsch: 'de',
  german: 'de',
  english: 'en',
  en: 'en',
  de: 'de',
}

const localeToProfileLanguage = {
  de: 'Deutsch',
  en: 'English',
}

const normalizeHabitName = (name) => String(name || '')
  .trim()
  .toLowerCase()
  .replace(/\s+/g, ' ')

const I18nContext = createContext({
  locale: 'de',
  setLocale: () => {},
  t: (key) => key,
  getCategoryLabel: (category) => category,
  getTimeRangeLabel: (timeRange) => timeRange,
  getSectionLabel: (sectionId) => sectionId,
  getHabitNameLabel: (name) => name,
  getDateLocale: () => 'de-DE',
})

const resolvePath = (dictionary, path) => path
  .split('.')
  .reduce((current, part) => (current && Object.prototype.hasOwnProperty.call(current, part) ? current[part] : undefined), dictionary)

const formatMessage = (message, params) => {
  if (typeof message !== 'string') return message
  return Object.entries(params || {}).reduce(
    (text, [name, value]) => text.replaceAll(`{{${name}}}`, String(value)),
    message,
  )
}

export const mapProfileLanguageToLocale = (language) => {
  const normalized = String(language || '').trim().toLowerCase()
  return profileLanguageToLocale[normalized] || 'de'
}

export const mapLocaleToProfileLanguage = (locale) => localeToProfileLanguage[locale] || 'Deutsch'

export const sanitizeProfileLanguage = (language) => mapLocaleToProfileLanguage(mapProfileLanguageToLocale(language))

export function I18nProvider({ children, initialLocale = 'de' }) {
  const [locale, setLocale] = useState(initialLocale)

  useEffect(() => {
    setLocale(initialLocale)
  }, [initialLocale])

  const value = useMemo(() => {
    const dictionary = dictionaries[locale] || dictionaries.de

    const t = (key, params = {}, fallback = key) => {
      const resolved = resolvePath(dictionary, key)
      if (resolved === undefined) {
        return formatMessage(fallback, params)
      }
      return formatMessage(resolved, params)
    }

    const getCategoryLabel = (category) => t(`mappings.category.${category}`, {}, category)
    const getTimeRangeLabel = (timeRange) => t(`mappings.timeRange.${timeRange}`, {}, timeRange)

    const sectionKeyMap = {
      all: 'sections.all',
      Morgen: 'sections.morning',
      Nachmittag: 'sections.afternoon',
      Abend: 'sections.evening',
      resources: 'sections.resources',
    }

    const getSectionLabel = (sectionId) => {
      const key = sectionKeyMap[sectionId]
      return key ? t(key) : sectionId
    }

    const deSuggestions = dictionaries.de?.browse?.suggestions || []
    const enSuggestions = dictionaries.en?.browse?.suggestions || []
    const pairCount = Math.min(deSuggestions.length, enSuggestions.length)
    const habitNamePairs = Array.from({ length: pairCount }, (_, index) => ({
      de: deSuggestions[index]?.name,
      en: enSuggestions[index]?.name,
    })).filter((pair) => pair.de && pair.en)

    const habitNameMap = new Map()
    for (const pair of habitNamePairs) {
      habitNameMap.set(normalizeHabitName(pair.de), pair)
      habitNameMap.set(normalizeHabitName(pair.en), pair)
    }

    // Backward compatibility for the wording that existed before i18n.
    const legacyEarlySleep = 'Early sleep (by 10 PM)'
    const earlySleepPair = habitNamePairs.find((pair) => pair.en.toLowerCase().includes('sleep') && pair.en.includes('10 PM'))
    if (earlySleepPair) {
      habitNameMap.set(normalizeHabitName(legacyEarlySleep), earlySleepPair)
    }

    const getHabitNameLabel = (name) => {
      const pair = habitNameMap.get(normalizeHabitName(name))
      if (!pair) return name
      return pair[locale] || name
    }

    const getDateLocale = () => (locale === 'en' ? 'en-US' : 'de-DE')

    return {
      locale,
      setLocale,
      t,
      getCategoryLabel,
      getTimeRangeLabel,
      getSectionLabel,
      getHabitNameLabel,
      getDateLocale,
    }
  }, [locale])

  return createElement(I18nContext.Provider, { value }, children)
}

export const useI18n = () => useContext(I18nContext)
