import { Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import { CDPHooksProvider } from '@coinbase/cdp-hooks';
import { CDPReactProvider } from '@coinbase/cdp-react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from './config/wagmi.ts';
import { CurrencyProvider } from './context/CurrencyContext.tsx';
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

// VITE_CDP_PROJECT_ID from .env — fallback ensures CDP providers are always mounted
const cdpProjectId = import.meta.env.VITE_CDP_PROJECT_ID || 'f084155d-f70a-4539-b9bc-5189a9ed9d64';

createRoot(document.getElementById('root')!).render(
  <Fragment>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <CDPHooksProvider
          config={{
            projectId: cdpProjectId,
            ethereum: {
              createOnLogin: "eoa",
            },
            solana: {
              createOnLogin: true,
            },
          }}
        >
          <CDPReactProvider
            config={{
              projectId: cdpProjectId,
              ethereum: {
                createOnLogin: "eoa",
              },
              solana: {
                createOnLogin: true,
              },
              appName: "ZEEX Onchain",
              appLogoUrl: "https://base.org/logo.png",
            }}
          >
            <CurrencyProvider>
              <App />
            </CurrencyProvider>
          </CDPReactProvider>
        </CDPHooksProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </Fragment>,
);
