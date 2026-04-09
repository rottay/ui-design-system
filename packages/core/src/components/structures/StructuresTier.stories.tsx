/**
 * @fileoverview Structures tier Storybook landing page.
 *
 * Lists every chrome family with a one-line description and its folder
 * path so new contributors can find the right entry point quickly.
 * This story does not render live components — it is a documentation
 * index page only.
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const FAMILIES = [
  { name: 'CollectionHeader', folder: 'collection-header', desc: 'Hero header for collection/list pages' },
  { name: 'DetailHeader', folder: 'detail-header', desc: 'Header for entity detail pages' },
  { name: 'EditHeader', folder: 'edit-header', desc: 'Header for entity edit pages' },
  { name: 'FormHeader', folder: 'form-header', desc: 'Header for create-form pages' },
  { name: 'TableToolbar', folder: 'table-toolbar', desc: 'One-row slot-driven toolbar' },
  { name: 'SearchCommandBar', folder: 'search-command-bar', desc: 'Command/search bar with voice + suggestions' },
  { name: 'ActiveFiltersBar', folder: 'active-filters-bar', desc: 'Horizontal active-filter chip strip' },
  { name: 'FieldFiltersPanel', folder: 'field-filters-panel', desc: 'Filter card grid with presets' },
  { name: 'ColumnMenu', folder: 'column-menu', desc: 'Column visibility/order panel' },
  { name: 'SavedViewsMenu', folder: 'saved-views-menu', desc: 'Saved-views dropdown' },
  { name: 'ScopeSwitcher', folder: 'scope-switcher', desc: 'Horizontal scope pill strip' },
  { name: 'SelectionPreviewRail', folder: 'selection-preview-rail', desc: 'Sticky preview rail for selected items' },
  { name: 'FormSections / FormFactsCard', folder: 'form-sections', desc: 'Accordion form sections with tone variants' },
  { name: 'RecordSummaryStrip / RecordFieldGrid / RecordField / RecordActionBar / RecordPanel', folder: 'record', desc: 'Record-page building blocks' },
  { name: 'StatsHeader', folder: 'stats-header', desc: 'Operational stat card strip with animations' },
  { name: 'DataTerminalCard', folder: 'data-terminal-card', desc: '4-variant dashboard metric card' },
  { name: 'LoadingOverlay', folder: 'loading-overlay', desc: 'Semi-transparent loading shell' },
  { name: 'Metrics/Activity variants', folder: 'dashboard-insights', desc: '8 dashboard insight widget variants + useVariant hook' },
];

function StructuresTierIndex() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Structures</h1>
      <p style={{ color: '#666', marginBottom: 24, lineHeight: 1.6 }}>
        Structural families that sit between <strong>patterns</strong> (task-level compositions)
        and <strong>surfaces</strong> (page-level configs). Headers, toolbars, record panels,
        metric cards, loading overlays.
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e5e5', textAlign: 'left' }}>
            <th style={{ padding: '8px 12px' }}>Family</th>
            <th style={{ padding: '8px 12px' }}>Folder</th>
            <th style={{ padding: '8px 12px' }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {FAMILIES.map((f) => (
            <tr key={f.folder} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '8px 12px', fontWeight: 600 }}>{f.name}</td>
              <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12, color: '#888' }}>structures/{f.folder}/</td>
              <td style={{ padding: '8px 12px', color: '#555' }}>{f.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: 24, fontSize: 13, color: '#999' }}>
        See <code>docs/structures-tier.md</code> for the full guide including the
        "where does X belong?" decision table and compat alias documentation.
      </p>
    </div>
  );
}

const meta: Meta = {
  title: 'Structures/Overview',
  component: StructuresTierIndex,
  parameters: {
    layout: 'padded',
    docs: { description: { component: 'Index page listing all structures-tier families.' } },
  },
};

export default meta;

type Story = StoryObj;

export const Index: Story = {};
