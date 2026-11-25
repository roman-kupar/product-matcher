import type { Locale } from 'antd/es/locale'
import deDE from 'antd/locale/de_DE'
import enUS from 'antd/locale/en_US'
import en from './en.json'
import de from './de.json'

/** Supported UI languages. To add one: add a key here, a <code>.json file, and an entry in LANGUAGES. */
export const Language = {
  EN: 'en',
  DE: 'de',
} as const

export type Language = (typeof Language)[keyof typeof Language]

/** en.json is the source of truth: every other language must define the same keys. */
export type TranslationKey = keyof typeof en

export const DEFAULT_LANGUAGE: Language = Language.EN

export const LANGUAGES: Record<Language, { label: string; messages: Record<TranslationKey, string>; antdLocale: Locale }> = {
  [Language.EN]: { label: 'EN', messages: en, antdLocale: enUS },
  [Language.DE]: { label: 'DE', messages: de, antdLocale: deDE },
}
