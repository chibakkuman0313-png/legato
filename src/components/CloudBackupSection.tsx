import { useState } from 'react';
import {
  Cloud, CloudUpload, CloudDownload,
  Settings2, ChevronDown, ChevronUp,
  Check, AlertTriangle, Clock, Eye, EyeOff,
} from 'lucide-react';
import { useCloudBackup, CloudConfig } from '../hooks/useCloudBackup';
import { useAssets } from '../hooks/useAssets';

// ────────────────────────────────────────────────────────────
// Supabase セットアップ用 SQL（コピー用）
// ────────────────────────────────────────────────────────────
const SETUP_SQL = `CREATE TABLE legacyvault_backups (
  backup_key    TEXT PRIMARY KEY,
  encrypted_data TEXT NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE legacyvault_backups
  ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all"
  ON legacyvault_backups FOR ALL USING (true);`;

export function CloudBackupSection() {
  const { assets, importAssets } = useAssets();
  const {
    config, saveConfig,
    uploadBackup, downloadBackup,
    status, lastSync, error, isConfigured,
  } = useCloudBackup();

  const [showConfig,     setShowConfig]     = useState(!isConfigured);
  const [showGuide,      setShowGuide]      = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [sqlCopied,      setSqlCopied]      = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState(false);

  const [form, setForm] = useState<CloudConfig>({
    supabaseUrl:     config.supabaseUrl     ?? '',
    supabaseAnonKey: config.supabaseAnonKey ?? '',
    backupId:        config.backupId        ?? '',
    passphrase:      config.passphrase      ?? '',
  });

  const formOk =
    form.supabaseUrl.startsWith('https://') &&
    form.supabaseAnonKey.length > 20 &&
    form.backupId.trim().length > 0 &&
    form.passphrase.length >= 6;

  function handleSaveConfig() {
    saveConfig(form);
    setShowConfig(false);
  }

  async function handleCopySQL() {
    await navigator.clipboard.writeText(SETUP_SQL);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  }

  async function handleUpload() {
    await uploadBackup(assets);
  }

  async function handleDownload() {
    if (!restoreConfirm) {
      setRestoreConfirm(true);
      setTimeout(() => setRestoreConfirm(false), 4000);
      return;
    }
    const restored = await downloadBackup();
    if (restored) {
      importAssets(restored);
      setRestoreConfirm(false);
    }
  }

  const isUploading   = status === 'uploading';
  const isDownloading = status === 'downloading';
  const isBusy        = isUploading || isDownloading;
  const isSuccess     = status === 'success';
  const isError       = status === 'error';

  return (
    <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl overflow-hidden">

      {/* ── ヘッダー ── */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-700/40">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-semibold text-white">クラウドバックアップ</h3>
          {isConfigured && (
            <span className="text-[10px] bg-sky-900/40 border border-sky-700/40 text-sky-400 px-1.5 py-0.5 rounded-full">
              設定済み
            </span>
          )}
        </div>
        <button
          onClick={() => setShowConfig(p => !p)}
          title="設定"
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-3">

        {/* 最終同期 */}
        {lastSync && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            最終同期：{new Date(lastSync).toLocaleDateString('ja-JP', {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </div>
        )}

        {/* エラー表示 */}
        {isError && error && (
          <div className="flex items-start gap-2 bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-300 leading-relaxed">{error}</p>
          </div>
        )}

        {/* ── 設定フォーム ── */}
        {showConfig && (
          <div className="space-y-3 bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">

            {/* セットアップガイド */}
            <button
              onClick={() => setShowGuide(p => !p)}
              className="w-full flex items-center justify-between text-xs text-sky-400 hover:text-sky-300 transition-colors"
            >
              <span className="font-medium">📋 Supabase セットアップ方法</span>
              {showGuide
                ? <ChevronUp className="w-3.5 h-3.5" />
                : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showGuide && (
              <div className="bg-sky-950/30 border border-sky-800/30 rounded-lg p-3 space-y-3">
                <ol className="text-xs text-sky-300/90 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 underline"
                    >
                      supabase.com
                    </a>{' '}
                    で無料アカウントを作成し、新規プロジェクトを作成
                  </li>
                  <li>SQL Editor を開き、以下のSQLを実行</li>
                  <li>Settings → API から URL と anon key をコピー</li>
                </ol>

                {/* SQL コードブロック */}
                <div className="relative">
                  <pre className="bg-slate-900/80 rounded-lg p-3 text-[10px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
                    {SETUP_SQL}
                  </pre>
                  <button
                    onClick={handleCopySQL}
                    className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-[10px] transition-colors"
                  >
                    {sqlCopied ? <><Check className="w-3 h-3 text-green-400" />コピー済み</> : 'SQLをコピー'}
                  </button>
                </div>
              </div>
            )}

            {/* Supabase URL */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Supabase URL
              </label>
              <input
                value={form.supabaseUrl}
                onChange={e => setForm(p => ({ ...p, supabaseUrl: e.target.value }))}
                placeholder="https://xxxxxxxxxxxx.supabase.co"
                className="w-full bg-slate-800 border border-slate-700 focus:border-sky-600 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-sky-500/30 transition-all"
              />
            </div>

            {/* Anon Key */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Anon Key
              </label>
              <input
                value={form.supabaseAnonKey}
                onChange={e => setForm(p => ({ ...p, supabaseAnonKey: e.target.value }))}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="w-full bg-slate-800 border border-slate-700 focus:border-sky-600 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-sky-500/30 transition-all"
              />
            </div>

            {/* バックアップID */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                バックアップID
                <span className="text-slate-600 font-normal ml-1">（自分で決める識別子）</span>
              </label>
              <input
                value={form.backupId}
                onChange={e => setForm(p => ({ ...p, backupId: e.target.value }))}
                placeholder="例: yamada-taro-2026"
                className="w-full bg-slate-800 border border-slate-700 focus:border-sky-600 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-sky-500/30 transition-all"
              />
            </div>

            {/* 暗号化パスフレーズ */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                暗号化パスフレーズ
                <span className="text-slate-600 font-normal ml-1">（6文字以上）</span>
              </label>
              <div className="relative">
                <input
                  type={showPassphrase ? 'text' : 'password'}
                  value={form.passphrase}
                  onChange={e => setForm(p => ({ ...p, passphrase: e.target.value }))}
                  placeholder="クラウド上の暗号化キー"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-sky-600 rounded-lg px-3 py-2 pr-10 text-xs text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-sky-500/30 transition-all"
                />
                <button
                  onClick={() => setShowPassphrase(p => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassphrase
                    ? <EyeOff className="w-3.5 h-3.5" />
                    : <Eye    className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">
                クラウド上のデータはこのパスフレーズで暗号化されます。必ずメモしておいてください。
              </p>
            </div>

            <button
              onClick={handleSaveConfig}
              disabled={!formOk}
              className="w-full py-2.5 bg-sky-700 hover:bg-sky-600 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              設定を保存
            </button>
          </div>
        )}

        {/* ── アクションボタン ── */}
        <div className="flex gap-2">
          {/* クラウドに保存 */}
          <button
            onClick={handleUpload}
            disabled={!isConfigured || isBusy}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-all ${
              isSuccess
                ? 'bg-green-700/40 border border-green-700/50 text-green-300'
                : 'bg-sky-700/50 hover:bg-sky-600/60 border border-sky-600/40 text-sky-300 disabled:opacity-40'
            }`}
          >
            {isUploading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
                同期中...
              </>
            ) : isSuccess ? (
              <><Check className="w-3.5 h-3.5" />同期完了</>
            ) : (
              <><CloudUpload className="w-3.5 h-3.5" />クラウドに保存</>
            )}
          </button>

          {/* クラウドから復元 */}
          <button
            onClick={handleDownload}
            disabled={!isConfigured || isBusy}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-all ${
              restoreConfirm
                ? 'bg-amber-700/50 border border-amber-600/50 text-amber-200'
                : 'bg-slate-700/50 hover:bg-slate-600/60 border border-slate-600/40 text-slate-300 disabled:opacity-40'
            }`}
          >
            {isDownloading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
                復元中...
              </>
            ) : restoreConfirm ? (
              <>⚠ もう一度押して復元</>
            ) : (
              <><CloudDownload className="w-3.5 h-3.5" />クラウドから復元</>
            )}
          </button>
        </div>

        {!isConfigured && !showConfig && (
          <p className="text-xs text-slate-500 text-center">
            ⚙ 右上の設定ボタンからSupabaseを設定してください
          </p>
        )}

        <p className="text-[10px] text-slate-600 leading-relaxed text-center">
          データはアップロード前にAES-256-GCMで暗号化されます。
          Supabase側には暗号文のみ保存されます。
        </p>
      </div>
    </div>
  );
}
