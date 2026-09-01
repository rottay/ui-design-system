'use client';

/**
 * @fileoverview TreeView interactive presentation -- the engine-dispatched
 * hierarchy with expand/collapse, checkboxes, drag-and-drop and search
 * filtering.
 *
 * This owner carries the family's `'use client'` boundary. The directive used
 * to sit on the family barrel, which forced the server-safe
 * `../connector` presentation to be published from the *group* barrel through
 * a deep path -- a group barrel appropriating a grandchild's export. With the
 * boundary pushed down to the presentation that actually needs it, both
 * presentations publish through their own family owner and a server page can
 * import the connector without crossing into client code.
 */

import { createEngineComponent } from '../../../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { TreeViewProps } from '../../contracts';

export const PatternTreeView = createEngineComponent<TreeViewProps>(
  'PatternTreeView',
  {
    classic: () => import('../../engines/classic'),
    modern: () => import('../../engines/modern'),
    rustic: () => import('../../engines/rustic'),
  }
);
