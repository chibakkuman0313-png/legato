import { useState } from 'react';
import {
  X, Mic, Sparkles, Shield, FileText, Users, Check,
  BookOpen, Palette, Infinity, BarChart3,
} from 'lucide-react';
import { usePremium, PLAN_LABELS, FREE_ASSET_LIMIT } from '../hooks/usePremium';
import { getStripeUrl } from '../config/stripe';

interface UpgradeModalProps {
  onClose: () => void;
}

type PlanTab = 'premium' | 'family';

const PREMIUM_FEATURES = [
  { icon: <Infinity className="w-4 h-4" />,    label: '無制限の資産登録',       desc: `スタンダードは${FREE_ASSET_LIMIT}件まで。プレミアムなら無制限に登録できます` },
  { icon: <Mic className="w-4 h-4" />,          label: '音声メモ録音・再生',     desc: '各資産に家族へのメッセージを音声で残せます' },
  { icon: <BookOpen className="w-4 h-4" />,     label: 'テンプレート集',         desc: '解約手順・エンディングノートの記入例をプリセット提供' },
  { icon: <Palette className="w-4 h-4" />,      label: 'テーマカスタマイズ',     desc: 'フォントやアクセントカラーを自由に変更' },
  { icon: <Shield className="w-4 h-4" />,       label: '広告なしの快適体験',     desc: 'おすすめサービス枠が非表示になります' },
  { icon: <FileText className="w-4 h-4" />,     label: 'PDF印刷（無制限）',      desc: '無制限で資産台帳をPDF生成できます' },
  { icon: <BarChart3 className="w-4 h-4" />,    label: '詳細レポート',           desc: '資産の統計・カテゴリ分析など詳細データを閲覧' },
];

const FAMILY_EXTRAS = [
  { icon: <Users className="w-4 h-4" />,  label: '家族3人まで閲覧招待', desc: '各自のPINで個別ログインできます' },
  { icon: <Shield className="w-4 h-4" />, label: 'Premiumの全機能',     desc: '音声メモ・テンプレート・広告非表示すべて含む' },
];

type Billing = 'monthly' | 'yearly';

export function UpgradeModal({ onClose }: UpgradeModalProps) {
  const { startTrial, currentPlan } = usePremium();
  const [tab, setTab] = useState<PlanTab>('premium');
  const [billing, setBilling] = useState<Billing>('monthly');

  async function handleTrial() {
    await startTrial(tab);
    onClose();
  }

  function handlePurchase() {
    const key = `${tab}_${billing}` as const;
    const url = getStripeUrl(key);
    if (!url) {
      alert(
        '決済システムは準備中です（Stripe連携準備中）。\n' +
        '30日間無料トライアルをお試しください。'
      );
      return;
    }
    // Stripe Payment Linkへ遷移。決済成功後は ?premium_success=1&plan=... で戻ってくる
    window.location.href = url;
  }

  const isPremiumTab = tab === 'premium';

  // 既にプレミアムプランの場合
  if (currentPlan !== 'standard') {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full sm:max-w-md bg-slate-900 border border-slate-700/60 rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 text-center space-y-4">
          <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center ${
            currentPlan === 'family'
              ? 'bg-gradient-to-br from-emerald-600 to-teal-600'
              : 'bg-gradient-to-br from-indigo-600 to-purple-600'
          }`}>
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">
            {PLAN_LABELS[currentPlan]}プラン利用中
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            現在{PLAN_LABELS[currentPlan]}プランをご利用いただいています。<br />
            すべての機能がご利用可能です。
          </p>
          {currentPlan === 'premium' && (
            <button
              onClick={() => {
                alert('ファミリープランへの変更は準備中です。');
              }}
              className="w-full py-2.5 bg-emerald-700/40 hover:bg-emerald-700/60 border border-emerald-600/40 text-emerald-300 rounded-xl text-sm font-semibold transition-colors"
            >
              ファミリープランへ変更
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm font-semibold transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-slate-900 border border-slate-700/60 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">

        {/* ── グラデーションヘッダー ── */}
        <div className={`px-5 pt-6 pb-5 ${
          isPremiumTab
            ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900'
            : 'bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900'
        }`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* プランタブ */}
          <div className="flex gap-1 bg-black/20 rounded-lg p-1 mb-4">
            <button
              onClick={() => setTab('premium')}
              className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                isPremiumTab
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              プレミアム
            </button>
            <button
              onClick={() => setTab('family')}
              className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                !isPremiumTab
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ファミリー
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isPremiumTab ? 'bg-indigo-500/30' : 'bg-emerald-500/30'
            }`}>
              {isPremiumTab
                ? <Sparkles className="w-4 h-4 text-indigo-300" />
                : <Users className="w-4 h-4 text-emerald-300" />}
            </div>
            <span className={`text-xs font-bold tracking-widest uppercase ${
              isPremiumTab ? 'text-indigo-300' : 'text-emerald-300'
            }`}>
              Legato {isPremiumTab ? 'Premium' : 'Family'}
            </span>
          </div>

          <h2 className="text-xl font-bold text-white leading-tight">
            {isPremiumTab
              ? <>すべての機能を<br />フルに活用</>
              : <>家族みんなで<br />安心を共有</>}
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            {isPremiumTab
              ? '無制限の資産登録、テーマカスタマイズ、テンプレートなどすべてを解放。'
              : 'Premium全機能に加え、家族3人までを閲覧者として招待できます。'}
          </p>

          {/* 月額/年額 切替 */}
          <div className="flex gap-1 bg-black/20 rounded-lg p-1 mt-4 mb-3 max-w-[220px]">
            <button
              onClick={() => setBilling('monthly')}
              className={`flex-1 py-1 rounded-md text-[11px] font-bold transition-all ${
                billing === 'monthly'
                  ? 'bg-white/15 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              月額
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`flex-1 py-1 rounded-md text-[11px] font-bold transition-all relative ${
                billing === 'yearly'
                  ? 'bg-white/15 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              年額
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-green-500 text-white text-[9px] font-black rounded">17%OFF</span>
            </button>
          </div>

          {/* 価格 */}
          <div className="flex items-end gap-2">
            <div>
              <span className="text-3xl font-black text-white">
                ¥{billing === 'monthly'
                  ? (isPremiumTab ? '400' : '600')
                  : (isPremiumTab ? '4,000' : '6,000')}
              </span>
              <span className="text-slate-300 text-sm ml-1">
                /{billing === 'monthly' ? '月' : '年'}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {billing === 'yearly'
              ? `実質 ¥${isPremiumTab ? '333' : '500'}/月`
              : `年払いなら ¥${isPremiumTab ? '4,000' : '6,000'}/年`}
          </p>
        </div>

        {/* ── 特典リスト ── */}
        <div className="px-5 py-4 space-y-3">
          {(isPremiumTab ? PREMIUM_FEATURES : [...PREMIUM_FEATURES, ...FAMILY_EXTRAS]).map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isPremiumTab ? 'bg-indigo-900/50 text-indigo-400' : 'bg-emerald-900/50 text-emerald-400'
              }`}>
                {f.icon}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-white">{f.label}</p>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── 比較テーブル ── */}
        <div className="px-5 pb-4">
          <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl overflow-hidden">
            <div className="grid grid-cols-3 text-center text-[11px] font-bold py-2 border-b border-slate-700/40">
              <span className="text-slate-500">機能</span>
              <span className="text-slate-400">スタンダード</span>
              <span className={isPremiumTab ? 'text-indigo-400' : 'text-emerald-400'}>
                {isPremiumTab ? 'プレミアム' : 'ファミリー'}
              </span>
            </div>
            {[
              ['資産登録', `${FREE_ASSET_LIMIT}件`, '無制限'],
              ['テンプレート', '×', '○'],
              ['音声メモ', '×', '○'],
              ['テーマ変更', '×', '○'],
              ['広告', 'あり', 'なし'],
              ['PDF出力', '月1回', '無制限'],
            ].map(([feature, free, paid], i) => (
              <div key={i} className="grid grid-cols-3 text-center text-[11px] py-1.5 border-b border-slate-700/20 last:border-0">
                <span className="text-slate-400">{feature}</span>
                <span className="text-slate-500">{free}</span>
                <span className={isPremiumTab ? 'text-indigo-300 font-medium' : 'text-emerald-300 font-medium'}>
                  {paid}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTAボタン群 ── */}
        <div className="px-5 pb-6 space-y-2.5">
          <button
            onClick={handlePurchase}
            className={`w-full font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg ${
              isPremiumTab
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {isPremiumTab ? 'プレミアムを始める' : 'ファミリーを始める'}
          </button>

          <button
            onClick={handleTrial}
            className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600/60 text-slate-300 hover:text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            30日間無料トライアルを試す
          </button>

          <p className="text-center text-xs text-slate-500">
            クレジットカード不要 · いつでもキャンセル可能
          </p>
        </div>
      </div>
    </div>
  );
}
