import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { CDPReactProvider } from '@coinbase/cdp-react';
import App from './App.tsx';
import './index.css';

const cdpProjectId =
  (typeof process !== 'undefined' && process.env?.CDP_PROJECT_ID) ||
  ((import.meta as any).env?.VITE_CDP_PROJECT_ID) ||
  'zeex-cdp-project-id';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
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
  </StrictMode>,
);

