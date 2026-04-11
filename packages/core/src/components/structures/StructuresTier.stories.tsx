/**
 * @fileoverview Structures tier Storybook landing page.
 *
 * Lists every structures family with a one-line description and its folder
 * path so new contributors can find the right entry point quickly.
 * This story does not render live components — it is a documentation
 * index page only.
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const FAMILIES = [
  // headers/
  { name: 'CollectionHeader', folder: 'headers/collection', desc: 'Hero header for collection/list pages' },
  { name: 'DetailHeader', folder: 'headers/detail', desc: 'Header for entity detail pages' },
  { name: 'EditHeader', folder: 'headers/edit', desc: 'Header for entity edit pages' },
  { name: 'FormHeader', folder: 'headers/form', desc: 'Header for create-form pages' },
  // workspace/
  { name: 'SearchCommandBar', folder: 'workspace/search-command-bar', desc: 'Command/search bar with voice + suggestions' },
  { name: 'ActiveFiltersBar', folder: 'workspace/active-filters-bar', desc: 'Horizontal active-filter chip strip' },
  { name: 'FieldFiltersPanel', folder: 'workspace/field-filters-panel', desc: 'Filter card grid with presets' },
  { name: 'ColumnMenu', folder: 'workspace/column-menu', desc: 'Column visibility/order panel' },
  { name: 'SavedViewsMenu', folder: 'workspace/saved-views-menu', desc: 'Saved-views dropdown' },
  { name: 'SelectionPreviewRail', folder: 'workspace/selection-preview-rail', desc: 'Sticky preview rail' },
  { name: 'ScopeSwitcher', folder: 'workspace/scope-switcher', desc: 'Horizontal scope pill strip' },
  { name: 'TableToolbar', folder: 'workspace/table-toolbar', desc: 'One-row slot-driven toolbar' },
  // record/
  { name: 'Record building blocks', folder: 'record/record', desc: 'SummaryStrip, FieldGrid, Field, ActionBar, Panel' },
  { name: 'FormSections / FormFactsCard', folder: 'record/form-sections', desc: 'Accordion form sections with tone variants' },
  // dashboard/
  { name: 'Metrics/Activity variants', folder: 'dashboard/dashboard-insights', desc: '8 insight widget variants + useVariant' },
  { name: 'StatsHeader', folder: 'dashboard/stats-header', desc: 'Operational stat card strip' },
  { name: 'DataTerminalCard', folder: 'dashboard/data-terminal-card', desc: '4-variant dashboard metric card' },
  // feedback/
  { name: 'LoadingOverlay', folder: 'feedback/loading-overlay', desc: 'Semi-transparent loading shell' },
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
