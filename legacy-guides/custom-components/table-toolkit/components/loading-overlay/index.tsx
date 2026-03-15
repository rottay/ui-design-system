'use client';

import { useEffect } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { TableLoadingOverlayProps } from '../../core';

export const TableLoadingOverlay = createPreset<TableLoadingOverlayProps>({
  name: 'TableToolkit.LoadingOverlay',
  render: ({ primitives, props, tokens }: PresetContext<TableLoadingOverlayProps>) => {
    const { Box } = primitives;
    const {
      visible,
      message = 'Loading',
      icon,
      className,
      style,
    } = props;

    const styleId = 'tt-loading-overlay-styles';
    useEffect(() => {
      if (typeof document === 'undefined') return;
      if (document.getElementById(styleId)) return;
      const s = document.createElement('style');
      s.id = styleId;
      s.textContent = `
        @keyframes tt-pulse { 0%, 100% { opacity: 0.4; transform: scale(0.96); } 50% { opacity: 1; transform: scale(1); } }
        @keyframes tt-dots { 0% { content: ''; } 25% { content: '.'; } 50% { content: '..'; } 75% { content: '...'; } }
      `;
      document.head.appendChild(s);
    }, []);

    if (!visible) return <Box style={{ display: 'none' }} />;

    return (
      <Box
        className={className}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: tokens.spacing[3],
          backgroundColor: `${tokens.colors.common.white}ee`,
          backdropFilter: 'blur(2px)',
          zIndex: 10,
          borderRadius: tokens.borderRadius.lg,
          ...style,
        }}
      >
        {icon && (
          <div style={{
            fontSize: tokens.typography.fontSize['3xl'],
            color: tokens.colors.primary,
            animation: 'tt-pulse 1.8s ease-in-out infinite',
          }}>
            {icon}
          </div>
        )}
        <div style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          fontWeight: tokens.typography.fontWeight.medium,
        }}>
          {message}...
        </div>
      </Box>
    );
  },
});
