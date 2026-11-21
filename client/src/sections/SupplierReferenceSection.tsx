import React from 'react'
import { Card, Typography, Button } from 'antd'
import { SwapOutlined } from '@ant-design/icons'
import { ArticleSummaryCard } from '../components'
import { SAMPLE_HOSPITAL_ARTICLE } from '../mock'

const { Paragraph } = Typography

export const SupplierReferenceSection: React.FC = () => (
  <Card title="Supplier Response Screen (Reference Spec Card)" size="small">
    <Paragraph type="secondary" style={{ marginBottom: 12 }}>
      Displayed at the top of the supplier task interface so suppliers know exactly which hospital specification they are reviewing.
    </Paragraph>
    <ArticleSummaryCard
      article={SAMPLE_HOSPITAL_ARTICLE}
      sourceType="HOSPITAL"
      compact={true}
      extra={
        <Button size="small" icon={<SwapOutlined />}>
          Suggest Alternative
        </Button>
      }
    />
  </Card>
)
