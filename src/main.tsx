import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// ── Service Worker 登録 ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(registration => {
        console.log('[SW] 登録成功:', registration.scope);

        // 新バージョンが利用可能になったら自動更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 新しいSWが待機中 → ページリロードで適用
              console.log('[SW] 新バージョン利用可能。リロードで更新されます。');
            }
          });
        });
      })
      .catch(err => {
        console.warn('[SW] 登録失敗:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
