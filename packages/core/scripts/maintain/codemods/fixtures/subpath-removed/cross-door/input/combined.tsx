import { TreeView, type TreeNode, type TreeViewProps } from '@rottay/design-system/commercial';

export const node: TreeNode = { label: 'a' };
export const Tree = (props: TreeViewProps) => <TreeView {...props} />;
