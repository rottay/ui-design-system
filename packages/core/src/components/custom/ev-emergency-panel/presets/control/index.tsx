'use client';

import { createPreset, type PresetContext } from '../../../factory';
import React from 'react';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
} from '../../../helpers';
import type { EvEmergencyPanelProps, EmergencyAction } from '../../core';

// Mock data for standalone demo
const MOCK_ACTIONS: EmergencyAction[] = [
  {
    id: 'evac-zone',
    type: 'evacuate-zone',
    label: 'Evacuate Zone',
    description: 'Evacuate a specific venue zone',
    active: false,
  },
  {
    id: 'evac-all',
    type: 'evacuate-all',
    label: 'Evacuate All',
    description: 'Full venue evacuation',
    active: false,
  },
  {
    id: 'lockdown',
    type: 'lockdown',
    label: 'Lockdown',
    description: 'Secure all entrances and exits',
    active: false,
  },
  {
    id: 'pa-broadcast',
    type: 'pa-broadcast',
    label: 'PA Broadcast',
    description: 'Emergency public announcement',
    active: true,
    activatedAt: new Date(Date.now() - 1000 * 60 * 5),
    activatedBy: 'Command Center',
  },
  {
    id: 'medical-alert',
    type: 'medical-alert',
    label: 'Medical Alert',
    description: 'Request emergency medical response',
    active: false,
  },
  {
    id: 'fire-alarm',
    type: 'fire-alarm',
    label: 'Fire Alarm',
    description: 'Activate fire alarm system',
    active: false,
  },
];

const MOCK_HEADCOUNT = {
  total: 8234,
  accounted: 8234,
  missing: 0,
};

export const ControlEvEmergencyPanel = createPreset<EvEmergencyPanelProps>({
  name: 'EvEmergencyPanel.Control',
  render: (ctx: PresetContext<EvEmergencyPanelProps>) => {
    const { primitives, props, tokens } = ctx;
    const { Box, Text } = primitives;

    const actions = props.actions || MOCK_ACTIONS;
    const headcount = props.headcount || MOCK_HEADCOUNT;

    const [confirmingAction, setConfirmingAction] = React.useState<string | null>(null);
    const [broadcastMessage, setBroadcastMessage] = React.useState('');

    const getActionColor = (type: EmergencyAction['type']) => {
      switch (type) {
        case 'evacuate-zone':
        case 'evacuate-all':
        case 'fire-alarm':
          return tokens.colors.errorScale;
        case 'lockdown':
        case 'medical-alert':
          return tokens.colors.warningScale;
        case 'pa-broadcast':
          return tokens.colors.infoScale;
        default:
          return tokens.colors.primaryScale;
      }
    };

    const getActionIcon = (type: EmergencyAction['type']) => {
      switch (type) {
        case 'evacuate-zone':
          return '🚪';
        case 'evacuate-all':
          return '🚨';
        case 'lockdown':
          return '🔒';
        case 'pa-broadcast':
          return '📢';
        case 'medical-alert':
          return '⚕️';
        case 'fire-alarm':
          return '🔥';
        default:
          return '⚠️';
      }
    };

    const isDestructive = (type: EmergencyAction['type']) => {
      return ['evacuate-all', 'lockdown', 'fire-alarm'].includes(type);
    };

    const handleActionClick = (action: EmergencyAction) => {
      if (action.active) {
        props.onDeactivate?.(action.id);
        return;
      }

      if (isDestructive(action.type)) {
        setConfirmingAction(action.id);
      } else {
        props.onActivate?.(action.id);
      }
    };

    const confirmAction = (actionId: string) => {
      props.onActivate?.(actionId);
      setConfirmingAction(null);
    };

    // Pulsing animation for active actions
    const pulseKeyframes = `
      @keyframes pulse-active {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
    `;

    return (
      <Box
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: tokens.colors.neutral[900],
          color: tokens.colors.neutral[50],
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <style>{pulseKeyframes}</style>

        {/* Header */}
        <Box
          style={{
            padding: tokens.spacing[4],
            borderBottom: `1px solid ${tokens.colors.neutral[700]}`,
            backgroundColor: tokens.colors.errorScale[900],
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.common.white,
            }}
          >
            Emergency Control Panel
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.errorScale[200],
              marginTop: tokens.spacing[1],
            }}
          >
            Authorized Personnel Only
          </Text>
        </Box>

        {/* Headcount Summary */}
        <Box
          style={{
            padding: tokens.spacing[4],
            backgroundColor: tokens.colors.neutral[800],
            borderBottom: `1px solid ${tokens.colors.neutral[700]}`,
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[400],
              marginBottom: tokens.spacing[3],
              fontWeight: tokens.typography.fontWeight.semibold,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Venue Headcount
          </Text>
          <Box
            style={{
              display: 'flex',
              gap: tokens.spacing[6],
            }}
          >
            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['3xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[100],
                }}
              >
                {headcount.total.toLocaleString()}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}
              >
                Total Capacity
              </Text>
            </Box>
            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['3xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.successScale[400],
                }}
              >
                {headcount.accounted.toLocaleString()}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}
              >
                Accounted For
              </Text>
            </Box>
            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['3xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color:
                    headcount.missing > 0
                      ? tokens.colors.errorScale[400]
                      : tokens.colors.successScale[400],
                }}
              >
                {headcount.missing.toLocaleString()}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}
              >
                Missing
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Action Buttons Grid */}
        <Box
          style={{
            flex: 1,
            padding: tokens.spacing[6],
            overflowY: 'auto',
          }}
        >
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: tokens.spacing[4],
            }}
          >
            {actions.map((action) => {
              const colors = getActionColor(action.type);
              const isConfirming = confirmingAction === action.id;

              return (
                <Box
                  key={action.id}
                  style={{
                    ...createCardStyle(tokens),
                    border: action.active
                      ? `3px solid ${colors[500]}`
                      : `1px solid ${tokens.colors.neutral[700]}`,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Action Header */}
                  <Box
                    style={{
                      padding: tokens.spacing[4],
                      backgroundColor: action.active ? `${colors[900]}80` : 'transparent',
                      borderBottom: `1px solid ${tokens.colors.neutral[700]}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[3],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize['3xl'],
                      }}
                    >
                      {getActionIcon(action.type)}
                    </Text>
                    <Box style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.lg,
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.neutral[50],
                          marginBottom: tokens.spacing[1],
                        }}
                      >
                        {action.label}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[400],
                        }}
                      >
                        {action.description}
                      </Text>
                    </Box>
                    {action.active && (
                      <Box
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: colors[500],
                          animation: 'pulse-active 2s ease-in-out infinite',
                        }}
                      />
                    )}
                  </Box>

                  {/* Action Status */}
                  <Box
                    style={{
                      flex: 1,
                      padding: tokens.spacing[3],
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    {action.active && action.activatedAt && (
                      <Box
                        style={{
                          padding: tokens.spacing[2],
                          backgroundColor: colors[900],
                          borderRadius: tokens.borderRadius.md,
                          marginBottom: tokens.spacing[3],
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: colors[200],
                            marginBottom: tokens.spacing[1],
                          }}
                        >
                          Activated by: {action.activatedBy}
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: colors[300],
                          }}
                        >
                          {action.activatedAt.toLocaleTimeString()}
                        </Text>
                      </Box>
                    )}

                    {/* Confirmation State */}
                    {isConfirming ? (
                      <Box
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: tokens.spacing[2],
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.errorScale[400],
                            fontWeight: tokens.typography.fontWeight.semibold,
                            textAlign: 'center',
                            marginBottom: tokens.spacing[2],
                          }}
                        >
                          Confirm Action?
                        </Text>
                        <Box
                          onClick={() => confirmAction(action.id)}
                          style={{
                            padding: tokens.spacing[3],
                            backgroundColor: colors[600],
                            color: tokens.colors.common.white,
                            borderRadius: tokens.borderRadius.md,
                            textAlign: 'center',
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.bold,
                            cursor: 'pointer',
                            ...createHoverStyle(tokens),
                          }}
                        >
                          CONFIRM {action.label.toUpperCase()}
                        </Box>
                        <Box
                          onClick={() => setConfirmingAction(null)}
                          style={{
                            padding: tokens.spacing[3],
                            backgroundColor: tokens.colors.neutral[700],
                            color: tokens.colors.neutral[200],
                            borderRadius: tokens.borderRadius.md,
                            textAlign: 'center',
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.medium,
                            cursor: 'pointer',
                            ...createHoverStyle(tokens),
                          }}
                        >
                          Cancel
                        </Box>
                      </Box>
                    ) : (
                      <Box
                        onClick={() => handleActionClick(action)}
                        style={{
                          padding: tokens.spacing[4],
                          backgroundColor: action.active ? colors[700] : colors[600],
                          color: tokens.colors.common.white,
                          borderRadius: tokens.borderRadius.md,
                          textAlign: 'center',
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.bold,
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          ...createHoverStyle(tokens),
                        }}
                      >
                        {action.active ? `Deactivate ${action.label}` : `Activate ${action.label}`}
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* PA Broadcast Section */}
          <Box
            style={{
              marginTop: tokens.spacing[6],
              ...createCardStyle(tokens),
              padding: tokens.spacing[4],
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[50],
                marginBottom: tokens.spacing[3],
              }}
            >
              PA Broadcast Message
            </Text>
            <textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Enter emergency broadcast message..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: tokens.spacing[3],
                backgroundColor: tokens.colors.neutral[800],
                border: `1px solid ${tokens.colors.neutral[700]}`,
                borderRadius: tokens.borderRadius.md,
                color: tokens.colors.neutral[100],
                fontSize: tokens.typography.fontSize.sm,
                fontFamily: 'inherit',
                resize: 'vertical',
                marginBottom: tokens.spacing[3],
              }}
            />
            <Box
              onClick={() => {
                if (broadcastMessage.trim()) {
                  props.onBroadcast?.(broadcastMessage);
                  setBroadcastMessage('');
                }
              }}
              style={{
                padding: tokens.spacing[3],
                backgroundColor: broadcastMessage.trim()
                  ? tokens.colors.infoScale[600]
                  : tokens.colors.neutral[700],
                color: tokens.colors.common.white,
                borderRadius: tokens.borderRadius.md,
                textAlign: 'center',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.bold,
                cursor: broadcastMessage.trim() ? 'pointer' : 'not-allowed',
                opacity: broadcastMessage.trim() ? 1 : 0.5,
                ...(broadcastMessage.trim() ? createHoverStyle(tokens) : {}),
              }}
            >
              BROADCAST MESSAGE
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
