'use client'

import { createPreset, type PresetContext } from '../../../factory'
import { createCardStyle, createSurfaceStyle } from '../../../helpers'
import type { HeatmapTimelineProps } from '../../core'
import { useState } from 'react'

// Mock data
const generateHeatmapData = (pattern: 'entrance' | 'stage' | 'exit' | 'distributed') => {
  const cells = []
  const gridWidth = 20
  const gridHeight = 15

  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      let intensity = 0

      switch (pattern) {
        case 'entrance':
          // High density at top
          const entranceDist = Math.abs(y - 2)
          intensity = Math.max(0, 1 - entranceDist / 8)
          break

        case 'stage':
          // High density at center
          const stageDist = Math.sqrt(Math.pow(x - 10, 2) + Math.pow(y - 7, 2))
          intensity = Math.max(0, 1 - stageDist / 10)
          break

        case 'exit':
          // High density at bottom
          const exitDist = Math.abs(y - 13)
          intensity = Math.max(0, 1 - exitDist / 8)
          break

        case 'distributed':
          // Even distribution with slight center bias
          const centerDist = Math.sqrt(Math.pow(x - 10, 2) + Math.pow(y - 7.5, 2))
          intensity = Math.max(0, 0.6 - centerDist / 15)
          break
      }

      // Add some random variation
      intensity = Math.max(0, Math.min(1, intensity + (Math.random() - 0.5) * 0.3))

      if (intensity > 0.15) {
        cells.push({ x, y, intensity })
      }
    }
  }
  return cells
}

const MOCK_FRAMES = [
  {
    timestamp: new Date('2026-02-09T21:00:00'),
    data: generateHeatmapData('entrance'),
    annotation: 'Event start - crowd concentrated at entrance',
  },
  {
    timestamp: new Date('2026-02-09T22:00:00'),
    data: generateHeatmapData('stage'),
    annotation: 'Peak time - crowd focused on main stage',
  },
  {
    timestamp: new Date('2026-02-09T23:00:00'),
    data: generateHeatmapData('distributed'),
    annotation: 'Mid-event - well distributed crowd',
  },
  {
    timestamp: new Date('2026-02-10T00:00:00'),
    data: generateHeatmapData('stage'),
    annotation: 'Late night - energy at main stage',
  },
  {
    timestamp: new Date('2026-02-10T01:00:00'),
    data: generateHeatmapData('distributed'),
    annotation: 'Winding down - crowd dispersing',
  },
  {
    timestamp: new Date('2026-02-10T02:00:00'),
    data: generateHeatmapData('exit'),
    annotation: 'Event end - exit area busy',
  },
]

export const HeatmapTimelineSnapshot = createPreset<HeatmapTimelineProps>({
  name: 'HeatmapTimeline.Snapshot',
  render: (ctx: PresetContext<HeatmapTimelineProps>) => {
    const { primitives, props, tokens, engine } = ctx
    const { Box, Text } = primitives

    const frames = props.frames || MOCK_FRAMES

    const [leftFrameIndex, setLeftFrameIndex] = useState(0)
    const [rightFrameIndex, setRightFrameIndex] = useState(2)
    const [showDifference, setShowDifference] = useState(false)

    const leftFrame = frames[leftFrameIndex]
    const rightFrame = frames[rightFrameIndex]

    const getIntensityColor = (intensity: number) => {
      if (intensity < 0.2) return tokens.colors.primaryScale[200]
      if (intensity < 0.4) return tokens.colors.primaryScale[400]
      if (intensity < 0.6) return tokens.colors.warningScale[400]
      if (intensity < 0.8) return tokens.colors.warningScale[600]
      return tokens.colors.errorScale[500]
    }

    const getDifferenceColor = (diff: number) => {
      const absDiff = Math.abs(diff)
      if (absDiff < 0.1) return tokens.colors.neutral[300]
      if (diff > 0) {
        // Increased density
        if (absDiff < 0.3) return tokens.colors.successScale[300]
        if (absDiff < 0.6) return tokens.colors.successScale[500]
        return tokens.colors.successScale[700]
      } else {
        // Decreased density
        if (absDiff < 0.3) return tokens.colors.errorScale[300]
        if (absDiff < 0.6) return tokens.colors.errorScale[500]
        return tokens.colors.errorScale[700]
      }
    }

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    const gridWidth = 20
    const gridHeight = 15
    const cellSize = 25

    // Calculate differences
    const leftMap = new Map(leftFrame.data.map((cell) => [`${cell.x}-${cell.y}`, cell.intensity]))
    const rightMap = new Map(rightFrame.data.map((cell) => [`${cell.x}-${cell.y}`, cell.intensity]))

    const differenceCells: { x: number; y: number; diff: number }[] = []
    for (let x = 0; x < gridWidth; x++) {
      for (let y = 0; y < gridHeight; y++) {
        const key = `${x}-${y}`
        const leftIntensity = leftMap.get(key) || 0
        const rightIntensity = rightMap.get(key) || 0
        const diff = rightIntensity - leftIntensity

        if (Math.abs(diff) > 0.1) {
          differenceCells.push({ x, y, diff })
        }
      }
    }

    // Calculate key metrics
    const leftTotal = leftFrame.data.reduce((sum, cell) => sum + cell.intensity, 0)
    const rightTotal = rightFrame.data.reduce((sum, cell) => sum + cell.intensity, 0)
    const totalChange = ((rightTotal - leftTotal) / leftTotal) * 100

    const leftPeak = Math.max(...leftFrame.data.map((c) => c.intensity))
    const rightPeak = Math.max(...rightFrame.data.map((c) => c.intensity))
    const peakChange = ((rightPeak - leftPeak) / leftPeak) * 100

    const renderHeatmap = (frameData: typeof leftFrame.data, title: string) => (
      <Box>
        <Box
          style={{
            position: 'relative',
            width: `${gridWidth * cellSize}px`,
            height: `${gridHeight * cellSize}px`,
            margin: '0 auto',
          }}
        >
          {/* Grid Background */}
          <svg
            width={gridWidth * cellSize}
            height={gridHeight * cellSize}
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            {Array.from({ length: gridWidth }).map((_, x) =>
              Array.from({ length: gridHeight }).map((_, y) => (
                <rect
                  key={`${x}-${y}`}
                  x={x * cellSize}
                  y={y * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill={tokens.colors.neutral[100]}
                  stroke={tokens.colors.neutral[200]}
                  strokeWidth="1"
                />
              ))
            )}
          </svg>

          {/* Heatmap Cells */}
          <svg
            width={gridWidth * cellSize}
            height={gridHeight * cellSize}
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            {frameData.map((cell, idx) => (
              <rect
                key={idx}
                x={cell.x * cellSize}
                y={cell.y * cellSize}
                width={cellSize}
                height={cellSize}
                fill={getIntensityColor(cell.intensity)}
                opacity={cell.intensity}
              />
            ))}
          </svg>
        </Box>
      </Box>
    )

    const renderDifference = () => (
      <Box>
        <Box
          style={{
            position: 'relative',
            width: `${gridWidth * cellSize}px`,
            height: `${gridHeight * cellSize}px`,
            margin: '0 auto',
          }}
        >
          {/* Grid Background */}
          <svg
            width={gridWidth * cellSize}
            height={gridHeight * cellSize}
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            {Array.from({ length: gridWidth }).map((_, x) =>
              Array.from({ length: gridHeight }).map((_, y) => (
                <rect
                  key={`${x}-${y}`}
                  x={x * cellSize}
                  y={y * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill={tokens.colors.neutral[100]}
                  stroke={tokens.colors.neutral[200]}
                  strokeWidth="1"
                />
              ))
            )}
          </svg>

          {/* Difference Cells */}
          <svg
            width={gridWidth * cellSize}
            height={gridHeight * cellSize}
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            {differenceCells.map((cell, idx) => (
              <rect
                key={idx}
                x={cell.x * cellSize}
                y={cell.y * cellSize}
                width={cellSize}
                height={cellSize}
                fill={getDifferenceColor(cell.diff)}
                opacity={Math.min(Math.abs(cell.diff) + 0.3, 1)}
              />
            ))}
          </svg>
        </Box>
      </Box>
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
            Heatmap Snapshot Comparison
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[600],
            }}
          >
            Compare crowd density patterns between two time periods
          </Text>
        </Box>

        {/* Controls */}
        <Box
          style={{
            padding: tokens.spacing[4],
            borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.neutral[50],
          }}
        >
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              gap: tokens.spacing[4],
              alignItems: 'center',
            }}
          >
            {/* Left Time Selector */}
            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[2],
                }}
              >
                Compare From
              </Text>
              <Box
                style={{
                  padding: tokens.spacing[2],
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.common.white,
                  border: `2px solid ${tokens.colors.primaryScale[300]}`,
                }}
              >
                <select
                  value={leftFrameIndex}
                  onChange={(e) => setLeftFrameIndex(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: tokens.spacing[2],
                    fontSize: tokens.typography.fontSize.sm,
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: tokens.colors.neutral[900],
                    cursor: 'pointer',
                  }}
                >
                  {frames.map((frame, idx) => (
                    <option key={idx} value={idx}>
                      {formatTime(frame.timestamp)}
                    </option>
                  ))}
                </select>
              </Box>
            </Box>

            {/* Difference Toggle */}
            <Box
              onClick={() => setShowDifference(!showDifference)}
              style={{
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.md,
                backgroundColor: showDifference
                  ? tokens.colors.primaryScale[500]
                  : tokens.colors.common.white,
                border: `2px solid ${tokens.colors.primaryScale[300]}`,
                cursor: 'pointer',
                textAlign: 'center',
                minWidth: '120px',
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: showDifference
                    ? tokens.colors.common.white
                    : tokens.colors.primaryScale[600],
                }}
              >
                {showDifference ? 'Show Split' : 'Show Diff'}
              </Text>
            </Box>

            {/* Right Time Selector */}
            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[2],
                }}
              >
                Compare To
              </Text>
              <Box
                style={{
                  padding: tokens.spacing[2],
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.common.white,
                  border: `2px solid ${tokens.colors.primaryScale[300]}`,
                }}
              >
                <select
                  value={rightFrameIndex}
                  onChange={(e) => setRightFrameIndex(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: tokens.spacing[2],
                    fontSize: tokens.typography.fontSize.sm,
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: tokens.colors.neutral[900],
                    cursor: 'pointer',
                  }}
                >
                  {frames.map((frame, idx) => (
                    <option key={idx} value={idx}>
                      {formatTime(frame.timestamp)}
                    </option>
                  ))}
                </select>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Box style={{ padding: tokens.spacing[4] }}>
          {showDifference ? (
            // Difference View
            <Box>
              <Box style={createCardStyle(tokens)}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                    marginBottom: tokens.spacing[3],
                    textAlign: 'center',
                  }}
                >
                  Density Change Map
                </Text>
                {renderDifference()}

                {/* Difference Legend */}
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: tokens.spacing[4],
                    marginTop: tokens.spacing[3],
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.neutral[50],
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <Box
                      style={{
                        width: '30px',
                        height: '20px',
                        borderRadius: tokens.borderRadius.sm,
                        backgroundColor: tokens.colors.errorScale[500],
                      }}
                    />
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                      }}
                    >
                      Large Decrease
                    </Text>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <Box
                      style={{
                        width: '30px',
                        height: '20px',
                        borderRadius: tokens.borderRadius.sm,
                        backgroundColor: tokens.colors.neutral[300],
                      }}
                    />
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                      }}
                    >
                      No Change
                    </Text>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <Box
                      style={{
                        width: '30px',
                        height: '20px',
                        borderRadius: tokens.borderRadius.sm,
                        backgroundColor: tokens.colors.successScale[500],
                      }}
                    />
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                      }}
                    >
                      Large Increase
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Box>
          ) : (
            // Side-by-Side View
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: tokens.spacing[4],
              }}
            >
              {/* Left Snapshot */}
              <Box style={createCardStyle(tokens)}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                    marginBottom: tokens.spacing[1],
                    textAlign: 'center',
                  }}
                >
                  {formatTime(leftFrame.timestamp)}
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[600],
                    marginBottom: tokens.spacing[3],
                    textAlign: 'center',
                    fontStyle: 'italic',
                  }}
                >
                  {leftFrame.annotation}
                </Text>
                {renderHeatmap(leftFrame.data, 'Left')}
              </Box>

              {/* Right Snapshot */}
              <Box style={createCardStyle(tokens)}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                    marginBottom: tokens.spacing[1],
                    textAlign: 'center',
                  }}
                >
                  {formatTime(rightFrame.timestamp)}
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[600],
                    marginBottom: tokens.spacing[3],
                    textAlign: 'center',
                    fontStyle: 'italic',
                  }}
                >
                  {rightFrame.annotation}
                </Text>
                {renderHeatmap(rightFrame.data, 'Right')}
              </Box>
            </Box>
          )}

          {/* Comparison Metrics */}
          <Box
            style={{
              ...createCardStyle(tokens),
              marginTop: tokens.spacing[4],
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                marginBottom: tokens.spacing[3],
              }}
            >
              Comparison Metrics
            </Text>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: tokens.spacing[3],
              }}
            >
              <Box
                style={{
                  padding: tokens.spacing[3],
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.neutral[50],
                  textAlign: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[600],
                    marginBottom: tokens.spacing[1],
                  }}
                >
                  Total Density Change
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xl,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color:
                      totalChange > 0
                        ? tokens.colors.successScale[600]
                        : totalChange < 0
                        ? tokens.colors.errorScale[600]
                        : tokens.colors.neutral[600],
                  }}
                >
                  {totalChange > 0 ? '+' : ''}
                  {totalChange.toFixed(1)}%
                </Text>
              </Box>

              <Box
                style={{
                  padding: tokens.spacing[3],
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.neutral[50],
                  textAlign: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[600],
                    marginBottom: tokens.spacing[1],
                  }}
                >
                  Peak Density Change
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xl,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color:
                      peakChange > 0
                        ? tokens.colors.successScale[600]
                        : peakChange < 0
                        ? tokens.colors.errorScale[600]
                        : tokens.colors.neutral[600],
                  }}
                >
                  {peakChange > 0 ? '+' : ''}
                  {peakChange.toFixed(1)}%
                </Text>
              </Box>

              <Box
                style={{
                  padding: tokens.spacing[3],
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.neutral[50],
                  textAlign: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[600],
                    marginBottom: tokens.spacing[1],
                  }}
                >
                  Areas Changed
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xl,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                  }}
                >
                  {differenceCells.length}
                </Text>
              </Box>

              <Box
                style={{
                  padding: tokens.spacing[3],
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.neutral[50],
                  textAlign: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[600],
                    marginBottom: tokens.spacing[1],
                  }}
                >
                  Time Difference
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xl,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                  }}
                >
                  {Math.round(
                    (rightFrame.timestamp.getTime() - leftFrame.timestamp.getTime()) / 60000
                  )}{' '}
                  min
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    )
  },
})
