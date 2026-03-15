'use client';

import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
} from '../../../helpers';
import type { EvRadioChannelProps, RadioChannel, RadioMessage } from '../../core';

// Mock data for standalone demo
const MOCK_CHANNELS: RadioChannel[] = [
  { id: 'security', name: 'Security', type: 'security', activeUsers: 12, unreadCount: 0, priority: 'normal' },
  { id: 'medical', name: 'Medical', type: 'medical', activeUsers: 4, unreadCount: 0, priority: 'high' },
  { id: 'bar', name: 'Bar Staff', type: 'bar', activeUsers: 8, unreadCount: 0, priority: 'normal' },
  { id: 'stage', name: 'Stage Crew', type: 'stage', activeUsers: 6, unreadCount: 0, priority: 'normal' },
  { id: 'general', name: 'General', type: 'general', activeUsers: 24, unreadCount: 0, priority: 'normal' },
];

const MOCK_MESSAGES: RadioMessage[] = [
  {
    id: 'msg-1',
    channelId: 'security',
    sender: 'Command',
    senderRole: 'Coordinator',
    message: 'Alpha-3, respond to VIP lounge for assistance',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    type: 'text',
    priority: 'normal',
  },
  {
    id: 'msg-2',
    channelId: 'security',
    sender: 'You',
    senderRole: 'Security Alpha-3',
    message: '10-4, en route to VIP lounge',
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
    type: 'acknowledgment',
    priority: 'normal',
  },
  {
    id: 'msg-3',
    channelId: 'security',
    sender: 'Beta-5',
    senderRole: 'Security',
    message: 'All clear at north entrance, resuming patrol',
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    type: 'text',
    priority: 'normal',
  },
  {
    id: 'msg-4',
    channelId: 'security',
    sender: 'Command',
    senderRole: 'Coordinator',
    message: 'Copy that Beta-5. All units maintain high visibility',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    type: 'text',
    priority: 'normal',
  },
  {
    id: 'msg-5',
    channelId: 'security',
    sender: 'Alpha-7',
    senderRole: 'Security',
    message: 'Crowd building at Stage A, monitoring situation',
    timestamp: new Date(Date.now() - 1000 * 60 * 1),
    type: 'text',
    priority: 'normal',
  },
];

export const PersonalEvRadioChannel = createPreset<EvRadioChannelProps>({
  name: 'EvRadioChannel.Personal',
  render: (ctx: PresetContext<EvRadioChannelProps>) => {
    const { primitives, props, tokens } = ctx;
    const { Box, Text } = primitives;

    const channels = props.channels || MOCK_CHANNELS;
    const messages = props.messages || MOCK_MESSAGES;
    const currentUser = props.currentUser || 'Alpha-3';
    const [activeChannelId, setActiveChannelId] = React.useState(
      props.activeChannelId || 'security'
    );
    const [isPTTPressed, setIsPTTPressed] = React.useState(false);

    const activeChannel = channels.find((c) => c.id === activeChannelId);
    const channelMessages = messages
      .filter((m) => m.channelId === activeChannelId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(-5); // Last 5 messages

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

    const formatTimestamp = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const handleQuickResponse = (response: string) => {
      if (activeChannelId) {
        props.onQuickResponse?.(activeChannelId, response);
      }
    };

    const handleChannelSwitch = (channelId: string) => {
      setActiveChannelId(channelId);
      props.onChannelSwitch?.(channelId);
    };

    // Walkie-talkie pulsing animation
    const pulseKeyframes = `
      @keyframes ptt-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
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

        {/* Channel Indicator */}
        <Box
          style={{
            padding: tokens.spacing[4],
            backgroundColor: tokens.colors.neutral[800],
            borderBottom: `1px solid ${tokens.colors.neutral[700]}`,
            textAlign: 'center',
          }}
        >
          {activeChannel && (
            <Box>
              <Box
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[3],
                  marginBottom: tokens.spacing[2],
                }}
              >
                <Text style={{ fontSize: tokens.typography.fontSize['3xl'] }}>
                  {getChannelEmoji(activeChannel.type)}
                </Text>
                <Box>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize['2xl'],
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.neutral[50],
                    }}
                  >
                    {activeChannel.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[400],
                    }}
                  >
                    {activeChannel.activeUsers} active • {currentUser}
                  </Text>
                </Box>
              </Box>
              {activeChannel.priority !== 'normal' && (
                <Box
                  style={{
                    marginTop: tokens.spacing[2],
                  }}
                >
                  <Box
                    style={{
                      ...createBadgeStyle(
                        tokens,
                        activeChannel.priority === 'emergency'
                          ? 'error'
                          : activeChannel.priority === 'high'
                            ? 'warning'
                            : 'primary'
                      ),
                      display: 'inline-block',
                    }}
                  >
                    {activeChannel.priority.toUpperCase()} PRIORITY
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Recent Messages Feed */}
        <Box
          style={{
            flex: 1,
            padding: tokens.spacing[4],
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[3],
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[500],
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: tokens.spacing[2],
            }}
          >
            Recent Messages
          </Text>
          {channelMessages.length === 0 ? (
            <Box
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: tokens.colors.neutral[600],
              }}
            >
              <Text>No recent messages</Text>
            </Box>
          ) : (
            channelMessages.map((message) => {
              const isCurrentUser = message.sender === 'You';
              const isUrgent = message.priority === 'urgent';

              return (
                <Box
                  key={message.id}
                  style={{
                    padding: tokens.spacing[3],
                    backgroundColor: isUrgent
                      ? tokens.colors.warningScale[900]
                      : isCurrentUser
                        ? tokens.colors.primaryScale[900]
                        : tokens.colors.neutral[800],
                    borderRadius: tokens.borderRadius.md,
                    border: isUrgent
                      ? `2px solid ${tokens.colors.warningScale[500]}`
                      : '1px solid transparent',
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
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: isUrgent
                            ? tokens.colors.warningScale[200]
                            : isCurrentUser
                              ? tokens.colors.primaryScale[200]
                              : tokens.colors.neutral[200],
                        }}
                      >
                        {message.sender}
                      </Text>
                      {isUrgent && (
                        <Box
                          style={{
                            padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                            backgroundColor: tokens.colors.errorScale[600],
                            color: tokens.colors.common.white,
                            borderRadius: tokens.borderRadius.sm,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.bold,
                          }}
                        >
                          URGENT
                        </Box>
                      )}
                    </Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      {formatTimestamp(message.timestamp)}
                    </Text>
                  </Box>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[100],
                      lineHeight: 1.5,
                    }}
                  >
                    {message.message}
                  </Text>
                </Box>
              );
            })
          )}
        </Box>

        {/* Quick Response Buttons */}
        <Box
          style={{
            padding: tokens.spacing[4],
            backgroundColor: tokens.colors.neutral[800],
            borderTop: `1px solid ${tokens.colors.neutral[700]}`,
            borderBottom: `1px solid ${tokens.colors.neutral[700]}`,
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[400],
              marginBottom: tokens.spacing[3],
            }}
          >
            Quick Responses
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: tokens.spacing[2],
            }}
          >
            {['10-4', 'Need backup', 'On my way', 'Copy'].map((response) => (
              <Box
                key={response}
                onClick={() => handleQuickResponse(response)}
                style={{
                  padding: tokens.spacing[3],
                  backgroundColor: tokens.colors.neutral[700],
                  color: tokens.colors.neutral[100],
                  borderRadius: tokens.borderRadius.md,
                  textAlign: 'center',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  cursor: 'pointer',
                  ...createHoverStyle(tokens),
                }}
              >
                {response}
              </Box>
            ))}
          </Box>
        </Box>

        {/* PTT Button */}
        <Box
          style={{
            padding: tokens.spacing[6],
            backgroundColor: tokens.colors.neutral[800],
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: tokens.spacing[3],
          }}
        >
          <Box
            onMouseDown={() => setIsPTTPressed(true)}
            onMouseUp={() => setIsPTTPressed(false)}
            onMouseLeave={() => setIsPTTPressed(false)}
            onTouchStart={() => setIsPTTPressed(true)}
            onTouchEnd={() => setIsPTTPressed(false)}
            style={{
              width: '200px',
              height: '200px',
              borderRadius: tokens.borderRadius.full,
              backgroundColor: isPTTPressed
                ? tokens.colors.errorScale[600]
                : tokens.colors.errorScale[500],
              border: `8px solid ${isPTTPressed ? tokens.colors.errorScale[400] : tokens.colors.errorScale[600]}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              userSelect: 'none',
              boxShadow: isPTTPressed
                ? `0 0 40px ${tokens.colors.errorScale[500]}`
                : '0 8px 24px rgba(0,0,0,0.3)',
              animation: isPTTPressed ? 'ptt-pulse 0.5s ease-in-out infinite' : 'none',
              transition: 'all 0.1s ease',
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize['3xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.common.white,
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              {isPTTPressed ? 'TRANSMITTING' : 'PUSH TO TALK'}
            </Text>
          </Box>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              textAlign: 'center',
            }}
          >
            {isPTTPressed ? 'Release to stop transmitting' : 'Press and hold to transmit'}
          </Text>
        </Box>

        {/* Channel Switcher */}
        <Box
          style={{
            padding: tokens.spacing[4],
            backgroundColor: tokens.colors.neutral[800],
            borderTop: `1px solid ${tokens.colors.neutral[700]}`,
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[400],
              marginBottom: tokens.spacing[3],
            }}
          >
            Switch Channel
          </Text>
          <Box
            style={{
              display: 'flex',
              gap: tokens.spacing[2],
              overflowX: 'auto',
            }}
          >
            {channels.map((channel) => {
              const isActive = channel.id === activeChannelId;

              return (
                <Box
                  key={channel.id}
                  onClick={() => handleChannelSwitch(channel.id)}
                  style={{
                    padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                    backgroundColor: isActive
                      ? tokens.colors.primaryScale[600]
                      : tokens.colors.neutral[700],
                    color: isActive
                      ? tokens.colors.common.white
                      : tokens.colors.neutral[300],
                    borderRadius: tokens.borderRadius.md,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    border: isActive
                      ? `2px solid ${tokens.colors.primaryScale[400]}`
                      : '2px solid transparent',
                    ...createHoverStyle(tokens),
                  }}
                >
                  <Text style={{ fontSize: tokens.typography.fontSize.sm }}>
                    {getChannelEmoji(channel.type)}
                  </Text>
                  <Text>{channel.name}</Text>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  },
});
