import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSources } from '../../api/sources';
import type { SourceColorRegistry } from '../../utils/sourceColors';
import { buildSourceColorRegistry } from '../../utils/sourceColors';

type SourceColorContextValue = {
  sourceColorRegistry: SourceColorRegistry;
};

const EMPTY_SOURCE_COLOR_REGISTRY: SourceColorRegistry = new Map<string, string>();

const SourceColorContext = React.createContext<SourceColorContextValue>({
  sourceColorRegistry: EMPTY_SOURCE_COLOR_REGISTRY,
});

type SourceColorProviderProps = {
  children: React.ReactNode;
};

export function SourceColorProvider({ children }: SourceColorProviderProps) {
  const sourcesQuery = useQuery({
    queryKey: ['sourcesColorRegistry'],
    queryFn: fetchSources,
    staleTime: 5 * 60 * 1000,
  });

  const sourceColorRegistry = React.useMemo(
    () => buildSourceColorRegistry(sourcesQuery.data?.items ?? []),
    [sourcesQuery.data],
  );

  const value = React.useMemo(
    () => ({
      sourceColorRegistry,
    }),
    [sourceColorRegistry],
  );

  return (
    <SourceColorContext.Provider value={value}>
      {children}
    </SourceColorContext.Provider>
  );
}

export function useSourceColorContext() {
  return React.useContext(SourceColorContext);
}
