import React, { useState, useEffect } from 'react';
import type { AgentResponse } from '~/lib/agents/advanced-ai-agent';
import { classNames } from '~/utils/classNames';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import * as Progress from '@radix-ui/react-progress';

interface AgentAnalyticsProps {
  agentResponse: AgentResponse | null;
  isVisible: boolean;
  onClose?: () => void;
}

interface AgentMetrics {
  totalRequests: number;
  averageExecutionTime: number;
  averageConfidence: number;
  toolUsageStats: Record<string, number>;
  successRate: number;
  thinkingStepsAverage: number;
  searchResultsAverage: number;
  performanceHistory: {
    timestamp: number;
    executionTime: number;
    confidence: number;
    toolsUsed: number;
  }[];
}

export function AgentAnalytics({ agentResponse, isVisible, onClose }: AgentAnalyticsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [metrics, setMetrics] = useState<AgentMetrics>({
    totalRequests: 0,
    averageExecutionTime: 0,
    averageConfidence: 0,
    toolUsageStats: {},
    successRate: 0,
    thinkingStepsAverage: 0,
    searchResultsAverage: 0,
    performanceHistory: []
  });

  // محاكاة البيانات للعرض
  useEffect(() => {
    if (agentResponse) {
      const mockMetrics: AgentMetrics = {
        totalRequests: 47,
        averageExecutionTime: 2.3,
        averageConfidence: 0.87,
        toolUsageStats: {
          'مراجعة الكود': 18,
          'تحسين الكود': 12,
          'البحث في الويب': 25,
          'تنفيذ الأوامر': 8,
          'إنشاء المشاريع': 4
        },
        successRate: 0.91,
        thinkingStepsAverage: 4.2,
        searchResultsAverage: 2.8,
        performanceHistory: Array.from({ length: 20 }, (_, i) => ({
          timestamp: Date.now() - i * 3600000,
          executionTime: Math.random() * 5 + 1,
          confidence: Math.random() * 0.3 + 0.7,
          toolsUsed: Math.floor(Math.random() * 3) + 1
        }))
      };
      setMetrics(mockMetrics);
    }
  }, [agentResponse]);

  const formatTime = (seconds: number) => {
    return `${seconds.toFixed(1)}ث`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (!isVisible) return null;

  return (
    <Dialog.Root open={isVisible} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-4xl h-[90vh] max-h-[700px] bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <div className="text-white text-lg">📊</div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  تحليلات الوكيل الذكي
                </h2>
                <div className="text-sm text-gray-500">
                  مراقبة الأداء والإحصائيات
                </div>
              </div>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1h">آخر ساعة</option>
                <option value="24h">آخر 24 ساعة</option>
                <option value="7d">آخر 7 أيام</option>
                <option value="30d">آخر 30 يوم</option>
              </select>

              <Dialog.Close asChild>
                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-5 h-5">✕</div>
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              {/* Tab Navigation */}
              <Tabs.List className="flex border-b border-gray-200 shrink-0 bg-gray-50">
                {[
                  { value: 'overview', label: 'نظرة عامة', icon: '📈' },
                  { value: 'performance', label: 'الأداء', icon: '⚡' },
                  { value: 'tools', label: 'الأدوات', icon: '🛠️' }
                ].map((tab) => (
                  <Tabs.Trigger
                    key={tab.value}
                    value={tab.value}
                    className={classNames(
                      'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                      'hover:bg-white border-b-2 border-transparent',
                      'data-[state=active]:bg-white data-[state=active]:border-blue-500 data-[state=active]:text-blue-600'
                    )}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* Overview Tab */}
                <Tabs.Content value="overview" className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        label: 'إجمالي الطلبات',
                        value: metrics.totalRequests.toString(),
                        icon: '📊',
                        color: 'bg-blue-50 text-blue-700'
                      },
                      {
                        label: 'متوسط وقت التنفيذ',
                        value: formatTime(metrics.averageExecutionTime),
                        icon: '⏱️',
                        color: 'bg-green-50 text-green-700'
                      },
                      {
                        label: 'مستوى الثقة',
                        value: formatPercentage(metrics.averageConfidence),
                        icon: '🎯',
                        color: 'bg-purple-50 text-purple-700'
                      },
                      {
                        label: 'معدل النجاح',
                        value: formatPercentage(metrics.successRate),
                        icon: '✅',
                        color: 'bg-emerald-50 text-emerald-700'
                      }
                    ].map((stat, index) => (
                      <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={classNames('w-8 h-8 rounded-lg flex items-center justify-center', stat.color)}>
                            <span className="text-sm">{stat.icon}</span>
                          </div>
                          <div className="text-sm font-medium text-gray-600">
                            {stat.label}
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Performance Chart Placeholder */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      أداء الوكيل عبر الزمن
                    </h3>
                    <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">📈</div>
                        <div className="text-sm">رسم بياني لأداء الوكيل</div>
                        <div className="text-xs mt-1">سيتم تطوير هذه الميزة قريباً</div>
                      </div>
                    </div>
                  </div>
                </Tabs.Content>

                {/* Performance Tab */}
                <Tabs.Content value="performance" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Execution Time Distribution */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        توزيع أوقات التنفيذ
                      </h3>
                      <div className="space-y-3">
                        {[
                          { range: '< 1 ثانية', percentage: 45, color: 'bg-green-500' },
                          { range: '1-3 ثواني', percentage: 35, color: 'bg-yellow-500' },
                          { range: '3-5 ثواني', percentage: 15, color: 'bg-orange-500' },
                          { range: '> 5 ثواني', percentage: 5, color: 'bg-red-500' }
                        ].map((item, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">{item.range}</span>
                              <span className="font-medium">{item.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={classNames('h-2 rounded-full transition-all', item.color)}
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Confidence Levels */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        مستويات الثقة
                      </h3>
                      <div className="space-y-3">
                        {[
                          { level: 'عالية (90%+)', count: 32, color: 'bg-green-500' },
                          { level: 'متوسطة (70-90%)', count: 12, color: 'bg-yellow-500' },
                          { level: 'منخفضة (<70%)', count: 3, color: 'bg-red-500' }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={classNames('w-3 h-3 rounded-full', item.color)} />
                              <span className="text-sm text-gray-600">{item.level}</span>
                            </div>
                            <span className="font-medium">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Tabs.Content>

                {/* Tools Tab */}
                <Tabs.Content value="tools" className="space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      استخدام الأدوات
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(metrics.toolUsageStats).map(([tool, count], index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">{tool}</span>
                            <span className="text-sm text-gray-500">{count} مرة</span>
                          </div>
                          <Progress.Root className="relative overflow-hidden bg-gray-200 rounded-full w-full h-2">
                            <Progress.Indicator
                              className="h-full bg-blue-500 transition-transform duration-300 ease-out"
                              style={{ transform: `translateX(-${100 - (count / Math.max(...Object.values(metrics.toolUsageStats))) * 100}%)` }}
                            />
                          </Progress.Root>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tool Performance */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      أداء الأدوات
                    </h3>
                    <div className="text-center text-gray-500 py-8">
                      <div className="text-4xl mb-2">🔧</div>
                      <div className="text-sm">تحليل أداء الأدوات</div>
                      <div className="text-xs mt-1">قيد التطوير</div>
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
