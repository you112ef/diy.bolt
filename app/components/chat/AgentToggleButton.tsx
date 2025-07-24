import React, { useState } from 'react';
import { classNames } from '~/utils/classNames';

interface AgentToggleButtonProps {
  modelName: string;
  providerName: string;
  className?: string;
  onToggle?: (enabled: boolean) => void;
}

export function AgentToggleButton({ modelName, providerName, className, onToggle }: AgentToggleButtonProps) {
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Simple agent mode check - in real implementation this would check actual capabilities
  const isAgent = modelName.toLowerCase().includes('gpt') || 
                   modelName.toLowerCase().includes('claude') || 
                   modelName.toLowerCase().includes('gemini');

  const handleToggle = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const newState = !isAgentMode;
      setIsAgentMode(newState);
      onToggle?.(newState);
      
      // Simulate toggle delay
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Error toggling agent mode:', error);
      setIsAgentMode(!isAgentMode); // Revert on error
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAgent) {
    return (
      <div className={classNames(
        "flex items-center gap-2 px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs",
        className
      )}>
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
        <span>وضع الوكيل غير متاح</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={classNames(
        'flex items-center gap-2 px-2 py-1 rounded text-xs font-medium transition-all',
        'hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        isAgentMode
          ? 'bg-blue-500 text-white shadow-sm'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        className
      )}
    >
      <div className={classNames(
        'w-1.5 h-1.5 rounded-full transition-colors',
        isLoading ? 'animate-pulse' : '',
        isAgentMode ? 'bg-white' : 'bg-gray-400'
      )}></div>
      
      <span>
        {isLoading ? 'جاري...' : isAgentMode ? 'وكيل نشط' : 'تفعيل وكيل'}
      </span>
      
      {isAgentMode && (
        <div className="text-xs bg-white/20 px-1 py-0.5 rounded">
          🤖
        </div>
      )}
    </button>
  );
}
