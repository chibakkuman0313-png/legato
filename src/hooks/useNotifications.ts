import { useState, useCallback } from 'react';
import emailjs from '@emailjs/browser';

// ────────────────────────────────────────
// EmailJS 設定（LocalStorageで永続化）
// ────────────────────────────────────────
const EMAILJS_KEYS = {
  serviceId:    'dlv_ejs_service',
  templateId:   'dlv_ejs_template',
  publicKey:    'dlv_ejs_pubkey',
  selfEmail:    'dlv_self_email',  // 自分へのリマインダー送先
};

const NOTIF_SENT_KEY = 'dlv_notif_sent_days'; // 通知済み残日数記録

export interface EmailJSConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  selfEmail: string;
}

export function loadEmailConfig(): EmailJSConfig {
  return {
    serviceId:  localStorage.getItem(EMAILJS_KEYS.serviceId)  ?? '',
    templateId: localStorage.getItem(EMAILJS_KEYS.templateId) ?? '',
    publicKey:  localStorage.getItem(EMAILJS_KEYS.publicKey)  ?? '',
    selfEmail:  localStorage.getItem(EMAILJS_KEYS.selfEmail)  ?? '',
  };
}

export function saveEmailConfig(cfg: EmailJSConfig) {
  localStorage.setItem(EMAILJS_KEYS.serviceId,  cfg.serviceId);
  localStorage.setItem(EMAILJS_KEYS.templateId, cfg.templateId);
  localStorage.setItem(EMAILJS_KEYS.publicKey,  cfg.publicKey);
  localStorage.setItem(EMAILJS_KEYS.selfEmail,  cfg.selfEmail);
}

// ────────────────────────────────────────
// ブラウザ Push 通知
// ────────────────────────────────────────
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function sendBrowserNotification(title: string, body: string) {
  if (Notification.permission !== 'granted') return;
  new Notification(title, {
    body,
    icon: '/vault.svg',
    badge: '/vault.svg',
  });
}

// ────────────────────────────────────────
// メール送信（EmailJS）
// ────────────────────────────────────────
export async function sendEmail(params: {
  to_email: string;
  to_name: string;
  subject: string;
  message: string;
}): Promise<void> {
  const cfg = loadEmailConfig();
  if (!cfg.serviceId || !cfg.templateId || !cfg.publicKey) {
    throw new Error('EmailJSの設定が未完了です');
  }
  await emailjs.send(
    cfg.serviceId,
    cfg.templateId,
    {
      to_email: params.to_email,
      to_name:  params.to_name,
      subject:  params.subject,
      message:  params.message,
    },
    cfg.publicKey
  );
}

// ────────────────────────────────────────
// フック本体
// ────────────────────────────────────────
export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const [config, setConfig] = useState<EmailJSConfig>(loadEmailConfig);
  const [isSending, setIsSending] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const requestPermission = useCallback(async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? 'granted' : 'denied');
    return granted;
  }, []);

  const updateConfig = useCallback((next: EmailJSConfig) => {
    saveEmailConfig(next);
    setConfig(next);
  }, []);

  /** 自分への残日数リマインダー（Push + メール） */
  const sendReminderToSelf = useCallback(async (daysLeft: number, triggerDays: number) => {
    // ── Push通知 ──
    sendBrowserNotification(
      '⚠️ Legato リマインダー',
      `あと${daysLeft}日で緊急連絡先への通知が送信されます。ログインしてタイマーをリセットしてください。`
    );

    // ── メール ──
    if (config.selfEmail && config.serviceId) {
      setIsSending(true);
      setLastError(null);
      try {
        await sendEmail({
          to_email: config.selfEmail,
          to_name:  '本人',
          subject:  `【Legato】あと${daysLeft}日で緊急連絡先へ通知されます`,
          message:
            `Legatoからのリマインダーです。\n\n` +
            `設定した${triggerDays}日のうち、すでに${triggerDays - daysLeft}日が経過しています。\n` +
            `あと${daysLeft}日以内にアプリにログインしない場合、登録した緊急連絡先へ自動通知が送られます。\n\n` +
            `アプリを開いてタイマーをリセットしてください。\n` +
            `${window.location.origin}`,
        });
      } catch (e) {
        setLastError(e instanceof Error ? e.message : '送信失敗');
      } finally {
        setIsSending(false);
      }
    }
  }, [config]);

  /** 緊急連絡先への本通知 */
  const sendAlertToContacts = useCallback(async (contacts: { name: string; email: string }[], message: string) => {
    setIsSending(true);
    setLastError(null);
    try {
      for (const contact of contacts) {
        await sendEmail({
          to_email: contact.email,
          to_name:  contact.name,
          subject:  '【重要】デジタル遺産情報のご案内',
          message,
        });
      }
    } catch (e) {
      setLastError(e instanceof Error ? e.message : '送信失敗');
    } finally {
      setIsSending(false);
    }
  }, []);

  /** アプリ起動時の残日数チェック（通知タイミング：30・7・3・1日前） */
  const checkAndNotify = useCallback(async (daysLeft: number, triggerDays: number) => {
    const NOTIFY_AT = [30, 7, 3, 1];
    const sentRaw = localStorage.getItem(NOTIF_SENT_KEY);
    const alreadySent: number[] = sentRaw ? JSON.parse(sentRaw) : [];

    for (const threshold of NOTIFY_AT) {
      if (daysLeft <= threshold && !alreadySent.includes(threshold)) {
        await sendReminderToSelf(daysLeft, triggerDays);
        alreadySent.push(threshold);
        localStorage.setItem(NOTIF_SENT_KEY, JSON.stringify(alreadySent));
        break; // 一度に1通
      }
    }
    // 通知済みリセット（ログイン=残日数が増えた）
    if (daysLeft === triggerDays) {
      localStorage.removeItem(NOTIF_SENT_KEY);
    }
  }, [sendReminderToSelf]);

  return {
    permission,
    config,
    isSending,
    lastError,
    requestPermission,
    updateConfig,
    sendReminderToSelf,
    sendAlertToContacts,
    checkAndNotify,
    isConfigured: !!(config.serviceId && config.templateId && config.publicKey),
  };
}
