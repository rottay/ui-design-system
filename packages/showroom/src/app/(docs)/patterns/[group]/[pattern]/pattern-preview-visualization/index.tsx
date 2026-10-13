'use client';

import {
  AsciiDiagram,
  type DiagramEdge,
  type DiagramNode,
} from '@rottay/design-system';

const DIAGRAM_NODES: DiagramNode[] = [
  { id: 'client', label: 'CLIENT', col: 1, row: 0 },
  { id: 'gateway', label: 'API GATEWAY', col: 1, row: 1, emphasis: true },
  { id: 'auth', label: 'AUTH', col: 0, row: 2 },
  { id: 'core', label: 'CORE SERVICES', col: 1, row: 2 },
  { id: 'events', label: 'EVENTS', col: 2, row: 2 },
];

const DIAGRAM_EDGES: DiagramEdge[] = [
  { from: 'client', to: 'gateway' },
  { from: 'gateway', to: 'auth', label: 'verify' },
  { from: 'gateway', to: 'core' },
  { from: 'gateway', to: 'events', label: 'emit' },
];

export function AsciiDiagramPreview() {
  return (
    <AsciiDiagram
      nodes={DIAGRAM_NODES}
      edges={DIAGRAM_EDGES}
      description="The client calls the API gateway, which verifies the request with auth, then routes to core services and emits domain events."
    />
  );
}
