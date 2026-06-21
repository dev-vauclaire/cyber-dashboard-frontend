import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSources } from '../api';
import { sourcesQueryKeys } from '../queryKeys';
import { buildSourceColorRegistry } from '../utils/sourceColors';
import { SourceColorContext } from './sourceColorContext';

type SourceColorProviderProps = {
  children: React.ReactNode;
};

export function SourceColorProvider({ children }: SourceColorProviderProps) {
  const sourcesQuery = useQuery({
    queryKey: sourcesQueryKeys.colorRegistry,
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
