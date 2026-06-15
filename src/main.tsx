import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import { SourceColorProvider } from './internals/source-colors/SourceColorContext';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SourceColorProvider>
        <App />
      </SourceColorProvider>
    </QueryClientProvider>
  </StrictMode>,
);
