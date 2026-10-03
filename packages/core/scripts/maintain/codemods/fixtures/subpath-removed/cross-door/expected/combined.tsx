import { TreeViewConnector as TreeView, type TreeViewConnectorNode as TreeNode, type TreeViewConnectorProps as TreeViewProps } from '@rottay/design-system';

export const node: TreeNode = { label: 'a' };
export const Tree = (props: TreeViewProps) => <TreeView {...props} />;
