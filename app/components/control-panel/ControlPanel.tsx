import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { classNames } from '~/utils/classNames';
import { agentModelsStore, isModelInAgentMode } from '~/lib/stores/agent-mode';
import { realAITools } from '~/lib/ai-integrations/real-ai-tools';
import { AgentModeToggle } from '~/components/agent/AgentModeToggle';
import { AgentAnalytics } from '~/components/agent/AgentAnalytics';
import { PluginManager } from '~/components/plugins/PluginManager';
import { useAgentMode } from '~/lib/hooks/useAgentMode';
import { SmoothTransition, AnimatedText } from '~/components/ui/SmoothTransitions';
import { useTheme } from '~/components/ui/SmartThemeSystem';
import { usePerformanceMonitor } from '~/lib/hooks/useOptimizedState';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import * as Tooltip from '@radix-ui/react-tooltip';

interface ControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (command: string) => void;
  currentModel?: string;
  currentProvider?: string;
}

export function ControlPanel({ isOpen, onClose, onExecuteCommand, currentModel, currentProvider }: ControlPanelProps) {
  const [activeTab, setActiveTab] = useState('development');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string>('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPluginManager, setShowPluginManager] = useState(false);
  const agentModels = useStore(agentModelsStore);
  const { isAgentMode, toggleAgentMode, agentResponse } = useAgentMode();
  const { colors, isDark } = useTheme();
  const { markRender } = usePerformanceMonitor('ControlPanel');

  useEffect(() => {
    markRender('ControlPanel mounted');
  }, [markRender]);

  const executeRealCommand = async (command: string, description: string) => {
    setIsExecuting(true);
    setExecutionResult('جاري التنفيذ...');

    try {
      // تنفيذ أوامر الذكاء الاصطناعي الحقيقية
      if (command.includes('ai-code-review')) {
        const sampleCode = `function calculateSum(a, b) {
          return a + b;
        }`;
        const result = await realAITools.reviewCode(sampleCode, 'javascript');
        setExecutionResult(JSON.stringify(result, null, 2));
      } else if (command.includes('ai-optimize')) {
        const sampleCode = `function slowFunction() {
          for(let i = 0; i < 1000000; i++) {
            console.log(i);
          }
        }`;
        const result = await realAITools.optimizeCode(sampleCode, 'javascript');
        setExecutionResult(JSON.stringify(result, null, 2));
      } else {
        // تنفيذ الأوامر العادية
        onExecuteCommand(command);
        setExecutionResult(`تم تنفيذ: ${description}`);
      }
    } catch (error) {
      setExecutionResult(`خطأ: ${error instanceof Error ? error.message : 'حدث خطأ غير معروف'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const quickActions = [
    {
      id: 'ai-code-review',
      title: 'مراجعة الكود بالذكاء الاصطناعي',
      description: 'تحليل وتقييم جودة الكود',
      icon: 'i-ph:code-bold',
      command: 'ai-code-review --analyze',
      color: colors.status.info,
      category: 'ai'
    },
    {
      id: 'ai-optimize',
      title: 'تحسين الكود',
      description: 'تحسين الأداء والكفاءة',
      icon: 'i-ph:lightning-bold',
      command: 'ai-optimize --performance',
      color: colors.status.warning,
      category: 'ai'
    },
    {
      id: 'create-component',
      title: 'إنشاء مكون جديد',
      description: 'إنشاء مكون React محسن',
      icon: 'i-ph:plus-circle-bold',
      command: 'create-react-component',
      color: colors.status.success,
      category: 'development'
    },
    {
      id: 'run-tests',
      title: 'تشغيل الاختبارات',
      description: 'تشغيل جميع اختبارات المشروع',
      icon: 'i-ph:test-tube-bold',
      command: 'npm test',
      color: colors.primary,
      category: 'testing'
    },
    {
      id: 'build-project',
      title: 'بناء المشروع',
      description: 'بناء المشروع للإنتاج',
      icon: 'i-ph:hammer-bold',
      command: 'npm run build',
      color: colors.secondary,
      category: 'deployment'
    },
    {
      id: 'lint-fix',
      title: 'إصلاح التنسيق',
      description: 'إصلاح أخطاء ESLint و Prettier',
      icon: 'i-ph:wrench-bold',
      command: 'npm run lint:fix',
      color: colors.accent,
      category: 'maintenance'
    }
  ];

  const filteredActions = quickActions.filter(action => 
    activeTab === 'all' || action.category === activeTab
  );

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <Dialog.Content 
          className={classNames(
            'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'w-[95vw] max-w-4xl h-[90vh] max-h-[800px]',
            'rounded-xl border shadow-2xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            'overflow-hidden flex flex-col'
          )}
          style={{
            backgroundColor: colors.background.primary,
            borderColor: colors.border.primary
          }}
        >
          {/* Header - محسن للهواتف المحمولة */}
          <div 
            className="flex items-center justify-between p-3 sm:p-4 border-b shrink-0"
            style={{ borderColor: colors.border.secondary }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div 
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: colors.primary }}
              >
                <div className="i-ph:gear-bold text-white text-sm sm:text-base" />
              </div>
              <div>
                <AnimatedText
                  text="لوحة التحكم المطور"
                  className="text-sm sm:text-lg font-bold"
                  style={{ color: colors.text.primary }}
                  animationType="fade-in-words"
                />
                <div className="text-xs sm:text-sm opacity-70" style={{ color: colors.text.secondary }}>
                  أدوات التطوير والذكاء الاصطناعي
                </div>
              </div>
            </div>

            {/* Quick Action Buttons - محسن للهواتف */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={() => setShowAnalytics(true)}
                      className={classNames(
                        'p-1.5 sm:p-2 rounded-lg transition-all duration-200',
                        'hover:scale-105 active:scale-95'
                      )}
                      style={{ 
                        backgroundColor: colors.background.secondary,
                        color: colors.text.primary
                      }}
                    >
                      <div className="i-ph:chart-line-bold text-sm sm:text-base" />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Content 
                    className="px-2 py-1 text-xs rounded shadow-lg"
                    style={{
                      backgroundColor: colors.background.tertiary,
                      color: colors.text.primary,
                      border: `1px solid ${colors.border.primary}`
                    }}
                  >
                    تحليلات الوكيل
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>

              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={() => setShowPluginManager(true)}
                      className={classNames(
                        'p-1.5 sm:p-2 rounded-lg transition-all duration-200',
                        'hover:scale-105 active:scale-95'
                      )}
                      style={{ 
                        backgroundColor: colors.background.secondary,
                        color: colors.text.primary
                      }}
                    >
                      <div className="i-ph:puzzle-piece-bold text-sm sm:text-base" />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Content 
                    className="px-2 py-1 text-xs rounded shadow-lg"
                    style={{
                      backgroundColor: colors.background.tertiary,
                      color: colors.text.primary,
                      border: `1px solid ${colors.border.primary}`
                    }}
                  >
                    إدارة الإضافات
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>

              <Dialog.Close asChild>
                <button
                  className={classNames(
                    'p-1.5 sm:p-2 rounded-lg transition-all duration-200',
                    'hover:scale-105 active:scale-95'
                  )}
                  style={{ 
                    backgroundColor: colors.background.secondary,
                    color: colors.text.primary
                  }}
                >
                  <div className="i-ph:x-bold text-sm sm:text-base" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Content Area - محسن للهواتف */}
          <div className="flex-1 overflow-hidden">
            <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              {/* Tab Navigation - محسن للهواتف */}
              <Tabs.List 
                className="flex border-b shrink-0 overflow-x-auto scrollbar-hide"
                style={{ borderColor: colors.border.secondary }}
              >
                {[
                  { value: 'development', label: 'تطوير', icon: 'i-ph:code-bold' },
                  { value: 'ai', label: 'ذكاء اصطناعي', icon: 'i-ph:brain-bold' },
                  { value: 'testing', label: 'اختبار', icon: 'i-ph:test-tube-bold' },
                  { value: 'deployment', label: 'نشر', icon: 'i-ph:rocket-bold' },
                  { value: 'maintenance', label: 'صيانة', icon: 'i-ph:wrench-bold' },
                  { value: 'all', label: 'الكل', icon: 'i-ph:list-bold' }
                ].map((tab) => (
                  <Tabs.Trigger
                    key={tab.value}
                    value={tab.value}
                    className={classNames(
                      'flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium',
                      'transition-all duration-200 border-b-2 border-transparent',
                      'hover:bg-opacity-50 whitespace-nowrap',
                      'data-[state=active]:border-current'
                    )}
                    style={{
                      color: activeTab === tab.value ? colors.primary : colors.text.secondary,
                      backgroundColor: activeTab === tab.value ? `${colors.primary}10` : 'transparent'
                    }}
                  >
                    <div className={`${tab.icon} text-sm sm:text-base`} />
                    <span className="hidden xs:inline">{tab.label}</span>
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              {/* Tab Content - محسن للهواتف */}
              <div className="flex-1 overflow-hidden">
                <Tabs.Content value={activeTab} className="h-full p-2 sm:p-4 overflow-y-auto">
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
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div 
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300"
                              style={{ 
                                backgroundColor: `${action.color}20`,
                                color: action.color
                              }}
                            >
                              <div className={`${action.icon} text-sm sm:text-base`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 
                                className="font-semibold text-sm sm:text-base mb-1 truncate"
                                style={{ color: colors.text.primary }}
                              >
                                {action.title}
                              </h3>
                              <p 
                                className="text-xs sm:text-sm opacity-70 line-clamp-2"
                                style={{ color: colors.text.secondary }}
                              >
                                {action.description}
                              </p>
                            </div>
                          </div>

                          {/* Loading Indicator */}
                          {isExecuting && (
                            <div className="absolute inset-0 bg-black/10 rounded-lg flex items-center justify-center">
                              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                        </button>
                      </SmoothTransition>
                    ))}
                  </div>

                  {/* Execution Result - محسن للهواتف */}
                  {executionResult && (
                    <SmoothTransition
                      config={{
                        type: 'slide-up',
                        duration: 'normal',
                        triggerOnMount: true
                      }}
                      show={!!executionResult}
                    >
                      <div className="mt-4 sm:mt-6">
                        <h3 
                          className="text-sm sm:text-base font-semibold mb-2 sm:mb-3"
                          style={{ color: colors.text.primary }}
                        >
                          نتيجة التنفيذ:
                        </h3>
                        <div 
                          className="p-3 sm:p-4 rounded-lg border font-mono text-xs sm:text-sm max-h-40 sm:max-h-60 overflow-y-auto"
                          style={{
                            backgroundColor: colors.background.tertiary,
                            borderColor: colors.border.secondary,
                            color: colors.text.primary
                          }}
                        >
                          <pre className="whitespace-pre-wrap break-words">{executionResult}</pre>
                        </div>
                      </div>
                    </SmoothTransition>
                  )}
                </Tabs.Content>
              </div>
            </Tabs.Root>
          </div>
        </Dialog.Content>
      </Dialog.Portal>

      {/* Analytics Modal */}
      <AgentAnalytics
        agentResponse={agentResponse}
        isVisible={showAnalytics}
        onClose={() => setShowAnalytics(false)}
      />

      {/* Plugin Manager Modal */}
      <PluginManager
        isVisible={showPluginManager}
        onClose={() => setShowPluginManager(false)}
      />
    </Dialog.Root>
  );
}
