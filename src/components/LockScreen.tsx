import { useState, useEffect, useRef } from 'react';
import { Shield, Delete, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { usePinAuth } from '../hooks/usePinAuth';

interface LockScreenProps {
  onUnlock: () => void;
}

const PIN_LENGTH = 6;

export function LockScreen({ onUnlock }: LockScreenProps) {
  const { status, error, isLockedOut, secondsRemaining, setupPin, unlock, clearError } = usePinAuth();
  const isSetup = status === 'unset';

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>(isSetup ? 'enter' : 'enter');
  const [showPin, setShowPin] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(secondsRemaining);
  const inputRef = useRef<HTMLInputElement>(null);

  // ロックアウトカウントダウン
  useEffect(() => {
    if (!isLockedOut) return;
    setCountdown(secondsRemaining);
    const id = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(id); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isLockedOut, secondsRemaining]);

  // フォーカス管理
  useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  async function handlePinInput(digit: string) {
    if (isLockedOut) return;
    clearError();
    setSetupError(null);

    const current = isSetup && step === 'confirm' ? confirmPin : pin;
    if (current.length >= PIN_LENGTH) return;

    const next = current + digit;

    if (isSetup) {
      if (step === 'enter') {
        setPin(next);
        if (next.length === PIN_LENGTH) {
          setTimeout(() => { setStep('confirm'); }, 200);
        }
      } else {
        setConfirmPin(next);
        if (next.length === PIN_LENGTH) {
          if (next === pin) {
            await setupPin(next);
            onUnlock();
          } else {
            setSetupError('PINが一致しません。最初からやり直してください。');
            setTimeout(() => {
              setPin('');
              setConfirmPin('');
              setStep('enter');
              setSetupError(null);
            }, 1500);
          }
        }
      }
    } else {
      setPin(next);
      if (next.length === PIN_LENGTH) {
        const ok = await unlock(next);
        if (ok) {
          onUnlock();
        } else {
          setTimeout(() => setPin(''), 400);
        }
      }
    }
  }

  function handleDelete() {
    clearError();
    setSetupError(null);
    if (isSetup && step === 'confirm') {
      setConfirmPin(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
  }

  const currentPin = isSetup && step === 'confirm' ? confirmPin : pin;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 px-6">
      {/* ロゴ */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-900/60 mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-xl font-bold text-white">Legato</h1>
        <p className="text-sm text-slate-400 mt-1">
          {isSetup
            ? step === 'enter'
              ? '6桁のPINコードを設定してください'
              : 'もう一度入力して確認してください'
            : 'PINコードを入力してください'}
        </p>
      </div>

      {/* ロックアウト表示 */}
      {isLockedOut && (
        <div className="mb-6 flex items-center gap-2 bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">
            ロックアウト中 — {countdown}秒後に再試行できます
          </p>
        </div>
      )}

      {/* エラー */}
      {(error || setupError) && !isLockedOut && (
        <div className="mb-6 bg-red-900/20 border border-red-700/40 rounded-xl px-4 py-3">
          <p className="text-sm text-red-300 text-center">{setupError ?? error}</p>
        </div>
      )}

      {/* PIN ドット */}
      <div className="flex gap-3 mb-10">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
              i < currentPin.length
                ? 'bg-indigo-500 border-indigo-400 scale-110'
                : 'bg-transparent border-slate-600'
            }`}
          />
        ))}
      </div>

      {/* 表示切替（デバッグ用ではなくアクセシビリティ） */}
      <button
        className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 mb-6 transition-colors"
        onClick={() => setShowPin(p => !p)}
      >
        {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        {showPin ? 'PINを隠す' : 'PINを表示'}
      </button>

      {/* 数字キーパッド */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {['1','2','3','4','5','6','7','8','9'].map(d => (
          <button
            key={d}
            onClick={() => handlePinInput(d)}
            disabled={isLockedOut}
            className="h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-30 text-xl font-semibold text-white transition-colors flex items-center justify-center"
          >
            {d}
          </button>
        ))}
        {/* 空白 */}
        <div />
        <button
          onClick={() => handlePinInput('0')}
          disabled={isLockedOut}
          className="h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-30 text-xl font-semibold text-white transition-colors flex items-center justify-center"
        >
          0
        </button>
        {/* 削除 */}
        <button
          onClick={handleDelete}
          disabled={isLockedOut}
          className="h-16 rounded-2xl bg-slate-800/60 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-30 text-white transition-colors flex items-center justify-center"
        >
          <Delete className="w-5 h-5 text-slate-300" />
        </button>
      </div>

      {/* 隠し入力（コピペ対応） */}
      <input
        ref={inputRef}
        type={showPin ? 'text' : 'password'}
        inputMode="numeric"
        maxLength={PIN_LENGTH}
        value={currentPin}
        onChange={e => {
          const val = e.target.value.replace(/\D/g, '');
          for (const d of val.slice(currentPin.length)) handlePinInput(d);
        }}
        className="sr-only"
        aria-label="PINコード入力"
      />

      {/* ロックアイコン */}
      <div className="absolute bottom-8 flex items-center gap-2 text-xs text-slate-600">
        <Lock className="w-3 h-3" />
        <span>データはこのデバイスにのみ保存されます</span>
      </div>
    </div>
  );
}
