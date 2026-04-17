import { Shield, BarChart3 } from 'lucide-react';

interface TrackingConsentProps {
  onGrant: () => void;
  onDeny:  () => void;
}

/**
 * ATT準拠のトラッキング同意ダイアログ
 * 初回起動時に表示。Apple審査要件を満たす。
 */
export function TrackingConsent({ onGrant, onDeny }: TrackingConsentProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden">

        {/* アイコン */}
        <div className="flex flex-col items-center pt-8 pb-4 px-6">
          <div className="w-14 h-14 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-4">
            <BarChart3 className="w-7 h-7 text-indigo-400" />
          </div>

          <h2 className="text-lg font-bold text-white text-center leading-tight">
            "Legato"がアクティビティの<br />トラッキングを求めています
          </h2>

          <p className="text-sm text-slate-400 text-center mt-3 leading-relaxed">
            アプリの改善や最適な情報提供のため、利用状況データの匿名収集を許可してください。
          </p>
        </div>

        {/* 詳細 */}
        <div className="px-6 pb-4">
          <div className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-3 space-y-2">
            <div className="flex items-start gap-2">
              <Shield className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                個人を特定する情報は収集しません
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                収集データはアプリ改善目的にのみ使用されます
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                設定からいつでも変更できます
              </p>
            </div>
          </div>
        </div>

        {/* ボタン */}
        <div className="px-6 pb-6 space-y-2">
          <button
            onClick={onGrant}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors text-sm"
          >
            トラッキングを許可
          </button>
          <button
            onClick={onDeny}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600/60 text-slate-300 font-semibold rounded-xl transition-colors text-sm"
          >
            Appにトラッキングしないように要求
          </button>
        </div>
      </div>
    </div>
  );
}
