/**
 * @fileoverview Evnto pilot stories -- demonstrates surface components configured
 * with the Evnto tenant personality (playful, spacious, bouncy animations).
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  DashboardSurface,
  ListSurface,
  WizardSurface,
} from '../';
import type { EntityAdapter } from '../../types';
import { Badge, Box, Button, Card, Flex, Stack, Text } from '../../../primitives';
import { PatternStatsGrid } from '../../../patterns';
import { SurfaceStoryProvider, createPosterDataUri } from './story-helpers';

/**
 * Evnto Pilot Story
 *
 * End-to-end proof that the design system works for the Evnto vertical:
 * - events.organizer product profile (media-first, spacious, expressive)
 * - Evnto tenant overrides (orange branding, rounded corners, lifted shadows)
 * - ListSurface in card mode with event data
 * - DashboardSurface with organizer-centric stats
 * - WizardSurface for event creation flow
 */

const meta: Meta = {
  title: 'Surfaces/Evnto Pilot',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Full vertical proof for the Evnto events platform. ' +
          'Demonstrates ListSurface (card view), DashboardSurface (event stats), ' +
          'and WizardSurface (event creation) under the events.organizer profile ' +
          'with Evnto tenant overrides.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// Evnto tenant overrides (mirrors app-evnto/src/design-system/evnto-theme.ts)
// ---------------------------------------------------------------------------

const EVNTO_TENANT_OVERRIDES = {
  branding: {
    companyName: 'Evnto',
    primaryColor: '#FF6B35',
    accentColor: '#14B8A6',
  },
  tokenOverrides: {
    densityScale: 1.02,
    borderRadius: {
      sm: '10px',
      md: '14px',
      lg: '20px',
      xl: '28px',
    },
    shadows: {
      md: '0 18px 48px rgba(17, 24, 39, 0.10)',
      lg: '0 28px 80px rgba(17, 24, 39, 0.14)',
    },
  },
} as const;

// ---------------------------------------------------------------------------
// Mock event data
// ---------------------------------------------------------------------------

interface RawEvent {
  id: string;
  name: string;
  venue: string;
  date: string;
  status: 'draft' | 'published' | 'live' | 'ended' | 'cancelled';
  ticketsSold: number;
  capacity: number;
  revenue: string;
  coverImage: string;
}

interface EventView {
  id: string;
  name: string;
  venue: string;
  date: string;
  status: string;
  ticketsSold: number;
  capacity: number;
  revenue: string;
  coverImage: string;
  occupancy: string;
}

const eventAdapter: EntityAdapter<RawEvent, EventView> = {
  entity: 'event',
  version: '1.0',
  map: (raw) => ({
    ...raw,
    occupancy: `${Math.round((raw.ticketsSold / raw.capacity) * 100)}%`,
  }),
  fields: [
    { key: 'name', fieldId: 'event.name', label: 'Event' },
    { key: 'venue', fieldId: 'event.venue', label: 'Venue' },
    { key: 'date', fieldId: 'event.date', label: 'Date' },
    { key: 'status', fieldId: 'event.status', label: 'Status' },
    { key: 'ticketsSold', fieldId: 'event.ticketsSold', label: 'Tickets Sold' },
    { key: 'capacity', fieldId: 'event.capacity', label: 'Capacity' },
    { key: 'occupancy', fieldId: 'event.occupancy', label: 'Occupancy' },
    { key: 'revenue', fieldId: 'event.revenue', label: 'Revenue' },
  ],
};

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  draft: { bg: 'var(--ds-event-draft, rgba(0,0,0,0.04))', color: 'var(--ds-event-draft-text, #737373)', label: 'Draft' },
  published: { bg: 'var(--ds-event-published, #f0fdf4)', color: 'var(--ds-event-published-text, #16a34a)', label: 'Published' },
  live: { bg: 'var(--ds-event-live, #eff6ff)', color: 'var(--ds-event-live-text, #2563eb)', label: 'Live' },
  ended: { bg: 'var(--ds-event-ended, rgba(0,0,0,0.04))', color: 'var(--ds-event-ended-text, #a3a3a3)', label: 'Ended' },
  cancelled: { bg: 'var(--ds-event-cancelled, #fef2f2)', color: 'var(--ds-event-cancelled-text, #dc2626)', label: 'Cancelled' },
};

const sampleEvents: RawEvent[] = [
  { id: 'evt-1', name: 'Summer Music Festival 2026', venue: 'Central Park Amphitheater', date: 'Jul 15, 2026', status: 'published', ticketsSold: 3200, capacity: 5000, revenue: '$128,000', coverImage: createPosterDataUri('Summer Fest', '#FF6B35', '#ec4899') },
  { id: 'evt-2', name: 'Tech Conference - DevDay', venue: 'Convention Center Hall A', date: 'Aug 22, 2026', status: 'draft', ticketsSold: 0, capacity: 1200, revenue: '$0', coverImage: createPosterDataUri('DevDay', '#0a66c2', '#14b8a6') },
  { id: 'evt-3', name: 'Jazz Night Under the Stars', venue: 'Rooftop Lounge', date: 'Jun 28, 2026', status: 'live', ticketsSold: 180, capacity: 200, revenue: '$14,400', coverImage: createPosterDataUri('Jazz Night', '#7c3aed', '#a855f7') },
  { id: 'evt-4', name: 'Food & Wine Expo', venue: 'Grand Ballroom', date: 'May 10, 2026', status: 'ended', ticketsSold: 890, capacity: 1000, revenue: '$53,400', coverImage: createPosterDataUri('Food Expo', '#b8a898', '#9a8a7a') },
  { id: 'evt-5', name: 'Outdoor Yoga Retreat', venue: 'Lakeside Pavilion', date: 'Apr 5, 2026', status: 'cancelled', ticketsSold: 45, capacity: 100, revenue: '$2,250', coverImage: createPosterDataUri('Yoga', '#16a34a', '#14b8a6') },
  { id: 'evt-6', name: 'Electronic Dance Marathon', venue: 'Warehouse District', date: 'Sep 1, 2026', status: 'published', ticketsSold: 1500, capacity: 3000, revenue: '$75,000', coverImage: createPosterDataUri('EDM', '#ec4899', '#f97316') },
];

function StatusBadge({ status }: { status: string }): React.ReactElement {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.draft;
  return (
    <Badge style={{ background: style.bg, color: style.color, fontWeight: 600, fontSize: 11, padding: '2px 10px', borderRadius: 'var(--ds-radius-full, 9999px)' }}>
      {style.label}
    </Badge>
  );
}

function EventCard({ event }: { event: EventView }): React.ReactElement {
  const occupancyPct = Math.round((event.ticketsSold / event.capacity) * 100);
  return (
    <Card variant="outlined" hoverable clickable>
      <Box style={{ width: '100%', height: 160, backgroundImage: `url(${event.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center', borderTopLeftRadius: 'var(--ds-radius-lg, 8px)', borderTopRightRadius: 'var(--ds-radius-lg, 8px)', position: 'relative' }}>
        <Box style={{ position: 'absolute', top: 12, right: 12 }}><StatusBadge status={event.status} /></Box>
      </Box>
      <Card.Body>
        <Stack spacing="sm">
          <Text style={{ fontWeight: 700, fontSize: 16, color: 'var(--ds-color-text-primary)' }}>{event.name}</Text>
          <Text style={{ fontSize: 13, color: 'var(--ds-color-text-secondary)' }}>{event.venue}</Text>
          <Flex justify="between" align="center">
            <Text style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>{event.date}</Text>
            <Text style={{ fontSize: 14, fontWeight: 700, color: 'var(--ds-color-text-primary)' }}>{event.revenue}</Text>
          </Flex>
          <Box>
            <Flex justify="between" style={{ marginBottom: 4 }}>
              <Text style={{ fontSize: 11, color: 'var(--ds-color-text-muted)' }}>{event.ticketsSold.toLocaleString()} / {event.capacity.toLocaleString()} tickets</Text>
              <Text style={{ fontSize: 11, fontWeight: 600, color: 'var(--ds-color-text-secondary)' }}>{occupancyPct}%</Text>
            </Flex>
            <Box style={{ height: 4, borderRadius: 'var(--ds-radius-full, 9999px)', background: 'var(--ds-color-neutral-200, #e5e5e5)', overflow: 'hidden' }}>
              <Box style={{ height: '100%', width: `${occupancyPct}%`, borderRadius: 'var(--ds-radius-full, 9999px)', background: occupancyPct >= 90 ? 'var(--ds-color-error, #dc2626)' : occupancyPct >= 60 ? 'var(--ds-color-warning, #ca8a04)' : 'var(--ds-color-success, #16a34a)', transition: 'width 0.3s ease' }} />
            </Box>
          </Box>
        </Stack>
      </Card.Body>
    </Card>
  );
}

export const FullPilot: Story = {
  render: () => {
    const [wizardStep, setWizardStep] = useState(0);
    return (
      <SurfaceStoryProvider productProfile="events.organizer" tenantOverrides={EVNTO_TENANT_OVERRIDES}>
        <Stack spacing="xl">
          <Box>
            <Flex align="center" gap={12}>
              <Text style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ds-color-text-muted)' }}>Evnto Pilot - events.organizer profile</Text>
              <Badge style={{ background: '#FF6B35', color: '#fff', fontWeight: 600 }}>Vertical Proof</Badge>
            </Flex>
          </Box>
          <DashboardSurface config={{ visual: {}, presentation: { chrome: { title: 'Organizer Dashboard', subtitle: 'Real-time overview of your event portfolio' }, sections: [{ key: 'quick-stats', title: 'Quick Stats', content: <PatternStatsGrid stats={[{ key: 'total-events', label: 'Total Events', value: 24 }, { key: 'tickets-sold', label: 'Tickets Sold', value: '5.8k' }, { key: 'total-revenue', label: 'Revenue', value: '$273k' }, { key: 'avg-occupancy', label: 'Avg Occupancy', value: '76%' }]} columns={4} variant="glass" /> }, { key: 'upcoming', title: 'Upcoming Events', content: <Stack spacing="sm"><Flex justify="between" align="center"><Text style={{ fontWeight: 600, color: 'var(--ds-color-text-primary)' }}>Summer Music Festival 2026</Text><StatusBadge status="published" /></Flex><Flex justify="between" align="center"><Text style={{ fontWeight: 600, color: 'var(--ds-color-text-primary)' }}>Jazz Night Under the Stars</Text><StatusBadge status="live" /></Flex><Flex justify="between" align="center"><Text style={{ fontWeight: 600, color: 'var(--ds-color-text-primary)' }}>Electronic Dance Marathon</Text><StatusBadge status="published" /></Flex></Stack> }] }, behavior: { stats: [{ key: 'active', label: 'Active Events', value: 4 }, { key: 'live', label: 'Live Now', value: 1 }, { key: 'revenue-today', label: 'Revenue Today', value: '$8.2k' }, { key: 'check-ins', label: 'Check-ins Today', value: 342 }] } }} />
          <ListSurface<RawEvent, EventView> data={sampleEvents} adapter={eventAdapter} config={{ visual: { defaultView: 'cards', allowViewSwitch: true, cardMinWidth: 320 }, presentation: { chrome: { title: 'Events', subtitle: 'Manage your event portfolio' }, renderCard: (item) => <EventCard event={item} />, toolbarEnd: <Flex gap={8} align="center"><StatusBadge status="live" /><Text style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>1 event live now</Text></Flex> }, behavior: { columns: [{ key: 'name', fieldId: 'event.name', header: 'Event', sortable: true }, { key: 'venue', fieldId: 'event.venue', header: 'Venue' }, { key: 'date', fieldId: 'event.date', header: 'Date', sortable: true }, { key: 'status', fieldId: 'event.status', header: 'Status', render: (value) => <StatusBadge status={String(value)} />, hideInCards: true }, { key: 'occupancy', fieldId: 'event.occupancy', header: 'Occupancy', hideInCards: true }, { key: 'revenue', fieldId: 'event.revenue', header: 'Revenue', sortable: true }], rowKey: 'id', primaryAction: { id: 'create-event', label: 'Create Event', variant: 'primary' }, rowActions: [{ id: 'view', label: 'View', variant: 'secondary' }, { id: 'edit', label: 'Edit', variant: 'ghost' }] } }} />
          <WizardSurface config={{ visual: { showProgress: true }, presentation: { chrome: { title: 'Create New Event', subtitle: 'Set up your event in a few steps' } }, behavior: { currentStep: wizardStep, onStepChange: setWizardStep, steps: [{ key: 'basics', title: 'Event Details', fields: [{ name: 'name', label: 'Event Name', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea' }, { name: 'category', label: 'Category', type: 'select', options: [{ label: 'Music', value: 'music' }, { label: 'Conference', value: 'conference' }, { label: 'Festival', value: 'festival' }, { label: 'Workshop', value: 'workshop' }] }] }, { key: 'venue', title: 'Venue & Dates', fields: [{ name: 'venue', label: 'Venue', type: 'text', required: true }, { name: 'startDate', label: 'Start Date', type: 'date' }, { name: 'endDate', label: 'End Date', type: 'date' }, { name: 'capacity', label: 'Capacity', type: 'number' }] }, { key: 'ticketing', title: 'Ticketing', content: <Stack spacing="md"><Text style={{ color: 'var(--ds-color-text-secondary)' }}>Configure ticket tiers, pricing, and availability windows.</Text><Flex gap={12} wrap="wrap"><Card variant="outlined" style={{ flex: 1, minWidth: 200 }}><Card.Body><Stack spacing="xs"><Text style={{ fontWeight: 700 }}>General Admission</Text><Text style={{ color: 'var(--ds-color-text-muted)', fontSize: 13 }}>$40.00</Text><Badge style={{ background: 'var(--ds-ticket-available, #f0fdf4)', color: 'var(--ds-ticket-available-text, #16a34a)', fontWeight: 600, fontSize: 11 }}>Available</Badge></Stack></Card.Body></Card><Card variant="outlined" style={{ flex: 1, minWidth: 200 }}><Card.Body><Stack spacing="xs"><Text style={{ fontWeight: 700 }}>VIP Access</Text><Text style={{ color: 'var(--ds-color-text-muted)', fontSize: 13 }}>$120.00</Text><Badge style={{ background: 'var(--ds-ticket-reserved, #eff6ff)', color: 'var(--ds-ticket-reserved-text, #2563eb)', fontWeight: 600, fontSize: 11 }}>Reserved</Badge></Stack></Card.Body></Card><Card variant="outlined" style={{ flex: 1, minWidth: 200 }}><Card.Body><Stack spacing="xs"><Text style={{ fontWeight: 700 }}>Early Bird</Text><Text style={{ color: 'var(--ds-color-text-muted)', fontSize: 13 }}>$25.00</Text><Badge style={{ background: 'var(--ds-ticket-sold, #fef2f2)', color: 'var(--ds-ticket-sold-text, #dc2626)', fontWeight: 600, fontSize: 11 }}>Sold Out</Badge></Stack></Card.Body></Card></Flex></Stack> }, { key: 'review', title: 'Review & Publish', content: <Stack spacing="md"><Text style={{ color: 'var(--ds-color-text-secondary)' }}>Review all details before publishing your event.</Text><Card variant="outlined"><Card.Body><Stack spacing="sm"><Flex justify="between"><Text style={{ color: 'var(--ds-color-text-muted)', fontSize: 13 }}>Status</Text><StatusBadge status="draft" /></Flex><Flex justify="between"><Text style={{ color: 'var(--ds-color-text-muted)', fontSize: 13 }}>Ticket Tiers</Text><Text style={{ fontWeight: 600 }}>3 configured</Text></Flex><Flex justify="between"><Text style={{ color: 'var(--ds-color-text-muted)', fontSize: 13 }}>Total Capacity</Text><Text style={{ fontWeight: 600 }}>5,000</Text></Flex></Stack></Card.Body></Card></Stack> }], submitAction: { id: 'publish-event', label: 'Publish Event', variant: 'primary', onClick: async () => undefined } } }} />
        </Stack>
      </SurfaceStoryProvider>
    );
  },
};

export const DashboardOnly: Story = {
  render: () => (
    <SurfaceStoryProvider productProfile="events.organizer" tenantOverrides={EVNTO_TENANT_OVERRIDES}>
      <DashboardSurface config={{ visual: {}, presentation: { chrome: { title: 'Event Operations', subtitle: 'Live metrics across all active events' }, sections: [{ key: 'live-events', title: 'Live Events', content: <PatternStatsGrid stats={[{ key: 'checked-in', label: 'Checked In', value: '2,847' }, { key: 'pending', label: 'Pending Entry', value: 153 }, { key: 'denied', label: 'Denied', value: 12 }, { key: 'bar-orders', label: 'Bar Orders', value: 489 }]} columns={4} variant="glass" /> }, { key: 'staff', title: 'Staff on Duty', content: <Stack spacing="sm"><Flex justify="between" align="center"><Text style={{ color: 'var(--ds-color-text-primary)' }}>Security</Text><Text style={{ fontWeight: 700 }}>18 / 20</Text></Flex><Flex justify="between" align="center"><Text style={{ color: 'var(--ds-color-text-primary)' }}>Bartenders</Text><Text style={{ fontWeight: 700 }}>12 / 12</Text></Flex><Flex justify="between" align="center"><Text style={{ color: 'var(--ds-color-text-primary)' }}>Technicians</Text><Text style={{ fontWeight: 700 }}>6 / 8</Text></Flex></Stack> }] }, behavior: { stats: [{ key: 'active-events', label: 'Active Events', value: 3 }, { key: 'live-now', label: 'Live Now', value: 1 }, { key: 'today-revenue', label: "Today's Revenue", value: '$18.4k' }, { key: 'satisfaction', label: 'Satisfaction', value: '94%' }] } }} />
    </SurfaceStoryProvider>
  ),
};

export const EventListCards: Story = {
  render: () => (
    <SurfaceStoryProvider productProfile="events.organizer" tenantOverrides={EVNTO_TENANT_OVERRIDES}>
      <ListSurface<RawEvent, EventView> data={sampleEvents} adapter={eventAdapter} config={{ visual: { defaultView: 'cards', allowViewSwitch: true, cardMinWidth: 300 }, presentation: { chrome: { title: 'My Events', subtitle: 'Card view is the default for events.organizer profile' }, renderCard: (item) => <EventCard event={item} /> }, behavior: { columns: [{ key: 'name', fieldId: 'event.name', header: 'Event', sortable: true }, { key: 'venue', fieldId: 'event.venue', header: 'Venue' }, { key: 'date', fieldId: 'event.date', header: 'Date', sortable: true }, { key: 'status', fieldId: 'event.status', header: 'Status', render: (value) => <StatusBadge status={String(value)} />, hideInCards: true }, { key: 'revenue', fieldId: 'event.revenue', header: 'Revenue', sortable: true }], rowKey: 'id', primaryAction: { id: 'new-event', label: 'New Event', variant: 'primary' }, filters: [{ key: 'status', label: 'Status', type: 'select', options: [{ label: 'All', value: '' }, { label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }, { label: 'Live', value: 'live' }, { label: 'Ended', value: 'ended' }] }, { key: 'venue', label: 'Venue', type: 'text' }], filterValues: {}, onFilterChange: () => undefined } }} />
    </SurfaceStoryProvider>
  ),
};

export const EventCreationWizard: Story = {
  render: () => {
    const [step, setStep] = useState(0);
    return (
      <SurfaceStoryProvider productProfile="events.organizer" tenantOverrides={EVNTO_TENANT_OVERRIDES}>
        <WizardSurface config={{ visual: { showProgress: true }, presentation: { chrome: { title: 'Create New Event', subtitle: 'Fill in the details to launch your next event' } }, behavior: { currentStep: step, onStepChange: setStep, steps: [{ key: 'basics', title: 'Event Details', fields: [{ name: 'name', label: 'Event Name', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea' }, { name: 'category', label: 'Category', type: 'select', options: [{ label: 'Music', value: 'music' }, { label: 'Conference', value: 'conference' }, { label: 'Festival', value: 'festival' }, { label: 'Workshop', value: 'workshop' }, { label: 'Sports', value: 'sports' }] }] }, { key: 'venue-dates', title: 'Venue & Schedule', fields: [{ name: 'venue', label: 'Venue', type: 'text', required: true }, { name: 'address', label: 'Address', type: 'text' }, { name: 'startDate', label: 'Start Date', type: 'date' }, { name: 'endDate', label: 'End Date', type: 'date' }, { name: 'capacity', label: 'Max Capacity', type: 'number' }] }, { key: 'tickets', title: 'Ticket Configuration', content: <Stack spacing="md"><Text style={{ color: 'var(--ds-color-text-secondary)' }}>Define your ticket tiers with pricing, quantity limits, and sale windows.</Text><Card variant="outlined"><Card.Body><Stack spacing="sm"><Flex justify="between" align="center"><Text style={{ fontWeight: 600 }}>General Admission</Text><Text style={{ fontWeight: 700 }}>$40.00</Text></Flex><Flex justify="between" align="center"><Text style={{ fontWeight: 600 }}>VIP</Text><Text style={{ fontWeight: 700 }}>$120.00</Text></Flex><Button variant="outlined" size="sm">Add Ticket Tier</Button></Stack></Card.Body></Card></Stack> }, { key: 'review', title: 'Review', content: <Stack spacing="md"><Text style={{ color: 'var(--ds-color-text-secondary)' }}>Everything looks good. Your event will be saved as a draft.</Text><Card variant="outlined"><Card.Body><Stack spacing="xs"><Flex justify="between"><Text style={{ fontSize: 13, color: 'var(--ds-color-text-muted)' }}>Status after save</Text><StatusBadge status="draft" /></Flex></Stack></Card.Body></Card></Stack> }], submitAction: { id: 'save-draft', label: 'Save as Draft', variant: 'primary', onClick: async () => undefined } } }} />
      </SurfaceStoryProvider>
    );
  },
};
