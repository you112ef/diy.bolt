import React, { useState } from 'react';
import { classNames } from '~/utils/classNames';

interface AdvancedTool {
  name: string;
  description: string;
  category: 'development' | 'build' | 'deploy' | 'test' | 'mobile' | 'ai';
  icon: string;
  command: string;
  languages?: string[];
  platforms?: string[];
}

interface AdvancedToolbarProps {
  onToolSelect: (tool: AdvancedTool) => void;
}

const tools: AdvancedTool[] = [
  {
    name: 'Code Formatter Pro',
    description: 'تنسيق الكود تلقائياً مع أفضل الممارسات',
    icon: '🎨',
    category: 'development',
    command: 'format-code',
    languages: ['javascript', 'typescript', 'python', 'css'],
    platforms: ['web', 'mobile']
  },
  {
    name: 'Build Optimizer',
    description: 'تحسين عملية البناء والأداء',
    icon: '⚡',
    category: 'build',
    command: 'optimize-build',
    languages: ['javascript', 'typescript'],
    platforms: ['web']
  },
  {
    name: 'AI Code Assistant',
    description: 'مساعد ذكي للبرمجة والتطوير',
    icon: '🤖',
    category: 'ai',
    command: 'ai-assist',
    languages: ['javascript', 'typescript', 'python'],
    platforms: ['web', 'mobile', 'desktop']
  },
  {
    name: 'Deploy Manager',
    description: 'إدارة النشر والتوزيع',
    icon: '🚀',
    category: 'deploy',
    command: 'deploy-app',
    platforms: ['web', 'mobile']
  }
];

const getToolsByCategory = (category: string): AdvancedTool[] => {
  if (category === 'all') return tools;
  return tools.filter(tool => tool.category === category);
};

export function AdvancedToolbar({ onToolSelect }: AdvancedToolbarProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleToolClick = (tool: AdvancedTool) => {
    console.log('Executing tool:', tool.command);
    onToolSelect(tool);
  };

  const categories = [
    { id: 'all', name: 'الكل', icon: '📁' },
    { id: 'development', name: 'التطوير', icon: '💻' },
    { id: 'build', name: 'البناء', icon: '🔨' },
    { id: 'ai', name: 'الذكاء الاصطناعي', icon: '🤖' },
    { id: 'deploy', name: 'النشر', icon: '🚀' },
    { id: 'test', name: 'الاختبار', icon: '🧪' },
    { id: 'mobile', name: 'الموبايل', icon: '📱' }
  ];

  const filteredTools = getToolsByCategory(selectedCategory).filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          أدوات التطوير المتقدمة
        </h3>
        
        {/* Search */}
        <input
          type="text"
          placeholder="البحث في الأدوات..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />

        {/* Categories */}
        <div className="flex gap-2 flex-wrap mb-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={classNames(
                'flex items-center gap-2 px-3 py-1 text-sm rounded-lg transition-colors',
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredTools.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🔧</div>
            <div>لا توجد أدوات تطابق البحث</div>
          </div>
        ) : (
          filteredTools.map((tool, toolIndex) => (
            <div
              key={toolIndex}
              onClick={() => handleToolClick(tool)}
              className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 cursor-pointer transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-lg">{tool.icon}</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">
                    {tool.name}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {tool.description}
                  </p>
                </div>
              </div>
              
              {/* Languages */}
              {tool.languages && tool.languages.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tool.languages.slice(0, 3).map((lang: string, langIndex: number) => (
                    <span
                      key={langIndex}
                      className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
                    >
                      {lang}
                    </span>
                  ))}
                  {tool.languages.length > 3 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      +{tool.languages.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
