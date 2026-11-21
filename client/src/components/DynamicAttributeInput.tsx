import React from 'react'
import {
  Segmented,
  InputNumber,
  Select,
  Input,
  Space,
  Typography,
  Tag,
} from 'antd'
import {
  AimOutlined,
  CheckOutlined,
  CloseOutlined,
  QuestionOutlined,
} from '@ant-design/icons'
import type {
  AttributeSchema,
  DynamicInputValue,
  NumberWithUnitValue,
} from '../types'

const { Text } = Typography

export interface DynamicAttributeInputProps {
  attributeSchema: AttributeSchema
  value: DynamicInputValue
  onChange: (value: DynamicInputValue) => void
  error?: string
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
}

export const DynamicAttributeInput: React.FC<DynamicAttributeInputProps> = ({
  attributeSchema,
  value,
  onChange,
  error,
  disabled = false,
  className,
  style,
}) => {
  const {
    label,
    dataType,
    options = [],
    unit,
    allowedUnits,
    hospitalTargetValue,
    placeholder,
  } = attributeSchema

  const renderTargetValueHint = () => {
    if (hospitalTargetValue === undefined || hospitalTargetValue === null) {
      return null
    }

    let displayVal: React.ReactNode = String(hospitalTargetValue)
    if (typeof hospitalTargetValue === 'boolean') {
      displayVal = hospitalTargetValue ? 'Yes (Required)' : 'No (Prohibited)'
    } else if (unit) {
      displayVal = `${hospitalTargetValue} ${unit}`
    }

    return (
      <div style={{ marginTop: 4 }}>
        <Text type="secondary" style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <AimOutlined style={{ color: '#1677ff' }} />
          Hospital reference: <Tag color="blue" style={{ margin: 0, fontSize: 10, padding: '0 4px' }}>{displayVal}</Tag>
        </Text>
      </div>
    )
  }

  const renderInputField = () => {
    switch (dataType) {
      case 'BOOLEAN': {
        // Map boolean/null to Segmented string values
        let segValue = 'Unknown'
        if (value === true) segValue = 'Yes'
        else if (value === false) segValue = 'No'

        return (
          <Segmented
            disabled={disabled}
            value={segValue}
            onChange={(val) => {
              if (val === 'Yes') onChange(true)
              else if (val === 'No') onChange(false)
              else onChange(null)
            }}
            options={[
              { label: 'Yes', value: 'Yes', icon: <CheckOutlined style={{ color: '#389e0d' }} /> },
              { label: 'No', value: 'No', icon: <CloseOutlined style={{ color: '#cf1322' }} /> },
              { label: 'Unknown', value: 'Unknown', icon: <QuestionOutlined style={{ color: '#8c8c8c' }} /> },
            ]}
          />
        )
      }

      case 'NUMBER_WITH_UNIT': {
        const numVal =
          typeof value === 'object' && value !== null && 'value' in value
            ? (value as NumberWithUnitValue).value
            : typeof value === 'number'
              ? value
              : null

        const currentUnit =
          typeof value === 'object' && value !== null && 'unit' in value
            ? (value as NumberWithUnitValue).unit ?? unit ?? allowedUnits?.[0]
            : unit ?? allowedUnits?.[0]

        const handleNumberChange = (newVal: number | null) => {
          onChange({
            value: newVal,
            unit: currentUnit,
          })
        }

        const handleUnitChange = (newUnit: string) => {
          onChange({
            value: numVal,
            unit: newUnit,
          })
        }

        if (allowedUnits && allowedUnits.length > 1) {
          return (
            <Space.Compact style={{ width: '100%', maxWidth: 280 }}>
              <InputNumber
                disabled={disabled}
                value={numVal}
                onChange={handleNumberChange}
                placeholder={placeholder ?? '0.00'}
                status={error ? 'error' : undefined}
                style={{ width: '65%' }}
              />
              <Select
                disabled={disabled}
                value={currentUnit}
                onChange={handleUnitChange}
                options={allowedUnits.map((u) => ({ label: u, value: u }))}
                style={{ width: '35%' }}
              />
            </Space.Compact>
          )
        }

        return (
          <InputNumber
            disabled={disabled}
            value={numVal}
            onChange={handleNumberChange}
            addonAfter={unit}
            placeholder={placeholder ?? '0.00'}
            status={error ? 'error' : undefined}
            style={{ width: '100%', maxWidth: 240 }}
          />
        )
      }

      case 'ENUM': {
        const selectOptions = options.map((opt) => ({
          label: opt,
          value: opt,
        }))

        return (
          <Select
            disabled={disabled}
            value={typeof value === 'string' ? value : undefined}
            onChange={(val) => onChange(val)}
            placeholder={placeholder ?? `Select ${label}...`}
            options={selectOptions}
            allowClear
            status={error ? 'error' : undefined}
            style={{ width: '100%', maxWidth: 320 }}
          />
        )
      }

      case 'TEXT':
      default: {
        return (
          <Input
            disabled={disabled}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? `Enter ${label}...`}
            status={error ? 'error' : undefined}
            style={{ width: '100%', maxWidth: 360 }}
          />
        )
      }
    }
  }

  return (
    <div className={className} style={{ marginBottom: 12, ...style }}>
      <div style={{ marginBottom: 4 }}>
        <Space size={6} align="center">
          <Text strong style={{ fontSize: 13 }}>
            {label}
          </Text>
          <Tag color="default" style={{ margin: 0, fontSize: 10, textTransform: 'lowercase' }}>
            {dataType.replace('_', ' ')}
          </Tag>
        </Space>
      </div>

      <div>{renderInputField()}</div>

      {renderTargetValueHint()}

      {error && (
        <div style={{ marginTop: 4 }}>
          <Text type="danger" style={{ fontSize: 12 }}>
            {error}
          </Text>
        </div>
      )}
    </div>
  )
}

export default DynamicAttributeInput
