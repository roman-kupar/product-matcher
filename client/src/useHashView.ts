import { useEffect, useState } from 'react'
import { View } from './enums'

const parse = (): View => {
  const path = window.location.hash.replace(/^#\//, '')
  return (Object.values(View) as string[]).includes(path) ? (path as View) : View.Hospital
}

/** Current view from the URL (`#/hospital`, `#/supplier`), so each side has its own link. */
export function useHashView(): [View, (view: View) => void] {
  const [view, setView] = useState<View>(parse)

  useEffect(() => {
    const onChange = () => setView(parse())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return [view, (next) => (window.location.hash = `/${next}`)]
}
