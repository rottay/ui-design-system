'use client'

import { createPreset, type PresetContext } from '../../../factory'
import {
  createCardStyle,
  createBadgeStyle,
  createFilterPillStyle,
  createSurfaceStyle,
} from '../../../helpers'
import type { CrowdFlowProps } from '../../core'
import { useState } from 'react'

// Mock data
const MOCK_SCENARIOS = [
  {
    scenarioName: 'Baseline',
    description: 'Current configuration with existing entry points',
    vectors: [
      { x: 20, y: 30, directionDeg: 45, magnitude: 0.8, speed: 'normal' as const },
      { x: 40, y: 25, directionDeg: 90, magnitude: 0.9, speed: 'normal' as const },
      { x: 60, y: 35, directionDeg: 135, magnitude: 0.4, speed: 'slow' as const },
      { x: 80, y: 40, directionDeg: 180, magnitude: 0.3, speed: 'slow' as const },
      { x: 25, y: 60, directionDeg: 0, magnitude: 0.95, speed: 'fast' as const },
    ],
    bottlenecks: [
      {
        id: 'bn-1',
        x: 80,
        y: 40,
        severity: 'high' as const,
        description: 'Main entrance congestion predicted',
      },
      {
        id: 'bn-2',
        x: 60,
        y: 35,
        severity: 'medium' as const,
        description: 'Stage area slowdown expected',
      },
    ],
  },
  {
    scenarioName: 'Add Side Entrance',
    description: 'Open additional entry point on west side - reduces main entrance load by 35%',
    vectors: [
      { x: 20, y: 30, directionDeg: 45, magnitude: 0.8, speed: 'normal' as const },
      { x: 40, y: 25, directionDeg: 90, magnitude: 0.6, speed: 'normal' as const },
      { x: 60, y: 35, directionDeg: 135, magnitude: 0.7, speed: 'normal' as const },
      { x: 80, y: 40, directionDeg: 180, magnitude: 0.5, speed: 'normal' as const },
      { x: 10, y: 50, directionDeg: 0, magnitude: 0.85, speed: 'normal' as const },
      { x: 25, y: 60, directionDeg: 0, magnitude: 0.8, speed: 'normal' as const },
    ],
    bottlenecks: [
      {
        id: 'bn-1',
        x: 80,
        y: 40,
        severity: 'low' as const,
        description: 'Main entrance improved - no congestion',
      },
    ],
  },
  {
    scenarioName: 'VIP Fast Lane',
    description: 'Dedicated VIP lane at main entrance - separates 15% of traffic',
    vectors: [
      { x: 20, y: 30, directionDeg: 45, magnitude: 0.8, speed: 'normal' as const },
      { x: 40, y: 25, directionDeg: 90, magnitude: 0.7, speed: 'normal' as const },
      { x: 60, y: 35, directionDeg: 135, magnitude: 0.5, speed: 'normal' as const },
      { x: 80, y: 40, directionDeg: 180, magnitude: 0.4, speed: 'normal' as const },
      { x: 85, y: 35, directionDeg: 180, magnitude: 0.9, speed: 'fast' as const },
      { x: 25, y: 60, directionDeg: 0, magnitude: 0.95, speed: 'fast' as const },
    ],
    bottlenecks: [
      {
        id: 'bn-1',
        x: 80,
        y: 40,
        severity: 'medium' as const,
        description: 'Main entrance moderately improved',
      },
    ],
  },
]

export const CrowdFlowPredictive = createPreset<CrowdFlowProps>({
  name: 'CrowdFlow.Predictive',
  render: (ctx: PresetContext<CrowdFlowProps>) => {
    const { primitives, props, tokens, engine } = ctx
    const { Box, Text } = primitives

    const [selectedScenario, setSelectedScenario] = useState(0)

    const scenarios = props.predictions || MOCK_SCENARIOS
    const currentScenario = scenarios[selectedScenario]
    const baselineScenario = scenarios[0]

    const getSpeedColor = (speed: string) => {
      switch (speed) {
        case 'fast':
          return tokens.colors.successScale[500]
        case 'slow':
          return tokens.colors.errorScale[500]
        default:
          return tokens.colors.primaryScale[500]
      }
    }

    const getSeverityColor = (severity: string) => {
      switch (severity) {
        case 'high':
          return tokens.colors.errorScale[500]
        case 'medium':
          return tokens.colors.warningScale[500]
        default:
          return tokens.colors.infoScale[500]
      }
    }

    const getSeverityBg = (severity: string) => {
      switch (severity) {
        case 'high':
          return tokens.colors.errorScale[100]
        case 'medium':
          return tokens.colors.warningScale[100]
        default:
          return tokens.colors.infoScale[100]
      }
    }

    const calculateAvgSpeed = (vectors: typeof currentScenario.vectors) => {
      const speedValues = vectors.map((v) => {
        switch (v.speed) {
          case 'fast':
            return 1.0
          case 'slow':
            return 0.4
          default:
            return 0.7
        }
      })
      return speedValues.reduce((a, b) => a + b, 0) / speedValues.length
    }

    const currentAvgSpeed = calculateAvgSpeed(currentScenario.vectors)
    const baselineAvgSpeed = calculateAvgSpeed(baselineScenario.vectors)
    const speedImprovement = ((currentAvgSpeed - baselineAvgSpeed) / baselineAvgSpeed) * 100

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
            Predictive Flow Analysis
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[600],
            }}
          >
            What-if scenarios and predicted bottleneck warnings
          </Text>
        </Box>

        {/* Scenario Selector */}
        <Box
          style={{
            padding: tokens.spacing[4],
            borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[2],
            }}
          >
            Select Scenario
          </Text>
          <Box style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' }}>
            {scenarios.map((scenario, idx) => (
              <Box
                key={idx}
                onClick={() => setSelectedScenario(idx)}
                style={{
                  ...createFilterPillStyle(tokens, { active: selectedScenario === idx }),
                  cursor: 'pointer',
                }}
              >
                <Text style={{ fontSize: tokens.typography.fontSize.sm }}>
                  {scenario.scenarioName}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Scenario Description */}
        <Box
          style={{
            padding: tokens.spacing[4],
            backgroundColor: tokens.colors.infoScale[50],
            borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[2] }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.infoScale[700],
              }}
            >
              What if:
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[700],
                flex: 1,
              }}
            >
              {currentScenario.description}
            </Text>
          </Box>
        </Box>

        {/* Comparison Metrics */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
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
              Predicted Avg Speed
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {(currentAvgSpeed * 100).toFixed(0)}%
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
              vs Baseline
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color:
                  speedImprovement > 0
                    ? tokens.colors.successScale[600]
                    : speedImprovement < 0
                    ? tokens.colors.errorScale[600]
                    : tokens.colors.neutral[900],
              }}
            >
              {speedImprovement > 0 ? '+' : ''}
              {speedImprovement.toFixed(1)}%
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
              Predicted Bottlenecks
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color:
                  currentScenario.bottlenecks.length < baselineScenario.bottlenecks.length
                    ? tokens.colors.successScale[600]
                    : tokens.colors.neutral[900],
              }}
            >
              {currentScenario.bottlenecks.length}
            </Text>
          </Box>
        </Box>

        {/* Main Content */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: '3fr 1fr',
            gap: tokens.spacing[4],
            padding: tokens.spacing[4],
          }}
        >
          {/* Predicted Flow Map */}
          <Box>
            <Box
              style={{
                ...createCardStyle(tokens),
                position: 'relative',
                height: '500px',
                backgroundColor: tokens.colors.neutral[50],
              }}
            >
              {/* Predicted Flow Arrows (dashed) */}
              {currentScenario.vectors.map((vector, idx) => {
                const arrowLength = 30 + vector.magnitude * 30
                const endX =
                  vector.x + Math.cos((vector.directionDeg * Math.PI) / 180) * arrowLength
                const endY =
                  vector.y + Math.sin((vector.directionDeg * Math.PI) / 180) * arrowLength

                return (
                  <Box
                    key={idx}
                    style={{
                      position: 'absolute',
                      left: `${vector.x}%`,
                      top: `${vector.y}%`,
                      width: '0',
                      height: '0',
                    }}
                  >
                    <svg
                      width="100"
                      height="100"
                      style={{
                        position: 'absolute',
                        left: '-50px',
                        top: '-50px',
                        overflow: 'visible',
                      }}
                    >
                      <defs>
                        <marker
                          id={`arrowhead-pred-${idx}`}
                          markerWidth="10"
                          markerHeight="10"
                          refX="5"
                          refY="3"
                          orient="auto"
                        >
                          <polygon
                            points="0 0, 10 3, 0 6"
                            fill={getSpeedColor(vector.speed)}
                          />
                        </marker>
                      </defs>
                      <line
                        x1="50"
                        y1="50"
                        x2={50 + (endX - vector.x) * 5}
                        y2={50 + (endY - vector.y) * 5}
                        stroke={getSpeedColor(vector.speed)}
                        strokeWidth={2 + vector.magnitude * 3}
                        strokeDasharray="5,5"
                        markerEnd={`url(#arrowhead-pred-${idx})`}
                      />
                    </svg>
                  </Box>
                )
              })}

              {/* Predicted Bottleneck Markers */}
              {currentScenario.bottlenecks.map((bottleneck) => (
                <Box
                  key={bottleneck.id}
                  style={{
                    position: 'absolute',
                    left: `${bottleneck.x}%`,
                    top: `${bottleneck.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <Box
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: getSeverityBg(bottleneck.severity),
                      border: `2px dashed ${getSeverityColor(bottleneck.severity)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: getSeverityColor(bottleneck.severity),
                      }}
                    >
                      !
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Predicted Warnings */}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
            <Box style={createCardStyle(tokens)}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[2],
                }}
              >
                Predicted Issues
              </Text>
              {currentScenario.bottlenecks.length === 0 ? (
                <Box
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.successScale[50],
                    border: `1px solid ${tokens.colors.successScale[200]}`,
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.successScale[700],
                      textAlign: 'center',
                    }}
                  >
                    No bottlenecks predicted
                  </Text>
                </Box>
              ) : (
                <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                  {currentScenario.bottlenecks.map((bottleneck) => (
                    <Box
                      key={bottleneck.id}
                      style={{
                        padding: tokens.spacing[2],
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: getSeverityBg(bottleneck.severity),
                        border: `1px dashed ${getSeverityColor(bottleneck.severity)}`,
                      }}
                    >
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                          marginBottom: tokens.spacing[1],
                        }}
                      >
                        <Box
                          style={{
                            ...createBadgeStyle(tokens, bottleneck.severity === 'high' ? 'error' : bottleneck.severity === 'medium' ? 'warning' : 'info'),
                            textTransform: 'uppercase',
                          }}
                        >
                          <Text style={{ fontSize: tokens.typography.fontSize.xs }}>
                            {bottleneck.severity}
                          </Text>
                        </Box>
                      </Box>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[700],
                        }}
                      >
                        {bottleneck.description}
                      </Text>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* Impact Summary */}
            <Box style={createCardStyle(tokens)}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[2],
                }}
              >
                Impact Summary
              </Text>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingBottom: tokens.spacing[1],
                    borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[600],
                    }}
                  >
                    Flow Improvement
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color:
                        speedImprovement > 0
                          ? tokens.colors.successScale[600]
                          : tokens.colors.neutral[700],
                    }}
                  >
                    {speedImprovement > 0 ? '+' : ''}
                    {speedImprovement.toFixed(1)}%
                  </Text>
                </Box>
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingBottom: tokens.spacing[1],
                    borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[600],
                    }}
                  >
                    Bottleneck Reduction
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color:
                        currentScenario.bottlenecks.length < baselineScenario.bottlenecks.length
                          ? tokens.colors.successScale[600]
                          : tokens.colors.neutral[700],
                    }}
                  >
                    {baselineScenario.bottlenecks.length - currentScenario.bottlenecks.length > 0
                      ? `-${baselineScenario.bottlenecks.length - currentScenario.bottlenecks.length}`
                      : '0'}
                  </Text>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    )
  },
})
