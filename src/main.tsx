import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import { bindPwaRegister } from './lib/pwaUpdate';

bindPwaRegister(registerSW);

const root = document.getElementById('root');
if (!root) throw new Error('root missing');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
