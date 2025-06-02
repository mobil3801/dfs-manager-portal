import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeMemoryLeakDetection } from './utils/memoryLeakIntegration';

// Initialize memory leak detection
initializeMemoryLeakDetection();

createRoot(document.getElementById("root")!).render(<App />);