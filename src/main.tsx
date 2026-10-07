import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AutoHealingErrorBoundary } from './components/AutoHealingErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <AutoHealingErrorBoundary>
    <App />
  </AutoHealingErrorBoundary>
);
