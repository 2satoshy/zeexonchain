import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
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
            authMethods: ["email", "sms"],
            ethereum: {
              createOnLogin: "eoa"
            },
            solana: {
              createOnLogin: true
            },
            appName: "ZEEX Onchain",
            appLogoUrl: "https://base.org/logo.png"
          }}
        >
          <CurrencyProvider>
            <App />
          </CurrencyProvider>
        </CDPReactProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
);


