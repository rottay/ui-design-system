'use client';

/**
 * EmptyState - Modern Engine (DaisyUI/Tailwind)
 */

import React from 'react';
import type { EmptyStateProps } from '../../types';

const sizeClasses = {
  sm: { wrapper: 'py-6', icon: 'text-3xl', title: 'text-sm', desc: 'text-xs', btn: 'btn-sm' },
  md: { wrapper: 'py-12', icon: 'text-5xl', title: 'text-lg', desc: 'text-sm', btn: 'btn-md' },
  lg: { wrapper: 'py-16', icon: 'text-7xl', title: 'text-2xl', desc: 'text-base', btn: 'btn-lg' },
};

export default function ModernEmptyState(props: EmptyStateProps) {
  const {
    icon,
    title,
    description,
    action,
    secondaryAction,
    image,
    size = 'md',
    loading,
    className,
    style,
  } = props;

  const s = sizeClasses[size];

  if (loading) {
    return (
      <div className={`flex justify-center items-center ${s.wrapper} ${className ?? ''}`} style={style}>
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  return (
    <div className={`hero ${s.wrapper} ds-pattern-empty-state ds-engine-modern ${className ?? ''}`} style={style}>
      <div className="hero-content text-center">
        <div className="max-w-md">
          {image ? (
            <img src={image} alt={title} className="mx-auto mb-4 max-h-40 object-contain" />
          ) : icon ? (
            <div className={`${s.icon} mb-4 opacity-40`}>{icon}</div>
          ) : (
            <div className={`${s.icon} mb-4 opacity-20`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mx-auto">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
          )}
          <h2 className={`font-bold ${s.title}`}>{title}</h2>
          {description && <p className={`${s.desc} opacity-60 mt-2`}>{description}</p>}
          {(action || secondaryAction) && (
            <div className="flex justify-center gap-2 mt-6">
              {action && (
                <button
                  className={`btn ${action.variant === 'primary' ? 'btn-primary' : 'btn-ghost'} ${s.btn}`}
                  onClick={action.onClick}
                >
                  {action.label}
                </button>
              )}
              {secondaryAction && (
                <button className={`btn btn-ghost ${s.btn}`} onClick={secondaryAction.onClick}>
                  {secondaryAction.label}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
