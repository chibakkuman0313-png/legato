import { useState, useEffect, useCallback } from 'react';
import { DigitalAsset, AssetCategory } from '../types/asset';

const STORAGE_KEY = 'digital_legacy_assets';
const LAST_LOGIN_KEY = 'digital_legacy_last_login';

const SAMPLE_ASSETS: DigitalAsset[] = [
  {
    id: '1',
    name: '楽天銀行',
    category: 'bank',
    url: 'https://www.rakuten-bank.co.jp',
    loginId: 'example@email.com',
    memo: 'メインの給与振込口座。キャッシュカードは書斎の引き出しに保管。',
    monthlyCost: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Netflix',
    category: 'subscription',
    url: 'https://www.netflix.com',
    loginId: 'example@email.com',
    memo: 'スタンダードプラン。家族と共有中。',
    monthlyCost: 1590,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'X (Twitter)',
    category: 'social',
    url: 'https://x.com',
    loginId: '@myhandle',
    memo: 'プライベート用アカウント。フォロワー約500人。',
    monthlyCost: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'SBI証券',
    category: 'investment',
    url: 'https://www.sbisec.co.jp',
    loginId: 'example@email.com',
    memo: 'NISAと特定口座あり。毎月5万円の積立設定中。',
    monthlyCost: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function loadFromStorage(): DigitalAsset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SAMPLE_ASSETS;
    return JSON.parse(raw) as DigitalAsset[];
  } catch {
    return SAMPLE_ASSETS;
  }
}

function saveToStorage(assets: DigitalAsset[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
}

export function useAssets() {
  const [assets, setAssets] = useState<DigitalAsset[]>(loadFromStorage);
  const [lastLogin, setLastLogin] = useState<string>(() => {
    return localStorage.getItem(LAST_LOGIN_KEY) ?? new Date().toISOString();
  });

  useEffect(() => {
    saveToStorage(assets);
  }, [assets]);

  // ログイン日時を更新
  useEffect(() => {
    const now = new Date().toISOString();
    localStorage.setItem(LAST_LOGIN_KEY, now);
    setLastLogin(now);
  }, []);

  const addAsset = useCallback((data: Omit<DigitalAsset, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newAsset: DigitalAsset = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setAssets(prev => [newAsset, ...prev]);
  }, []);

  const updateAsset = useCallback((id: string, data: Partial<Omit<DigitalAsset, 'id' | 'createdAt'>>) => {
    setAssets(prev =>
      prev.map(a =>
        a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a
      )
    );
  }, []);

  const deleteAsset = useCallback((id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  }, []);

  // ⑤ 更新リマインダー：確認済みにする
  const confirmAsset = useCallback((id: string) => {
    setAssets(prev =>
      prev.map(a =>
        a.id === id
          ? { ...a, confirmedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : a
      )
    );
  }, []);

  // ② バックアップ用：全資産を上書きインポート
  const importAssets = useCallback((imported: DigitalAsset[]) => {
    setAssets(imported);
  }, []);

  const totalMonthlyCost = assets.reduce((sum, a) => sum + (a.monthlyCost ?? 0), 0);

  const assetsByCategory = assets.reduce<Partial<Record<AssetCategory, DigitalAsset[]>>>(
    (acc, asset) => {
      if (!acc[asset.category]) acc[asset.category] = [];
      acc[asset.category]!.push(asset);
      return acc;
    },
    {}
  );

  // デッドマンズスイッチ：最終ログインから90日経過しているかどうか
  const daysSinceLastLogin = Math.floor(
    (Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24)
  );
  const isDeadManSwitchTriggered = daysSinceLastLogin >= 90;

  return {
    assets,
    addAsset,
    updateAsset,
    deleteAsset,
    confirmAsset,
    importAssets,
    totalMonthlyCost,
    assetsByCategory,
    lastLogin,
    daysSinceLastLogin,
    isDeadManSwitchTriggered,
  };
}
