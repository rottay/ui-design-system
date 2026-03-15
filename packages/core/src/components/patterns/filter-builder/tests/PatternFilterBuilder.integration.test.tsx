import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { StableEngineName } from '../../../../testing/helpers/engine-test-utils';
import { STABLE_ENGINES, renderWithEngine } from '../../../../testing/helpers/engine-test-utils';
import type { FilterBuilderProps, FilterGroup, FilterFieldDefinition, FilterRule } from '../types';
import ClassicFilterBuilder from '../engines/classic';
import ModernFilterBuilder from '../engines/modern';
import RusticFilterBuilder from '../engines/rustic';

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

const groupWithTextRule: FilterGroup = {
  id: 'root',
  logic: 'and',
  rules: [
    { id: 'rule-text', field: 'name', operator: 'contains', value: 'John' },
  ],
};

const groupWithNumberRule: FilterGroup = {
  id: 'root',
  logic: 'and',
  rules: [
    { id: 'rule-num', field: 'age', operator: 'gt', value: 25 },
  ],
};

const groupWithSelectRule: FilterGroup = {
  id: 'root',
  logic: 'and',
  rules: [
    { id: 'rule-sel', field: 'status', operator: 'equals', value: 'active' },
  ],
};

const groupWithBooleanRule: FilterGroup = {
  id: 'root',
  logic: 'and',
  rules: [
    { id: 'rule-bool', field: 'verified', operator: 'equals', value: true },
  ],
};

const groupWithDateRule: FilterGroup = {
  id: 'root',
  logic: 'and',
  rules: [
    { id: 'rule-date', field: 'created', operator: 'gt', value: '2026-01-01' },
  ],
};

const multiRuleGroup: FilterGroup = {
  id: 'root',
  logic: 'and',
  rules: [
    { id: 'rule-1', field: 'name', operator: 'contains', value: 'test' },
    { id: 'rule-2', field: 'age', operator: 'gt', value: 18 },
    { id: 'rule-3', field: 'status', operator: 'equals', value: 'active' },
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

describe('PatternFilterBuilder integration', () => {
  describe('add rule and verify new rule structure', () => {
    it.each(STABLE_ENGINES)(
      'adds a rule with the first field as default through the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];
        const onChange = vi.fn();

        renderWithEngine(
          <Component {...createBuilderProps({ onChange })} />,
          engine
        );

        fireEvent.click(screen.getByTestId('add-rule-root'));
        expect(onChange).toHaveBeenCalledTimes(1);

        const newValue = onChange.mock.calls[0][0] as FilterGroup;
        expect(newValue.rules).toHaveLength(1);

        const rule = newValue.rules[0] as FilterRule;
        expect(rule).toHaveProperty('id');
        expect(rule).toHaveProperty('field', 'name');
        expect(rule).toHaveProperty('operator');
        expect(rule).toHaveProperty('value');
      }
    );
  });

  describe('remove rule from multi-rule group', () => {
    it.each(STABLE_ENGINES)(
      'removes specific rule and preserves remaining rules through the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];
        const onChange = vi.fn();

        renderWithEngine(
          <Component
            {...createBuilderProps({
              value: multiRuleGroup,
              onChange,
            })}
          />,
          engine
        );

        // All three rules should be rendered
        expect(screen.getByTestId('filter-rule-rule-1')).toBeInTheDocument();
        expect(screen.getByTestId('filter-rule-rule-2')).toBeInTheDocument();
        expect(screen.getByTestId('filter-rule-rule-3')).toBeInTheDocument();

        // Remove the second rule
        const removeButtons = screen.getAllByLabelText('Remove rule');
        fireEvent.click(removeButtons[1]);
        expect(onChange).toHaveBeenCalledTimes(1);

        const newValue = onChange.mock.calls[0][0] as FilterGroup;
        expect(newValue.rules).toHaveLength(2);
        expect(newValue.rules.map((r) => (r as FilterRule).id)).toContain('rule-1');
        expect(newValue.rules.map((r) => (r as FilterRule).id)).toContain('rule-3');
      }
    );
  });

  describe('add group creates nested structure', () => {
    it.each(STABLE_ENGINES)(
      'adds a nested group with correct default logic through the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];
        const onChange = vi.fn();

        renderWithEngine(
          <Component
            {...createBuilderProps({
              value: groupWithTextRule,
              onChange,
              allowGrouping: true,
            })}
          />,
          engine
        );

        fireEvent.click(screen.getByTestId('add-group-root'));
        expect(onChange).toHaveBeenCalledTimes(1);

        const newValue = onChange.mock.calls[0][0] as FilterGroup;
        expect(newValue.rules).toHaveLength(2);

        const nestedGroup = newValue.rules.find((r) => 'logic' in r) as FilterGroup;
        expect(nestedGroup).toBeDefined();
        expect(nestedGroup.logic).toBeDefined();
        expect(nestedGroup.rules).toBeDefined();
      }
    );
  });

  describe('AND/OR toggle changes logic connector', () => {
    it.each(STABLE_ENGINES)(
      'toggles root logic from AND to OR through the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];
        const onChange = vi.fn();

        const group: FilterGroup = {
          id: 'root',
          logic: 'and',
          rules: [
            { id: 'rule-1', field: 'name', operator: 'contains', value: 'a' },
            {
              id: 'sub',
              logic: 'or',
              rules: [
                { id: 'rule-2', field: 'age', operator: 'gt', value: 10 },
                { id: 'rule-3', field: 'age', operator: 'lt', value: 50 },
              ],
            },
          ],
        };

        renderWithEngine(
          <Component
            {...createBuilderProps({ value: group, onChange })}
          />,
          engine
        );

        // Toggle the nested group's logic from OR to AND
        const logicToggle = screen.getByTestId('logic-toggle-sub');
        expect(logicToggle).toHaveTextContent('OR');
        fireEvent.click(logicToggle);

        expect(onChange).toHaveBeenCalledTimes(1);
        const newValue = onChange.mock.calls[0][0] as FilterGroup;
        const nestedGroup = newValue.rules.find(
          (r) => 'logic' in r && r.id === 'sub'
        ) as FilterGroup;
        expect(nestedGroup.logic).toBe('and');
      }
    );
  });

  describe('field type value inputs render correctly', () => {
    it.each(STABLE_ENGINES)(
      'renders text input for text fields through the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];

        renderWithEngine(
          <Component
            {...createBuilderProps({ value: groupWithTextRule })}
          />,
          engine
        );

        const ruleEl = screen.getByTestId('filter-rule-rule-text');
        expect(ruleEl).toBeInTheDocument();
      }
    );

    it.each(STABLE_ENGINES)(
      'renders number input for number fields through the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];

        renderWithEngine(
          <Component
            {...createBuilderProps({ value: groupWithNumberRule })}
          />,
          engine
        );

        const ruleEl = screen.getByTestId('filter-rule-rule-num');
        expect(ruleEl).toBeInTheDocument();
      }
    );

    it.each(STABLE_ENGINES)(
      'renders select input for select fields through the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];

        renderWithEngine(
          <Component
            {...createBuilderProps({ value: groupWithSelectRule })}
          />,
          engine
        );

        const ruleEl = screen.getByTestId('filter-rule-rule-sel');
        expect(ruleEl).toBeInTheDocument();
      }
    );

    it.each(STABLE_ENGINES)(
      'renders boolean input for boolean fields through the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];

        renderWithEngine(
          <Component
            {...createBuilderProps({ value: groupWithBooleanRule })}
          />,
          engine
        );

        const ruleEl = screen.getByTestId('filter-rule-rule-bool');
        expect(ruleEl).toBeInTheDocument();
      }
    );

    // The classic engine uses Ant Design DatePicker which requires dayjs
    // internals not available in jsdom, so we test date fields only on
    // modern and rustic engines.
    it.each(['modern', 'rustic'] as const)(
      'renders date input for date fields through the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];

        renderWithEngine(
          <Component
            {...createBuilderProps({ value: groupWithDateRule })}
          />,
          engine
        );

        const ruleEl = screen.getByTestId('filter-rule-rule-date');
        expect(ruleEl).toBeInTheDocument();
      }
    );
  });

  describe('compact mode', () => {
    it.each(STABLE_ENGINES)(
      'renders in compact mode without error through the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];

        renderWithEngine(
          <Component
            {...createBuilderProps({
              value: multiRuleGroup,
              compact: true,
            })}
          />,
          engine
        );

        expect(screen.getByTestId('filter-group-root')).toBeInTheDocument();
        expect(screen.getByTestId('filter-rule-rule-1')).toBeInTheDocument();
      }
    );
  });

  describe('custom labels', () => {
    it.each(STABLE_ENGINES)(
      'uses custom add rule and add group labels through the %s engine',
      (engine) => {
        const Component = COMPONENTS[engine];

        renderWithEngine(
          <Component
            {...createBuilderProps({
              addRuleLabel: 'New filter',
              addGroupLabel: 'New group',
              allowGrouping: true,
            })}
          />,
          engine
        );

        expect(screen.getByTestId('add-rule-root')).toHaveTextContent('New filter');
        expect(screen.getByTestId('add-group-root')).toHaveTextContent('New group');
      }
    );
  });
});
