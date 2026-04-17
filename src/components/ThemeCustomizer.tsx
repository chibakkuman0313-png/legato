import { Lock, Palette, Type } from 'lucide-react';
import {
  AccentColor,
  FontFamily,
  ThemeConfig,
  ACCENT_COLORS,
  FONT_FAMILIES,
  getFontStyle,
} from '../hooks/useTheme';

interface ThemeCustomizerProps {
  theme: ThemeConfig;
  isPremium: boolean;
  onUpdate: (updates: Partial<ThemeConfig>) => void;
  onUpgrade: () => void;
}

export function ThemeCustomizer({ theme, isPremium, onUpdate, onUpgrade }: ThemeCustomizerProps) {
  if (!isPremium) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-semibold text-white">テーマカスタマイズ</h3>
          <span className="text-[10px] px-1.5 py-0.5 bg-indigo-900/50 text-indigo-300 rounded font-bold">Premium</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          フォントやアクセントカラーを変更して、自分だけのデザインにカスタマイズできます。
        </p>
        <button
          onClick={onUpgrade}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-700/40 hover:bg-indigo-700/60 border border-indigo-600/40 text-indigo-300 rounded-lg text-xs font-semibold transition-colors"
        >
          <Lock className="w-3 h-3" />
          プレミアムプランで解放
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4 text-violet-400" />
        <h3 className="text-sm font-semibold text-white">テーマカスタマイズ</h3>
      </div>

      {/* アクセントカラー */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <Palette className="w-3 h-3" />
          アクセントカラー
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(ACCENT_COLORS) as AccentColor[]).map(color => {
            const c = ACCENT_COLORS[color];
            const isActive = theme.accentColor === color;
            return (
              <button
                key={color}
                onClick={() => onUpdate({ accentColor: color })}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                  isActive
                    ? `${c.primary} border-white/30 text-white`
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full ${c.swatch} flex-shrink-0 ${isActive ? 'ring-2 ring-white/50' : ''}`} />
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* フォント */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <Type className="w-3 h-3" />
          フォント
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(FONT_FAMILIES) as FontFamily[]).map(font => {
            const f = FONT_FAMILIES[font];
            const isActive = theme.fontFamily === font;
            return (
              <button
                key={font}
                onClick={() => onUpdate({ fontFamily: font })}
                className={`px-3 py-2.5 rounded-lg border text-left transition-all ${
                  isActive
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="text-xs font-medium mb-1">{f.label}</div>
                <div
                  className={`text-[11px] text-slate-400 ${f.className}`}
                  style={getFontStyle(font)}
                >
                  {f.sample}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* プレビュー */}
      <div className="bg-slate-900/60 border border-slate-700/30 rounded-lg p-3">
        <p className="text-[11px] text-slate-500 mb-1.5">プレビュー</p>
        <div
          className={FONT_FAMILIES[theme.fontFamily].className}
          style={getFontStyle(theme.fontFamily)}
        >
          <p className={`text-sm font-bold ${ACCENT_COLORS[theme.accentColor].text}`}>
            LegacyVault
          </p>
          <p className="text-xs text-slate-300 mt-1">
            大切なデジタル資産を家族に引き継ぐためのアプリです。
          </p>
        </div>
      </div>
    </div>
  );
}
