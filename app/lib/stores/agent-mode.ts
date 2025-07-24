import { atom } from 'nanostores';

export interface AgentModel {
  modelName: string;
  providerName: string;
  agentName: string;
  isAgentMode: boolean;
  systemPrompt?: string;
}

// Store for agent models
export const agentModelsStore = atom<Record<string, AgentModel>>({});

// Store for currently active agent
export const activeAgentStore = atom<string | null>(null);

// Helper functions
export function createAgentFromModel(modelName: string, providerName: string, agentName: string): void {
  const agentKey = `${providerName}:${modelName}`;
  const agentModels = agentModelsStore.get();

  agentModels[agentKey] = {
    modelName,
    providerName,
    agentName,
    isAgentMode: true,
    systemPrompt: generateSystemPrompt(agentName, modelName, providerName),
  };

  agentModelsStore.set({ ...agentModels });
  activeAgentStore.set(agentKey);
}

export function removeAgent(modelName: string, providerName: string): void {
  const agentKey = `${providerName}:${modelName}`;
  const agentModels = agentModelsStore.get();

  if (agentModels[agentKey]) {
    delete agentModels[agentKey];
    agentModelsStore.set({ ...agentModels });

    // If this was the active agent, clear it
    if (activeAgentStore.get() === agentKey) {
      activeAgentStore.set(null);
    }
  }
}

export function toggleAgentMode(modelName: string, providerName: string): void {
  const agentKey = `${providerName}:${modelName}`;
  const agentModels = agentModelsStore.get();

  if (agentModels[agentKey]) {
    // Remove agent mode
    removeAgent(modelName, providerName);
  } else {
    // Create agent mode
    const agentName = generateAgentName(modelName, providerName);
    createAgentFromModel(modelName, providerName, agentName);
  }
}

export function isModelInAgentMode(modelName: string, providerName: string): boolean {
  const agentKey = `${providerName}:${modelName}`;
  const agentModels = agentModelsStore.get();

  return !!agentModels[agentKey]?.isAgentMode;
}

export function getAgentByModel(modelName: string, providerName: string): AgentModel | null {
  const agentKey = `${providerName}:${modelName}`;
  const agentModels = agentModelsStore.get();

  return agentModels[agentKey] || null;
}

export function setActiveAgent(modelName: string, providerName: string): void {
  const agentKey = `${providerName}:${modelName}`;
  activeAgentStore.set(agentKey);
}

function generateAgentName(modelName: string, providerName: string): string {
  // Generate a friendly agent name based on model and provider
  const modelParts = modelName.split('-');
  const providerParts = providerName.split(' ');

  if (modelName.includes('gpt')) {
    return `GPT Assistant`;
  } else if (modelName.includes('claude')) {
    return `Claude Agent`;
  } else if (modelName.includes('gemini')) {
    return `Gemini Helper`;
  } else if (modelName.includes('llama')) {
    return `Llama Assistant`;
  } else {
    return `${providerParts[0]} Agent`;
  }
}

function generateSystemPrompt(agentName: string, modelName: string, providerName: string): string {
  return `You are ${agentName}, an advanced AI development assistant powered by ${modelName} from ${providerName}.

🎯 **Your Role:**
- Act as a specialized AI agent with comprehensive development capabilities
- Provide detailed, production-ready solutions
- Support full-stack development across all platforms
- Focus on modern best practices and cutting-edge technologies

🚀 **Advanced Capabilities:**
- **Frontend Development**: React, Vue, Angular, Next.js, Nuxt.js
- **Backend Development**: Node.js, Python (Django/FastAPI), Java (Spring Boot), Go, Rust
- **Mobile Development**: React Native, Flutter, Native Android (Kotlin/Java), iOS (Swift)
- **Database Design**: SQL, NoSQL, Schema optimization, Query optimization
- **DevOps & Deployment**: Docker, Kubernetes, CI/CD, Cloud platforms (AWS, GCP, Azure)
- **Testing**: Unit tests, Integration tests, E2E tests (Jest, Cypress, Playwright)
- **Performance Optimization**: Code optimization, Bundle optimization, Database tuning
- **Security**: Best practices, Vulnerability assessment, Secure coding
- **AI Integration**: ML models, API integration, Data processing

🛠️ **Available Tools:**
- Code generation and optimization
- Project scaffolding and setup
- Build system configuration
- Testing framework setup
- Deployment pipeline creation
- Android APK building
- Performance analysis
- Security auditing
- Bug detection and fixing
- Documentation generation

💡 **Approach:**
- Always provide complete, runnable code
- Include proper error handling and validation
- Follow industry best practices and coding standards
- Optimize for performance and maintainability
- Ensure mobile responsiveness and cross-platform compatibility
- Include comprehensive testing strategies
- Provide deployment-ready configurations

🎨 **Code Quality Standards:**
- Clean, readable, and well-documented code
- Proper separation of concerns
- Scalable architecture patterns
- Type safety (TypeScript preferred)
- Accessibility compliance
- SEO optimization for web applications
- Progressive Web App features when applicable

Remember: You're operating in advanced agent mode with access to comprehensive development tools. Always deliver production-ready, scalable solutions that follow modern development practices.`;
}
