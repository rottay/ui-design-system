'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

type EngineName = 'classic' | 'modern' | 'rustic';

interface ShowroomContextValue {
  engine: EngineName;
  setEngine: (e: EngineName) => void;
  tenantSlug: string;
  setTenantSlug: (s: string) => void;
}

const ShowroomContext = createContext<ShowroomContextValue>({
  engine: 'modern',
  setEngine: () => {},
  tenantSlug: 'rottay',
  setTenantSlug: () => {},
});

export function ShowroomProvider({ children }: { children: ReactNode }) {
  const [engine, setEngine] = useState<EngineName>('modern');
  const [tenantSlug, setTenantSlug] = useState('rottay');

  return (
    <ShowroomContext.Provider value={{ engine, setEngine, tenantSlug, setTenantSlug }}>
      {children}
    </ShowroomContext.Provider>
  );
}

export function useShowroom() {
  return useContext(ShowroomContext);
}
