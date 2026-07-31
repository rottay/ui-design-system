'use client';

/**
 * @fileoverview Modern engine for the FilterBuilder pattern (Lote 2 rebuild).
 * The pattern COMPOSES public primitives -- it never recreates controls:
 * Select (field / operator / select values), Input + InputNumber (text and
 * numeric values), DatePicker (date values), Switch (boolean values), Empty
 * (initial empty hint) and Button (add / remove / logic-toggle / clear).
 * Each primitive is the single paint owner of its own chrome; this file owns
 * semantics, the recursive filter tree and the layout anatomy (`data-part`
 * wrappers) only. All paint and geometry live in the `filter-builder.css`
 * modern skin.
 *
 * @example
 * <FilterBuilder
 *   engine="modern"
 *   fields={[
 *     { key: 'status', label: 'Status', type: 'select', options: statusOpts },
 *     { key: 'created', label: 'Created', type: 'date' },
 *   ]}
 *   value={filterGroup}
 *   onChange={setFilterGroup}
 *   allowGrouping
 * />
 */

import React, { useCallback } from 'react';
import type {
  FilterBuilderProps,
  FilterGroup,
  FilterRule,
  FilterFieldDefinition,
  FilterOperator,
  OperatorDefinition,
  CustomOperatorDefinition,
} from '../../contracts';
import {
  isFilterGroup,
  generateFilterId,
} from '../../runtime/tree';
import {
  getOperatorsForFieldWithCustom,
  OPERATOR_DEFINITIONS,
  toOperatorDefinition,
} from '../../runtime/operators';
import ModernSpinner from '../../../../../primitives/feedback/Spinner/engines/modern';
import ModernEmpty from '../../../../../primitives/display/Empty/engines/modern';
import ModernButton from '../../../../../primitives/inputs/Button/engines/modern';
import ModernInput from '../../../../../primitives/inputs/Input/engines/modern';
import ModernInputNumber from '../../../../../primitives/inputs/InputNumber/engines/modern';
import ModernSelect from '../../../../../primitives/inputs/Select/engines/modern';
import ModernSwitch from '../../../../../primitives/inputs/Switch/engines/modern';
import ModernDatePicker from '../../../../../primitives/inputs/DatePicker/engines/modern';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ActionAddIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-add';
import { ActionDeleteIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-delete';

/**
 * Modern FilterBuilder: a recursive filter composer built ENTIRELY from DS
 * primitives. Manages the recursive filter tree (FilterGroup) via immutable
 * updates; every interactive element is a public primitive, so focus rings,
 * disabled/loading states, coarse-pointer floors and tenant paint cannot
 * drift from the rest of the system.
 *
 * @param props - See {@link FilterBuilderProps} for full prop documentation.
 * @returns A primitive-composed interactive filter composer with AND/OR grouping.
 */
const ROOT_CLASS_NAME = 'ds-pattern-filter-builder ds-engine-modern';

export default function ModernFilterBuilder(props: FilterBuilderProps) {
  const {
    fields,
    value,
    onChange,
    maxDepth = 3,
    allowGrouping = true,
    addRuleLabel: addRuleLabelProp,
    addGroupLabel: addGroupLabelProp,
    showClear,
    clearLabel: clearLabelProp,
    onClear,
    compact,
    loading,
    className,
    style,
    customOperators,
    showAddFilter,
    addFilterLabel: addFilterLabelProp,
  } = props;

  const i18n = useOptionalTranslation('components');
  /**
   * Localized label with an English floor: when the catalogue entry has not
   * landed yet the provider echoes the full key, which must never reach
   * visible copy or an aria-label.
   */
  const tOr = (key: string, fallback: string): string => {
    const resolved = i18n?.t(key);
    if (!resolved || resolved === key || resolved === `components.${key}`) return fallback;
    return resolved;
  };

  // Copy defaults: explicit props win; otherwise the localized label with the
  // historical English default as the floor (API and tests are pinned to it).
  const addRuleLabel = addRuleLabelProp ?? tOr('filter_builder.add_rule', 'Add rule');
  const addGroupLabel = addGroupLabelProp ?? tOr('filter_builder.add_group', 'Add group');
  const clearLabel = clearLabelProp ?? tOr('filter_builder.clear_all', 'Clear all');
  const addFilterLabel = addFilterLabelProp ?? tOr('filter_builder.add_filter', 'Add filter');
  const removeRuleLabel = tOr('filter_builder.remove_rule', 'Remove rule');
  const removeGroupLabel = tOr('filter_builder.remove_group', 'Remove group');
  const logicLabel = (logic: 'and' | 'or') =>
    logic === 'and' ? tOr('filter_builder.and', 'AND') : tOr('filter_builder.or', 'OR');

  // Build a merged operator definitions list (built-in + custom) once.
  const allOperatorDefs: OperatorDefinition[] = React.useMemo(() => {
    if (!customOperators?.length) return OPERATOR_DEFINITIONS;
    return [...OPERATOR_DEFINITIONS, ...customOperators.map(toOperatorDefinition)];
  }, [customOperators]);

  // Lookup map for custom operators that provide a custom value renderer.
  const customRenderMap = React.useMemo(() => {
    const map = new Map<string, NonNullable<CustomOperatorDefinition['renderValue']>>();
    if (customOperators) {
      for (const co of customOperators) {
        if (co.renderValue) map.set(co.key, co.renderValue);
      }
    }
    return map;
  }, [customOperators]);

  // State for the "Add Filter" field selector dropdown.
  const [addFilterOpen, setAddFilterOpen] = React.useState(false);

  // Immutable recursive tree update: walks from root to find the target group,
  // spreading at every level so React's reconciler detects the change.
  const updateGroup = useCallback(
    (
      root: FilterGroup,
      targetId: string,
      updater: (group: FilterGroup) => FilterGroup
    ): FilterGroup => {
      if (root.id === targetId) return updater(root);
      return {
        ...root,
        rules: root.rules.map((rule) => {
          if (isFilterGroup(rule)) {
            return updateGroup(rule, targetId, updater);
          }
          return rule;
        }),
      };
    },
    []
  );

  const updateRule = useCallback(
    (
      root: FilterGroup,
      ruleId: string,
      updater: (rule: FilterRule) => FilterRule
    ): FilterGroup => {
      return {
        ...root,
        rules: root.rules.map((rule) => {
          if (isFilterGroup(rule)) {
            return updateRule(rule, ruleId, updater);
          }
          if (rule.id === ruleId) return updater(rule);
          return rule;
        }),
      };
    },
    []
  );

  const removeNode = useCallback(
    (root: FilterGroup, nodeId: string): FilterGroup => {
      return {
        ...root,
        rules: root.rules
          .filter((rule) => rule.id !== nodeId)
          .map((rule) => {
            if (isFilterGroup(rule)) {
              return removeNode(rule, nodeId);
            }
            return rule;
          }),
      };
    },
    []
  );

  // New rules default to the first field and its first valid operator so the
  // row renders with sensible dropdowns pre-selected. Value starts undefined
  // to show the placeholder text in the input.
  const handleAddRule = useCallback(
    (groupId: string, fieldKey?: string) => {
      const defaultField = fieldKey
        ? fields.find((f) => f.key === fieldKey) ?? fields[0]
        : fields[0];
      if (!defaultField) return;
      const ops = getOperatorsForFieldWithCustom(defaultField, customOperators);
      const newRule: FilterRule = {
        id: generateFilterId(),
        field: defaultField.key,
        operator: ops[0]?.key ?? 'equals',
        value: undefined,
      };
      onChange(
        updateGroup(value, groupId, (group) => ({
          ...group,
          rules: [...group.rules, newRule],
        }))
      );
    },
    [fields, value, onChange, updateGroup, customOperators]
  );

  const handleAddGroup = useCallback(
    (parentGroupId: string) => {
      const newGroup: FilterGroup = {
        id: generateFilterId(),
        logic: 'and',
        rules: [],
      };
      onChange(
        updateGroup(value, parentGroupId, (group) => ({
          ...group,
          rules: [...group.rules, newGroup],
        }))
      );
    },
    [value, onChange, updateGroup]
  );

  const handleRemoveNode = useCallback(
    (nodeId: string) => {
      onChange(removeNode(value, nodeId));
    },
    [value, onChange, removeNode]
  );

  // Binary toggle between AND / OR. Nested groups allow users to build
  // complex predicates (e.g. an OR group inside an AND group).
  const handleToggleLogic = useCallback(
    (groupId: string) => {
      onChange(
        updateGroup(value, groupId, (group) => ({
          ...group,
          logic: group.logic === 'and' ? 'or' : 'and',
        }))
      );
    },
    [value, onChange, updateGroup]
  );

  // Reset operator and value when the field type changes because the valid
  // operator set differs by type (e.g. "contains" is not valid for numbers)
  // and the previous value may be the wrong shape for the new type.
  const handleFieldChange = useCallback(
    (ruleId: string, fieldKey: string) => {
      const fieldDef = fields.find((f) => f.key === fieldKey);
      if (!fieldDef) return;
      const ops = getOperatorsForFieldWithCustom(fieldDef, customOperators);
      onChange(
        updateRule(value, ruleId, (rule) => ({
          ...rule,
          field: fieldKey,
          operator: ops[0]?.key ?? 'equals',
          value: undefined,
        }))
      );
    },
    [fields, value, onChange, updateRule, customOperators]
  );

  // Clear the value when switching to a unary operator (e.g. "is empty")
  // so stale values are not accidentally sent to the consumer's query builder.
  const handleOperatorChange = useCallback(
    (ruleId: string, operator: FilterOperator) => {
      const opDef = allOperatorDefs.find((o) => o.key === operator);
      onChange(
        updateRule(value, ruleId, (rule) => ({
          ...rule,
          operator,
          value: opDef?.requiresValue ? rule.value : undefined,
        }))
      );
    },
    [value, onChange, updateRule, allOperatorDefs]
  );

  const handleValueChange = useCallback(
    (ruleId: string, newValue: any) => {
      onChange(
        updateRule(value, ruleId, (rule) => ({
          ...rule,
          value: newValue,
        }))
      );
    },
    [value, onChange, updateRule]
  );

  // One size step for every composed control: compact toolbars read 'sm',
  // the default posture reads 'md'. Each primitive maps it onto its own
  // density-scaled geometry -- the pattern never paints a pixel.
  const controlSize = compact ? 'sm' : 'md';
  const buttonSize = compact ? 'xs' : 'sm';

  // Renders the appropriate PRIMITIVE for the field type. Custom operators
  // with a renderValue function get priority.
  const renderValueInput = (rule: FilterRule, fieldDef: FilterFieldDefinition) => {
    const opDef = allOperatorDefs.find((o) => o.key === rule.operator);
    // Unary operators (isEmpty, isNotEmpty) render no value input.
    if (!opDef?.requiresValue) return null;

    // Custom operator with a custom value renderer takes priority.
    const customRenderer = customRenderMap.get(rule.operator);
    if (customRenderer) {
      return customRenderer(
        rule.value,
        (v: unknown) => handleValueChange(rule.id, v),
        fieldDef
      );
    }

    const valueAriaLabel = tOr('filter_builder.value_label', 'Filter value');

    // Range operators ("between") require paired from/to inputs.
    if (opDef.requiresRange) {
      const rangeVal = Array.isArray(rule.value) ? rule.value : [undefined, undefined];
      const RangeControl = fieldDef.type === 'number' ? ModernInputNumber : ModernInput;
      // Each range input carries ONE complete standalone aria-label — never a
      // concatenation of translated fragments (i18n law).
      return (
        <div data-part="value-range">
          <RangeControl
            size={controlSize}
            placeholder={tOr('filter_builder.range_from', 'From')}
            value={rangeVal[0] ?? undefined}
            onChange={(v: unknown) =>
              handleValueChange(rule.id, [v ?? undefined, rangeVal[1]])
            }
            aria-label={tOr('filter_builder.range_from_aria', 'Filter value from')}
          />
          <span data-part="range-separator">{tOr('filter_builder.range_and', 'and')}</span>
          <RangeControl
            size={controlSize}
            placeholder={tOr('filter_builder.range_to', 'To')}
            value={rangeVal[1] ?? undefined}
            onChange={(v: unknown) =>
              handleValueChange(rule.id, [rangeVal[0], v ?? undefined])
            }
            aria-label={tOr('filter_builder.range_to_aria', 'Filter value to')}
          />
        </div>
      );
    }

    switch (fieldDef.type) {
      case 'number':
        return (
          <ModernInputNumber
            size={controlSize}
            placeholder={fieldDef.placeholder ?? tOr('filter_builder.value_placeholder', 'Value')}
            value={typeof rule.value === 'number' ? rule.value : undefined}
            onChange={(v) => handleValueChange(rule.id, v ?? undefined)}
            aria-label={valueAriaLabel}
          />
        );
      case 'date':
        return (
          <ModernDatePicker
            size={controlSize}
            value={rule.value ?? null}
            onChange={(_date, dateStr) => handleValueChange(rule.id, dateStr || undefined)}
            aria-label={valueAriaLabel}
            allowClear
          />
        );
      case 'select':
        return (
          <ModernSelect
            size={controlSize}
            forceCustomDropdown
            placeholder={fieldDef.placeholder ?? tOr('filter_builder.select_placeholder', 'Select...')}
            value={rule.value ?? undefined}
            onChange={(v) => handleValueChange(rule.id, v || undefined)}
            options={(fieldDef.options ?? []).map((opt) => ({ value: opt.value, label: opt.label }))}
            allowClear
            aria-label={valueAriaLabel}
          />
        );
      case 'multiSelect':
        return (
          <ModernSelect
            size={controlSize}
            forceCustomDropdown
            multiple
            placeholder={fieldDef.placeholder ?? tOr('filter_builder.select_placeholder', 'Select...')}
            value={Array.isArray(rule.value) ? rule.value : rule.value ? [rule.value] : []}
            onChange={(v) => handleValueChange(rule.id, Array.isArray(v) && v.length > 0 ? v : undefined)}
            options={(fieldDef.options ?? []).map((opt) => ({ value: opt.value, label: opt.label }))}
            allowClear
            aria-label={valueAriaLabel}
          />
        );
      case 'boolean':
        // SwitchProps does not extend BaseComponentProps (no aria-* index), so
        // the accessible name rides a named group wrapper -- registered gap:
        // the Switch contract should extend BaseComponentProps directly.
        return (
          <span data-part="value-switch" role="group" aria-label={valueAriaLabel}>
            <ModernSwitch
              size={controlSize}
              checked={rule.value === true}
              onChange={(checked) => handleValueChange(rule.id, checked)}
            />
          </span>
        );
      default:
        return (
          <ModernInput
            size={controlSize}
            placeholder={fieldDef.placeholder ?? tOr('filter_builder.value_placeholder', 'Value')}
            value={rule.value ?? ''}
            onChange={(v) => handleValueChange(rule.id, v)}
            aria-label={valueAriaLabel}
          />
        );
    }
  };

  // A single rule row: logic keyword, field selector, operator selector,
  // type-appropriate value primitive, and a remove action -- every one a
  // public primitive inside a layout wrapper the skin owns.
  const renderRule = (rule: FilterRule, isFirst: boolean, parentLogic: 'and' | 'or') => {
    const fieldDef = fields.find((f) => f.key === rule.field);
    const operators = fieldDef ? getOperatorsForFieldWithCustom(fieldDef, customOperators) : [];

    return (
      <div
        key={rule.id}
        data-testid={`filter-rule-${rule.id}`}
        data-part="rule"
      >
        <div data-part="rule-logic-label">
          {isFirst ? tOr('filter_builder.where', 'Where') : logicLabel(parentLogic)}
        </div>

        <div data-part="rule-field" data-testid={`field-select-${rule.id}`}>
          <ModernSelect
            size={controlSize}
            forceCustomDropdown
            options={fields.map((f) => ({ value: f.key, label: f.label }))}
            value={rule.field}
            onChange={(v) => v && handleFieldChange(rule.id, String(v))}
            aria-label={tOr('filter_builder.field_label', 'Filter field')}
          />
        </div>

        <div data-part="rule-operator" data-testid={`operator-select-${rule.id}`}>
          <ModernSelect
            size={controlSize}
            forceCustomDropdown
            options={operators.map((op) => ({ value: op.key, label: op.label }))}
            value={rule.operator}
            onChange={(v) => v && handleOperatorChange(rule.id, v as FilterOperator)}
            aria-label={tOr('filter_builder.operator_label', 'Filter operator')}
          />
        </div>

        <div data-part="rule-value" data-field-type={fieldDef?.type}>
          {fieldDef && renderValueInput(rule, fieldDef)}
        </div>

        <div data-part="rule-actions">
          <ModernButton
            data-part="remove-button"
            icon={<ActionDeleteIcon decorative size={14} />}
            variant="ghost"
            size={buttonSize}
            onClick={() => handleRemoveNode(rule.id)}
            aria-label={removeRuleLabel}
          />
        </div>
      </div>
    );
  };

  // Groups render recursively. The root group has no visual container so it
  // integrates cleanly into any parent layout; nested groups get a quiet
  // inline-start hairline and inset fill (skin-owned) to show hierarchy.
  const renderGroup = (group: FilterGroup, depth: number = 0) => {
    const isRoot = depth === 0;
    // maxDepth - 1 because "Add group" creates a child at depth + 1.
    const canNest = allowGrouping && depth < maxDepth - 1;

    return (
      <div
        key={group.id}
        data-testid={`filter-group-${group.id}`}
        data-part="group"
        data-root={isRoot || undefined}
      >
        {!isRoot && (
          <div data-part="group-header">
            <ModernButton
              data-part="logic-toggle"
              data-logic={group.logic}
              variant={group.logic === 'and' ? 'primary' : 'outline'}
              size={buttonSize}
              onClick={() => handleToggleLogic(group.id)}
              data-testid={`logic-toggle-${group.id}`}
            >
              {logicLabel(group.logic)}
            </ModernButton>
            <ModernButton
              data-part="remove-button"
              icon={<ActionDeleteIcon decorative size={14} />}
              variant="ghost"
              size={buttonSize}
              onClick={() => handleRemoveNode(group.id)}
              aria-label={removeGroupLabel}
            />
          </div>
        )}

        {group.rules.map((rule, index) =>
          isFilterGroup(rule)
            ? renderGroup(rule, depth + 1)
            : renderRule(rule, index === 0, group.logic)
        )}

        {isRoot && group.rules.length === 0 && (
          // Initial empty state: the composed Empty primitive owns the quiet
          // hint (i18n floor); the add-row below stays the visible prompt.
          <div data-part="empty">
            <ModernEmpty description={tOr('filter_builder.empty', 'No filters yet')} />
          </div>
        )}

        <div data-part="group-actions">
          <ModernButton
            data-part="add-rule-button"
            icon={<ActionAddIcon decorative size={14} />}
            variant="dashed"
            size={buttonSize}
            onClick={() => handleAddRule(group.id)}
            data-testid={`add-rule-${group.id}`}
          >
            {addRuleLabel}
          </ModernButton>
          {canNest && (
            <ModernButton
              data-part="add-group-button"
              icon={<ActionAddIcon decorative size={14} />}
              variant="dashed"
              size={buttonSize}
              onClick={() => handleAddGroup(group.id)}
              data-testid={`add-group-${group.id}`}
            >
              {addGroupLabel}
            </ModernButton>
          )}
          {showAddFilter && isRoot && (
            <div data-part="add-filter">
              <ModernButton
                data-part="add-filter-trigger"
                data-open={addFilterOpen ? "true" : "false"}
                icon={<ActionAddIcon decorative size={14} />}
                variant="outline"
                size={buttonSize}
                onClick={() => setAddFilterOpen((prev) => !prev)}
                data-testid="add-filter-button"
                aria-expanded={addFilterOpen}
              >
                {addFilterLabel}
              </ModernButton>
              {addFilterOpen && (
                <div
                  data-testid="add-filter-dropdown"
                  data-part="add-filter-dropdown"
                  data-open="true"
                  role="listbox"
                  aria-label={addFilterLabel}
                >
                  {fields.map((f) => (
                    /* role=option keeps the listbox semantics valid (the
                       composed Button forwards the role to its native
                       element); single-shot pick closes the dropdown. */
                    <ModernButton
                      key={f.key}
                      data-part="add-filter-option"
                      variant="ghost"
                      size={buttonSize}
                      role="option"
                      aria-selected={false}
                      icon={f.icon ? <span data-part="add-filter-option-icon">{f.icon}</span> : undefined}
                      onClick={() => {
                        handleAddRule(group.id, f.key);
                        setAddFilterOpen(false);
                      }}
                      data-testid={`add-filter-field-${f.key}`}
                    >
                      {f.label}
                    </ModernButton>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {isRoot && showClear && onClear && group.rules.length > 0 && (
          <div data-part="clear-row">
            <ModernButton
              data-part="clear-button"
              variant="text"
              size={buttonSize}
              onClick={onClear}
              data-testid="clear-filters"
            >
              {clearLabel}
            </ModernButton>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div
        data-part="root"
        data-loading="true"
        data-compact={compact || undefined}
        className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')}
        style={style}
      >
        {/* No data-part override: the Spinner primitive keeps its own anatomy
            so spinner.css stays its single paint owner; the centering frame
            is skin-owned (the retired Tailwind utilities are drained). */}
        <ModernSpinner data-part="spinner" size="md" />
      </div>
    );
  }

  return (
    <div data-part="root" data-compact={compact || undefined} className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')} style={style}>
      {renderGroup(value, 0)}
    </div>
  );
}
