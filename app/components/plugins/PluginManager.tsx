import React, { useState, useEffect } from 'react';
import { pluginSystem } from '~/lib/plugins/PluginSystem';
import type { PluginType, PluginStatus, InstalledPlugin } from '~/lib/plugins/PluginSystem';
import { SmoothTransition, AnimatedText } from '~/components/ui/SmoothTransitions';
import { useTheme } from '~/components/ui/SmartThemeSystem';
import { usePerformanceMonitor, useMemoizedValue } from '~/lib/hooks/useOptimizedState';
import { classNames } from '~/utils/classNames';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import * as Switch from '@radix-ui/react-switch';

// import Progress from '@radix-ui/react-progress';

interface PluginManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PluginManager({ isOpen, onClose }: PluginManagerProps) {
  const [_activeTab, _setActiveTab] = useState('installed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PluginType | 'all'>('all');
  const [plugins, setPlugins] = useState<Map<string, InstalledPlugin>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<InstalledPlugin | null>(null);

  const { _colors, _isDark } = useTheme();
  const { _getStatusColor } = useAdaptiveColors();
  const { _markRender } = usePerformanceMonitor('PluginManager');

  // تحديث قائمة الـ Plugins
  useEffect(() => {
    const updatePlugins = () => {
      setPlugins(pluginSystem.getAllPlugins());
    };

    updatePlugins();

    // الاستماع للتغييرات
    pluginSystem.on('pluginInstalled', updatePlugins);
    pluginSystem.on('pluginUninstalled', updatePlugins);
    pluginSystem.on('pluginStatusChanged', updatePlugins);

    return () => {
      pluginSystem.off('pluginInstalled', updatePlugins);
      pluginSystem.off('pluginUninstalled', updatePlugins);
      pluginSystem.off('pluginStatusChanged', updatePlugins);
    };
  }, []);

  // تصفية الـ Plugins
  const filteredPlugins = useMemoizedValue(
    () => {
      let filtered = Array.from(plugins.values());

      // تصفية حسب البحث
      if (searchQuery) {
        filtered = pluginSystem.searchPlugins(searchQuery);
      }

      // تصفية حسب النوع
      if (selectedType !== 'all') {
        filtered = filtered.filter((p) => p.plugin.manifest.type === selectedType);
      }

      return filtered;
    },
    [plugins, searchQuery, selectedType],
    { maxAge: 1000 },
  );

  // إحصائيات النظام
  const systemStats = useMemoizedValue(
    () => {
      return pluginSystem.getSystemStats();
    },
    [plugins],
    { maxAge: 5000 },
  );

  // تفعيل/إلغاء تفعيل Plugin
  const togglePlugin = async (id: string, currentStatus: PluginStatus) => {
    setIsLoading(true);
    _markRender('plugin-toggle');

    try {
      if (currentStatus === 'active') {
        await pluginSystem.deactivatePlugin(id);
      } else {
        await pluginSystem.activatePlugin(id);
      }
    } catch (error) {
      console.error('Failed to toggle plugin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // حذف Plugin
  const uninstallPlugin = async (id: string) => {
    setIsLoading(true);
    _markRender('plugin-uninstall');

    try {
      await pluginSystem.uninstallPlugin(id);
      setSelectedPlugin(null);
    } catch (error) {
      console.error('Failed to uninstall plugin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // الحصول على لون الحالة
  const getPluginStatusColor = (status: PluginStatus) => {
    switch (status) {
      case 'active':
        return _colors.status.success;
      case 'inactive':
        return _colors.text.secondary;
      case 'error':
        return _colors.status.error;
      case 'loading':
        return _colors.status.info;
      default:
        return _colors.text.secondary;
    }
  };

  // الحصول على أيقونة الحالة
  const getPluginStatusIcon = (status: PluginStatus) => {
    switch (status) {
      case 'active':
        return 'i-ph:check-circle-duotone';
      case 'inactive':
        return 'i-ph:circle-duotone';
      case 'error':
        return 'i-ph:warning-circle-duotone';
      case 'loading':
        return 'i-ph:spinner-duotone';
      default:
        return 'i-ph:circle-duotone';
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-lg shadow-2xl z-50"
          style={{
            backgroundColor: _colors.surface.card,
            border: `1px solid ${_colors.border.primary}`,
          }}
        >
          <SmoothTransition
            config={{
              type: 'scale',
              duration: 'normal',
              triggerOnMount: true,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4 border-b"
              style={{ borderColor: _colors.border.primary }}
            >
              <div className="flex items-center gap-3">
                <div className="i-ph:puzzle-piece-duotone text-2xl" style={{ color: _colors.primary }} />
                <div>
                  <AnimatedText text="إدارة الإضافات" className="text-lg font-semibold" animationType="fade-in-words" />
                  <div className="text-sm" style={{ color: _colors.text.secondary }}>
                    إدارة وتخصيص إضافات التطبيق
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* إحصائيات سريعة */}
                <div className="flex items-center gap-4 text-sm mr-4">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: _colors.status.success }} />
                    <span style={{ color: _colors.text.secondary }}>{systemStats.active} نشط</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: _colors.text.secondary }} />
                    <span style={{ color: _colors.text.secondary }}>{systemStats.total} إجمالي</span>
                  </div>
                </div>

                <Dialog.Close asChild>
                  <button
                    className="p-2 rounded-lg transition-_colors hover:scale-105"
                    style={{
                      backgroundColor: _colors.surface.elevated,
                      color: _colors.text.secondary,
                    }}
                  >
                    <div className="i-ph:x text-lg" />
                  </button>
                </Dialog.Close>
              </div>
            </div>

            <div className="flex h-full">
              {/* Sidebar */}
              <div className="w-80 border-r flex flex-col" style={{ borderColor: _colors.border.primary }}>
                {/* Search */}
                <div className="p-4 border-b" style={{ borderColor: _colors.border.primary }}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="البحث في الإضافات..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm"
                      style={{
                        backgroundColor: _colors.surface.elevated,
                        borderColor: _colors.border.primary,
                        color: _colors.text.primary,
                      }}
                    />
                    <div
                      className="absolute left-3 top-2.5 i-ph:magnifying-glass text-lg"
                      style={{ color: _colors.text.secondary }}
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="p-4 border-b" style={{ borderColor: _colors.border.primary }}>
                  <div className="text-sm font-medium mb-2" style={{ color: _colors.text.primary }}>
                    تصفية حسب النوع
                  </div>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as PluginType | 'all')}
                    className="w-full p-2 rounded border text-sm"
                    style={{
                      backgroundColor: _colors.surface.elevated,
                      borderColor: _colors.border.primary,
                      color: _colors.text.primary,
                    }}
                  >
                    <option value="all">جميع الأنواع</option>
                    <option value="development-tool">أدوات التطوير</option>
                    <option value="code-editor">محرر الكود</option>
                    <option value="ai-assistant">مساعد ذكي</option>
                    <option value="build-tool">أدوات البناء</option>
                    <option value="deployment">النشر</option>
                    <option value="analytics">التحليلات</option>
                    <option value="theme">الثيمات</option>
                    <option value="integration">التكامل</option>
                  </select>
                </div>

                {/* Plugin List */}
                <div className="flex-1 overflow-auto">
                  {filteredPlugins.length === 0 ? (
                    <div className="p-4 text-center">
                      <div className="i-ph:package text-4xl mb-2" style={{ color: _colors.text.secondary }} />
                      <div className="text-sm" style={{ color: _colors.text.secondary }}>
                        لا توجد إضافات
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 space-y-2">
                      {filteredPlugins.map((plugin, _index) => (
                        <SmoothTransition
                          key={plugin.context.id}
                          config={{
                            type: 'slide-right',
                            duration: 'fast',
                            delay: index * 50,
                            triggerOnMount: true,
                          }}
                        >
                          <button
                            onClick={() => setSelectedPlugin(plugin)}
                            className={classNames(
                              'w-full p-3 rounded-lg border text-left transition-all hover:scale-[1.02]',
                              selectedPlugin?.context.id === plugin.context.id ? 'ring-2' : '',
                            )}
                            style={{
                              backgroundColor:
                                selectedPlugin?.context.id === plugin.context.id
                                  ? _colors.surface.elevated
                                  : _colors.surface.card,
                              borderColor:
                                selectedPlugin?.context.id === plugin.context.id
                                  ? _colors.primary
                                  : _colors.border.primary,
                              outline: `2px solid ${_colors.primary}`,
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: _colors.surface.elevated }}
                              >
                                {plugin.plugin.manifest.icon ? (
                                  <div className={plugin.plugin.manifest.icon} />
                                ) : (
                                  <div className="i-ph:puzzle-piece text-lg" style={{ color: _colors.primary }} />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="font-medium text-sm truncate" style={{ color: _colors.text.primary }}>
                                    {plugin.plugin.manifest.name}
                                  </div>
                                  <div
                                    className={classNames(
                                      getPluginStatusIcon(plugin.status),
                                      'text-sm flex-shrink-0',
                                      plugin.status === 'loading' ? 'animate-spin' : '',
                                    )}
                                    style={{ color: getPluginStatusColor(plugin.status) }}
                                  />
                                </div>

                                <div className="text-xs truncate mb-1" style={{ color: _colors.text.secondary }}>
                                  {plugin.plugin.manifest.description}
                                </div>

                                <div className="flex items-center gap-2 text-xs">
                                  <span
                                    className="px-2 py-0.5 rounded text-xs"
                                    style={{
                                      backgroundColor: `${_colors.primary}20`,
                                      color: _colors.primary,
                                    }}
                                  >
                                    {plugin.plugin.manifest.type}
                                  </span>
                                  <span style={{ color: _colors.text.tertiary }}>
                                    v{plugin.plugin.manifest.version}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        </SmoothTransition>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col">
                {selectedPlugin ? (
                  <SmoothTransition
                    config={{
                      type: 'fade',
                      duration: 'normal',
                      triggerOnMount: true,
                    }}
                  >
                    {/* Plugin Details Header */}
                    <div className="p-6 border-b" style={{ borderColor: _colors.border.primary }}>
                      <div className="flex items-start gap-4">
                        <div
                          className="w-16 h-16 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: _colors.surface.elevated }}
                        >
                          {selectedPlugin.plugin.manifest.icon ? (
                            <div className={classNames(selectedPlugin.plugin.manifest.icon, 'text-2xl')} />
                          ) : (
                            <div className="i-ph:puzzle-piece text-2xl" style={{ color: _colors.primary }} />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-xl font-semibold" style={{ color: _colors.text.primary }}>
                              {selectedPlugin.plugin.manifest.name}
                            </h2>
                            <div
                              className={classNames(
                                getPluginStatusIcon(selectedPlugin.status),
                                'text-lg',
                                selectedPlugin.status === 'loading' ? 'animate-spin' : '',
                              )}
                              style={{ color: getPluginStatusColor(selectedPlugin.status) }}
                            />
                          </div>

                          <p className="text-sm mb-3" style={{ color: _colors.text.secondary }}>
                            {selectedPlugin.plugin.manifest.description}
                          </p>

                          <div className="flex items-center gap-4 text-sm">
                            <span style={{ color: _colors.text.secondary }}>
                              الإصدار: <strong>{selectedPlugin.plugin.manifest.version}</strong>
                            </span>
                            <span style={{ color: _colors.text.secondary }}>
                              المطور: <strong>{selectedPlugin.plugin.manifest.author}</strong>
                            </span>
                            <span style={{ color: _colors.text.secondary }}>
                              الاستخدام: <strong>{selectedPlugin.usageCount}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Toggle Switch */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm" style={{ color: _colors.text.secondary }}>
                              {selectedPlugin.status === 'active' ? 'نشط' : 'غير نشط'}
                            </span>
                            <Switch.Root
                              checked={selectedPlugin.status === 'active'}
                              onCheckedChange={() => togglePlugin(selectedPlugin.context.id, selectedPlugin.status)}
                              disabled={isLoading || selectedPlugin.status === 'loading'}
                              className={classNames(
                                'relative inline-flex h-6 w-11 items-center rounded-full transition-_colors',
                                selectedPlugin.status === 'active' ? '' : '',
                                isLoading || selectedPlugin.status === 'loading' ? 'opacity-50' : '',
                              )}
                              style={{
                                backgroundColor:
                                  selectedPlugin.status === 'active'
                                    ? _colors.status.success
                                    : _colors.surface.elevated,
                              }}
                            >
                              <Switch.Thumb
                                className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                style={{
                                  transform:
                                    selectedPlugin.status === 'active' ? 'translateX(24px)' : 'translateX(4px)',
                                }}
                              />
                            </Switch.Root>
                          </div>

                          {/* Uninstall Button */}
                          <button
                            onClick={() => uninstallPlugin(selectedPlugin.context.id)}
                            disabled={isLoading}
                            className="px-3 py-1.5 text-sm rounded-lg border transition-_colors hover:scale-105 disabled:opacity-50"
                            style={{
                              backgroundColor: _colors.surface.elevated,
                              borderColor: _colors.status.error,
                              color: _colors.status.error,
                            }}
                          >
                            إلغاء التثبيت
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Plugin Details Content */}
                    <div className="flex-1 overflow-auto p-6">
                      <Tabs.Root defaultValue="info" className="h-full">
                        <Tabs.List className="flex border-b mb-6" style={{ borderColor: _colors.border.primary }}>
                          {[
                            { id: 'info', name: 'المعلومات', icon: 'i-ph:info-duotone' },
                            { id: 'config', name: 'الإعدادات', icon: 'i-ph:gear-duotone' },
                            { id: 'permissions', name: 'الصلاحيات', icon: 'i-ph:shield-duotone' },
                            { id: 'stats', name: 'الإحصائيات', icon: 'i-ph:chart-bar-duotone' },
                          ].map((tab) => (
                            <Tabs.Trigger
                              key={tab.id}
                              value={tab.id}
                              className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-_colors border-b-2 border-transparent data-[state=active]:border-current"
                              style={{ color: _colors.text.secondary }}
                            >
                              <div className={classNames(tab.icon, 'text-lg')} />
                              {tab.name}
                            </Tabs.Trigger>
                          ))}
                        </Tabs.List>

                        {/* Info Tab */}
                        <Tabs.Content value="info" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h3 className="font-medium mb-2" style={{ color: _colors.text.primary }}>
                                معلومات أساسية
                              </h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span style={{ color: _colors.text.secondary }}>المعرف:</span>
                                  <span style={{ color: _colors.text.primary }}>{selectedPlugin.context.id}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span style={{ color: _colors.text.secondary }}>النوع:</span>
                                  <span style={{ color: _colors.text.primary }}>
                                    {selectedPlugin.plugin.manifest.type}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span style={{ color: _colors.text.secondary }}>تاريخ التثبيت:</span>
                                  <span style={{ color: _colors.text.primary }}>
                                    {selectedPlugin.installDate.toLocaleDateString('ar-SA')}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span style={{ color: _colors.text.secondary }}>آخر استخدام:</span>
                                  <span style={{ color: _colors.text.primary }}>
                                    {selectedPlugin.lastUsed.toLocaleDateString('ar-SA')}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h3 className="font-medium mb-2" style={{ color: _colors.text.primary }}>
                                روابط
                              </h3>
                              <div className="space-y-2 text-sm">
                                {selectedPlugin.plugin.manifest.homepage && (
                                  <a
                                    href={selectedPlugin.plugin.manifest.homepage}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 hover:underline"
                                    style={{ color: _colors.primary }}
                                  >
                                    <div className="i-ph:house-duotone" />
                                    الصفحة الرئيسية
                                  </a>
                                )}
                                {selectedPlugin.plugin.manifest.repository && (
                                  <a
                                    href={selectedPlugin.plugin.manifest.repository}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 hover:underline"
                                    style={{ color: _colors.primary }}
                                  >
                                    <div className="i-ph:github-logo-duotone" />
                                    المستودع
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          {selectedPlugin.plugin.manifest.keywords && (
                            <div>
                              <h3 className="font-medium mb-2" style={{ color: _colors.text.primary }}>
                                الكلمات المفتاحية
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {selectedPlugin.plugin.manifest.keywords.map((keyword, _index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 rounded text-xs"
                                    style={{
                                      backgroundColor: `${_colors.primary}20`,
                                      color: _colors.primary,
                                    }}
                                  >
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </Tabs.Content>

                        {/* Config Tab */}
                        <Tabs.Content value="config" className="space-y-4">
                          <div
                            className="p-4 rounded-lg border text-center"
                            style={{
                              backgroundColor: _colors.surface.elevated,
                              borderColor: _colors.border.primary,
                            }}
                          >
                            <div className="i-ph:gear-duotone text-4xl mb-2" style={{ color: _colors.primary }} />
                            <div className="text-sm" style={{ color: _colors.text.secondary }}>
                              إعدادات الإضافة قيد التطوير
                            </div>
                          </div>
                        </Tabs.Content>

                        {/* Permissions Tab */}
                        <Tabs.Content value="permissions" className="space-y-4">
                          <div>
                            <h3 className="font-medium mb-3" style={{ color: _colors.text.primary }}>
                              الصلاحيات المطلوبة
                            </h3>
                            <div className="space-y-2">
                              {selectedPlugin.plugin.manifest.permissions.map((permission, _index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-3 p-2 rounded border"
                                  style={{
                                    backgroundColor: _colors.surface.elevated,
                                    borderColor: _colors.border.primary,
                                  }}
                                >
                                  <div
                                    className="i-ph:shield-check-duotone text-lg"
                                    style={{ color: _colors.status.success }}
                                  />
                                  <span className="text-sm" style={{ color: _colors.text.primary }}>
                                    {permission}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Tabs.Content>

                        {/* Stats Tab */}
                        <Tabs.Content value="stats" className="space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div
                              className="p-4 rounded-lg border text-center"
                              style={{
                                backgroundColor: _colors.surface.elevated,
                                borderColor: _colors.border.primary,
                              }}
                            >
                              <div className="text-2xl font-bold mb-1" style={{ color: _colors.text.primary }}>
                                {selectedPlugin.usageCount}
                              </div>
                              <div className="text-sm" style={{ color: _colors.text.secondary }}>
                                مرات الاستخدام
                              </div>
                            </div>

                            <div
                              className="p-4 rounded-lg border text-center"
                              style={{
                                backgroundColor: _colors.surface.elevated,
                                borderColor: _colors.border.primary,
                              }}
                            >
                              <div className="text-2xl font-bold mb-1" style={{ color: _colors.text.primary }}>
                                {Math.floor(
                                  (Date.now() - selectedPlugin.installDate.getTime()) / (1000 * 60 * 60 * 24),
                                )}
                              </div>
                              <div className="text-sm" style={{ color: _colors.text.secondary }}>
                                أيام منذ التثبيت
                              </div>
                            </div>

                            <div
                              className="p-4 rounded-lg border text-center"
                              style={{
                                backgroundColor: _colors.surface.elevated,
                                borderColor: _colors.border.primary,
                              }}
                            >
                              <div className="text-2xl font-bold mb-1" style={{ color: _colors.text.primary }}>
                                {selectedPlugin.status === 'active' ? '✓' : '✗'}
                              </div>
                              <div className="text-sm" style={{ color: _colors.text.secondary }}>
                                الحالة الحالية
                              </div>
                            </div>
                          </div>
                        </Tabs.Content>
                      </Tabs.Root>
                    </div>
                  </SmoothTransition>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="i-ph:cursor-click text-6xl mb-4" style={{ color: _colors.text.secondary }} />
                      <AnimatedText text="اختر إضافة لعرض تفاصيلها" className="text-lg" animationType="fade-in-words" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SmoothTransition>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
