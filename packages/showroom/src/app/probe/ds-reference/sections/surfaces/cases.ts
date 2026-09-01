/* Server-readable case list: a 'use client' module's exports reach a server
   component as client references, so the route cannot read them as an array. */

export type SurfaceCase = string;

export const SURFACE_CASES: SurfaceCase[] = [
  'audit',
  'billing',
  'import-export',
  'integration',
  'profile',
  'settings',
  'team',
  'compare',
  'dashboard',
  'report',
  'search',
  'visualization',
  'auth',
  'editor',
  'empty-state',
  'marketing',
  'o-auth-transition',
  'pricing',
  'activity',
  'kanban',
  'scheduler',
  'command-center',
  'detail',
  'chat',
  'media',
  'detail-form',
  'guided-draft-form',
  'wizard',
  'collection-workspace',
  'decision-inbox',
  'record-workbench',
  'file-browser',
  'notification',
  'form',
  'operational',
  'list'
];
