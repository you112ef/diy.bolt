import { useState, useEffect } from 'react';
import { classNames } from '~/utils/classNames';
import type {
  AgentThinkingStep,
  AgentResponse,
  AgentSearchResult,
  AgentToolSelection,
} from '~/lib/agents/advanced-ai-agent';
import * as Collapsible from '@radix-ui/react-collapsible';
import { SmoothTransition, AnimatedText, LoadingTransition } from '~/components/ui/SmoothTransitions';
import { useTheme, useAdaptiveColors } from '~/components/ui/SmartThemeSystem';
import { usePerformanceMonitor } from '~/lib/hooks/useOptimizedState';

interface AgentThinkingDisplayProps {
  agentResponse: AgentResponse | null;
  isProcessing: boolean;
}

export function AgentThinkingDisplay({ agentResponse, isProcessing }: AgentThinkingDisplayProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [showDetails, setShowDetails] = useState(false);
  const [autoExpand, setAutoExpand] = useState(true);
  const { colors, isDark } = useTheme();
  const { getStatusColor } = useAdaptiveColors();
  const { markRender } = usePerformanceMonitor('AgentThinkingDisplay');

  const toggleStep = (stepNumber: number) => {
    const newExpanded = new Set(expandedSteps);

    if (newExpanded.has(stepNumber)) {
      newExpanded.delete(stepNumber);
    } else {
      newExpanded.add(stepNumber);
    }

    setExpandedSteps(newExpanded);
  };

  const getStepIcon = (action: string) => {
    const iconMap: Record<string, string> = {
      'تحليل طلب المستخدم': 'i-ph:brain-duotone',
      'فحص قاعدة المعرفة': 'i-ph:database-duotone',
      web_search: 'i-ph:magnifying-glass-duotone',
      tool_selection: 'i-ph:wrench-duotone',
      code_review: 'i-ph:code-duotone',
      code_optimize: 'i-ph:lightning-duotone',
      security_analysis: 'i-ph:shield-duotone',
      generate_docs: 'i-ph:file-text-duotone',
      create_project: 'i-ph:folder-plus-duotone',
      knowledge_search: 'i-ph:books-duotone',
      synthesis: 'i-ph:puzzle-piece-duotone',
    };

    return iconMap[action] || 'i-ph:gear-duotone';
  };

  const getStepColor = (action: string) => {
    const colorMap: Record<string, string> = {
      'تحليل طلب المستخدم': 'text-blue-500',
      'فحص قاعدة المعرفة': 'text-green-500',
      web_search: 'text-purple-500',
      tool_selection: 'text-orange-500',
      code_review: 'text-cyan-500',
      code_optimize: 'text-yellow-500',
      security_analysis: 'text-red-500',
      generate_docs: 'text-indigo-500',
      create_project: 'text-pink-500',
      knowledge_search: 'text-teal-500',
      synthesis: 'text-emerald-500',
    };

    return colorMap[action] || 'text-gray-500';
  };

  if (!agentResponse && !isProcessing) {
    return null;
  }

  return (
    <div className="bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-lg p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="i-ph:robot-duotone text-xl text-blue-500" />
          <h3 className="text-lg font-semibold text-bolt-elements-textPrimary">Agent Mode - التفكير الذكي</h3>
          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-bolt-elements-textSecondary">
              <div className="i-svg-spinners:90-ring-with-bg text-blue-500 animate-spin" />
              <span>جاري التفكير...</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1 px-3 py-1 rounded-md bg-bolt-elements-background-depth-3 hover:bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor text-sm transition-all"
        >
          <div className={classNames(showDetails ? 'i-ph:eye-slash-duotone' : 'i-ph:eye-duotone', 'text-sm')} />
          <span>{showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}</span>
        </button>
      </div>

      {/* Thinking Steps */}
      {agentResponse?.thinking && agentResponse.thinking.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-bolt-elements-textPrimary mb-2">خطوات التفكير:</h4>

          {agentResponse.thinking.map((step) => (
            <Collapsible.Root
              key={step.step}
              open={expandedSteps.has(step.step)}
              onOpenChange={() => toggleStep(step.step)}
            >
              <Collapsible.Trigger asChild>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-bolt-elements-background-depth-3 hover:bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor transition-all text-left">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-medium text-blue-500">
                      {step.step}
                    </div>
                    <div className={classNames(getStepIcon(step.action), 'text-lg', getStepColor(step.action))} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-bolt-elements-textPrimary text-sm">{step.thought}</div>
                    <div className="text-xs text-bolt-elements-textSecondary mt-1">{step.action}</div>
                  </div>

                  <div
                    className={classNames(
                      'i-ph:caret-down-duotone text-lg text-bolt-elements-textSecondary transition-transform',
                      expandedSteps.has(step.step) ? 'rotate-180' : '',
                    )}
                  />
                </button>
              </Collapsible.Trigger>

              <Collapsible.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                <div className="p-3 ml-11 bg-bolt-elements-background-depth-1 rounded-lg mt-2 border border-bolt-elements-borderColor">
                  <div className="text-sm text-bolt-elements-textPrimary">
                    <strong>التفكير:</strong> {step.reasoning}
                  </div>
                  <div className="text-xs text-bolt-elements-textSecondary mt-2">
                    الوقت: {step.timestamp.toLocaleTimeString('ar-SA')}
                  </div>
                </div>
              </Collapsible.Content>
            </Collapsible.Root>
          ))}
        </div>
      )}

      {/* Tools Used */}
      {showDetails && agentResponse?.toolsUsed && agentResponse.toolsUsed.length > 0 && (
        <div className="mt-4 p-3 bg-bolt-elements-background-depth-1 rounded-lg border border-bolt-elements-borderColor">
          <h4 className="text-sm font-medium text-bolt-elements-textPrimary mb-2">الأدوات المستخدمة:</h4>
          <div className="space-y-2">
            {agentResponse.toolsUsed.map((tool, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-md bg-bolt-elements-background-depth-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-bolt-elements-textPrimary">{tool.toolName}</div>
                  <div className="text-xs text-bolt-elements-textSecondary">{tool.reason}</div>
                </div>
                <div className="text-xs text-bolt-elements-textSecondary">{Math.round(tool.confidence * 100)}% ثقة</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {showDetails && agentResponse?.searchResults && agentResponse.searchResults.length > 0 && (
        <div className="mt-4 p-3 bg-bolt-elements-background-depth-1 rounded-lg border border-bolt-elements-borderColor">
          <h4 className="text-sm font-medium text-bolt-elements-textPrimary mb-2">نتائج البحث:</h4>
          <div className="space-y-3">
            {agentResponse.searchResults.map((search, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="i-ph:magnifying-glass-duotone text-sm text-purple-500" />
                  <span className="text-sm font-medium text-bolt-elements-textPrimary">البحث عن: {search.query}</span>
                  {search.deepSearch && (
                    <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded">بحث عميق</span>
                  )}
                </div>
                <div className="ml-6 space-y-1">
                  {search.results.slice(0, 2).map((result, resultIndex) => (
                    <div key={resultIndex} className="p-2 bg-bolt-elements-background-depth-2 rounded text-xs">
                      <div className="font-medium text-bolt-elements-textPrimary">{result.title}</div>
                      <div className="text-bolt-elements-textSecondary mt-1">{result.content.substring(0, 150)}...</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-bolt-elements-textSecondary">{result.source}</span>
                        <span className="text-green-500">{Math.round(result.relevance * 100)}% صلة</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {agentResponse && (
        <div className="mt-4 flex items-center justify-between p-3 bg-bolt-elements-background-depth-1 rounded-lg border border-bolt-elements-borderColor">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="i-ph:clock-duotone text-blue-500" />
              <span className="text-bolt-elements-textSecondary">وقت التنفيذ: {agentResponse.executionTime}ms</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="i-ph:chart-bar-duotone text-green-500" />
              <span className="text-bolt-elements-textSecondary">
                مستوى الثقة: {Math.round(agentResponse.confidence * 100)}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={classNames(
                'w-2 h-2 rounded-full',
                agentResponse.confidence > 0.8
                  ? 'bg-green-500'
                  : agentResponse.confidence > 0.6
                    ? 'bg-yellow-500'
                    : 'bg-red-500',
              )}
            />
            <span className="text-xs text-bolt-elements-textSecondary">
              {agentResponse.confidence > 0.8 ? 'عالي' : agentResponse.confidence > 0.6 ? 'متوسط' : 'منخفض'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
