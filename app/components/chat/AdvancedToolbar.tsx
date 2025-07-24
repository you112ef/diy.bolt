import { useState } from 'react';
import { classNames } from '~/utils/classNames';

// import ADVANCED_TOOLS from '~/lib/tools/advanced-tools';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Popover from '@radix-ui/react-popover';

interface AdvancedToolbarProps {
  onToolSelect: (tool: AdvancedTool) => void;
  className?: string;
}

const TOOL_CATEGORIES = [
  { id: 'development', name: 'تطوير', icon: 'i-ph:code-duotone', color: 'text-blue-500' },
  { id: 'mobile', name: 'موبايل', icon: 'i-ph:device-mobile-duotone', color: 'text-green-500' },
  { id: 'build', name: 'بناء', icon: 'i-ph:hammer-duotone', color: 'text-orange-500' },
  { id: 'test', name: 'اختبار', icon: 'i-ph:test-tube-duotone', color: 'text-purple-500' },
  { id: 'deploy', name: 'نشر', icon: 'i-ph:rocket-duotone', color: 'text-red-500' },
  { id: 'ai', name: 'ذكاء اصطناعي', icon: 'i-ph:robot-duotone', color: 'text-cyan-500' },
];

export function AdvancedToolbar({ onToolSelect, className }: AdvancedToolbarProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  const handleToolClick = (tool: AdvancedTool) => {
    onToolSelect(tool);
    setIsToolsOpen(false);
    setSelectedCategory(null);
  };

  return (
    <div className={classNames('flex items-center gap-2', className)}>
      {/* Quick Action Buttons */}
      <div className="flex items-center gap-1">
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={() =>
                  onToolSelect({
                    name: 'Quick Build',
                    description: 'بناء سريع للمشروع',
                    category: 'build',
                    icon: 'i-ph:lightning-duotone',
                    command: 'quick-build',
                  })
                }
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-105 transition-transform"
              >
                <div className="i-ph:lightning-duotone text-sm" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary px-2 py-1 rounded-md text-sm shadow-lg border border-bolt-elements-borderColor">
                بناء سريع
                <Tooltip.Arrow className="fill-bolt-elements-background-depth-3" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>

        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={() =>
                  onToolSelect({
                    name: 'AI Assistant',
                    description: 'مساعد ذكي للبرمجة',
                    category: 'ai',
                    icon: 'i-ph:robot-duotone',
                    command: 'ai-assist',
                  })
                }
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:scale-105 transition-transform"
              >
                <div className="i-ph:robot-duotone text-sm" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary px-2 py-1 rounded-md text-sm shadow-lg border border-bolt-elements-borderColor">
                مساعد ذكي
                <Tooltip.Arrow className="fill-bolt-elements-background-depth-3" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>

        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={() =>
                  onToolSelect({
                    name: 'Android Builder',
                    description: 'بناء تطبيق أندرويد',
                    category: 'mobile',
                    icon: 'i-logos:android-icon',
                    command: 'android-build',
                  })
                }
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105 transition-transform"
              >
                <div className="i-logos:android-icon text-sm" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary px-2 py-1 rounded-md text-sm shadow-lg border border-bolt-elements-borderColor">
                بناء أندرويد
                <Tooltip.Arrow className="fill-bolt-elements-background-depth-3" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>

      <div className="w-px h-6 bg-bolt-elements-borderColor" />

      {/* Advanced Tools Menu */}
      <Popover.Root open={isToolsOpen} onOpenChange={setIsToolsOpen}>
        <Popover.Trigger asChild>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bolt-elements-background-depth-2 hover:bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor hover:border-bolt-elements-borderColorHover transition-all text-sm font-medium text-bolt-elements-textPrimary">
            <div className="i-ph:toolbox-duotone text-lg" />
            <span className="hidden md:inline">أدوات متقدمة</span>
            <div
              className={classNames('i-ph:caret-down text-sm transition-transform', isToolsOpen ? 'rotate-180' : '')}
            />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-lg shadow-lg p-4 w-80 z-50"
            sideOffset={5}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-bolt-elements-textPrimary">الأدوات المتقدمة</h3>
                <button
                  onClick={() => setIsToolsOpen(false)}
                  className="text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary"
                >
                  <div className="i-ph:x text-lg" />
                </button>
              </div>

              {/* Categories */}
              <div className="grid grid-cols-2 gap-2">
                {TOOL_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                    className={classNames(
                      'flex items-center gap-2 p-3 rounded-lg border transition-all text-sm',
                      selectedCategory === category.id
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                        : 'bg-bolt-elements-background-depth-3 border-bolt-elements-borderColor hover:border-bolt-elements-borderColorHover text-bolt-elements-textPrimary',
                    )}
                  >
                    <div className={classNames(category.icon, 'text-lg', category.color)} />
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>

              {/* Tools for Selected Category */}
              {selectedCategory && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <h4 className="text-sm font-medium text-bolt-elements-textSecondary">
                    أدوات {TOOL_CATEGORIES.find((c) => c.id === selectedCategory)?.name}
                  </h4>
                  {getToolsByCategory(selectedCategory).map((tool, _index) => (
                    <button
                      key={index}
                      onClick={() => handleToolClick(tool)}
                      className="flex items-start gap-3 p-3 w-full text-left rounded-lg bg-bolt-elements-background-depth-3 hover:bg-bolt-elements-background-depth-1 border border-transparent hover:border-bolt-elements-borderColor transition-all"
                    >
                      <div className={classNames(tool.icon, 'text-lg mt-0.5 flex-shrink-0')} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-bolt-elements-textPrimary text-sm">{tool.name}</div>
                        <div className="text-xs text-bolt-elements-textSecondary mt-1 line-clamp-2">
                          {tool.description}
                        </div>
                        {tool.languages && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {tool.languages.slice(0, 3).map((lang) => (
                              <span
                                key={lang}
                                className="px-2 py-0.5 text-xs bg-bolt-elements-background-depth-1 text-bolt-elements-textSecondary rounded"
                              >
                                {lang}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!selectedCategory && (
                <div className="text-center text-bolt-elements-textSecondary text-sm py-4">
                  اختر فئة لعرض الأدوات المتاحة
                </div>
              )}
            </div>
            <Popover.Arrow className="fill-bolt-elements-background-depth-2" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
