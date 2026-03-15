'use client';

import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createListItemStyle,
} from '../../../helpers';
import type { EvRadioChannelProps, RadioChannel, RadioMessage } from '../../core';

// Mock data for standalone demo
const MOCK_CHANNELS: RadioChannel[] = [
  { id: 'security', name: 'Security', type: 'security', activeUsers: 12, unreadCount: 3, priority: 'normal' },
  { id: 'medical', name: 'Medical', type: 'medical', activeUsers: 4, unreadCount: 1, priority: 'high' },
  { id: 'bar', name: 'Bar Staff', type: 'bar', activeUsers: 8, unreadCount: 0, priority: 'normal' },
  { id: 'stage', name: 'Stage Crew', type: 'stage', activeUsers: 6, unreadCount: 0, priority: 'normal' },
  { id: 'vip', name: 'VIP Services', type: 'vip', activeUsers: 3, unreadCount: 2, priority: 'normal' },
];

const MOCK_MESSAGES: RadioMessage[] = [
  {
    id: 'msg-1',
    channelId: 'security',
    sender: 'Alpha-3',
    senderRole: 'Security Lead',
    message: 'Situation at VIP lounge resolved. Parties escorted out.',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    type: 'text',
    priority: 'normal',
  },
  {
    id: 'msg-2',
    channelId: 'security',
    sender: 'Command',
    senderRole: 'Coordinator',
    message: '10-4, good work. Stand by for next assignment.',
    timestamp: new Date(Date.now() - 1000 * 60 * 1),
    type: 'acknowledgment',
    priority: 'normal',
  },
  {
    id: 'msg-3',
    channelId: 'security',
    sender: 'Beta-5',
    senderRole: 'Security',
    message: 'URGENT: Crowd surge at Stage A, requesting immediate backup',
    timestamp: new Date(Date.now() - 1000 * 30),
    type: 'alert',
    priority: 'urgent',
  },
  {
    id: 'msg-4',
    channelId: 'medical',
    sender: 'EMT-2',
    senderRole: 'Paramedic',
    message: 'Patient stabilized, transporting to on-site medical now',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    type: 'text',
    priority: 'urgent',
  },
  {
    id: 'msg-5',
    channelId: 'bar',
    sender: 'Bar-3',
    senderRole: 'Bartender',
    message: 'Running low on draft beer, requesting restock',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    type: 'text',
    priority: 'normal',
  },
  {
    id: 'msg-6',
    channelId: 'security',
    sender: 'Alpha-7',
    senderRole: 'Security',
    message: 'En route to Stage A, ETA 2 minutes',
    timestamp: new Date(Date.now() - 1000 * 15),
    type: 'text',
    priority: 'normal',
  },
  {
    id: 'msg-7',
    channelId: 'vip',
    sender: 'VIP-1',
    senderRole: 'VIP Host',
    message: 'Celebrity guest requesting additional security escort',
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    type: 'text',
    priority: 'normal',
  },
  {
    id: 'msg-8',
    channelId: 'vip',
    sender: 'Command',
    senderRole: 'Coordinator',
    message: 'Dispatching Alpha-2 to VIP section',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    type: 'text',
    priority: 'normal',
  },
];

export const DispatcherEvRadioChannel = createPreset<EvRadioChannelProps>({
  name: 'EvRadioChannel.Dispatcher',
  render: (ctx: PresetContext<EvRadioChannelProps>) => {
    const { primitives, props, tokens } = ctx;
    const { Box, Text } = primitives;

    const channels = props.channels || MOCK_CHANNELS;
    const messages = props.messages || MOCK_MESSAGES;
    const [activeChannelId, setActiveChannelId] = React.useState(
      props.activeChannelId || channels[0]?.id
    );

    const activeChannel = channels.find((c) => c.id === activeChannelId);
    const channelMessages = messages
      .filter((m) => m.channelId === activeChannelId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const getChannelEmoji = (type: RadioChannel['type']) => {
      switch (type) {
        case 'security':
          return '🛡️';
        case 'medical':
          return '⚕️';
        case 'bar':
          return '🍹';
        case 'stage':
          return '🎵';
        case 'vip':
          return '⭐';
        case 'general':
          return '📻';
      }
    };

    const getPriorityColor = (priority: RadioChannel['priority']) => {
      switch (priority) {
        case 'emergency':
          return tokens.colors.errorScale;
        case 'high':
          return tokens.colors.warningScale;
        default:
          return tokens.colors.neutral;
      }
    };

    const formatTimestamp = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const handleChannelSwitch = (channelId: string) => {
      setActiveChannelId(channelId);
      props.onChannelSwitch?.(channelId);
    };

    return (
      <Box
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: tokens.colors.neutral[50],
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* Channel List Sidebar */}
        <Box
          style={{
            width: '280px',
            backgroundColor: tokens.colors.neutral[900],
            color: tokens.colors.neutral[50],
            display: 'flex',
            flexDirection: 'column',
            borderRight: `1px solid ${tokens.colors.neutral[700]}`,
          }}
        >
          {/* Sidebar Header */}
          <Box
            style={{
              padding: tokens.spacing[4],
              borderBottom: `1px solid ${tokens.colors.neutral[700]}`,
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[50],
              }}
            >
              Radio Channels
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[400],
                marginTop: tokens.spacing[1],
              }}
            >
              Dispatcher Console
            </Text>
          </Box>

          {/* Channel List */}
          <Box
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: tokens.spacing[2],
            }}
          >
            {channels.map((channel) => {
              const isActive = channel.id === activeChannelId;
              const priorityColors = getPriorityColor(channel.priority);

              return (
                <Box
                  key={channel.id}
                  onClick={() => handleChannelSwitch(channel.id)}
                  style={{
                    padding: tokens.spacing[3],
                    marginBottom: tokens.spacing[2],
                    borderRadius: tokens.borderRadius.md,
                    cursor: 'pointer',
                    backgroundColor: isActive
                      ? tokens.colors.primaryScale[800]
                      : 'transparent',
                    border: isActive
                      ? `2px solid ${tokens.colors.primaryScale[500]}`
                      : '2px solid transparent',
                    ...createHoverStyle(tokens),
                  }}
                >
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: tokens.spacing[1],
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.lg }}>
                        {getChannelEmoji(channel.type)}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[100],
                        }}
                      >
                        {channel.name}
                      </Text>
                    </Box>
                    {channel.unreadCount > 0 && (
                      <Box
                        style={{
                          ...createBadgeStyle(tokens, 'error'),
                          minWidth: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: `0 ${tokens.spacing[1]}`,
                          fontSize: tokens.typography.fontSize.xs,
                        }}
                      >
                        {channel.unreadCount}
                      </Box>
                    )}
                  </Box>
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                    }}
                  >
                    <Text>{channel.activeUsers} active</Text>
                    {channel.priority !== 'normal' && (
                      <Text
                        style={{
                          color: priorityColors[400],
                          fontWeight: tokens.typography.fontWeight.semibold,
                          textTransform: 'uppercase',
                        }}
                      >
                        {channel.priority}
                      </Text>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Message Feed */}
        <Box
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: tokens.colors.common.white,
          }}
        >
          {/* Message Header */}
          {activeChannel && (
            <Box
              style={{
                padding: tokens.spacing[4],
                borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.neutral[50],
              }}
            >
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[3],
                }}
              >
                <Text style={{ fontSize: tokens.typography.fontSize['2xl'] }}>
                  {getChannelEmoji(activeChannel.type)}
                </Text>
                <Box>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.lg,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.neutral[900],
                    }}
                  >
                    {activeChannel.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[600],
                    }}
                  >
                    {activeChannel.activeUsers} active users
                  </Text>
                </Box>
              </Box>
            </Box>
          )}

          {/* Messages */}
          <Box
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: tokens.spacing[4],
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[3],
            }}
          >
            {channelMessages.map((message) => {
              const isUrgent = message.priority === 'urgent';
              const isAlert = message.type === 'alert';

              return (
                <Box
                  key={message.id}
                  style={{
                    display: 'flex',
                    gap: tokens.spacing[3],
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Avatar */}
                  <Box
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: isAlert
                        ? tokens.colors.errorScale[100]
                        : tokens.colors.primaryScale[100],
                      color: isAlert
                        ? tokens.colors.errorScale[700]
                        : tokens.colors.primaryScale[700],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.bold,
                      flexShrink: 0,
                    }}
                  >
                    {message.sender.substring(0, 2).toUpperCase()}
                  </Box>

                  {/* Message Content */}
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: tokens.spacing[2],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[900],
                        }}
                      >
                        {message.sender}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[600],
                        }}
                      >
                        {message.senderRole}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                        }}
                      >
                        {formatTimestamp(message.timestamp)}
                      </Text>
                      {isUrgent && (
                        <Box
                          style={{
                            ...createBadgeStyle(tokens, 'error'),
                            fontSize: tokens.typography.fontSize.xs,
                          }}
                        >
                          URGENT
                        </Box>
                      )}
                    </Box>
                    <Box
                      style={{
                        padding: tokens.spacing[3],
                        backgroundColor: isAlert
                          ? tokens.colors.errorScale[50]
                          : isUrgent
                            ? tokens.colors.warningScale[50]
                            : tokens.colors.neutral[100],
                        borderRadius: tokens.borderRadius.md,
                        borderLeft: isAlert
                          ? `4px solid ${tokens.colors.errorScale[500]}`
                          : isUrgent
                            ? `4px solid ${tokens.colors.warningScale[500]}`
                            : 'none',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[900],
                          lineHeight: 1.5,
                        }}
                      >
                        {message.message}
                      </Text>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Message Input */}
          <Box
            style={{
              padding: tokens.spacing[4],
              borderTop: `1px solid ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.neutral[50],
            }}
          >
            <Box
              style={{
                display: 'flex',
                gap: tokens.spacing[3],
              }}
            >
              <input
                type="text"
                placeholder={`Message ${activeChannel?.name || 'channel'}...`}
                style={{
                  flex: 1,
                  padding: tokens.spacing[3],
                  backgroundColor: tokens.colors.common.white,
                  border: `1px solid ${tokens.colors.neutral[300]}`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[900],
                  outline: 'none',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim() && activeChannelId) {
                    props.onSendMessage?.(activeChannelId, e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <Box
                style={{
                  padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
                  backgroundColor: tokens.colors.primaryScale[600],
                  color: tokens.colors.common.white,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  cursor: 'pointer',
                  ...createHoverStyle(tokens),
                }}
              >
                Send
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Channel Info Sidebar */}
        {activeChannel && (
          <Box
            style={{
              width: '280px',
              backgroundColor: tokens.colors.neutral[50],
              borderLeft: `1px solid ${tokens.colors.neutral[200]}`,
              padding: tokens.spacing[4],
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[4],
            }}
          >
            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[700],
                  marginBottom: tokens.spacing[3],
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Channel Info
              </Text>
              <Box
                style={{
                  ...createCardStyle(tokens),
                  padding: tokens.spacing[3],
                  display: 'flex',
                  flexDirection: 'column',
                  gap: tokens.spacing[2],
                }}
              >
                <Box>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[600],
                    }}
                  >
                    Active Users
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xl,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.neutral[900],
                    }}
                  >
                    {activeChannel.activeUsers}
                  </Text>
                </Box>
                <Box>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[600],
                    }}
                  >
                    Priority Level
                  </Text>
                  <Box style={{ marginTop: tokens.spacing[1] }}>
                    <Box
                      style={{
                        ...createBadgeStyle(
                          tokens,
                          activeChannel.priority === 'emergency'
                            ? 'error'
                            : activeChannel.priority === 'high'
                              ? 'warning'
                              : 'secondary'
                        ),
                        display: 'inline-block',
                      }}
                    >
                      {activeChannel.priority.toUpperCase()}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[700],
                  marginBottom: tokens.spacing[3],
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Quick Responses
              </Text>
              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: tokens.spacing[2],
                }}
              >
                {['10-4 (Acknowledged)', 'Copy that', 'On my way', 'Stand by'].map(
                  (response) => (
                    <Box
                      key={response}
                      onClick={() => {
                        if (activeChannelId) {
                          props.onQuickResponse?.(activeChannelId, response);
                        }
                      }}
                      style={{
                        padding: tokens.spacing[3],
                        backgroundColor: tokens.colors.common.white,
                        border: `1px solid ${tokens.colors.neutral[300]}`,
                        borderRadius: tokens.borderRadius.md,
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[900],
                        cursor: 'pointer',
                        textAlign: 'center',
                        ...createHoverStyle(tokens),
                      }}
                    >
                      {response}
                    </Box>
                  )
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
