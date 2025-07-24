import { useStore } from '@nanostores/react';
import { classNames } from '~/utils/classNames';
import { toggleAgentMode, isModelInAgentMode, getAgentByModel, agentModelsStore } from '~/lib/stores/agent-mode';
import * as Tooltip from '@radix-ui/react-tooltip';

interface AgentToggleButtonProps {
  modelName: string;
  providerName: string;
  className?: string;
}

export function AgentToggleButton({ modelName, providerName, className }: AgentToggleButtonProps) {
  const agentModels = useStore(agentModelsStore);
  const isAgent = isModelInAgentMode(modelName, providerName);
  const agent = getAgentByModel(modelName, providerName);

  const handleToggle = () => {
    toggleAgentMode(modelName, providerName);
  };

  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            onClick={handleToggle}
            className={classNames(
              'flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200',
              'hover:scale-105 active:scale-95',
              isAgent
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-bolt-elements-background-depth-2 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary border border-bolt-elements-borderColor hover:border-bolt-elements-borderColorHover',
              className,
            )}
            type="button"
            aria-label={isAgent ? 'Disable agent mode' : 'Enable agent mode'}
          >
            {isAgent ? (
              <div className="i-ph:robot-duotone text-lg" />
            ) : (
              <div className="i-ph:user-circle-duotone text-lg" />
            )}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary px-2 py-1 rounded-md text-sm shadow-lg border border-bolt-elements-borderColor"
            sideOffset={5}
          >
            {isAgent ? (
              <div>
                <div className="font-medium text-blue-400">{agent?.agentName}</div>
                <div className="text-xs text-bolt-elements-textSecondary">Click to disable agent mode</div>
              </div>
            ) : (
              <div>
                <div className="font-medium">Standard Model</div>
                <div className="text-xs text-bolt-elements-textSecondary">Click to enable agent mode</div>
              </div>
            )}
            <Tooltip.Arrow className="fill-bolt-elements-background-depth-3" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
