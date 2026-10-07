import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  assessmentName?: string
  overallScore?: number
  summary?: string
  reportUrl?: string
}

const ReportReady = ({ name, assessmentName = 'L.I.F.E.™ Assessment', overallScore, summary, reportUrl = 'https://fact360.brandchef.in/dashboard/reports' }: Props) => (
  <Html lang="en">
    <Head />
    <Preview>Your {assessmentName} report is ready</Preview>
    <Body style={{ backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', margin: 0 }}>
      <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 24px' }}>
        <Heading style={{ fontSize: '22px', color: '#0f172a', margin: '0 0 16px' }}>
          {name ? `Hi ${name}, your report is ready` : 'Your report is ready'}
        </Heading>
        <Text style={{ fontSize: '15px', color: '#334155', lineHeight: '24px' }}>
          Thank you for completing the {assessmentName}. Your personalised report has been generated.
        </Text>
        {typeof overallScore === 'number' && (
          <Text style={{ fontSize: '15px', color: '#334155' }}>
            Overall score: <strong>{overallScore}%</strong>
          </Text>
        )}
        {summary && (
          <Section style={{ backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '16px', margin: '16px 0' }}>
            <Text style={{ fontSize: '14px', color: '#334155', lineHeight: '22px', margin: 0 }}>{summary}</Text>
          </Section>
        )}
        <Button href={reportUrl} style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '12px 22px', borderRadius: '6px', fontSize: '15px', textDecoration: 'none' }}>
          View full report
        </Button>
        <Text style={{ fontSize: '12px', color: '#94a3b8', marginTop: '28px' }}>Fact 360</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ReportReady,
  subject: (d: Record<string, any>) => `Your ${d.assessmentName ?? 'L.I.F.E.™'} report is ready`,
  displayName: 'Report ready',
  previewData: { name: 'Priya', assessmentName: 'L.I.F.E.™ Assessment', overallScore: 78, summary: 'You lead with clarity and structure…', reportUrl: 'https://fact360.brandchef.in/dashboard/reports' },
} satisfies TemplateEntry
