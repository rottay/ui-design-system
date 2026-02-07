'use client';

import React, { useState, useEffect } from 'react';
import { createPreset } from '../../../factory';
import type { MaintenancePageProps } from '../../core';

export const ComingSoonPreset = createPreset<MaintenancePageProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const {
    title = "Coming Soon",
    description = "We're working on something amazing. Stay tuned!",
    contactEmail,
    illustration,
    logo,
    countdown,
    className,
    style,
  } = props;

  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!countdown?.target) return;

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const target = new Date(countdown.target).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeRemaining({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [countdown?.target]);

  return (
    <Box
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
        padding: tokens.spacing[8],
        backgroundColor: tokens.colors.neutral[50],
        textAlign: 'center',
        ...style,
      }}
    >
      {logo && (
        <Box style={{ marginBottom: tokens.spacing[8] }}>
          {logo}
        </Box>
      )}

      {illustration || (
        <Box
          style={{
            fontSize: '64px',
            marginBottom: tokens.spacing[8],
            color: tokens.colors.primaryScale[500],
          }}
        >
          🚀
        </Box>
      )}

      <Text

        style={{
          fontWeight: tokens.typography.fontWeight.bold,
          marginBottom: tokens.spacing[4],
          color: tokens.colors.neutral[900],
        }}
      >
        {title}
      </Text>

      <Text
               style={{
          maxWidth: '600px',
          marginBottom: tokens.spacing[8],
          color: tokens.colors.neutral[700],
          lineHeight: tokens.typography.lineHeight.relaxed,
        }}
      >
        {description}
      </Text>

      {countdown && (
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[6],
            marginBottom: tokens.spacing[8],
          }}
        >
          {[
            { label: 'Days', value: timeRemaining.days },
            { label: 'Hours', value: timeRemaining.hours },
            { label: 'Minutes', value: timeRemaining.minutes },
            { label: 'Seconds', value: timeRemaining.seconds },
          ].map((unit) => (
            <Box
              key={unit.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: tokens.spacing[6],
                backgroundColor: tokens.colors.common.white,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                borderRadius: tokens.borderRadius.lg,
                minWidth: '80px',
              }}
            >
              <Text

                style={{
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.primaryScale[600],
                  marginBottom: tokens.spacing[1],
                }}
              >
                {String(unit.value).padStart(2, '0')}
              </Text>
              <Text
                               style={{
                  color: tokens.colors.neutral[600],
                  textTransform: 'uppercase',
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                {unit.label}
              </Text>
            </Box>
          ))}
        </Box>
      )}

      {contactEmail && (
        <Text
                   style={{
            color: tokens.colors.neutral[600],
          }}
        >
          Questions? Reach out at{' '}
          <a
            href={`mailto:${contactEmail}`}
            style={{
              color: tokens.colors.primaryScale[600],
              textDecoration: 'none',
              fontWeight: tokens.typography.fontWeight.medium,
            }}
          >
            {contactEmail}
          </a>
        </Text>
      )}
    </Box>
  );
});

ComingSoonPreset.displayName = 'MaintenancePageComingSoonPreset';
