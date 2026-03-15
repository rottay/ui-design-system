'use client';

import { createPreset, PresetContext } from '../../../factory';
import type { TablePaginationProps } from '../../core';
import { TABLE_TOOLKIT_DEFAULTS } from '../../core';

export const TablePagination = createPreset<TablePaginationProps>({
  name: 'TableToolkit.Pagination',
  render: ({ primitives, props, tokens }: PresetContext<TablePaginationProps>) => {
    const { Box } = primitives;
    const {
      page,
      pageSize,
      total,
      onPageChange,
      onPageSizeChange,
      pageSizeOptions = TABLE_TOOLKIT_DEFAULTS.paginationPageSizeOptions,
      showPageSize = true,
      showTotal = true,
      firstIcon,
      prevIcon,
      nextIcon,
      lastIcon,
      className,
      style,
    } = props;

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, total);

    const navBtnStyle = (disabled: boolean) => ({
      display: 'inline-flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      width: 32,
      height: 32,
      borderRadius: tokens.borderRadius.md,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      backgroundColor: disabled ? tokens.colors.neutral[50] : tokens.colors.common.white,
      color: disabled ? tokens.colors.neutral[300] : tokens.colors.neutral[700],
      cursor: disabled ? 'not-allowed' as const : 'pointer' as const,
      fontSize: tokens.typography.fontSize.sm,
      fontFamily: 'inherit' as const,
    });

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: tokens.spacing[3],
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          ...style,
        }}
      >
        {/* Left: total info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
          {showTotal && (
            <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              Showing <strong style={{ color: tokens.colors.neutral[700] }}>{startItem}-{endItem}</strong> of <strong style={{ color: tokens.colors.neutral[700] }}>{total}</strong>
            </span>
          )}

          {showPageSize && onPageSizeChange && (
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                fontSize: tokens.typography.fontSize.sm,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[700],
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt} / page</option>
              ))}
            </select>
          )}
        </div>

        {/* Right: navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(1)}
            style={navBtnStyle(page <= 1)}
          >
            {firstIcon ?? '\u00AB'}
          </button>
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            style={navBtnStyle(page <= 1)}
          >
            {prevIcon ?? '\u2039'}
          </button>

          <span style={{
            padding: `0 ${tokens.spacing[3]}px`,
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[700],
            fontFamily: 'monospace',
          }}>
            {page} / {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            style={navBtnStyle(page >= totalPages)}
          >
            {nextIcon ?? '\u203A'}
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(totalPages)}
            style={navBtnStyle(page >= totalPages)}
          >
            {lastIcon ?? '\u00BB'}
          </button>
        </div>
      </Box>
    );
  },
});
