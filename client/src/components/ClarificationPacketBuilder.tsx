import React, { useState } from 'react'
import {
  Card,
  Space,
  Typography,
  Tag,
  Button,
  Switch,
  Input,
  Row,
  Col,
  Alert,
  Divider,
} from 'antd'
import {
  SendOutlined,
  SyncOutlined,
  AlertOutlined,
  RobotOutlined,
  EditOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { DynamicAttributeInput } from './DynamicAttributeInput'
import type {
  ClarificationMode,
  ClarificationItem,
  ClarificationPacket,
  DynamicInputValue,
} from '../types'

const { Text, Paragraph } = Typography
const { TextArea } = Input

export interface ClarificationPacketBuilderProps {
  mode: ClarificationMode
  initialPacket: ClarificationPacket
  onDispatch?: (packet: ClarificationPacket) => void
  onSubmit?: (answers: Record<string, DynamicInputValue>, notes?: Record<string, string>) => void
  isSubmitting?: boolean
  className?: string
  style?: React.CSSProperties
}

export const ClarificationPacketBuilder: React.FC<ClarificationPacketBuilderProps> = ({
  mode,
  initialPacket,
  onDispatch,
  onSubmit,
  isSubmitting = false,
  className,
  style,
}) => {
  // Mode A: Buyer Builder State
  const [items, setItems] = useState<ClarificationItem[]>(initialPacket.items)
  const [buyerNotes, setBuyerNotes] = useState<string>(initialPacket.buyerNotes ?? '')
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  // Mode B: Supplier Form State
  const [answers, setAnswers] = useState<Record<string, DynamicInputValue>>(() => {
    const initial: Record<string, DynamicInputValue> = {}
    initialPacket.items.forEach((item) => {
      initial[item.attributeKey] = item.answerValue ?? null
    })
    return initial
  })
  const [supplierNotes, setSupplierNotes] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Buyer Toggles
  const toggleItemSelection = (id: string, selected: boolean) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected } : item)),
    )
  }

  const updateCustomQuestion = (id: string, text: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, customQuestion: text } : item)),
    )
  }

  const selectedCount = items.filter((i) => i.selected !== false).length

  const handleDispatch = () => {
    if (!onDispatch) return
    const dispatchedPacket: ClarificationPacket = {
      ...initialPacket,
      buyerNotes,
      items: items.filter((i) => i.selected !== false),
      status: 'DISPATCHED',
    }
    onDispatch(dispatchedPacket)
  }

  // Supplier Submit with Validation
  const handleSupplierSubmit = () => {
    const newErrors: Record<string, string> = {}
    const activeItems = items.filter((i) => i.selected !== false)

    activeItems.forEach((item) => {
      const val = answers[item.attributeKey]
      if (item.isDealbreaker) {
        if (val === null || val === undefined || val === '') {
          newErrors[item.attributeKey] = 'This specification is required by hospital clinical standards.'
        }
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    if (onSubmit) {
      onSubmit(answers, supplierNotes)
    }
  }

  if (mode === 'BUYER') {
    return (
      <Card
        size="small"
        className={className}
        style={{ borderTop: '3px solid #1677ff', ...style }}
        title={
          <Space align="center">
            <RobotOutlined style={{ color: '#1677ff' }} />
            <span>Clarification Packet Builder (Buyer Review & Send)</span>
            <Tag color="blue">{selectedCount} Questions Selected</Tag>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleDispatch}
            disabled={selectedCount === 0 || isSubmitting}
            loading={isSubmitting}
          >
            Dispatch Packet to Supplier
          </Button>
        }
      >
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          Review the LLM-generated questions for missing and conflicting attributes. Toggle which items to include in the supplier clarification packet and edit the phrasing as needed.
        </Paragraph>

        <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
          {items.map((item) => {
            const isSelected = item.selected !== false
            const isEditing = editingItemId === item.id
            const currentQuestion = item.customQuestion ?? item.llmGeneratedQuestion

            return (
              <Card
                key={item.id}
                size="small"
                style={{
                  backgroundColor: isSelected ? '#ffffff' : '#fafafa',
                  borderColor: isSelected ? (item.isDealbreaker ? '#ffa39e' : '#d9d9d9') : '#f0f0f0',
                  opacity: isSelected ? 1 : 0.65,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <Space size={8} wrap style={{ marginBottom: 6 }}>
                      <Switch
                        size="small"
                        checked={isSelected}
                        onChange={(checked) => toggleItemSelection(item.id, checked)}
                      />
                      <Text strong style={{ fontSize: 13 }}>
                        {item.schema.label}
                      </Text>
                      {item.isDealbreaker && (
                        <Tag color="red" icon={<AlertOutlined />} style={{ margin: 0, fontSize: 10 }}>
                          Clinical Dealbreaker
                        </Tag>
                      )}
                      <Tag color="default" style={{ margin: 0, fontSize: 10 }}>
                        Key: {item.attributeKey}
                      </Tag>
                    </Space>

                    {isEditing ? (
                      <div style={{ marginTop: 6 }}>
                        <TextArea
                          rows={2}
                          value={currentQuestion}
                          onChange={(e) => updateCustomQuestion(item.id, e.target.value)}
                        />
                        <Button
                          size="small"
                          type="link"
                          onClick={() => setEditingItemId(null)}
                          style={{ padding: 0, marginTop: 4 }}
                        >
                          Done Editing
                        </Button>
                      </div>
                    ) : (
                      <Paragraph style={{ margin: '4px 0 6px 0', fontSize: 13 }}>
                        {currentQuestion}
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined style={{ fontSize: 12, color: '#1677ff' }} />}
                          onClick={() => setEditingItemId(item.id)}
                          style={{ marginLeft: 6 }}
                        />
                      </Paragraph>
                    )}

                    {item.schema.hospitalTargetValue !== undefined && (
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Hospital Target: <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>{String(item.schema.hospitalTargetValue)}</Tag>
                      </Text>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}

          <div style={{ marginTop: 8 }}>
            <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              Add Note / Instructions for Supplier (Optional):
            </Text>
            <TextArea
              rows={2}
              value={buyerNotes}
              onChange={(e) => setBuyerNotes(e.target.value)}
              placeholder="e.g. Please provide ISO test certificates alongside specs to expedite committee approval."
            />
          </div>
        </Space>
      </Card>
    )
  }

  // Mode B: Supplier Answer & Submit Form
  const activeItems = items.filter((i) => i.selected !== false)

  return (
    <Card
      size="small"
      className={className}
      style={{ borderTop: '3px solid #52c41a', ...style }}
      title={
        <Space align="center">
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          <span>Clarification Response Form (Supplier Action)</span>
          <Tag color="green">{activeItems.length} Required Specifications</Tag>
        </Space>
      }
      extra={
        <Button
          type="primary"
          icon={<SyncOutlined spin={isSubmitting} />}
          onClick={handleSupplierSubmit}
          loading={isSubmitting}
          style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
        >
          Submit Answers & Trigger LLM Re-evaluation
        </Button>
      }
    >
      {initialPacket.buyerNotes && (
        <Alert
          type="info"
          showIcon
          message="Hospital Buyer Note"
          description={initialPacket.buyerNotes}
          style={{ marginBottom: 16 }}
        />
      )}

      <Paragraph type="secondary" style={{ marginBottom: 16 }}>
        Please complete the requested technical specifications below. Target values from the hospital reference specification are provided for alignment.
      </Paragraph>

      <Row gutter={[24, 20]}>
        {activeItems.map((item) => (
          <Col xs={24} md={12} key={item.id}>
            <Card
              size="small"
              bordered
              style={{
                height: '100%',
                backgroundColor: '#ffffff',
                borderColor: errors[item.attributeKey] ? '#ffa39e' : '#f0f0f0',
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <Space size={6} wrap align="center">
                  <Text strong style={{ fontSize: 13 }}>
                    {item.schema.label}
                  </Text>
                  {item.isDealbreaker && (
                    <Tag color="red" style={{ margin: 0, fontSize: 10 }}>
                      Required
                    </Tag>
                  )}
                </Space>
                <div style={{ fontSize: 12, color: '#595959', marginTop: 4 }}>
                  {item.customQuestion ?? item.llmGeneratedQuestion}
                </div>
              </div>

              <Divider style={{ margin: '8px 0 12px 0' }} />

              <DynamicAttributeInput
                attributeSchema={item.schema}
                value={answers[item.attributeKey]}
                onChange={(val) => {
                  setAnswers((prev) => ({ ...prev, [item.attributeKey]: val }))
                  if (errors[item.attributeKey]) {
                    setErrors((prev) => {
                      const next = { ...prev }
                      delete next[item.attributeKey]
                      return next
                    })
                  }
                }}
                error={errors[item.attributeKey]}
              />

              <div style={{ marginTop: 8 }}>
                <Input
                  size="small"
                  placeholder="Optional supplier remark / document reference..."
                  value={supplierNotes[item.attributeKey] ?? ''}
                  onChange={(e) =>
                    setSupplierNotes((prev) => ({
                      ...prev,
                      [item.attributeKey]: e.target.value,
                    }))
                  }
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  )
}

export const ClarificationRequestForm = ClarificationPacketBuilder
export default ClarificationPacketBuilder
