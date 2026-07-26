import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { VolumeProvider } from './context/VolumeContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VolumeProvider>
      <App />
    </VolumeProvider>
  </StrictMode>,
);

