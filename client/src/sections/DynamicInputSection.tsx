import React from 'react'
import { Card, Space, Tag, Typography, Row, Col, Button, message } from 'antd'
import { FormOutlined } from '@ant-design/icons'
import { DynamicAttributeInput } from '../components'
import type { DynamicInputValue, AttributeSchema } from '../types'
import { SAMPLE_SCHEMAS } from '../mock'

const { Paragraph } = Typography

interface DynamicInputSectionProps {
  formValues: Record<string, DynamicInputValue>
  onFormValueChange: (key: string, value: DynamicInputValue) => void
}

export const DynamicInputSection: React.FC<DynamicInputSectionProps> = ({
  formValues,
  onFormValueChange,
}) => (
  <Card
    title={
      <Space align="center">
        <FormOutlined />
        <span>Dynamic Attribute Input Engine (Supplier Form)</span>
        <Tag color="cyan">Machine-Readable Constrained Fields</Tag>
      </Space>
    }
    extra={
      <Button
        type="primary"
        size="small"
        onClick={() => message.success('Supplier specifications submitted successfully!')}
      >
        Submit Specification
      </Button>
    }
    size="small"
  >
    <Paragraph type="secondary" style={{ marginBottom: 16 }}>
      Renders strictly typed, constrained input fields based on missing attribute schema—preventing free-text data degradation with boolean segmented toggles, numeric inputs with unit selectors, and enum dropdowns.
    </Paragraph>
    <Row gutter={[24, 16]}>
      {SAMPLE_SCHEMAS.map((schema: AttributeSchema) => (
        <Col xs={24} md={12} key={schema.key}>
          <DynamicAttributeInput
            attributeSchema={schema}
            value={formValues[schema.key]}
            onChange={(newVal) => onFormValueChange(schema.key, newVal)}
          />
        </Col>
      ))}
    </Row>
  </Card>
)
