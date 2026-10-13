'use client';

import { useState } from 'react';
import {
  Button,
  PatternCockpitHeader,
  PatternWorkbenchHeader,
} from '@rottay/design-system';

export function CockpitHeaderPreview() {
  return (
    <PatternCockpitHeader
      title="Venue Detail"
      subtitle="Operational view for the main event shell"
      breadcrumbs={[
        { label: 'Venues', href: '/venues' },
        { label: 'Harbor Hall' },
      ]}
      status={[
        { label: 'Live', variant: 'success' },
        { label: 'Premium', variant: 'info' },
      ]}
      actions={<Button size="sm">Edit venue</Button>}
      onBack={() => undefined}
    />
  );
}

export function WorkbenchHeaderPreview() {
  const [activeViewId, setActiveViewId] = useState('overview');

  return (
    <PatternWorkbenchHeader
      title="Operations Dashboard"
      subtitle="Morning briefing"
      exceptionCount={3}
      quickActions={[
        { label: 'New event', onClick: () => undefined, variant: 'primary' },
        { label: 'Export', onClick: () => undefined },
      ]}
      savedViews={[
        { id: 'overview', label: 'Overview' },
        { id: 'alerts', label: 'Alerts' },
      ]}
      activeViewId={activeViewId}
      onViewChange={setActiveViewId}
    />
  );
}
