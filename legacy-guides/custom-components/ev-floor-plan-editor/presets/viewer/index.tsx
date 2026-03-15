'use client'

import React from 'react'
import { createPreset, type PresetContext } from '../../../factory'
import {
  createCardStyle,
  createFilterPillStyle,
  createSurfaceStyle,
} from '../../../helpers'
import type { EvFloorPlanEditorProps, FloorElement } from '../../core'

const MOCK_PLAN = {
  id: 'plan-001',
  name: 'Main Event Floor',
  width: 800,
  height: 600,
  gridSize: 40,
  elements: [
    {
      id: 'elem-1',
      type: 'round-table' as const,
      x: 100,
      y: 100,
      width: 80,
      height: 80,
      label: 'Table 1',
      capacity: 8,
      occupancy: 8,
      zone: 'VIP',
      rotation: 0,
      revenue: 1200,
    },
    {
      id: 'elem-2',
      type: 'round-table' as const,
      x: 220,
      y: 100,
      width: 80,
      height: 80,
      label: 'Table 2',
      capacity: 8,
      occupancy: 6,
      zone: 'VIP',
      rotation: 0,
      revenue: 900,
    },
    {
      id: 'elem-3',
      type: 'rect-table' as const,
      x: 100,
      y: 220,
      width: 120,
      height: 60,
      label: 'Table 3',
      capacity: 6,
      occupancy: 2,
      zone: 'General',
      rotation: 0,
      revenue: 300,
    },
    {
      id: 'elem-4',
      type: 'booth' as const,
      x: 400,
      y: 100,
      width: 100,
      height: 80,
      label: 'Booth A',
      capacity: 4,
      occupancy: 4,
      zone: 'VIP',
      rotation: 0,
      revenue: 800,
    },
    {
      id: 'elem-5',
      type: 'booth' as const,
      x: 540,
      y: 100,
      width: 100,
      height: 80,
      label: 'Booth B',
      capacity: 4,
      occupancy: 3,
      zone: 'VIP',
      rotation: 0,
      revenue: 600,
    },
    {
      id: 'elem-6',
      type: 'bar' as const,
      x: 100,
      y: 450,
      width: 200,
      height: 60,
      label: 'Bar',
      capacity: 12,
      occupancy: 5,
      zone: 'Service',
      rotation: 0,
      revenue: 750,
    },
    {
      id: 'elem-7',
      type: 'stage' as const,
      x: 500,
      y: 400,
      width: 180,
      height: 120,
      label: 'Main Stage',
      capacity: 0,
      occupancy: 0,
      zone: 'Performance',
      rotation: 0,
      revenue: 0,
    },
    {
      id: 'elem-8',
      type: 'entrance' as const,
      x: 360,
      y: 20,
      width: 80,
      height: 40,
      label: 'Main Entrance',
      capacity: 0,
      occupancy: 0,
      zone: 'Entry',
      rotation: 0,
      revenue: 0,
    },
  ],
}

const ZONES = ['All', 'VIP', 'General', 'Service', 'Performance', 'Entry']

export const ViewerEvFloorPlanEditor = createPreset<EvFloorPlanEditorProps>({
  name: 'EvFloorPlanEditor.Viewer',
  render: (ctx: PresetContext<EvFloorPlanEditorProps>) => {
    const { primitives, props, tokens, engine } = ctx
    const { Box, Text } = primitives

    const plan = props.floorPlan || MOCK_PLAN
    const selectedZone = 'All'

    const filteredElements =
      selectedZone === 'All'
        ? plan.elements
        : plan.elements.filter((e: FloorElement) => e.zone === selectedZone)

    const totalCapacity = plan.elements.reduce(
      (sum: number, e: FloorElement) => sum + (e.capacity || 0),
      0
    )
    const totalOccupied = plan.elements.reduce(
      (sum: number, e: FloorElement) => sum + (e.occupancy || 0),
      0
    )
    const totalAvailable = totalCapacity - totalOccupied
    const totalRevenue = plan.elements.reduce(
      (sum: number, e: FloorElement) => sum + (e.revenue || 0),
      0
    )

    const getOccupancyLevel = (occupancy: number, capacity: number) => {
      if (capacity === 0) return 'none'
      const percentage = (occupancy / capacity) * 100
      if (percentage >= 80) return 'high'
      if (percentage >= 50) return 'medium'
      return 'low'
    }

    const getOccupancyColor = (level: string) => {
      switch (level) {
        case 'high':
          return {
            bg: tokens.colors.errorScale[100],
            border: tokens.colors.errorScale[400],
          }
        case 'medium':
          return {
            bg: tokens.colors.warningScale[100],
            border: tokens.colors.warningScale[400],
          }
        case 'low':
          return {
            bg: tokens.colors.successScale[100],
            border: tokens.colors.successScale[400],
          }
        default:
          return {
            bg: tokens.colors.neutral[100],
            border: tokens.colors.neutral[300],
          }
      }
    }

    const containerStyle = {
      ...createSurfaceStyle(tokens),
      display: 'flex' as const,
      flexDirection: 'column' as const,
      height: '100%',
      backgroundColor: tokens.colors.neutral[50],
    }

    const headerStyle = {
      ...createSurfaceStyle(tokens),
      padding: tokens.spacing[4],
      backgroundColor: tokens.colors.common.white,
      borderBottomWidth: tokens.surface.borderWidth,
      borderBottomStyle: tokens.surface.borderStyle as React.CSSProperties['borderBottomStyle'],
      borderBottomColor: tokens.colors.neutral[200],
    }

    const statsStyle = {
      display: 'grid' as const,
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: tokens.spacing[4],
      marginTop: tokens.spacing[4],
    }

    const statCardStyle = {
      ...createCardStyle(tokens),
      textAlign: 'center' as const,
    }

    const filterBarStyle = {
      ...createSurfaceStyle(tokens),
      display: 'flex' as const,
      alignItems: 'center' as const,
      gap: tokens.spacing[2],
      padding: tokens.spacing[3],
      backgroundColor: tokens.colors.common.white,
      borderBottomWidth: tokens.surface.borderWidth,
      borderBottomStyle: tokens.surface.borderStyle as React.CSSProperties['borderBottomStyle'],
      borderBottomColor: tokens.colors.neutral[200],
    }

    const contentStyle = {
      display: 'flex' as const,
      flex: 1,
      overflow: 'hidden' as const,
    }

    const canvasContainerStyle = {
      flex: 1,
      display: 'flex' as const,
      flexDirection: 'column' as const,
      padding: tokens.spacing[4],
      overflow: 'auto' as const,
    }

    const canvasStyle = {
      ...createSurfaceStyle(tokens),
      position: 'relative' as const,
      width: `${plan.width}px`,
      height: `${plan.height}px`,
      backgroundColor: tokens.colors.common.white,
      borderWidth: tokens.surface.borderWidth,
      borderStyle: tokens.surface.borderStyle,
      borderColor: tokens.colors.neutral[200],
      borderRadius: tokens.borderRadius.md,
    }

    const legendStyle = {
      ...createCardStyle(tokens),
      position: 'absolute' as const,
      top: tokens.spacing[4],
      right: tokens.spacing[4],
      minWidth: '160px',
    }

    const legendItemStyle = {
      display: 'flex' as const,
      alignItems: 'center' as const,
      gap: tokens.spacing[2],
      marginBottom: tokens.spacing[2],
    }

    const legendDotStyle = (color: string) => ({
      width: tokens.spacing[3],
      height: tokens.spacing[3],
      borderRadius: tokens.borderRadius.full,
      backgroundColor: color,
    })

    const getElementStyle = (element: FloorElement) => {
      const level = getOccupancyLevel(
        element.occupancy || 0,
        element.capacity || 0
      )
      const colors = getOccupancyColor(level)

      return {
        position: 'absolute' as const,
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        borderWidth: tokens.surface.borderWidth,
        borderStyle: tokens.surface.borderStyle,
        borderColor: colors.border,
        borderRadius:
          element.type === 'round-table'
            ? tokens.borderRadius.full
            : element.type === 'booth'
              ? tokens.borderRadius.lg
              : tokens.borderRadius.md,
        backgroundColor: colors.bg,
        cursor: 'pointer' as const,
        display: 'flex' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        transition: 'all 0.2s',
        transform: `rotate(${element.rotation}deg)`,
      }
    }

    const elementLabelStyle = {
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.medium,
      color: tokens.colors.neutral[700],
      textAlign: 'center' as const,
      pointerEvents: 'none' as const,
    }

    return (
      <Box style={containerStyle}>
        <Box style={headerStyle}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
            }}
          >
            {plan.name} - Live View
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[600],
              marginTop: tokens.spacing[1],
            }}
          >
            Real-time occupancy monitoring
          </Text>

          <Box style={statsStyle}>
            <Box style={statCardStyle}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[600],
                  textTransform: 'uppercase' as const,
                }}
              >
                Total Capacity
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  marginTop: tokens.spacing[1],
                }}
              >
                {totalCapacity}
              </Text>
            </Box>

            <Box style={statCardStyle}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[600],
                  textTransform: 'uppercase' as const,
                }}
              >
                Occupied
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.errorScale[600],
                  marginTop: tokens.spacing[1],
                }}
              >
                {totalOccupied}
              </Text>
            </Box>

            <Box style={statCardStyle}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[600],
                  textTransform: 'uppercase' as const,
                }}
              >
                Available
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.successScale[600],
                  marginTop: tokens.spacing[1],
                }}
              >
                {totalAvailable}
              </Text>
            </Box>

            <Box style={statCardStyle}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[600],
                  textTransform: 'uppercase' as const,
                }}
              >
                Revenue
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.primaryScale[600],
                  marginTop: tokens.spacing[1],
                }}
              >
                ${totalRevenue.toLocaleString()}
              </Text>
            </Box>
          </Box>
        </Box>

        <Box style={filterBarStyle}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
              marginRight: tokens.spacing[2],
            }}
          >
            Filter by Zone:
          </Text>
          {ZONES.map((zone: string) => {
            const isActive = zone === selectedZone
            const pillStyle = createFilterPillStyle(tokens, { active: isActive })
            return (
              <button
                key={zone}
                style={pillStyle}
                onClick={() => props.onElementSelect?.(zone)}
              >
                {zone}
              </button>
            )
          })}
        </Box>

        <Box style={contentStyle}>
          <Box style={canvasContainerStyle}>
            <Box style={canvasStyle}>
              <Box style={legendStyle}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  Occupancy Levels
                </Text>
                <Box style={legendItemStyle}>
                  <Box style={legendDotStyle(tokens.colors.successScale[400])} />
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[700],
                    }}
                  >
                    Low (0-49%)
                  </Text>
                </Box>
                <Box style={legendItemStyle}>
                  <Box style={legendDotStyle(tokens.colors.warningScale[400])} />
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[700],
                    }}
                  >
                    Medium (50-79%)
                  </Text>
                </Box>
                <Box style={legendItemStyle}>
                  <Box style={legendDotStyle(tokens.colors.errorScale[400])} />
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[700],
                    }}
                  >
                    High (80-100%)
                  </Text>
                </Box>
              </Box>

              {filteredElements.map((element: FloorElement) => {
                const occupancyPercent =
                  element.capacity && element.capacity > 0
                    ? Math.round(
                        ((element.occupancy || 0) / element.capacity) * 100
                      )
                    : 0

                return (
                  <div
                    key={element.id}
                    style={getElementStyle(element)}
                    onClick={() => props.onElementSelect?.(element.id)}
                    title={`${element.label}\nZone: ${element.zone}\nOccupancy: ${element.occupancy || 0}/${element.capacity} (${occupancyPercent}%)\nRevenue: $${element.revenue || 0}`}
                  >
                    <Box
                      style={{
                        display: 'flex',
                        flexDirection: 'column' as const,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={elementLabelStyle}>{element.label}</Text>
                      {element.capacity && element.capacity > 0 && (
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.bold,
                            color: tokens.colors.neutral[900],
                            marginTop: tokens.spacing[1],
                          }}
                        >
                          {element.occupancy || 0}/{element.capacity}
                        </Text>
                      )}
                    </Box>
                  </div>
                )
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    )
  },
})
