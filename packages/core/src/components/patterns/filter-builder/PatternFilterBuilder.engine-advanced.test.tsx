import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { StableEngineName } from '../../../testing/helpers/engine-test-utils';
import { STABLE_ENGINES, renderWithEngine } from '../../../testing/helpers/engine-test-utils';
import type { FilterBuilderProps, FilterGroup, FilterFieldDefinition } from './FilterBuilder.types';
import ClassicFilterBuilder from './engines/classic';
import ModernFilterBuilder from './engines/modern';
import RusticFilterBuilder from './engines/rustic';

const COMPONENTS: Record<StableEngineName, React.ComponentType<FilterBuilderProps>> = {
  classic: ClassicFilterBuilder,
  modern: ModernFilterBuilder,
  rustic: RusticFilterBuilder,
};

const sampleFields: FilterFieldDefinition[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'age', label: 'Age', type: 'number' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ],
  },
  { key: 'verified', label: 'Verified', type: 'boolean' },
  { key: 'created', label: 'Created', type: 'date' },
];

const emptyGroup: FilterGroup = {
  id: 'root',
  logic: 'and',
  rules: [],
};

const groupWithRules: FilterGroup = {
  id: 'root',
  logic: 'and',
  rules: [
    { id: 'rule-1', field: 'name', operator: 'contains', value: 'John' },
    { id: 'rule-2', field: 'age', operator: 'gt', value: 25 },
  ],
};

const groupWithNesting: FilterGroup = {
  id: 'root',
  logic: 'and',
  rules: [
    { id: 'rule-1', field: 'name', operator: 'contains', value: 'test' },
    {
      id: 'nested-group',
      logic: 'or',
      rules: [
        { id: 'rule-2', field: 'status', operator: 'equals', value: 'active' },
        { id: 'rule-3', field: 'age', operator: 'lt', value: 30 },
      ],
    },
  ],
};

function createBuilderProps(
  overrides: Partial<FilterBuilderProps> = {}
): FilterBuilderProps {
  return {
    fields: sampleFields,
    value: emptyGroup,
    onChange: vi.fn(),
    ...overrides,
  };
}

describe('PatternFilterBuilder advanced engine coverage', () => {
  it.each(STABLE_ENGINES)(
    'covers loading state through the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createBuilderProps()} loading />, engine);

      if (engine === 'classic') {
        expect(document.querySelector('.ant-spin')).not.toBeNull();
      } else if (engine === 'modern') {
        expect(document.querySelector('.loading-spinner')).not.toBeNull();
      } else {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      }
    }
  );

  it.each(STABLE_ENGINES)(
    'renders empty state with add rule button through the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onChange = vi.fn();

      renderWithEngine(
        <Component {...createBuilderProps({ onChange })} />,
        engine
      );

      const addRuleBtn = screen.getByTestId('add-rule-root');
      expect(addRuleBtn).toBeInTheDocument();
      expect(addRuleBtn).toHaveTextContent('Add rule');

      fireEvent.click(addRuleBtn);
      expect(onChange).toHaveBeenCalledTimes(1);

      // The new filter group should contain one rule
      const newValue = onChange.mock.calls[0][0] as FilterGroup;
      expect(newValue.rules).toHaveLength(1);
      expect(newValue.rules[0]).toHaveProperty('field', 'name');
      expect(newValue.rules[0]).toHaveProperty('operator');
    }
  );

  it.each(STABLE_ENGINES)(
    'renders existing rules with field and operator selectors through the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];

      renderWithEngine(
        <Component
          {...createBuilderProps({ value: groupWithRules })}
        />,
        engine
      );

      // Both rules should be present
      expect(screen.getByTestId('filter-rule-rule-1')).toBeInTheDocument();
      expect(screen.getByTestId('filter-rule-rule-2')).toBeInTheDocument();

      // First rule shows "Where", second shows "AND"
      expect(screen.getByText('Where')).toBeInTheDocument();
      expect(screen.getByText('AND')).toBeInTheDocument();
    }
  );

  it.each(STABLE_ENGINES)(
    'handles removing a rule through the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onChange = vi.fn();

      renderWithEngine(
        <Component
          {...createBuilderProps({
            value: groupWithRules,
            onChange,
          })}
        />,
        engine
      );

      // Find all remove rule buttons
      const removeButtons = screen.getAllByLabelText('Remove rule');
      expect(removeButtons.length).toBeGreaterThanOrEqual(1);

      fireEvent.click(removeButtons[0]);
      expect(onChange).toHaveBeenCalledTimes(1);

      const newValue = onChange.mock.calls[0][0] as FilterGroup;
      expect(newValue.rules).toHaveLength(1);
    }
  );

  it.each(STABLE_ENGINES)(
    'renders nested groups with connector lines through the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];

      renderWithEngine(
        <Component
          {...createBuilderProps({ value: groupWithNesting })}
        />,
        engine
      );

      // Root group and nested group
      expect(screen.getByTestId('filter-group-root')).toBeInTheDocument();
      expect(screen.getByTestId('filter-group-nested-group')).toBeInTheDocument();

      // The nested group should have a logic toggle
      const logicToggle = screen.getByTestId('logic-toggle-nested-group');
      expect(logicToggle).toHaveTextContent('OR');
    }
  );

  it.each(STABLE_ENGINES)(
    'toggles AND/OR logic through the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onChange = vi.fn();

      renderWithEngine(
        <Component
          {...createBuilderProps({
            value: groupWithNesting,
            onChange,
          })}
        />,
        engine
      );

      const logicToggle = screen.getByTestId('logic-toggle-nested-group');
      fireEvent.click(logicToggle);
      expect(onChange).toHaveBeenCalledTimes(1);

      const newValue = onChange.mock.calls[0][0] as FilterGroup;
      const nestedGroup = newValue.rules.find(
        (r) => 'logic' in r && r.id === 'nested-group'
      ) as FilterGroup;
      expect(nestedGroup.logic).toBe('and');
    }
  );

  it.each(STABLE_ENGINES)(
    'adds a group when clicking add group through the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onChange = vi.fn();

      renderWithEngine(
        <Component
          {...createBuilderProps({
            onChange,
            allowGrouping: true,
          })}
        />,
        engine
      );

      const addGroupBtn = screen.getByTestId('add-group-root');
      expect(addGroupBtn).toHaveTextContent('Add group');

      fireEvent.click(addGroupBtn);
      expect(onChange).toHaveBeenCalledTimes(1);

      const newValue = onChange.mock.calls[0][0] as FilterGroup;
      expect(newValue.rules).toHaveLength(1);
      expect(newValue.rules[0]).toHaveProperty('logic');
    }
  );

  it.each(STABLE_ENGINES)(
    'hides add group button when allowGrouping is false through the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];

      renderWithEngine(
        <Component
          {...createBuilderProps({ allowGrouping: false })}
        />,
        engine
      );

      expect(screen.queryByTestId('add-group-root')).not.toBeInTheDocument();
    }
  );

  it.each(STABLE_ENGINES)(
    'respects maxDepth and hides add group at depth limit through the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];

      const deepGroup: FilterGroup = {
        id: 'root',
        logic: 'and',
        rules: [
          {
            id: 'level1',
            logic: 'or',
            rules: [
              {
                id: 'level2',
                logic: 'and',
                rules: [],
              },
            ],
          },
        ],
      };

      renderWithEngine(
        <Component
          {...createBuilderProps({
            value: deepGroup,
            maxDepth: 3,
          })}
        />,
        engine
      );

      // At depth 2 (level2), no add group button should appear (maxDepth=3 means max depth index is 2)
      expect(screen.queryByTestId('add-group-level2')).not.toBeInTheDocument();
      // But add rule should still be available
      expect(screen.getByTestId('add-rule-level2')).toBeInTheDocument();
    }
  );

  it.each(STABLE_ENGINES)(
    'shows clear button and calls onClear through the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onClear = vi.fn();

      renderWithEngine(
        <Component
          {...createBuilderProps({
            value: groupWithRules,
            showClear: true,
            onClear,
          })}
        />,
        engine
      );

      const clearBtn = screen.getByTestId('clear-filters');
      expect(clearBtn).toHaveTextContent('Clear all');

      fireEvent.click(clearBtn);
      expect(onClear).toHaveBeenCalledTimes(1);
    }
  );

  it.each(STABLE_ENGINES)(
    'does not show clear button when there are no rules through the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];

      renderWithEngine(
        <Component
          {...createBuilderProps({
            showClear: true,
            onClear: vi.fn(),
          })}
        />,
        engine
      );

      expect(screen.queryByTestId('clear-filters')).not.toBeInTheDocument();
    }
  );

  it.each(STABLE_ENGINES)(
    'removes a nested group through the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onChange = vi.fn();

      renderWithEngine(
        <Component
          {...createBuilderProps({
            value: groupWithNesting,
            onChange,
          })}
        />,
        engine
      );

      const removeGroupBtn = screen.getByLabelText('Remove group');
      fireEvent.click(removeGroupBtn);
      expect(onChange).toHaveBeenCalledTimes(1);

      const newValue = onChange.mock.calls[0][0] as FilterGroup;
      // The nested group should be removed, leaving only rule-1
      expect(newValue.rules).toHaveLength(1);
      expect(newValue.rules[0]).toHaveProperty('id', 'rule-1');
    }
  );
});
