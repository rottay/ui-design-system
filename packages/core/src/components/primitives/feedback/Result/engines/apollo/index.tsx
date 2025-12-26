'use client';

/**
 * Result - Apollo Engine (Vanilla HTML/CSS)
 */
import React from 'react';
import type { ResultProps, ResultStatus } from '../../types';
import { RESULT_DEFAULTS, RESULT_COLORS, RESULT_ICONS } from '../../types';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    padding: '48px 24px',
  },
  iconWrapper: {
    marginBottom: '24px',
  },
  icon: (status: ResultStatus): React.CSSProperties => ({
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    color: '#fff',
    backgroundColor: RESULT_COLORS[status],
  }),
  statusCode: (status: ResultStatus): React.CSSProperties => ({
    fontSize: '72px',
    fontWeight: 700,
    color: RESULT_COLORS[status],
    lineHeight: 1,
  }),
  title: {
    fontSize: '24px',
    fontWeight: 600,
    color: 'rgba(0, 0, 0, 0.88)',
    marginBottom: '8px',
    maxWidth: '480px',
  } as React.CSSProperties,
  subTitle: {
    fontSize: '14px',
    color: 'rgba(0, 0, 0, 0.45)',
    marginBottom: '24px',
    maxWidth: '480px',
    lineHeight: 1.6,
  } as React.CSSProperties,
  extra: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  children: {
    width: '100%',
    maxWidth: '560px',
  },
};

const renderIcon = (status: ResultStatus): React.ReactNode => {
  // HTTP status codes
  if (['404', '403', '500'].includes(status)) {
    return <div style={styles.statusCode(status)}>{status}</div>;
  }

  // Regular status with icon
  return (
    <div style={styles.icon(status)}>
      {RESULT_ICONS[status]}
    </div>
  );
};

export const Result = React.forwardRef<HTMLDivElement, ResultProps>(
  (props, ref) => {
    const {
      status = RESULT_DEFAULTS.status,
      icon,
      title,
      subTitle,
      extra,
      children,
      className = '',
      style,
    } = props;

    return (
      <div
        ref={ref}
        className={className}
        style={{ ...styles.container, ...style }}
        role="status"
        aria-live="polite"
      >
        {/* Icon */}
        <div style={styles.iconWrapper}>
          {icon || renderIcon(status!)}
        </div>

        {/* Title */}
        {title && (
          <h2 style={styles.title}>
            {title}
          </h2>
        )}

        {/* Subtitle */}
        {subTitle && (
          <p style={styles.subTitle}>
            {subTitle}
          </p>
        )}

        {/* Extra (buttons) */}
        {extra && (
          <div style={styles.extra}>
            {extra}
          </div>
        )}

        {/* Children */}
        {children && (
          <div style={styles.children}>
            {children}
          </div>
        )}
      </div>
    );
  }
);

Result.displayName = 'Result.Apollo';

export default Result;
