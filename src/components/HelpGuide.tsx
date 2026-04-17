import { useState } from 'react';
import {
  ArrowLeft, Shield, Bell, QrCode, FileText,
  Cloud, Download, Mic, CreditCard, ChevronDown, ChevronRight,
  Heart, KeyRound, Plus, Search,
} from 'lucide-react';

// ────────────────────────────────────────────────────────────
// 各セクション定義
// ────────────────────────────────────────────────────────────
interface Step { text: string; sub?: string }
interface Section {
  id:    string;
  icon:  React.ReactNode;
  color: string;        // tailwind bg class
  title: string;
  desc:  string;
  steps: Step[];
  tip?:  string;
}

const SECTIONS: Section[] = [
  {
    id: 'overview',
    icon: <Shield className="w-5 h-5" />,
    color: 'bg-indigo-600',
    title: 'Legato とは',
    desc: 'もしもの時に備えて、デジタル資産の情報を安全に記録・共有できるアプリです。',
    steps: [
      { text: '銀行口座・サブスク・SNSなどの情報を一元管理' },
      { text: '一定期間ログインがないと、登録した家族に自動通知' },
      { text: 'データはすべて暗号化。クラウドにも暗号文のみ保存' },
      { text: 'QRコードで家族に安全にデータ共有' },
    ],
    tip: 'すべてのデータはブラウザのLocalStorageに保存されます。クラウドバックアップを有効にすると、端末紛失時も安心です。',
  },
  {
    id: 'pin',
    icon: <KeyRound className="w-5 h-5" />,
    color: 'bg-purple-600',
    title: 'PINロック',
    desc: '6桁の暗証番号でアプリをロックし、第三者のアクセスを防ぎます。',
    steps: [
      { text: '初回起動時にPINを設定', sub: '6桁の数字を入力 → 確認のため再入力' },
      { text: '以降はPIN入力で解除', sub: 'ブラウザを閉じると自動ロック' },
      { text: '5回ミスで30秒間ロックアウト', sub: '不正アクセスを防止します' },
      { text: 'ナビバーの「ロック」で手動ロック', sub: '離席時にワンタップで保護' },
    ],
    tip: 'PINはSHA-256でハッシュ化して保存。元のPINは復元できないため、忘れないようにしてください。',
  },
  {
    id: 'assets',
    icon: <Plus className="w-5 h-5" />,
    color: 'bg-emerald-600',
    title: '資産の登録・管理',
    desc: 'デジタル資産をカテゴリごとに整理して記録します。',
    steps: [
      { text: '右下の「＋」ボタンで新規追加', sub: 'カテゴリ → サービス名 → ログインID → URLなど' },
      { text: '月額費用を入力するとサブスクダッシュボードに反映' },
      { text: '「解約手順メモ」に解約方法を記録', sub: '家族がスムーズに手続きできます' },
      { text: 'カードをタップで詳細を展開', sub: '編集・削除・確認済みマークが可能' },
      { text: '検索バーで名前・メモから素早く検索' },
      { text: 'カテゴリフィルターで絞り込み' },
    ],
    tip: '180日以上確認していない資産には警告バッジが表示されます。定期的に「確認済み」を押して情報を最新に保ちましょう。',
  },
  {
    id: 'deadman',
    icon: <Heart className="w-5 h-5" />,
    color: 'bg-rose-600',
    title: 'デッドマンズスイッチ',
    desc: '一定期間ログインがない場合、登録した家族に自動で通知を送る安心機能です。',
    steps: [
      { text: '「通知・共有」タブを開く' },
      { text: '発動タイミングを選択', sub: '30日 / 60日 / 90日 / 180日 から選べます' },
      { text: '信頼できる連絡先を追加', sub: '名前・メール・関係性を登録' },
      { text: '通知メッセージを編集', sub: '自分の言葉で家族へのメッセージを書けます' },
      { text: '「元気です！」ボタンでタイマーリセット', sub: 'ログインごとに自動リセットもされます' },
    ],
    tip: '残り30日・7日・3日・1日のタイミングで段階的に通知が送られます。誤発動を防ぐ仕組みです。',
  },
  {
    id: 'notifications',
    icon: <Bell className="w-5 h-5" />,
    color: 'bg-amber-600',
    title: '通知設定（メール・プッシュ）',
    desc: 'ブラウザ通知とEmailJSによるメール通知の2種類を設定できます。',
    steps: [
      { text: '「通知・共有」→「通知設定」を展開' },
      { text: 'ブラウザ通知の許可を有効化', sub: '「通知を許可」ボタンをタップ' },
      { text: 'EmailJS設定でメール通知を有効化', sub: 'Service ID / Template ID / Public Key / 自分のメールを入力' },
      { text: '「テスト通知」で動作確認', sub: 'プッシュ通知とメールの両方が届きます' },
    ],
    tip: 'EmailJSは無料プランで月200通まで送信可能。emailjs.com でアカウントを作成してください。',
  },
  {
    id: 'qr',
    icon: <QrCode className="w-5 h-5" />,
    color: 'bg-sky-600',
    title: 'QR暗号化共有',
    desc: '資産情報をAES-256で暗号化し、QRコード経由で家族に安全に共有します。',
    steps: [
      { text: '「通知・共有」タブの「生成」ボタンをタップ' },
      { text: 'パスフレーズを設定（6文字以上）', sub: '確認のため2回入力' },
      { text: 'QRコードが生成される', sub: 'ダウンロード / URLコピーも可能' },
      { text: '家族がQRを読み取り → パスフレーズ入力 → 閲覧', sub: '閲覧専用ページが表示されます' },
    ],
    tip: 'パスフレーズはQRとは別の手段（口頭・封書など）で伝えてください。スイッチ発動時のメールにもQRを自動添付できます。',
  },
  {
    id: 'will',
    icon: <FileText className="w-5 h-5" />,
    color: 'bg-violet-600',
    title: 'エンディングノート',
    desc: '家族への想いや意思を自由に記録できます。法的効力はありませんが、気持ちを伝える大切な手段です。',
    steps: [
      { text: '「ノート」タブを開く' },
      { text: '5つのセクションに自由記入', sub: '家族へのメッセージ / 医療・延命治療 / お葬式・納骨 / 財産・形見分け / ペット' },
      { text: '「保存」ボタンで即時保存', sub: 'ブラウザに自動保存されます' },
      { text: 'テキストファイルとしてダウンロードも可能' },
    ],
  },
  {
    id: 'cloud',
    icon: <Cloud className="w-5 h-5" />,
    color: 'bg-cyan-600',
    title: 'クラウドバックアップ',
    desc: 'Supabase（無料）を使って暗号化済みデータをクラウドに保存。端末紛失時も復元できます。',
    steps: [
      { text: 'supabase.com で無料アカウント作成' },
      { text: '新規プロジェクト作成 → SQL Editorでテーブル作成', sub: 'アプリ内のセットアップガイドにSQLを用意してあります' },
      { text: 'Settings → API から URL と Anon Key をコピー' },
      { text: '「データ管理」→「クラウドバックアップ」に貼り付け' },
      { text: 'バックアップIDとパスフレーズを設定して保存' },
      { text: '「クラウドに保存」で暗号化アップロード', sub: 'Supabase側には暗号文のみ保存されます' },
    ],
    tip: 'パスフレーズを忘れるとクラウドのデータを復元できません。安全な場所にメモしておいてください。',
  },
  {
    id: 'backup',
    icon: <Download className="w-5 h-5" />,
    color: 'bg-blue-600',
    title: 'PDF・JSONバックアップ',
    desc: 'ローカルへのエクスポート手段も複数用意しています。',
    steps: [
      { text: 'PDF出力：資産一覧を印刷用PDFに変換', sub: '金庫や封筒に入れて物理保管できます' },
      { text: 'JSONエクスポート：全データをファイルに書き出し', sub: 'ブラウザキャッシュ消去前に必ずバックアップ' },
      { text: 'JSONインポート：バックアップファイルから復元', sub: '別の端末への移行にも使えます' },
    ],
  },
  {
    id: 'premium',
    icon: <Mic className="w-5 h-5" />,
    color: 'bg-gradient-to-r from-purple-600 to-pink-600',
    title: 'プレミアム機能',
    desc: '音声メモ機能をプレミアムプランで提供しています。',
    steps: [
      { text: '音声メモ：各資産にボイスメモを録音', sub: 'パスワードや重要な補足を音声で残せます' },
      { text: '月額¥400 / 年額¥3,500（27%OFF）' },
      { text: '30日間の無料トライアルあり' },
    ],
    tip: '資産カードの音声メモエリアから「プレミアムで解放」をタップすると詳細が表示されます。',
  },
  {
    id: 'cost',
    icon: <CreditCard className="w-5 h-5" />,
    color: 'bg-fuchsia-600',
    title: 'サブスク費用ダッシュボード',
    desc: '登録した月額費用を自動集計し、年間コストを可視化します。',
    steps: [
      { text: '「データ管理」タブを開く' },
      { text: '年間支払い合計が大きく表示', sub: 'カテゴリ別のバーチャートで内訳を確認' },
      { text: '各サービスの月額・年額を一覧表示', sub: '解約の判断材料に活用できます' },
    ],
  },
];

// ────────────────────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────────────────────
export function HelpGuide({ onClose }: { onClose: () => void }) {
  const [openId, setOpenId] = useState<string | null>('overview');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">

      {/* ── ヘッダー ── */}
      <header className="flex items-center gap-3 px-4 py-4 bg-slate-900 border-b border-slate-700/60">
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">使い方ガイド</h1>
          <p className="text-xs text-slate-400">Legato の全機能をわかりやすく解説</p>
        </div>
      </header>

      {/* ── 目次（横スクロール） ── */}
      <div className="bg-slate-900/80 border-b border-slate-700/40 px-4 py-2.5 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => {
                setOpenId(s.id);
                document.getElementById(`guide-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all whitespace-nowrap ${
                openId === s.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* ── 本文 ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 pb-24">
        {SECTIONS.map(s => {
          const isOpen = openId === s.id;
          return (
            <div
              key={s.id}
              id={`guide-${s.id}`}
              className="bg-slate-800/50 border border-slate-700/40 rounded-xl overflow-hidden"
            >
              {/* セクションヘッダー */}
              <button
                onClick={() => setOpenId(isOpen ? null : s.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-700/20"
              >
                <div className={`w-9 h-9 ${s.color} rounded-lg flex items-center justify-center flex-shrink-0 text-white`}>
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{s.title}</p>
                  <p className="text-xs text-slate-400 truncate">{s.desc}</p>
                </div>
                {isOpen
                  ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  : <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />}
              </button>

              {/* 展開コンテンツ */}
              {isOpen && (
                <div className="px-4 pb-4 space-y-3">
                  {/* 説明文 */}
                  <p className="text-xs text-slate-300 leading-relaxed">{s.desc}</p>

                  {/* ステップ一覧 */}
                  <ol className="space-y-2.5">
                    {s.steps.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-900/50 border border-indigo-700/40 flex items-center justify-center text-[10px] font-bold text-indigo-300 mt-0.5">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-slate-200 leading-relaxed">{step.text}</p>
                          {step.sub && (
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{step.sub}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>

                  {/* Tip */}
                  {s.tip && (
                    <div className="flex gap-2.5 bg-indigo-900/20 border border-indigo-700/30 rounded-lg px-3 py-2.5">
                      <Search className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-indigo-300/80 leading-relaxed">{s.tip}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* フッター */}
        <div className="text-center pt-4 pb-8 space-y-2">
          <p className="text-xs text-slate-500">Legato v0.1.0</p>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            ご不明な点があればお気軽にお問い合わせください。
          </p>
        </div>
      </div>
    </div>
  );
}
