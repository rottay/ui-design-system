'use client'

import { createPreset, type PresetContext } from '../../../factory'
import { createCardStyle, createSurfaceStyle } from '../../../helpers'
import type { HeatmapTimelineProps } from '../../core'
import { useState, useEffect } from 'react'

// Mock data
const MOCK_TIMELINE_EVENTS = [
  {
    timestamp: new Date('2026-02-09T21:00:00'),
    label: 'Doors Open',
    type: 'set-start' as const,
  },
  {
    timestamp: new Date('2026-02-09T22:00:00'),
    label: 'DJ Nexus Set Begins',
    type: 'dj-change' as const,
  },
  {
    timestamp: new Date('2026-02-09T23:30:00'),
    label: 'DJ Vortex Takes Over',
    type: 'dj-change' as const,
  },
  {
    timestamp: new Date('2026-02-10T01:00:00'),
    label: 'Main Bar Closes',
    type: 'bar-close' as const,
  },
  {
    timestamp: new Date('2026-02-10T01:30:00'),
    label: 'Rain Started',
    type: 'weather' as const,
  },
  {
    timestamp: new Date('2026-02-10T02:00:00'),
    label: 'Event Ends',
    type: 'set-end' as const,
  },
]

const generateHeatmapData = (time: number, seed: number) => {
  const cells = []
  for (let x = 0; x < 20; x++) {
    for (let y = 0; y < 15; y++) {
      // Create hotspots based on time and position
      const centerDist = Math.sqrt(Math.pow(x - 10, 2) + Math.pow(y - 7.5, 2))
      const baseIntensity = Math.max(0, 1 - centerDist / 12)

      // Add variation based on time
      const timeVariation = Math.sin((time + x * 0.5 + y * 0.3) * seed) * 0.3
      const intensity = Math.max(0, Math.min(1, baseIntensity + timeVariation))

      if (intensity > 0.1) {
        cells.push({ x, y, intensity })
      }
    }
  }
  return cells
}

const MOCK_FRAMES = [
  {
    timestamp: new Date('2026-02-09T21:00:00'),
    data: generateHeatmapData(0, 0.5),
    annotation: 'Initial arrival - entrance area busy',
  },
  {
    timestamp: new Date('2026-02-09T22:00:00'),
    data: generateHeatmapData(1, 0.7),
    annotation: 'Peak crowd at main stage',
  },
  {
    timestamp: new Date('2026-02-09T23:00:00'),
    data: generateHeatmapData(2, 0.9),
    annotation: 'Full capacity - distributed crowd',
  },
  {
    timestamp: new Date('2026-02-10T00:00:00'),
    data: generateHeatmapData(3, 0.85),
    annotation: 'Sustained energy - bar area active',
  },
  {
    timestamp: new Date('2026-02-10T01:00:00'),
    data: generateHeatmapData(4, 0.6),
    annotation: 'Crowd thinning - exit flows begin',
  },
  {
    timestamp: new Date('2026-02-10T02:00:00'),
    data: generateHeatmapData(5, 0.3),
    annotation: 'Event ending - exit area concentration',
  },
]

export const HeatmapTimelinePlayer = createPreset<HeatmapTimelineProps>({
  name: 'HeatmapTimeline.Player',
  render: (ctx: PresetContext<HeatmapTimelineProps>) => {
    const { primitives, props, tokens, engine } = ctx
    const { Box, Text } = primitives

    const frames = props.frames || MOCK_FRAMES
    const timelineEvents = props.events || MOCK_TIMELINE_EVENTS

    const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [playbackSpeed, setPlaybackSpeed] = useState(1)

    const currentFrame = frames[currentFrameIndex]

    useEffect(() => {
      if (!isPlaying) return

      const interval = setInterval(() => {
        setCurrentFrameIndex((prev) => {
          if (prev >= frames.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 1000 / playbackSpeed)

      return () => clearInterval(interval)
    }, [isPlaying, playbackSpeed, frames.length])

    const getIntensityColor = (intensity: number) => {
      if (intensity < 0.2) return tokens.colors.primaryScale[200]
      if (intensity < 0.4) return tokens.colors.primaryScale[400]
      if (intensity < 0.6) return tokens.colors.warningScale[400]
      if (intensity < 0.8) return tokens.colors.warningScale[600]
      return tokens.colors.errorScale[500]
    }

    const getEventColor = (type: string) => {
      switch (type) {
        case 'dj-change':
          return tokens.colors.primaryScale[500]
        case 'bar-close':
          return tokens.colors.warningScale[500]
        case 'set-start':
          return tokens.colors.successScale[500]
        case 'set-end':
          return tokens.colors.errorScale[500]
        case 'weather':
          return tokens.colors.infoScale[500]
        default:
          return tokens.colors.neutral[500]
      }
    }

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    const totalDuration = frames[frames.length - 1].timestamp.getTime() - frames[0].timestamp.getTime()
    const currentProgress =
      ((currentFrame.timestamp.getTime() - frames[0].timestamp.getTime()) / totalDuration) * 100

    // Create 2D grid for heatmap
    const gridWidth = 20
    const gridHeight = 15
    const cellSize = 30

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
            Heatmap Timeline Player
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[600],
            }}
          >
            Replay crowd density patterns over time
          </Text>
        </Box>

        {/* Playback Controls */}
        <Box
          style={{
            padding: tokens.spacing[4],
            borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.neutral[50],
          }}
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
              marginBottom: tokens.spacing[3],
            }}
          >
            {/* Play/Pause */}
            <Box
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.primaryScale[500],
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '80px',
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.common.white,
                }}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </Text>
            </Box>

            {/* Speed Controls */}
            <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
              {[1, 2, 4].map((speed) => (
                <Box
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  style={{
                    padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor:
                      playbackSpeed === speed
                        ? tokens.colors.primaryScale[500]
                        : tokens.colors.common.white,
                    border: `2px solid ${tokens.colors.primaryScale[300]}`,
                    cursor: 'pointer',
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color:
                        playbackSpeed === speed
                          ? tokens.colors.common.white
                          : tokens.colors.primaryScale[600],
                    }}
                  >
                    {speed}x
                  </Text>
                </Box>
              ))}
            </Box>

            {/* Current Time */}
            <Box style={{ marginLeft: 'auto' }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                }}
              >
                {formatTime(currentFrame.timestamp)}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[600],
                }}
              >
                Frame {currentFrameIndex + 1} of {frames.length}
              </Text>
            </Box>
          </Box>

          {/* Timeline Scrubber */}
          <Box style={{ position: 'relative' }}>
            {/* Progress Bar */}
            <Box
              style={{
                height: '40px',
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.common.white,
                border: `1px solid ${tokens.colors.neutral[300]}`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${currentProgress}%`,
                  backgroundColor: tokens.colors.primaryScale[200],
                  transition: 'width 0.3s ease',
                }}
              />

              {/* Timeline Events */}
              {timelineEvents.map((event: { timestamp: Date; label: string; type: string }, idx: number) => {
                const eventTime = event.timestamp.getTime() - frames[0].timestamp.getTime()
                const eventPosition = (eventTime / totalDuration) * 100

                return (
                  <Box
                    key={idx}
                    style={{
                      position: 'absolute',
                      left: `${eventPosition}%`,
                      top: '0',
                      bottom: '0',
                      width: '3px',
                      backgroundColor: getEventColor(event.type),
                      zIndex: 1,
                    }}
                    title={event.label}
                  />
                )
              })}

              {/* Playhead */}
              <Box
                style={{
                  position: 'absolute',
                  left: `${currentProgress}%`,
                  top: '-4px',
                  width: '0',
                  height: '0',
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: `8px solid ${tokens.colors.primaryScale[600]}`,
                  transform: 'translateX(-50%)',
                  zIndex: 2,
                }}
              />
            </Box>

            {/* Timeline Event Labels */}
            <Box
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: tokens.spacing[2],
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[600],
                }}
              >
                {formatTime(frames[0].timestamp)}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[600],
                }}
              >
                {formatTime(frames[frames.length - 1].timestamp)}
              </Text>
            </Box>
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
          {/* Heatmap Grid */}
          <Box>
            <Box style={createCardStyle(tokens)}>
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
                  {currentFrame.data.map((cell, idx) => (
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

              {/* Annotation */}
              {currentFrame.annotation && (
                <Box
                  style={{
                    marginTop: tokens.spacing[3],
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.infoScale[50],
                    border: `1px solid ${tokens.colors.infoScale[200]}`,
                    textAlign: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.infoScale[800],
                      fontStyle: 'italic',
                    }}
                  >
                    {currentFrame.annotation}
                  </Text>
                </Box>
              )}
            </Box>
          </Box>

          {/* Right Panel - Info & Legend */}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
            {/* Intensity Legend */}
            <Box style={createCardStyle(tokens)}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[2],
                }}
              >
                Crowd Density
              </Text>
              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: tokens.spacing[1],
                }}
              >
                {[
                  { label: 'Very High', intensity: 0.9 },
                  { label: 'High', intensity: 0.7 },
                  { label: 'Medium', intensity: 0.5 },
                  { label: 'Low', intensity: 0.3 },
                  { label: 'Very Low', intensity: 0.1 },
                ].map((item) => (
                  <Box
                    key={item.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                    }}
                  >
                    <Box
                      style={{
                        width: '30px',
                        height: '20px',
                        borderRadius: tokens.borderRadius.sm,
                        backgroundColor: getIntensityColor(item.intensity),
                      }}
                    />
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                      }}
                    >
                      {item.label}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Timeline Events */}
            <Box style={createCardStyle(tokens)}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[2],
                }}
              >
                Timeline Events
              </Text>
              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: tokens.spacing[2],
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}
              >
                {timelineEvents.map((event: { timestamp: Date; label: string; type: string }, idx: number) => (
                  <Box
                    key={idx}
                    style={{
                      padding: tokens.spacing[2],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: `${getEventColor(event.type)}15`,
                      borderLeft: `3px solid ${getEventColor(event.type)}`,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[600],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      {formatTime(event.timestamp)}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {event.label}
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
