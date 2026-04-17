import { useState } from 'react';
import { ArrowLeft, Shield, FileText } from 'lucide-react';

// ────────────────────────────────────────────────────────────
// プライバシーポリシー
// ────────────────────────────────────────────────────────────
const PRIVACY_SECTIONS = [
  {
    title: '1. 収集する情報',
    body: `当アプリは以下の情報をお客様のブラウザ（LocalStorage / SessionStorage）にのみ保存します。外部サーバーへの自動送信は行いません。

• デジタル資産情報（サービス名、ログインID、URL、メモ等）
• 信頼できる連絡先（氏名、メールアドレス、続柄）
• PINコード（SHA-256ハッシュ化された値のみ）
• アプリ設定（通知設定、プレミアム状態等）
• エンディングノートの記入内容

クラウドバックアップ機能を有効にした場合、お客様のSupabaseアカウントにAES-256-GCMで暗号化されたデータが保存されます。暗号化前のデータが当社サーバーを経由することはありません。`,
  },
  {
    title: '2. メール送信について',
    body: `デッドマンズスイッチ機能により、お客様が設定した条件に基づき、登録された連絡先へEmailJS経由でメールが送信されます。

• メールの送信にはお客様自身のEmailJSアカウントが使用されます
• 当社がメールの内容を閲覧・保存することはありません
• EmailJSの利用にはEmailJS社の利用規約が適用されます`,
  },
  {
    title: '3. データの保存場所',
    body: `すべてのデータはお客様のブラウザのLocalStorageに保存されます。

• ブラウザのキャッシュ・データを削除するとデータが失われます
• 定期的なバックアップ（JSON / クラウド）を強く推奨します
• 異なるブラウザ・端末間でデータは自動同期されません`,
  },
  {
    title: '4. 第三者への提供',
    body: `お客様の個人情報を第三者に販売、貸与、または共有することはありません。ただし以下の場合を除きます：

• お客様の明示的な同意がある場合
• 法令に基づく開示要請があった場合
• デッドマンズスイッチにより、お客様が事前に登録した連絡先へメールが送信される場合`,
  },
  {
    title: '5. セキュリティ',
    body: `当アプリは以下のセキュリティ対策を実装しています：

• PINコードのSHA-256ハッシュ化（ランダムソルト付き）
• 段階的ロックアウト（ブルートフォース対策）
• AES-256-GCM暗号化（QR共有・クラウドバックアップ）
• PBKDF2鍵導出（100,000反復）

ただし、ブラウザのLocalStorageは暗号化されていないため、端末自体のセキュリティ（画面ロック等）も併せてご確認ください。`,
  },
  {
    title: '6. お問い合わせ',
    body: `プライバシーに関するお問い合わせは、アプリ内の設定画面またはサポートメールアドレスまでご連絡ください。

最終更新日：2026年4月17日`,
  },
];

// ────────────────────────────────────────────────────────────
// 利用規約
// ────────────────────────────────────────────────────────────
const TERMS_SECTIONS = [
  {
    title: '第1条（適用範囲）',
    body: `本利用規約（以下「本規約」）は、LegacyVault（以下「本アプリ」）の利用に関する条件を定めるものです。本アプリをご利用いただくことにより、本規約に同意したものとみなします。`,
  },
  {
    title: '第2条（サービス内容）',
    body: `本アプリは、デジタル資産情報の記録・管理・共有を支援するツールです。

• 本アプリは遺言書の作成ツールではありません
• エンディングノート機能に法的効力はありません
• 法的に有効な遺言書が必要な場合は、弁護士・司法書士にご相談ください`,
  },
  {
    title: '第3条（データの管理）',
    body: `• データはお客様のブラウザに保存されます。当社はデータの保全について責任を負いません
• ブラウザのデータ消去、端末の故障等によるデータ損失について、当社は一切の責任を負いません
• 定期的なバックアップはお客様の責任において行ってください`,
  },
  {
    title: '第4条（デッドマンズスイッチ）',
    body: `• 本機能は、お客様が設定した期間ログインがない場合に、登録された連絡先へメールを送信する機能です
• 通知の確実な到達を保証するものではありません（メールの不達、迷惑メールフィルター等による未着の可能性があります）
• 誤通知による損害について、当社は責任を負いません
• ブラウザを閉じている間はチェックが行われないため、定期的にアプリを開くことを推奨します`,
  },
  {
    title: '第5条（料金・プレミアムプラン）',
    body: `• スタンダードプラン（無料）：資産登録4件まで、基本機能をご利用いただけます
• プレミアムプラン（月額¥400 / 年額¥4,000）：無制限の資産登録、テーマカスタマイズ、テンプレート集、音声メモ、広告非表示等の追加機能が利用可能になります
• ファミリープラン（月額¥600 / 年額¥6,000）：プレミアムの全機能に加え、家族3人までの閲覧招待機能が利用可能になります
• 無料トライアル期間は30日間です
• 解約はいつでも可能です。日割り返金は行いません`,
  },
  {
    title: '第6条（禁止事項）',
    body: `以下の行為を禁止します：

• 不正な方法で有料機能を利用する行為
• 本アプリのソースコードの逆コンパイル・リバースエンジニアリング
• 本アプリを利用した違法行為
• 他のユーザーへの妨害行為`,
  },
  {
    title: '第7条（免責事項）',
    body: `• 本アプリの利用により生じた損害について、当社は一切の責任を負いません
• 本アプリの正確性、完全性、信頼性について保証するものではありません
• サービスの中断、終了によって生じた損害について責任を負いません
• 本アプリは「現状のまま」提供されます`,
  },
  {
    title: '第8条（規約の変更）',
    body: `当社は、必要に応じて本規約を変更することがあります。変更後の規約は、本アプリ内に掲示した時点で効力を生じるものとします。

最終更新日：2026年4月17日`,
  },
];

// ────────────────────────────────────────────────────────────
// 共通レイアウト
// ────────────────────────────────────────────────────────────
function LegalPage({
  title, subtitle, icon, sections, onClose,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  sections: { title: string; body: string }[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      <header className="flex items-center gap-3 px-4 py-4 bg-slate-900 border-b border-slate-700/60">
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <h1 className="text-lg font-bold text-white">{title}</h1>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 pb-24">
        {sections.map((s, i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-2">{s.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PrivacyPolicy({ onClose }: { onClose: () => void }) {
  return (
    <LegalPage
      title="プライバシーポリシー"
      subtitle="個人情報の取り扱いについて"
      icon={<Shield className="w-5 h-5 text-indigo-400" />}
      sections={PRIVACY_SECTIONS}
      onClose={onClose}
    />
  );
}

export function TermsOfService({ onClose }: { onClose: () => void }) {
  return (
    <LegalPage
      title="利用規約"
      subtitle="LegacyVault ご利用条件"
      icon={<FileText className="w-5 h-5 text-amber-400" />}
      sections={TERMS_SECTIONS}
      onClose={onClose}
    />
  );
}

/** 設定画面から使うリンクコンポーネント */
export function LegalLinks() {
  const [show, setShow] = useState<'privacy' | 'terms' | null>(null);

  return (
    <>
      <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-semibold text-white mb-1">法的情報</h3>
        <button
          onClick={() => setShow('terms')}
          className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
        >
          <span className="text-xs text-slate-300">利用規約</span>
          <span className="text-xs text-slate-500">→</span>
        </button>
        <button
          onClick={() => setShow('privacy')}
          className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
        >
          <span className="text-xs text-slate-300">プライバシーポリシー</span>
          <span className="text-xs text-slate-500">→</span>
        </button>
      </div>

      {show === 'privacy' && <PrivacyPolicy onClose={() => setShow(null)} />}
      {show === 'terms'   && <TermsOfService onClose={() => setShow(null)} />}
    </>
  );
}
