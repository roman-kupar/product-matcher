import { useState, useMemo } from 'react'
import type React from 'react'
import {
  Input,
  Tabs,
  Badge,
  Empty,
  Typography,
} from 'antd'
import type { MasterDetailTriageLayoutProps } from '../types'

const { Text } = Typography

export function MasterDetailTriageLayout<T extends { id: string | number }>({
  items,
  selectedId,
  onSelect,
  renderListItem,
  renderDetailPane,
  statusTabs,
  defaultTabKey = 'ALL',
  searchPlaceholder = 'Search articles by title, SKU, or ID...',
  searchFilter,
  title,
  extraHeader,
  leftPaneWidth = 380,
  emptyDetailMessage = 'Select an item from the queue to inspect comparison specifications.',
  className,
  style,
}: MasterDetailTriageLayoutProps<T>): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTabKey, setActiveTabKey] = useState(defaultTabKey)

  // Filter items by status tab
  const tabFilteredItems = useMemo(() => {
    if (!statusTabs || activeTabKey === 'ALL') {
      return items
    }
    const activeTab = statusTabs.find((t) => t.key === activeTabKey)
    if (activeTab?.filterFn) {
      return items.filter(activeTab.filterFn)
    }
    return items
  }, [items, statusTabs, activeTabKey])

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return tabFilteredItems

    const query = searchQuery.toLowerCase()
    if (searchFilter) {
      return tabFilteredItems.filter((item) => searchFilter(item, query))
    }

    // Default text search over object values
    return tabFilteredItems.filter((item) => {
      const serialized = JSON.stringify(item).toLowerCase()
      return serialized.includes(query)
    })
  }, [tabFilteredItems, searchQuery, searchFilter])

  const selectedItem = useMemo(() => {
    return items.find((item) => item.id === selectedId) ?? null
  }, [items, selectedId])

  // Build Tab Items with Badge Counts
  const tabItems = useMemo(() => {
    if (!statusTabs) {
      return [
        {
          key: 'ALL',
          label: (
            <span>
              All <Badge count={items.length} style={{ backgroundColor: '#8c8c8c' }} />
            </span>
          ),
        },
      ]
    }

    return statusTabs.map((tab) => {
      const count = tab.badgeCount ?? (tab.filterFn ? items.filter(tab.filterFn).length : items.length)
      return {
        key: tab.key,
        label: (
          <span>
            {tab.label}{' '}
            <Badge
              count={count}
              style={{
                backgroundColor: tab.key === activeTabKey ? '#1677ff' : '#8c8c8c',
                fontSize: 11,
              }}
            />
          </span>
        ),
      }
    })
  }, [statusTabs, items, activeTabKey])

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #d9d9d9',
        borderRadius: 8,
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        minHeight: 680,
        ...style,
      }}
    >
      {/* Top Header Bar */}
      {(title || extraHeader) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 20px',
            borderBottom: '1px solid #f0f0f0',
            backgroundColor: '#fafafa',
          }}
        >
          <div>{typeof title === 'string' ? <Text strong style={{ fontSize: 16 }}>{title}</Text> : title}</div>
          {extraHeader && <div>{extraHeader}</div>}
        </div>
      )}

      {/* Split Pane: Master Queue (Left) & Inspection Workspace (Right) */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Pane: Filterable Queue */}
        <div
          style={{
            width: leftPaneWidth,
            minWidth: leftPaneWidth,
            borderRight: '1px solid #f0f0f0',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Search Box */}
          <div style={{ padding: '12px 14px 8px 14px' }}>
            <Input.Search
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              size="small"
            />
          </div>

          {/* Grouped Status Tabs */}
          <div style={{ padding: '0 14px' }}>
            <Tabs
              size="small"
              activeKey={activeTabKey}
              onChange={setActiveTabKey}
              items={tabItems}
              style={{ marginBottom: 0 }}
            />
          </div>

          {/* Queue List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
            {filteredItems.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No queue items match criteria"
                />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filteredItems.map((item) => {
                  const isSelected = item.id === selectedId
                  return (
                    <div
                      key={String(item.id)}
                      onClick={() => onSelect(item.id, item)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 6,
                        border: `1px solid ${isSelected ? '#91caff' : '#f0f0f0'}`,
                        backgroundColor: isSelected ? '#f0f7ff' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {renderListItem(item, isSelected)}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Scrollable Detail / Inspection Workspace */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            backgroundColor: '#fafbfc',
          }}
        >
          {selectedItem ? (
            renderDetailPane(selectedItem)
          ) : (
            <div style={{ padding: '60px 24px', textAlign: 'center' }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={emptyDetailMessage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MasterDetailTriageLayout
