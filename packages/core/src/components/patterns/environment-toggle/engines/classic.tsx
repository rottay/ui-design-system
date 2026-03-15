'use client';

/**
 * EnvironmentToggle - Classic Engine (Ant Design)
 */

import React, { useState, useCallback } from 'react';
import { Alert, Button, Dropdown, Modal, Radio, Space, Tag } from 'antd';
import {
  DownOutlined,
  ExclamationCircleOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import type { EnvironmentToggleProps, EnvironmentDef } from '../EnvironmentToggle.types';

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

  const activeEnv = environments.find(e => e.id === activeEnvironment);
  const isProduction = activeEnvironment === productionId;

  const handleSwitch = useCallback(
    (envId: string) => {
      if (envId === activeEnvironment) return;
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

  const renderToggle = () => {
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

    // Default: toggle (radio group style)
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
            style={env.id === activeEnvironment ? { background: env.color, borderColor: env.color } : {}}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {env.icon}
              {env.name}
              {env.badge && <Tag style={{ fontSize: 9, lineHeight: '14px', padding: '0 4px', marginRight: 0, marginLeft: 4 }}>{env.badge}</Tag>}
            </span>
          </Radio.Button>
        ))}
      </Radio.Group>
    );
  };

  return (
    <div className={`ds-pattern-environment-toggle ds-engine-classic ${className ?? ''}`} style={style}>
      {/* Banner */}
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
