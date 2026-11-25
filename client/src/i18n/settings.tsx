import { createContext, useContext, useEffect, useState } from 'react'
import type React from 'react'
import { ConfigProvider, App as AntdApp, theme } from 'antd'
import deDE from 'antd/locale/de_DE'
import enUS from 'antd/locale/en_US'
import en from './en.json'
import de from './de.json'

export type Lang = 'en' | 'de'
export type TranslationKey = keyof typeof en

const MESSAGES: Record<Lang, Record<TranslationKey, string>> = { en, de }

interface Settings {
  lang: Lang
  setLang: (lang: Lang) => void
  dark: boolean
  setDark: (dark: boolean) => void
  /** Looks up a text in the current language and fills `{placeholders}`. */
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
}

const SettingsContext = createContext<Settings | null>(null)

function useStored<T extends string>(key: string, fallback: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => (localStorage.getItem(key) as T | null) ?? fallback)
  useEffect(() => localStorage.setItem(key, value), [key, value])
  return [value, setValue]
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useStored<Lang>('lang', 'en')
  const [mode, setMode] = useStored<'light' | 'dark'>('theme', 'light')
  const dark = mode === 'dark'

  const t: Settings['t'] = (key, params = {}) =>
    MESSAGES[lang][key].replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? `{${name}}`))

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return (
    <SettingsContext.Provider value={{ lang, setLang, dark, setDark: (d) => setMode(d ? 'dark' : 'light'), t }}>
      <ConfigProvider
        locale={lang === 'de' ? deDE : enUS}
        theme={{ algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm, token: { borderRadius: 8 } }}
      >
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </SettingsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): Settings {
  const settings = useContext(SettingsContext)
  if (!settings) throw new Error('useSettings must be used inside <SettingsProvider>')
  return settings
}
