'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { FilterSelectProps } from '../../core';

export const FilterSelect = createPreset<FilterSelectProps>({
  name: 'TableToolkit.FilterSelect',
  render: ({ primitives, props, tokens }: PresetContext<FilterSelectProps>) => {
    const { Box } = primitives;
    const {
      value,
      onChange,
      options,
      placeholder = 'All',
      minWidth = 140,
      chevronIcon,
      checkIcon,
      className,
      style,
    } = props;

    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = useCallback((e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }, []);

    useEffect(() => {
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen, handleClickOutside]);

    useEffect(() => {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false);
      };
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }, []);

    const allOptions = [{ value: '', label: placeholder }, ...options];
    const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder;

    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          position: 'relative',
          display: 'inline-block',
          minWidth,
          ...style,
        }}
      >
        {/* Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
            fontSize: tokens.typography.fontSize.sm,
            color: value ? tokens.colors.neutral[900] : tokens.colors.neutral[500],
            backgroundColor: tokens.colors.common.white,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isOpen ? tokens.colors.primary : tokens.colors.neutral[200]}`,
            borderRadius: tokens.borderRadius.md,
            cursor: 'pointer',
            fontFamily: 'inherit',
            gap: tokens.spacing[2],
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedLabel}</span>
          <span style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[400],
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s ease',
          }}>
            {chevronIcon ?? '\u25BE'}
          </span>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: tokens.spacing[1],
            backgroundColor: tokens.colors.common.white,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            borderRadius: tokens.borderRadius.md,
            boxShadow: tokens.shadows?.md ?? '0 4px 12px rgba(0, 0, 0, 0.1)',
            zIndex: 50,
            maxHeight: 240,
            overflowY: 'auto',
          }}>
            {allOptions.map((option) => {
              const isSelected = option.value === value || (option.value === '' && !value);
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: isSelected ? tokens.colors.primary : tokens.colors.neutral[700],
                    backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                  }}
                >
                  {option.label}
                  {isSelected && (
                    <span style={{ color: tokens.colors.primary, fontSize: tokens.typography.fontSize.sm }}>
                      {checkIcon ?? '\u2713'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  },
});
