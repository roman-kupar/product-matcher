import { useState } from 'react'
import { Button, Card, Space, Typography, Tag, Statistic, Row, Col } from 'antd'
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  ApiOutlined,
} from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

function App() {
  const [enrichedCount, setEnrichedCount] = useState(0)

  return (
    <div style={{ maxWidth: 880, margin: '40px auto', padding: '0 24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <header>
          <Space align="center">
            <Title level={2} style={{ margin: 0 }}>
              Article Enricher
            </Title>
            <Tag color="blue" icon={<CheckCircleOutlined />}>
              Ant Design Connected
            </Tag>
          </Space>
          <Paragraph type="secondary" style={{ marginTop: 8 }}>
            AI-powered article processing, entity extraction, and enrichment workspace.
          </Paragraph>
        </header>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card bordered hoverable>
              <Statistic
                title="Enriched Articles"
                value={enrichedCount}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered hoverable>
              <Statistic
                title="Service Status"
                value="Online"
                valueStyle={{ color: '#3f8600' }}
                prefix={<ApiOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered hoverable>
              <Statistic
                title="Processing Latency"
                value="120ms"
                prefix={<ThunderboltOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Quick Actions" bordered>
          <Space wrap>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={() => setEnrichedCount((c) => c + 1)}
            >
              Simulate Enrich Article
            </Button>
            <Button
              onClick={() => setEnrichedCount(0)}
              disabled={enrichedCount === 0}
            >
              Reset Counter
            </Button>
          </Space>
        </Card>

        <footer>
          <Text type="secondary" style={{ fontSize: 13 }}>
            React 19 + Vite + Ant Design + TypeScript
          </Text>
        </footer>
      </Space>
    </div>
  )
}

export default App
