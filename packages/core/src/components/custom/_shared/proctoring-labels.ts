/**
 * Inlined proctoring display labels.
 * These are trivial string lookups duplicated from @rottay/scoring to avoid
 * pulling the full scoring bundle (and its @rottay/core -> BullMQ dependency)
 * into client-side DS bundles.
 */

const EVENT_TYPE_LABELS: Record<string, string> = {
  tab_switch: 'Tab Switch',
  copy_paste: 'Copy/Paste',
  screen_share: 'Screen Share',
  unusual_typing: 'Unusual Typing',
  browser_focus_lost: 'Focus Lost',
};

export function getEventTypeLabel(type: string | undefined): string {
  if (!type) return 'Unknown';
  return (
    EVENT_TYPE_LABELS[type] ??
    type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

const SEVERITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export function getSeverityLabel(severity: string | undefined): string {
  if (!severity) return 'Unknown';
  return (
    SEVERITY_LABELS[severity] ??
    severity.charAt(0).toUpperCase() + severity.slice(1)
  );
}

const EVENT_TYPE_DESCRIPTIONS: Record<string, string> = {
  tab_switch: 'Candidate switched to a different browser tab during the assessment.',
  copy_paste: 'Copy/paste activity was detected in the assessment interface.',
  screen_share: 'Screen sharing to an external application was detected.',
  unusual_typing: 'Typing pattern anomaly detected, possibly indicating external assistance.',
  browser_focus_lost: 'Browser window lost focus, indicating candidate navigated away.',
};

export function getEventTypeDescription(type: string | undefined): string {
  if (!type) return 'A proctoring event was detected during the assessment.';
  return (
    EVENT_TYPE_DESCRIPTIONS[type] ??
    'A proctoring event was detected during the assessment.'
  );
}
