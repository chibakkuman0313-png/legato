import { useState } from 'react';
import { Shield, Lock, Crown, ChevronDown, Sparkles } from 'lucide-react';
import { usePremium, PLAN_LABELS, PlanType, FREE_ASSET_LIMIT } from '../hooks/usePremium';
import { UpgradeModal } from './UpgradeModal';

interface HeaderProps {
  totalAssets: number;
  totalMonthlyCost: number;
  lastLogin: string;
}

const PLAN_STYLES: Record<PlanType, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  standard: {
    bg: 'bg-slate-700/60',
    text: 'text-slate-300',
    border: 'border-slate-600/50',
    icon: <Shield className="w-3 h-3" />,
  },
  premium: {
    bg: 'bg-gradient-to-r from-indigo-600/80 to-purple-600/80',
    text: 'text-white',
    border: 'border-indigo-500/50',
    icon: <Crown className="w-3 h-3" />,
  },
  family: {
    bg: 'bg-gradient-to-r from-emerald-600/80 to-teal-600/80',
    text: 'text-white',
    border: 'border-emerald-500/50',
    icon: <Crown className="w-3 h-3" />,
  },
};

export function Header({ totalAssets, totalMonthlyCost, lastLogin }: HeaderProps) {
  const { currentPlan, isPremium, trialDaysLeft, status } = usePremium();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const formattedLastLogin = new Date(lastLogin).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const planStyle = PLAN_STYLES[currentPlan];

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-700/60">
        <div className="max-w-6xl mx-auto px-4 py-4">

          {/* プランバッジ（トップ） */}
          <button
            onClick={() => setShowUpgrade(true)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border ${planStyle.bg} ${planStyle.border} mb-4 transition-all hover:opacity-90 active:scale-[0.99]`}
          >
            <div className="flex items-center gap-2">
              <span className={planStyle.text}>{planStyle.icon}</span>
              <span className={`text-xs font-bold ${planStyle.text}`}>
                {PLAN_LABELS[currentPlan]}プラン
              </span>
              {status === 'trial' && (
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-full font-medium">
                  トライアル残り{trialDaysLeft}日
                </span>
              )}
              {!isPremium && (
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-600/40 text-slate-400 rounded-full font-medium">
                  資産{totalAssets}/{FREE_ASSET_LIMIT}件
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {!isPremium && (
                <span className="text-[10px] text-indigo-400 font-medium flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3" />
                  アップグレード
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 ${planStyle.text} opacity-60`} />
            </div>
          </button>

          {/* ロゴ・タイトル */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/50">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Legato</h1>
                <p className="text-xs text-slate-400">デジタル資産・継承管理</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Lock className="w-3 h-3" />
              <span>ローカル暗号化保存</span>
            </div>
          </div>

          {/* サマリーカード */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-white">{totalAssets}</div>
              <div className="text-xs text-slate-400 mt-0.5">登録資産数</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-white">
                ¥{totalMonthlyCost.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">月額合計</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-3 text-center">
              <div className="text-sm font-semibold text-white leading-tight">{formattedLastLogin}</div>
              <div className="text-xs text-slate-400 mt-0.5">最終ログイン</div>
            </div>
          </div>
        </div>
      </header>

      {/* アップグレードモーダル */}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  );
}
