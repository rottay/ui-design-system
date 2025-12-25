/**
 * Grid Component (Row/Col)
 *
 * A 24-column grid system for responsive layouts.
 * Supports all four engines: titan, hermes, apollo, athena.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useEngineContext } from '../../../providers/EngineProvider';
import type { RowProps, ColProps } from './types';

// Titan is the default engine (synchronously loaded)
import { TitanRow, TitanCol } from './engines/titan';

// Lazy load other engines - we load them as modules with named exports
const loadHermes = () => import('./engines/hermes');
const loadApollo = () => import('./engines/apollo');
const loadAthena = () => import('./engines/athena');

// Engine loader map
const engineLoaders = {
  hermes: loadHermes,
  apollo: loadApollo,
  athena: loadAthena,
} as const;

// Cache for loaded engine modules
const engineCache: Record<string, any> = {};

/**
 * Row component - container for grid columns
 */
export const Row: React.FC<RowProps> = (props) => {
  const { engine } = useEngineContext();
  const [EngineRow, setEngineRow] = useState<React.FC<RowProps> | null>(null);

  useEffect(() => {
    if (engine === 'titan') return;

    const loader = engineLoaders[engine as keyof typeof engineLoaders];
    if (!loader) return;

    // Check cache first
    if (engineCache[engine]) {
      setEngineRow(() => engineCache[engine].HermesRow || engineCache[engine].ApolloRow || engineCache[engine].AthenaRow);
      return;
    }

    // Load engine module
    loader().then((mod) => {
      engineCache[engine] = mod;
      const RowComponent = (mod as any).HermesRow || (mod as any).ApolloRow || (mod as any).AthenaRow;
      setEngineRow(() => RowComponent);
    });
  }, [engine]);

  // For titan or while loading, use TitanRow
  if (engine === 'titan' || !EngineRow) {
    return <TitanRow {...props} />;
  }

  return <EngineRow {...props} />;
};

Row.displayName = 'Row';

/**
 * Col component - grid column
 */
export const Col: React.FC<ColProps> = (props) => {
  const { engine } = useEngineContext();
  const [EngineCol, setEngineCol] = useState<React.FC<ColProps> | null>(null);

  useEffect(() => {
    if (engine === 'titan') return;

    const loader = engineLoaders[engine as keyof typeof engineLoaders];
    if (!loader) return;

    // Check cache first
    if (engineCache[engine]) {
      setEngineCol(() => engineCache[engine].HermesCol || engineCache[engine].ApolloCol || engineCache[engine].AthenaCol);
      return;
    }

    // Load engine module
    loader().then((mod) => {
      engineCache[engine] = mod;
      const ColComponent = (mod as any).HermesCol || (mod as any).ApolloCol || (mod as any).AthenaCol;
      setEngineCol(() => ColComponent);
    });
  }, [engine]);

  // For titan or while loading, use TitanCol
  if (engine === 'titan' || !EngineCol) {
    return <TitanCol {...props} />;
  }

  return <EngineCol {...props} />;
};

Col.displayName = 'Col';

export type { RowProps, ColProps } from './types';
