import { useState, useCallback } from 'react';

const PIN_HASH_KEY = 'dlv_pin_hash';
const PIN_SALT_KEY = 'dlv_pin_salt';
const SESSION_KEY  = 'dlv_unlocked';
const MAX_ATTEMPTS = 5;

// ── 段階的ロックアウト（ブルートフォース対策）──
// 5回失敗→60秒、10回→300秒、15回→900秒…
function getLockoutDuration(totalFails: number): number {
  const tier = Math.floor(totalFails / MAX_ATTEMPTS);
  return Math.min(60_000 * Math.pow(2, tier), 900_000); // 最大15分
}

/** ランダムソルト生成（ユーザーごとに固有） */
function getOrCreateSalt(): string {
  let salt = localStorage.getItem(PIN_SALT_KEY);
  if (!salt) {
    const buf = crypto.getRandomValues(new Uint8Array(32));
    salt = Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(PIN_SALT_KEY, salt);
  }
  return salt;
}

/** SHA-256 + ランダムソルト でPINをハッシュ */
async function hashPin(pin: string): Promise<string> {
  const salt = getOrCreateSalt();
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export type PinStatus = 'unset' | 'locked' | 'unlocked';

export function usePinAuth() {
  const storedHash = localStorage.getItem(PIN_HASH_KEY);
  const sessionUnlocked = sessionStorage.getItem(SESSION_KEY) === 'true';

  const [status, setStatus] = useState<PinStatus>(
    !storedHash ? 'unset' : sessionUnlocked ? 'unlocked' : 'locked'
  );
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLockedOut = lockoutUntil !== null && Date.now() < lockoutUntil;
  const secondsRemaining = lockoutUntil
    ? Math.ceil((lockoutUntil - Date.now()) / 1000)
    : 0;

  const setupPin = useCallback(async (pin: string) => {
    const hash = await hashPin(pin);
    localStorage.setItem(PIN_HASH_KEY, hash);
    sessionStorage.setItem(SESSION_KEY, 'true');
    setStatus('unlocked');
    setError(null);
  }, []);

  const unlock = useCallback(async (pin: string): Promise<boolean> => {
    if (isLockedOut) {
      setError(`ロックアウト中です。${secondsRemaining}秒後に再試行してください。`);
      return false;
    }

    const hash = await hashPin(pin);
    const stored = localStorage.getItem(PIN_HASH_KEY);

    if (hash === stored) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setStatus('unlocked');
      setAttempts(0);
      setError(null);
      return true;
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts % MAX_ATTEMPTS === 0) {
        const duration = getLockoutDuration(newAttempts);
        const secs = Math.round(duration / 1000);
        const until = Date.now() + duration;
        setLockoutUntil(until);
        setError(`${newAttempts}回失敗しました。${secs}秒間ロックされます。`);
      } else {
        setError(`PINが違います（残り${MAX_ATTEMPTS - (newAttempts % MAX_ATTEMPTS)}回）`);
      }
      return false;
    }
  }, [attempts, isLockedOut, secondsRemaining]);

  const changePin = useCallback(async (currentPin: string, newPin: string): Promise<boolean> => {
    const hash = await hashPin(currentPin);
    const stored = localStorage.getItem(PIN_HASH_KEY);
    if (hash !== stored) {
      setError('現在のPINが違います');
      return false;
    }
    const newHash = await hashPin(newPin);
    localStorage.setItem(PIN_HASH_KEY, newHash);
    setError(null);
    return true;
  }, []);

  const lock = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setStatus('locked');
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    status,
    error,
    attempts,
    isLockedOut,
    secondsRemaining,
    setupPin,
    unlock,
    changePin,
    lock,
    clearError,
    hasPinSet: !!storedHash,
  };
}
