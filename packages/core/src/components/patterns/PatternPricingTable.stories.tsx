import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { PatternPricingTable } from './pricing-table';
import { createSurfaceStoryDecorator } from '../surfaces/common/story-helpers';

const meta: Meta<typeof PatternPricingTable> = {
  title: 'Patterns/PricingTable',
  component: PatternPricingTable,
  decorators: [createSurfaceStoryDecorator({ productProfile: 'events.organizer', engine: 'rustic' })],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof PatternPricingTable>;

export const Default: Story = {
  args: {
    plans: [
      { id: 'starter', name: 'Starter', price: 0, cta: 'Get Started', description: 'For individuals', features: { events: '5', attendees: '50', analytics: false, branding: false, support: false } },
      { id: 'pro', name: 'Professional', price: 49, cta: 'Start Trial', description: 'For growing teams', popular: true, priceNote: '/month', features: { events: 'Unlimited', attendees: '500', analytics: true, branding: true, support: false } },
      { id: 'business', name: 'Business', price: 199, cta: 'Contact Sales', description: 'For organizations', priceNote: '/month', features: { events: 'Unlimited', attendees: 'Unlimited', analytics: true, branding: true, support: true } },
    ],
    features: [
      { key: 'events', label: 'Events', category: 'Limits' },
      { key: 'attendees', label: 'Attendees per event', category: 'Limits' },
      { key: 'analytics', label: 'Advanced Analytics', category: 'Features' },
      { key: 'branding', label: 'Custom Branding', category: 'Features' },
      { key: 'support', label: 'Priority Support', category: 'Support' },
    ],
    highlightedPlan: 'pro',
    billingCycle: 'monthly',
    onSelectPlan: (id) => console.log('Selected:', id),
    onBillingCycleChange: (cycle) => console.log('Billing:', cycle),
  },
};
