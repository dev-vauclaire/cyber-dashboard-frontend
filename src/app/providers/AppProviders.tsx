import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { SourceColorProvider } from '../../shared/sources/providers/SourceColorProvider';
import { queryClient } from '../queryClient';

type AppProvidersProps = {
  children: ReactNode;
};

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SourceColorProvider>{children}</SourceColorProvider>
    </QueryClientProvider>
  );
}
