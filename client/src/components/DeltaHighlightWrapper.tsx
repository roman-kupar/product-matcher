import type React from 'react'
import { Tag, Tooltip, Space } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'
import type { DeltaHighlightWrapperProps } from '../types'

export type { DeltaHighlightWrapperProps }

export const DeltaHighlightWrapper: React.FC<DeltaHighlightWrapperProps> = ({
  isUpdated,
  previousValue,
  children,
  label = 'Newly Enriched',
  showPill = true,
  inline = false,
  tooltip,
  className,
  style,
}) => {
  if (!isUpdated) {
    return <>{children}</>
  }

  const tooltipContent = tooltip ?? (
    <div>
      <div style={{ fontWeight: 600 }}>Closed-loop Re-evaluation Update</div>
      {previousValue !== undefined && previousValue !== null && (
        <div style={{ fontSize: 11, marginTop: 2, opacity: 0.9 }}>
          Previous: <span style={{ textDecoration: 'line-through' }}>{String(previousValue)}</span>
        </div>
      )}
    </div>
  )

  const content = (
    <div
      className={className}
      style={{
        display: inline ? 'inline-flex' : 'block',
        alignItems: inline ? 'center' : undefined,
        gap: inline ? 6 : undefined,
        padding: inline ? '2px 6px' : '4px 8px',
        backgroundColor: '#e6fffb',
        border: '1px solid #87e8de',
        borderRadius: 6,
        boxShadow: '0 0 0 2px rgba(19, 194, 194, 0.12)',
        transition: 'all 0.3s ease',
        ...style,
      }}
    >
      {inline ? (
        <>
          {children}
          {showPill && (
            <Tag
              color="cyan"
              icon={<ThunderboltOutlined style={{ fontSize: 10 }} />}
              style={{
                margin: 0,
                fontSize: 10,
                fontWeight: 600,
                padding: '0 4px',
                borderRadius: 4,
              }}
            >
              {label}
            </Tag>
          )}
        </>
      ) : (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>{children}</div>
            {showPill && (
              <Tag
                color="cyan"
                icon={<ThunderboltOutlined style={{ fontSize: 10 }} />}
                style={{
                  margin: 0,
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '0 6px',
                  borderRadius: 4,
                }}
              >
                {label}
              </Tag>
            )}
          </div>
        </Space>
      )}
    </div>
  )

  return <Tooltip title={tooltipContent}>{content}</Tooltip>
}

export default DeltaHighlightWrapper
