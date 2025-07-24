import { BaseAgent } from './base-agent';
import { YousefAgent } from './yousef-agent';

export class AgentManager {
  private static instance: AgentManager;
  private agents: Map<string, BaseAgent> = new Map();
  private activeAgent: BaseAgent | null = null;

  private constructor() {
    this.initializeAgents();
  }

  static getInstance(): AgentManager {
    if (!AgentManager.instance) {
      AgentManager.instance = new AgentManager();
    }
    return AgentManager.instance;
  }

  private initializeAgents(): void {
    // Register default agents
    const yousefAgent = new YousefAgent();
    this.registerAgent(yousefAgent);
    
    // Set YOUSEF SH as the default active agent
    this.setActiveAgent('YOUSEF SH');
  }

  registerAgent(agent: BaseAgent): void {
    this.agents.set(agent.name, agent);
  }

  getAgent(name: string): BaseAgent | undefined {
    return this.agents.get(name);
  }

  getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  setActiveAgent(name: string): boolean {
    const agent = this.agents.get(name);
    if (agent) {
      this.activeAgent = agent;
      return true;
    }
    return false;
  }

  getActiveAgent(): BaseAgent | null {
    return this.activeAgent;
  }

  async processMessage(message: string, context?: any): Promise<string> {
    if (!this.activeAgent) {
      return 'No active agent available. Please select an agent first.';
    }

    try {
      return await this.activeAgent.processMessage(message, context);
    } catch (error) {
      console.error('Error processing message with agent:', error);
      return 'Sorry, I encountered an error while processing your request. Please try again.';
    }
  }

  getActiveAgentSystemPrompt(): string {
    if (!this.activeAgent) {
      return 'You are a helpful AI assistant.';
    }
    return this.activeAgent.getSystemPrompt();
  }

  getAgentCapabilities(agentName: string): string[] {
    const agent = this.agents.get(agentName);
    if (!agent) {
      return [];
    }
    return agent.capabilities
      .filter(cap => cap.enabled)
      .map(cap => cap.name);
  }

  enableAgentCapability(agentName: string, capabilityName: string): boolean {
    const agent = this.agents.get(agentName);
    if (agent) {
      agent.enableCapability(capabilityName);
      return true;
    }
    return false;
  }

  disableAgentCapability(agentName: string, capabilityName: string): boolean {
    const agent = this.agents.get(agentName);
    if (agent) {
      agent.disableCapability(capabilityName);
      return true;
    }
    return false;
  }
}

// Export singleton instance
export const agentManager = AgentManager.getInstance();