'use client';

import React, { useState } from 'react';
import { createPreset } from '../../../factory';
import type { AlertRuleBuilderProps, AlertRule, AlertCondition } from '../../core';
import { ALERT_RULE_BUILDER_DEFAULTS } from '../../core';

export const StandardPreset = createPreset<AlertRuleBuilderProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text, Button, Input, Select, Switch } = primitives;
  const {
    rules,
    onSave,
    onDelete,
    onToggle,
    fields = ALERT_RULE_BUILDER_DEFAULTS.fields,
    className,
    style,
  } = props;

  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);

  const addCondition = () => {
    if (!editingRule) return;
    const newCondition: AlertCondition = {
      field: fields[0]?.key || '',
      operator: '>',
      value: '',
      conjunction: 'and',
    };
    setEditingRule({
      ...editingRule,
      conditions: [...editingRule.conditions, newCondition],
    });
  };

  const updateCondition = (index: number, updates: Partial<AlertCondition>) => {
    if (!editingRule) return;
    const updated = [...editingRule.conditions];
    updated[index] = { ...updated[index], ...updates };
    setEditingRule({ ...editingRule, conditions: updated });
  };

  const removeCondition = (index: number) => {
    if (!editingRule) return;
    setEditingRule({
      ...editingRule,
      conditions: editingRule.conditions.filter((_: AlertCondition, i: number) => i !== index),
    });
  };

  return (
    <Box className={className} style={style}>
      <Box style={{
        boxShadow: tokens.shadows.md, display: 'flex', flexDirection: 'column', gap: tokens.spacing[6] }}>
        {rules.map((rule: AlertRule) => (
          <Box
            key={rule.id}
            style={{
              padding: tokens.spacing[6],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              borderRadius: tokens.borderRadius.lg,
              backgroundColor: tokens.colors.common.white,
            }}
          >
            <Box
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: tokens.spacing[4],
              }}
            >
              <Text

                style={{ fontWeight: tokens.typography.fontWeight.semibold }}
              >
                {rule.name}
              </Text>
              <Box style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'center' }}>
                <Switch
                  checked={rule.enabled}
                  onChange={() => onToggle?.(rule.id, !rule.enabled)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingRule(rule)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(rule.id)}
                  style={{ color: tokens.colors.errorScale[600] }}
                >
                  Delete
                </Button>
              </Box>
            </Box>

            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
              <Text style={{ color: tokens.colors.neutral[700] }}>
                Conditions: {rule.conditions.length}
              </Text>
              <Text style={{ color: tokens.colors.neutral[700] }}>
                Actions: {rule.actions.length}
              </Text>
            </Box>
          </Box>
        ))}
      </Box>

      {editingRule && (
        <Box
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: `${tokens.colors.neutral[900]}80`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: tokens.spacing[6],
          }}
          onClick={() => setEditingRule(null)}
        >
          <Box
            style={{
              backgroundColor: tokens.colors.common.white,
              borderRadius: tokens.borderRadius.lg,
              padding: tokens.spacing[8],
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}
          >
            <Text

              style={{
                fontWeight: tokens.typography.fontWeight.semibold,
                marginBottom: tokens.spacing[6],
              }}
            >
              Edit Rule
            </Text>

            <Box style={{ marginBottom: tokens.spacing[4] }}>
              <Text
                               style={{
                  marginBottom: tokens.spacing[1],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                Rule Name
              </Text>
              <Input
                value={editingRule.name}
                onChange={(value: string) => setEditingRule({ ...editingRule, name: value })}
              />
            </Box>

            <Text
                           style={{
                fontWeight: tokens.typography.fontWeight.semibold,
                marginBottom: tokens.spacing[4],
              }}
            >
              Conditions
            </Text>

            {editingRule.conditions.map((condition: AlertCondition, index: number) => (
              <Box
                key={index}
                style={{
                  display: 'flex',
                  gap: tokens.spacing[2],
                  marginBottom: tokens.spacing[4],
                  alignItems: 'flex-end',
                }}
              >
                <Select
                  value={condition.field}
                  onChange={(value: string | number | (string | number)[]) => updateCondition(index, { field: String(value) })}
                  style={{ flex: 1 }}
                >
                  {fields.map((field: { key: string; label: string; type: string }) => (
                    <option key={field.key} value={field.key}>
                      {field.label}
                    </option>
                  ))}
                </Select>

                <Select
                  value={condition.operator}
                  onChange={(value: string | number | (string | number)[]) => updateCondition(index, { operator: String(value) })}
                  style={{ flex: '0 0 80px' }}
                >
                  <option value=">">{'>'}</option>
                  <option value="<">{'<'}</option>
                  <option value="=">{'='}</option>
                  <option value="!=">{'!='}</option>
                </Select>

                <Input
                  value={condition.value}
                  onChange={(value: string) => updateCondition(index, { value })}
                  style={{ flex: 1 }}
                />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCondition(index)}
                >
                  Remove
                </Button>
              </Box>
            ))}

            <Button variant="ghost" onClick={addCondition} style={{ marginBottom: tokens.spacing[6] }}>
              Add Condition
            </Button>

            <Box style={{ display: 'flex', gap: tokens.spacing[4], justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setEditingRule(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  onSave?.(editingRule);
                  setEditingRule(null);
                }}
              >
                Save Rule
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
});

StandardPreset.displayName = 'AlertRuleBuilderStandardPreset';
