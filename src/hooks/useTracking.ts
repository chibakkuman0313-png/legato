import { useState, useCallback } from 'react';

// ────────────────────────────────────────────────────────────
// トラッキング同意管理（ATT準拠）
//
// - 初回起動時に同意ダイアログを表示
// - 同意状態を localStorage に保存
// - 同意済みの場合のみアクセス解析イベントを送信
// - Apple App Tracking Transparency (ATT) に対応
// ────────────────────────────────────────────────────────────

const CONSENT_KEY = 'dlv_tracking_consent';   // 'granted' | 'denied' | null
const EVENTS_KEY  = 'dlv_analytics_events';

export type ConsentStatus = 'undecided' | 'granted' | 'denied';

export interface AnalyticsEvent {
  name:   string;
  ts:     number;
  props?: Record<string, string | number>;
}

function loadConsent(): ConsentStatus {
  const v = localStorage.getItem(CONSENT_KEY);
  if (v === 'granted' || v === 'denied') return v;
  return 'undecided';
}

export function useTracking() {
  const [consent, setConsent] = useState<ConsentStatus>(loadConsent);

  /** ユーザーがトラッキングを許可 */
  const grant = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'granted');
    setConsent('granted');
  }, []);

  /** ユーザーがトラッキングを拒否 */
  const deny = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'denied');
    setConsent('denied');
  }, []);

  /** イベントを記録（同意済みの場合のみ） */
  const track = useCallback((name: string, props?: Record<string, string | number>) => {
    if (loadConsent() !== 'granted') return;

    const event: AnalyticsEvent = { name, ts: Date.now(), props };

    // ローカルに蓄積（将来のAPI送信用）
    try {
      const stored = JSON.parse(localStorage.getItem(EVENTS_KEY) ?? '[]') as AnalyticsEvent[];
      stored.push(event);
      // 最新500件のみ保持
      if (stored.length > 500) stored.splice(0, stored.length - 500);
      localStorage.setItem(EVENTS_KEY, JSON.stringify(stored));
    } catch {
      // storage full - 無視
    }

    // 将来的にここで外部APIへ送信
    // e.g. fetch('/api/analytics', { method: 'POST', body: JSON.stringify(event) });

    // 開発中はコンソール出力
    try {
      if ((import.meta as unknown as { env: { DEV: boolean } }).env.DEV) {
        console.log('[Analytics]', name, props);
      }
    } catch { /* production */ }
  }, []);

  /** 蓄積されたイベント数 */
  const eventCount = (() => {
    try {
      return (JSON.parse(localStorage.getItem(EVENTS_KEY) ?? '[]') as AnalyticsEvent[]).length;
    } catch { return 0; }
  })();

  return { consent, grant, deny, track, eventCount };
}
