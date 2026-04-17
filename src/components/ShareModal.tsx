import { useState } from 'react';
import { X, QrCode, Link2, Eye, EyeOff, Copy, Check, AlertTriangle, Mail, Download } from 'lucide-react';
import { encryptAssets, buildViewUrl, generateQrDataUrl } from '../hooks/useShareLink';
import { DigitalAsset } from '../types/asset';

interface ShareModalProps {
  assets: DigitalAsset[];
  onClose: () => void;
}

export function ShareModal({ assets, onClose }: ShareModalProps) {
  const [step, setStep] = useState<'setup' | 'qr'>('setup');
  const [passphrase, setPassphrase] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [viewUrl, setViewUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passphraseOk = passphrase.length >= 6 && passphrase === confirm;

  async function handleGenerate() {
    if (!passphraseOk) {
      setError('パスフレーズが一致しないか6文字未満です');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await encryptAssets(assets, passphrase);
      const url   = buildViewUrl(token);
      setViewUrl(url);
      const qr = await generateQrDataUrl(url);
      setQrDataUrl(qr);
      setStep('qr');
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(viewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadQr() {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'legacyvault-qr.png';
    a.click();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-slate-900 border border-slate-700/60 rounded-t-2xl sm:rounded-2xl shadow-2xl">

        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">閲覧専用リンクを生成</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 max-h-[80vh] overflow-y-auto">
          {step === 'setup' ? (
            <div className="space-y-4">
              <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-xl p-3.5 text-xs text-indigo-300 leading-relaxed">
                資産情報をAES-256で暗号化し、QRコード＆URLに変換します。
                パスフレーズを知っている人だけが閲覧できます。<br />
                <span className="text-indigo-400 font-semibold">パスフレーズは別の手段で家族に伝えてください。</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">パスフレーズ（6文字以上）</label>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    value={passphrase}
                    onChange={e => { setPassphrase(e.target.value); setError(null); }}
                    placeholder="家族に伝えるパスフレーズ"
                    className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-600 rounded-lg px-3 py-2.5 pr-9 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                  />
                  <button onClick={() => setShow(p => !p)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">パスフレーズ（確認）</label>
                <input
                  type={show ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setError(null); }}
                  placeholder="もう一度入力"
                  className={`w-full bg-slate-800 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all ${
                    confirm && !passphraseOk ? 'border-red-500' : 'border-slate-700 focus:border-indigo-600'
                  }`}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <p className="text-xs text-red-300">{error}</p>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={!passphraseOk || loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                {loading ? '暗号化中...' : 'QR・リンクを生成'}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* QRコード */}
              {qrDataUrl && (
                <div className="flex flex-col items-center gap-3">
                  <img src={qrDataUrl} alt="QRコード" className="w-48 h-48 rounded-xl border border-slate-700/60" />
                  <button
                    onClick={handleDownloadQr}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />QRをダウンロード
                  </button>
                </div>
              )}

              {/* URL */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  <Link2 className="w-3 h-3 inline mr-1" />閲覧用URL
                </label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={viewUrl}
                    className="flex-1 min-w-0 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-400 outline-none truncate"
                  />
                  <button
                    onClick={handleCopy}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-indigo-700/50 hover:bg-indigo-700 border border-indigo-600/40 text-indigo-300 rounded-lg text-xs font-medium transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'コピー済み' : 'コピー'}
                  </button>
                </div>
              </div>

              {/* 注意事項 */}
              <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-3.5 space-y-1.5">
                <p className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />共有時の注意
                </p>
                <ul className="text-xs text-amber-400/80 space-y-1 list-disc list-inside leading-relaxed">
                  <li>URLとパスフレーズは<strong className="text-amber-300">別々の手段</strong>で渡してください</li>
                  <li>URLは誰でもアクセスできます。パスフレーズなしでは中身は見えません</li>
                  <li>新しいQRを生成するたびに前のリンクは無効になりません（再生成を推奨）</li>
                </ul>
              </div>

              <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/40 rounded-xl p-3.5">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  デッドマンズスイッチ発動時のメールにも、このQRコードとURLが自動添付されます。
                </p>
              </div>

              <button
                onClick={() => { setStep('setup'); setPassphrase(''); setConfirm(''); setQrDataUrl(null); }}
                className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-2.5 rounded-xl text-sm transition-colors"
              >
                新しいリンクを生成
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
