import { useState } from 'react';
import { classNames } from '~/utils/classNames';
import { ControlPanel } from '~/components/control-panel/ControlPanel';
import { AgentModeToggle } from '~/components/agent/AgentModeToggle';
import { useAgentMode } from '~/lib/hooks/useAgentMode';
import * as Tooltip from '@radix-ui/react-tooltip';

interface MobileToolbarProps {
  onExecuteCommand: (command: string) => void;
  currentModel?: string;
  currentProvider?: string;
}

export function MobileToolbar({ onExecuteCommand, currentModel, currentProvider }: MobileToolbarProps) {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const { isAgentMode, toggleAgentMode } = useAgentMode();

  const toolbarItems = [
    {
      id: 'agent-mode',
      icon: 'i-ph:robot-duotone',
      label: 'Agent Mode',
      color: isAgentMode ? 'text-blue-500' : 'text-gray-500',
      action: () => toggleAgentMode(),
    },
    {
      id: 'control-panel',
      icon: 'i-ph:control-duotone',
      label: 'Control Panel',
      color: 'text-blue-500',
      action: () => setIsControlPanelOpen(true),
    },
    {
      id: 'files',
      icon: 'i-ph:folder-duotone',
      label: 'Files',
      color: 'text-green-500',
      action: () => setActiveItem('files'),
    },
    {
      id: 'terminal',
      icon: 'i-ph:terminal-duotone',
      label: 'Terminal',
      color: 'text-purple-500',
      action: () => setActiveItem('terminal'),
    },
    {
      id: 'ai-tools',
      icon: 'i-ph:robot-duotone',
      label: 'AI Tools',
      color: 'text-orange-500',
      action: () => setActiveItem('ai-tools'),
    },
    {
      id: 'settings',
      icon: 'i-ph:gear-duotone',
      label: 'Settings',
      color: 'text-gray-500',
      action: () => setActiveItem('settings'),
    },
  ];

  const quickActions = [
    {
      id: 'new-project',
      icon: 'i-ph:plus-circle-duotone',
      label: 'New Project',
      command: 'create-new-project',
      color: 'text-blue-500',
    },
    {
      id: 'run-build',
      icon: 'i-ph:play-duotone',
      label: 'Run Build',
      command: 'npm run build',
      color: 'text-green-500',
    },
    {
      id: 'run-tests',
      icon: 'i-ph:test-tube-duotone',
      label: 'Run Tests',
      command: 'npm test',
      color: 'text-yellow-500',
    },
    {
      id: 'deploy',
      icon: 'i-ph:rocket-duotone',
      label: 'Deploy',
      command: 'deploy-project',
      color: 'text-red-500',
    },
  ];

  return (
    <>
      {/* Main Mobile Toolbar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-bolt-elements-background-depth-1 border-t border-bolt-elements-borderColor z-50 backdrop-filter backdrop-blur-lg">
        <div className="flex justify-around items-center py-2 px-2">
          {toolbarItems.map((item) => (
            <Tooltip.Provider key={item.id}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={item.action}
                    className={classNames(
                      'flex flex-col items-center gap-1 p-2 rounded-lg transition-all min-w-[60px] touch-optimized',
                      activeItem === item.id
                        ? 'bg-bolt-elements-background-depth-2'
                        : 'hover:bg-bolt-elements-background-depth-2',
                    )}
                  >
                    <div
                      className={classNames(
                        item.icon,
                        'text-xl',
                        activeItem === item.id ? item.color : 'text-bolt-elements-textSecondary',
                      )}
                    />
                    <span
                      className={classNames(
                        'text-xs font-medium',
                        activeItem === item.id ? item.color : 'text-bolt-elements-textSecondary',
                      )}
                    >
                      {item.label}
                    </span>
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary px-3 py-2 rounded-md text-sm shadow-lg border border-bolt-elements-borderColor z-50">
                    {item.label}
                    <Tooltip.Arrow className="fill-bolt-elements-background-depth-3" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          ))}
        </div>

        {/* Quick Actions Bar */}
        <div className="flex justify-center items-center gap-2 px-4 py-2 border-t border-bolt-elements-borderColor bg-bolt-elements-background-depth-2">
          {quickActions.map((action) => (
            <Tooltip.Provider key={action.id}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={() => onExecuteCommand(action.command)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-bolt-elements-background-depth-1 hover:bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor transition-all touch-optimized"
                  >
                    <div className={classNames(action.icon, 'text-sm', action.color)} />
                    <span className="text-xs text-bolt-elements-textPrimary">{action.label}</span>
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary px-3 py-2 rounded-md text-sm shadow-lg border border-bolt-elements-borderColor z-50">
                    {action.label}
                    <Tooltip.Arrow className="fill-bolt-elements-background-depth-3" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          ))}
        </div>
      </div>

      {/* Control Panel */}
      <ControlPanel
        isOpen={isControlPanelOpen}
        onClose={() => setIsControlPanelOpen(false)}
        onExecuteCommand={onExecuteCommand}
        currentModel={currentModel}
        currentProvider={currentProvider}
      />

      {/* Files Panel */}
      {activeItem === 'files' && (
        <div className="md:hidden fixed inset-0 bg-bolt-elements-background-depth-1 z-40 pt-16">
          <div className="flex items-center justify-between p-4 border-b border-bolt-elements-borderColor">
            <h2 className="text-lg font-semibold text-bolt-elements-textPrimary">Files</h2>
            <button
              onClick={() => setActiveItem(null)}
              className="p-2 rounded-lg hover:bg-bolt-elements-background-depth-2 text-bolt-elements-textSecondary"
            >
              <div className="i-ph:x text-xl" />
            </button>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-bolt-elements-background-depth-2">
                <div className="i-ph:folder-duotone text-lg text-blue-500" />
                <span className="text-sm text-bolt-elements-textPrimary">src</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-bolt-elements-background-depth-2">
                <div className="i-ph:file-code-duotone text-lg text-green-500" />
                <span className="text-sm text-bolt-elements-textPrimary">package.json</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-bolt-elements-background-depth-2">
                <div className="i-ph:file-duotone text-lg text-gray-500" />
                <span className="text-sm text-bolt-elements-textPrimary">README.md</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terminal Panel */}
      {activeItem === 'terminal' && (
        <div className="md:hidden fixed inset-0 bg-bolt-elements-background-depth-1 z-40 pt-16">
          <div className="flex items-center justify-between p-4 border-b border-bolt-elements-borderColor">
            <h2 className="text-lg font-semibold text-bolt-elements-textPrimary">Terminal</h2>
            <button
              onClick={() => setActiveItem(null)}
              className="p-2 rounded-lg hover:bg-bolt-elements-background-depth-2 text-bolt-elements-textSecondary"
            >
              <div className="i-ph:x text-xl" />
            </button>
          </div>
          <div className="p-4 h-full bg-black text-green-400 font-mono text-sm">
            <div className="mb-2">$ Welcome to YOUSEF SH Terminal</div>
            <div className="mb-2">$ Ready for commands...</div>
            <div className="flex items-center">
              <span className="mr-2">$</span>
              <input
                type="text"
                className="flex-1 bg-transparent outline-none border-none text-green-400"
                placeholder="Enter command..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const command = (e.target as HTMLInputElement).value;

                    if (command) {
                      onExecuteCommand(command);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* AI Tools Panel */}
      {activeItem === 'ai-tools' && (
        <div className="md:hidden fixed inset-0 bg-bolt-elements-background-depth-1 z-40 pt-16">
          <div className="flex items-center justify-between p-4 border-b border-bolt-elements-borderColor">
            <h2 className="text-lg font-semibold text-bolt-elements-textPrimary">AI Tools</h2>
            <button
              onClick={() => setActiveItem(null)}
              className="p-2 rounded-lg hover:bg-bolt-elements-background-depth-2 text-bolt-elements-textSecondary"
            >
              <div className="i-ph:x text-xl" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <button
              onClick={() => onExecuteCommand('ai-code-review')}
              className="w-full flex items-center gap-3 p-4 rounded-lg bg-bolt-elements-background-depth-2 hover:bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor transition-all"
            >
              <div className="i-ph:magnifying-glass-duotone text-xl text-blue-500" />
              <div className="text-left">
                <div className="font-medium text-bolt-elements-textPrimary">Code Review</div>
                <div className="text-sm text-bolt-elements-textSecondary">Analyze and review your code</div>
              </div>
            </button>

            <button
              onClick={() => onExecuteCommand('ai-optimize')}
              className="w-full flex items-center gap-3 p-4 rounded-lg bg-bolt-elements-background-depth-2 hover:bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor transition-all"
            >
              <div className="i-ph:lightning-duotone text-xl text-yellow-500" />
              <div className="text-left">
                <div className="font-medium text-bolt-elements-textPrimary">Optimize Code</div>
                <div className="text-sm text-bolt-elements-textSecondary">Improve performance and efficiency</div>
              </div>
            </button>

            <button
              onClick={() => onExecuteCommand('ai-generate-docs')}
              className="w-full flex items-center gap-3 p-4 rounded-lg bg-bolt-elements-background-depth-2 hover:bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor transition-all"
            >
              <div className="i-ph:file-text-duotone text-xl text-green-500" />
              <div className="text-left">
                <div className="font-medium text-bolt-elements-textPrimary">Generate Docs</div>
                <div className="text-sm text-bolt-elements-textSecondary">Create documentation automatically</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {activeItem === 'settings' && (
        <div className="md:hidden fixed inset-0 bg-bolt-elements-background-depth-1 z-40 pt-16">
          <div className="flex items-center justify-between p-4 border-b border-bolt-elements-borderColor">
            <h2 className="text-lg font-semibold text-bolt-elements-textPrimary">Settings</h2>
            <button
              onClick={() => setActiveItem(null)}
              className="p-2 rounded-lg hover:bg-bolt-elements-background-depth-2 text-bolt-elements-textSecondary"
            >
              <div className="i-ph:x text-xl" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-bolt-elements-background-depth-2">
                <div className="flex items-center gap-3">
                  <div className="i-ph:moon-duotone text-lg text-blue-500" />
                  <span className="text-sm text-bolt-elements-textPrimary">Dark Mode</span>
                </div>
                <button className="w-12 h-6 bg-blue-500 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-all"></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-bolt-elements-background-depth-2">
                <div className="flex items-center gap-3">
                  <div className="i-ph:bell-duotone text-lg text-green-500" />
                  <span className="text-sm text-bolt-elements-textPrimary">Notifications</span>
                </div>
                <button className="w-12 h-6 bg-gray-300 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 transition-all"></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-bolt-elements-background-depth-2">
                <div className="flex items-center gap-3">
                  <div className="i-ph:code-duotone text-lg text-purple-500" />
                  <span className="text-sm text-bolt-elements-textPrimary">Auto-save</span>
                </div>
                <button className="w-12 h-6 bg-blue-500 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-all"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
