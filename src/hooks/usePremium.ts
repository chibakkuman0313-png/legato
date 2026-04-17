import { useState, useCallback } from 'react';

const PREMIUM_KEY      = 'dlv_premium';
const TRIAL_EXPIRY_KEY = 'dlv_trial_expiry';
const SIGNATURE_KEY    = 'dlv_premium_sig';
const PLAN_TYPE_KEY    = 'dlv_plan_type';   // 'premium' | 'family'

// ── 改ざん防止用 HMAC 署名 ──
const SECRET = 'LV_2026_hmac_' + navigator.userAgent.slice(0, 20);

async function sign(value: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(value));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verify(value: string, expected: string): Promise<boolean> {
  const actual = await sign(value);
  return actual === expected;
}

export type PremiumStatus = 'free' | 'trial' | 'paid';
export type PlanType = 'standard' | 'premium' | 'family';

/** スタンダードプランの資産登録上限 */
export const FREE_ASSET_LIMIT = 4;

/** プラン表示ラベル */
export const PLAN_LABELS: Record<PlanType, string> = {
  standard: 'スタンダード',
  premium:  'プレミアム',
  family:   'ファミリー',
};

function loadStatusSync(): PremiumStatus {
  const paid = localStorage.getItem(PREMIUM_KEY);
  if (paid === 'paid') return 'paid';

  const expiry = localStorage.getItem(TRIAL_EXPIRY_KEY);
  if (expiry && Date.now() < Number(expiry)) return 'trial';

  return 'free';
}

function loadPlanType(): PlanType {
  const stored = localStorage.getItem(PLAN_TYPE_KEY);
  if (stored === 'premium' || stored === 'family') return stored;
  return 'standard';
}

export function usePremium() {
  const [status, setStatus]     = useState<PremiumStatus>(loadStatusSync);
  const [planType, setPlanType] = useState<PlanType>(loadPlanType);
  const [verified, setVerified] = useState(false);

  // 非同期で署名を検証（改ざん検知）
  const verifyIntegrity = useCallback(async () => {
    const paid = localStorage.getItem(PREMIUM_KEY);
    const sig  = localStorage.getItem(SIGNATURE_KEY);

    if (paid === 'paid') {
      if (!sig || !(await verify('paid', sig))) {
        localStorage.removeItem(PREMIUM_KEY);
        localStorage.removeItem(SIGNATURE_KEY);
        localStorage.removeItem(PLAN_TYPE_KEY);
        setStatus('free');
        setPlanType('standard');
        setVerified(true);
        return;
      }
    }

    const expiry = localStorage.getItem(TRIAL_EXPIRY_KEY);
    if (expiry && Date.now() < Number(expiry)) {
      const trialSig = localStorage.getItem(SIGNATURE_KEY);
      if (!trialSig || !(await verify(`trial_${expiry}`, trialSig))) {
        localStorage.removeItem(TRIAL_EXPIRY_KEY);
        localStorage.removeItem(SIGNATURE_KEY);
        localStorage.removeItem(PLAN_TYPE_KEY);
        setStatus('free');
        setPlanType('standard');
        setVerified(true);
        return;
      }
      setStatus('trial');
      // トライアル中はプレミアム扱い
      setPlanType(loadPlanType() === 'family' ? 'family' : 'premium');
    } else if (paid === 'paid') {
      setStatus('paid');
      setPlanType(loadPlanType());
    } else {
      setStatus('free');
      setPlanType('standard');
    }
    setVerified(true);
  }, []);

  if (!verified) { verifyIntegrity(); }

  const isPremium = status === 'trial' || status === 'paid';

  /** 現在のプランを返す */
  const currentPlan: PlanType = isPremium
    ? (planType === 'family' ? 'family' : 'premium')
    : 'standard';

  /** 30日間トライアルを開始 */
  const startTrial = useCallback(async (plan: 'premium' | 'family' = 'premium') => {
    const expiry = String(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const sig = await sign(`trial_${expiry}`);
    localStorage.setItem(TRIAL_EXPIRY_KEY, expiry);
    localStorage.setItem(SIGNATURE_KEY, sig);
    localStorage.setItem(PLAN_TYPE_KEY, plan);
    setStatus('trial');
    setPlanType(plan);
  }, []);

  /** 有料プランを有効化（Stripe等の決済完了後に呼ぶ想定） */
  const activate = useCallback(async (plan: 'premium' | 'family' = 'premium') => {
    const sig = await sign('paid');
    localStorage.setItem(PREMIUM_KEY, 'paid');
    localStorage.setItem(SIGNATURE_KEY, sig);
    localStorage.setItem(PLAN_TYPE_KEY, plan);
    setStatus('paid');
    setPlanType(plan);
  }, []);

  /** トライアル残日数 */
  const trialDaysLeft = (() => {
    if (status !== 'trial') return 0;
    const expiry = Number(localStorage.getItem(TRIAL_EXPIRY_KEY));
    return Math.max(0, Math.ceil((expiry - Date.now()) / (1000 * 60 * 60 * 24)));
  })();

  return {
    status,
    isPremium,
    currentPlan,
    planType,
    trialDaysLeft,
    startTrial,
    activate,
  };
}
