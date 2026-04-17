import { useState, useEffect } from 'react';
import { Shield, Bell, Lock, Database, FileText, HelpCircle } from 'lucide-react';
import { LockScreen } from './components/LockScreen';
import { Dashboard } from './components/Dashboard';
import { TrustedContacts } from './components/TrustedContacts';
import { Settings } from './components/Settings';
import { WillNote } from './components/WillNote';
import { ViewerPage } from './components/ViewerPage';
import { HelpGuide } from './components/HelpGuide';
import { OnboardingScreen } from './components/OnboardingScreen';
import { usePinAuth } from './hooks/usePinAuth';
import { usePremium } from './hooks/usePremium';
import { useTheme, FONT_FAMILIES, getFontStyle } from './hooks/useTheme';
import { useTracking } from './hooks/useTracking';
import { TrackingConsent } from './components/TrackingConsent';

const ONBOARDING_KEY = 'dlv_onboarding_seen';

type Tab = 'dashboard' | 'contacts' | 'will' | 'settings';

// ── URLフラグメントから閲覧専用トークンを取得 ──
function getViewerToken(): string | null {
  const hash = window.location.hash; // e.g. #/view?d=TOKEN
  if (!hash.startsWith('#/view')) return null;
  const params = new URLSearchParams(hash.replace('#/view?', ''));
  return params.get('d');
}

export default function App() {
  const viewerToken = getViewerToken();

  // 閲覧専用モード（家族がQRを読んだとき）
  if (viewerToken) {
    return <ViewerPage token={viewerToken} />;
  }

  return <MainApp />;
}

function MainApp() {
  const { status, lock } = usePinAuth();
  const { isPremium, activate } = usePremium();

  // Stripe決済成功後のリダイレクト処理
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('premium_success') === '1') {
      const plan = params.get('plan');
      const planType: 'premium' | 'family' = plan === 'family' ? 'family' : 'premium';
      activate(planType).then(() => {
        alert(`ご購入ありがとうございます！\n${planType === 'family' ? 'ファミリー' : 'プレミアム'}プランが有効になりました。`);
        // URLを掃除
        window.history.replaceState({}, '', window.location.pathname);
      });
    }
  }, [activate]);

  const { theme } = useTheme(isPremium);
  const { consent, grant, deny, track } = useTracking();
  const [tab, setTab]       = useState<Tab>('dashboard');
  const [unlocked, setUnlocked] = useState(status === 'unlocked');
  const [showGuide, setShowGuide] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(
    () => localStorage.getItem(ONBOARDING_KEY) === '1' || status !== 'unset'
  );

  // ── 初回起動時のオンボーディング（PIN設定前に表示） ──
  if (!onboardingDone) {
    return (
      <OnboardingScreen
        onComplete={() => {
          localStorage.setItem(ONBOARDING_KEY, '1');
          setOnboardingDone(true);
        }}
      />
    );
  }

  if (!unlocked) {
    return <LockScreen onUnlock={() => setUnlocked(true)} />;
  }

  // ATT準拠: 初回起動時にトラッキング同意を表示
  if (consent === 'undecided') {
    return (
      <TrackingConsent
        onGrant={() => { grant(); track('app_open'); }}
        onDeny={deny}
      />
    );
  }

  if (showGuide) {
    return <HelpGuide onClose={() => setShowGuide(false)} />;
  }

  const fontClass = FONT_FAMILIES[theme.fontFamily].className;
  const fontStyle = getFontStyle(theme.fontFamily);

  return (
    <div
      className={`min-h-screen bg-slate-950 flex flex-col pt-safe ${fontClass}`}
      style={fontStyle}
    >
      {/* ヘルプボタン（FAB） セーフエリア考慮 */}
      <button
        onClick={() => setShowGuide(true)}
        className="fixed top-safe right-4 z-50 w-10 h-10 bg-indigo-600/80 hover:bg-indigo-500 backdrop-blur rounded-full flex items-center justify-center shadow-lg shadow-indigo-900/40 transition-all hover:scale-105"
        title="使い方ガイド"
      >
        <HelpCircle className="w-5 h-5 text-white" />
      </button>

      <div className="flex-1 pb-24">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'contacts'  && <TrustedContacts />}
        {tab === 'will'      && <WillNote />}
        {tab === 'settings'  && <Settings />}
      </div>

      {/* ボトムナビ（セーフエリア対応） */}
      <nav className="fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur border-t border-slate-700/60 z-40 pb-safe">
        <div className="max-w-6xl mx-auto flex items-stretch h-16">
          <NavItem icon={<Shield className="w-5 h-5" />}   label="資産管理"   active={tab === 'dashboard'} onClick={() => { setTab('dashboard'); track('tab_switch', { tab: 'dashboard' }); }} />
          <NavItem icon={<Bell className="w-5 h-5" />}     label="通知・共有" active={tab === 'contacts'}  onClick={() => { setTab('contacts'); track('tab_switch', { tab: 'contacts' }); }} />
          <NavItem icon={<FileText className="w-5 h-5" />} label="ノート"     active={tab === 'will'}      onClick={() => { setTab('will'); track('tab_switch', { tab: 'will' }); }} />
          <NavItem icon={<Database className="w-5 h-5" />} label="データ管理" active={tab === 'settings'}  onClick={() => { setTab('settings'); track('tab_switch', { tab: 'settings' }); }} />
          <button
            onClick={() => { lock(); setUnlocked(false); }}
            className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-red-400 transition-colors"
          >
            <Lock className="w-5 h-5" />
            <span className="text-[10px] font-medium">ロック</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: {
  icon: React.ReactNode; label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
        active ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
      {active && <span className="absolute bottom-1 w-8 h-0.5 bg-indigo-500 rounded-full" />}
    </button>
  );
}
