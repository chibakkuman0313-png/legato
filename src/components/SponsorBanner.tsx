import { useState } from 'react';
import { ExternalLink, X } from 'lucide-react';
import { usePremium } from '../hooks/usePremium';

// ────────────────────────────────────────────────────────────
// おすすめサービス枠（ネイティブ広告 / アフィリエイト）
//
// - アプリのUIに溶け込むデザイン
// - Premiumユーザーには非表示
// - ✕ ボタンで一時非表示（セッション内のみ）
// - 表示位置ごとに異なるスポンサーを出せる
// - A8.net / もしもアフィリエイト等のASP経由を想定
// ────────────────────────────────────────────────────────────

interface Sponsor {
  id:    string;
  label: string;
  title: string;
  desc:  string;
  cta:   string;          // ボタンテキスト
  url:   string;          // アフィリエイトリンク
  color: string;
  bg:    string;
  badge?: string;         // 「無料」「人気」等のバッジ
}

// ── スポンサー定義（ASPリンクに差し替え想定） ──
// 実運用では A8.net / もしもアフィリエイト / バリューコマースの
// 広告主リンクに差し替え。以下はプレースホルダー。
const SPONSORS: Sponsor[] = [
  {
    id: 'will-lawyer',
    label: '終活相談',
    title: '遺言書の作成をプロに相談',
    desc: '法的に有効な遺言書を弁護士・司法書士がサポート。Web面談OK。',
    cta: '無料相談を予約',
    url: 'https://px.a8.net/svt/ejp?a8mat=EXAMPLE1',  // A8.net プレースホルダー
    color: 'text-amber-400',
    bg: 'bg-amber-900/10 border-amber-800/20',
    badge: '初回無料',
  },
  {
    id: 'life-insurance',
    label: '保険見直し',
    title: '生命保険の見直し無料相談',
    desc: '家族に必要な保障額を専門FPが無料診断。オンライン対応。',
    cta: '無料診断を受ける',
    url: 'https://px.a8.net/svt/ejp?a8mat=EXAMPLE2',
    color: 'text-emerald-400',
    bg: 'bg-emerald-900/10 border-emerald-800/20',
    badge: '人気',
  },
  {
    id: 'cloud-storage',
    label: 'データ保管',
    title: '大切なデータをクラウドに安全保管',
    desc: '写真・動画・書類を暗号化バックアップ。家族共有機能付き。',
    cta: '無料で始める',
    url: 'https://px.a8.net/svt/ejp?a8mat=EXAMPLE3',
    color: 'text-sky-400',
    bg: 'bg-sky-900/10 border-sky-800/20',
  },
  {
    id: 'funeral-plan',
    label: '葬儀見積り',
    title: 'お葬式の事前相談・見積もり比較',
    desc: '全国5,000社以上から最適な葬儀プランを比較。最大30%節約。',
    cta: '無料見積もり',
    url: 'https://px.a8.net/svt/ejp?a8mat=EXAMPLE4',
    color: 'text-purple-400',
    bg: 'bg-purple-900/10 border-purple-800/20',
    badge: '全国対応',
  },
  {
    id: 'estate-tax',
    label: '相続税',
    title: '相続税シミュレーション',
    desc: 'かんたん入力で相続税を無料試算。専門家への相談も可能。',
    cta: '無料で試算する',
    url: 'https://px.a8.net/svt/ejp?a8mat=EXAMPLE5',
    color: 'text-orange-400',
    bg: 'bg-orange-900/10 border-orange-800/20',
    badge: '無料',
  },
  {
    id: 'password-manager',
    label: 'セキュリティ',
    title: 'パスワード管理アプリ',
    desc: '家族共有機能付きパスワードマネージャー。緊急アクセス対応。',
    cta: '30日間無料体験',
    url: 'https://px.a8.net/svt/ejp?a8mat=EXAMPLE6',
    color: 'text-cyan-400',
    bg: 'bg-cyan-900/10 border-cyan-800/20',
  },
  {
    id: 'digital-will',
    label: 'デジタル終活',
    title: 'デジタル遺品整理サービス',
    desc: 'SNS・メールアカウントの整理を専門スタッフが代行。',
    cta: '詳細を見る',
    url: 'https://px.a8.net/svt/ejp?a8mat=EXAMPLE7',
    color: 'text-indigo-400',
    bg: 'bg-indigo-900/10 border-indigo-800/20',
    badge: 'NEW',
  },
  {
    id: 'legal-doc',
    label: '書類作成',
    title: '相続関連書類テンプレート',
    desc: '遺産分割協議書・財産目録など、法的書類のテンプレート集。',
    cta: 'テンプレートを見る',
    url: 'https://px.a8.net/svt/ejp?a8mat=EXAMPLE8',
    color: 'text-teal-400',
    bg: 'bg-teal-900/10 border-teal-800/20',
  },
];

/** 表示位置ごとに異なるスポンサーを返す（日替わりローテーション） */
function pickSponsor(slot: string): Sponsor {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const slotHash = slot.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return SPONSORS[(dayIndex + slotHash) % SPONSORS.length];
}

/** 2つのスポンサーを返す（リスト表示用） */
function pickSponsors(slot: string, count: number): Sponsor[] {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const slotHash = slot.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const start = (dayIndex + slotHash) % SPONSORS.length;
  const result: Sponsor[] = [];
  for (let i = 0; i < count; i++) {
    result.push(SPONSORS[(start + i) % SPONSORS.length]);
  }
  return result;
}

interface SponsorBannerProps {
  slot?: string;
  compact?: boolean;
  /** フル広告 2件表示（設定画面等） */
  multi?: boolean;
}

export function SponsorBanner({ slot = 'default', compact = false, multi = false }: SponsorBannerProps) {
  const { isPremium } = usePremium();
  const [dismissed, setDismissed] = useState(false);

  if (isPremium || dismissed) return null;

  // ── マルチ表示（2件の広告を縦並び） ──
  if (multi) {
    const sponsors = pickSponsors(slot, 2);
    return (
      <div className="space-y-2">
        <p className="text-[10px] text-slate-600 font-medium px-1">おすすめサービス</p>
        {sponsors.map((sponsor) => (
          <a
            key={sponsor.id}
            href={sponsor.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={`block border rounded-xl px-4 py-3 ${sponsor.bg} transition-all hover:opacity-80`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${sponsor.color} bg-slate-800/50`}>
                    PR · {sponsor.label}
                  </span>
                  {sponsor.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">
                      {sponsor.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-200 leading-snug">{sponsor.title}</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{sponsor.desc}</p>
                <span className={`inline-block mt-2 text-[11px] font-bold ${sponsor.color} underline underline-offset-2`}>
                  {sponsor.cta} →
                </span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-1" />
            </div>
          </a>
        ))}
      </div>
    );
  }

  const sponsor = pickSponsor(slot);

  // ── コンパクト表示 ──
  if (compact) {
    return (
      <a
        href={sponsor.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`block border rounded-xl px-3 py-2.5 ${sponsor.bg} transition-all hover:opacity-80`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`text-[10px] font-bold ${sponsor.color} opacity-70`}>PR</span>
            <p className="text-xs text-slate-300 truncate">{sponsor.title}</p>
            {sponsor.badge && (
              <span className="text-[9px] font-bold px-1 py-0.5 bg-red-500/20 text-red-400 rounded flex-shrink-0">
                {sponsor.badge}
              </span>
            )}
          </div>
          <ExternalLink className="w-3 h-3 text-slate-600 flex-shrink-0" />
        </div>
      </a>
    );
  }

  // ── フル表示 ──
  return (
    <div className={`relative border rounded-xl overflow-hidden ${sponsor.bg}`}>
      <button
        onClick={(e) => { e.preventDefault(); setDismissed(true); }}
        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full text-slate-600 hover:text-slate-400 hover:bg-slate-700/50 transition-colors z-10"
        title="非表示にする"
      >
        <X className="w-3 h-3" />
      </button>

      <a
        href={sponsor.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block px-4 py-3 transition-all hover:opacity-80"
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${sponsor.color} bg-slate-800/50`}>
                PR · {sponsor.label}
              </span>
              {sponsor.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">
                  {sponsor.badge}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-200 leading-snug">{sponsor.title}</p>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{sponsor.desc}</p>
            <span className={`inline-block mt-2 text-[11px] font-bold ${sponsor.color} underline underline-offset-2`}>
              {sponsor.cta} →
            </span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-1" />
        </div>
      </a>
    </div>
  );
}
