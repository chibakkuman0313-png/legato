import { useState } from 'react';
import { X, Save, Globe, User, FileText, DollarSign, XCircle, BookOpen } from 'lucide-react';
import { DigitalAsset, AssetCategory, CATEGORY_LABELS } from '../types/asset';
import { TemplateModal } from './TemplateModal';

type FormData = Omit<DigitalAsset, 'id' | 'createdAt' | 'updatedAt'>;

interface AssetFormProps {
  initialData?: DigitalAsset;
  onSave: (data: FormData) => void;
  onClose: () => void;
}

const EMPTY_FORM: FormData = {
  name: '',
  category: 'other',
  url: '',
  loginId: '',
  memo: '',
  monthlyCost: null,
};

export function AssetForm({ initialData, onSave, onClose }: AssetFormProps) {
  const [form, setForm] = useState<FormData>(
    initialData
      ? {
          name: initialData.name,
          category: initialData.category,
          url: initialData.url,
          loginId: initialData.loginId,
          memo: initialData.memo,
          monthlyCost: initialData.monthlyCost,
        }
      : EMPTY_FORM
  );
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [showCancelTemplates, setShowCancelTemplates] = useState(false);

  function validate(): boolean {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) newErrors.name = 'サービス名は必須です';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  }

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* モーダル本体 */}
      <div className="relative w-full sm:max-w-lg bg-slate-900 border border-slate-700/60 rounded-t-2xl sm:rounded-2xl shadow-2xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60">
          <h2 className="text-base font-semibold text-white">
            {initialData ? '資産情報を編集' : '新しい資産を追加'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* カテゴリ */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">カテゴリ</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(CATEGORY_LABELS) as AssetCategory[]).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setField('category', cat)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                    form.category === cat
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* サービス名 */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              サービス名 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              placeholder="例: 楽天銀行、Netflix..."
              className={`w-full bg-slate-800 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                errors.name ? 'border-red-500' : 'border-slate-700 focus:border-indigo-600'
              }`}
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </div>

          {/* URL */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              <Globe className="w-3 h-3 inline mr-1" />URL
            </label>
            <input
              type="url"
              value={form.url}
              onChange={e => setField('url', e.target.value)}
              placeholder="https://..."
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          {/* ログインID */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              <User className="w-3 h-3 inline mr-1" />ログインID・メールアドレス
            </label>
            <input
              type="text"
              value={form.loginId}
              onChange={e => setField('loginId', e.target.value)}
              placeholder="登録に使用したメールアドレスなど"
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          {/* 月額費用 */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              <DollarSign className="w-3 h-3 inline mr-1" />月額費用（円）
            </label>
            <input
              type="number"
              value={form.monthlyCost ?? ''}
              onChange={e =>
                setField('monthlyCost', e.target.value ? Number(e.target.value) : null)
              }
              placeholder="なければ空欄"
              min="0"
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          {/* メモ */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              <FileText className="w-3 h-3 inline mr-1" />メモ・引き継ぎ情報
            </label>
            <textarea
              value={form.memo}
              onChange={e => setField('memo', e.target.value)}
              placeholder="家族への引き継ぎ情報、口座番号、保管場所など"
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
            />
          </div>

          {/* ② 解約ガイド */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-400">
                <XCircle className="w-3 h-3 inline mr-1 text-red-400" />解約手順メモ
              </label>
              <button
                type="button"
                onClick={() => setShowCancelTemplates(true)}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <BookOpen className="w-3 h-3" />
                テンプレート
              </button>
            </div>
            <textarea
              value={form.cancelGuide ?? ''}
              onChange={e => setField('cancelGuide', e.target.value)}
              placeholder="解約ページのURL、手順、注意点など（家族が解約する際に参照）"
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
            />
          </div>

          {showCancelTemplates && (
            <TemplateModal
              mode="cancel"
              onSelect={(text) => setField('cancelGuide', text)}
              onClose={() => setShowCancelTemplates(false)}
            />
          )}

          {/* 保存ボタン */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-900/40"
          >
            <Save className="w-4 h-4" />
            保存する
          </button>
        </form>
      </div>
    </div>
  );
}
