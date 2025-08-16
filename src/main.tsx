import { createRoot } from 'react-dom/client'
import './utils/polyfills' // 确保 polyfills 在应用启动前加载
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
