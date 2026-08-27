import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CDPReactProvider } from '@coinbase/cdp-react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from './config/wagmi.ts';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 10_000,
    },
  },
});

const cdpProjectId =
  (typeof process !== 'undefined' && process.env?.CDP_PROJECT_ID) ||
  ((import.meta as any).env?.VITE_CDP_PROJECT_ID) ||
  'zeex-cdp-project-id';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <CDPReactProvider
          config={{
            projectId: cdpProjectId,
            ethereum: {
              createOnLogin: "eoa"
            },
            solana: {
              createOnLogin: true
            },
            appName: "ZEEX Onchain"
          }}
        >
          <App />
        </CDPReactProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
);


