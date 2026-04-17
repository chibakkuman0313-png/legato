import { useState, useEffect, useCallback } from 'react';
import { TrustedContact } from '../types/asset';

const CONTACTS_KEY = 'dlv_trusted_contacts';
const SWITCH_MSG_KEY = 'dlv_switch_message';
const SWITCH_DAYS_KEY = 'dlv_switch_days';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function load(): TrustedContact[] {
  try {
    const raw = localStorage.getItem(CONTACTS_KEY);
    return raw ? (JSON.parse(raw) as TrustedContact[]) : [];
  } catch {
    return [];
  }
}

export function useContacts() {
  const [contacts, setContacts] = useState<TrustedContact[]>(load);
  const [switchMessage, setSwitchMessage] = useState<string>(
    () => localStorage.getItem(SWITCH_MSG_KEY) ?? defaultMessage()
  );
  const [triggerDays, setTriggerDays] = useState<number>(
    () => parseInt(localStorage.getItem(SWITCH_DAYS_KEY) ?? '90', 10)
  );

  useEffect(() => {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem(SWITCH_MSG_KEY, switchMessage);
  }, [switchMessage]);

  useEffect(() => {
    localStorage.setItem(SWITCH_DAYS_KEY, String(triggerDays));
  }, [triggerDays]);

  const addContact = useCallback((data: Omit<TrustedContact, 'id'>) => {
    setContacts(prev => [...prev, { ...data, id: generateId() }]);
  }, []);

  const updateContact = useCallback((id: string, data: Partial<Omit<TrustedContact, 'id'>>) => {
    setContacts(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));
  }, []);

  const deleteContact = useCallback((id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  }, []);

  return {
    contacts,
    switchMessage,
    setSwitchMessage,
    triggerDays,
    setTriggerDays,
    addContact,
    updateContact,
    deleteContact,
  };
}

function defaultMessage(): string {
  return `このメッセージはデジタル遺産管理アプリ「LegacyVault」から自動送信されています。

しばらく本人からのアクセスが確認されなかったため、事前の設定に基づき、デジタル資産情報をお送りします。

資産情報にアクセスする際は、本人から別途共有されたPINコードを使用してください。

---
LegacyVault デッドマンズスイッチ`;
}
