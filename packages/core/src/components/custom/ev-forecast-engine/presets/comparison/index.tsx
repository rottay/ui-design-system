'use client'

import { createPreset, type PresetContext } from '../../../factory'
import { createCardStyle, createBadgeStyle, createSurfaceStyle } from '../../../helpers'
import type { ForecastEngineProps } from '../../core'

// Mock data
const MOCK_COMPARISONS = [
  {
    eventName: 'Summer Solstice EDM Festival',
    forecast: {
      attendance: 2800,
      revenue: 168000,
      staffNeeded: 52,
      inventoryNeeded: {},
      confidence: 0.85,
    },
    actual: {
      attendance: 2650,
      revenue: 159000,
      staffNeeded: 52,
      inventoryNeeded: {},
      confidence: 1.0,
    },
    accuracyScore: 94.6,
  },
  {
    eventName: 'New Year Countdown Party',
    forecast: {
      attendance: 1500,
      revenue: 105000,
      staffNeeded: 38,
      inventoryNeeded: {},
      confidence: 0.78,
    },
    actual: {
      attendance: 1820,
      revenue: 127400,
      staffNeeded: 42,
      inventoryNeeded: {},
      confidence: 1.0,
    },
    accuracyScore: 82.4,
  },
  {
    eventName: 'Techno Thursday',
    forecast: {
      attendance: 850,
      revenue: 34000,
      staffNeeded: 18,
      inventoryNeeded: {},
      confidence: 0.92,
    },
    actual: {
      attendance: 880,
      revenue: 35200,
      staffNeeded: 19,
      inventoryNeeded: {},
      confidence: 1.0,
    },
    accuracyScore: 96.5,
  },
  {
    eventName: 'Halloween Spooktacular',
    forecast: {
      attendance: 2200,
      revenue: 132000,
      staffNeeded: 45,
      inventoryNeeded: {},
      confidence: 0.81,
    },
    actual: {
      attendance: 1950,
      revenue: 117000,
      staffNeeded: 40,
      inventoryNeeded: {},
      confidence: 1.0,
    },
    accuracyScore: 88.6,
  },
]

export const ForecastEngineComparison = createPreset<ForecastEngineProps>({
  name: 'ForecastEngine.Comparison',
  render: (ctx: PresetContext<ForecastEngineProps>) => {
    const { primitives, props, tokens, engine } = ctx
    const { Box, Text } = primitives

    const comparisons = props.comparisons || MOCK_COMPARISONS

    const getAccuracyColor = (score: number) => {
      if (score >= 90) return tokens.colors.successScale[500]
      if (score >= 80) return tokens.colors.primaryScale[500]
      if (score >= 70) return tokens.colors.warningScale[500]
      return tokens.colors.errorScale[500]
    }

    const getAccuracyBg = (score: number) => {
      if (score >= 90) return tokens.colors.successScale[50]
      if (score >= 80) return tokens.colors.primaryScale[50]
      if (score >= 70) return tokens.colors.warningScale[50]
      return tokens.colors.errorScale[50]
    }

    const getVarianceColor = (variance: number) => {
      const abs = Math.abs(variance)
      if (abs <= 5) return tokens.colors.successScale[500]
      if (abs <= 10) return tokens.colors.primaryScale[500]
      if (abs <= 15) return tokens.colors.warningScale[500]
      return tokens.colors.errorScale[500]
    }

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(amount)
    }

    const calculateVariance = (forecast: number, actual: number) => {
      return ((forecast - actual) / actual) * 100
    }

    const overallAccuracy =
      comparisons.reduce((sum, c) => sum + c.accuracyScore, 0) / comparisons.length

    // Find best and worst predictions
    const sortedByAccuracy = [...comparisons].sort((a, b) => b.accuracyScore - a.accuracyScore)
    const bestPrediction = sortedByAccuracy[0]
    const worstPrediction = sortedByAccuracy[sortedByAccuracy.length - 1]

    // Calculate metric-specific accuracy
    const attendanceVariances = comparisons.map((c) =>
      Math.abs(calculateVariance(c.forecast.attendance, c.actual.attendance))
    )
    const revenueVariances = comparisons.map((c) =>
      Math.abs(calculateVariance(c.forecast.revenue, c.actual.revenue))
    )
    const staffVariances = comparisons.map((c) =>
      Math.abs(calculateVariance(c.forecast.staffNeeded, c.actual.staffNeeded))
    )

    const avgAttendanceAccuracy =
      100 - attendanceVariances.reduce((a, b) => a + b, 0) / attendanceVariances.length
    const avgRevenueAccuracy =
      100 - revenueVariances.reduce((a, b) => a + b, 0) / revenueVariances.length
    const avgStaffAccuracy =
      100 - staffVariances.reduce((a, b) => a + b, 0) / staffVariances.length

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
            Forecast vs Actual Comparison
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[600],
            }}
          >
            Historical accuracy analysis and performance metrics
          </Text>
        </Box>

        {/* Summary Cards */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: tokens.spacing[3],
            padding: tokens.spacing[4],
            borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
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
              Overall Accuracy
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: getAccuracyColor(overallAccuracy),
              }}
            >
              {overallAccuracy.toFixed(1)}%
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
              Attendance Accuracy
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: getAccuracyColor(avgAttendanceAccuracy),
              }}
            >
              {avgAttendanceAccuracy.toFixed(1)}%
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
              Revenue Accuracy
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: getAccuracyColor(avgRevenueAccuracy),
              }}
            >
              {avgRevenueAccuracy.toFixed(1)}%
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
              Staffing Accuracy
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: getAccuracyColor(avgStaffAccuracy),
              }}
            >
              {avgStaffAccuracy.toFixed(1)}%
            </Text>
          </Box>
        </Box>

        {/* Main Content */}
        <Box style={{ padding: tokens.spacing[4] }}>
          {/* Best/Worst Predictions */}
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: tokens.spacing[3],
              marginBottom: tokens.spacing[4],
            }}
          >
            <Box
              style={{
                ...createCardStyle(tokens),
                backgroundColor: tokens.colors.successScale[50],
                border: `2px solid ${tokens.colors.successScale[200]}`,
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.successScale[700],
                  marginBottom: tokens.spacing[2],
                }}
              >
                Best Prediction
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[1],
                }}
              >
                {bestPrediction.eventName}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.successScale[600],
                }}
              >
                {bestPrediction.accuracyScore.toFixed(1)}%
              </Text>
            </Box>

            <Box
              style={{
                ...createCardStyle(tokens),
                backgroundColor: tokens.colors.warningScale[50],
                border: `2px solid ${tokens.colors.warningScale[200]}`,
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.warningScale[700],
                  marginBottom: tokens.spacing[2],
                }}
              >
                Needs Improvement
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[1],
                }}
              >
                {worstPrediction.eventName}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.warningScale[600],
                }}
              >
                {worstPrediction.accuracyScore.toFixed(1)}%
              </Text>
            </Box>
          </Box>

          {/* Comparison Table */}
          <Box style={createCardStyle(tokens)}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                marginBottom: tokens.spacing[3],
              }}
            >
              Event Comparisons
            </Text>

            {/* Table Header */}
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                gap: tokens.spacing[2],
                padding: tokens.spacing[2],
                borderBottom: `2px solid ${tokens.colors.neutral[200]}`,
                marginBottom: tokens.spacing[2],
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[600],
                  textTransform: 'uppercase',
                }}
              >
                Event
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[600],
                  textTransform: 'uppercase',
                  textAlign: 'center',
                }}
              >
                Attendance
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[600],
                  textTransform: 'uppercase',
                  textAlign: 'center',
                }}
              >
                Revenue
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[600],
                  textTransform: 'uppercase',
                  textAlign: 'center',
                }}
              >
                Staff
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[600],
                  textTransform: 'uppercase',
                  textAlign: 'center',
                }}
              >
                Accuracy
              </Text>
            </Box>

            {/* Table Rows */}
            {comparisons.map((comparison, idx) => {
              const attendanceVariance = calculateVariance(
                comparison.forecast.attendance,
                comparison.actual.attendance
              )
              const revenueVariance = calculateVariance(
                comparison.forecast.revenue,
                comparison.actual.revenue
              )
              const staffVariance = calculateVariance(
                comparison.forecast.staffNeeded,
                comparison.actual.staffNeeded
              )

              return (
                <Box
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                    gap: tokens.spacing[2],
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.neutral[50],
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  {/* Event Name */}
                  <Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      {comparison.eventName}
                    </Text>
                    <Box
                      style={{
                        ...createBadgeStyle(
                          tokens,
                          comparison.accuracyScore >= 90 ? 'success' : comparison.accuracyScore >= 80 ? 'primary' : comparison.accuracyScore >= 70 ? 'warning' : 'error'
                        ),
                      }}
                    >
                      <Text style={{ fontSize: tokens.typography.fontSize.xs }}>
                        {comparison.accuracyScore.toFixed(1)}% accurate
                      </Text>
                    </Box>
                  </Box>

                  {/* Attendance */}
                  <Box style={{ textAlign: 'center' }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[900],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      {comparison.forecast.attendance.toLocaleString()}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      vs {comparison.actual.attendance.toLocaleString()}
                    </Text>
                    <Box
                      style={{
                        display: 'inline-block',
                        padding: `2px ${tokens.spacing[1]}`,
                        borderRadius: tokens.borderRadius.sm,
                        backgroundColor: getVarianceColor(attendanceVariance),
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.common.white,
                        }}
                      >
                        {attendanceVariance > 0 ? '+' : ''}
                        {attendanceVariance.toFixed(1)}%
                      </Text>
                    </Box>
                  </Box>

                  {/* Revenue */}
                  <Box style={{ textAlign: 'center' }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[900],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      {formatCurrency(comparison.forecast.revenue)}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      vs {formatCurrency(comparison.actual.revenue)}
                    </Text>
                    <Box
                      style={{
                        display: 'inline-block',
                        padding: `2px ${tokens.spacing[1]}`,
                        borderRadius: tokens.borderRadius.sm,
                        backgroundColor: getVarianceColor(revenueVariance),
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.common.white,
                        }}
                      >
                        {revenueVariance > 0 ? '+' : ''}
                        {revenueVariance.toFixed(1)}%
                      </Text>
                    </Box>
                  </Box>

                  {/* Staff */}
                  <Box style={{ textAlign: 'center' }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[900],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      {comparison.forecast.staffNeeded}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      vs {comparison.actual.staffNeeded}
                    </Text>
                    <Box
                      style={{
                        display: 'inline-block',
                        padding: `2px ${tokens.spacing[1]}`,
                        borderRadius: tokens.borderRadius.sm,
                        backgroundColor: getVarianceColor(staffVariance),
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.common.white,
                        }}
                      >
                        {staffVariance > 0 ? '+' : ''}
                        {staffVariance.toFixed(1)}%
                      </Text>
                    </Box>
                  </Box>

                  {/* Accuracy Score */}
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      style={{
                        padding: tokens.spacing[2],
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: getAccuracyBg(comparison.accuracyScore),
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.lg,
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: getAccuracyColor(comparison.accuracyScore),
                        }}
                      >
                        {comparison.accuracyScore.toFixed(1)}%
                      </Text>
                    </Box>
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Box>
      </Box>
    )
  },
})
