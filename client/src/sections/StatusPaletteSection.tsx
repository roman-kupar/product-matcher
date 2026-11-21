import React from 'react'
import { Card, Space } from 'antd'
import { EquivalenceBadge, DeltaHighlightWrapper } from '../components'

export const StatusPaletteSection: React.FC = () => (
  <Card title="<EquivalenceBadge /> States & Variations (with <DeltaHighlightWrapper />)" size="small">
    <Space size={[12, 12]} wrap>
      <EquivalenceBadge status="MATCHED" score={96} deltaScore={18} />
      <DeltaHighlightWrapper isUpdated={true} inline={true} label="Newly Enriched" previousValue="72%">
        <EquivalenceBadge status="RE_EVALUATED" score={85} deltaScore={12} />
      </DeltaHighlightWrapper>
      <EquivalenceBadge status="NEEDS_INFO" score={62} />
      <EquivalenceBadge status="AWAITING_SUPPLIER" score={70} />
      <EquivalenceBadge status="CONFLICT" score={41} deltaScore={-14} />
    </Space>
  </Card>
)
