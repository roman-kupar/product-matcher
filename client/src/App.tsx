import React, { useState, useCallback } from 'react'
import { Space, Typography, Button } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'
import { useTriageWorkflow, useClarificationWorkflow } from './hooks'
import type { DynamicInputValue } from './types'
import {
  StatusPaletteSection,
  WorkbenchSection,
  ComparisonSection,
  AttributeDiffSection,
  SupplierReferenceSection,
  DynamicInputSection,
  ClarificationSection,
  AuditTimelineSection,
} from './sections'

const { Title, Paragraph } = Typography

const App: React.FC = () => {
  const triage = useTriageWorkflow()
  const clarification = useClarificationWorkflow()

  const [isReadOnlyDiff, setIsReadOnlyDiff] = useState(false)
  const [formValues, setFormValues] = useState<Record<string, DynamicInputValue>>({
    latex_free: true,
    cuff_length: { value: 290, unit: 'mm' },
    iso_certification: 'EN 455-1/-2/-3',
    packaging_carton_code: '',
  })

  const handleFormValueChange = useCallback((key: string, value: DynamicInputValue) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleSupplierSubmit = useCallback(() => {
    clarification.handleSupplierPacketSubmit(() => {
      triage.updateItemStatus('3', { status: 'RE_EVALUATED', score: 95, deltaScore: 33 })
    })
  }, [clarification, triage])

  return (
    <div style={{ maxWidth: 1180, margin: '32px auto', padding: '0 24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <header>
          <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>Article Enricher Triage</Title>
              <Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
                Automated matching & spec enrichment verification
              </Paragraph>
            </div>
            <Button type="primary" icon={<ThunderboltOutlined />} onClick={triage.simulateEnrichment}>
              Simulate Spec Enrichment
            </Button>
          </Space>
        </header>

        <StatusPaletteSection />

        <WorkbenchSection
          items={triage.items}
          selectedId={triage.selectedId}
          onSelect={triage.setSelectedId}
          onSimulateEnrichment={triage.simulateEnrichment}
        />

        <ComparisonSection />

        <AttributeDiffSection
          isReadOnly={isReadOnlyDiff}
          onReadOnlyChange={setIsReadOnlyDiff}
          onSelectMissing={triage.handleSelectMissing}
        />

        <SupplierReferenceSection />

        <DynamicInputSection
          formValues={formValues}
          onFormValueChange={handleFormValueChange}
        />

        <ClarificationSection
          mode={clarification.packetMode}
          onModeChange={clarification.setPacketMode}
          activePacket={clarification.activePacket}
          isSubmitting={clarification.isPacketSubmitting}
          onDispatch={clarification.handleDispatchPacket}
          onSubmit={handleSupplierSubmit}
        />

        <AuditTimelineSection />
      </Space>
    </div>
  )
}

export default App
