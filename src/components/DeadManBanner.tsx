import { AlertTriangle, Bell, ShieldCheck, Clock } from 'lucide-react';

interface DeadManBannerProps {
  daysSinceLastLogin: number;
  triggerDays: number;          // useContactsから受け取る設定値
  isTriggered: boolean;
}

export function DeadManBanner({ daysSinceLastLogin, triggerDays, isTriggered }: DeadManBannerProps) {
  const daysUntilTrigger = triggerDays - daysSinceLastLogin;

  // ── 発動済み ──
  if (isTriggered) {
    return (
      <div className="bg-red-900/30 border border-red-700/60 rounded-xl p-4 flex items-start gap-3">
        <div className="w-9 h-9 bg-red-600/30 rounded-lg flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-4 h-4 text-red-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-red-300">デッドマンズスイッチ 発動済み</p>
          <p className="text-xs text-red-400/90 mt-1 leading-relaxed">
            <span className="font-bold text-red-300">{daysSinceLastLogin}日間</span>ログインがありません。
            登録済みの緊急連絡先への通知が送信されました。
          </p>
        </div>
      </div>
    );
  }

  // ── 警告（残り30日以内） ──
  if (daysUntilTrigger <= 30) {
    return (
      <div className="bg-amber-900/20 border border-amber-700/50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-amber-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Bell className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-amber-300">通知まであと少しです</p>
              <span className="text-xs font-bold text-amber-400 bg-amber-900/40 px-2 py-0.5 rounded-full border border-amber-700/40">
                残り {daysUntilTrigger}日
              </span>
            </div>
            <p className="text-xs text-amber-400/80 mt-1.5 leading-relaxed">
              <span className="font-semibold text-amber-300">{daysSinceLastLogin}日間</span>ログインがありません。
              このままあと<span className="font-semibold text-amber-300"> {daysUntilTrigger}日</span>経過すると、
              登録している緊急連絡先へ自動通知が送られます。
            </p>
          </div>
        </div>

        {/* プログレスバー */}
        <div className="mt-3 ml-12">
          <div className="flex justify-between text-xs text-amber-500/60 mb-1">
            <span>ログインから {daysSinceLastLogin}日</span>
            <span>発動まで {daysUntilTrigger}日</span>
          </div>
          <div className="h-1.5 bg-amber-900/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all"
              style={{ width: `${Math.min(100, (daysSinceLastLogin / triggerDays) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── 通常（正常） ──
  return (
    <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-4 h-4 text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-200">デッドマンズスイッチ</p>
            <span className="text-xs font-bold text-green-400 flex-shrink-0">正常</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {daysSinceLastLogin === 0
              ? '今日ログインしました。タイマーがリセットされました。'
              : <><span className="font-semibold text-slate-300">{daysSinceLastLogin}日間</span>ログインしていません。
                あと<span className="font-semibold text-slate-300"> {daysUntilTrigger}日</span>で
                登録している方へ通知が送られます。</>
            }
          </p>
        </div>
      </div>

      {/* プログレスバー（10日以上経過した場合のみ表示） */}
      {daysSinceLastLogin >= 10 && (
        <div className="mt-3 ml-12">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-slate-500 flex-shrink-0" />
            <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (daysSinceLastLogin / triggerDays) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 flex-shrink-0">{daysUntilTrigger}日</span>
          </div>
        </div>
      )}
    </div>
  );
}
