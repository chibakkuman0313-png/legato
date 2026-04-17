import { useState } from 'react';
import {
  X, BookOpen, ChevronRight, Lock, Building2, CreditCard,
  Tv, Share2, Shield as ShieldIcon, TrendingUp, Bitcoin, FileText,
} from 'lucide-react';
import { usePremium } from '../hooks/usePremium';
import { CANCEL_TEMPLATES, WILL_TEMPLATES, CancelTemplate, WillTemplate } from '../hooks/useTemplates';

// カテゴリアイコンマッピング
const CAT_ICONS: Record<string, React.ReactNode> = {
  bank:         <Building2 className="w-4 h-4" />,
  subscription: <Tv className="w-4 h-4" />,
  social:       <Share2 className="w-4 h-4" />,
  insurance:    <ShieldIcon className="w-4 h-4" />,
  investment:   <TrendingUp className="w-4 h-4" />,
  crypto:       <Bitcoin className="w-4 h-4" />,
  other:        <CreditCard className="w-4 h-4" />,
};

type TemplateMode = 'cancel' | 'will';

interface TemplateModalProps {
  mode: TemplateMode;
  onSelect: (text: string) => void;
  onClose: () => void;
}

export function TemplateModal({ mode, onSelect, onClose }: TemplateModalProps) {
  const { isPremium } = usePremium();
  const [selected, setSelected] = useState<CancelTemplate | WillTemplate | null>(null);

  const items = mode === 'cancel' ? CANCEL_TEMPLATES : WILL_TEMPLATES;
  const title = mode === 'cancel' ? '解約手順テンプレート' : 'エンディングノート記入例';

  function handleApply() {
    if (!selected) return;
    const text = mode === 'cancel'
      ? (selected as CancelTemplate).steps
      : (selected as WillTemplate).body;
    onSelect(text);
    onClose();
  }

  // Premiumでない場合はロック表示
  if (!isPremium) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full sm:max-w-sm bg-slate-900 border border-slate-700/60 rounded-t-2xl sm:rounded-2xl p-6 text-center space-y-4">
          <Lock className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">Premium限定機能</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            テンプレート集はPremiumプランでご利用いただけます。
          </p>
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-slate-900 border border-slate-700/60 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">

        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-700/40 flex-shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">{title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* リスト or 詳細 */}
        <div className="flex-1 overflow-y-auto">
          {!selected ? (
            <div className="divide-y divide-slate-700/30">
              {items.map((item, i) => {
                const isCancel = mode === 'cancel';
                const label = isCancel
                  ? (item as CancelTemplate).service
                  : (item as WillTemplate).label;
                const catIcon = isCancel
                  ? CAT_ICONS[(item as CancelTemplate).category] || <FileText className="w-4 h-4" />
                  : <FileText className="w-4 h-4" />;

                return (
                  <button
                    key={i}
                    onClick={() => setSelected(item)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 flex-shrink-0">
                      {catIcon}
                    </div>
                    <span className="text-sm text-slate-200 flex-1">{label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* 戻るボタン */}
              <button
                onClick={() => setSelected(null)}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                ← 一覧に戻る
              </button>

              {/* プレビュー */}
              <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-white mb-2">
                  {mode === 'cancel'
                    ? (selected as CancelTemplate).service
                    : (selected as WillTemplate).label}
                </h4>
                <pre className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                  {mode === 'cancel'
                    ? (selected as CancelTemplate).steps
                    : (selected as WillTemplate).body}
                </pre>
              </div>

              {/* 挿入ボタン */}
              <button
                onClick={handleApply}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors"
              >
                このテンプレートを使用する
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
