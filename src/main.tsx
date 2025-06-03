import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeMemoryLeakDetection } from './utils/memoryLeakIntegration';
import { setupInvalidCharacterErrorMonitor } from './utils/errorPreventionHelper';

// Initialize memory leak detection
initializeMemoryLeakDetection();

// Initialize InvalidCharacterError monitoring
setupInvalidCharacterErrorMonitor();

createRoot(document.getElementById("root")!).render(<App />);