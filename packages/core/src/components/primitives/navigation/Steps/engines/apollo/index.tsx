'use client';

/**
 * Steps - Apollo Engine (Vanilla HTML/CSS)
 */
import React, { useMemo } from 'react';
import type { StepsProps, StepStatus, ProgressDotInfo } from '../../types';
import { STEPS_DEFAULTS } from '../../types';

const getStatusColors = (status: StepStatus) => {
  switch (status) {
    case 'finish': return { bg: '#1677ff', border: '#1677ff', text: '#fff' };
    case 'process': return { bg: '#fff', border: '#1677ff', text: '#1677ff' };
    case 'error': return { bg: '#fff', border: '#ff4d4f', text: '#ff4d4f' };
    default: return { bg: '#fff', border: '#d9d9d9', text: '#00000040' };
  }
};

const getEffectiveStatus = (
  index: number,
  current: number,
  itemStatus?: StepStatus,
  overallStatus?: StepStatus
): StepStatus => {
  if (itemStatus) return itemStatus;
  if (index < current) return 'finish';
  if (index === current) return overallStatus ?? 'process';
  return 'wait';
};

export const Steps = React.forwardRef<HTMLOListElement, StepsProps>(
  (props, ref) => {
    const {
      current = STEPS_DEFAULTS.current!,
      direction = STEPS_DEFAULTS.direction,
      size = STEPS_DEFAULTS.size,
      status: overallStatus = STEPS_DEFAULTS.status,
      progressDot,
      onChange,
      items,
      className,
      style,
    } = props;

    const isVertical = direction === 'vertical';
    const isSmall = size === 'small';

    const computedSteps = useMemo(() => {
      return items.map((item, index) => ({
        ...item,
        effectiveStatus: getEffectiveStatus(index, current, item.status, overallStatus),
      }));
    }, [items, current, overallStatus]);

    const handleStepClick = (index: number, disabled?: boolean) => {
      if (!disabled && onChange) onChange(index);
    };

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: isVertical ? 'column' : 'row',
      listStyle: 'none',
      margin: 0,
      padding: 0,
      width: '100%',
      ...style,
    };

    return (
      <ol ref={ref} className={className} style={containerStyle}>
        {computedSteps.map((step, index) => {
          const colors = getStatusColors(step.effectiveStatus);
          const isLast = index === items.length - 1;
          const isClickable = !step.disabled && onChange;

          const renderIcon = () => {
            if (typeof progressDot === 'function') {
              const dotInfo: ProgressDotInfo = {
                index,
                status: step.effectiveStatus,
                title: step.title ?? '',
                description: step.description ?? '',
              };
              return <span style={{ width: 8, height: 8, borderRadius: '50%', marginRight: 8 }}>{progressDot(dotInfo)}</span>;
            }
            if (progressDot) {
              return <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: colors.border, marginRight: 8, marginTop: 4 }} />;
            }
            if (step.icon) {
              return (
                <span style={{
                  width: isSmall ? 24 : 32,
                  height: isSmall ? 24 : 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8,
                  border: '2px solid',
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                  fontSize: isSmall ? 12 : 14,
                  fontWeight: 500,
                }}>
                  {step.icon}
                </span>
              );
            }
            const displayNumber = step.effectiveStatus === 'finish' ? '✓' : step.effectiveStatus === 'error' ? '✕' : index + 1;
            return (
              <span style={{
                width: isSmall ? 24 : 32,
                height: isSmall ? 24 : 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
                border: '2px solid',
                backgroundColor: colors.bg,
                borderColor: colors.border,
                color: colors.text,
                fontSize: isSmall ? 12 : 14,
                fontWeight: 500,
              }}>
                {displayNumber}
              </span>
            );
          };

          return (
            <li
              key={index}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'flex-start',
                position: 'relative',
                opacity: step.disabled ? 0.5 : 1,
                cursor: isClickable ? 'pointer' : 'default',
                ...(isVertical && { flex: 'none', minHeight: 64, marginBottom: 8 }),
              }}
              onClick={() => handleStepClick(index, step.disabled)}
            >
              {renderIcon()}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: isSmall ? 12 : 14, fontWeight: 500, color: step.effectiveStatus === 'error' ? '#ff4d4f' : '#000000d9' }}>
                  {step.title}
                  {step.subTitle && <span style={{ fontSize: 12, color: '#00000073', marginLeft: 8 }}>{step.subTitle}</span>}
                </span>
                {step.description && <span style={{ fontSize: 12, color: '#00000073', marginTop: 4 }}>{step.description}</span>}
              </div>
              {!isLast && (
                <span style={{
                  position: 'absolute',
                  height: isVertical ? 'calc(100% - 32px)' : 2,
                  width: isVertical ? 2 : undefined,
                  top: isVertical ? 40 : 15,
                  left: isVertical ? 15 : 40,
                  right: isVertical ? 'auto' : 8,
                  backgroundColor: index < current ? '#1677ff' : '#e8e8e8',
                }} />
              )}
            </li>
          );
        })}
      </ol>
    );
  }
);

Steps.displayName = 'Steps.Apollo';

export default Steps;
