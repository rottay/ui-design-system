'use client';

/**
 * EvWeatherMonitor - Forecast Preset
 * Hourly forecast cards: time, temp, weather emoji, wind, rain %.
 * Weather condition emojis (clear=sun, cloudy=cloud, rain=rain, storm=lightning, wind=wind).
 * Impact indicators per hour (green=no impact, yellow=possible impact, red=high impact).
 * Current conditions card prominently displayed.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createStatusDotStyle,
} from '../../../helpers';
import type { WeatherMonitorProps, WeatherForecast } from '../../core';

const MOCK_FORECASTS: WeatherForecast[] = [
  { hour: '18:00', temp: 72, condition: 'clear', windSpeed: 5, rainProbability: 0 },
  { hour: '19:00', temp: 70, condition: 'clear', windSpeed: 6, rainProbability: 5 },
  { hour: '20:00', temp: 68, condition: 'cloudy', windSpeed: 8, rainProbability: 10 },
  { hour: '21:00', temp: 66, condition: 'cloudy', windSpeed: 10, rainProbability: 20 },
  { hour: '22:00', temp: 64, condition: 'light-rain', windSpeed: 12, rainProbability: 40 },
  { hour: '23:00', temp: 62, condition: 'light-rain', windSpeed: 14, rainProbability: 50 },
  { hour: '00:00', temp: 60, condition: 'heavy-rain', windSpeed: 18, rainProbability: 80 },
  { hour: '01:00', temp: 59, condition: 'storm', windSpeed: 22, rainProbability: 90 },
];

const WEATHER_EMOJIS: Record<string, string> = {
  clear: '☀️',
  cloudy: '☁️',
  'light-rain': '🌦️',
  'heavy-rain': '🌧️',
  storm: '⛈️',
  wind: '💨',
};

const getImpactLevel = (forecast: WeatherForecast): 'none' | 'possible' | 'high' => {
  if (forecast.condition === 'storm' || forecast.windSpeed > 20 || forecast.rainProbability > 70) {
    return 'high';
  }
  if (
    forecast.condition === 'heavy-rain' ||
    forecast.windSpeed > 15 ||
    forecast.rainProbability > 40
  ) {
    return 'possible';
  }
  return 'none';
};

const IMPACT_CONFIG: Record<string, { color: 'success' | 'warning' | 'error'; label: string; bgColor: string }> = {
  none: { color: 'success', label: 'No Impact', bgColor: '' },
  possible: { color: 'warning', label: 'Possible Impact', bgColor: '' },
  high: { color: 'error', label: 'High Impact', bgColor: '' },
};

export const ForecastEvWeatherMonitor = createPreset<WeatherMonitorProps>({
  name: 'EvWeatherMonitor.Forecast',
  render: ({ primitives, props, tokens }: PresetContext<WeatherMonitorProps>) => {
    const { Box, Text } = primitives;
    const { forecasts, className, style } = props;

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const data = forecasts?.length ? forecasts : MOCK_FORECASTS;

    const [hoveredHour, setHoveredHour] = useState<string | null>(null);

    const currentConditions = data[0];

    const impactSummary = useMemo(() => {
      const high = data.filter((f) => getImpactLevel(f) === 'high').length;
      const possible = data.filter((f) => getImpactLevel(f) === 'possible').length;
      const none = data.filter((f) => getImpactLevel(f) === 'none').length;
      return { high, possible, none };
    }, [data]);

    return (
      <Box
        className={className}
        style={{
          height: '100%',
          overflow: 'auto',
          backgroundColor: tokens.colors.neutral[50],
          padding: tokens.spacing[5],
          ...style,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: tokens.spacing[4],
          }}
        >
          <div>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                display: 'block',
              }}
            >
              {'🌦️'} Weather Monitor
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {data.length} hour forecast {'·'} Updated 5 minutes ago
            </Text>
          </div>
        </div>

        {/* Impact Summary */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[4],
          }}
        >
          {[
            { label: 'No Impact', value: impactSummary.none, color: tokens.colors.successScale[500] },
            { label: 'Possible Impact', value: impactSummary.possible, color: tokens.colors.warningScale[500] },
            { label: 'High Impact', value: impactSummary.high, color: tokens.colors.errorScale[500] },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                ...cardBase,
                padding: tokens.spacing[3],
                textAlign: 'center' as const,
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: stat.color,
                  display: 'block',
                }}
              >
                {stat.value}
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                {stat.label}
              </Text>
            </div>
          ))}
        </div>

        {/* Current Conditions (Large Card) */}
        <div
          style={{
            ...cardBase,
            padding: tokens.spacing[6],
            marginBottom: tokens.spacing[4],
            backgroundColor: tokens.colors.primaryScale[50],
            border: `2px solid ${tokens.colors.primaryScale[300]}`,
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.primaryScale[600],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
              display: 'block',
              marginBottom: tokens.spacing[2],
            }}
          >
            Current Conditions
          </Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
            <div style={{ fontSize: '4rem' }}>{WEATHER_EMOJIS[currentConditions.condition]}</div>
            <div>
              <Text
                style={{
                  fontSize: '3rem',
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  display: 'block',
                }}
              >
                {currentConditions.temp}°F
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  color: tokens.colors.neutral[700],
                  textTransform: 'capitalize' as const,
                }}
              >
                {currentConditions.condition.replace('-', ' ')}
              </Text>
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: tokens.spacing[4],
              marginTop: tokens.spacing[4],
            }}
          >
            <div>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  display: 'block',
                }}
              >
                Wind Speed
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                }}
              >
                {currentConditions.windSpeed} mph
              </Text>
            </div>
            <div>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  display: 'block',
                }}
              >
                Rain Probability
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                }}
              >
                {currentConditions.rainProbability}%
              </Text>
            </div>
          </div>
        </div>

        {/* Hourly Forecast Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: tokens.spacing[3],
          }}
        >
          {data.map((forecast) => {
            const isHovered = hoveredHour === forecast.hour;
            const impact = getImpactLevel(forecast);
            const impactConfig = IMPACT_CONFIG[impact];

            return (
              <div
                key={forecast.hour}
                onMouseEnter={() => setHoveredHour(forecast.hour)}
                onMouseLeave={() => setHoveredHour(null)}
                style={{
                  ...cardBase,
                  padding: tokens.spacing[3],
                  textAlign: 'center' as const,
                  transform: isHovered ? 'translateY(-4px)' : 'none',
                  boxShadow: isHovered ? tokens.shadows.md : tokens.shadows.sm,
                  transition: `all ${tokens.motion.hover}`,
                  backgroundColor:
                    impact === 'high'
                      ? tokens.colors.errorScale[50]
                      : impact === 'possible'
                      ? tokens.colors.warningScale[50]
                      : tokens.colors.common.white,
                  borderLeft:
                    impact === 'high'
                      ? `4px solid ${tokens.colors.errorScale[500]}`
                      : impact === 'possible'
                      ? `4px solid ${tokens.colors.warningScale[500]}`
                      : `4px solid ${tokens.colors.successScale[500]}`,
                }}
              >
                {/* Time */}
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                    display: 'block',
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  {forecast.hour}
                </Text>

                {/* Weather Emoji */}
                <div
                  style={{
                    fontSize: '2.5rem',
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  {WEATHER_EMOJIS[forecast.condition]}
                </div>

                {/* Temperature */}
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xl,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                    display: 'block',
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  {forecast.temp}°F
                </Text>

                {/* Condition */}
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[600],
                    display: 'block',
                    marginBottom: tokens.spacing[2],
                    textTransform: 'capitalize' as const,
                  }}
                >
                  {forecast.condition.replace('-', ' ')}
                </Text>

                {/* Wind & Rain */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  <div>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      {'💨'} {forecast.windSpeed}mph
                    </Text>
                  </div>
                  <div>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      {'💧'} {forecast.rainProbability}%
                    </Text>
                  </div>
                </div>

                {/* Impact Badge */}
                {impact !== 'none' && (
                  <div>
                    <span style={createBadgeStyle(tokens, impactConfig.color)}>
                      {impactConfig.label}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Box>
    );
  },
});
