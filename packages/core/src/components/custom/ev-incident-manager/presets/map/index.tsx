'use client';

import { createPreset, type PresetContext } from '../../../factory';
import React from 'react';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
} from '../../../helpers';
import type { EvIncidentManagerProps, Incident } from '../../core';

// Mock data for standalone demo with map positions
const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    type: 'security',
    severity: 'critical',
    title: 'Altercation in VIP Section',
    description: 'Multiple individuals involved in physical altercation',
    location: 'VIP Lounge - Section A',
    x: 75,
    y: 20,
    reportedBy: 'Security Alpha-3',
    assignedTo: 'Security Team Lead',
    status: 'in-progress',
    reportedAt: new Date(Date.now() - 1000 * 60 * 12),
    actions: [],
  },
  {
    id: 'inc-2',
    type: 'medical',
    severity: 'high',
    title: 'Medical Emergency',
    description: 'Patron experiencing chest pain',
    location: 'General Admission - Zone 3',
    x: 45,
    y: 65,
    reportedBy: 'Medical Staff B',
    assignedTo: 'EMT Unit 2',
    status: 'dispatched',
    reportedAt: new Date(Date.now() - 1000 * 60 * 5),
    actions: [],
  },
  {
    id: 'inc-3',
    type: 'maintenance',
    severity: 'high',
    title: 'Stage Equipment Issue',
    description: 'Lighting rig malfunction',
    location: 'Main Stage',
    x: 50,
    y: 15,
    reportedBy: 'Stage Manager',
    assignedTo: 'Technical Crew',
    status: 'in-progress',
    reportedAt: new Date(Date.now() - 1000 * 60 * 25),
    actions: [],
  },
  {
    id: 'inc-4',
    type: 'crowd',
    severity: 'medium',
    title: 'Crowd Density Warning',
    description: 'Zone 2 approaching capacity',
    location: 'GA Zone 2',
    x: 30,
    y: 45,
    reportedBy: 'System',
    status: 'reported',
    reportedAt: new Date(Date.now() - 1000 * 60 * 3),
    actions: [],
  },
  {
    id: 'inc-5',
    type: 'security',
    severity: 'medium',
    title: 'Suspicious Bag',
    description: 'Unattended bag reported',
    location: 'Food Court',
    x: 20,
    y: 75,
    reportedBy: 'Patron Services',
    assignedTo: 'Security Beta-5',
    status: 'in-progress',
    reportedAt: new Date(Date.now() - 1000 * 60 * 8),
    actions: [],
  },
  {
    id: 'inc-6',
    type: 'maintenance',
    severity: 'low',
    title: 'Restroom Issue',
    description: 'Plumbing issue reported',
    location: 'North Restrooms',
    x: 85,
    y: 80,
    reportedBy: 'Facilities',
    assignedTo: 'Maintenance',
    status: 'resolved',
    reportedAt: new Date(Date.now() - 1000 * 60 * 45),
    resolvedAt: new Date(Date.now() - 1000 * 60 * 20),
    actions: [],
  },
];

export const MapEvIncidentManager = createPreset<EvIncidentManagerProps>({
  name: 'EvIncidentManager.Map',
  render: (ctx: PresetContext<EvIncidentManagerProps>) => {
    const { primitives, props, tokens } = ctx;
    const { Box, Text } = primitives;

    const incidents = props.incidents || MOCK_INCIDENTS;
    const [selectedId, setSelectedId] = React.useState<string | null>(null);

    const selectedIncident = incidents.find((inc) => inc.id === selectedId);

    const getSeverityColor = (severity: Incident['severity']) => {
      switch (severity) {
        case 'critical':
          return tokens.colors.errorScale[500];
        case 'high':
          return tokens.colors.warningScale[500];
        case 'medium':
          return tokens.colors.infoScale[500];
        default:
          return tokens.colors.neutral[500];
      }
    };

    const getPinSize = (severity: Incident['severity']) => {
      switch (severity) {
        case 'critical':
          return 24;
        case 'high':
          return 20;
        case 'medium':
          return 16;
        default:
          return 14;
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

    const formatTimestamp = (date: Date) => {
      const now = Date.now();
      const diff = now - date.getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      return `${hours}h ${minutes % 60}m ago`;
    };

    const activeIncidents = incidents.filter((i) => i.status !== 'resolved');
    const resolvedIncidents = incidents.filter((i) => i.status === 'resolved');
    const avgResponseTime = '8m 23s';

    // Pulsing animation for critical pins
    const pulseKeyframes = `
      @keyframes pulse-pin {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.8; }
      }
    `;

    return (
      <Box
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: tokens.colors.neutral[50],
          overflow: 'hidden',
        }}
      >
        <style>{pulseKeyframes}</style>

        {/* Header with Stats */}
        <Box
          style={{
            padding: tokens.spacing[4],
            backgroundColor: tokens.colors.common.white,
            borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
          }}
        >
          <Box
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: tokens.spacing[3],
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              Incident Map
            </Text>
            <Box style={{ display: 'flex', gap: tokens.spacing[4] }}>
              <Box style={{ textAlign: 'center' }}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize['2xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.errorScale[600],
                  }}
                >
                  {activeIncidents.length}
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[600],
                  }}
                >
                  Active
                </Text>
              </Box>
              <Box style={{ textAlign: 'center' }}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize['2xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.successScale[600],
                  }}
                >
                  {resolvedIncidents.length}
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[600],
                  }}
                >
                  Resolved
                </Text>
              </Box>
              <Box style={{ textAlign: 'center' }}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize['2xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.primaryScale[600],
                  }}
                >
                  {avgResponseTime}
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[600],
                  }}
                >
                  Avg Response
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Legend */}
          <Box
            style={{
              display: 'flex',
              gap: tokens.spacing[4],
              padding: tokens.spacing[3],
              backgroundColor: tokens.colors.neutral[50],
              borderRadius: tokens.borderRadius.md,
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Box
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.errorScale[500],
                }}
              />
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[700],
                }}
              >
                Critical
              </Text>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Box
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.warningScale[500],
                }}
              />
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[700],
                }}
              >
                High
              </Text>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Box
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.infoScale[500],
                }}
              />
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[700],
                }}
              >
                Medium
              </Text>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Box
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.neutral[400],
                }}
              />
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[700],
                }}
              >
                Low
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Map Area */}
        <Box
          style={{
            flex: 1,
            display: 'flex',
            gap: tokens.spacing[4],
            padding: tokens.spacing[4],
            overflow: 'hidden',
          }}
        >
          {/* Venue Map */}
          <Box
            style={{
              flex: 1,
              ...createCardStyle(tokens),
              position: 'relative',
              backgroundColor: tokens.colors.neutral[100],
              overflow: 'hidden',
            }}
          >
            {/* Grid background */}
            <Box
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                  linear-gradient(${tokens.colors.neutral[200]} 1px, transparent 1px),
                  linear-gradient(90deg, ${tokens.colors.neutral[200]} 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
              }}
            />

            {/* Venue zones */}
            <Box
              style={{
                position: 'absolute',
                left: '40%',
                top: '10%',
                width: '20%',
                height: '15%',
                backgroundColor: `${tokens.colors.primaryScale[100]}80`,
                border: `2px solid ${tokens.colors.primaryScale[300]}`,
                borderRadius: tokens.borderRadius.md,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.primaryScale[700],
                }}
              >
                Main Stage
              </Text>
            </Box>

            <Box
              style={{
                position: 'absolute',
                left: '70%',
                top: '15%',
                width: '20%',
                height: '20%',
                backgroundColor: `${tokens.colors.secondaryScale[100]}80`,
                border: `2px solid ${tokens.colors.secondaryScale[300]}`,
                borderRadius: tokens.borderRadius.md,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.secondaryScale[700],
                }}
              >
                VIP
              </Text>
            </Box>

            <Box
              style={{
                position: 'absolute',
                left: '10%',
                top: '70%',
                width: '25%',
                height: '20%',
                backgroundColor: `${tokens.colors.neutral[200]}80`,
                border: `2px solid ${tokens.colors.neutral[400]}`,
                borderRadius: tokens.borderRadius.md,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[700],
                }}
              >
                Food Court
              </Text>
            </Box>

            {/* Incident Pins */}
            {incidents.map((incident) => {
              if (incident.x === undefined || incident.y === undefined) return null;

              const pinSize = getPinSize(incident.severity);
              const severityColor = getSeverityColor(incident.severity);
              const isCritical = incident.severity === 'critical';
              const isSelected = incident.id === selectedId;

              return (
                <Box
                  key={incident.id}
                  onClick={() => {
                    setSelectedId(incident.id);
                    props.onIncidentClick?.(incident.id);
                  }}
                  style={{
                    position: 'absolute',
                    left: `${incident.x}%`,
                    top: `${incident.y}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    zIndex: isSelected ? 10 : 1,
                  }}
                >
                  <Box
                    style={{
                      width: `${pinSize}px`,
                      height: `${pinSize}px`,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: severityColor,
                      border: `3px solid ${tokens.colors.common.white}`,
                      boxShadow: isSelected
                        ? `0 0 0 4px ${severityColor}40, 0 4px 12px rgba(0,0,0,0.2)`
                        : `0 2px 6px rgba(0,0,0,0.15)`,
                      animation: isCritical ? 'pulse-pin 2s ease-in-out infinite' : 'none',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      ...createHoverStyle(tokens),
                    }}
                  />
                  {isSelected && (
                    <Box
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginTop: tokens.spacing[2],
                        minWidth: '200px',
                        ...createCardStyle(tokens, { elevation: 'lg' }),
                        padding: tokens.spacing[2],
                        backgroundColor: tokens.colors.common.white,
                        pointerEvents: 'none',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[900],
                          marginBottom: tokens.spacing[1],
                        }}
                      >
                        {incident.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[600],
                        }}
                      >
                        {incident.location}
                      </Text>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Incident Detail Panel */}
          {selectedIncident && (
            <Box
              style={{
                width: '320px',
                ...createCardStyle(tokens),
                padding: tokens.spacing[4],
                display: 'flex',
                flexDirection: 'column',
                gap: tokens.spacing[3],
                overflow: 'auto',
              }}
            >
              <Box
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                  }}
                >
                  Incident Details
                </Text>
                <Box
                  onClick={() => setSelectedId(null)}
                  style={{
                    cursor: 'pointer',
                    color: tokens.colors.neutral[500],
                    fontSize: tokens.typography.fontSize.lg,
                    ...createHoverStyle(tokens),
                  }}
                >
                  ✕
                </Box>
              </Box>

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
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
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
                }}
              >
                {selectedIncident.description}
              </Text>

              <Box
                style={{
                  padding: tokens.spacing[3],
                  backgroundColor: tokens.colors.neutral[50],
                  borderRadius: tokens.borderRadius.md,
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
                    }}
                  >
                    Severity
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: getSeverityColor(selectedIncident.severity),
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
                    }}
                  >
                    Status
                  </Text>
                  <Box style={{ marginTop: tokens.spacing[1] }}>
                    <Box
                      style={{
                        ...createBadgeStyle(
                          tokens,
                          getStatusBadgeVariant(selectedIncident.status)
                        ),
                        display: 'inline-block',
                      }}
                    >
                      {selectedIncident.status.replace('-', ' ').toUpperCase()}
                    </Box>
                  </Box>
                </Box>
                <Box>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[600],
                    }}
                  >
                    Reported
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[900],
                    }}
                  >
                    {formatTimestamp(selectedIncident.reportedAt)}
                  </Text>
                </Box>
                <Box>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[600],
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
                {selectedIncident.assignedTo && (
                  <Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[600],
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
                      {selectedIncident.assignedTo}
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
