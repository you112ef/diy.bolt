import React, { useState, useEffect } from 'react';
import { useAgentMode } from '~/lib/hooks/useAgentMode';
import { classNames } from '~/utils/classNames';

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'active' | 'inactive' | 'new' | 'beta';
  action?: () => void;
  badge?: string;
  stats?: {
    value: string;
    label: string;
  };
}

interface EnhancedDashboardProps {
  className?: string;
  showWelcome?: boolean;
}

export function EnhancedDashboard({ className, showWelcome = true }: EnhancedDashboardProps) {
  const { isAgentMode, toggleAgentMode } = useAgentMode();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // بيانات البطاقات الديناميكية
  const dashboardCards: DashboardCard[] = [
    {
      id: 'agent-mode',
      title: 'Agent Mode',
      description: 'وضع الذكاء الصناعي المتقدم للتحليل والتنفيذ التلقائي',
      icon: 'i-ph:robot',
      status: isAgentMode ? 'active' : 'inactive',
      action: toggleAgentMode,
      badge: 'NEW',
      stats: {
        value: isAgentMode ? 'مُفعّل' : 'متوقف',
        label: 'الحالة'
      }
    },
    {
      id: 'code-editor',
      title: 'محرر الأكواد',
      description: 'محرر متقدم مع دعم الذكاء الصناعي وإكمال الكود',
      icon: 'i-ph:code',
      status: 'active',
      stats: {
        value: '12',
        label: 'ملف مفتوح'
      }
    },
    {
      id: 'terminal',
      title: 'الطرفية المدمجة',
      description: 'تشغيل الأوامر والسكريبت مباشرة من التطبيق',
      icon: 'i-ph:terminal-window',
      status: 'active',
      stats: {
        value: '3',
        label: 'جلسة نشطة'
      }
    },
    {
      id: 'file-manager',
      title: 'مدير الملفات',
      description: 'استعراض وإدارة ملفات المشروع بسهولة',
      icon: 'i-ph:folder',
      status: 'active',
      stats: {
        value: '247',
        label: 'ملف'
      }
    },
    {
      id: 'git-integration',
      title: 'تكامل Git',
      description: 'إدارة النسخ والفروع مع واجهة مرئية سهلة',
      icon: 'i-ph:git-branch',
      status: 'active',
      badge: 'BETA',
      stats: {
        value: '8',
        label: 'commits'
      }
    },
    {
      id: 'deployment',
      title: 'النشر السريع',
      description: 'نشر التطبيقات على مختلف المنصات بنقرة واحدة',
      icon: 'i-ph:rocket-launch',
      status: 'beta',
      badge: 'BETA',
      stats: {
        value: '2',
        label: 'نشرة نشطة'
      }
    },
    {
      id: 'ai-assistant',
      title: 'المساعد الذكي',
      description: 'مساعد ذكي متطور لحل المشاكل وتحسين الكود',
      icon: 'i-ph:magic-wand',
      status: isAgentMode ? 'active' : 'inactive',
      stats: {
        value: '95%',
        label: 'دقة'
      }
    },
    {
      id: 'analytics',
      title: 'التحليلات',
      description: 'إحصائيات مفصلة عن الأداء والاستخدام',
      icon: 'i-ph:chart-line',
      status: 'new',
      badge: 'NEW',
      stats: {
        value: '24h',
        label: 'آخر تحديث'
      }
    },
    {
      id: 'settings',
      title: 'الإعدادات',
      description: 'تخصيص التطبيق والتفضيلات الشخصية',
      icon: 'i-ph:gear',
      status: 'active',
      stats: {
        value: '12',
        label: 'إعداد'
      }
    }
  ];

  const handleCardClick = async (card: DashboardCard) => {
    if (card.action) {
      setIsLoading(true);
      setSelectedCard(card.id);
      
      try {
        await card.action();
        // محاكاة تأخير للتأثير البصري
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error('خطأ في تنفيذ العملية:', error);
      } finally {
        setIsLoading(false);
        setSelectedCard(null);
      }
    }
  };

  const getCardStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />;
      case 'inactive':
        return <div className="w-3 h-3 bg-gray-500 rounded-full" />;
      case 'new':
        return <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />;
      case 'beta':
        return <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />;
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  const getBadgeClass = (badge: string) => {
    switch (badge) {
      case 'NEW':
        return 'enhanced-badge new';
      case 'BETA':
        return 'enhanced-badge beta';
      case 'ACTIVE':
        return 'enhanced-badge active';
      default:
        return 'enhanced-badge';
    }
  };

  return (
    <div className={classNames('enhanced-dashboard', className)}>
      {showWelcome && (
        <div className="mb-8 text-center">
          <h1 className="enhanced-text title mb-4">
            مرحبًا بك في Bolt.diy المحسن
          </h1>
          <p className="enhanced-text subtitle mb-6">
            منصة تطوير متكاملة مع ذكاء اصطناعي متقدم
          </p>
          
          {isAgentMode && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full">
              <div className="i-ph:robot text-purple-400" />
              <span className="enhanced-text caption text-purple-300">
                وضع الذكاء الصناعي مُفعّل
              </span>
            </div>
          )}
        </div>
      )}

      <div className="enhanced-grid">
        {dashboardCards.map((card) => (
          <div
            key={card.id}
            className={classNames(
              'enhanced-card',
              'group cursor-pointer relative overflow-hidden',
              {
                'agent-active': card.status === 'active' && isAgentMode,
                'opacity-75 scale-95': selectedCard === card.id && isLoading,
              }
            )}
            onClick={() => handleCardClick(card)}
          >
            {/* شريط الحالة العلوي */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* محتوى البطاقة */}
            <div className="p-6">
              {/* الرأس */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="enhanced-icon">
                    <div className={classNames(card.icon, 'text-xl')} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="enhanced-text subtitle mb-1">
                      {card.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {getCardStatusIcon(card.status)}
                      <span className="enhanced-text caption">
                        {card.status === 'active' ? 'نشط' : 
                         card.status === 'inactive' ? 'متوقف' :
                         card.status === 'new' ? 'جديد' : 'تجريبي'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {card.badge && (
                  <span className={getBadgeClass(card.badge)}>
                    {card.badge}
                  </span>
                )}
              </div>

              {/* الوصف */}
              <p className="enhanced-text body mb-4 opacity-80">
                {card.description}
              </p>

              {/* الإحصائيات */}
              {card.stats && (
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="enhanced-text caption">
                    {card.stats.label}
                  </span>
                  <span className="enhanced-text subtitle font-bold text-purple-400">
                    {card.stats.value}
                  </span>
                </div>
              )}

              {/* مؤشر التحميل */}
              {selectedCard === card.id && isLoading && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* تأثير الهوفر */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* إحصائيات سريعة */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="enhanced-card text-center py-4">
          <div className="enhanced-text title text-purple-400 mb-2">42</div>
          <div className="enhanced-text caption">مشروع نشط</div>
        </div>
        <div className="enhanced-card text-center py-4">
          <div className="enhanced-text title text-green-400 mb-2">98%</div>
          <div className="enhanced-text caption">نسبة النجاح</div>
        </div>
        <div className="enhanced-card text-center py-4">
          <div className="enhanced-text title text-blue-400 mb-2">1.2K</div>
          <div className="enhanced-text caption">سطر كود</div>
        </div>
        <div className="enhanced-card text-center py-4">
          <div className="enhanced-text title text-orange-400 mb-2">24/7</div>
          <div className="enhanced-text caption">متاح دائماً</div>
        </div>
      </div>
    </div>
  );
}

// مكون مساعد للبطاقات الصغيرة
export function DashboardMiniCard({ 
  title, 
  value, 
  icon, 
  trend 
}: { 
  title: string; 
  value: string; 
  icon: string; 
  trend?: 'up' | 'down' | 'stable';
}) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <div className="i-ph:trend-up text-green-400" />;
      case 'down':
        return <div className="i-ph:trend-down text-red-400" />;
      default:
        return <div className="i-ph:minus text-gray-400" />;
    }
  };

  return (
    <div className="enhanced-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={classNames(icon, 'text-lg text-purple-400')} />
        {trend && getTrendIcon()}
      </div>
      <div className="enhanced-text title mb-1">{value}</div>
      <div className="enhanced-text caption">{title}</div>
    </div>
  );
}