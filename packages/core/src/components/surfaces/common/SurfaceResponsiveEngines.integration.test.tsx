import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';

import { AuthSurface } from '../auth';
import { DetailSurface } from '../detail';
import { FormSurface } from '../form';
import { ListSurface } from '../list';
import { MarketingSurface } from '../marketing';
import { OperationalSurface } from '../operational';
import type {
  AuthSurfaceConfig,
  DetailSurfaceConfig,
  EntityAdapter,
  FormSurfaceConfig,
  ListSurfaceConfig,
  MarketingSurfaceConfig,
  OperationalSurfaceConfig,
} from '../types';
import { STABLE_ENGINES, renderWithEngine } from '../../../testing/helpers/engine-test-utils';
import { mockMatchMedia } from '../../../testing/helpers/match-media';

interface CandidateRow {
  id: string;
  name: string;
  stage: string;
}

interface WorkspaceView {
  id: string;
  name: string;
}

const listAdapter: EntityAdapter<CandidateRow, CandidateRow> = {
  entity: 'candidate',
  version: '1.0.0',
  map: (raw) => raw,
  fields: [
    { key: 'name', fieldId: 'candidate.name' },
    { key: 'stage', fieldId: 'candidate.stage' },
  ],
};

const detailAdapter: EntityAdapter<WorkspaceView, WorkspaceView> = {
  entity: 'workspace',
  version: '1.0.0',
  map: (raw) => raw,
  fields: [{ key: 'name', fieldId: 'workspace.name' }],
};

function buildMarketingConfig(): MarketingSurfaceConfig {
  return {
    visual: {
      layout: 'split',
      stackOnMobile: true,
    },
    presentation: {
      eyebrow: 'White-label multi-tenancy',
      title: 'Operating system for branded live-event platforms.',
      description:
        'Ticketing, payments, staff, inventory, and AI-guided decisions in one operating layer.',
      hero: <div>Desktop product preview</div>,
      mobileHero: <div>Mobile product summary</div>,
      supporting: <div>Desktop supporting rail</div>,
      mobileSupporting: <div>Mobile supporting summary</div>,
    },
    behavior: {
      actions: [
        {
          id: 'create-workspace',
          label: 'Create workspace',
          onClick: vi.fn(),
          variant: 'primary',
        },
      ],
    },
  };
}

function buildAuthConfig(): AuthSurfaceConfig {
  return {
    visual: {
      layout: 'split',
    },
    presentation: {
      eyebrow: 'Secure sign in',
      title: 'Welcome back',
      subtitle: 'Access your operating workspace.',
      hero: <div>Desktop auth hero</div>,
      mobileHero: <div>Mobile auth summary</div>,
      form: <div>Auth form content</div>,
    },
    behavior: {},
  };
}

function buildListConfig(): ListSurfaceConfig<CandidateRow> {
  return {
    visual: {
      defaultView: 'table',
      allowViewSwitch: true,
      mobileDefaultView: 'cards',
      hideViewSwitchOnMobile: true,
      mobileFiltersLayout: 'stacked',
    },
    presentation: {
      chrome: {
        title: 'Candidates',
      },
      renderCard: (item) => <div>{`Candidate card: ${item.name}`}</div>,
    },
    behavior: {
      columns: [
        { key: 'name', fieldId: 'candidate.name', header: 'Name', accessorKey: 'name' },
        { key: 'stage', fieldId: 'candidate.stage', header: 'Stage', accessorKey: 'stage' },
      ],
      filters: [
        {
          key: 'stage',
          label: 'Stage',
          type: 'select',
          options: [{ label: 'All', value: 'all' }],
        },
      ],
      filterValues: {
        stage: 'all',
      },
      onFilterChange: vi.fn(),
      primaryAction: {
        id: 'create-candidate',
        label: 'Create candidate',
        onClick: vi.fn(),
      },
    },
  };
}

function buildFormConfig(): FormSurfaceConfig {
  return {
    visual: {
      layout: 'horizontal',
      columns: 2,
      mobileActionsSticky: true,
      hideAsideOnMobile: true,
    },
    presentation: {
      chrome: {
        title: 'Create record',
      },
      aside: <div>Desktop aside guidance</div>,
    },
    behavior: {
      fields: [],
      cancelAction: {
        id: 'cancel-record',
        label: 'Cancel',
        onClick: vi.fn(),
      },
      submitAction: {
        id: 'submit-record',
        label: 'Create record',
        variant: 'primary',
        onClick: vi.fn(),
      },
    },
  };
}

function buildDetailConfig(): DetailSurfaceConfig<WorkspaceView> {
  return {
    visual: {
      collapseSidebarOnMobile: true,
    },
    presentation: {
      title: (item) => item.name,
      tabs: [
        {
          key: 'overview',
          label: 'Overview',
          content: () => <div>Overview content</div>,
        },
      ],
      sidebar: () => <div>Workspace sidebar</div>,
      footer: () => <div>Workspace footer</div>,
    },
    behavior: {
      activeTab: 'overview',
      onTabChange: vi.fn(),
    },
  };
}

function buildOperationalConfig(): OperationalSurfaceConfig<{ key: string; title: string }> {
  return {
    visual: {
      mobileQueuePosition: 'top',
      mobileFeedPosition: 'bottom',
      hideSecondaryPanelOnMobile: true,
      stackSectionsOnMobile: true,
      mobileStatsLimit: 1,
    },
    presentation: {
      chrome: { title: 'Operational center' },
      primaryPanel: <div>Primary operator panel</div>,
      secondaryPanel: <div>Secondary operator panel</div>,
      queue: <div>Queue module</div>,
    },
    behavior: {
      stats: [
        { key: 'alerts', label: 'Alerts', value: 4 },
        { key: 'gates', label: 'Gates', value: 2 },
      ],
      feed: {
        items: [{ key: 'feed-1', title: 'Scanner spike detected' }],
        renderItem: (item) => <div>{item.title}</div>,
      },
    },
  };
}

describe('surface mobile resilience across stable engines', () => {
  it.each(STABLE_ENGINES)(
    'renders MarketingSurface mobile variants through the %s engine',
    async (engine) => {
      mockMatchMedia(390);

      renderWithEngine(<MarketingSurface config={buildMarketingConfig()} />, engine);

      expect(await screen.findByText('Mobile product summary')).toBeInTheDocument();
      expect(screen.getByText('Mobile supporting summary')).toBeInTheDocument();
      expect(screen.queryByText('Desktop product preview')).not.toBeInTheDocument();
    },
    45000,
  );

  it.each(STABLE_ENGINES)(
    'renders AuthSurface mobile hero through the %s engine',
    async (engine) => {
      mockMatchMedia(390);

      renderWithEngine(<AuthSurface config={buildAuthConfig()} />, engine);

      expect(await screen.findByText('Mobile auth summary')).toBeInTheDocument();
      expect(screen.getByText('Auth form content')).toBeInTheDocument();
      expect(screen.queryByText('Desktop auth hero')).not.toBeInTheDocument();
    },
    45000,
  );

  it.each(STABLE_ENGINES)(
    'switches ListSurface to mobile cards through the %s engine',
    async (engine) => {
      mockMatchMedia(390);

      renderWithEngine(
        <ListSurface
          data={[{ id: '1', name: 'Ana Gomez', stage: 'interview' }]}
          adapter={listAdapter}
          config={buildListConfig()}
        />,
        engine,
      );

      expect(await screen.findByText('Candidate card: Ana Gomez')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /table/i })).not.toBeInTheDocument();
    },
    45000,
  );

  it.each(STABLE_ENGINES)(
    'keeps FormSurface compact on mobile through the %s engine',
    async (engine) => {
      mockMatchMedia(390);

      renderWithEngine(<FormSurface config={buildFormConfig()} />, engine);

      expect(await screen.findByRole('button', { name: /create record/i })).toBeInTheDocument();
      expect(screen.queryByText('Desktop aside guidance')).not.toBeInTheDocument();
    },
    45000,
  );

  it.each(STABLE_ENGINES)(
    'collapses DetailSurface sidebar on mobile through the %s engine',
    async (engine) => {
      mockMatchMedia(390);

      renderWithEngine(
        <DetailSurface
          data={{ id: 'ws-1', name: 'Acme Workspace' }}
          adapter={detailAdapter}
          config={buildDetailConfig()}
        />,
        engine,
      );

      expect(await screen.findByText('Workspace sidebar')).toBeInTheDocument();
      expect(screen.getByText('Workspace footer')).toBeInTheDocument();
      expect(screen.getByText('Overview content')).toBeInTheDocument();
    },
    45000,
  );

  it.each(STABLE_ENGINES)(
    'repositions OperationalSurface modules on mobile through the %s engine',
    async (engine) => {
      mockMatchMedia(390);

      renderWithEngine(
        <OperationalSurface config={buildOperationalConfig()} />,
        engine,
      );

      expect(await screen.findByText('Queue module')).toBeInTheDocument();
      expect(screen.getByText('Scanner spike detected')).toBeInTheDocument();
      expect(screen.queryByText('Secondary operator panel')).not.toBeInTheDocument();
      expect(screen.queryByText('Gates')).not.toBeInTheDocument();
    },
    45000,
  );
});
