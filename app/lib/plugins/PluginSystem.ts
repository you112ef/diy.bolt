import { createScopedLogger } from '~/utils/logger';
import { smartCache } from '~/lib/cache/SmartCacheManager';

// Simple EventEmitter implementation for browser compatibility
class SimpleEventEmitter {
  private events: Record<string, Function[]> = {};

  on(event: string, listener: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event].push(listener);
  }

  off(event: string, listener: Function) {
    if (!this.events[event]) {
      return;
    }

    this.events[event] = this.events[event].filter((l) => l !== listener);
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) {
      return;
    }

    this.events[event].forEach((listener) => {
      try {
        listener(...args);
      } catch (error) {
        console.error('Event listener error:', error);
      }
    });
  }

  setMaxListeners(n: number) {
    // Browser compatibility - no-op
  }
}

const logger = createScopedLogger('PluginSystem');

// أنواع الـ Plugins المختلفة
export type PluginType =
  | 'development-tool'
  | 'code-editor'
  | 'ai-assistant'
  | 'build-tool'
  | 'deployment'
  | 'analytics'
  | 'theme'
  | 'integration';

// حالة الـ Plugin
export type PluginStatus = 'active' | 'inactive' | 'error' | 'loading';

// معلومات الـ Plugin
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  type: PluginType;
  dependencies?: string[];
  permissions: PluginPermission[];
  config?: Record<string, any>;
  icon?: string;
  homepage?: string;
  repository?: string;
  keywords?: string[];
  minAppVersion?: string;
  maxAppVersion?: string;
}

// صلاحيات الـ Plugin
export type PluginPermission =
  | 'filesystem'
  | 'network'
  | 'shell'
  | 'ai-tools'
  | 'user-data'
  | 'system-info'
  | 'notifications'
  | 'clipboard';

// سياق تنفيذ الـ Plugin
export interface PluginContext {
  id: string;
  manifest: PluginManifest;
  config: Record<string, any>;
  logger: ReturnType<typeof createScopedLogger>;
  cache: typeof smartCache;
  events: SimpleEventEmitter;
  permissions: Set<PluginPermission>;
}

// واجهة الـ Plugin الأساسية
export interface Plugin {
  manifest: PluginManifest;
  activate(context: PluginContext): Promise<void>;
  deactivate(context: PluginContext): Promise<void>;
  onConfigChange?(config: Record<string, any>, context: PluginContext): Promise<void>;
  onAppUpdate?(version: string, context: PluginContext): Promise<void>;
}

// معلومات الـ Plugin المثبت
export interface InstalledPlugin {
  plugin: Plugin;
  context: PluginContext;
  status: PluginStatus;
  installDate: Date;
  lastUsed: Date;
  usageCount: number;
  error?: string;
}

// نظام إدارة الـ Plugins
export class PluginSystem extends SimpleEventEmitter {
  private plugins = new Map<string, InstalledPlugin>();
  private pluginHooks = new Map<string, Set<Function>>();
  private isInitialized = false;

  constructor() {
    super();
    this.setMaxListeners(100); // زيادة الحد الأقصى للمستمعين
  }

  // تهيئة النظام
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      logger.info('Initializing plugin system');

      // تحميل الـ Plugins المحفوظة
      await this.loadInstalledPlugins();

      // تفعيل الـ Plugins النشطة
      await this.activateEnabledPlugins();

      this.isInitialized = true;
      this.emit('initialized');

      logger.info('Plugin system initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize plugin system', { error });
      throw error;
    }
  }

  // تثبيت Plugin جديد
  async installPlugin(plugin: Plugin): Promise<void> {
    const { id } = plugin.manifest;

    try {
      logger.info('Installing plugin', { id, name: plugin.manifest.name });

      // فحص المتطلبات
      await this.validatePlugin(plugin);

      // إنشاء السياق
      const context = this.createPluginContext(plugin);

      // تثبيت الـ Plugin
      const installedPlugin: InstalledPlugin = {
        plugin,
        context,
        status: 'inactive',
        installDate: new Date(),
        lastUsed: new Date(),
        usageCount: 0,
      };

      this.plugins.set(id, installedPlugin);

      // حفظ في التخزين المؤقت
      await this.savePluginRegistry();

      this.emit('pluginInstalled', { id, plugin });
      logger.info('Plugin installed successfully', { id });
    } catch (error) {
      logger.error('Failed to install plugin', { id, error });
      throw error;
    }
  }

  // إلغاء تثبيت Plugin
  async uninstallPlugin(id: string): Promise<void> {
    const installedPlugin = this.plugins.get(id);

    if (!installedPlugin) {
      throw new Error(`Plugin ${id} not found`);
    }

    try {
      logger.info('Uninstalling plugin', { id });

      // إلغاء التفعيل إذا كان نشطاً
      if (installedPlugin.status === 'active') {
        await this.deactivatePlugin(id);
      }

      // إزالة من النظام
      this.plugins.delete(id);

      // تنظيف البيانات
      await this.cleanupPluginData(id);

      // حفظ في التخزين المؤقت
      await this.savePluginRegistry();

      this.emit('pluginUninstalled', { id });
      logger.info('Plugin uninstalled successfully', { id });
    } catch (error) {
      logger.error('Failed to uninstall plugin', { id, error });
      throw error;
    }
  }

  // تفعيل Plugin
  async activatePlugin(id: string): Promise<void> {
    const installedPlugin = this.plugins.get(id);

    if (!installedPlugin) {
      throw new Error(`Plugin ${id} not found`);
    }

    if (installedPlugin.status === 'active') {
      return; // بالفعل نشط
    }

    try {
      logger.info('Activating plugin', { id });

      installedPlugin.status = 'loading';
      this.emit('pluginStatusChanged', { id, status: 'loading' });

      // تفعيل الـ Plugin
      await installedPlugin.plugin.activate(installedPlugin.context);

      installedPlugin.status = 'active';
      installedPlugin.lastUsed = new Date();
      installedPlugin.usageCount++;

      await this.savePluginRegistry();

      this.emit('pluginActivated', { id });
      this.emit('pluginStatusChanged', { id, status: 'active' });

      logger.info('Plugin activated successfully', { id });
    } catch (error) {
      installedPlugin.status = 'error';
      installedPlugin.error = error instanceof Error ? error.message : String(error);

      this.emit('pluginStatusChanged', { id, status: 'error' });
      logger.error('Failed to activate plugin', { id, error });

      throw error;
    }
  }

  // إلغاء تفعيل Plugin
  async deactivatePlugin(id: string): Promise<void> {
    const installedPlugin = this.plugins.get(id);

    if (!installedPlugin) {
      throw new Error(`Plugin ${id} not found`);
    }

    if (installedPlugin.status !== 'active') {
      return; // ليس نشطاً
    }

    try {
      logger.info('Deactivating plugin', { id });

      // إلغاء تفعيل الـ Plugin
      await installedPlugin.plugin.deactivate(installedPlugin.context);

      installedPlugin.status = 'inactive';
      installedPlugin.error = undefined;

      await this.savePluginRegistry();

      this.emit('pluginDeactivated', { id });
      this.emit('pluginStatusChanged', { id, status: 'inactive' });

      logger.info('Plugin deactivated successfully', { id });
    } catch (error) {
      logger.error('Failed to deactivate plugin', { id, error });
      throw error;
    }
  }

  // تحديث إعدادات Plugin
  async updatePluginConfig(id: string, config: Record<string, any>): Promise<void> {
    const installedPlugin = this.plugins.get(id);

    if (!installedPlugin) {
      throw new Error(`Plugin ${id} not found`);
    }

    try {
      logger.info('Updating plugin config', { id });

      // تحديث السياق
      installedPlugin.context.config = { ...installedPlugin.context.config, ...config };

      // إشعار الـ Plugin
      if (installedPlugin.plugin.onConfigChange && installedPlugin.status === 'active') {
        await installedPlugin.plugin.onConfigChange(config, installedPlugin.context);
      }

      await this.savePluginRegistry();

      this.emit('pluginConfigUpdated', { id, config });
      logger.info('Plugin config updated successfully', { id });
    } catch (error) {
      logger.error('Failed to update plugin config', { id, error });
      throw error;
    }
  }

  // تسجيل Hook
  registerHook(hookName: string, callback: Function): void {
    if (!this.pluginHooks.has(hookName)) {
      this.pluginHooks.set(hookName, new Set());
    }

    this.pluginHooks.get(hookName)!.add(callback);
    logger.debug('Hook registered', { hookName });
  }

  // إلغاء تسجيل Hook
  unregisterHook(hookName: string, callback: Function): void {
    const hooks = this.pluginHooks.get(hookName);

    if (hooks) {
      hooks.delete(callback);

      if (hooks.size === 0) {
        this.pluginHooks.delete(hookName);
      }
    }
  }

  // تنفيذ Hook
  async executeHook(hookName: string, ...args: any[]): Promise<any[]> {
    const hooks = this.pluginHooks.get(hookName);

    if (!hooks || hooks.size === 0) {
      return [];
    }

    const results: any[] = [];

    for (const hook of hooks) {
      try {
        const result = await hook(...args);
        results.push(result);
      } catch (error) {
        logger.error('Hook execution failed', { hookName, error });
      }
    }

    return results;
  }

  // الحصول على معلومات Plugin
  getPlugin(id: string): InstalledPlugin | undefined {
    return this.plugins.get(id);
  }

  // الحصول على جميع الـ Plugins
  getAllPlugins(): Map<string, InstalledPlugin> {
    return new Map(this.plugins);
  }

  // الحصول على الـ Plugins النشطة
  getActivePlugins(): InstalledPlugin[] {
    return Array.from(this.plugins.values()).filter((p) => p.status === 'active');
  }

  // الحصول على الـ Plugins حسب النوع
  getPluginsByType(type: PluginType): InstalledPlugin[] {
    return Array.from(this.plugins.values()).filter((p) => p.plugin.manifest.type === type);
  }

  // البحث في الـ Plugins
  searchPlugins(query: string): InstalledPlugin[] {
    const lowerQuery = query.toLowerCase();

    return Array.from(this.plugins.values()).filter((plugin) => {
      const manifest = plugin.plugin.manifest;
      return (
        manifest.name.toLowerCase().includes(lowerQuery) ||
        manifest.description.toLowerCase().includes(lowerQuery) ||
        manifest.keywords?.some((k) => k.toLowerCase().includes(lowerQuery))
      );
    });
  }

  // إحصائيات النظام
  getSystemStats() {
    const plugins = Array.from(this.plugins.values());

    return {
      total: plugins.length,
      active: plugins.filter((p) => p.status === 'active').length,
      inactive: plugins.filter((p) => p.status === 'inactive').length,
      error: plugins.filter((p) => p.status === 'error').length,
      byType: plugins.reduce(
        (acc, plugin) => {
          const type = plugin.plugin.manifest.type;
          acc[type] = (acc[type] || 0) + 1;

          return acc;
        },
        {} as Record<PluginType, number>,
      ),
      totalUsage: plugins.reduce((sum, p) => sum + p.usageCount, 0),
    };
  }

  // فحص صحة Plugin
  private async validatePlugin(plugin: Plugin): Promise<void> {
    const manifest = plugin.manifest;

    // فحص المعرف الفريد
    if (this.plugins.has(manifest.id)) {
      throw new Error(`Plugin with id ${manifest.id} already installed`);
    }

    // فحص الإصدار المطلوب
    if (manifest.minAppVersion) {
      // يمكن إضافة فحص الإصدار هنا
    }

    // فحص التبعيات
    if (manifest.dependencies) {
      for (const dep of manifest.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Missing dependency: ${dep}`);
        }
      }
    }

    // فحص الصلاحيات
    for (const permission of manifest.permissions) {
      if (!this.isPermissionAllowed(permission)) {
        throw new Error(`Permission ${permission} not allowed`);
      }
    }
  }

  // إنشاء سياق Plugin
  private createPluginContext(plugin: Plugin): PluginContext {
    const context: PluginContext = {
      id: plugin.manifest.id,
      manifest: plugin.manifest,
      config: plugin.manifest.config || {},
      logger: createScopedLogger(`Plugin:${plugin.manifest.name}`),
      cache: smartCache,
      events: new SimpleEventEmitter(),
      permissions: new Set(plugin.manifest.permissions),
    };

    return context;
  }

  // فحص الصلاحية
  private isPermissionAllowed(permission: PluginPermission): boolean {
    // يمكن إضافة منطق فحص الصلاحيات هنا
    const allowedPermissions: PluginPermission[] = ['filesystem', 'network', 'ai-tools', 'notifications', 'clipboard'];

    return allowedPermissions.includes(permission);
  }

  // تحميل الـ Plugins المثبتة
  private async loadInstalledPlugins(): Promise<void> {
    try {
      const savedPlugins = smartCache.get<any[]>('installed-plugins') || [];

      for (const savedPlugin of savedPlugins) {
        // يمكن إضافة منطق تحميل الـ Plugins المحفوظة
        logger.debug('Loading saved plugin', { id: savedPlugin.id });
      }
    } catch (error) {
      logger.error('Failed to load installed plugins', { error });
    }
  }

  // تفعيل الـ Plugins المفعلة
  private async activateEnabledPlugins(): Promise<void> {
    const enabledPlugins = Array.from(this.plugins.values()).filter((p) => p.status === 'active');

    for (const plugin of enabledPlugins) {
      try {
        await this.activatePlugin(plugin.context.id);
      } catch (error) {
        logger.error('Failed to activate enabled plugin', {
          id: plugin.context.id,
          error,
        });
      }
    }
  }

  // حفظ سجل الـ Plugins
  private async savePluginRegistry(): Promise<void> {
    try {
      const pluginData = Array.from(this.plugins.entries()).map(([id, plugin]) => ({
        id,
        manifest: plugin.plugin.manifest,
        config: plugin.context.config,
        status: plugin.status,
        installDate: plugin.installDate,
        lastUsed: plugin.lastUsed,
        usageCount: plugin.usageCount,
        error: plugin.error,
      }));

      smartCache.set('installed-plugins', pluginData, {
        ttl: 30 * 24 * 60 * 60 * 1000, // 30 يوم
      });
    } catch (error) {
      logger.error('Failed to save plugin registry', { error });
    }
  }

  // تنظيف بيانات Plugin
  private async cleanupPluginData(id: string): Promise<void> {
    try {
      // حذف البيانات المخزنة للـ Plugin
      const keys = smartCache.getStats();

      // يمكن إضافة منطق تنظيف أكثر تفصيلاً

      logger.debug('Plugin data cleaned up', { id });
    } catch (error) {
      logger.error('Failed to cleanup plugin data', { id, error });
    }
  }
}

// إنشاء مثيل مشترك
export const pluginSystem = new PluginSystem();

// تهيئة النظام عند التحميل
if (typeof window !== 'undefined') {
  pluginSystem.initialize().catch((error) => {
    logger.error('Failed to initialize plugin system', { error });
  });
}
