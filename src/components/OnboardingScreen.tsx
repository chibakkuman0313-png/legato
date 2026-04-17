import { useState } from 'react';
import {
  Shield, Smartphone, Lock, Cloud, Sparkles,
  ChevronRight, ChevronLeft, Check, AlertTriangle,
} from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const STEPS = [
  {
    icon: Shield,
    iconBg: 'from-indigo-600 to-purple-600',
    title: 'Legatoへようこそ',
    subtitle: '大切な人へつなぐ、デジタル遺産管理',
    points: [
      { label: 'デジタル資産を安全に記録' },
      { label: '緊急時に家族へ自動で通知' },
      { label: 'PDF・QR・クラウド出力対応' },
    ],
  },
  {
    icon: Smartphone,
    iconBg: 'from-emerald-600 to-teal-600',
    title: 'データは、このデバイスだけ',
    subtitle: 'サーバーに送信しません',
    points: [
      { label: 'お客様の情報はブラウザ内のみ', ok: true },
      { label: 'アカウント登録・メール不要', ok: true },
      { label: '本名・住所・電話番号も不要', ok: true },
      { label: '当社サーバーは内容を見れません', ok: true },
    ],
    highlight: {
      title: 'どういうこと？',
      body: 'スマホの「カレンダーアプリ」のように、入力したデータは**あなたのスマホの中だけ**に保存されます。インターネット経由でどこかに送られることはありません。',
    },
  },
  {
    icon: Lock,
    iconBg: 'from-amber-600 to-orange-600',
    title: '6桁のPINで簡単ロック',
    subtitle: 'パスワードを覚える必要はありません',
    points: [
      { label: '100万通りの組み合わせ', ok: true },
      { label: 'SHA-256ハッシュ化（非可逆暗号）', ok: true },
      { label: '5回間違えるとロックアウト', ok: true },
      { label: '銀行アプリと同等のセキュリティ', ok: true },
    ],
    highlight: {
      title: 'PINを忘れないで',
      body: 'PINを忘れるとデータは復元できません。覚えやすい6桁を選び、紙にも控えておくことをおすすめします。',
      warning: true,
    },
  },
  {
    icon: Cloud,
    iconBg: 'from-sky-600 to-indigo-600',
    title: '必ずバックアップを取ってください',
    subtitle: 'データ消失を防ぐ最重要ポイント',
    points: [
      { label: 'ブラウザキャッシュ消去で全消去', warn: true },
      { label: 'スマホ紛失・故障で全消去', warn: true },
      { label: 'JSONバックアップ（手動）', ok: true },
      { label: 'クラウドバックアップ（暗号化）', ok: true },
      { label: 'PDF印刷で紙保管も可', ok: true },
    ],
    highlight: {
      title: '推奨',
      body: 'セットアップ完了後、「データ管理」画面から**JSONエクスポート**を実行し、Googleドライブやメールの下書きなどに保管してください。',
    },
  },
  {
    icon: Sparkles,
    iconBg: 'from-violet-600 to-pink-600',
    title: '準備ができました',
    subtitle: '次のステップで6桁PINを設定します',
    points: [
      { label: 'このあとの画面でPINを2回入力' },
      { label: 'PINはハッシュ化されて保存' },
      { label: '次回からPINでロック解除' },
    ],
    finalButton: 'PINを設定する',
  },
];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  function next() {
    if (isLast) onComplete();
    else setStep(s => s + 1);
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col pt-safe pb-safe">
      {/* プログレスバー */}
      <div className="px-4 pt-4">
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all ${
                i <= step ? 'bg-indigo-500' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
        <div className="text-right text-[10px] text-slate-500 mt-1.5">
          {step + 1} / {STEPS.length}
        </div>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-md space-y-6">

          {/* アイコン */}
          <div className="flex justify-center">
            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${current.iconBg} flex items-center justify-center shadow-2xl shadow-indigo-900/30`}>
              <Icon className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* タイトル */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {current.title}
            </h1>
            <p className="text-sm text-slate-400">{current.subtitle}</p>
          </div>

          {/* ポイントリスト */}
          <div className="space-y-2.5">
            {current.points.map((p, i) => {
              const icon = 'ok' in p && p.ok
                ? <Check className="w-4 h-4 text-green-400" />
                : 'warn' in p && p.warn
                  ? <AlertTriangle className="w-4 h-4 text-amber-400" />
                  : <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />;

              return (
                <div key={i} className="flex items-center gap-3 bg-slate-800/40 border border-slate-700/40 rounded-xl px-4 py-3">
                  <div className="w-6 h-6 rounded-full bg-slate-900/60 flex items-center justify-center flex-shrink-0">
                    {icon}
                  </div>
                  <p className="text-sm text-slate-200">{p.label}</p>
                </div>
              );
            })}
          </div>

          {/* ハイライト解説 */}
          {'highlight' in current && current.highlight && (
            <div className={`rounded-xl p-4 border ${
              'warning' in current.highlight && current.highlight.warning
                ? 'bg-amber-900/20 border-amber-700/40'
                : 'bg-indigo-900/20 border-indigo-700/40'
            }`}>
              <p className={`text-xs font-bold mb-1.5 ${
                'warning' in current.highlight && current.highlight.warning
                  ? 'text-amber-300'
                  : 'text-indigo-300'
              }`}>
                💡 {current.highlight.title}
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                {current.highlight.body.split('**').map((chunk, i) =>
                  i % 2 === 1 ? <strong key={i} className="text-white">{chunk}</strong> : chunk
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ナビゲーションボタン */}
      <div className="px-5 pb-6 pt-3 border-t border-slate-800 bg-slate-950 flex items-center gap-3">
        {!isFirst && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-1 px-4 py-3 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            戻る
          </button>
        )}
        <button
          onClick={next}
          className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-900/40 transition-all"
        >
          {isLast ? (current.finalButton ?? '始める') : '次へ'}
          {!isLast && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* スキップボタン（任意） */}
      {!isLast && (
        <button
          onClick={onComplete}
          className="absolute top-4 right-4 text-xs text-slate-500 hover:text-slate-300 px-3 py-1 transition-colors"
        >
          スキップ
        </button>
      )}
    </div>
  );
}
