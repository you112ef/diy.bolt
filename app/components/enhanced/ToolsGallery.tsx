import React, { useState, useEffect } from 'react';
import { useAgentMode } from '~/lib/hooks/useAgentMode';
import { classNames } from '~/utils/classNames';

interface Tool {
  id: string;
  name: string;
  description: string;
  category: 'development' | 'analysis' | 'deployment' | 'ai' | 'utility';
  icon: string;
  status: 'available' | 'active' | 'coming-soon';
  features: string[];
  agentIntegrated: boolean;
  usage?: {
    sessions: number;
    successRate: number;
  };
}

interface ToolsGalleryProps {
  onToolSelect?: (tool: Tool) => void;
  selectedCategory?: string;
  showSearch?: boolean;
}

export function ToolsGallery({ onToolSelect, selectedCategory = 'all', showSearch = true }: ToolsGalleryProps) {
  const { isAgentMode } = useAgentMode();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(selectedCategory);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  // مجموعة شاملة من الأدوات المتكاملة
  const tools: Tool[] = [
    // أدوات التطوير
    {
      id: 'code-editor',
      name: 'محرر الأكواد الذكي',
      description: 'محرر متقدم مع إكمال تلقائي مدعوم بالذكاء الاصطناعي',
      category: 'development',
      icon: 'i-ph:code',
      status: 'active',
      agentIntegrated: true,
      features: ['إكمال تلقائي', 'اكتشاف الأخطاء', 'تنسيق الكود', 'دعم multi-language'],
      usage: { sessions: 147, successRate: 96 },
    },
    {
      id: 'terminal',
      name: 'الطرفية المتقدمة',
      description: 'تشغيل الأوامر مع دعم الذكاء الاصطناعي لاقتراح الحلول',
      category: 'development',
      icon: 'i-ph:terminal-window',
      status: 'active',
      agentIntegrated: true,
      features: ['تشغيل متعدد الجلسات', 'اقتراحات ذكية', 'سجل الأوامر', 'تكامل مع Git'],
      usage: { sessions: 89, successRate: 94 },
    },
    {
      id: 'file-explorer',
      name: 'مستكشف الملفات',
      description: 'إدارة ملفات المشروع مع بحث ذكي وتنظيم تلقائي',
      category: 'development',
      icon: 'i-ph:folder',
      status: 'active',
      agentIntegrated: true,
      features: ['بحث ذكي', 'معاينة الملفات', 'تنظيم تلقائي', 'مزامنة سحابية'],
      usage: { sessions: 203, successRate: 98 },
    },
    {
      id: 'git-manager',
      name: 'مدير Git المرئي',
      description: 'واجهة مرئية لإدارة المستودعات مع اقتراحات ذكية للCommits',
      category: 'development',
      icon: 'i-ph:git-branch',
      status: 'active',
      agentIntegrated: true,
      features: ['مراجعة مرئية', 'اقتراح commit messages', 'حل التعارضات', 'تتبع التغييرات'],
      usage: { sessions: 76, successRate: 92 },
    },

    // أدوات التحليل
    {
      id: 'code-analyzer',
      name: 'محلل الكود المتقدم',
      description: 'تحليل عميق للكود مع اقتراحات التحسين والأمان',
      category: 'analysis',
      icon: 'i-ph:magnifying-glass',
      status: 'active',
      agentIntegrated: true,
      features: ['تحليل الأداء', 'فحص الأمان', 'اكتشاف الأنماط', 'تقارير مفصلة'],
      usage: { sessions: 52, successRate: 89 },
    },
    {
      id: 'dependency-tracker',
      name: 'متتبع التبعيات',
      description: 'مراقبة وإدارة تبعيات المشروع مع تحديثات أمنية',
      category: 'analysis',
      icon: 'i-ph:tree-structure',
      status: 'active',
      agentIntegrated: true,
      features: ['فحص الثغرات', 'تحديثات تلقائية', 'تحليل الحجم', 'توافق الإصدارات'],
      usage: { sessions: 31, successRate: 95 },
    },
    {
      id: 'performance-monitor',
      name: 'مراقب الأداء',
      description: 'مراقبة أداء التطبيق في الوقت الفعلي مع توصيات التحسين',
      category: 'analysis',
      icon: 'i-ph:chart-line',
      status: 'active',
      agentIntegrated: true,
      features: ['مراقبة الذاكرة', 'تحليل الشبكة', 'قياس السرعة', 'تنبيهات ذكية'],
      usage: { sessions: 44, successRate: 91 },
    },

    // أدوات النشر
    {
      id: 'cloud-deployer',
      name: 'ناشر السحابة',
      description: 'نشر تلقائي على منصات سحابية متعددة مع تحسين التكلفة',
      category: 'deployment',
      icon: 'i-ph:cloud-arrow-up',
      status: 'active',
      agentIntegrated: true,
      features: ['نشر متعدد المنصات', 'تحسين التكلفة', 'مراقبة الحالة', 'rollback تلقائي'],
      usage: { sessions: 23, successRate: 87 },
    },
    {
      id: 'docker-manager',
      name: 'مدير Docker',
      description: 'إنشاء وإدارة حاويات Docker مع تحسين تلقائي',
      category: 'deployment',
      icon: 'i-ph:package',
      status: 'active',
      agentIntegrated: true,
      features: ['بناء تلقائي', 'تحسين الحجم', 'مراقبة الموارد', 'أمان الحاويات'],
      usage: { sessions: 67, successRate: 93 },
    },
    {
      id: 'ci-cd-pipeline',
      name: 'خط إنتاج CI/CD',
      description: 'إعداد وإدارة خطوط الإنتاج مع اختبارات تلقائية',
      category: 'deployment',
      icon: 'i-ph:pipeline',
      status: 'active',
      agentIntegrated: true,
      features: ['اختبارات تلقائية', 'نشر تدريجي', 'تنبيهات الفشل', 'تقارير الجودة'],
      usage: { sessions: 38, successRate: 88 },
    },

    // أدوات الذكاء الاصطناعي
    {
      id: 'ai-code-generator',
      name: 'مولد الكود الذكي',
      description: 'توليد كود عالي الجودة من الوصف الطبيعي',
      category: 'ai',
      icon: 'i-ph:magic-wand',
      status: 'active',
      agentIntegrated: true,
      features: ['فهم اللغة الطبيعية', 'أفضل الممارسات', 'توثيق تلقائي', 'تحسين الأداء'],
      usage: { sessions: 124, successRate: 94 },
    },
    {
      id: 'ai-debugger',
      name: 'مصحح الأخطاء الذكي',
      description: 'اكتشاف وإصلاح الأخطاء تلقائياً مع شرح السبب',
      category: 'ai',
      icon: 'i-ph:bug',
      status: 'active',
      agentIntegrated: true,
      features: ['اكتشاف ذكي', 'اقتراح حلول', 'تفسير الأخطاء', 'منع التكرار'],
      usage: { sessions: 89, successRate: 91 },
    },
    {
      id: 'ai-architect',
      name: 'المعماري الذكي',
      description: 'تصميم هيكل التطبيق والأنماط بناءً على أفضل الممارسات',
      category: 'ai',
      icon: 'i-ph:blueprint',
      status: 'active',
      agentIntegrated: true,
      features: ['تصميم النمط', 'اقتراح التقنيات', 'تحليل التوافق', 'وثائق معمارية'],
      usage: { sessions: 45, successRate: 96 },
    },

    // أدوات مساعدة
    {
      id: 'documentation-generator',
      name: 'مولد الوثائق',
      description: 'إنشاء وثائق شاملة تلقائياً من الكود والتعليقات',
      category: 'utility',
      icon: 'i-ph:book',
      status: 'active',
      agentIntegrated: true,
      features: ['توثيق تلقائي', 'أمثلة تفاعلية', 'بحث متقدم', 'تحديث ديناميكي'],
      usage: { sessions: 62, successRate: 97 },
    },
    {
      id: 'api-tester',
      name: 'مختبر API',
      description: 'اختبار وتوثيق APIs مع إنشاء حالات اختبار تلقائية',
      category: 'utility',
      icon: 'i-ph:globe',
      status: 'active',
      agentIntegrated: true,
      features: ['اختبارات تلقائية', 'مراقبة الاستجابة', 'توثيق تفاعلي', 'اختبار الحمولة'],
      usage: { sessions: 73, successRate: 93 },
    },
    {
      id: 'security-scanner',
      name: 'ماسح الأمان',
      description: 'فحص شامل للثغرات الأمنية مع اقتراحات الإصلاح',
      category: 'utility',
      icon: 'i-ph:shield-check',
      status: 'active',
      agentIntegrated: true,
      features: ['فحص الثغرات', 'تحليل التشفير', 'مراجعة الأذونات', 'تقارير أمنية'],
      usage: { sessions: 34, successRate: 89 },
    },
  ];

  const categories = [
    { id: 'all', name: 'جميع الأدوات', icon: 'i-ph:squares-four' },
    { id: 'development', name: 'التطوير', icon: 'i-ph:code' },
    { id: 'analysis', name: 'التحليل', icon: 'i-ph:chart-pie' },
    { id: 'deployment', name: 'النشر', icon: 'i-ph:rocket-launch' },
    { id: 'ai', name: 'الذكاء الاصطناعي', icon: 'i-ph:robot' },
    { id: 'utility', name: 'أدوات مساعدة', icon: 'i-ph:wrench' },
  ];

  // تصفية الأدوات
  const filteredTools = tools.filter((tool) => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleToolClick = (tool: Tool) => {
    setSelectedTool(tool);
    onToolSelect?.(tool);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />;
      case 'available':
        return <div className="w-2 h-2 bg-blue-400 rounded-full" />;
      case 'coming-soon':
        return <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className="enhanced-dashboard">
      {/* Header */}
      <div className="mb-8">
        <h2 className="enhanced-text title mb-2">معرض الأدوات المتكاملة</h2>
        <p className="enhanced-text body mb-6">مجموعة شاملة من الأدوات المطورة والمدمجة مع الذكاء الاصطناعي</p>

        {/* البحث */}
        {showSearch && (
          <div className="relative mb-6">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <div className="i-ph:magnifying-glass text-enhanced-text-tertiary" />
            </div>
            <input
              type="text"
              placeholder="البحث في الأدوات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-enhanced-bg-tertiary border border-enhanced-border-subtle rounded-lg pl-10 pr-4 py-3 text-enhanced-text-primary placeholder-enhanced-text-tertiary focus:border-enhanced-agent-primary focus:outline-none transition-colors"
            />
          </div>
        )}

        {/* التصنيفات */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={classNames(
                'enhanced-button compact flex items-center gap-2',
                activeCategory === category.id ? 'primary' : '',
              )}
            >
              <div className={category.icon} />
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="enhanced-card text-center py-4">
          <div className="enhanced-text title text-purple-400 mb-2">{tools.length}</div>
          <div className="enhanced-text caption">أداة متاحة</div>
        </div>
        <div className="enhanced-card text-center py-4">
          <div className="enhanced-text title text-green-400 mb-2">{tools.filter((t) => t.agentIntegrated).length}</div>
          <div className="enhanced-text caption">مدمجة مع AI</div>
        </div>
        <div className="enhanced-card text-center py-4">
          <div className="enhanced-text title text-blue-400 mb-2">
            {tools.filter((t) => t.status === 'active').length}
          </div>
          <div className="enhanced-text caption">نشطة حالياً</div>
        </div>
        <div className="enhanced-card text-center py-4">
          <div className="enhanced-text title text-orange-400 mb-2">94%</div>
          <div className="enhanced-text caption">معدل النجاح</div>
        </div>
      </div>

      {/* شبكة الأدوات */}
      <div className="enhanced-grid">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            className={classNames('enhanced-card group cursor-pointer relative overflow-hidden', {
              'agent-active': tool.agentIntegrated && isAgentMode,
              'ring-2 ring-purple-500/50': selectedTool?.id === tool.id,
            })}
            onClick={() => handleToolClick(tool)}
          >
            {/* شريط Agent */}
            {tool.agentIntegrated && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600" />
            )}

            <div className="p-6">
              {/* الرأس */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={classNames('enhanced-icon', tool.agentIntegrated ? 'agent-icon' : '')}>
                    <div className={classNames(tool.icon, 'text-xl')} />
                  </div>
                  <div>
                    <h3 className="enhanced-text subtitle mb-1">{tool.name}</h3>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(tool.status)}
                      <span className="enhanced-text caption">
                        {tool.status === 'active' ? 'نشط' : tool.status === 'available' ? 'متاح' : 'قريباً'}
                      </span>
                    </div>
                  </div>
                </div>

                {tool.agentIntegrated && <span className="enhanced-badge active">AI</span>}
              </div>

              {/* الوصف */}
              <p className="enhanced-text body mb-4 opacity-80">{tool.description}</p>

              {/* المميزات */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {tool.features.slice(0, 3).map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-enhanced-border-subtle rounded text-xs text-enhanced-text-tertiary"
                    >
                      {feature}
                    </span>
                  ))}
                  {tool.features.length > 3 && (
                    <span className="px-2 py-1 bg-enhanced-border-subtle rounded text-xs text-enhanced-text-tertiary">
                      +{tool.features.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* الإحصائيات */}
              {tool.usage && (
                <div className="flex items-center justify-between pt-4 border-t border-enhanced-border-subtle">
                  <div className="text-center">
                    <div className="enhanced-text caption mb-1">جلسات</div>
                    <div className="enhanced-text subtitle font-bold text-blue-400">{tool.usage.sessions}</div>
                  </div>
                  <div className="text-center">
                    <div className="enhanced-text caption mb-1">نجاح</div>
                    <div className="enhanced-text subtitle font-bold text-green-400">{tool.usage.successRate}%</div>
                  </div>
                </div>
              )}
            </div>

            {/* تأثير الهوفر */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* رسالة عدم وجود نتائج */}
      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <div className="i-ph:magnifying-glass text-4xl text-enhanced-text-tertiary mb-4" />
          <h3 className="enhanced-text subtitle mb-2">لا توجد أدوات متطابقة</h3>
          <p className="enhanced-text body">جرب تغيير مصطلح البحث أو التصنيف</p>
        </div>
      )}
    </div>
  );
}
