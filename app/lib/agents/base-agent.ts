export interface AgentCapability {
  name: string;
  description: string;
  enabled: boolean;
}

export interface AgentConfig {
  name: string;
  description: string;
  capabilities: AgentCapability[];
  maxTokens?: number;
  temperature?: number;
}

export abstract class BaseAgent {
  abstract name: string;
  abstract description: string;
  abstract capabilities: AgentCapability[];
  
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  abstract processMessage(message: string, context?: any): Promise<string>;
  
  abstract getSystemPrompt(): string;

  getConfig(): AgentConfig {
    return this.config;
  }

  isCapabilityEnabled(capabilityName: string): boolean {
    const capability = this.capabilities.find(cap => cap.name === capabilityName);
    return capability ? capability.enabled : false;
  }

  enableCapability(capabilityName: string): void {
    const capability = this.capabilities.find(cap => cap.name === capabilityName);
    if (capability) {
      capability.enabled = true;
    }
  }

  disableCapability(capabilityName: string): void {
    const capability = this.capabilities.find(cap => cap.name === capabilityName);
    if (capability) {
      capability.enabled = false;
    }
  }
}