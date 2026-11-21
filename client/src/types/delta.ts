import type React from 'react'

export interface DeltaHighlightWrapperProps {
  isUpdated: boolean
  previousValue?: string | number | boolean | null
  children: React.ReactNode
  label?: string
  showPill?: boolean
  inline?: boolean
  tooltip?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}
