'use client'

import React from 'react'
import { createPreset, type PresetContext } from '../../../factory'
import { createCardStyle, createBadgeStyle, createSurfaceStyle } from '../../../helpers'
import type { SentimentPulseProps } from '../../core'

// Mock data
const MOCK_WORD_CLOUD = [
  { word: 'amazing', frequency: 45, sentiment: 0.9 },
  { word: 'music', frequency: 38, sentiment: 0.85 },
  { word: 'great', frequency: 35, sentiment: 0.8 },
  { word: 'love', frequency: 32, sentiment: 0.88 },
  { word: 'DJ', frequency: 30, sentiment: 0.82 },
  { word: 'vibe', frequency: 28, sentiment: 0.75 },
  { word: 'wait', frequency: 25, sentiment: -0.5 },
  { word: 'long', frequency: 22, sentiment: -0.4 },
  { word: 'crowded', frequency: 20, sentiment: -0.3 },
  { word: 'drinks', frequency: 18, sentiment: 0.6 },
  { word: 'staff', frequency: 16, sentiment: 0.7 },
  { word: 'sound', frequency: 15, sentiment: 0.85 },
  { word: 'perfect', frequency: 14, sentiment: 0.95 },
  { word: 'expensive', frequency: 12, sentiment: -0.6 },
  { word: 'energy', frequency: 11, sentiment: 0.8 },
  { word: 'bathroom', frequency: 10, sentiment: -0.7 },
  { word: 'friendly', frequency: 9, sentiment: 0.85 },
  { word: 'slow', frequency: 8, sentiment: -0.5 },
]

const MOCK_TOP_POSITIVE = [
  'DJ performance exceptional',
  'Sound quality outstanding',
  'Staff very attentive',
  'Great atmosphere',
  'Excellent music selection',
]

const MOCK_TOP_NEGATIVE = [
  'Bar wait times excessive',
  'Bathroom facilities inadequate',
  'Drink prices high',
  'Too crowded at entrance',
  'Coat check delays',
]

const MOCK_SOURCE_BREAKDOWN = [
  { source: 'chat', positive: 72, negative: 28, avgSentiment: 0.68 },
  { source: 'social', positive: 78, negative: 22, avgSentiment: 0.75 },
  { source: 'tips', positive: 85, negative: 15, avgSentiment: 0.82 },
  { source: 'complaints', positive: 35, negative: 65, avgSentiment: -0.42 },
  { source: 'survey', positive: 88, negative: 12, avgSentiment: 0.85 },
]

const MOCK_TRENDING_TOPICS = [
  { topic: 'DJ Set Quality', mentions: 156, sentiment: 0.89, trend: 'up' as const },
  { topic: 'Bar Service Speed', mentions: 98, sentiment: -0.45, trend: 'down' as const },
  { topic: 'Sound System', mentions: 87, sentiment: 0.84, trend: 'stable' as const },
  { topic: 'Crowd Management', mentions: 76, sentiment: -0.32, trend: 'down' as const },
  { topic: 'Staff Friendliness', mentions: 65, sentiment: 0.78, trend: 'up' as const },
]

const MOCK_AI_ANALYSIS = `Deep sentiment analysis reveals a strong positive reception to entertainment quality, with DJ performance and sound engineering receiving consistently high praise across all channels. Music selection and technical execution are clear differentiators.

Key operational challenges center around capacity management and service bottlenecks. Bar service wait times are the primary detractor, mentioned in 23% of negative feedback. This appears to be peak-hour specific (10pm-12am window).

Staff sentiment is bifurcated: front-of-house service staff receive positive mentions (82% positive), while back-of-house efficiency concerns emerge during peak periods. This suggests staffing allocation rather than training issues.

Infrastructure pain points (bathrooms, coat check) indicate capacity planning opportunities. Current satisfaction levels suggest venue is operating at 110-115% of optimal capacity for guest experience.

Recommendation: Consider dynamic pricing to smooth demand curves, increase bar staff by 2-3 positions during peak windows, and implement express service lanes for simple orders.`

export const SentimentPulseAnalysis = createPreset<SentimentPulseProps>({
  name: 'SentimentPulse.Analysis',
  render: (ctx: PresetContext<SentimentPulseProps>) => {
    const { primitives, props, tokens, engine } = ctx
    const { Box, Text } = primitives

    const wordCloud = MOCK_WORD_CLOUD
    const topPositive = props.summary?.topPositive || MOCK_TOP_POSITIVE
    const topNegative = props.summary?.topNegative || MOCK_TOP_NEGATIVE
    const sourceBreakdown = MOCK_SOURCE_BREAKDOWN
    const trendingTopics = (props.trendingTopics || MOCK_TRENDING_TOPICS) as typeof MOCK_TRENDING_TOPICS
    const aiAnalysis = props.summary?.aiSummary || MOCK_AI_ANALYSIS

    const getSentimentColor = (sentiment: number) => {
      if (sentiment > 0.6) return tokens.colors.successScale[600]
      if (sentiment > 0.2) return tokens.colors.primaryScale[600]
      if (sentiment > -0.2) return tokens.colors.neutral[600]
      if (sentiment > -0.6) return tokens.colors.warningScale[600]
      return tokens.colors.errorScale[600]
    }

    const getTrendColor = (trend: string) => {
      switch (trend) {
        case 'up':
          return tokens.colors.successScale[500]
        case 'down':
          return tokens.colors.errorScale[500]
        default:
          return tokens.colors.neutral[500]
      }
    }

    const getTrendArrow = (trend: string) => {
      switch (trend) {
        case 'up':
          return '↑'
        case 'down':
          return '↓'
        default:
          return '→'
      }
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

    // Calculate font sizes for word cloud (12px to 36px based on frequency)
    const maxFreq = Math.max(...wordCloud.map((w) => w.frequency))
    const minFreq = Math.min(...wordCloud.map((w) => w.frequency))
    const getFontSize = (freq: number) => {
      const normalized = (freq - minFreq) / (maxFreq - minFreq)
      return 12 + normalized * 24
    }

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
            Sentiment Analysis
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[600],
            }}
          >
            Deep dive into sentiment patterns, topics, and channel performance
          </Text>
        </Box>

        {/* Main Content */}
        <Box style={{ padding: tokens.spacing[4] }}>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: tokens.spacing[4],
              marginBottom: tokens.spacing[4],
            }}
          >
            {/* Word Cloud */}
            <Box style={createCardStyle(tokens)}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[3],
                }}
              >
                Word Cloud
              </Text>
              <Box
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: tokens.spacing[3],
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: tokens.spacing[4],
                  minHeight: '300px',
                }}
              >
                {wordCloud.map((item, idx) => (
                  <Box
                    key={idx}
                    style={{
                      display: 'inline-block',
                      padding: tokens.spacing[1],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: `${getFontSize(item.frequency)}px`,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: getSentimentColor(item.sentiment),
                        lineHeight: '1.2',
                      }}
                    >
                      {item.word}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Top Topics Lists */}
            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
              <Box style={createCardStyle(tokens)}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.successScale[700],
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  Top Positive Topics
                </Text>
                <Box
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: tokens.spacing[2],
                  }}
                >
                  {topPositive.map((topic, idx) => (
                    <Box
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        padding: tokens.spacing[2],
                        borderRadius: tokens.borderRadius.sm,
                        backgroundColor: tokens.colors.successScale[50],
                      }}
                    >
                      <Box
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.successScale[500],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.bold,
                            color: tokens.colors.common.white,
                          }}
                        >
                          {idx + 1}
                        </Text>
                      </Box>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[800],
                        }}
                      >
                        {topic}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box style={createCardStyle(tokens)}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.errorScale[700],
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  Top Negative Topics
                </Text>
                <Box
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: tokens.spacing[2],
                  }}
                >
                  {topNegative.map((topic, idx) => (
                    <Box
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        padding: tokens.spacing[2],
                        borderRadius: tokens.borderRadius.sm,
                        backgroundColor: tokens.colors.errorScale[50],
                      }}
                    >
                      <Box
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.errorScale[500],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.bold,
                            color: tokens.colors.common.white,
                          }}
                        >
                          {idx + 1}
                        </Text>
                      </Box>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[800],
                        }}
                      >
                        {topic}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Source Breakdown */}
          <Box style={{ ...createCardStyle(tokens), marginBottom: tokens.spacing[4] }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                marginBottom: tokens.spacing[3],
              }}
            >
              Source Breakdown
            </Text>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: tokens.spacing[3],
              }}
            >
              {sourceBreakdown.map((item) => (
                <Box
                  key={item.source}
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.md,
                    border: `2px solid ${getSourceColor(item.source)}`,
                    backgroundColor: `${getSourceColor(item.source)}08`,
                  }}
                >
                  <Box
                    style={{
                      ...createBadgeStyle(tokens, getSourceBadgeColor(item.source)),
                      marginBottom: tokens.spacing[2],
                      textTransform: 'capitalize',
                    }}
                  >
                    <Text style={{ fontSize: tokens.typography.fontSize.xs }}>{item.source}</Text>
                  </Box>

                  <Box style={{ marginBottom: tokens.spacing[2] }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize['2xl'],
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: getSentimentColor(item.avgSentiment),
                      }}
                    >
                      {(item.avgSentiment * 100).toFixed(0)}
                    </Text>
                  </Box>

                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[600],
                    }}
                  >
                    <Text style={{ color: tokens.colors.successScale[600] }}>
                      {item.positive}% +
                    </Text>
                    <Text style={{ color: tokens.colors.errorScale[600] }}>{item.negative}% -</Text>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Trending Topics */}
          <Box style={{ ...createCardStyle(tokens), marginBottom: tokens.spacing[4] }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                marginBottom: tokens.spacing[3],
              }}
            >
              Trending Topics
            </Text>
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: tokens.spacing[2],
              }}
            >
              {trendingTopics.map((item, idx) => (
                <Box
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 80px',
                    gap: tokens.spacing[3],
                    alignItems: 'center',
                    padding: tokens.spacing[2],
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.neutral[50],
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[900],
                    }}
                  >
                    {item.topic}
                  </Text>

                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[600],
                    }}
                  >
                    {item.mentions} mentions
                  </Text>

                  <Box
                    style={{
                      padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                      borderRadius: tokens.borderRadius.sm,
                      backgroundColor: getSentimentColor(item.sentiment),
                      textAlign: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.common.white,
                      }}
                    >
                      {(item.sentiment * 100).toFixed(0)}
                    </Text>
                  </Box>

                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.lg,
                        color: getTrendColor(item.trend),
                      }}
                    >
                      {getTrendArrow(item.trend)}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: getTrendColor(item.trend),
                        textTransform: 'capitalize',
                      }}
                    >
                      {item.trend}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Detailed AI Analysis */}
          <Box style={createCardStyle(tokens)}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                marginBottom: tokens.spacing[3],
              }}
            >
              Detailed AI Analysis
            </Text>
            <Box
              style={{
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.primaryScale[50],
                border: `1px solid ${tokens.colors.primaryScale[200]}`,
              }}
            >
              {aiAnalysis.split('\n\n').map((paragraph, idx) => (
                <Text
                  key={idx}
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[700],
                    lineHeight: '1.7',
                    marginBottom: idx < aiAnalysis.split('\n\n').length - 1 ? tokens.spacing[3] : '0',
                  }}
                >
                  {paragraph}
                </Text>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    )
  },
})
