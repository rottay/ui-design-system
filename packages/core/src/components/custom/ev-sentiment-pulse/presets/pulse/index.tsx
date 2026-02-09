'use client'

import React, { useState } from 'react'
import { createPreset, type PresetContext } from '../../../factory'
import {
  createCardStyle,
  createBadgeStyle,
  createFilterPillStyle,
  createSurfaceStyle,
} from '../../../helpers'
import type { SentimentPulseProps } from '../../core'

// Mock data
const MOCK_SIGNALS = [
  {
    id: '1',
    source: 'chat' as const,
    content: 'The DJ is absolutely killing it tonight! Best set ever!',
    sentiment: 0.92,
    timestamp: new Date(Date.now() - 5 * 60000),
  },
  {
    id: '2',
    source: 'social' as const,
    content: '@VenueX incredible vibes tonight, this place is on fire',
    sentiment: 0.88,
    timestamp: new Date(Date.now() - 8 * 60000),
  },
  {
    id: '3',
    source: 'tips' as const,
    content: 'Server was super friendly and quick, great service',
    sentiment: 0.85,
    timestamp: new Date(Date.now() - 12 * 60000),
  },
  {
    id: '4',
    source: 'complaints' as const,
    content: 'Long wait at the bar, understaffed maybe?',
    sentiment: -0.45,
    timestamp: new Date(Date.now() - 15 * 60000),
  },
  {
    id: '5',
    source: 'chat' as const,
    content: 'Sound system is perfect, hearing every beat clearly',
    sentiment: 0.78,
    timestamp: new Date(Date.now() - 18 * 60000),
  },
  {
    id: '6',
    source: 'survey' as const,
    content: 'Overall experience: Excellent, would recommend',
    sentiment: 0.95,
    timestamp: new Date(Date.now() - 22 * 60000),
  },
  {
    id: '7',
    source: 'social' as const,
    content: 'Bathroom situation needs work, not enough stalls',
    sentiment: -0.62,
    timestamp: new Date(Date.now() - 25 * 60000),
  },
  {
    id: '8',
    source: 'chat' as const,
    content: 'Drinks are reasonably priced compared to other venues',
    sentiment: 0.68,
    timestamp: new Date(Date.now() - 30 * 60000),
  },
  {
    id: '9',
    source: 'tips' as const,
    content: 'Security team very professional and respectful',
    sentiment: 0.82,
    timestamp: new Date(Date.now() - 35 * 60000),
  },
  {
    id: '10',
    source: 'complaints' as const,
    content: 'Coat check line is way too long',
    sentiment: -0.38,
    timestamp: new Date(Date.now() - 40 * 60000),
  },
]

const MOCK_SUMMARY = {
  overallScore: 0.72,
  trendDirection: 'up' as const,
  topPositive: [
    'DJ performance and music quality',
    'Staff friendliness and service',
    'Sound system quality',
  ],
  topNegative: ['Bar wait times', 'Bathroom facilities', 'Coat check delays'],
  aiSummary:
    'Strong positive sentiment overall with music and staff receiving high praise. Main pain points center around operational bottlenecks (bar, bathrooms, coat check) that could be addressed with staffing adjustments. Sentiment trending upward as event progresses.',
}

export const SentimentPulsePulse = createPreset<SentimentPulseProps>({
  name: 'SentimentPulse.Pulse',
  render: (ctx: PresetContext<SentimentPulseProps>) => {
    const { primitives, props, tokens, engine } = ctx
    const { Box, Text } = primitives

    const [selectedSource, setSelectedSource] = useState<string | null>(null)

    const signals = props.signals || MOCK_SIGNALS
    const summary = props.summary || MOCK_SUMMARY

    const filteredSignals = selectedSource
      ? signals.filter((s) => s.source === selectedSource)
      : signals

    const getSentimentColor = (sentiment: number) => {
      if (sentiment > 0.6) return tokens.colors.successScale[500]
      if (sentiment > 0.2) return tokens.colors.primaryScale[500]
      if (sentiment > -0.2) return tokens.colors.neutral[500]
      if (sentiment > -0.6) return tokens.colors.warningScale[500]
      return tokens.colors.errorScale[500]
    }

    const getSentimentBg = (sentiment: number) => {
      if (sentiment > 0.6) return tokens.colors.successScale[50]
      if (sentiment > 0.2) return tokens.colors.primaryScale[50]
      if (sentiment > -0.2) return tokens.colors.neutral[50]
      if (sentiment > -0.6) return tokens.colors.warningScale[50]
      return tokens.colors.errorScale[50]
    }

    const getSourceColor = (source: string) => {
      const colors: Record<string, string> = {
        chat: tokens.colors.primaryScale[500],
        social: tokens.colors.infoScale[500],
        tips: tokens.colors.successScale[500],
        complaints: tokens.colors.errorScale[500],
        survey: tokens.colors.secondaryScale[500],
      }
      return colors[source] || tokens.colors.neutral[500]
    }

    const getSourceBadgeColor = (source: string): 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary' => {
      switch (source) {
        case 'chat':
          return 'primary'
        case 'social':
          return 'info'
        case 'tips':
          return 'success'
        case 'complaints':
          return 'error'
        case 'survey':
          return 'secondary'
        default:
          return 'secondary'
      }
    }

    const formatTimestamp = (date: Date) => {
      const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
      if (minutes < 1) return 'Just now'
      if (minutes === 1) return '1 min ago'
      return `${minutes} mins ago`
    }

    const getTrendColor = (direction: string) => {
      switch (direction) {
        case 'up':
          return tokens.colors.successScale[500]
        case 'down':
          return tokens.colors.errorScale[500]
        default:
          return tokens.colors.neutral[500]
      }
    }

    const getTrendArrow = (direction: string) => {
      switch (direction) {
        case 'up':
          return '↑'
        case 'down':
          return '↓'
        default:
          return '→'
      }
    }

    // Calculate gauge rotation (-90 to 90 degrees)
    const gaugeRotation = (summary.overallScore - 0.5) * 180

    return (
      <Box style={createSurfaceStyle(tokens)}>
        {/* Header */}
        <Box
          style={{
            padding: tokens.spacing[4],
            borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[1],
            }}
          >
            Sentiment Pulse
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[600],
            }}
          >
            Real-time sentiment analysis across all feedback channels
          </Text>
        </Box>

        {/* Main Content */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: tokens.spacing[4],
            padding: tokens.spacing[4],
          }}
        >
          {/* Left Column - Gauge & Trend */}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
            {/* Sentiment Gauge */}
            <Box style={createCardStyle(tokens)}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[3],
                  textAlign: 'center',
                }}
              >
                Overall Sentiment
              </Text>

              <Box
                style={{
                  position: 'relative',
                  height: '180px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Gauge Background Arc */}
                <svg
                  width="200"
                  height="120"
                  viewBox="0 0 200 120"
                  style={{ position: 'absolute' }}
                >
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke={tokens.colors.neutral[200]}
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  {/* Color segments */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 60 40"
                    fill="none"
                    stroke={tokens.colors.errorScale[400]}
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 60 40 A 80 80 0 0 1 100 20"
                    fill="none"
                    stroke={tokens.colors.warningScale[400]}
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 100 20 A 80 80 0 0 1 140 40"
                    fill="none"
                    stroke={tokens.colors.primaryScale[400]}
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 140 40 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke={tokens.colors.successScale[400]}
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  {/* Needle */}
                  <g transform={`rotate(${gaugeRotation} 100 100)`}>
                    <line
                      x1="100"
                      y1="100"
                      x2="100"
                      y2="40"
                      stroke={tokens.colors.neutral[900]}
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <circle cx="100" cy="100" r="6" fill={tokens.colors.neutral[900]} />
                  </g>
                </svg>

                {/* Score Display */}
                <Box
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    textAlign: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize['3xl'],
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: getSentimentColor(summary.overallScore * 2 - 1),
                    }}
                  >
                    {(summary.overallScore * 100).toFixed(0)}
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[600],
                    }}
                  >
                    / 100
                  </Text>
                </Box>
              </Box>

              {/* Trend Indicator */}
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: tokens.spacing[1],
                  marginTop: tokens.spacing[3],
                  padding: tokens.spacing[2],
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: getSentimentBg(summary.overallScore * 2 - 1),
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xl,
                    color: getTrendColor(summary.trendDirection),
                  }}
                >
                  {getTrendArrow(summary.trendDirection)}
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: getTrendColor(summary.trendDirection),
                    textTransform: 'capitalize',
                  }}
                >
                  Trending {summary.trendDirection}
                </Text>
              </Box>
            </Box>

            {/* AI Summary */}
            <Box style={createCardStyle(tokens)}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[2],
                }}
              >
                AI Analysis
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[700],
                  lineHeight: '1.6',
                }}
              >
                {summary.aiSummary}
              </Text>
            </Box>

            {/* Top Positive/Negative */}
            <Box style={createCardStyle(tokens)}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.successScale[700],
                  marginBottom: tokens.spacing[2],
                }}
              >
                Top Positive
              </Text>
              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: tokens.spacing[1],
                  marginBottom: tokens.spacing[3],
                }}
              >
                {summary.topPositive.map((item, idx) => (
                  <Box
                    key={idx}
                    style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.successScale[600],
                      }}
                    >
                      +
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[700],
                      }}
                    >
                      {item}
                    </Text>
                  </Box>
                ))}
              </Box>

              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.errorScale[700],
                  marginBottom: tokens.spacing[2],
                }}
              >
                Top Negative
              </Text>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                {summary.topNegative.map((item, idx) => (
                  <Box
                    key={idx}
                    style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.errorScale[600],
                      }}
                    >
                      -
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[700],
                      }}
                    >
                      {item}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Right Column - Signal Feed */}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
            {/* Source Filters */}
            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[2],
                }}
              >
                Filter by Source
              </Text>
              <Box style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' }}>
                <Box
                  onClick={() => setSelectedSource(null)}
                  style={{
                    ...createFilterPillStyle(tokens, { active: selectedSource === null }),
                    cursor: 'pointer',
                  }}
                >
                  <Text style={{ fontSize: tokens.typography.fontSize.sm }}>All</Text>
                </Box>
                {['chat', 'social', 'tips', 'complaints', 'survey'].map((source) => (
                  <Box
                    key={source}
                    onClick={() => setSelectedSource(source)}
                    style={{
                      ...createFilterPillStyle(tokens, { active: selectedSource === source }),
                      cursor: 'pointer',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        textTransform: 'capitalize',
                      }}
                    >
                      {source}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Signal Feed */}
            <Box style={createCardStyle(tokens)}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[3],
                }}
              >
                Live Signal Feed
              </Text>
              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: tokens.spacing[2],
                  maxHeight: '600px',
                  overflowY: 'auto',
                }}
              >
                {filteredSignals.map((signal) => (
                  <Box
                    key={signal.id}
                    style={{
                      padding: tokens.spacing[2],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: getSentimentBg(signal.sentiment),
                      border: `1px solid ${getSentimentColor(signal.sentiment)}33`,
                    }}
                  >
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                        <Box
                          style={{
                            ...createBadgeStyle(tokens, getSourceBadgeColor(signal.source)),
                            textTransform: 'capitalize',
                          }}
                        >
                          <Text style={{ fontSize: tokens.typography.fontSize.xs }}>
                            {signal.source}
                          </Text>
                        </Box>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                          }}
                        >
                          {formatTimestamp(signal.timestamp)}
                        </Text>
                      </Box>
                      <Box
                        style={{
                          padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                          borderRadius: tokens.borderRadius.sm,
                          backgroundColor: getSentimentColor(signal.sentiment),
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.common.white,
                          }}
                        >
                          {signal.sentiment > 0 ? '+' : ''}
                          {(signal.sentiment * 100).toFixed(0)}
                        </Text>
                      </Box>
                    </Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[800],
                        lineHeight: '1.5',
                      }}
                    >
                      {signal.content}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    )
  },
})
