'use client'

import { createPreset, type PresetContext } from '../../../factory'
import {
  createCardStyle,
  createBadgeStyle,
  createSurfaceStyle,
} from '../../../helpers'
import type { ForecastEngineProps } from '../../core'
import { useState } from 'react'

// Mock data
const MOCK_INPUT = {
  eventType: 'EDM Concert',
  expectedAttendance: 1200,
  ticketPrice: 45,
  venueCapacity: 1500,
  date: new Date('2026-03-15T20:00:00'),
}

const MOCK_RESULT = {
  attendance: 1150,
  revenue: 51750,
  staffNeeded: 28,
  inventoryNeeded: {
    'Beer (cases)': 85,
    'Liquor (bottles)': 42,
    'Mixers (liters)': 120,
    'Water (bottles)': 300,
    'Ice (bags)': 35,
    'Cups (units)': 2500,
    'Napkins (packs)': 45,
    'Security Staff': 8,
    'Bar Staff': 12,
    'Door Staff': 4,
    'Cleaning Staff': 4,
  },
  confidence: 0.87,
}

export const ForecastEnginePlanner = createPreset<ForecastEngineProps>({
  name: 'ForecastEngine.Planner',
  render: (ctx: PresetContext<ForecastEngineProps>) => {
    const { primitives, props, tokens, engine } = ctx
    const { Box, Text } = primitives

    const [inputs, setInputs] = useState(props.inputs || MOCK_INPUT)
    const [result, setResult] = useState(props.results || MOCK_RESULT)

    const getConfidenceColor = (confidence: number) => {
      if (confidence >= 0.8) return tokens.colors.successScale[500]
      if (confidence >= 0.6) return tokens.colors.warningScale[500]
      return tokens.colors.errorScale[500]
    }

    const getConfidenceBg = (confidence: number) => {
      if (confidence >= 0.8) return tokens.colors.successScale[50]
      if (confidence >= 0.6) return tokens.colors.warningScale[50]
      return tokens.colors.errorScale[50]
    }

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(amount)
    }

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(date)
    }

    // Categorize inventory
    const beverageItems = Object.entries(result.inventoryNeeded).filter(([key]) =>
      ['Beer', 'Liquor', 'Mixers', 'Water', 'Ice', 'Cups', 'Napkins'].some((cat) =>
        key.includes(cat)
      )
    )

    const staffingItems = Object.entries(result.inventoryNeeded).filter(([key]) =>
      key.includes('Staff')
    )

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
            Event Forecast Planner
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[600],
            }}
          >
            AI-powered predictions for attendance, revenue, and resource needs
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
          {/* Left Column - Input Form */}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
            <Box style={createCardStyle(tokens)}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[3],
                }}
              >
                Event Details
              </Text>

              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: tokens.spacing[3],
                }}
              >
                {/* Event Type */}
                <Box>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[700],
                      marginBottom: tokens.spacing[1],
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Event Type
                  </Text>
                  <Box
                    style={{
                      padding: tokens.spacing[2],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.neutral[50],
                      border: `1px solid ${tokens.colors.neutral[300]}`,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {inputs.eventType}
                    </Text>
                  </Box>
                </Box>

                {/* Expected Attendance */}
                <Box>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[700],
                      marginBottom: tokens.spacing[1],
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Expected Attendance
                  </Text>
                  <Box
                    style={{
                      padding: tokens.spacing[2],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.neutral[50],
                      border: `1px solid ${tokens.colors.neutral[300]}`,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {inputs.expectedAttendance.toLocaleString()} guests
                    </Text>
                  </Box>
                </Box>

                {/* Ticket Price */}
                <Box>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[700],
                      marginBottom: tokens.spacing[1],
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Ticket Price
                  </Text>
                  <Box
                    style={{
                      padding: tokens.spacing[2],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.neutral[50],
                      border: `1px solid ${tokens.colors.neutral[300]}`,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {formatCurrency(inputs.ticketPrice)}
                    </Text>
                  </Box>
                </Box>

                {/* Venue Capacity */}
                <Box>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[700],
                      marginBottom: tokens.spacing[1],
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Venue Capacity
                  </Text>
                  <Box
                    style={{
                      padding: tokens.spacing[2],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.neutral[50],
                      border: `1px solid ${tokens.colors.neutral[300]}`,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {inputs.venueCapacity.toLocaleString()}
                    </Text>
                  </Box>
                </Box>

                {/* Event Date */}
                <Box>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[700],
                      marginBottom: tokens.spacing[1],
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Event Date
                  </Text>
                  <Box
                    style={{
                      padding: tokens.spacing[2],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.neutral[50],
                      border: `1px solid ${tokens.colors.neutral[300]}`,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {formatDate(inputs.date)}
                    </Text>
                  </Box>
                </Box>

                {/* Run Forecast Button */}
                <Box
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.primaryScale[500],
                    textAlign: 'center',
                    cursor: 'pointer',
                    marginTop: tokens.spacing[2],
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.common.white,
                    }}
                  >
                    Run Forecast
                  </Text>
                </Box>
              </Box>
            </Box>

            {/* Confidence Score */}
            <Box style={createCardStyle(tokens)}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[2],
                }}
              >
                Forecast Confidence
              </Text>
              <Box
                style={{
                  padding: tokens.spacing[3],
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: getConfidenceBg(result.confidence),
                  border: `2px solid ${getConfidenceColor(result.confidence)}`,
                  textAlign: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize['3xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: getConfidenceColor(result.confidence),
                  }}
                >
                  {(result.confidence * 100).toFixed(0)}%
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[600],
                    marginTop: tokens.spacing[1],
                  }}
                >
                  {result.confidence >= 0.8
                    ? 'High confidence'
                    : result.confidence >= 0.6
                    ? 'Moderate confidence'
                    : 'Low confidence'}
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Right Column - Forecast Results */}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
            {/* Key Metrics */}
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: tokens.spacing[3],
              }}
            >
              <Box style={createCardStyle(tokens)}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[600],
                    marginBottom: tokens.spacing[1],
                  }}
                >
                  Predicted Attendance
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize['2xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.primaryScale[600],
                  }}
                >
                  {result.attendance.toLocaleString()}
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    marginTop: tokens.spacing[1],
                  }}
                >
                  {((result.attendance / inputs.expectedAttendance - 1) * 100).toFixed(1)}% vs
                  expected
                </Text>
              </Box>

              <Box style={createCardStyle(tokens)}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[600],
                    marginBottom: tokens.spacing[1],
                  }}
                >
                  Predicted Revenue
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize['2xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.successScale[600],
                  }}
                >
                  {formatCurrency(result.revenue)}
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    marginTop: tokens.spacing[1],
                  }}
                >
                  {formatCurrency(result.revenue / result.attendance)} per guest
                </Text>
              </Box>

              <Box style={createCardStyle(tokens)}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[600],
                    marginBottom: tokens.spacing[1],
                  }}
                >
                  Total Staff Needed
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize['2xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.infoScale[600],
                  }}
                >
                  {result.staffNeeded}
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    marginTop: tokens.spacing[1],
                  }}
                >
                  1:{Math.round(result.attendance / result.staffNeeded)} guest ratio
                </Text>
              </Box>
            </Box>

            {/* Inventory Breakdown */}
            <Box style={createCardStyle(tokens)}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[3],
                }}
              >
                Beverage & Supplies Inventory
              </Text>
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: tokens.spacing[2],
                }}
              >
                {beverageItems.map(([item, quantity]: [string, number]) => (
                  <Box
                    key={item}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: tokens.spacing[2],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.neutral[50],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                      }}
                    >
                      {item}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {quantity}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Staffing Breakdown */}
            <Box style={createCardStyle(tokens)}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[3],
                }}
              >
                Staffing Requirements
              </Text>
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: tokens.spacing[2],
                }}
              >
                {staffingItems.map(([role, count]: [string, number]) => (
                  <Box
                    key={role}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.primaryScale[50],
                      border: `1px solid ${tokens.colors.primaryScale[200]}`,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[800],
                      }}
                    >
                      {role}
                    </Text>
                    <Box
                      style={{
                        padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                        borderRadius: tokens.borderRadius.sm,
                        backgroundColor: tokens.colors.primaryScale[500],
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.common.white,
                        }}
                      >
                        {count}
                      </Text>
                    </Box>
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
