'use client';

import { createPreset, type PresetContext } from '../../../factory';
import React from 'react';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createListItemStyle,
} from '../../../helpers';
import type { EvIncidentManagerProps, Incident } from '../../core';

// Mock data for standalone demo
const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    type: 'security',
    severity: 'critical',
    title: 'Altercation in VIP Section',
    description: 'Multiple individuals involved in physical altercation near VIP bar',
    location: 'VIP Lounge - Section A',
    reportedBy: 'Security Alpha-3',
    assignedTo: 'Security Team Lead',
    status: 'in-progress',
    reportedAt: new Date(Date.now() - 1000 * 60 * 12),
    actions: [
      {
        id: 'act-1',
        action: 'Incident reported',
        performedBy: 'Security Alpha-3',
        timestamp: new Date(Date.now() - 1000 * 60 * 12),
      },
      {
        id: 'act-2',
        action: 'Team dispatched',
        performedBy: 'Security Team Lead',
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
      },
      {
        id: 'act-3',
        action: 'Officers on scene',
        performedBy: 'Alpha-3, Alpha-7',
        timestamp: new Date(Date.now() - 1000 * 60 * 8),
      },
    ],
  },
  {
    id: 'inc-2',
    type: 'medical',
    severity: 'high',
    title: 'Patron Requiring Medical Attention',
    description: 'Individual experiencing chest pain, EMS requested',
    location: 'General Admission - Zone 3',
    reportedBy: 'Medical Staff B',
    assignedTo: 'EMT Unit 2',
    status: 'dispatched',
    reportedAt: new Date(Date.now() - 1000 * 60 * 5),
    actions: [
      {
        id: 'act-4',
        action: 'Medical emergency reported',
        performedBy: 'Medical Staff B',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
      },
      {
        id: 'act-5',
        action: 'EMT Unit 2 dispatched',
        performedBy: 'Medical Coordinator',
        timestamp: new Date(Date.now() - 1000 * 60 * 3),
      },
    ],
  },
  {
    id: 'inc-3',
    type: 'maintenance',
    severity: 'high',
    title: 'Stage Equipment Malfunction',
    description: 'Main stage lighting rig showing electrical issues',
    location: 'Main Stage - Rigging',
    reportedBy: 'Stage Manager',
    assignedTo: 'Technical Crew',
    status: 'in-progress',
    reportedAt: new Date(Date.now() - 1000 * 60 * 25),
    actions: [
      {
        id: 'act-6',
        action: 'Issue identified',
        performedBy: 'Stage Manager',
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
      },
      {
        id: 'act-7',
        action: 'Technical crew dispatched',
        performedBy: 'Operations',
        timestamp: new Date(Date.now() - 1000 * 60 * 22),
      },
      {
        id: 'act-8',
        action: 'Power isolated, diagnostics in progress',
        performedBy: 'Tech Lead',
        timestamp: new Date(Date.now() - 1000 * 60 * 18),
      },
    ],
  },
  {
    id: 'inc-4',
    type: 'crowd',
    severity: 'medium',
    title: 'Crowd Density Warning',
    description: 'Zone 2 approaching capacity limits',
    location: 'General Admission - Zone 2',
    reportedBy: 'Crowd Monitor System',
    status: 'reported',
    reportedAt: new Date(Date.now() - 1000 * 60 * 3),
    actions: [
      {
        id: 'act-9',
        action: 'Automated alert triggered',
        performedBy: 'System',
        timestamp: new Date(Date.now() - 1000 * 60 * 3),
      },
    ],
  },
  {
    id: 'inc-5',
    type: 'security',
    severity: 'medium',
    title: 'Suspicious Bag Reported',
    description: 'Unattended bag near food court area',
    location: 'Food Court - East Side',
    reportedBy: 'Patron Services',
    assignedTo: 'Security Beta-5',
    status: 'in-progress',
    reportedAt: new Date(Date.now() - 1000 * 60 * 8),
    actions: [
      {
        id: 'act-10',
        action: 'Report received',
        performedBy: 'Patron Services',
        timestamp: new Date(Date.now() - 1000 * 60 * 8),
      },
      {
        id: 'act-11',
        action: 'Security dispatched',
        performedBy: 'Security Coordinator',
        timestamp: new Date(Date.now() - 1000 * 60 * 6),
      },
      {
        id: 'act-12',
        action: 'Area cordoned, investigation underway',
        performedBy: 'Beta-5',
        timestamp: new Date(Date.now() - 1000 * 60 * 4),
      },
    ],
  },
  {
    id: 'inc-6',
    type: 'maintenance',
    severity: 'low',
    title: 'Restroom Facilities Issue',
    description: 'Plumbing issue in north restroom block',
    location: 'Restrooms - North Wing',
    reportedBy: 'Facilities',
    assignedTo: 'Maintenance Team',
    status: 'resolved',
    reportedAt: new Date(Date.now() - 1000 * 60 * 45),
    resolvedAt: new Date(Date.now() - 1000 * 60 * 20),
    actions: [
      {
        id: 'act-13',
        action: 'Issue reported',
        performedBy: 'Facilities',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
      },
      {
        id: 'act-14',
        action: 'Maintenance dispatched',
        performedBy: 'Facilities Manager',
        timestamp: new Date(Date.now() - 1000 * 60 * 40),
      },
      {
        id: 'act-15',
        action: 'Issue resolved',
        performedBy: 'Maintenance Team',
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
      },
    ],
  },
];

export const DispatchEvIncidentManager = createPreset<EvIncidentManagerProps>({
  name: 'EvIncidentManager.Dispatch',
  render: (ctx: PresetContext<EvIncidentManagerProps>) => {
    const { primitives, props, tokens } = ctx;
    const { Box, Text } = primitives;

    const incidents = props.incidents || MOCK_INCIDENTS;
    const [selectedId, setSelectedId] = React.useState<string | null>(
      incidents.length > 0 ? incidents[0].id : null
    );

    const selectedIncident = incidents.find((inc) => inc.id === selectedId);

    const getSeverityColor = (severity: Incident['severity']) => {
      switch (severity) {
        case 'critical':
          return tokens.colors.errorScale;
        case 'high':
          return tokens.colors.warningScale;
        case 'medium':
          return tokens.colors.infoScale;
        default:
          return tokens.colors.neutral;
      }
    };

    const getStatusBadgeVariant = (
      status: Incident['status']
    ): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' => {
      switch (status) {
        case 'reported':
          return 'secondary';
        case 'dispatched':
          return 'primary';
        case 'in-progress':
          return 'warning';
        case 'resolved':
          return 'success';
        case 'escalated':
          return 'error';
        default:
          return 'secondary';
      }
    };

    const getTypeIcon = (type: Incident['type']) => {
      switch (type) {
        case 'security':
          return '🛡️';
        case 'medical':
          return '⚕️';
        case 'maintenance':
          return '🔧';
        case 'fire':
          return '🔥';
        case 'crowd':
          return '👥';
        default:
          return '⚠️';
      }
    };

    const formatTimestamp = (date: Date) => {
      const now = Date.now();
      const diff = now - date.getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      return `${hours}h ${minutes % 60}m ago`;
    };

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    // Sort by severity and time
    const sortedIncidents = [...incidents].sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.reportedAt.getTime() - a.reportedAt.getTime();
    });

    return (
      <Box
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: tokens.colors.neutral[50],
          overflow: 'hidden',
        }}
      >
        {/* Left Panel - Incident List */}
        <Box
          style={{
            width: '380px',
            borderRight: `1px solid ${tokens.colors.neutral[200]}`,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: tokens.colors.common.white,
          }}
        >
          {/* Header */}
          <Box
            style={{
              padding: tokens.spacing[4],
              borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                marginBottom: tokens.spacing[2],
              }}
            >
              Incident Manager
            </Text>
            <Box
              style={{
                display: 'flex',
                gap: tokens.spacing[3],
                fontSize: tokens.typography.fontSize.sm,
              }}
            >
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <Box
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.errorScale[500],
                  }}
                />
                <Text style={{ color: tokens.colors.neutral[600] }}>
                  {incidents.filter((i) => i.severity === 'critical').length} Critical
                </Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <Box
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.warningScale[500],
                  }}
                />
                <Text style={{ color: tokens.colors.neutral[600] }}>
                  {incidents.filter((i) => i.severity === 'high').length} High
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Incident List */}
          <Box
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {sortedIncidents.map((incident) => {
              const isSelected = incident.id === selectedId;
              const severityColors = getSeverityColor(incident.severity);

              return (
                <Box
                  key={incident.id}
                  onClick={() => {
                    setSelectedId(incident.id);
                    props.onIncidentClick?.(incident.id);
                  }}
                  style={{
                    ...createListItemStyle(tokens, { active: isSelected }),
                    padding: tokens.spacing[3],
                    borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
                    borderLeft: `4px solid ${severityColors[500]}`,
                    cursor: 'pointer',
                  }}
                >
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: tokens.spacing[2],
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.lg }}>
                        {getTypeIcon(incident.type)}
                      </Text>
                      <Box>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.neutral[900],
                          }}
                        >
                          {incident.title}
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[600],
                      marginBottom: tokens.spacing[2],
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {incident.description}
                  </Text>
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box
                      style={{
                        ...createBadgeStyle(tokens, getStatusBadgeVariant(incident.status)),
                        fontSize: tokens.typography.fontSize.xs,
                      }}
                    >
                      {incident.status.replace('-', ' ').toUpperCase()}
                    </Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      {formatTimestamp(incident.reportedAt)}
                    </Text>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Right Panel - Incident Details */}
        <Box
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {selectedIncident ? (
            <>
              {/* Details Header */}
              <Box
                style={{
                  padding: tokens.spacing[4],
                  borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
                  backgroundColor: tokens.colors.common.white,
                }}
              >
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  <Box style={{ flex: 1 }}>
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        marginBottom: tokens.spacing[2],
                      }}
                    >
                      <Text style={{ fontSize: tokens.typography.fontSize['2xl'] }}>
                        {getTypeIcon(selectedIncident.type)}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize['2xl'],
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.neutral[900],
                        }}
                      >
                        {selectedIncident.title}
                      </Text>
                    </Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                        lineHeight: 1.5,
                        marginBottom: tokens.spacing[3],
                      }}
                    >
                      {selectedIncident.description}
                    </Text>
                  </Box>
                  <Box
                    style={{
                      ...createBadgeStyle(
                        tokens,
                        getStatusBadgeVariant(selectedIncident.status)
                      ),
                      marginLeft: tokens.spacing[3],
                    }}
                  >
                    {selectedIncident.status.replace('-', ' ').toUpperCase()}
                  </Box>
                </Box>

                {/* Info Grid */}
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: tokens.spacing[3],
                    padding: tokens.spacing[3],
                    backgroundColor: tokens.colors.neutral[50],
                    borderRadius: tokens.borderRadius.md,
                  }}
                >
                  <Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[600],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      Location
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {selectedIncident.location}
                    </Text>
                  </Box>
                  <Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[600],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      Severity
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: getSeverityColor(selectedIncident.severity)[700],
                      }}
                    >
                      {selectedIncident.severity.toUpperCase()}
                    </Text>
                  </Box>
                  <Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[600],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      Reported By
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {selectedIncident.reportedBy}
                    </Text>
                  </Box>
                  <Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[600],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      Assigned To
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {selectedIncident.assignedTo || 'Unassigned'}
                    </Text>
                  </Box>
                </Box>
              </Box>

              {/* Action Timeline */}
              <Box
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: tokens.spacing[4],
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                    marginBottom: tokens.spacing[4],
                  }}
                >
                  Action Timeline
                </Text>
                <Box
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: tokens.spacing[3],
                  }}
                >
                  {selectedIncident.actions.map((action, index) => (
                    <Box
                      key={action.id}
                      style={{
                        display: 'flex',
                        gap: tokens.spacing[3],
                        position: 'relative',
                      }}
                    >
                      {/* Timeline line */}
                      {index < selectedIncident.actions.length - 1 && (
                        <Box
                          style={{
                            position: 'absolute',
                            left: '11px',
                            top: '24px',
                            bottom: '-16px',
                            width: '2px',
                            backgroundColor: tokens.colors.neutral[200],
                          }}
                        />
                      )}
                      {/* Timeline dot */}
                      <Box
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.primaryScale[500],
                          border: `3px solid ${tokens.colors.common.white}`,
                          boxShadow: `0 0 0 1px ${tokens.colors.neutral[200]}`,
                          flexShrink: 0,
                          zIndex: 1,
                        }}
                      />
                      {/* Action content */}
                      <Box style={{ flex: 1, paddingBottom: tokens.spacing[3] }}>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.neutral[900],
                            marginBottom: tokens.spacing[1],
                          }}
                        >
                          {action.action}
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[600],
                          }}
                        >
                          {action.performedBy}
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                            marginTop: tokens.spacing[1],
                          }}
                        >
                          {formatTime(action.timestamp)} ({formatTimestamp(action.timestamp)})
                        </Text>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </>
          ) : (
            <Box
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: tokens.colors.neutral[500],
              }}
            >
              <Text>Select an incident to view details</Text>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
