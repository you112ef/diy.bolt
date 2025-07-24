import { useEffect, useState } from 'react';
import { agentManager } from '~/lib/agents/agent-manager';
import type { BaseAgent } from '~/lib/agents/base-agent';

export function AgentIndicator() {
  const [activeAgent, setActiveAgent] = useState<BaseAgent | null>(null);

  useEffect(() => {
    const agent = agentManager.getActiveAgent();
    setActiveAgent(agent);
  }, []);

  if (!activeAgent) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium gradient-text">
          {activeAgent.name}
        </span>
      </div>
      <div className="hidden md:flex items-center gap-1 text-xs text-bolt-elements-textSecondary">
        <span>•</span>
        <span>{activeAgent.capabilities.filter(cap => cap.enabled).length} capabilities active</span>
      </div>
    </div>
  );
}