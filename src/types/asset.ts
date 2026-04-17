export type AssetCategory =
  | 'bank'
  | 'subscription'
  | 'social'
  | 'investment'
  | 'crypto'
  | 'insurance'
  | 'other';

export interface DigitalAsset {
  id: string;
  name: string;
  category: AssetCategory;
  url: string;
  loginId: string;
  memo: string;
  monthlyCost: number | null;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;   // ⑤ 更新リマインダー用：最終確認日
  audioMemo?: string;     // ④ 音声メモ用：base64エンコードされた音声データ
  cancelGuide?: string;   // ② 解約手順メモ
}

export interface TrustedContact {
  id: string;
  name: string;
  email: string;
  relationship: string;
}

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  bank: 'ネット銀行',
  subscription: 'サブスクリプション',
  social: 'SNS・メール',
  investment: '証券・投資',
  crypto: '仮想通貨',
  insurance: '保険',
  other: 'その他',
};

export const CATEGORY_COLORS: Record<AssetCategory, { bg: string; text: string; border: string }> = {
  bank: { bg: 'bg-blue-900/40', text: 'text-blue-300', border: 'border-blue-700/50' },
  subscription: { bg: 'bg-purple-900/40', text: 'text-purple-300', border: 'border-purple-700/50' },
  social: { bg: 'bg-green-900/40', text: 'text-green-300', border: 'border-green-700/50' },
  investment: { bg: 'bg-amber-900/40', text: 'text-amber-300', border: 'border-amber-700/50' },
  crypto: { bg: 'bg-orange-900/40', text: 'text-orange-300', border: 'border-orange-700/50' },
  insurance: { bg: 'bg-teal-900/40', text: 'text-teal-300', border: 'border-teal-700/50' },
  other: { bg: 'bg-slate-700/40', text: 'text-slate-300', border: 'border-slate-600/50' },
};
