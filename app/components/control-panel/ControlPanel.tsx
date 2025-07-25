import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { agentModelsStore } from '~/lib/stores/agent-mode';
import { SmoothTransition, AnimatedText } from '~/components/ui/SmoothTransitions';
import { useTheme } from '~/components/ui/SmartThemeSystem';
import { usePerformanceMonitor } from '~/lib/hooks/useOptimizedState';
import { classNames } from '~/utils/classNames';
import { AgentModeToggle } from '~/components/agent/AgentModeToggle';
import { AgentAnalytics } from '~/components/agent/AgentAnalytics';
import { PluginManager } from '~/components/plugins/PluginManager';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import * as Collapsible from '@radix-ui/react-collapsible';

// Import integration dependencies
import { netlifyConnection } from '~/lib/stores/netlify';
import { vercelConnection } from '~/lib/stores/vercel';
import { workbenchStore } from '~/lib/stores/workbench';
import { streamingState } from '~/lib/stores/streaming';
import { useVercelDeploy } from '~/components/deploy/VercelDeploy.client';
import { useNetlifyDeploy } from '~/components/deploy/NetlifyDeploy.client';
import { NetlifyDeploymentLink } from '~/components/chat/NetlifyDeploymentLink.client';
import { VercelDeploymentLink } from '~/components/chat/VercelDeploymentLink.client';

interface ControlPanelProps {
  onClose?: () => void;
}

export function ControlPanel({ onClose }: ControlPanelProps) {
  const [activeTab, setActiveTab] = useState('actions');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPluginManager, setShowPluginManager] = useState(false);
  const agentModels = useStore(agentModelsStore);
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [agentResponse, setAgentResponse] = useState(null);
  
  const toggleAgentMode = () => {
    setIsAgentMode(!isAgentMode);
  };
  const { colors, theme } = useTheme();
  const { markRender } = usePerformanceMonitor('ControlPanel');

  // Integration states
  const netlifyConn = useStore(netlifyConnection);
  const vercelConn = useStore(vercelConnection);
  const previews = useStore(workbenchStore.previews);
  const activePreview = previews[0];
  const isStreaming = useStore(streamingState);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployingTo, setDeployingTo] = useState<'netlify' | 'vercel' | null>(null);
  const { handleVercelDeploy } = useVercelDeploy();
  const { handleNetlifyDeploy } = useNetlifyDeploy();

  useEffect(() => {
    markRender('mount');
  }, [markRender]);

  // Get current model info
  const currentModel = 'gpt-4';
  const currentProvider = 'openai';
  const [isExecuting, setIsExecuting] = useState(false);

  // Deployment handlers
  const onVercelDeploy = async () => {
    setIsDeploying(true);
    setDeployingTo('vercel');
    try {
      await handleVercelDeploy();
    } finally {
      setIsDeploying(false);
      setDeployingTo(null);
    }
  };

  const onNetlifyDeploy = async () => {
    setIsDeploying(true);
    setDeployingTo('netlify');
    try {
      await handleNetlifyDeploy();
    } finally {
      setIsDeploying(false);
      setDeployingTo(null);
    }
  };

  // Quick Actions - محسن للهواتف
  const quickActions = [
    {
      id: 'create-react-app',
      title: 'إنشاء تطبيق React',
      description: 'إنشاء تطبيق React جديد مع TypeScript',
      icon: '⚛️',
      command: 'npx create-react-app my-app --template typescript',
      category: 'frontend',
      difficulty: 'مبتدئ'
    },
    {
      id: 'create-next-app',
      title: 'إنشاء تطبيق Next.js',
      description: 'إنشاء تطبيق Next.js مع App Router',
      icon: '🚀',
      command: 'npx create-next-app@latest my-next-app --typescript --tailwind --eslint',
      category: 'frontend',
      difficulty: 'متوسط'
    },
    {
      id: 'create-vue-app',
      title: 'إنشاء تطبيق Vue.js',
      description: 'إنشاء تطبيق Vue.js مع Vite',
      icon: '🟢',
      command: 'npm create vue@latest my-vue-app',
      category: 'frontend',
      difficulty: 'مبتدئ'
    },
    {
      id: 'create-node-api',
      title: 'إنشاء Node.js API',
      description: 'إنشاء API باستخدام Express.js',
      icon: '🟩',
      command: 'mkdir my-api && cd my-api && npm init -y && npm install express',
      category: 'backend',
      difficulty: 'متوسط'
    },
    {
      id: 'create-python-app',
      title: 'إنشاء تطبيق Python',
      description: 'إنشاء تطبيق Python مع Flask',
      icon: '🐍',
      command: 'mkdir my-python-app && cd my-python-app && python -m venv venv && pip install flask',
      category: 'backend',
      difficulty: 'مبتدئ'
    },
    {
      id: 'create-mobile-app',
      title: 'إنشاء تطبيق موبايل',
      description: 'إنشاء تطبيق React Native',
      icon: '📱',
      command: 'npx react-native init MyMobileApp',
      category: 'mobile',
      difficulty: 'متقدم'
    }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');
  const categories = ['all', 'frontend', 'backend', 'mobile'];

  const filteredActions = selectedCategory === 'all' 
    ? quickActions 
    : quickActions.filter(action => action.category === selectedCategory);

  const executeRealCommand = async (command: string, description: string) => {
    setIsExecuting(true);
    markRender('command-execute');
    
    try {
      console.log(`تنفيذ الأمر: ${command}`);
      console.log(`الوصف: ${description}`);
      
      // محاكاة تنفيذ الأمر
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`تم تنفيذ: ${description}`);
    } catch (error) {
      console.error('خطأ في تنفيذ الأمر:', error);
      alert('حدث خطأ في تنفيذ الأمر');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Dialog.Root open={true} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-4xl h-[90vh] max-h-[700px] bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden flex flex-col">
          {/* Header - محسن للهواتف */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <div className="i-ph:control-duotone text-white text-sm sm:text-lg" />
              </div>
              <div>
                <AnimatedText
                  text="لوحة التحكم المطور"
                  className="text-sm sm:text-lg font-bold text-gray-900"
                  animationType="fade-in-words"
                />
                <div className="text-xs sm:text-sm opacity-70" style={{ color: colors.text.secondary }}>
                  أدوات التطوير والذكاء الاصطناعي
                </div>
              </div>
            </div>

            <Dialog.Close asChild>
              <button className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="i-ph:x text-lg sm:text-xl" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              {/* Tab Navigation - محسن للهواتف */}
              <Tabs.List className="flex border-b border-gray-200 dark:border-gray-700 shrink-0 bg-gray-50 dark:bg-gray-800 overflow-x-auto">
                {[
                  { value: 'actions', label: 'الأوامر السريعة', icon: '⚡', color: 'text-yellow-500' },
                  { value: 'integrations', label: 'التكاملات', icon: '🔗', color: 'text-blue-500' },
                  { value: 'agent', label: 'الوكيل الذكي', icon: '🤖', color: 'text-purple-500' },
                  { value: 'analytics', label: 'التحليلات', icon: '📊', color: 'text-green-500' },
                  { value: 'plugins', label: 'الإضافات', icon: '🔌', color: 'text-orange-500' }
                ].map((tab) => (
                  <Tabs.Trigger
                    key={tab.value}
                    value={tab.value}
                    className={classNames(
                      'flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap',
                      'hover:bg-white dark:hover:bg-gray-700 border-b-2 border-transparent',
                      'data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400'
                    )}
                  >
                    <span className={classNames('text-base sm:text-lg', tab.color)}>{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                {/* Quick Actions Tab */}
                <Tabs.Content value="actions" className="h-full p-3 sm:p-6 overflow-y-auto">
                  {/* Category Filter - محسن للهواتف */}
                  <div className="mb-4 sm:mb-6">
                    <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2">
                      {[
                        { id: 'all', label: 'الكل', icon: '📁' },
                        { id: 'frontend', label: 'واجهة أمامية', icon: '🎨' },
                        { id: 'backend', label: 'خادم', icon: '⚙️' },
                        { id: 'mobile', label: 'موبايل', icon: '📱' }
                      ].map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={classNames(
                            'flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors whitespace-nowrap',
                            selectedCategory === category.id
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          )}
                        >
                          <span>{category.icon}</span>
                          <span>{category.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Agent Mode Toggle - محسن للهواتف */}
                  <div className="mb-4 sm:mb-6">
                    <SmoothTransition
                      config={{
                        type: 'slide-down',
                        duration: 'normal',
                        triggerOnMount: true
                      }}
                      show={true}
                    >
                      <div 
                        className="p-3 sm:p-4 rounded-lg border"
                        style={{
                          backgroundColor: colors.background.secondary,
                          borderColor: colors.border.primary
                        }}
                      >
                        <AgentModeToggle
                          currentModel={currentModel}
                          currentProvider={currentProvider}
                          onAgentModeChange={(enabled) => {
                            toggleAgentMode();
                          }}
                        />
                      </div>
                    </SmoothTransition>
                  </div>

                  {/* Quick Actions Grid - محسن للهواتف */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                    {filteredActions.map((action, index) => (
                      <SmoothTransition
                        key={action.id}
                        config={{
                          type: 'scale',
                          duration: 'normal',
                          triggerOnMount: true,
                          delay: index * 100
                        }}
                        show={true}
                      >
                        <button
                          onClick={() => executeRealCommand(action.command, action.description)}
                          disabled={isExecuting}
                          className={classNames(
                            'group relative p-3 sm:p-4 rounded-lg border transition-all duration-300',
                            'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            'text-left w-full'
                          )}
                          style={{
                            backgroundColor: colors.background.secondary,
                            borderColor: colors.border.primary
                          }}
                        >
                          <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                            <span className="text-xl sm:text-2xl">{action.icon}</span>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1 truncate">
                                {action.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {action.description}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className={classNames(
                              'px-2 py-1 text-xs rounded-full font-medium',
                              action.difficulty === 'مبتدئ' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                              action.difficulty === 'متوسط' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                              'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            )}>
                              {action.difficulty}
                            </span>
                            
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {isExecuting ? '⏳ جاري التنفيذ...' : '▶️ تنفيذ'}
                            </div>
                          </div>
                        </button>
                      </SmoothTransition>
                    ))}
                  </div>
                </Tabs.Content>

                {/* Integrations Tab */}
                <Tabs.Content value="integrations" className="h-full p-3 sm:p-6 overflow-y-auto">
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                        🚀 خدمات النشر والاستضافة
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {/* Netlify */}
                        <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              className="w-6 h-6 sm:w-8 sm:h-8"
                              src="https://cdn.simpleicons.org/netlify"
                              alt="Netlify"
                            />
                            <div>
                              <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Netlify</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">استضافة مواقع ثابتة</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={onNetlifyDeploy}
                            disabled={isDeploying || !activePreview || !netlifyConn.user || isStreaming}
                            className={classNames(
                              'w-full px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors',
                              netlifyConn.user && activePreview && !isDeploying
                                ? 'bg-[#00AD9F] text-white hover:bg-[#009688]'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            )}
                          >
                            {isDeploying && deployingTo === 'netlify' 
                              ? '⏳ جاري النشر...'
                              : !netlifyConn.user 
                                ? 'يتطلب ربط حساب Netlify'
                                : !activePreview
                                  ? 'لا يوجد مشروع للنشر'
                                  : '🚀 نشر على Netlify'
                            }
                          </button>
                          
                          {netlifyConn.user && <NetlifyDeploymentLink />}
                        </div>

                        {/* Vercel */}
                        <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              className="w-6 h-6 sm:w-8 sm:h-8 bg-black p-1 rounded"
                              src="https://cdn.simpleicons.org/vercel/white"
                              alt="Vercel"
                            />
                            <div>
                              <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Vercel</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">منصة تطوير ونشر</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={onVercelDeploy}
                            disabled={isDeploying || !activePreview || !vercelConn.user || isStreaming}
                            className={classNames(
                              'w-full px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors',
                              vercelConn.user && activePreview && !isDeploying
                                ? 'bg-black text-white hover:bg-gray-800'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            )}
                          >
                            {isDeploying && deployingTo === 'vercel'
                              ? '⏳ جاري النشر...'
                              : !vercelConn.user
                                ? 'يتطلب ربط حساب Vercel'
                                : !activePreview
                                  ? 'لا يوجد مشروع للنشر'
                                  : '🚀 نشر على Vercel'
                            }
                          </button>
                          
                          {vercelConn.user && <VercelDeploymentLink />}
                        </div>

                        {/* Cloudflare - Coming Soon */}
                        <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 opacity-60">
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              className="w-6 h-6 sm:w-8 sm:h-8"
                              src="https://cdn.simpleicons.org/cloudflare"
                              alt="Cloudflare"
                            />
                            <div>
                              <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Cloudflare</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">قريباً</p>
                            </div>
                          </div>
                          
                          <button
                            disabled
                            className="w-full px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          >
                            🔜 قريباً
                          </button>
                        </div>

                        {/* GitHub Pages - Coming Soon */}
                        <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 opacity-60">
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              className="w-6 h-6 sm:w-8 sm:h-8"
                              src="https://cdn.simpleicons.org/github"
                              alt="GitHub Pages"
                            />
                            <div>
                              <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">GitHub Pages</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">قريباً</p>
                            </div>
                          </div>
                          
                          <button
                            disabled
                            className="w-full px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          >
                            🔜 قريباً
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Other Integrations */}
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                        🔗 تكاملات أخرى
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {[
                          { name: 'Docker', icon: 'https://cdn.simpleicons.org/docker', status: 'قريباً' },
                          { name: 'AWS', icon: 'https://cdn.simpleicons.org/amazonaws', status: 'قريباً' },
                          { name: 'Firebase', icon: 'https://cdn.simpleicons.org/firebase', status: 'قريباً' },
                          { name: 'Supabase', icon: 'https://cdn.simpleicons.org/supabase', status: 'قريباً' },
                        ].map((integration) => (
                          <div
                            key={integration.name}
                            className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 opacity-60"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <img className="w-5 h-5" src={integration.icon} alt={integration.name} />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{integration.name}</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{integration.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Tabs.Content>

                {/* Agent Tab */}
                <Tabs.Content value="agent" className="h-full p-3 sm:p-6 overflow-y-auto">
                  <div className="space-y-4 sm:space-y-6">
                    <AgentModeToggle
                      currentModel={currentModel}
                      currentProvider={currentProvider}
                      onAgentModeChange={(enabled) => {
                        toggleAgentMode();
                        if (enabled) {
                          setShowAnalytics(true);
                        }
                      }}
                    />
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAnalytics(true)}
                        className="px-3 sm:px-4 py-2 bg-blue-500 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        📊 عرض التحليلات
                      </button>
                    </div>
                  </div>
                </Tabs.Content>

                {/* Analytics Tab */}
                <Tabs.Content value="analytics" className="h-full p-3 sm:p-6 overflow-y-auto">
                  <div className="text-center py-8 sm:py-12">
                    <div className="text-4xl sm:text-6xl mb-4">📊</div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      تحليلات الوكيل الذكي
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                      اعرض إحصائيات مفصلة عن أداء الوكيل الذكي
                    </p>
                    <button
                      onClick={() => setShowAnalytics(true)}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm sm:text-base font-medium rounded-lg hover:shadow-lg transition-all"
                    >
                      📈 فتح التحليلات
                    </button>
                  </div>
                </Tabs.Content>

                {/* Plugins Tab */}
                <Tabs.Content value="plugins" className="h-full p-3 sm:p-6 overflow-y-auto">
                  <div className="text-center py-8 sm:py-12">
                    <div className="text-4xl sm:text-6xl mb-4">🔌</div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      مدير الإضافات
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                      إدارة وتثبيت الإضافات لتوسيع وظائف التطبيق
                    </p>
                    <button
                      onClick={() => setShowPluginManager(true)}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm sm:text-base font-medium rounded-lg hover:shadow-lg transition-all"
                    >
                      🛠️ فتح مدير الإضافات
                    </button>
                  </div>
                </Tabs.Content>
              </div>
            </Tabs.Root>
          </div>
        </Dialog.Content>
      </Dialog.Portal>

      {/* Modals */}
      {showAnalytics && (
        <AgentAnalytics
          agentResponse={agentResponse}
          isVisible={showAnalytics}
          onClose={() => setShowAnalytics(false)}
        />
      )}

      {showPluginManager && (
        <PluginManager
          onClose={() => setShowPluginManager(false)}
        />
      )}
    </Dialog.Root>
  );
}
