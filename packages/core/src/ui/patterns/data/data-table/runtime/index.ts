/** Data-table-owned state, grouping, and row resolution. Virtualization moved to
 * the shared patterns virtualization support owner (`patterns/runtime/virtualization`);
 * `useVirtualScroll` is re-exported from the PatternDataTable public barrel for
 * API continuity. */
export * from './grouping';
export * from './inline-editing';
export * from './row-resolution';
export * from './state';
