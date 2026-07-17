'use client';

/**
 * @fileoverview EnvironmentToggle -- Classic engine (Ant Design).
 * Provides a UI control for switching between deployment environments
 * (e.g. development, staging, production). Supports three display
 * variants: radio-group toggle (default), pill buttons, and dropdown.
 * A warning banner appears when a non-production environment is active.
 * Production switches can require explicit confirmation via Ant Modal.
 *
 * @example
 * <ClassicEnvironmentToggle
 *   environments={[{ id: 'dev', name: 'Development', color: '#3b82f6' }, { id: 'prod', name: 'Production', color: '#ef4444' }]}
 *   activeEnvironment="dev"
 *   onChange={(envId) => setEnv(envId)}
 *   productionId="prod"
 *   confirmProductionSwitch="Are you sure? This will affect live users."
 * />
 */

import React, { useState, useCallback } from 'react';
import { Alert, Button, Dropdown, Modal, Radio, Space, Tag } from 'antd';
import {
  DownOutlined,
  ExclamationCircleOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import type { EnvironmentToggleProps, EnvironmentDef } from '../../contracts';

/**
 * Classic (Ant Design) implementation of the EnvironmentToggle pattern.
 * Uses Ant's Radio.Group for the default toggle, Dropdown for the
 * dropdown variant, and Button groups for the pills variant.
 * Production safety is handled via Ant's Modal.confirm.
 *
 * @param props - See {@link EnvironmentToggleProps} for the full prop contract.
 * @returns The rendered environment toggle with optional banner.
 */
export default function ClassicEnvironmentToggle(props: EnvironmentToggleProps) {
  const {
    environments,
    activeEnvironment,
    onChange,
    variant = 'toggle',
    showBanner = true,
    bannerMessage,
    productionId,
    confirmProductionSwitch,
    loading,
    className,
    style,
  } = props;

  /* Derive the full definition for the currently active environment */
  const activeEnv = environments.find(e => e.id === activeEnvironment);
  /* Determines whether the warning banner should be suppressed */
  const isProduction = activeEnvironment === productionId;

  /**
   * Handles environment switching with production safety gate.
   * If the target is the production environment and a confirmation
   * message is configured, it opens an Ant Modal.confirm dialog first.
   */
  const handleSwitch = useCallback(
    (envId: string) => {
      /* No-op when clicking the already-active environment */
      if (envId === activeEnvironment) return;
      /* Gate production switches behind a confirmation modal */
      if (envId === productionId && confirmProductionSwitch) {
        Modal.confirm({
          title: 'Switch to Production',
          icon: <ExclamationCircleOutlined />,
          content: confirmProductionSwitch,
          okText: 'Switch to Production',
          okButtonProps: { danger: true },
          cancelText: 'Cancel',
          onOk: () => onChange(envId),
        });
      } else {
        onChange(envId);
      }
    },
    [activeEnvironment, productionId, confirmProductionSwitch, onChange],
  );

  /** Renders the appropriate toggle control based on the variant prop */
  const renderToggle = () => {
    /* Dropdown variant: Ant Dropdown with colored dot and check mark for active item */
    if (variant === 'dropdown') {
      const items = environments.map(env => ({
        key: env.id,
        label: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: env.color,
              display: 'inline-block',
            }} />
            <span>{env.name}</span>
            {env.badge && <Tag color={env.color} style={{ marginLeft: 4, fontSize: 10 }}>{env.badge}</Tag>}
            {env.id === activeEnvironment && <CheckCircleFilled style={{ color: '#1890ff', marginLeft: 'auto' }} />}
          </div>
        ),
        onClick: () => handleSwitch(env.id),
      }));

      return (
        <Dropdown menu={{ items }} trigger={['click']}>
          <Button data-testid="env-toggle-trigger">
            <Space>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: activeEnv?.color ?? '#ccc',
                display: 'inline-block',
              }} />
              {activeEnv?.name ?? 'Select'}
              {activeEnv?.badge && <Tag color={activeEnv.color} style={{ fontSize: 10 }}>{activeEnv.badge}</Tag>}
              <DownOutlined style={{ fontSize: 10 }} />
            </Space>
          </Button>
        </Dropdown>
      );
    }

    /* Pills variant: individual buttons with active color applied via inline style */
    if (variant === 'pills') {
      return (
        <Space size={4} data-testid="env-toggle-trigger">
          {environments.map(env => (
            <Button
              key={env.id}
              type={env.id === activeEnvironment ? 'primary' : 'default'}
              size="small"
              onClick={() => handleSwitch(env.id)}
              data-testid={`env-option-${env.id}`}
              style={env.id === activeEnvironment ? { background: env.color, borderColor: env.color } : {}}
            >
              <Space size={4}>
                {env.icon}
                {env.name}
                {env.badge && <Tag style={{ fontSize: 9, lineHeight: '14px', padding: '0 4px', marginRight: 0 }}>{env.badge}</Tag>}
              </Space>
            </Button>
          ))}
        </Space>
      );
    }

    /* Default: radio-group toggle -- uses Ant's solid button style for clear active state */
    return (
      <Radio.Group
        value={activeEnvironment}
        onChange={(e) => handleSwitch(e.target.value)}
        optionType="button"
        buttonStyle="solid"
        size="small"
        data-testid="env-toggle-trigger"
      >
        {environments.map(env => (
          <Radio.Button
            key={env.id}
            value={env.id}
            data-testid={`env-option-${env.id}`}
            /* Override Ant's default button color with the environment's brand color when active */
            style={env.id === activeEnvironment ? { background: env.color, borderColor: env.color } : {}}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {env.icon}
              {env.name}
              {/* Compact inline badge for environment metadata (e.g. "v2", "beta") */}
              {env.badge && <Tag style={{ fontSize: 9, lineHeight: '14px', padding: '0 4px', marginRight: 0, marginLeft: 4 }}>{env.badge}</Tag>}
            </span>
          </Radio.Button>
        ))}
      </Radio.Group>
    );
  };

  return (
    <div className={`ds-pattern-environment-toggle ds-engine-classic ${className ?? ''}`} style={style}>
      {/* Banner -- only shown for non-production environments to warn the user */}
      {/* Background uses the environment's color at 15% opacity (hex suffix) */}
      {showBanner && !isProduction && activeEnv && (
        <Alert
          type="warning"
          showIcon={false}
          banner
          message={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: activeEnv.color,
                display: 'inline-block',
              }} />
              <span style={{ fontSize: 12, fontWeight: 500 }} data-testid="env-banner">
                {bannerMessage ?? `You are viewing the ${activeEnv.name} environment`}
              </span>
            </div>
          }
          style={{ background: activeEnv.color + '15', borderColor: activeEnv.color + '30' }}
        />
      )}

      {/* Toggle control */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {renderToggle()}
      </div>
    </div>
  );
}
