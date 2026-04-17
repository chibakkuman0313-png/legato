import { useState, useRef } from 'react';
import {
  ExternalLink, Pencil, Trash2, ChevronDown, ChevronUp,
  Copy, Check, AlertCircle, ShieldCheck, Mic, Play, Square, Pause,
  Lock, Sparkles, XCircle
} from 'lucide-react';
import { DigitalAsset, CATEGORY_LABELS, CATEGORY_COLORS } from '../types/asset';
import { usePremium } from '../hooks/usePremium';
import { UpgradeModal } from './UpgradeModal';

const STALE_DAYS = 180; // ⑤ 180日更新なしで「要確認」

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

function isStale(asset: DigitalAsset): boolean {
  const ref = asset.confirmedAt ?? asset.updatedAt;
  return daysSince(ref) >= STALE_DAYS;
}

interface AssetCardProps {
  asset: DigitalAsset;
  onEdit: (asset: DigitalAsset) => void;
  onDelete: (id: string) => void;
  onConfirm: (id: string) => void;
  onSaveAudio: (id: string, base64: string) => void;
}

export function AssetCard({ asset, onEdit, onDelete, onConfirm, onSaveAudio }: AssetCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { isPremium, status: premiumStatus, trialDaysLeft } = usePremium();

  // ④ 音声メモ
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const colors = CATEGORY_COLORS[asset.category];
  const stale = isStale(asset);
  const staleDays = daysSince(asset.confirmedAt ?? asset.updatedAt);

  async function copyLoginId() {
    if (!asset.loginId) return;
    await navigator.clipboard.writeText(asset.loginId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDelete() {
    if (showDeleteConfirm) {
      onDelete(asset.id);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  }

  // ④ 録音開始
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = e => audioChunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          onSaveAudio(asset.id, base64);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecording(true);
    } catch {
      alert('マイクへのアクセスが許可されていません');
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  // ④ 音声再生
  function togglePlay() {
    if (!asset.audioMemo) return;
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }
    const audio = new Audio(`data:audio/webm;base64,${asset.audioMemo}`);
    audioRef.current = audio;
    audio.onended = () => setIsPlaying(false);
    audio.play();
    setIsPlaying(true);
  }

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      stale
        ? 'bg-amber-950/20 border-amber-700/40 hover:border-amber-600/60'
        : 'bg-slate-800/50 border-slate-700/40 hover:border-slate-600/60'
    }`}>
      {/* ⑤ 要確認バナー */}
      {stale && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-900/30 border-b border-amber-700/30">
          <AlertCircle className="w-3 h-3 text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-300">
            {staleDays}日間未確認 — 情報が古くなっている可能性があります
          </p>
        </div>
      )}

      {/* カードヘッダー */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
        onClick={() => setExpanded(prev => !prev)}
      >
        {/* カテゴリバッジ */}
        <div className={`px-2 py-0.5 rounded-md text-xs font-medium border flex-shrink-0 ${colors.bg} ${colors.text} ${colors.border}`}>
          {CATEGORY_LABELS[asset.category]}
        </div>

        {/* サービス名 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-white truncate">{asset.name}</p>
            {asset.audioMemo && (
              <span title="音声メモあり">
                <Mic className="w-3 h-3 text-indigo-400 flex-shrink-0" />
              </span>
            )}
          </div>
          {asset.loginId && (
            <p className="text-xs text-slate-400 truncate">{asset.loginId}</p>
          )}
        </div>

        {/* 月額 */}
        {asset.monthlyCost !== null && (
          <div className="text-xs font-medium text-slate-300 flex-shrink-0">
            ¥{asset.monthlyCost.toLocaleString()}/月
          </div>
        )}

        {/* 展開アイコン */}
        <div className="text-slate-500 flex-shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* 展開エリア */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-700/40 pt-3">
          {/* URL */}
          {asset.url && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 w-20 flex-shrink-0">URL</span>
              <a
                href={asset.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 truncate transition-colors"
                onClick={e => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{asset.url}</span>
              </a>
            </div>
          )}

          {/* ログインID */}
          {asset.loginId && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 w-20 flex-shrink-0">ログインID</span>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xs text-slate-300 truncate">{asset.loginId}</span>
                <button
                  onClick={e => { e.stopPropagation(); copyLoginId(); }}
                  className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* メモ */}
          {asset.memo && (
            <div className="flex gap-2">
              <span className="text-xs text-slate-500 w-20 flex-shrink-0 pt-0.5">メモ</span>
              <p className="text-xs text-slate-300 leading-relaxed">{asset.memo}</p>
            </div>
          )}

          {/* ② 解約ガイド */}
          {asset.cancelGuide && (
            <div className="flex gap-2 bg-red-950/20 border border-red-800/30 rounded-lg p-2.5 -mx-0.5">
              <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-300 mb-0.5">解約手順</p>
                <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{asset.cancelGuide}</p>
              </div>
            </div>
          )}

          {/* ④ 音声メモ（プレミアム機能） */}
          <div className="flex gap-2 items-start">
            <span className="text-xs text-slate-500 w-20 flex-shrink-0 pt-1.5">音声メモ</span>
            {isPremium ? (
              <div className="flex flex-col gap-1.5 flex-1">
                {/* トライアルバッジ */}
                {premiumStatus === 'trial' && (
                  <p className="text-xs text-indigo-400">
                    トライアル中（残り{trialDaysLeft}日）
                  </p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  {asset.audioMemo && (
                    <button
                      onClick={e => { e.stopPropagation(); togglePlay(); }}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-900/50 hover:bg-indigo-800/60 border border-indigo-700/40 text-indigo-300 rounded-lg text-xs transition-colors"
                    >
                      {isPlaying
                        ? <><Pause className="w-3 h-3" />停止</>
                        : <><Play className="w-3 h-3" />再生</>}
                    </button>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); isRecording ? stopRecording() : startRecording(); }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                      isRecording
                        ? 'bg-red-600/30 border-red-500/50 text-red-300 animate-pulse'
                        : 'bg-slate-700/50 border-slate-600/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isRecording
                      ? <><Square className="w-3 h-3" />録音停止</>
                      : <><Mic className="w-3 h-3" />{asset.audioMemo ? '録り直し' : '録音'}</>}
                  </button>
                </div>
              </div>
            ) : (
              /* プレミアムゲート */
              <button
                onClick={e => { e.stopPropagation(); setShowUpgradeModal(true); }}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-700/40 rounded-lg text-xs text-indigo-300 hover:border-indigo-500/60 transition-all group"
              >
                <Lock className="w-3 h-3 text-indigo-400 group-hover:hidden" />
                <Sparkles className="w-3 h-3 text-indigo-400 hidden group-hover:block" />
                <span>音声メモ — <span className="font-semibold text-indigo-200">Premiumで解放</span></span>
              </button>
            )}
          </div>

          {/* アップグレードモーダル */}
          {showUpgradeModal && (
            <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
          )}

          {/* アクションボタン */}
          <div className="flex gap-2 pt-1 flex-wrap">
            <button
              onClick={e => { e.stopPropagation(); onEdit(asset); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
            >
              <Pencil className="w-3 h-3" />編集
            </button>

            {/* ⑤ 確認済みボタン */}
            <button
              onClick={e => { e.stopPropagation(); onConfirm(asset.id); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-900/30 hover:bg-green-800/40 border border-green-700/40 text-green-400 hover:text-green-300 rounded-lg text-xs font-medium transition-colors"
            >
              <ShieldCheck className="w-3 h-3" />確認済み
            </button>

            <button
              onClick={e => { e.stopPropagation(); handleDelete(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                showDeleteConfirm
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-slate-700 hover:bg-red-900/60 text-slate-300 hover:text-red-300'
              }`}
            >
              <Trash2 className="w-3 h-3" />
              {showDeleteConfirm ? 'もう一度押して削除' : '削除'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
