import React, { useState } from 'react';
import { classNames } from '~/utils/classNames';
import type { AgentResponse } from '~/lib/agents/advanced-ai-agent';
import * as Collapsible from '@radix-ui/react-collapsible';

interface AgentThinkingDisplayProps {
  agentResponse: AgentResponse | null;
  isProcessing: boolean;
}

export function AgentThinkingDisplay({ agentResponse, isProcessing }: AgentThinkingDisplayProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [showDetails, setShowDetails] = useState(false);

  const toggleStep = (stepIndex: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepIndex)) {
      newExpanded.delete(stepIndex);
    } else {
      newExpanded.add(stepIndex);
    }
    setExpandedSteps(newExpanded);
  };

  if (!agentResponse && !isProcessing) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Processing Indicator */}
      {isProcessing && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-blue-700 font-medium">
            الوكيل يفكر ويحلل...
          </span>
        </div>
      )}

      {/* Agent Response */}
      {agentResponse && (
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  عملية تفكير الوكيل مكتملة
                </h3>
                <p className="text-xs text-gray-500">
                  وقت التنفيذ: {agentResponse.executionTime}ms | 
                  مستوى الثقة: {Math.round(agentResponse.confidence * 100)}%
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-blue-600 hover:text-blue-700 transition-colors px-3 py-1 rounded-lg hover:bg-blue-50"
            >
              {showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
            </button>
          </div>

          {/* Thinking Steps */}
          {showDetails && agentResponse.thinking && agentResponse.thinking.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 px-2">
                خطوات التفكير ({agentResponse.thinking.length}):
              </h4>
              
              {agentResponse.thinking.map((step, index) => (
                <Collapsible.Root
                  key={index}
                  open={expandedSteps.has(index)}
                  onOpenChange={() => toggleStep(index)}
                >
                  <Collapsible.Trigger asChild>
                    <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500">
                            الخطوة {index + 1}
                          </span>
                                                     <span className="text-sm text-gray-700">
                             {step.action || 'تفكير'}
                           </span>
                        </div>
                        <div className={classNames(
                          'w-4 h-4 text-gray-400 transition-transform',
                          expandedSteps.has(index) ? 'rotate-180' : ''
                        )}>
                          ⌄
                        </div>
                      </div>
                    </button>
                  </Collapsible.Trigger>
                  
                  <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
                    <div className="p-3 mt-1 bg-white rounded-lg border border-gray-200 text-sm text-gray-600">
                                             <pre className="whitespace-pre-wrap font-mono text-xs">
                         {step.reasoning || step.thought || JSON.stringify(step, null, 2)}
                       </pre>
                    </div>
                  </Collapsible.Content>
                </Collapsible.Root>
              ))}
            </div>
          )}

          {/* Tools Used */}
          {showDetails && agentResponse.toolsUsed && agentResponse.toolsUsed.length > 0 && (
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                الأدوات المستخدمة ({agentResponse.toolsUsed.length}):
              </h4>
              <div className="flex flex-wrap gap-2">
                                 {agentResponse.toolsUsed.map((tool, index) => (
                   <span
                     key={index}
                     className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg font-medium"
                   >
                     {tool.toolName || JSON.stringify(tool)}
                   </span>
                 ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {showDetails && agentResponse.searchResults && agentResponse.searchResults.length > 0 && (
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                نتائج البحث ({agentResponse.searchResults.length}):
              </h4>
              <div className="space-y-2">
                                 {agentResponse.searchResults.map((searchResult, index) => (
                   <div key={index} className="p-2 bg-gray-50 rounded border text-xs">
                     <div className="font-medium text-gray-700 mb-1">
                       البحث عن: {searchResult.query}
                     </div>
                     <div className="space-y-1">
                       {searchResult.results.slice(0, 2).map((result, resultIndex) => (
                         <div key={resultIndex} className="p-2 bg-white rounded text-xs">
                           <div className="font-medium text-gray-700">{result.title}</div>
                           <div className="text-gray-600">
                             {result._content ? result._content.substring(0, 150) + '...' : 'لا يوجد محتوى'}
                           </div>
                           <div className="text-gray-500 text-xs mt-1">
                             المصدر: {result.source} | الصلة: {Math.round(result.relevance * 100)}%
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {/* Performance Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <div className="text-lg font-bold text-gray-900">
                {agentResponse.thinking?.length || 0}
              </div>
              <div className="text-xs text-gray-500">خطوات التفكير</div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <div className="text-lg font-bold text-gray-900">
                {agentResponse.toolsUsed?.length || 0}
              </div>
              <div className="text-xs text-gray-500">أدوات مستخدمة</div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <div className="text-lg font-bold text-gray-900">
                {agentResponse.searchResults?.length || 0}
              </div>
              <div className="text-xs text-gray-500">نتائج بحث</div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <div className="text-lg font-bold text-gray-900">
                {Math.round(agentResponse.confidence * 100)}%
              </div>
              <div className="text-xs text-gray-500">مستوى الثقة</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
