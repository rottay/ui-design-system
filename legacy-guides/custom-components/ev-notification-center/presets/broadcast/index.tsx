'use client';

import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createHoverStyle, createBadgeStyle } from '../../../helpers';
import type { NotificationCenterProps, BroadcastMessage } from '../../core';

// Mock data for standalone demo
const MOCK_BROADCASTS: BroadcastMessage[] = [
  {
    id: '1',
    title: 'Spring Sale Announcement',
    body: 'Get ready for our biggest sale of the season! 20% off all items for the next 48 hours.',
    audience: 'All Active Users',
    channels: ['push', 'email', 'in-app'],
    sentAt: new Date('2026-02-09T09:00:00'),
    status: 'sent',
  },
  {
    id: '2',
    title: 'Weekend Schedule Changes',
    body: 'Please note the updated operating hours this weekend: Saturday 8am-10pm, Sunday 9am-8pm.',
    audience: 'Staff Members',
    channels: ['email', 'sms'],
    scheduledAt: new Date('2026-02-12T18:00:00'),
    status: 'scheduled',
  },
  {
    id: '3',
    title: 'System Maintenance Notice',
    body: 'The platform will undergo scheduled maintenance on Feb 15 from 2:00 AM to 4:00 AM.',
    audience: 'All Users',
    channels: ['push', 'email', 'in-app', 'sms'],
    scheduledAt: new Date('2026-02-14T20:00:00'),
    status: 'scheduled',
  },
  {
    id: '4',
    title: 'New Menu Items Launch',
    body: 'Exciting news! We\'re launching 5 new seasonal beverages. Check them out in the menu.',
    audience: 'VIP Customers',
    channels: ['push', 'in-app'],
    status: 'draft',
  },
];

export const NotificationCenterBroadcast = createPreset<NotificationCenterProps>({
  name: 'NotificationCenter.Broadcast',
  render: (ctx: PresetContext<NotificationCenterProps>) => {
    const { primitives, props, tokens, engine } = ctx;
    const { Box, Text } = primitives;

    const broadcasts = props.broadcasts || MOCK_BROADCASTS;

    const getStatusColor = (status: BroadcastMessage['status']) => {
      switch (status) {
        case 'sent':
          return tokens.colors.successScale;
        case 'scheduled':
          return tokens.colors.infoScale;
        case 'draft':
          return tokens.colors.secondaryScale;
        default:
          return tokens.colors.primaryScale;
      }
    };

    const getChannelIcon = (channel: string) => {
      switch (channel) {
        case 'push':
          return '🔔';
        case 'email':
          return '✉️';
        case 'sms':
          return '📱';
        case 'in-app':
          return '💬';
        default:
          return '📢';
      }
    };

    const formatDate = (date?: Date) => {
      if (!date) return 'Not scheduled';
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(date);
    };

    const draftBroadcasts = broadcasts.filter((b) => b.status === 'draft');
    const scheduledBroadcasts = broadcasts.filter((b) => b.status === 'scheduled');
    const sentBroadcasts = broadcasts.filter((b) => b.status === 'sent');

    const audienceOptions = ['All Users', 'All Active Users', 'Staff Members', 'VIP Customers', 'New Users'];
    const channelOptions = ['push', 'email', 'sms', 'in-app'];

    return (
      <Box
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[4],
          padding: tokens.spacing[6],
          backgroundColor: tokens.colors.neutral[50],
        }}
      >
        {/* Header */}
        <Box>
          <Text
            style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[700],
            }}
          >
            Broadcast Center
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              marginTop: tokens.spacing[1],
            }}
          >
            Send announcements and messages to your users
          </Text>
        </Box>

        {/* Stats */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: tokens.spacing[3],
          }}
        >
          {[
            { label: 'Sent', value: sentBroadcasts.length, icon: '✓', color: tokens.colors.successScale },
            { label: 'Scheduled', value: scheduledBroadcasts.length, icon: '🗓️', color: tokens.colors.infoScale },
            { label: 'Drafts', value: draftBroadcasts.length, icon: '📝', color: tokens.colors.secondaryScale },
          ].map((stat) => (
            <Box
              key={stat.label}
              style={{
                ...createCardStyle(tokens),
                padding: tokens.spacing[4],
                backgroundColor: stat.color[50],
                borderColor: stat.color[200],
              }}
            >
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xl }}>{stat.icon}</Text>
                <Box>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                    }}
                  >
                    {stat.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize['2xl'],
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: stat.color[700],
                      marginTop: tokens.spacing[1],
                    }}
                  >
                    {stat.value}
                  </Text>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Compose Broadcast Form */}
        <Box
          style={{
            ...createCardStyle(tokens),
            padding: tokens.spacing[6],
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
              marginBottom: tokens.spacing[4],
            }}
          >
            Compose Broadcast
          </Text>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
            {/* Title */}
            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[700],
                  marginBottom: tokens.spacing[1],
                }}
              >
                Title
              </Text>
              <Box
                style={{
                  ...createCardStyle(tokens),
                  padding: tokens.spacing[3],
                  backgroundColor: tokens.colors.common.white,
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[500],
                  }}
                >
                  Enter broadcast title...
                </Text>
              </Box>
            </Box>

            {/* Body */}
            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[700],
                  marginBottom: tokens.spacing[1],
                }}
              >
                Message
              </Text>
              <Box
                style={{
                  ...createCardStyle(tokens),
                  padding: tokens.spacing[3],
                  backgroundColor: tokens.colors.common.white,
                  minHeight: '100px',
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[500],
                  }}
                >
                  Enter your message...
                </Text>
              </Box>
            </Box>

            {/* Audience */}
            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[700],
                  marginBottom: tokens.spacing[1],
                }}
              >
                Audience
              </Text>
              <Box style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' }}>
                {audienceOptions.map((option) => (
                  <Box
                    key={option}
                    style={{
                      ...createCardStyle(tokens),
                      padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                      backgroundColor: tokens.colors.neutral[100],
                      cursor: 'pointer',
                      ...createHoverStyle(tokens),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                      }}
                    >
                      {option}
                    </Text>
                  </Box>
                ))}
              </Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  marginTop: tokens.spacing[1],
                }}
              >
                Estimated reach: 1,250 users
              </Text>
            </Box>

            {/* Channels */}
            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[700],
                  marginBottom: tokens.spacing[1],
                }}
              >
                Channels
              </Text>
              <Box style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' }}>
                {channelOptions.map((channel) => (
                  <Box
                    key={channel}
                    style={{
                      ...createCardStyle(tokens),
                      padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                      backgroundColor: tokens.colors.neutral[100],
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      ...createHoverStyle(tokens),
                    }}
                  >
                    <Text style={{ fontSize: tokens.typography.fontSize.sm }}>
                      {getChannelIcon(channel)}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                        textTransform: 'capitalize',
                      }}
                    >
                      {channel}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Schedule */}
            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[700],
                  marginBottom: tokens.spacing[1],
                }}
              >
                Schedule
              </Text>
              <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
                <Box
                  style={{
                    ...createCardStyle(tokens),
                    padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                    backgroundColor: tokens.colors.primaryScale[50],
                    borderColor: tokens.colors.primaryScale[200],
                    cursor: 'pointer',
                    ...createHoverStyle(tokens),
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.primaryScale[700],
                      fontWeight: tokens.typography.fontWeight.medium,
                    }}
                  >
                    Send Now
                  </Text>
                </Box>
                <Box
                  style={{
                    ...createCardStyle(tokens),
                    padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                    backgroundColor: tokens.colors.neutral[100],
                    cursor: 'pointer',
                    ...createHoverStyle(tokens),
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[700],
                      fontWeight: tokens.typography.fontWeight.medium,
                    }}
                  >
                    Schedule for Later
                  </Text>
                </Box>
                <Box
                  style={{
                    ...createCardStyle(tokens),
                    padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                    backgroundColor: tokens.colors.neutral[100],
                    cursor: 'pointer',
                    ...createHoverStyle(tokens),
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[700],
                      fontWeight: tokens.typography.fontWeight.medium,
                    }}
                  >
                    Save Draft
                  </Text>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Recent Broadcasts */}
        <Box
          style={{
            ...createCardStyle(tokens),
            padding: tokens.spacing[6],
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
              marginBottom: tokens.spacing[4],
            }}
          >
            Recent Broadcasts
          </Text>
          <Box style={{ flex: 1, overflowY: 'auto' }}>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
              {broadcasts.map((broadcast) => {
                const statusColor = getStatusColor(broadcast.status);

                return (
                  <Box
                    key={broadcast.id}
                    style={{
                      ...createCardStyle(tokens),
                      padding: tokens.spacing[4],
                      backgroundColor: tokens.colors.neutral[100],
                      cursor: 'pointer',
                      ...createHoverStyle(tokens),
                    }}
                    onClick={() => props.onSendBroadcast?.(broadcast.id)}
                  >
                    <Box
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: tokens.spacing[2],
                      }}
                    >
                      <Box style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.neutral[700],
                          }}
                        >
                          {broadcast.title}
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[500],
                            marginTop: tokens.spacing[1],
                          }}
                        >
                          {broadcast.body}
                        </Text>
                      </Box>
                      <Box
                        style={{
                          ...createBadgeStyle(tokens, broadcast.status === 'sent' ? 'success' : broadcast.status === 'scheduled' ? 'info' : 'secondary'),
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            textTransform: 'capitalize',
                          }}
                        >
                          {broadcast.status}
                        </Text>
                      </Box>
                    </Box>

                    <Box
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: tokens.spacing[3],
                        paddingTop: tokens.spacing[3],
                        borderTop: `1px solid ${tokens.colors.neutral[200]}`,
                      }}
                    >
                      <Box>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                          }}
                        >
                          Audience: {broadcast.audience}
                        </Text>
                        <Box
                          style={{
                            display: 'flex',
                            gap: tokens.spacing[1],
                            marginTop: tokens.spacing[1],
                          }}
                        >
                          {broadcast.channels.map((channel) => (
                            <Box
                              key={channel}
                              style={{
                                ...createCardStyle(tokens),
                                padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                                backgroundColor: tokens.colors.neutral[50],
                                display: 'flex',
                                alignItems: 'center',
                                gap: tokens.spacing[1],
                              }}
                            >
                              <Text style={{ fontSize: tokens.typography.fontSize.xs }}>
                                {getChannelIcon(channel)}
                              </Text>
                              <Text
                                style={{
                                  fontSize: tokens.typography.fontSize.xs,
                                  color: tokens.colors.neutral[700],
                                  textTransform: 'capitalize',
                                }}
                              >
                                {channel}
                              </Text>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                      <Box style={{ textAlign: 'right' }}>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                          }}
                        >
                          {broadcast.status === 'sent' ? 'Sent:' : 'Scheduled:'}
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[700],
                            marginTop: tokens.spacing[1],
                          }}
                        >
                          {formatDate(broadcast.sentAt || broadcast.scheduledAt)}
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
