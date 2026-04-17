import { useRef, useState } from 'react';
import {
  Download, Upload, FileText, CheckCircle2, AlertTriangle,
  Database, Shield, Trash2, TrendingUp, CreditCard,
  RotateCcw, BarChart3, Eye, EyeOff,
} from 'lucide-react';
import { useAssets } from '../hooks/useAssets';
import { useContacts } from '../hooks/useContacts';
import { usePremium, PLAN_LABELS } from '../hooks/usePremium';
import { useTheme } from '../hooks/useTheme';
import { useTracking } from '../hooks/useTracking';
import { exportBackup, importBackup, BackupData } from '../hooks/useBackup';
import { CATEGORY_LABELS, CATEGORY_COLORS, AssetCategory } from '../types/asset';
import { CloudBackupSection } from './CloudBackupSection';
import { ThemeCustomizer } from './ThemeCustomizer';
import { UpgradeModal } from './UpgradeModal';
import { LegalLinks } from './LegalPages';
import { SponsorBanner } from './SponsorBanner';

// ① PDF生成（jspdf + jspdf-autotable）
async function generatePDF(
  assets: ReturnType<typeof useAssets>['assets'],
  contacts: ReturnType<typeof useContacts>['contacts']
) {
  // 動的インポートでバンドルサイズを最適化
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // ── フォント設定（日本語対応のためUnicode使用）──
  doc.setFont('helvetica');

  // ── タイトル ──
  const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59);
  doc.text('Digital Asset Legacy List', 20, 22);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Exported: ${today}`, 20, 30);
  doc.text('LegacyVault - Keep this document in a safe place', 20, 36);

  // ── 区切り線 ──
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.5);
  doc.line(20, 40, 190, 40);

  // ── 資産テーブル ──
  doc.setFontSize(13);
  doc.setTextColor(30, 41, 59);
  doc.text('Digital Assets', 20, 50);

  const assetRows = assets.map(a => [
    CATEGORY_LABELS[a.category],
    a.name,
    a.loginId || '-',
    a.url || '-',
    a.monthlyCost != null ? `\u00a5${a.monthlyCost.toLocaleString()}` : '-',
    a.memo || '-',
  ]);

  autoTable(doc, {
    startY: 54,
    head: [['Category', 'Service', 'Login ID', 'URL', 'Monthly', 'Notes']],
    body: assetRows,
    theme: 'grid',
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 28 },
      2: { cellWidth: 38 },
      3: { cellWidth: 38 },
      4: { cellWidth: 18 },
      5: { cellWidth: 'auto' },
    },
    margin: { left: 20, right: 20 },
  });

  // ── 緊急連絡先テーブル ──
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? 100;
  const contactStartY = finalY + 12;

  if (contactStartY < 260) {
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    doc.text('Emergency Contacts', 20, contactStartY);

    if (contacts.length > 0) {
      autoTable(doc, {
        startY: contactStartY + 4,
        head: [['Name', 'Email', 'Relationship']],
        body: contacts.map(c => [c.name, c.email, c.relationship]),
        theme: 'grid',
        headStyles: { fillColor: [245, 158, 11], textColor: 255, fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
        margin: { left: 20, right: 20 },
      });
    } else {
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text('No contacts registered', 20, contactStartY + 10);
    }
  }

  // ── フッター ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `LegacyVault | Confidential - Page ${i} of ${pageCount}`,
      105, 290, { align: 'center' }
    );
  }

  doc.save(`legacyvault-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function Settings() {
  const { assets, importAssets } = useAssets();
  const { contacts, switchMessage, triggerDays } = useContacts();
  const { isPremium, currentPlan, status, trialDaysLeft, activate } = usePremium();
  const { theme, updateTheme } = useTheme(isPremium);
  const { consent, grant, deny, track } = useTracking();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importState, setImportState] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMsg, setImportMsg] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUpgradeFromTheme, setShowUpgradeFromTheme] = useState(false);
  const [restoreState, setRestoreState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // ② エクスポート
  function handleExport() {
    exportBackup({ assets, contacts, switchMessage, triggerDays });
  }

  // ② インポート
  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data: BackupData = await importBackup(file);
      importAssets(data.assets);
      setImportState('success');
      setImportMsg(`${data.assets.length}件の資産データを復元しました（${data.exportedAt.slice(0, 10)} バックアップ）`);
    } catch (err) {
      setImportState('error');
      setImportMsg(err instanceof Error ? err.message : 'インポートに失敗しました');
    }
    // ファイル入力をリセット
    e.target.value = '';
    setTimeout(() => setImportState('idle'), 4000);
  }

  // ① PDF生成
  async function handlePDF() {
    setPdfLoading(true);
    try {
      await generatePDF(assets, contacts);
    } finally {
      setPdfLoading(false);
    }
  }

  // データ全削除
  function handleDeleteAll() {
    if (showDeleteConfirm) {
      importAssets([]);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 4000);
    }
  }

  const totalMonthlyCost = assets.reduce((s, a) => s + (a.monthlyCost ?? 0), 0);
  const totalYearlyCost  = totalMonthlyCost * 12;
  const staleCount = assets.filter(a => {
    const ref = a.confirmedAt ?? a.updatedAt;
    return Math.floor((Date.now() - new Date(ref).getTime()) / 86400000) >= 180;
  }).length;

  // ④ カテゴリ別コスト集計
  const subscriptionAssets = assets.filter(a => a.monthlyCost != null && a.monthlyCost > 0);
  const costByCategory = subscriptionAssets.reduce<Partial<Record<AssetCategory, number>>>(
    (acc, a) => { acc[a.category] = (acc[a.category] ?? 0) + (a.monthlyCost ?? 0); return acc; }, {}
  );
  const maxCost = Math.max(...Object.values(costByCategory).map(v => v ?? 0), 1);

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      {/* ヘッダー */}
      <div className="bg-slate-900 border-b border-slate-700/60 px-4 py-5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-slate-700/60 rounded-lg flex items-center justify-center">
              <Database className="w-4 h-4 text-slate-300" />
            </div>
            <h2 className="text-lg font-bold text-white">データ管理</h2>
          </div>
          <p className="text-xs text-slate-400 ml-11">バックアップ・エクスポート・データ操作</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-5 space-y-5">

        {/* ステータスサマリー */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-white">{assets.length}</div>
            <div className="text-xs text-slate-400 mt-0.5">登録資産</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-white">¥{totalMonthlyCost.toLocaleString()}</div>
            <div className="text-xs text-slate-400 mt-0.5">月額合計</div>
          </div>
          <div className={`border rounded-xl p-3 text-center ${
            staleCount > 0
              ? 'bg-amber-900/20 border-amber-700/40'
              : 'bg-slate-800/50 border-slate-700/40'
          }`}>
            <div className={`text-2xl font-bold ${staleCount > 0 ? 'text-amber-400' : 'text-white'}`}>
              {staleCount}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">要確認</div>
          </div>
        </div>

        {/* ④ サブスクダッシュボード */}
        {subscriptionAssets.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">サブスク費用ダッシュボード</h3>
            </div>

            {/* 年間コスト強調 */}
            <div className="bg-purple-900/20 border border-purple-700/30 rounded-xl p-3.5 flex items-center gap-4">
              <CreditCard className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-purple-300">年間支払い合計</p>
                <p className="text-2xl font-black text-white">¥{totalYearlyCost.toLocaleString()}</p>
                <p className="text-xs text-slate-400">月額 ¥{totalMonthlyCost.toLocaleString()} × 12ヶ月</p>
              </div>
            </div>

            {/* カテゴリ別バーグラフ */}
            <div className="space-y-2.5">
              {(Object.entries(costByCategory) as [AssetCategory, number][])
                .sort((a, b) => b[1] - a[1])
                .map(([cat, cost]) => {
                  const colors = CATEGORY_COLORS[cat];
                  const pct = Math.round((cost / maxCost) * 100);
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={`font-medium ${colors.text}`}>{CATEGORY_LABELS[cat]}</span>
                        <span className="text-slate-400">¥{cost.toLocaleString()}/月</span>
                      </div>
                      <div className="h-2 bg-slate-700/60 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colors.bg.replace('/40', '')}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* 個別サービス一覧 */}
            <div className="space-y-1.5">
              {subscriptionAssets
                .sort((a, b) => (b.monthlyCost ?? 0) - (a.monthlyCost ?? 0))
                .map(a => (
                  <div key={a.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-700/30 last:border-0">
                    <span className="text-slate-300">{a.name}</span>
                    <div className="text-right">
                      <span className="text-white font-semibold">¥{(a.monthlyCost ?? 0).toLocaleString()}</span>
                      <span className="text-slate-500 ml-1">/月</span>
                      <span className="text-slate-600 ml-2">(年¥{((a.monthlyCost ?? 0) * 12).toLocaleString()})</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ☁ クラウドバックアップ */}
        <CloudBackupSection />

        {/* ① PDFエクスポート */}
        <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">PDF出力</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  資産一覧を印刷用PDFに変換。金庫や封筒に保管できます。
                </p>
              </div>
            </div>
            <button
              onClick={handlePDF}
              disabled={pdfLoading}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-red-700/50 hover:bg-red-700/70 border border-red-600/40 text-red-300 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5" />
              {pdfLoading ? '生成中...' : 'PDF生成'}
            </button>
          </div>
        </div>

        {/* ② JSONバックアップ */}
        <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">JSONバックアップ</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            全データをJSONファイルで書き出し・読み込みできます。
            ブラウザキャッシュ消去前に必ずバックアップを取ってください。
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-700/50 hover:bg-indigo-700/70 border border-indigo-600/40 text-indigo-300 rounded-lg text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              エクスポート
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/60 border border-slate-600/40 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              インポート
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>

          {/* インポート結果 */}
          {importState !== 'idle' && (
            <div className={`flex items-start gap-2 rounded-lg px-3 py-2 ${
              importState === 'success'
                ? 'bg-green-900/30 border border-green-700/40'
                : 'bg-red-900/30 border border-red-700/40'
            }`}>
              {importState === 'success'
                ? <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                : <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
              <p className={`text-xs leading-relaxed ${
                importState === 'success' ? 'text-green-300' : 'text-red-300'
              }`}>{importMsg}</p>
            </div>
          )}
        </div>

        {/* セキュリティ情報 */}
        <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-xl p-4 flex gap-3">
          <Shield className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-300/80 leading-relaxed space-y-1">
            <p>全データはこのデバイスのLocalStorageにのみ保存されます。</p>
            <p>バックアップJSONには機密情報が含まれます。安全な場所に保管してください。</p>
          </div>
        </div>

        {/* サブスクリプション管理 */}
        <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">サブスクリプション</h3>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-300">現在のプラン</p>
              <p className="text-sm font-bold text-white mt-0.5">
                {PLAN_LABELS[currentPlan]}
                {status === 'trial' && (
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-full font-medium">
                    トライアル残り{trialDaysLeft}日
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* 購入を復元ボタン（Apple審査要件） */}
          <button
            onClick={async () => {
              setRestoreState('loading');
              track('restore_purchase_tap');
              try {
                // 実際のアプリでは Capacitor IAP プラグインの restore を呼ぶ
                // await InAppPurchase.restorePurchases();
                // ここではレシート検証のシミュレーション
                await new Promise(r => setTimeout(r, 1500));

                // サーバー側でレシート検証後、有効なサブスクがあれば activate
                // 現時点ではプレースホルダー
                const hasValidReceipt = false; // TODO: 実際のレシート検証
                if (hasValidReceipt) {
                  await activate('premium');
                  setRestoreState('success');
                } else {
                  setRestoreState('error');
                }
              } catch {
                setRestoreState('error');
              }
              setTimeout(() => setRestoreState('idle'), 3000);
            }}
            disabled={restoreState === 'loading'}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-700/50 hover:bg-slate-600/60 border border-slate-600/40 text-slate-300 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${restoreState === 'loading' ? 'animate-spin' : ''}`} />
            {restoreState === 'loading' ? '復元中...'
              : restoreState === 'success' ? '復元しました'
              : restoreState === 'error' ? '有効な購入が見つかりません'
              : '購入を復元'}
          </button>

          {restoreState === 'error' && (
            <p className="text-[11px] text-slate-500 text-center">
              過去に購入履歴がない場合は表示されません。
              別のApple IDで購入した場合は、そのIDでサインインしてください。
            </p>
          )}
        </div>

        {/* トラッキング設定 */}
        <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-white">利用状況トラッキング</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            アプリ改善のための匿名利用データ収集の許可設定です。個人を特定する情報は含まれません。
          </p>
          <div className="flex items-center justify-between bg-slate-900/50 border border-slate-700/30 rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-2">
              {consent === 'granted'
                ? <Eye className="w-4 h-4 text-green-400" />
                : <EyeOff className="w-4 h-4 text-slate-500" />}
              <span className="text-xs text-slate-300">
                {consent === 'granted' ? 'トラッキング許可中' : consent === 'denied' ? 'トラッキング拒否中' : '未設定'}
              </span>
            </div>
            <button
              onClick={() => {
                if (consent === 'granted') {
                  deny();
                } else {
                  grant();
                  track('tracking_enabled');
                }
              }}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                consent === 'granted'
                  ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                  : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
              }`}
            >
              {consent === 'granted' ? '無効にする' : '有効にする'}
            </button>
          </div>
        </div>

        {/* テーマカスタマイズ */}
        <ThemeCustomizer
          theme={theme}
          isPremium={isPremium}
          onUpdate={updateTheme}
          onUpgrade={() => setShowUpgradeFromTheme(true)}
        />

        {/* おすすめサービス（マルチ表示） */}
        <SponsorBanner slot="settings" multi />

        {/* 法的情報 */}
        <LegalLinks />

        {/* 危険ゾーン */}
        <div className="bg-red-950/20 border border-red-800/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-semibold text-red-400">危険ゾーン</h3>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-300">すべての資産データを削除</p>
              <p className="text-xs text-slate-500 mt-0.5">この操作は取り消せません</p>
            </div>
            <button
              onClick={handleDeleteAll}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                showDeleteConfirm
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-slate-700 hover:bg-red-900/50 border border-slate-600 text-slate-400 hover:text-red-400 hover:border-red-700/50'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {showDeleteConfirm ? 'もう一度押して削除' : '全削除'}
            </button>
          </div>
        </div>
      </div>

      {/* テーマからのアップグレードモーダル */}
      {showUpgradeFromTheme && (
        <UpgradeModal onClose={() => setShowUpgradeFromTheme(false)} />
      )}
    </div>
  );
}
