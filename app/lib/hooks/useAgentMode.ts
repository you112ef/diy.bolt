import { useState, useCallback } from 'react';

export interface AgentModeState {
  isAgentMode: boolean;
  toggleAgentMode: () => void;
  setAgentMode: (enabled: boolean) => void;
}

export function useAgentMode(): AgentModeState {
  const [isAgentMode, setIsAgentMode] = useState(false);

  const toggleAgentMode = useCallback(() => {
    setIsAgentMode((prev) => !prev);
  }, []);

  const setAgentMode = useCallback((enabled: boolean) => {
    setIsAgentMode(enabled);
  }, []);

  return {
    isAgentMode,
    toggleAgentMode,
    setAgentMode,
  };
}
