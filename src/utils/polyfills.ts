// polyfills.ts - 确保浏览器环境中的 Node.js polyfill 正常工作
import { Buffer } from 'buffer';

// 确保 Buffer 在全局可用
declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  
  // 确保 global 变量可用
  if (!window.global) {
    (window as any).global = window;
  }
}

export { Buffer };