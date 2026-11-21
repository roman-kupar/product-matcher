import type React from 'react'

export interface StatusTabConfig<T = unknown> {
  key: string
  label: string
  badgeCount?: number
  filterFn?: (item: T) => boolean
}

export interface MasterDetailTriageLayoutProps<T extends { id: string | number }> {
  items: T[]
  selectedId: string | number | null
  onSelect: (id: string | number, item: T) => void
  renderListItem: (item: T, isSelected: boolean) => React.ReactNode
  renderDetailPane: (selectedItem: T | null) => React.ReactNode
  statusTabs?: StatusTabConfig<T>[]
  defaultTabKey?: string
  searchPlaceholder?: string
  searchFilter?: (item: T, query: string) => boolean
  title?: React.ReactNode
  extraHeader?: React.ReactNode
  leftPaneWidth?: number | string
  emptyDetailMessage?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}
