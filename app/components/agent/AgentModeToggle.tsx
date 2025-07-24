import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { classNames } from '~/utils/classNames';
import { agentModelsStore, isModelInAgentMode } from '~/lib/stores/agent-mode';
import { advancedAIAgent } from '~/lib/agents/advanced-ai-agent';
import * as Switch from '@radix-ui/react-switch';
import * as Tooltip from '@radix-ui/react-tooltip';

interface AgentModeToggleProps {
  currentModel?: string;
  currentProvider?: string;
  onAgentModeChange?: (enabled: boolean) => void;
}

export function AgentModeToggle({
  currentModel,
  currentProvider,
  onAgentModeChange
}: AgentModeToggleProps) {
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCapabilities, setShowCapabilities] = useState(false);
  const agentModels = useStore(agentModelsStore);

  // فحص ما إذا كان النموذج الحالي يدعم وضع الوكيل
  const isAgentSupported = currentModel && currentProvider && isModelInAgentMode(currentModel, currentProvider);

  useEffect(() => {
    if (isAgentSupported) {
      setIsAgentMode(true);
      advancedAIAgent.setAgentMode(true);
    } else {
      setIsAgentMode(false);
      advancedAIAgent.setAgentMode(false);
    }
  }, [isAgentSupported]);

  const handleToggle = async (checked: boolean) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    try {
      setIsAgentMode(checked);
      advancedAIAgent.setAgentMode(checked);
      onAgentModeChange?.(checked);
      
      // محاكاة تأخير للانتقال السلس
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Error toggling agent mode:', error);
      setIsAgentMode(!checked);
    } finally {
      setIsTransitioning(false);
    }
  };

  const capabilities = [
    {
      name: 'التفكير التلقائي',
      description: 'يفكر ويحلل المشاكل تلقائياً',
      icon: '🧠',
      active: isAgentMode
    },
    {
      name: 'اختيار الأدوات',
      description: 'يختار الأدوات المناسبة للمهمة',
      icon: '🛠️',
      active: isAgentMode
    },
    {
      name: 'البحث الذكي',
      description: 'يبحث عن المعلومات المطلوبة',
      icon: '🔍',
      active: isAgentMode
    },
    {
      name: 'تحسين الكود',
      description: 'يحسن ويراجع الكود تلقائياً',
      icon: '⚡',
      active: isAgentMode
    }
  ];

  if (!isAgentSupported) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span className="text-sm font-medium text-gray-600">
            وضع الوكيل غير متاح
          </span>
        </div>
        <p className="text-xs text-gray-500">
          النموذج الحالي لا يدعم وضع الوكيل الذكي
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Agent Mode Switch */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={classNames(
            'w-3 h-3 rounded-full transition-colors duration-300',
            isAgentMode ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          )}></div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              وضع الوكيل الذكي
            </h3>
            <p className="text-xs text-gray-500">
              {isAgentMode ? 'نشط - يعمل بذكاء اصطناعي متقدم' : 'غير نشط'}
            </p>
          </div>
        </div>

        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Switch.Root
                checked={isAgentMode}
                onCheckedChange={handleToggle}
                disabled={isTransitioning}
                className={classNames(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  isAgentMode ? 'bg-blue-500' : 'bg-gray-300',
                  isTransitioning ? 'opacity-50 cursor-not-allowed' : ''
                )}
              >
                <Switch.Thumb
                  className={classNames(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    isAgentMode ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </Switch.Root>
            </Tooltip.Trigger>
            <Tooltip.Content
              className="px-3 py-2 text-xs bg-gray-900 text-white rounded shadow-lg max-w-xs"
              sideOffset={5}
            >
              {isAgentMode ? 'إيقاف وضع الوكيل' : 'تفعيل وضع الوكيل'}
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>

      {/* Agent Capabilities - عرض القدرات */}
      {isAgentMode && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              قدرات الوكيل النشطة:
            </h4>
            <button
              onClick={() => setShowCapabilities(!showCapabilities)}
              className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
            >
              {showCapabilities ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
            </button>
          </div>

          {showCapabilities && (
            <div className="grid grid-cols-2 gap-2">
              {capabilities.map((capability, index) => (
                <div
                  key={index}
                  className={classNames(
                    'p-3 rounded-lg border transition-all duration-300',
                    capability.active
                      ? 'bg-green-50 border-green-200 shadow-sm'
                      : 'bg-gray-50 border-gray-200'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{capability.icon}</span>
                    <span className={classNames(
                      'text-xs font-medium',
                      capability.active ? 'text-green-700' : 'text-gray-600'
                    )}>
                      {capability.name}
                    </span>
                  </div>
                  <p className={classNames(
                    'text-xs',
                    capability.active ? 'text-green-600' : 'text-gray-500'
                  )}>
                    {capability.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Agent Status */}
      {isAgentMode && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
          <span className="text-xs text-blue-700 flex-1">
            الوكيل الذكي جاهز - سيقوم بالتفكير واختيار الأدوات المناسبة تلقائياً
          </span>
        </div>
      )}

      {/* Model Support Info */}
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-xs font-medium text-gray-700">
            معلومات النموذج:
          </span>
        </div>
        <div className="space-y-1 text-xs text-gray-600">
          <div>النموذج: {currentModel || 'غير محدد'}</div>
          <div>المزود: {currentProvider || 'غير محدد'}</div>
          <div className="flex items-center gap-1">
            <span>دعم الوكيل:</span>
            <span className={classNames(
              'px-2 py-0.5 rounded text-xs font-medium',
              isAgentSupported
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            )}>
              {isAgentSupported ? 'مدعوم' : 'غير مدعوم'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
