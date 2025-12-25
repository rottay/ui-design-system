/**
 * List Component
 *
 * Multi-engine list component with support for titan (AntD), hermes (DaisyUI),
 * apollo (HTML+Tailwind), and athena (custom) implementations.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useEngineContext } from '../../../providers/EngineProvider';
import type { ListProps, ListItemProps, ListItemMetaProps } from '../../../types/components/list';

// Default engine implementation (titan/AntD)
import TitanList from './engines/titan';

// Lazy loading functions for non-default engines
const loadHermes = () => import('./engines/hermes');
const loadApollo = () => import('./engines/apollo');
const loadAthena = () => import('./engines/athena');

// Engine cache to avoid re-loading
const engineCache: Record<string, any> = {};

// Type for List with sub-components
type ListComponent = {
  <T = any>(props: ListProps<T>): React.ReactElement | null;
  Item: React.FC<ListItemProps> & { Meta: React.FC<ListItemMetaProps> };
};

/**
 * Engine-aware List component
 */
function ListBase<T = any>(props: ListProps<T>): React.ReactElement | null {
  const { engine } = useEngineContext();
  const [EngineList, setEngineList] = useState<any>(null);

  useEffect(() => {
    // Use titan as default, no need to load
    if (engine === 'titan') {
      setEngineList(() => TitanList);
      return;
    }

    // Check cache first
    if (engineCache[engine]) {
      setEngineList(() => engineCache[engine]);
      return;
    }

    // Load engine asynchronously
    const loadEngine = async () => {
      let module: any;
      switch (engine) {
        case 'hermes':
          module = await loadHermes();
          break;
        case 'apollo':
          module = await loadApollo();
          break;
        case 'athena':
          module = await loadAthena();
          break;
        default:
          setEngineList(() => TitanList);
          return;
      }
      engineCache[engine] = module.default;
      setEngineList(() => module.default);
    };

    loadEngine();
  }, [engine]);

  // Show loading state while engine loads
  if (!EngineList) {
    return <div className="animate-pulse h-32 bg-gray-100 rounded" />;
  }

  return <EngineList {...props} />;
}

ListBase.displayName = 'List';

/**
 * Engine-aware List.Item component
 */
function ListItem(props: ListItemProps): React.ReactElement | null {
  const { engine } = useEngineContext();
  const [EngineItem, setEngineItem] = useState<any>(null);

  useEffect(() => {
    if (engine === 'titan') {
      setEngineItem(() => TitanList.Item);
      return;
    }

    if (engineCache[engine]?.Item) {
      setEngineItem(() => engineCache[engine].Item);
      return;
    }

    const loadItem = async () => {
      let module: any;
      switch (engine) {
        case 'hermes':
          module = await loadHermes();
          break;
        case 'apollo':
          module = await loadApollo();
          break;
        case 'athena':
          module = await loadAthena();
          break;
        default:
          setEngineItem(() => TitanList.Item);
          return;
      }
      engineCache[engine] = module.default;
      setEngineItem(() => module.default?.Item ?? TitanList.Item);
    };

    loadItem();
  }, [engine]);

  if (!EngineItem) {
    return <div className="animate-pulse h-12 bg-gray-100 rounded" />;
  }

  return <EngineItem {...props} />;
}

ListItem.displayName = 'List.Item';

/**
 * Engine-aware List.Item.Meta component
 */
function ListItemMeta(props: ListItemMetaProps): React.ReactElement | null {
  const { engine } = useEngineContext();
  const [EngineMeta, setEngineMeta] = useState<any>(null);

  useEffect(() => {
    if (engine === 'titan') {
      setEngineMeta(() => TitanList.Item?.Meta);
      return;
    }

    if (engineCache[engine]?.Item?.Meta) {
      setEngineMeta(() => engineCache[engine].Item.Meta);
      return;
    }

    const loadMeta = async () => {
      let module: any;
      switch (engine) {
        case 'hermes':
          module = await loadHermes();
          break;
        case 'apollo':
          module = await loadApollo();
          break;
        case 'athena':
          module = await loadAthena();
          break;
        default:
          setEngineMeta(() => TitanList.Item?.Meta);
          return;
      }
      engineCache[engine] = module.default;
      setEngineMeta(() => module.default?.Item?.Meta ?? TitanList.Item?.Meta);
    };

    loadMeta();
  }, [engine]);

  if (!EngineMeta) {
    return <div className="animate-pulse h-8 bg-gray-100 rounded" />;
  }

  return <EngineMeta {...props} />;
}

ListItemMeta.displayName = 'List.Item.Meta';

// Attach Meta to Item
const ItemWithMeta = ListItem as typeof ListItem & { Meta: typeof ListItemMeta };
ItemWithMeta.Meta = ListItemMeta;

// Create final List component with sub-components
const List = ListBase as unknown as ListComponent;
List.Item = ItemWithMeta;

export { List };
export default List;
