import { useState, useCallback } from 'react';

const THEME_KEY = 'dlv_theme';

// ────────────────────────────────────────────────────────────
// テーマカスタマイズ（プレミアム / ファミリー限定）
// ────────────────────────────────────────────────────────────

export type AccentColor = 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'violet';
export type FontFamily  = 'default' | 'serif' | 'rounded' | 'mono';

export interface ThemeConfig {
  accentColor: AccentColor;
  fontFamily:  FontFamily;
}

const DEFAULT_THEME: ThemeConfig = {
  accentColor: 'indigo',
  fontFamily:  'default',
};

// ── アクセントカラー定義 ──
export const ACCENT_COLORS: Record<AccentColor, {
  label: string;
  primary:   string;   // bg-{color}-600
  hover:     string;   // hover:bg-{color}-500
  text:      string;   // text-{color}-400
  badge:     string;   // bg-{color}-900/40
  shadow:    string;   // shadow-{color}-900/40
  ring:      string;   // ring-{color}-500/40
  swatch:    string;   // プレビュー用の bg
}> = {
  indigo:  { label: 'インディゴ',  primary: 'bg-indigo-600',  hover: 'hover:bg-indigo-500',  text: 'text-indigo-400',  badge: 'bg-indigo-900/40',  shadow: 'shadow-indigo-900/40',  ring: 'ring-indigo-500/40',  swatch: 'bg-indigo-500' },
  emerald: { label: 'エメラルド',  primary: 'bg-emerald-600', hover: 'hover:bg-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-900/40', shadow: 'shadow-emerald-900/40', ring: 'ring-emerald-500/40', swatch: 'bg-emerald-500' },
  amber:   { label: 'アンバー',    primary: 'bg-amber-600',   hover: 'hover:bg-amber-500',   text: 'text-amber-400',   badge: 'bg-amber-900/40',   shadow: 'shadow-amber-900/40',   ring: 'ring-amber-500/40',   swatch: 'bg-amber-500' },
  rose:    { label: 'ローズ',      primary: 'bg-rose-600',    hover: 'hover:bg-rose-500',    text: 'text-rose-400',    badge: 'bg-rose-900/40',    shadow: 'shadow-rose-900/40',    ring: 'ring-rose-500/40',    swatch: 'bg-rose-500' },
  cyan:    { label: 'シアン',      primary: 'bg-cyan-600',    hover: 'hover:bg-cyan-500',    text: 'text-cyan-400',    badge: 'bg-cyan-900/40',    shadow: 'shadow-cyan-900/40',    ring: 'ring-cyan-500/40',    swatch: 'bg-cyan-500' },
  violet:  { label: 'バイオレット', primary: 'bg-violet-600',  hover: 'hover:bg-violet-500',  text: 'text-violet-400',  badge: 'bg-violet-900/40',  shadow: 'shadow-violet-900/40',  ring: 'ring-violet-500/40',  swatch: 'bg-violet-500' },
};

// ── フォントファミリー定義 ──
export const FONT_FAMILIES: Record<FontFamily, {
  label: string;
  className: string;
  sample: string;
}> = {
  default: {
    label: 'デフォルト',
    className: 'font-sans',
    sample: 'あいうえお ABCabc 123',
  },
  serif: {
    label: '明朝体',
    className: 'font-serif',
    sample: 'あいうえお ABCabc 123',
  },
  rounded: {
    label: '丸ゴシック',
    className: '',  // custom style
    sample: 'あいうえお ABCabc 123',
  },
  mono: {
    label: '等幅',
    className: 'font-mono',
    sample: 'あいうえお ABCabc 123',
  },
};

/** フォントファミリーを CSS font-family 文字列に変換 */
export function getFontStyle(family: FontFamily): React.CSSProperties | undefined {
  if (family === 'rounded') {
    return {
      fontFamily: '"Hiragino Maru Gothic ProN", "BIZ UDPGothic", "Rounded Mplus 1c", system-ui, sans-serif',
    };
  }
  return undefined;
}

export function useTheme(isPremium: boolean) {
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    try {
      return JSON.parse(localStorage.getItem(THEME_KEY) ?? 'null') ?? DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });

  const updateTheme = useCallback((updates: Partial<ThemeConfig>) => {
    setTheme(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem(THEME_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // 無料ユーザーは常にデフォルトテーマ
  const activeTheme = isPremium ? theme : DEFAULT_THEME;

  return { theme: activeTheme, updateTheme };
}
