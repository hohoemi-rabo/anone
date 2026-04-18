/**
 * 「あのね。」のカラーパレット。
 * テーマ: 白メイン × ピーチのヘッダー/フッター × 爽やかブルーのCTA。
 *
 * - background: 白（メインの読みやすい canvas）
 * - surface: ピーチ（ヘッダー・タブバーなど周辺UI）
 * - tint: 爽やかブルー（CTA / 主要アクション）
 * - onTint: tint 背景の上に乗るテキスト色（ダークネイビー）
 * - card: 白（DiaryCard 等）
 * - border: 薄いグレー（白bg上で見える境界線）
 * - accent: 落ち着いたブルー（差し色・タグ用）
 *
 * 注: アプリは light モード固定（app.json `userInterfaceStyle: "light"`）。
 * dark モードは将来の保険として一貫性のある値を残してある。
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#2D3E50',
    background: '#FFFFFF',
    surface: '#E8A595',
    tint: '#D8607A',
    onTint: '#FFFFFF',
    icon: '#7C8B9A',
    tabIconDefault: '#B89B91',
    tabIconSelected: '#2D3E50',
    card: '#FFFFFF',
    border: '#E5E7EB',
    accent: '#5891B8',
  },
  dark: {
    text: '#E5ECF3',
    background: '#1A2332',
    surface: '#3A2A24',
    tint: '#7FB0CE',
    onTint: '#0F1626',
    icon: '#7C8B9A',
    tabIconDefault: '#5A4A45',
    tabIconSelected: '#FFFFFF',
    card: '#243044',
    border: '#2F3D52',
    accent: '#7DA8C4',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const Shadow = {
  card: {
    shadowColor: '#2D3E50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
};
