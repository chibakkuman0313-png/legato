import { useState } from 'react';
import { FileText, Save, Download, CheckCircle2, Clock, AlertTriangle, BookOpen } from 'lucide-react';
import { SponsorBanner } from './SponsorBanner';
import { TemplateModal } from './TemplateModal';

const WILL_SECTIONS = [
  { key: 'message',  label: '家族へのメッセージ',   placeholder: '大切なあなたへ。この手紙を読んでいるということは…' },
  { key: 'medical',  label: '医療・延命治療の意思',  placeholder: '延命治療については…尊厳死について…' },
  { key: 'funeral',  label: 'お葬式・納骨の希望',   placeholder: '家族だけの小さな葬儀でかまいません…' },
  { key: 'estate',   label: '財産・形見分けの意思',  placeholder: '預金は〇〇に、形見の時計は…' },
  { key: 'pets',     label: 'ペット・その他のお願い', placeholder: '猫のミルクのことをお願いします…' },
];

const STORAGE_KEY = 'dlv_will_note';

interface WillData {
  [key: string]: string;
}

export function WillNote() {
  const [data, setData] = useState<WillData>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); }
    catch { return {}; }
  });
  const [saved, setSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(
    () => localStorage.getItem('dlv_will_saved_at')
  );
  const [showWillTemplates, setShowWillTemplates] = useState(false);
  const [templateTargetKey, setTemplateTargetKey] = useState<string | null>(null);

  function handleChange(key: string, value: string) {
    setData(prev => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    const now = new Date().toISOString();
    localStorage.setItem('dlv_will_saved_at', now);
    setLastSaved(now);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleDownload() {
    const lines = WILL_SECTIONS.map(s =>
      `【${s.label}】\n${data[s.key] ?? '（未記入）'}\n`
    ).join('\n');
    const content = `エンディングノート\n作成日: ${new Date().toLocaleDateString('ja-JP')}\n\n${'─'.repeat(40)}\n\n${lines}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `ending-note-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalChars = WILL_SECTIONS.reduce((sum, s) => sum + (data[s.key]?.length ?? 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      {/* ヘッダー */}
      <div className="bg-slate-900 border-b border-slate-700/60 px-4 py-5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-purple-900/40 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-purple-400" />
            </div>
            <h2 className="text-lg font-bold text-white">エンディングノート</h2>
          </div>
          <p className="text-xs text-slate-400 ml-11">家族への想いや意思を自由に記録できます</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-5 space-y-4">
        {/* ステータスバー */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            {lastSaved
              ? `最終保存: ${new Date(lastSaved).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
              : '未保存'}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-600">{totalChars.toLocaleString()} 文字</span>
            <button
              onClick={() => { setTemplateTargetKey(null); setShowWillTemplates(true); }}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              記入例
            </button>
          </div>
        </div>

        {/* セクション群 */}
        {WILL_SECTIONS.map(section => (
          <div key={section.key} className="bg-slate-800/50 border border-slate-700/40 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-700/40 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${data[section.key] ? 'bg-green-500' : 'bg-slate-600'}`} />
              <span className="text-xs font-semibold text-slate-300">{section.label}</span>
            </div>
            <textarea
              value={data[section.key] ?? ''}
              onChange={e => handleChange(section.key, e.target.value)}
              placeholder={section.placeholder}
              rows={4}
              className="w-full bg-transparent px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none resize-none leading-relaxed"
            />
          </div>
        ))}

        {/* アクションボタン */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={handleSave}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              saved
                ? 'bg-green-700/40 border border-green-700/50 text-green-300'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30'
            }`}
          >
            {saved ? <><CheckCircle2 className="w-4 h-4" />保存しました</> : <><Save className="w-4 h-4" />保存する</>}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />テキスト出力
          </button>
        </div>

        {/* おすすめサービス */}
        <SponsorBanner slot="willnote" />

        {/* 法的免責事項 */}
        <div className="flex gap-2.5 bg-amber-900/15 border border-amber-700/30 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-[11px] text-amber-300/80 leading-relaxed space-y-1">
            <p className="font-semibold text-amber-300">法的効力に関する注意</p>
            <p>このエンディングノートは法的効力を持つ遺言書ではありません。法的に有効な遺言書が必要な場合は、弁護士・司法書士にご相談ください。</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 text-center leading-relaxed">
          このノートはLocalStorageにのみ保存され、外部に送信されることはありません。
        </p>
      </div>

      {/* テンプレートモーダル */}
      {showWillTemplates && (
        <TemplateModal
          mode="will"
          onSelect={(text) => {
            if (templateTargetKey) {
              handleChange(templateTargetKey, text);
            }
          }}
          onClose={() => setShowWillTemplates(false)}
        />
      )}
    </div>
  );
}
