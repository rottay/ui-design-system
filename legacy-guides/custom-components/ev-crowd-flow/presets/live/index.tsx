'use client'

import { createPreset, type PresetContext } from '../../../factory'
import {
  createCardStyle,
  createBadgeStyle,
  createSurfaceStyle,
} from '../../../helpers'
import type { CrowdFlowProps } from '../../core'

// Mock data
const MOCK_FLOW_VECTORS = [
  { x: 20, y: 30, directionDeg: 45, magnitude: 0.8, speed: 'normal' as const },
  { x: 40, y: 25, directionDeg: 90, magnitude: 0.9, speed: 'normal' as const },
  { x: 60, y: 35, directionDeg: 135, magnitude: 0.4, speed: 'slow' as const },
  { x: 80, y: 40, directionDeg: 180, magnitude: 0.3, speed: 'slow' as const },
  { x: 25, y: 60, directionDeg: 0, magnitude: 0.95, speed: 'fast' as const },
  { x: 45, y: 55, directionDeg: 270, magnitude: 0.85, speed: 'normal' as const },
  { x: 65, y: 65, directionDeg: 315, magnitude: 0.2, speed: 'slow' as const },
  { x: 85, y: 70, directionDeg: 225, magnitude: 0.7, speed: 'normal' as const },
  { x: 30, y: 85, directionDeg: 60, magnitude: 1.0, speed: 'fast' as const },
  { x: 50, y: 80, directionDeg: 120, magnitude: 0.6, speed: 'normal' as const },
  { x: 70, y: 90, directionDeg: 150, magnitude: 0.5, speed: 'normal' as const },
  { x: 15, y: 50, directionDeg: 30, magnitude: 0.75, speed: 'normal' as const },
]

const MOCK_BOTTLENECKS = [
  {
    id: 'bn-1',
    x: 80,
    y: 40,
    severity: 'high' as const,
    description: 'Main entrance congestion - 320 people/min',
  },
  {
    id: 'bn-2',
    x: 65,
    y: 65,
    severity: 'medium' as const,
    description: 'Bar area slow movement - 85 people/min',
  },
  {
    id: 'bn-3',
    x: 45,
    y: 25,
    severity: 'low' as const,
    description: 'Stage left side minor delay',
  },
]

export const CrowdFlowLive = createPreset<CrowdFlowProps>({
  name: 'CrowdFlow.Live',
  render: (ctx: PresetContext<CrowdFlowProps>) => {
    const { primitives, props, tokens, engine } = ctx
    const { Box, Text } = primitives

    const flowVectors = props.vectors || MOCK_FLOW_VECTORS
    const bottlenecks = props.bottlenecks || MOCK_BOTTLENECKS
    const totalCrowd = 2847
    const avgFlowSpeed = 0.72
    const activeBottlenecks = bottlenecks.filter(
      (b) => b.severity === 'high' || b.severity === 'medium'
    ).length

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
            Live Crowd Flow
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[600],
            }}
          >
            Real-time movement analysis and bottleneck detection
          </Text>
        </Box>

        {/* KPI Bar */}
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
              Total Crowd
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {totalCrowd.toLocaleString()}
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
              Avg Flow Speed
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.successScale[600],
              }}
            >
              {(avgFlowSpeed * 100).toFixed(0)}%
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
              Active Bottlenecks
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color:
                  activeBottlenecks > 2
                    ? tokens.colors.errorScale[600]
                    : tokens.colors.warningScale[600],
              }}
            >
              {activeBottlenecks}
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
          {/* Venue Map */}
          <Box>
            <Box
              style={{
                ...createCardStyle(tokens),
                position: 'relative',
                height: '500px',
                backgroundColor: tokens.colors.neutral[50],
              }}
            >
              {/* Flow Arrows */}
              {flowVectors.map((vector: { x: number; y: number; directionDeg: number; magnitude: number; speed: string }, idx: number) => {
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
                          id={`arrowhead-${idx}`}
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
                        markerEnd={`url(#arrowhead-${idx})`}
                      />
                    </svg>
                  </Box>
                )
              })}

              {/* Bottleneck Markers */}
              {bottlenecks.map((bottleneck) => (
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
                      border: `2px solid ${getSeverityColor(bottleneck.severity)}`,
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

          {/* Legend & Bottlenecks */}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
            {/* Speed Legend */}
            <Box style={createCardStyle(tokens)}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[2],
                }}
              >
                Flow Speed
              </Text>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <Box
                    style={{
                      width: '24px',
                      height: '3px',
                      backgroundColor: tokens.colors.successScale[500],
                    }}
                  />
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[700],
                    }}
                  >
                    Fast
                  </Text>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <Box
                    style={{
                      width: '24px',
                      height: '3px',
                      backgroundColor: tokens.colors.primaryScale[500],
                    }}
                  />
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[700],
                    }}
                  >
                    Normal
                  </Text>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <Box
                    style={{
                      width: '24px',
                      height: '3px',
                      backgroundColor: tokens.colors.errorScale[500],
                    }}
                  />
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[700],
                    }}
                  >
                    Slow
                  </Text>
                </Box>
              </Box>
            </Box>

            {/* Severity Legend */}
            <Box style={createCardStyle(tokens)}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[2],
                }}
              >
                Severity
              </Text>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                {['high', 'medium', 'low'].map((sev) => (
                  <Box
                    key={sev}
                    style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}
                  >
                    <Box
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: getSeverityBg(sev),
                        border: `2px solid ${getSeverityColor(sev)}`,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                        textTransform: 'capitalize',
                      }}
                    >
                      {sev}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Active Bottlenecks */}
            <Box style={createCardStyle(tokens)}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[2],
                }}
              >
                Active Issues
              </Text>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                {bottlenecks.map((bottleneck) => (
                  <Box
                    key={bottleneck.id}
                    style={{
                      padding: tokens.spacing[2],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: getSeverityBg(bottleneck.severity),
                      border: `1px solid ${getSeverityColor(bottleneck.severity)}`,
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
            </Box>
          </Box>
        </Box>
      </Box>
    )
  },
})
