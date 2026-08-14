/**
 * @fileoverview TreeView family barrel.
 *
 * The family ships two presentations of one hierarchy grammar:
 * `PatternTreeView` (engine-dispatched, interactive, a client boundary) and
 * `TreeViewConnector` (static ASCII connectors, server-safe, used by
 * landing/docs layouts). Both are owned here; neither is published through the
 * `visualization` group barrel's deep paths any more.
 *
 * This file aggregates child owners and nothing else -- it authors no
 * component, so it carries no `'use client'` directive and a server page
 * importing the connector never crosses the interactive presentation's
 * boundary.
 */

export type { TreeViewProps, TreeNode } from './contracts';
export { PatternTreeView } from './presentation/interactive';
export {
  TreeViewConnector,
  type TreeViewConnectorNode,
  type TreeViewConnectorProps,
} from './presentation/connector';
