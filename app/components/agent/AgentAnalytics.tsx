import React, { useState, useEffect, useMemo } from 'react';
import type { AgentResponse } from '~/lib/agents/advanced-ai-agent';
import { SmoothTransition, AnimatedText } from '~/components/ui/SmoothTransitions';
import { useTheme, useAdaptiveColors } from '~/components/ui/SmartThemeSystem';
import { usePerformanceMonitor, useMemoizedValue } from '~/lib/hooks/useOptimizedState';
import { smartCache } from '~/lib/cache/SmartCacheManager';
import { classNames } from '~/utils/classNames';
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

interface PerformanceTrend {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

export function AgentAnalytics({ agentResponse, isVisible, onClose }: AgentAnalyticsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const { colors, isDark } = useTheme();
  const { getStatusColor } = useAdaptiveColors();
  const { markRender } = usePerformanceMonitor('AgentAnalytics');

  // حفظ البيانات في التخزين المؤقت
  useEffect(() => {
    if (agentResponse) {
      const existingHistory = smartCache.get<AgentMetrics['performanceHistory']>('agent-performance-history') || [];
      const newEntry = {
        timestamp: Date.now(),
        executionTime: agentResponse.executionTime,
        confidence: agentResponse.confidence,
        toolsUsed: agentResponse.toolsUsed.length,
      };

      const updatedHistory = [...existingHistory, newEntry].slice(-100); // الاحتفاظ بآخر 100 إدخال
      smartCache.set('agent-performance-history', updatedHistory, { ttl: 7 * 24 * 60 * 60 * 1000 }); // 7 أيام
    }
  }, [agentResponse]);

  // حساب المقاييس
  const metrics = useMemoizedValue(
    () => {
      const history = smartCache.get<AgentMetrics['performanceHistory']>('agent-performance-history') || [];
      const now = Date.now();
      const timeRangeMs = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      }[timeRange];

      const filteredHistory = history.filter((entry) => now - entry.timestamp <= timeRangeMs);

      if (filteredHistory.length === 0) {
        return {
          totalRequests: 0,
          averageExecutionTime: 0,
          averageConfidence: 0,
          toolUsageStats: {},
          successRate: 0,
          thinkingStepsAverage: 0,
          searchResultsAverage: 0,
          performanceHistory: [],
        };
      }

      const totalRequests = filteredHistory.length;
      const averageExecutionTime = filteredHistory.reduce((sum, entry) => sum + entry.executionTime, 0) / totalRequests;
      const averageConfidence = filteredHistory.reduce((sum, entry) => sum + entry.confidence, 0) / totalRequests;
      const successRate = filteredHistory.filter((entry) => entry.confidence > 0.7).length / totalRequests;

      // إحصائيات استخدام الأدوات (محاكاة)
      const toolUsageStats = {
        'مراجعة الكود': Math.floor(totalRequests * 0.4),
        'تحسين الكود': Math.floor(totalRequests * 0.3),
        'البحث في الويب': Math.floor(totalRequests * 0.6),
        'تنفيذ الأوامر': Math.floor(totalRequests * 0.2),
        'إنشاء المشاريع': Math.floor(totalRequests * 0.1),
      };

      return {
        totalRequests,
        averageExecutionTime,
        averageConfidence,
        toolUsageStats,
        successRate,
        thinkingStepsAverage: 4.2,
        searchResultsAverage: 2.8,
        performanceHistory: filteredHistory,
      } as AgentMetrics;
    },
    [timeRange],
    { maxAge: 30000 },
  ); // تحديث كل 30 ثانية

  // حساب الاتجاهات
  const trends = useMemoizedValue(
    () => {
      const history = metrics.performanceHistory;

      if (history.length < 2) {
        return [];
      }

      const recent = history.slice(-10);
      const older = history.slice(-20, -10);

      const calculateTrend = (recentData: number[], olderData: number[]): PerformanceTrend['trend'] => {
        if (olderData.length === 0) {
          return 'stable';
        }

        const recentAvg = recentData.reduce((a, b) => a + b, 0) / recentData.length;
        const olderAvg = olderData.reduce((a, b) => a + b, 0) / olderData.length;
        const change = ((recentAvg - olderAvg) / olderAvg) * 100;

        if (Math.abs(change) < 5) {
          return 'stable';
        }

        return change > 0 ? 'up' : 'down';
      };

      const executionTimeTrend = calculateTrend(
        recent.map((r) => r.executionTime),
        older.map((r) => r.executionTime),
      );

      const confidenceTrend = calculateTrend(
        recent.map((r) => r.confidence),
        older.map((r) => r.confidence),
      );

      return [
        {
          label: 'وقت التنفيذ',
          value: metrics.averageExecutionTime,
          change: 0,
          trend: executionTimeTrend,
          color:
            executionTimeTrend === 'down'
              ? colors.status.success
              : executionTimeTrend === 'up'
                ? colors.status.warning
                : colors.status.info,
        },
        {
          label: 'مستوى الثقة',
          value: metrics.averageConfidence * 100,
          change: 0,
          trend: confidenceTrend,
          color:
            confidenceTrend === 'up'
              ? colors.status.success
              : confidenceTrend === 'down'
                ? colors.status.warning
                : colors.status.info,
        },
        {
          label: 'معدل النجاح',
          value: metrics.successRate * 100,
          change: 0,
          trend: 'stable',
          color: colors.status.success,
        },
      ] as PerformanceTrend[];
    },
    [metrics, colors],
    { maxAge: 60000 },
  );

  if (!isVisible) {
    return null;
  }

  return (
    <SmoothTransition
      config={{
        type: 'slide-up',
        duration: 'normal',
        triggerOnMount: false,
      }}
      show={isVisible}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-lg shadow-2xl"
        style={{
          backgroundColor: colors.surface.card,
          border: `1px solid ${colors.border.primary}`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: colors.border.primary }}>
          <div className="flex items-center gap-3">
            <div className="i-ph:chart-bar-duotone text-2xl" style={{ color: colors.primary }} />
            <div>
              <AnimatedText
                text="تحليلات الوكيل الذكي"
                className="text-lg font-semibold"
                animationType="fade-in-words"
              />
              <div className="text-sm" style={{ color: colors.text.secondary }}>
                إحصائيات مفصلة عن أداء الوكيل
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => {
                markRender('time-range-change');
                setTimeRange(e.target.value as typeof timeRange);
              }}
              className="px-3 py-1 text-sm rounded border"
              style={{
                backgroundColor: colors.surface.elevated,
                color: colors.text.primary,
                borderColor: colors.border.primary,
              }}
            >
              <option value="1h">آخر ساعة</option>
              <option value="24h">آخر 24 ساعة</option>
              <option value="7d">آخر 7 أيام</option>
              <option value="30d">آخر 30 يوم</option>
            </select>

            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:scale-105"
              style={{
                backgroundColor: colors.surface.elevated,
                color: colors.text.secondary,
              }}
            >
              <div className="i-ph:x text-lg" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="h-full">
            <Tabs.List className="flex border-b px-4" style={{ borderColor: colors.border.primary }}>
              {[
                { id: 'overview', name: 'نظرة عامة', icon: 'i-ph:chart-pie-duotone' },
                { id: 'performance', name: 'الأداء', icon: 'i-ph:speedometer-duotone' },
                { id: 'tools', name: 'الأدوات', icon: 'i-ph:wrench-duotone' },
                { id: 'trends', name: 'الاتجاهات', icon: 'i-ph:trend-up-duotone' },
              ].map((tab) => (
                <Tabs.Trigger
                  key={tab.id}
                  value={tab.id}
                  className={classNames(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                    activeTab === tab.id ? 'border-b-2 border-current' : 'hover:opacity-70',
                  )}
                  style={{
                    color: activeTab === tab.id ? colors.primary : colors.text.secondary,
                    borderColor: activeTab === tab.id ? colors.primary : 'transparent',
                  }}
                >
                  <div className={classNames(tab.icon, 'text-lg')} />
                  {tab.name}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {/* Overview Tab */}
            <Tabs.Content value="overview" className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: 'إجمالي الطلبات',
                    value: metrics.totalRequests.toString(),
                    icon: 'i-ph:activity-duotone',
                    color: colors.primary,
                  },
                  {
                    label: 'متوسط وقت التنفيذ',
                    value: `${Math.round(metrics.averageExecutionTime)}ms`,
                    icon: 'i-ph:clock-duotone',
                    color: colors.status.info,
                  },
                  {
                    label: 'متوسط الثقة',
                    value: `${Math.round(metrics.averageConfidence * 100)}%`,
                    icon: 'i-ph:shield-check-duotone',
                    color: colors.status.success,
                  },
                  {
                    label: 'معدل النجاح',
                    value: `${Math.round(metrics.successRate * 100)}%`,
                    icon: 'i-ph:check-circle-duotone',
                    color: colors.status.success,
                  },
                ].map((stat, index) => (
                  <SmoothTransition
                    key={stat.label}
                    config={{
                      type: 'scale',
                      duration: 'normal',
                      delay: index * 100,
                      triggerOnMount: true,
                    }}
                  >
                    <div
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: colors.surface.elevated,
                        borderColor: colors.border.primary,
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={classNames(stat.icon, 'text-xl')} style={{ color: stat.color }} />
                        <AnimatedText
                          text={stat.value}
                          className="text-2xl font-bold"
                          animationType="typewriter"
                          speed={100}
                        />
                      </div>
                      <div className="text-sm" style={{ color: colors.text.secondary }}>
                        {stat.label}
                      </div>
                    </div>
                  </SmoothTransition>
                ))}
              </div>

              {/* Current Session Info */}
              {agentResponse && (
                <SmoothTransition
                  config={{
                    type: 'fade',
                    duration: 'normal',
                    delay: 400,
                    triggerOnMount: true,
                  }}
                >
                  <div
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: colors.surface.card,
                      borderColor: colors.border.primary,
                    }}
                  >
                    <h3 className="text-lg font-semibold mb-3" style={{ color: colors.text.primary }}>
                      الجلسة الحالية
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm" style={{ color: colors.text.secondary }}>
                          وقت التنفيذ
                        </div>
                        <div className="text-lg font-medium" style={{ color: colors.text.primary }}>
                          {agentResponse.executionTime}ms
                        </div>
                      </div>
                      <div>
                        <div className="text-sm" style={{ color: colors.text.secondary }}>
                          مستوى الثقة
                        </div>
                        <div className="text-lg font-medium" style={{ color: colors.text.primary }}>
                          {Math.round(agentResponse.confidence * 100)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm" style={{ color: colors.text.secondary }}>
                          الأدوات المستخدمة
                        </div>
                        <div className="text-lg font-medium" style={{ color: colors.text.primary }}>
                          {agentResponse.toolsUsed.length}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm" style={{ color: colors.text.secondary }}>
                          خطوات التفكير
                        </div>
                        <div className="text-lg font-medium" style={{ color: colors.text.primary }}>
                          {agentResponse.thinking.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </SmoothTransition>
              )}
            </Tabs.Content>

            {/* Performance Tab */}
            <Tabs.Content value="performance" className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {trends.map((trend, index) => (
                  <SmoothTransition
                    key={trend.label}
                    config={{
                      type: 'slide-up',
                      duration: 'normal',
                      delay: index * 150,
                      triggerOnMount: true,
                    }}
                  >
                    <div
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: colors.surface.elevated,
                        borderColor: colors.border.primary,
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                          {trend.label}
                        </div>
                        <div
                          className={classNames(
                            'i-ph:trend-up text-lg',
                            trend.trend === 'down' ? 'rotate-180' : '',
                            trend.trend === 'stable' ? 'i-ph:minus' : '',
                          )}
                          style={{ color: trend.color }}
                        />
                      </div>
                      <div className="text-2xl font-bold mb-2" style={{ color: colors.text.primary }}>
                        {trend.label === 'وقت التنفيذ' ? `${Math.round(trend.value)}ms` : `${Math.round(trend.value)}%`}
                      </div>
                      <Progress.Root
                        className="relative h-2 w-full overflow-hidden rounded-full"
                        style={{ backgroundColor: colors.surface.card }}
                        value={trend.label === 'وقت التنفيذ' ? Math.min(trend.value / 10, 100) : trend.value}
                      >
                        <Progress.Indicator
                          className="h-full w-full flex-1 transition-all duration-500 ease-out"
                          style={{
                            backgroundColor: trend.color,
                            transform: `translateX(-${100 - (trend.label === 'وقت التنفيذ' ? Math.min(trend.value / 10, 100) : trend.value)}%)`,
                          }}
                        />
                      </Progress.Root>
                    </div>
                  </SmoothTransition>
                ))}
              </div>
            </Tabs.Content>

            {/* Tools Tab */}
            <Tabs.Content value="tools" className="p-6 space-y-6">
              <div
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: colors.surface.elevated,
                  borderColor: colors.border.primary,
                }}
              >
                <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>
                  إحصائيات استخدام الأدوات
                </h3>
                <div className="space-y-3">
                  {Object.entries(metrics.toolUsageStats).map(([tool, count], index) => {
                    const percentage = metrics.totalRequests > 0 ? (count / metrics.totalRequests) * 100 : 0;

                    return (
                      <SmoothTransition
                        key={tool}
                        config={{
                          type: 'slide-right',
                          duration: 'normal',
                          delay: index * 100,
                          triggerOnMount: true,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="text-sm font-medium" style={{ color: colors.text.primary }}>
                              {tool}
                            </div>
                            <div
                              className="flex-1 h-2 rounded-full overflow-hidden"
                              style={{ backgroundColor: colors.surface.card }}
                            >
                              <div
                                className="h-full transition-all duration-1000 ease-out"
                                style={{
                                  backgroundColor: colors.primary,
                                  width: `${percentage}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="text-sm font-medium ml-3" style={{ color: colors.text.secondary }}>
                            {count} ({Math.round(percentage)}%)
                          </div>
                        </div>
                      </SmoothTransition>
                    );
                  })}
                </div>
              </div>
            </Tabs.Content>

            {/* Trends Tab */}
            <Tabs.Content value="trends" className="p-6 space-y-6">
              <div
                className="p-4 rounded-lg border text-center"
                style={{
                  backgroundColor: colors.surface.elevated,
                  borderColor: colors.border.primary,
                }}
              >
                <div className="i-ph:chart-line-up-duotone text-4xl mb-3" style={{ color: colors.primary }} />
                <AnimatedText
                  text="تحليل الاتجاهات قيد التطوير"
                  className="text-lg font-medium"
                  animationType="typewriter"
                />
                <div className="text-sm mt-2" style={{ color: colors.text.secondary }}>
                  سيتم إضافة رسوم بيانية تفاعلية ومؤشرات أداء متقدمة قريباً
                </div>
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>
    </SmoothTransition>
  );
}
