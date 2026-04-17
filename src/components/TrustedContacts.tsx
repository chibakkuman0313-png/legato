import { useState } from 'react';
import {
  UserPlus, Trash2, Bell, Mail, User, Heart,
  ChevronDown, ChevronUp, Save, Shield,
  Smartphone, CheckCircle2, Send, QrCode, KeyRound, AlertTriangle
} from 'lucide-react';
import { useContacts } from '../hooks/useContacts';
import { useNotifications } from '../hooks/useNotifications';
import { useAssets } from '../hooks/useAssets';
import { TrustedContact } from '../types/asset';
import { ShareModal } from './ShareModal';

const RELATIONSHIP_OPTIONS = ['配偶者', '子', '親', '兄弟・姉妹', '親友', 'その他'];
const TRIGGER_DAY_PRESETS = [
  { days: 7,   label: '1週間' },
  { days: 14,  label: '2週間' },
  { days: 30,  label: '1ヶ月' },
  { days: 60,  label: '2ヶ月' },
  { days: 90,  label: '3ヶ月' },
  { days: 180, label: '半年' },
  { days: 365, label: '1年' },
];

export function TrustedContacts() {
  const { contacts, switchMessage, setSwitchMessage, triggerDays, setTriggerDays, addContact, updateContact, deleteContact } = useContacts();
  const { assets, daysSinceLastLogin } = useAssets();
  const {
    permission, config, isSending, lastError, isConfigured,
    requestPermission, updateConfig, sendReminderToSelf, sendAlertToContacts,
  } = useNotifications();

  const daysLeft = triggerDays - daysSinceLastLogin;

  const [isFormOpen, setIsFormOpen]         = useState(false);
  const [editingContact, setEditingContact] = useState<TrustedContact | null>(null);
  const [messageExpanded, setMessageExpanded] = useState(false);
  const [notifExpanded, setNotifExpanded]   = useState(false);
  const [messageSaved, setMessageSaved]     = useState(false);
  const [deleteConfirm, setDeleteConfirm]   = useState<string | null>(null);
  const [checkInDone, setCheckInDone]       = useState(false);
  const [localConfig, setLocalConfig]       = useState(config);
  const [configSaved, setConfigSaved]       = useState(false);
  const [testSent, setTestSent]             = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [alertSent, setAlertSent]           = useState(false);

  const [form, setForm] = useState({ name: '', email: '', relationship: '配偶者' });
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string }>({});

  function openAdd() { setForm({ name: '', email: '', relationship: '配偶者' }); setFormErrors({}); setEditingContact(null); setIsFormOpen(true); }
  function openEdit(c: TrustedContact) { setForm({ name: c.name, email: c.email, relationship: c.relationship }); setFormErrors({}); setEditingContact(c); setIsFormOpen(true); }

  function validateForm() {
    const errors: { name?: string; email?: string } = {};
    if (!form.name.trim()) errors.name = '名前は必須です';
    if (!form.email.trim()) errors.email = 'メールアドレスは必須です';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = '正しいメールアドレスを入力してください';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSave() {
    if (!validateForm()) return;
    editingContact ? updateContact(editingContact.id, form) : addContact(form);
    setIsFormOpen(false); setEditingContact(null);
  }

  function handleDelete(id: string) {
    if (deleteConfirm === id) { deleteContact(id); setDeleteConfirm(null); }
    else { setDeleteConfirm(id); setTimeout(() => setDeleteConfirm(null), 3000); }
  }

  function saveConfig() { updateConfig(localConfig); setConfigSaved(true); setTimeout(() => setConfigSaved(false), 2000); }

  async function handleTestNotif() {
    await sendReminderToSelf(daysLeft, triggerDays);
    setTestSent(true); setTimeout(() => setTestSent(false), 3000);
  }

  async function handleSendAlert() {
    await sendAlertToContacts(contacts, switchMessage);
    setAlertSent(true); setTimeout(() => setAlertSent(false), 3000);
  }

  // ③ 「元気です」チェックイン
  function handleCheckIn() {
    localStorage.setItem('digital_legacy_last_login', new Date().toISOString());
    localStorage.removeItem('dlv_notif_sent_days');
    setCheckInDone(true);
    setTimeout(() => setCheckInDone(false), 3000);
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-24">

      {/* ページヘッダー */}
      <div className="bg-slate-900 border-b border-slate-700/60 px-4 py-5">
        <div className="max-w-6xl mx-auto flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-600/20 rounded-lg flex items-center justify-center mt-0.5">
            <Bell className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">スイッチ＆通知設定</h2>
            <p className="text-xs text-slate-400 mt-0.5">デッドマンズスイッチ・通知設定・QR共有</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-5 space-y-5">

        {/* ③ 元気ですチェックイン */}
        <div className={`border rounded-xl p-4 flex items-center gap-3 ${
          daysLeft <= 30 ? 'bg-amber-900/20 border-amber-700/50' : 'bg-slate-800/50 border-slate-700/40'
        }`}>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
            daysLeft <= 30 ? 'bg-amber-600/20' : 'bg-green-900/30'
          }`}>
            <CheckCircle2 className={`w-4 h-4 ${daysLeft <= 30 ? 'text-amber-400' : 'text-green-400'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">「元気です」チェックイン</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              {daysSinceLastLogin === 0
                ? '今日ログインしました。タイマーをリセット済みです。'
                : <><span className="font-semibold text-slate-300">{daysSinceLastLogin}日間</span>未ログイン。あと<span className={`font-bold ${daysLeft <= 30 ? 'text-amber-300' : 'text-slate-300'}`}> {daysLeft}日</span>で登録している方へ通知が送られます。</>
              }
            </p>
          </div>
          <button
            onClick={handleCheckIn}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              checkInDone
                ? 'bg-green-600/40 border border-green-600/50 text-green-300'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/40'
            }`}
          >
            {checkInDone ? <><CheckCircle2 className="w-3.5 h-3.5" />完了！</> : '元気です！'}
          </button>
        </div>

        {/* ① QR閲覧専用リンク */}
        <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-indigo-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <QrCode className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">閲覧専用QRリンク</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  資産情報を暗号化してQRコード化。今すぐ手動で共有するか、
                  スイッチ発動時のメールに自動添付されます。
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowShareModal(true)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-indigo-700/50 hover:bg-indigo-700 border border-indigo-600/40 text-indigo-300 rounded-lg text-xs font-semibold transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />生成
            </button>
          </div>
        </div>

        {/* 発動タイミング */}
        <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">スイッチ発動タイミング</h3>
          </div>
          <p className="text-xs text-slate-400 mb-3">最後のログインから何日後に通知を送信しますか？</p>

          {/* プリセットボタン */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {TRIGGER_DAY_PRESETS.map(p => (
              <button key={p.days} onClick={() => setTriggerDays(p.days)}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  triggerDays === p.days ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-700/50 border-slate-600/50 text-slate-300 hover:border-slate-500'
                }`}>
                <div className="text-[10px] opacity-80">{p.label}</div>
                <div>{p.days}日</div>
              </button>
            ))}
          </div>

          {/* カスタム入力（スライダー + 数値） */}
          <div className="bg-slate-900/40 border border-slate-700/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-400">カスタム設定</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="730"
                  value={triggerDays}
                  onChange={e => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v) && v >= 1 && v <= 730) setTriggerDays(v);
                  }}
                  className="w-16 bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-md px-2 py-1 text-xs text-white text-center outline-none focus:ring-2 focus:ring-amber-500/30"
                />
                <span className="text-xs text-slate-400">日</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="730"
              value={triggerDays}
              onChange={e => setTriggerDays(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1日</span>
              <span>365日</span>
              <span>730日</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
            💡 現在の設定: <span className="text-amber-400 font-semibold">{triggerDays}日間</span>
            {' '}ログインがないと緊急連絡先へ通知されます
          </p>
        </div>

        {/* 通知設定（EmailJS） */}
        <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl overflow-hidden">
          <button className="w-full flex items-center justify-between px-4 py-3.5" onClick={() => setNotifExpanded(p => !p)}>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-semibold text-white">通知設定</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isConfigured ? 'bg-green-900/40 text-green-400' : 'bg-slate-700 text-slate-500'}`}>
                {isConfigured ? '設定済み' : '未設定'}
              </span>
            </div>
            {notifExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {notifExpanded && (
            <div className="px-4 pb-4 border-t border-slate-700/40 pt-4 space-y-4">
              {/* ブラウザPush */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-white">ブラウザ Push 通知</p>
                  <p className="text-xs text-slate-500 mt-0.5">残り30・7・3・1日前に自動でプッシュ通知</p>
                </div>
                {permission === 'granted' ? (
                  <span className="text-xs text-green-400 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />許可済み</span>
                ) : (
                  <button onClick={requestPermission} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors">
                    許可する
                  </button>
                )}
              </div>

              {/* EmailJS設定 */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  <p className="text-xs font-semibold text-slate-300">EmailJS 設定（メール送信）</p>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">emailjs.com</a> で無料アカウントを作成し、Service ID・Template ID・Public Key を取得してください。
                </p>
                {[
                  { label: 'Service ID', key: 'serviceId' as const, placeholder: 'service_xxxxxxx' },
                  { label: 'Template ID', key: 'templateId' as const, placeholder: 'template_xxxxxxx' },
                  { label: 'Public Key', key: 'publicKey' as const, placeholder: 'xxxxxxxxxxxxxxxx' },
                  { label: '自分のメールアドレス（リマインダー送信先）', key: 'selfEmail' as const, placeholder: 'you@example.com' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
                    <input
                      type={f.key === 'selfEmail' ? 'email' : 'text'}
                      value={localConfig[f.key]}
                      onChange={e => setLocalConfig(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-600 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                    />
                  </div>
                ))}
                <div className="flex gap-2">
                  <button onClick={saveConfig} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${configSaved ? 'bg-green-700/50 text-green-300' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}>
                    <Save className="w-3 h-3" />{configSaved ? '保存済み' : '保存'}
                  </button>
                  <button onClick={handleTestNotif} disabled={!isConfigured || isSending} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-300 rounded-lg text-xs font-semibold transition-colors">
                    <Send className="w-3 h-3" />{testSent ? '送信しました' : 'テスト通知'}
                  </button>
                </div>
                {lastError && (
                  <div className="flex items-center gap-2 bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <p className="text-xs text-red-300">{lastError}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 通知メッセージ */}
        <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl overflow-hidden">
          <button className="w-full flex items-center justify-between px-4 py-3.5" onClick={() => setMessageExpanded(p => !p)}>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-semibold text-white">通知メッセージ</span>
            </div>
            {messageExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          {messageExpanded && (
            <div className="px-4 pb-4 border-t border-slate-700/40 pt-3 space-y-3">
              <p className="text-xs text-slate-400">緊急連絡先へ送信されるメール本文（QRリンクは自動添付されます）</p>
              <textarea value={switchMessage} onChange={e => setSwitchMessage(e.target.value)} rows={7}
                className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-600 rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none leading-relaxed transition-all"
              />
              <div className="flex gap-2">
                <button onClick={() => { setMessageSaved(true); setTimeout(() => setMessageSaved(false), 2000); }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${messageSaved ? 'bg-green-700/50 text-green-300 border border-green-700/40' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}>
                  <Save className="w-3.5 h-3.5" />{messageSaved ? '保存済み' : 'メッセージを保存'}
                </button>
                <button onClick={handleSendAlert} disabled={contacts.length === 0 || !isConfigured || isSending}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-700/40 hover:bg-red-700/60 border border-red-700/40 text-red-300 disabled:opacity-40 rounded-lg text-xs font-semibold transition-colors">
                  <Send className="w-3.5 h-3.5" />{alertSent ? '送信しました' : '今すぐ送信（手動発動）'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 緊急連絡先リスト */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-white">緊急連絡先</h3>
              <span className="text-xs text-slate-500">（{contacts.length}人）</span>
            </div>
            <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors">
              <UserPlus className="w-3.5 h-3.5" />追加
            </button>
          </div>

          {contacts.length === 0 ? (
            <div className="bg-slate-800/30 border border-dashed border-slate-700/60 rounded-xl py-10 text-center">
              <Heart className="w-8 h-8 mx-auto text-slate-600 mb-3" />
              <p className="text-sm text-slate-400 font-medium">連絡先が登録されていません</p>
              <p className="text-xs text-slate-500 mt-1">大切な家族や友人を追加しましょう</p>
            </div>
          ) : (
            <div className="space-y-2">
              {contacts.map(contact => (
                <div key={contact.id} className="bg-slate-800/50 border border-slate-700/40 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-900/50 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-indigo-300">
                    {contact.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white truncate">{contact.name}</p>
                      <span className="text-xs text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded-md flex-shrink-0">{contact.relationship}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{contact.email}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(contact)} className="w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-slate-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                      <User className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(contact.id)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${deleteConfirm === contact.id ? 'bg-red-600 text-white' : 'bg-slate-700/50 hover:bg-red-900/50 text-slate-400 hover:text-red-300'}`}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-xl p-4 flex gap-3">
          <Shield className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-300/80 leading-relaxed">
            PINはSHA-256でハッシュ化。QRリンクはAES-256-GCMで暗号化。
            いずれもデバイス外に平文データは送信されません。
          </p>
        </div>
      </div>

      {/* 連絡先追加・編集モーダル */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full sm:max-w-md bg-slate-900 border border-slate-700/60 rounded-t-2xl sm:rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60">
              <h3 className="text-sm font-semibold text-white">{editingContact ? '連絡先を編集' : '連絡先を追加'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">名前 <span className="text-red-400">*</span></label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="例: 山田 花子"
                  className={`w-full bg-slate-800 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all ${formErrors.name ? 'border-red-500' : 'border-slate-700 focus:border-indigo-600'}`} />
                {formErrors.name && <p className="text-xs text-red-400 mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">メールアドレス <span className="text-red-400">*</span></label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="hanako@example.com"
                  className={`w-full bg-slate-800 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all ${formErrors.email ? 'border-red-500' : 'border-slate-700 focus:border-indigo-600'}`} />
                {formErrors.email && <p className="text-xs text-red-400 mt-1">{formErrors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">関係性</label>
                <div className="grid grid-cols-3 gap-2">
                  {RELATIONSHIP_OPTIONS.map(rel => (
                    <button key={rel} type="button" onClick={() => setForm(p => ({ ...p, relationship: rel }))}
                      className={`py-2 rounded-lg text-xs font-medium border transition-all ${form.relationship === rel ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'}`}>
                      {rel}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                <Save className="w-4 h-4" />保存する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR共有モーダル */}
      {showShareModal && <ShareModal assets={assets} onClose={() => setShowShareModal(false)} />}
    </div>
  );
}
