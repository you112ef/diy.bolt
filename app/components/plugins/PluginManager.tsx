import React, { useState, useEffect } from 'react';
import { pluginSystem } from '~/lib/plugins/PluginSystem';
import type { PluginType, PluginStatus, InstalledPlugin } from '~/lib/plugins/PluginSystem';
import { useTheme } from '~/components/ui/SmartThemeSystem';
import { usePerformanceMonitor } from '~/lib/hooks/useOptimizedState';
import { classNames } from '~/utils/classNames';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';

interface PluginManagerProps {
  onClose?: () => void;
}

export function PluginManager({ onClose }: PluginManagerProps) {
  const [activeTab, setActiveTab] = useState('installed');
  const [selectedPlugin, setSelectedPlugin] = useState<InstalledPlugin | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PluginType | 'all'>('all');
  
  const { colors, theme } = useTheme();
  const { markRender } = usePerformanceMonitor('PluginManager');

  // Real plugin data
  const [installedPlugins, setInstalledPlugins] = useState<InstalledPlugin[]>([]);
  const [availablePlugins, setAvailablePlugins] = useState<any[]>([]);

  useEffect(() => {
    markRender('mount');
    loadPlugins();
  }, [markRender]);

  const loadPlugins = async () => {
    try {
      // Load real installed plugins
      const installedMap = pluginSystem.getAllPlugins();
      const installed = Array.from(installedMap.values());
      setInstalledPlugins(installed);

      // Mock available plugins - in real app this would come from a registry
      const available = [
        {
          id: 'code-formatter',
          name: 'Code Formatter Pro',
          description: 'تنسيق الكود بشكل احترافي مع دعم عدة لغات',
          version: '2.1.0',
          author: 'DevTools Team',
          category: 'development' as PluginType,
          rating: 4.8,
          downloads: 15420,
          tags: ['formatting', 'code', 'productivity'],
          icon: '🎨'
        },
        {
          id: 'ai-assistant',
          name: 'AI Code Assistant',
          description: 'مساعد ذكي لكتابة وتحسين الكود',
          version: '1.5.2',
          author: 'AI Solutions',
          category: 'ai' as PluginType,
          rating: 4.9,
          downloads: 28350,
          tags: ['ai', 'assistant', 'coding'],
          icon: '🤖'
        },
        {
          id: 'theme-manager',
          name: 'Advanced Theme Manager',
          description: 'إدارة وتخصيص ثيمات المحرر',
          version: '3.0.1',
          author: 'UI Team',
          category: 'ui' as PluginType,
          rating: 4.6,
          downloads: 12890,
          tags: ['theme', 'ui', 'customization'],
          icon: '🎭'
        }
      ];
      setAvailablePlugins(available);
    } catch (error) {
      console.error('Error loading plugins:', error);
    }
  };

  const filteredPlugins = installedPlugins.filter(plugin => {
    const matchesSearch = plugin.plugin.manifest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plugin.plugin.manifest.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || plugin.plugin.manifest.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInstallPlugin = async (pluginId: string) => {
    try {
      // In real implementation, this would install from registry
      console.log('Installing plugin:', pluginId);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate installation
      loadPlugins(); // Reload plugins
    } catch (error) {
      console.error('Error installing plugin:', error);
    }
  };

  const handleUninstallPlugin = async (pluginId: string) => {
    try {
      await pluginSystem.uninstallPlugin(pluginId);
      loadPlugins(); // Reload plugins
      setSelectedPlugin(null);
    } catch (error) {
      console.error('Error uninstalling plugin:', error);
    }
  };

  const handleTogglePlugin = async (pluginId: string, active: boolean) => {
    try {
      if (active) {
        await pluginSystem.activatePlugin(pluginId);
      } else {
        await pluginSystem.deactivatePlugin(pluginId);
      }
      loadPlugins(); // Reload plugins
    } catch (error) {
      console.error('Error toggling plugin:', error);
    }
  };

  return (
    <Dialog.Root open={true} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-5xl h-[90vh] max-h-[800px] bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🔌</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  مدير الإضافات
                </h2>
                <div className="text-sm text-gray-500">
                  إدارة وتثبيت الإضافات
                </div>
              </div>
            </div>

            <Dialog.Close asChild>
              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-5 h-5">✕</div>
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              {/* Tab Navigation */}
              <Tabs.List className="flex border-b border-gray-200 shrink-0 bg-gray-50">
                {[
                  { value: 'installed', label: 'المثبتة', icon: '📦', count: installedPlugins.length },
                  { value: 'available', label: 'المتاحة', icon: '🌐', count: availablePlugins.length },
                  { value: 'settings', label: 'الإعدادات', icon: '⚙️' }
                ].map((tab) => (
                  <Tabs.Trigger
                    key={tab.value}
                    value={tab.value}
                    className={classNames(
                      'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                      'hover:bg-white border-b-2 border-transparent',
                      'data-[state=active]:bg-white data-[state=active]:border-purple-500 data-[state=active]:text-purple-600'
                    )}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                {/* Installed Plugins Tab */}
                <Tabs.Content value="installed" className="h-full flex">
                  <div className="flex-1 p-4 overflow-y-auto">
                    {/* Search and Filters */}
                    <div className="mb-6 space-y-4">
                      <input
                        type="text"
                        placeholder="البحث في الإضافات..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { value: 'all', label: 'الكل' },
                          { value: 'development', label: 'تطوير' },
                          { value: 'ai', label: 'ذكاء اصطناعي' },
                          { value: 'ui', label: 'واجهة' },
                          { value: 'productivity', label: 'إنتاجية' }
                        ].map((category) => (
                          <button
                            key={category.value}
                            onClick={() => setSelectedCategory(category.value as any)}
                            className={classNames(
                              'px-3 py-1 text-sm rounded-lg transition-colors',
                              selectedCategory === category.value
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            )}
                          >
                            {category.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Plugins Grid */}
                    {filteredPlugins.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-4xl mb-4">📦</div>
                        <div className="text-gray-500">
                          {searchQuery || selectedCategory !== 'all' 
                            ? 'لا توجد إضافات تطابق البحث'
                            : 'لا توجد إضافات مثبتة'
                          }
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredPlugins.map((plugin, pluginIndex) => (
                          <div
                            key={plugin.plugin.manifest.id}
                            className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedPlugin(plugin)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <span className="text-lg">🔌</span>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    {plugin.plugin.manifest.name}
                                  </h3>
                                  <div className="text-xs text-gray-500">
                                    v{plugin.plugin.manifest.version}
                                  </div>
                                </div>
                              </div>
                              
                              <div className={classNames(
                                'w-3 h-3 rounded-full',
                                plugin.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                              )} />
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {plugin.plugin.manifest.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className={classNames(
                                'px-2 py-1 text-xs rounded-lg font-medium',
                                plugin.status === 'active' 
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-600'
                              )}>
                                {plugin.status === 'active' ? 'مفعلة' : 'معطلة'}
                              </span>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTogglePlugin(plugin.plugin.manifest.id, plugin.status !== 'active');
                                }}
                                className={classNames(
                                  'px-3 py-1 text-xs rounded-lg transition-colors',
                                  plugin.status === 'active'
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                )}
                              >
                                {plugin.status === 'active' ? 'تعطيل' : 'تفعيل'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Plugin Details Sidebar */}
                  {selectedPlugin && (
                    <div className="w-80 border-l border-gray-200 bg-gray-50 p-4 overflow-y-auto">
                      <div className="mb-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <span className="text-xl">🔌</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {selectedPlugin.plugin.manifest.name}
                            </h3>
                            <div className="text-sm text-gray-500">
                              v{selectedPlugin.plugin.manifest.version}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4">
                          {selectedPlugin.plugin.manifest.description}
                        </p>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">المطور</div>
                            <div className="text-sm text-gray-900">{selectedPlugin.plugin.manifest.author}</div>
                          </div>
                          
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">النوع</div>
                            <div className="text-sm text-gray-900">{selectedPlugin.plugin.manifest.type}</div>
                          </div>
                          
                          {selectedPlugin.plugin.manifest.keywords && (
                            <div>
                              <div className="text-xs font-medium text-gray-500 mb-2">الكلمات المفتاحية</div>
                              <div className="flex flex-wrap gap-1">
                                {selectedPlugin.plugin.manifest.keywords.map((keyword, keywordIndex) => (
                                  <span
                                    key={keywordIndex}
                                    className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {selectedPlugin.plugin.manifest.permissions && (
                            <div>
                              <div className="text-xs font-medium text-gray-500 mb-2">الصلاحيات</div>
                              <div className="space-y-1">
                                {selectedPlugin.plugin.manifest.permissions.map((permission, permissionIndex) => (
                                  <div
                                    key={permissionIndex}
                                    className="text-xs text-gray-600 flex items-center gap-2"
                                  >
                                    <span className="w-1 h-1 bg-gray-400 rounded-full" />
                                    {permission}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-6 space-y-2">
                          <button
                            onClick={() => handleTogglePlugin(selectedPlugin.plugin.manifest.id, selectedPlugin.status !== 'active')}
                            className={classNames(
                              'w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                              selectedPlugin.status === 'active'
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-green-500 text-white hover:bg-green-600'
                            )}
                          >
                            {selectedPlugin.status === 'active' ? 'تعطيل الإضافة' : 'تفعيل الإضافة'}
                          </button>
                          
                          <button
                            onClick={() => handleUninstallPlugin(selectedPlugin.plugin.manifest.id)}
                            className="w-full px-4 py-2 text-sm font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            إلغاء التثبيت
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Tabs.Content>

                {/* Available Plugins Tab */}
                <Tabs.Content value="available" className="h-full p-4 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availablePlugins.map((plugin, pluginIndex) => (
                      <div key={plugin.id} className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-lg">{plugin.icon}</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{plugin.name}</h3>
                              <div className="text-xs text-gray-500">v{plugin.version}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span>⭐</span>
                            <span>{plugin.rating}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {plugin.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-xs text-gray-500">
                            {plugin.downloads.toLocaleString()} تحميل
                          </div>
                          <div className="text-xs text-gray-500">
                            {plugin.author}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {plugin.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                            <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <button
                          onClick={() => handleInstallPlugin(plugin.id)}
                          className="w-full px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          تثبيت
                        </button>
                      </div>
                    ))}
                  </div>
                </Tabs.Content>

                {/* Settings Tab */}
                <Tabs.Content value="settings" className="h-full p-4 overflow-y-auto">
                  <div className="max-w-2xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">إعدادات الإضافات</h3>
                    
                    <div className="space-y-6">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">التحديث التلقائي</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          تحديث الإضافات تلقائياً عند توفر إصدارات جديدة
                        </p>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="w-4 h-4 text-purple-500 rounded" defaultChecked />
                          <span className="text-sm text-gray-700">تفعيل التحديث التلقائي</span>
                        </label>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">الإشعارات</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          إشعارات حول الإضافات الجديدة والتحديثات
                        </p>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="w-4 h-4 text-purple-500 rounded" defaultChecked />
                          <span className="text-sm text-gray-700">إشعارات الإضافات</span>
                        </label>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">مجلد الإضافات</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          مسار تثبيت الإضافات المحلية
                        </p>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value="~/.bolt/plugins" 
                            readOnly
                            className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm"
                          />
                          <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300">
                            تغيير
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tabs.Content>
              </div>
            </Tabs.Root>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
