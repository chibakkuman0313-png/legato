import { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, ExternalLink, AlertTriangle } from 'lucide-react';
import { decryptAssets } from '../hooks/useShareLink';
import { DigitalAsset, CATEGORY_LABELS, CATEGORY_COLORS } from '../types/asset';

interface ViewerPageProps {
  token: string;
}

export function ViewerPage({ token }: ViewerPageProps) {
  const [passphrase, setPassphrase] = useState('');
  const [show, setShow] = useState(false);
  const [assets, setAssets] = useState<DigitalAsset[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUnlock() {
    if (!passphrase) return;
    setLoading(true);
    setError(null);
    try {
      const result = await decryptAssets(token, passphrase);
      setAssets(result);
    } catch {
      setError('パスフレーズが正しくありません。本人から受け取ったパスフレーズを入力してください。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="max-w-lg mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Legato</h1>
            <p className="text-xs text-slate-400">デジタル資産 閲覧専用モード</p>
          </div>
        </div>

        {!assets ? (
          /* ── ロック解除フォーム ── */
          <div className="bg-slate-800/50 border border-slate-700/40 rounded-2xl p-6 space-y-4">
            <div className="text-center space-y-2 pb-2">
              <Lock className="w-10 h-10 mx-auto text-indigo-400" />
              <h2 className="text-base font-semibold text-white">パスフレーズを入力</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                このページは暗号化されています。<br />
                資産を登録した本人からパスフレーズを受け取ってください。
              </p>
            </div>

            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={passphrase}
                onChange={e => setPassphrase(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                placeholder="パスフレーズを入力..."
                className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-600 rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
              />
              <button
                onClick={() => setShow(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            <button
              onClick={handleUnlock}
              disabled={!passphrase || loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              {loading ? '復号中...' : '開く'}
            </button>

            <p className="text-center text-xs text-slate-600">
              このページにアクセスできるのはURLを持つ人のみです
            </p>
          </div>
        ) : (
          /* ── 資産一覧 ── */
          <div className="space-y-4">
            <div className="bg-green-900/20 border border-green-700/40 rounded-xl px-4 py-3 flex items-center gap-3">
              <Shield className="w-4 h-4 text-green-400" />
              <div>
                <p className="text-sm font-semibold text-green-300">復号成功</p>
                <p className="text-xs text-green-400/80">{assets.length}件の資産情報を表示しています（読み取り専用）</p>
              </div>
            </div>

            <div className="space-y-2">
              {assets.map(asset => {
                const colors = CATEGORY_COLORS[asset.category];
                return (
                  <div key={asset.id} className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
                        {CATEGORY_LABELS[asset.category]}
                      </span>
                      <span className="text-sm font-semibold text-white">{asset.name}</span>
                      {asset.monthlyCost && (
                        <span className="ml-auto text-xs text-slate-400">¥{asset.monthlyCost.toLocaleString()}/月</span>
                      )}
                    </div>
                    {asset.url && (
                      <a href={asset.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                        <ExternalLink className="w-3 h-3" />{asset.url}
                      </a>
                    )}
                    {asset.loginId && (
                      <p className="text-xs text-slate-300"><span className="text-slate-500">ログインID: </span>{asset.loginId}</p>
                    )}
                    {asset.memo && (
                      <p className="text-xs text-slate-400 leading-relaxed">{asset.memo}</p>
                    )}
                    {asset.cancelGuide && (
                      <div className="bg-red-950/30 border border-red-800/30 rounded-lg p-2.5">
                        <p className="text-xs font-semibold text-red-300 mb-1">解約手順</p>
                        <p className="text-xs text-slate-400 whitespace-pre-wrap">{asset.cancelGuide}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
