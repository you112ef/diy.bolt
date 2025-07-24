import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { classNames } from '~/utils/classNames';
import { agentModelsStore, isModelInAgentMode } from '~/lib/stores/agent-mode';
import { advancedAIAgent } from '~/lib/agents/advanced-ai-agent';
import * as Switch from '@radix-ui/react-switch';
import * as Tooltip from '@radix-ui/react-tooltip';
import { SmoothTransition, AnimatedText } from '~/components/ui/SmoothTransitions';
import { useTheme } from '~/components/ui/SmartThemeSystem';
import { usePerformanceMonitor } from '~/lib/hooks/useOptimizedState';

interface AgentModeToggleProps {
  currentModel?: string;
  currentProvider?: string;
  onAgentModeChange?: (enabled: boolean) => void;
}

export function AgentModeToggle({ currentModel, currentProvider, onAgentModeChange }: AgentModeToggleProps) {
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCapabilities, setShowCapabilities] = useState(false);
  const agentModels = useStore(agentModelsStore);
  const { colors, isDark } = useTheme();
  const { markRender } = usePerformanceMonitor('AgentModeToggle');

  // فحص ما إذا كان النموذج الحالي يدعم وضع الوكيل
  const isAgentSupported = currentModel && currentProvider && isModelInAgentMode(currentModel, currentProvider);

  useEffect(() => {
    if (isAgentSupported) {
      // تحديث حالة الوكيل عند تغيير النموذج
      setIsAgentMode(true);
      advancedAIAgent.setAgentMode(true);
    } else {
      setIsAgentMode(false);
      advancedAIAgent.setAgentMode(false);
    }
  }, [currentModel, currentProvider, isAgentSupported]);

  const handleToggle = async (enabled: boolean) => {
    if (!currentModel || !currentProvider) {
      return;
    }

    setIsTransitioning(true);

    try {
      // تحديث حالة الوكيل
      setIsAgentMode(enabled);
      advancedAIAgent.setAgentMode(enabled);

      // إشعار المكون الأب
      onAgentModeChange?.(enabled);

      // إضافة تأخير قصير للانتقال السلس
      await new Promise((resolve) => setTimeout(resolve, 300));
    } finally {
      setIsTransitioning(false);
    }
  };

  const getAgentCapabilities = () => {
    if (!isAgentMode) {
      return [];
    }

    return [
      { name: 'التفكير التلقائي', icon: 'i-ph:brain-duotone', color: 'text-blue-500' },
      { name: 'اختيار الأدوات', icon: 'i-ph:wrench-duotone', color: 'text-orange-500' },
      { name: 'البحث الذكي', icon: 'i-ph:magnifying-glass-duotone', color: 'text-purple-500' },
      { name: 'البحث العميق', icon: 'i-ph:telescope-duotone', color: 'text-indigo-500' },
      { name: 'جمع المعلومات', icon: 'i-ph:database-duotone', color: 'text-green-500' },
      { name: 'تحليل الكود', icon: 'i-ph:code-duotone', color: 'text-cyan-500' },
      { name: 'تحسين الأداء', icon: 'i-ph:lightning-duotone', color: 'text-yellow-500' },
      { name: 'تحليل الأمان', icon: 'i-ph:shield-duotone', color: 'text-red-500' },
    ];
  };

  if (!currentModel || !currentProvider) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Toggle Switch */}
      <div className="flex items-center justify-between p-3 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-lg">
        <div className="flex items-center gap-3">
          <div
            className={classNames(
              'i-ph:robot-duotone text-xl transition-colors',
              isAgentMode ? 'text-blue-500' : 'text-bolt-elements-textSecondary',
            )}
          />
          <div>
            <div className="text-sm font-medium text-bolt-elements-textPrimary">Agent Mode</div>
            <div className="text-xs text-bolt-elements-textSecondary">
              {isAgentMode ? 'الوكيل الذكي نشط' : 'الوضع العادي'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isTransitioning && <div className="i-svg-spinners:90-ring-with-bg text-blue-500 animate-spin text-sm" />}

          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div>
                  <Switch.Root
                    checked={isAgentMode}
                    onCheckedChange={handleToggle}
                    disabled={isTransitioning}
                    className={classNames(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                      isAgentMode ? 'bg-blue-500' : 'bg-gray-300',
                      isTransitioning ? 'opacity-50 cursor-not-allowed' : '',
                    )}
                  >
                    <Switch.Thumb
                      className={classNames(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        isAgentMode ? 'translate-x-6' : 'translate-x-1',
                      )}
                    />
                  </Switch.Root>
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary px-3 py-2 rounded-md text-sm shadow-lg border border-bolt-elements-borderColor z-50">
                  {isAgentMode ? 'تعطيل وضع الوكيل الذكي' : 'تفعيل وضع الوكيل الذكي للتفكير التلقائي واستخدام الأدوات'}
                  <Tooltip.Arrow className="fill-bolt-elements-background-depth-3" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
      </div>

      {/* Agent Capabilities */}
      <SmoothTransition
        config={{
          type: 'slide-down',
          duration: 'normal',
          triggerOnMount: false,
        }}
        show={isAgentMode}
      >
        <div
          className="p-3 border rounded-lg"
          style={{
            backgroundColor: colors.surface.card,
            borderColor: colors.border.primary,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <AnimatedText
              text="قدرات الوكيل الذكي النشطة:"
              className="text-xs font-medium"
              animationType="fade-in-words"
            />
            <button
              onClick={() => {
                markRender('capabilities-toggle');
                setShowCapabilities(!showCapabilities);
              }}
              className="text-xs px-2 py-1 rounded transition-all hover:scale-105"
              style={{
                backgroundColor: colors.surface.elevated,
                color: colors.text.secondary,
                border: `1px solid ${colors.border.primary}`,
              }}
            >
              {showCapabilities ? 'إخفاء' : 'عرض التفاصيل'}
            </button>
          </div>

          <SmoothTransition
            config={{
              type: 'scale',
              duration: 'normal',
              triggerOnMount: false,
            }}
            show={showCapabilities}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {getAgentCapabilities().map((capability, index) => (
                <SmoothTransition
                  key={index}
                  config={{
                    type: 'slide-up',
                    duration: 'fast',
                    delay: index * 50,
                    triggerOnMount: true,
                  }}
                >
                  <Tooltip.Provider>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <div
                          className="flex items-center gap-2 p-2 rounded-md transition-all cursor-default hover:scale-105"
                          style={{
                            backgroundColor: colors.surface.elevated,
                            border: `1px solid ${colors.border.secondary}`,
                            color: colors.text.primary,
                          }}
                        >
                          <div className={classNames(capability.icon, 'text-sm', capability.color)} />
                          <span className="text-xs truncate">{capability.name}</span>
                        </div>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="px-3 py-2 rounded-md text-sm shadow-lg z-50"
                          style={{
                            backgroundColor: colors.surface.overlay,
                            color: colors.text.inverse,
                            border: `1px solid ${colors.border.primary}`,
                          }}
                        >
                          {capability.name} - متاح في وضع الوكيل
                          <Tooltip.Arrow style={{ fill: colors.surface.overlay }} />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                </SmoothTransition>
              ))}
            </div>
          </SmoothTransition>
        </div>
      </SmoothTransition>

      {/* Agent Status */}
      <SmoothTransition
        config={{
          type: 'fade',
          duration: 'normal',
          triggerOnMount: false,
        }}
        show={isAgentMode}
      >
        <div
          className="flex items-center gap-3 p-3 rounded-lg border"
          style={{
            backgroundColor: `${colors.status.info}20`,
            borderColor: `${colors.status.info}40`,
          }}
        >
          <div className="relative">
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: colors.status.info }} />
            <div
              className="absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-75"
              style={{ backgroundColor: colors.status.info }}
            />
          </div>
          <AnimatedText
            text="الوكيل الذكي جاهز - سيقوم بالتفكير واختيار الأدوات المناسبة تلقائياً"
            className="text-xs flex-1"
            animationType="typewriter"
            speed={30}
          />
        </div>
      </SmoothTransition>

      {/* Model Support Info */}
      <SmoothTransition
        config={{
          type: 'slide-down',
          duration: 'normal',
          triggerOnMount: false,
        }}
        show={!isAgentSupported && !!currentModel}
      >
        <div
          className="flex items-center gap-2 p-2 rounded-lg border"
          style={{
            backgroundColor: `${colors.status.warning}20`,
            borderColor: `${colors.status.warning}40`,
          }}
        >
          <div className="i-ph:warning-duotone" style={{ color: colors.status.warning }} />
          <span className="text-xs" style={{ color: colors.status.warning }}>
            النموذج الحالي ({currentModel}) لا يدعم وضع الوكيل الذكي
          </span>
        </div>
      </SmoothTransition>
    </div>
  );
}
