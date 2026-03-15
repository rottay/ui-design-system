'use client';

import React, { useState } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
} from '../../../helpers';
import type { EvTableAnalyticsProps, TableMetric } from '../../core';

const MOCK_TABLES: TableMetric[] = [
  {
    tableId: 'T1',
    tableLabel: 'Table 1',
    zone: 'Main Dining',
    revenue: 1245.50,
    ordersCount: 12,
    avgDwellMinutes: 68,
    turnoverRate: 3.2,
    avgSpendPerGuest: 45.20,
    peakHour: '19:00',
    occupancyPercent: 87,
  },
  {
    tableId: 'T2',
    tableLabel: 'Table 2',
    zone: 'Main Dining',
    revenue: 890.25,
    ordersCount: 9,
    avgDwellMinutes: 72,
    turnoverRate: 2.8,
    avgSpendPerGuest: 42.10,
    peakHour: '20:00',
    occupancyPercent: 75,
  },
  {
    tableId: 'T3',
    tableLabel: 'Table 3',
    zone: 'Main Dining',
    revenue: 1580.75,
    ordersCount: 15,
    avgDwellMinutes: 65,
    turnoverRate: 3.5,
    avgSpendPerGuest: 48.30,
    peakHour: '19:30',
    occupancyPercent: 92,
  },
  {
    tableId: 'T4',
    tableLabel: 'Table 4',
    zone: 'Bar Area',
    revenue: 2145.00,
    ordersCount: 22,
    avgDwellMinutes: 45,
    turnoverRate: 4.2,
    avgSpendPerGuest: 52.80,
    peakHour: '21:00',
    occupancyPercent: 95,
  },
  {
    tableId: 'T5',
    tableLabel: 'Table 5',
    zone: 'Bar Area',
    revenue: 1890.50,
    ordersCount: 18,
    avgDwellMinutes: 50,
    turnoverRate: 3.8,
    avgSpendPerGuest: 49.60,
    peakHour: '20:30',
    occupancyPercent: 88,
  },
  {
    tableId: 'T6',
    tableLabel: 'Table 6',
    zone: 'Bar Area',
    revenue: 1120.25,
    ordersCount: 11,
    avgDwellMinutes: 55,
    turnoverRate: 3.1,
    avgSpendPerGuest: 44.50,
    peakHour: '19:00',
    occupancyPercent: 78,
  },
  {
    tableId: 'T7',
    tableLabel: 'Table 7',
    zone: 'Patio',
    revenue: 675.50,
    ordersCount: 7,
    avgDwellMinutes: 85,
    turnoverRate: 2.2,
    avgSpendPerGuest: 38.90,
    peakHour: '18:30',
    occupancyPercent: 62,
  },
  {
    tableId: 'T8',
    tableLabel: 'Table 8',
    zone: 'Patio',
    revenue: 1340.75,
    ordersCount: 13,
    avgDwellMinutes: 78,
    turnoverRate: 2.9,
    avgSpendPerGuest: 46.70,
    peakHour: '19:00',
    occupancyPercent: 82,
  },
  {
    tableId: 'T9',
    tableLabel: 'Table 9',
    zone: 'Patio',
    revenue: 925.00,
    ordersCount: 9,
    avgDwellMinutes: 82,
    turnoverRate: 2.5,
    avgSpendPerGuest: 41.20,
    peakHour: '18:00',
    occupancyPercent: 70,
  },
  {
    tableId: 'T10',
    tableLabel: 'Table 10',
    zone: 'Main Dining',
    revenue: 1755.25,
    ordersCount: 17,
    avgDwellMinutes: 62,
    turnoverRate: 3.7,
    avgSpendPerGuest: 50.10,
    peakHour: '20:00',
    occupancyPercent: 90,
  },
];

export const HeatmapEvTableAnalytics = createPreset<EvTableAnalyticsProps>({
  name: 'EVTableAnalytics.Heatmap',
  render: (ctx: PresetContext<EvTableAnalyticsProps>) => {
    const { primitives, props, tokens } = ctx;
    const { Box, Text } = primitives;

    const tables = props.metrics || MOCK_TABLES;
    const [heatmapMode, setHeatmapMode] = useState<'revenue' | 'occupancy'>('revenue');
    const [hoveredTable, setHoveredTable] = useState<string | null>(null);

    const zones = Array.from(new Set(tables.map((t) => t.zone)));
    const totalRevenue = tables.reduce((sum, t) => sum + t.revenue, 0);
    const avgTurnover = tables.reduce((sum, t) => sum + t.turnoverRate, 0) / tables.length;
    const avgDwell = tables.reduce((sum, t) => sum + t.avgDwellMinutes, 0) / tables.length;
    const bestTable = tables.reduce((best, t) => (t.revenue > best.revenue ? t : best), tables[0]);

    const getMetricValue = (table: TableMetric) => {
      return heatmapMode === 'revenue' ? table.revenue : table.occupancyPercent;
    };

    const maxValue = Math.max(...tables.map(getMetricValue));
    const minValue = Math.min(...tables.map(getMetricValue));

    const getHeatColor = (value: number) => {
      const ratio = (value - minValue) / (maxValue - minValue);
      if (ratio > 0.66) {
        return tokens.colors.successScale[600];
      } else if (ratio > 0.33) {
        return tokens.colors.warningScale[500];
      } else {
        return tokens.colors.errorScale[500];
      }
    };

    const getLegendSteps = () => {
      const step = (maxValue - minValue) / 5;
      return Array.from({ length: 6 }, (_, i) => minValue + step * i);
    };

    return (
      <Box style={{ padding: tokens.spacing[4] }}>
        <Box style={{ marginBottom: tokens.spacing[6] }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[1],
            }}
          >
            Table Performance Heatmap
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
            }}
          >
            Visualize table performance across your floor plan
          </Text>
        </Box>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[6],
          }}
        >
          <Box style={createCardStyle(tokens)}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}
            >
              Total Revenue
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {'$'}{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </Box>

          <Box style={createCardStyle(tokens)}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}
            >
              Avg Turnover Rate
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {avgTurnover.toFixed(1)}x
            </Text>
          </Box>

          <Box style={createCardStyle(tokens)}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}
            >
              Avg Dwell Time
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {Math.round(avgDwell)} min
            </Text>
          </Box>

          <Box style={createCardStyle(tokens)}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}
            >
              Best Performer
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.successScale[600],
              }}
            >
              {bestTable.tableLabel}
            </Text>
          </Box>
        </Box>

        <Box
          style={{
            ...createCardStyle(tokens),
            marginBottom: tokens.spacing[4],
          }}
        >
          <Box
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: tokens.spacing[4],
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
              }}
            >
              Floor Plan Heatmap
            </Text>
            <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
              <Box
                onClick={() => setHeatmapMode('revenue')}
                style={{
                  ...createBadgeStyle(tokens, heatmapMode === 'revenue' ? 'primary' : 'secondary'),
                  cursor: 'pointer',
                }}
              >
                Revenue
              </Box>
              <Box
                onClick={() => setHeatmapMode('occupancy')}
                style={{
                  ...createBadgeStyle(tokens, heatmapMode === 'occupancy' ? 'primary' : 'secondary'),
                  cursor: 'pointer',
                }}
              >
                Occupancy
              </Box>
            </Box>
          </Box>

          {zones.map((zone) => (
            <Box key={zone} style={{ marginBottom: tokens.spacing[4] }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[3],
                }}
              >
                {zone}
              </Text>
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: tokens.spacing[3],
                }}
              >
                {tables
                  .filter((t) => t.zone === zone)
                  .map((table) => {
                    const value = getMetricValue(table);
                    const color = getHeatColor(value);

                    return (
                      <Box
                        key={table.tableId}
                        onMouseEnter={() => setHoveredTable(table.tableId)}
                        onMouseLeave={() => setHoveredTable(null)}
                        style={{
                          position: 'relative',
                          padding: tokens.spacing[4],
                          backgroundColor: color,
                          borderRadius: tokens.borderRadius.md,
                          cursor: 'pointer',
                          transition: `transform ${tokens.transitions?.normal || tokens.motion.hover}`,
                          transform: hoveredTable === table.tableId ? 'scale(1.05)' : 'scale(1)',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.lg,
                            fontWeight: tokens.typography.fontWeight.bold,
                            color: tokens.colors.common.white,
                            textAlign: 'center',
                            marginBottom: tokens.spacing[1],
                          }}
                        >
                          {table.tableLabel}
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.common.white,
                            textAlign: 'center',
                          }}
                        >
                          {heatmapMode === 'revenue'
                            ? `$${value.toFixed(0)}`
                            : `${value}%`}
                        </Text>

                        {hoveredTable === table.tableId && (
                          <Box
                            style={{
                              position: 'absolute',
                              top: '100%',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              marginTop: tokens.spacing[1],
                              padding: tokens.spacing[3],
                              backgroundColor: tokens.colors.common.white,
                              border: `1px solid ${tokens.colors.neutral[200]}`,
                              borderRadius: tokens.borderRadius.md,
                              boxShadow: tokens.shadows.lg,
                              minWidth: '200px',
                              zIndex: 10,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: tokens.colors.neutral[500],
                                marginBottom: tokens.spacing[1],
                              }}
                            >
                              Revenue: {'$'}{table.revenue.toFixed(2)}
                            </Text>
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: tokens.colors.neutral[500],
                                marginBottom: tokens.spacing[1],
                              }}
                            >
                              Orders: {table.ordersCount}
                            </Text>
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: tokens.colors.neutral[500],
                              }}
                            >
                              Turnover: {table.turnoverRate.toFixed(1)}x
                            </Text>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
              </Box>
            </Box>
          ))}

          <Box style={{ marginTop: tokens.spacing[4] }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[900],
                marginBottom: tokens.spacing[2],
              }}
            >
              Legend
            </Text>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              {getLegendSteps().map((step, i) => (
                <Box key={i} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  <Box
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: getHeatColor(step),
                      borderRadius: tokens.borderRadius.sm,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                    }}
                  >
                    {heatmapMode === 'revenue'
                      ? `$${step.toFixed(0)}`
                      : `${step.toFixed(0)}%`}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
