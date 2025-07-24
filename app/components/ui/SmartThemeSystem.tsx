import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { createScopedLogger } from '~/utils/logger';
import { smartCache } from '~/lib/cache/SmartCacheManager';

const logger = createScopedLogger('SmartThemeSystem');

// أنواع الثيمات المتاحة
export type ThemeMode = 'light' | 'dark' | 'auto' | 'system';
export type ColorScheme = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal' | 'pink';
export type ThemeIntensity = 'subtle' | 'normal' | 'vibrant';

// إعدادات الثيم
export interface ThemeConfig {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  intensity: ThemeIntensity;
  fontSize: 'small' | 'medium' | 'large';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  animations: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

// ألوان الثيم
export interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryActive: string;
  secondary: string;
  accent: string;
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    depth1: string;
    depth2: string;
    depth3: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  border: {
    primary: string;
    secondary: string;
    focus: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  surface: {
    elevated: string;
    overlay: string;
    card: string;
  };
}

// سياق الثيم
interface ThemeContextType {
  config: ThemeConfig;
  colors: ThemeColors;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  resetTheme: () => void;
  toggleMode: () => void;
  isDark: boolean;
  isSystemDark: boolean;
}

const defaultConfig: ThemeConfig = {
  mode: 'auto',
  colorScheme: 'blue',
  intensity: 'normal',
  fontSize: 'medium',
  borderRadius: 'medium',
  animations: true,
  highContrast: false,
  reducedMotion: false,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// مولد الألوان الذكي
class SmartColorGenerator {
  private baseColors = {
    blue: { h: 220, s: 70, l: 50 },
    green: { h: 140, s: 60, l: 45 },
    purple: { h: 270, s: 65, l: 55 },
    orange: { h: 25, s: 75, l: 55 },
    red: { h: 0, s: 70, l: 50 },
    teal: { h: 180, s: 60, l: 45 },
    pink: { h: 320, s: 65, l: 55 },
  };

  generateColors(scheme: ColorScheme, isDark: boolean, intensity: ThemeIntensity): ThemeColors {
    const base = this.baseColors[scheme];
    const intensityMultiplier = {
      subtle: 0.7,
      normal: 1,
      vibrant: 1.3,
    }[intensity];

    // تعديل التشبع والإضاءة حسب الثيم والشدة
    const adjustedSaturation = Math.min(100, base.s * intensityMultiplier);
    const adjustedLightness = isDark ? Math.max(20, base.l - 20) : Math.min(80, base.l + 10);

    // ألوان أساسية
    const primary = this.hslToHex(base.h, adjustedSaturation, adjustedLightness);
    const primaryHover = this.hslToHex(base.h, adjustedSaturation, adjustedLightness + (isDark ? 10 : -10));
    const primaryActive = this.hslToHex(base.h, adjustedSaturation, adjustedLightness + (isDark ? 15 : -15));

    // ألوان الخلفية
    const backgroundBase = isDark ? 15 : 98;
    const background = {
      primary: this.hslToHex(base.h, 10, backgroundBase),
      secondary: this.hslToHex(base.h, 8, backgroundBase + (isDark ? 3 : -3)),
      tertiary: this.hslToHex(base.h, 6, backgroundBase + (isDark ? 6 : -6)),
      depth1: this.hslToHex(base.h, 8, backgroundBase + (isDark ? 2 : -2)),
      depth2: this.hslToHex(base.h, 10, backgroundBase + (isDark ? 4 : -4)),
      depth3: this.hslToHex(base.h, 12, backgroundBase + (isDark ? 8 : -8)),
    };

    // ألوان النص
    const textBase = isDark ? 85 : 15;
    const text = {
      primary: this.hslToHex(base.h, 5, textBase),
      secondary: this.hslToHex(base.h, 8, textBase + (isDark ? -15 : 15)),
      tertiary: this.hslToHex(base.h, 10, textBase + (isDark ? -25 : 25)),
      inverse: this.hslToHex(base.h, 5, isDark ? 15 : 85),
    };

    // ألوان الحدود
    const borderBase = isDark ? 30 : 85;
    const border = {
      primary: this.hslToHex(base.h, 15, borderBase),
      secondary: this.hslToHex(base.h, 10, borderBase + (isDark ? 5 : -5)),
      focus: primary,
    };

    // ألوان الحالة
    const status = {
      success: this.hslToHex(140, 60, isDark ? 45 : 50),
      warning: this.hslToHex(45, 80, isDark ? 55 : 60),
      error: this.hslToHex(0, 70, isDark ? 50 : 55),
      info: this.hslToHex(200, 70, isDark ? 50 : 55),
    };

    // أسطح مرتفعة
    const surface = {
      elevated: this.hslToHex(base.h, 8, backgroundBase + (isDark ? 8 : -8)),
      overlay: this.hslToHex(base.h, 5, isDark ? 5 : 95),
      card: this.hslToHex(base.h, 6, backgroundBase + (isDark ? 4 : -4)),
    };

    return {
      primary,
      primaryHover,
      primaryActive,
      secondary: this.hslToHex((base.h + 180) % 360, adjustedSaturation * 0.7, adjustedLightness),
      accent: this.hslToHex((base.h + 30) % 360, adjustedSaturation * 0.8, adjustedLightness),
      background,
      text,
      border,
      status,
      surface,
    };
  }

  private hslToHex(h: number, s: number, l: number): string {
    const hDecimal = h / 360;
    const sDecimal = s / 100;
    const lDecimal = l / 100;

    const c = (1 - Math.abs(2 * lDecimal - 1)) * sDecimal;
    const x = c * (1 - Math.abs(((hDecimal * 6) % 2) - 1));
    const m = lDecimal - c / 2;

    let r: number, g: number, b: number;

    if (hDecimal * 6 < 1) {
      r = c;
      g = x;
      b = 0;
    } else if (hDecimal * 6 < 2) {
      r = x;
      g = c;
      b = 0;
    } else if (hDecimal * 6 < 3) {
      r = 0;
      g = c;
      b = x;
    } else if (hDecimal * 6 < 4) {
      r = 0;
      g = x;
      b = c;
    } else if (hDecimal * 6 < 5) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}

// مزود الثيم
interface ThemeProviderProps {
  children: ReactNode;
  initialConfig?: Partial<ThemeConfig>;
}

export function ThemeProvider({ children, initialConfig }: ThemeProviderProps) {
  const [config, setConfig] = useState<ThemeConfig>(() => {
    // تحميل الإعدادات المحفوظة
    const savedConfig = smartCache.get<ThemeConfig>('theme-config');
    return { ...defaultConfig, ...savedConfig, ...initialConfig };
  });

  const [isSystemDark, setIsSystemDark] = useState(false);
  const colorGenerator = new SmartColorGenerator();

  // مراقبة تفضيلات النظام
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsSystemDark(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // مراقبة تفضيلات إمكانية الوصول
  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

    const updateAccessibilitySettings = () => {
      setConfig((prev) => ({
        ...prev,
        reducedMotion: reducedMotionQuery.matches,
        highContrast: highContrastQuery.matches,
      }));
    };

    updateAccessibilitySettings();

    reducedMotionQuery.addEventListener('change', updateAccessibilitySettings);
    highContrastQuery.addEventListener('change', updateAccessibilitySettings);

    return () => {
      reducedMotionQuery.removeEventListener('change', updateAccessibilitySettings);
      highContrastQuery.removeEventListener('change', updateAccessibilitySettings);
    };
  }, []);

  // حفظ الإعدادات عند التغيير
  useEffect(() => {
    smartCache.set('theme-config', config, { ttl: 30 * 24 * 60 * 60 * 1000 }); // 30 يوم
    logger.debug('Theme config saved', config);
  }, [config]);

  // تحديد الثيم الحالي
  const isDark =
    config.mode === 'dark' || (config.mode === 'auto' && isSystemDark) || (config.mode === 'system' && isSystemDark);

  // توليد الألوان
  const colors = colorGenerator.generateColors(config.colorScheme, isDark, config.intensity);

  // تطبيق الثيم على المتغيرات CSS
  useEffect(() => {
    const root = document.documentElement;

    // ألوان أساسية
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-primary-hover', colors.primaryHover);
    root.style.setProperty('--theme-primary-active', colors.primaryActive);
    root.style.setProperty('--theme-secondary', colors.secondary);
    root.style.setProperty('--theme-accent', colors.accent);

    // خلفيات
    Object.entries(colors.background).forEach(([key, value]) => {
      root.style.setProperty(`--theme-bg-${key}`, value);
    });

    // نصوص
    Object.entries(colors.text).forEach(([key, value]) => {
      root.style.setProperty(`--theme-text-${key}`, value);
    });

    // حدود
    Object.entries(colors.border).forEach(([key, value]) => {
      root.style.setProperty(`--theme-border-${key}`, value);
    });

    // حالات
    Object.entries(colors.status).forEach(([key, value]) => {
      root.style.setProperty(`--theme-status-${key}`, value);
    });

    // أسطح
    Object.entries(colors.surface).forEach(([key, value]) => {
      root.style.setProperty(`--theme-surface-${key}`, value);
    });

    // إعدادات إضافية
    root.style.setProperty(
      '--theme-font-size',
      {
        small: '14px',
        medium: '16px',
        large: '18px',
      }[config.fontSize],
    );

    root.style.setProperty(
      '--theme-border-radius',
      {
        none: '0px',
        small: '4px',
        medium: '8px',
        large: '12px',
      }[config.borderRadius],
    );

    // فئات CSS للثيم
    root.className = [
      isDark ? 'theme-dark' : 'theme-light',
      `theme-${config.colorScheme}`,
      `theme-${config.intensity}`,
      config.highContrast ? 'theme-high-contrast' : '',
      config.reducedMotion ? 'theme-reduced-motion' : '',
      !config.animations ? 'theme-no-animations' : '',
    ]
      .filter(Boolean)
      .join(' ');

    logger.debug('Theme applied', { isDark, colors: Object.keys(colors) });
  }, [colors, config, isDark]);

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    logger.info('Theme updated', updates);
  };

  const resetTheme = () => {
    setConfig(defaultConfig);
    smartCache.delete('theme-config');
    logger.info('Theme reset to default');
  };

  const toggleMode = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'auto'];
    const currentIndex = modes.indexOf(config.mode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    updateTheme({ mode: nextMode });
  };

  const contextValue: ThemeContextType = {
    config,
    colors,
    updateTheme,
    resetTheme,
    toggleMode,
    isDark,
    isSystemDark,
  };

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

// Hook لاستخدام الثيم
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

// مكون اختيار الثيم
export function ThemeSelector() {
  const { config, updateTheme, toggleMode, isDark } = useTheme();

  const colorSchemes: { value: ColorScheme; label: string; color: string }[] = [
    { value: 'blue', label: 'أزرق', color: '#3b82f6' },
    { value: 'green', label: 'أخضر', color: '#10b981' },
    { value: 'purple', label: 'بنفسجي', color: '#8b5cf6' },
    { value: 'orange', label: 'برتقالي', color: '#f59e0b' },
    { value: 'red', label: 'أحمر', color: '#ef4444' },
    { value: 'teal', label: 'تركوازي', color: '#14b8a6' },
    { value: 'pink', label: 'وردي', color: '#ec4899' },
  ];

  return (
    <div className="p-4 space-y-6 bg-theme-surface-card rounded-lg border border-theme-border-primary">
      <h3 className="text-lg font-semibold text-theme-text-primary">إعدادات المظهر</h3>

      {/* وضع الثيم */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-theme-text-primary">وضع المظهر</label>
        <div className="flex gap-2">
          {(['light', 'dark', 'auto'] as ThemeMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => updateTheme({ mode })}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                config.mode === mode
                  ? 'bg-theme-primary text-white border-theme-primary'
                  : 'bg-theme-surface-elevated text-theme-text-secondary border-theme-border-primary hover:bg-theme-bg-depth2'
              }`}
            >
              {mode === 'light' ? 'فاتح' : mode === 'dark' ? 'داكن' : 'تلقائي'}
            </button>
          ))}
        </div>
      </div>

      {/* نظام الألوان */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-theme-text-primary">نظام الألوان</label>
        <div className="grid grid-cols-4 gap-2">
          {colorSchemes.map((scheme) => (
            <button
              key={scheme.value}
              onClick={() => updateTheme({ colorScheme: scheme.value })}
              className={`p-3 rounded-md border transition-all ${
                config.colorScheme === scheme.value
                  ? 'border-theme-primary ring-2 ring-theme-primary/20'
                  : 'border-theme-border-primary hover:border-theme-border-focus'
              }`}
            >
              <div className="w-6 h-6 rounded-full mx-auto mb-1" style={{ backgroundColor: scheme.color }} />
              <div className="text-xs text-theme-text-secondary">{scheme.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* شدة الألوان */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-theme-text-primary">شدة الألوان</label>
        <div className="flex gap-2">
          {(['subtle', 'normal', 'vibrant'] as ThemeIntensity[]).map((intensity) => (
            <button
              key={intensity}
              onClick={() => updateTheme({ intensity })}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                config.intensity === intensity
                  ? 'bg-theme-primary text-white border-theme-primary'
                  : 'bg-theme-surface-elevated text-theme-text-secondary border-theme-border-primary hover:bg-theme-bg-depth2'
              }`}
            >
              {intensity === 'subtle' ? 'هادئة' : intensity === 'normal' ? 'عادية' : 'زاهية'}
            </button>
          ))}
        </div>
      </div>

      {/* حجم الخط */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-theme-text-primary">حجم الخط</label>
        <div className="flex gap-2">
          {(['small', 'medium', 'large'] as const).map((size) => (
            <button
              key={size}
              onClick={() => updateTheme({ fontSize: size })}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                config.fontSize === size
                  ? 'bg-theme-primary text-white border-theme-primary'
                  : 'bg-theme-surface-elevated text-theme-text-secondary border-theme-border-primary hover:bg-theme-bg-depth2'
              }`}
            >
              {size === 'small' ? 'صغير' : size === 'medium' ? 'متوسط' : 'كبير'}
            </button>
          ))}
        </div>
      </div>

      {/* إعدادات إضافية */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-theme-text-primary">إعدادات إضافية</label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.animations}
            onChange={(e) => updateTheme({ animations: e.target.checked })}
            className="w-4 h-4 text-theme-primary border-theme-border-primary rounded focus:ring-theme-primary"
          />
          <span className="text-sm text-theme-text-secondary">تفعيل الانتقالات</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.highContrast}
            onChange={(e) => updateTheme({ highContrast: e.target.checked })}
            className="w-4 h-4 text-theme-primary border-theme-border-primary rounded focus:ring-theme-primary"
          />
          <span className="text-sm text-theme-text-secondary">تباين عالي</span>
        </label>
      </div>
    </div>
  );
}

// Hook لاستخدام الألوان التكيفية
export function useAdaptiveColors() {
  const { colors, isDark } = useTheme();

  const getContrastColor = (backgroundColor: string): string => {
    // حساب لون النص المناسب بناءً على لون الخلفية
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 128 ? colors.text.primary : colors.text.inverse;
  };

  const getStatusColor = (status: 'success' | 'warning' | 'error' | 'info', variant: 'solid' | 'soft' = 'solid') => {
    const baseColor = colors.status[status];

    if (variant === 'soft') {
      return {
        backgroundColor: `${baseColor}20`,
        borderColor: `${baseColor}40`,
        color: baseColor,
      };
    }

    return {
      backgroundColor: baseColor,
      color: getContrastColor(baseColor),
    };
  };

  return {
    colors,
    isDark,
    getContrastColor,
    getStatusColor,
  };
}
