/**
 * Stripe Payment Link設定
 *
 * 【セットアップ手順】
 * 1. https://dashboard.stripe.com/register でアカウント作成（日本円対応あり）
 * 2. ダッシュボード左メニュー「商品カタログ」→「＋新しい商品」
 *    - プレミアム（月額）: ¥400/月 のサブスクリプション
 *    - プレミアム（年額）: ¥4,000/年
 *    - ファミリー（月額）: ¥600/月
 *    - ファミリー（年額）: ¥6,000/年
 * 3. 各商品で「決済リンクを作成」
 *    - 決済後のリダイレクト先URL: https://legato-fawn.vercel.app/?premium_success=1&plan=premium
 *      （planは premium / family を指定）
 * 4. 生成された URL（https://buy.stripe.com/xxx 形式）を以下に貼り付け
 *
 * 空文字のままだと「準備中」モーダルが表示されます。
 */

export const STRIPE_LINKS = {
  premium_monthly: '', // 例: 'https://buy.stripe.com/test_xxxxxxxxxxxxxxxxxx'
  premium_yearly:  '',
  family_monthly:  '',
  family_yearly:   '',
} as const;

export type StripePlan = keyof typeof STRIPE_LINKS;

export function getStripeUrl(plan: StripePlan): string | null {
  const url = STRIPE_LINKS[plan];
  return url && url.length > 0 ? url : null;
}

/** 決済成功時のリダイレクトで URL に含めるクエリパラメータ名 */
export const SUCCESS_PARAM = 'premium_success';
export const PLAN_PARAM    = 'plan';
