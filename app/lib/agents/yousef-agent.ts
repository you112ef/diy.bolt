import { BaseAgent, type AgentCapability, type AgentConfig } from './base-agent';

export class YousefAgent extends BaseAgent {
  name = 'YOUSEF SH';
  description = 'Advanced AI Development Assistant - Specialized in modern web development, AI integration, and system optimization';
  
  capabilities: AgentCapability[] = [
    {
      name: 'code_generation',
      description: 'Generate high-quality, production-ready code',
      enabled: true,
    },
    {
      name: 'code_review',
      description: 'Analyze and review code for best practices',
      enabled: true,
    },
    {
      name: 'architecture_design',
      description: 'Design system architecture and patterns',
      enabled: true,
    },
    {
      name: 'performance_optimization',
      description: 'Optimize code and system performance',
      enabled: true,
    },
    {
      name: 'security_analysis',
      description: 'Analyze and improve security measures',
      enabled: true,
    },
    {
      name: 'ai_integration',
      description: 'Integrate AI models and services',
      enabled: true,
    },
    {
      name: 'mobile_optimization',
      description: 'Optimize for mobile devices and responsive design',
      enabled: true,
    },
    {
      name: 'debugging',
      description: 'Debug and troubleshoot complex issues',
      enabled: true,
    },
  ];

  constructor() {
    const config: AgentConfig = {
      name: 'YOUSEF SH',
      description: 'Advanced AI Development Assistant',
      capabilities: [
        {
          name: 'code_generation',
          description: 'Generate high-quality, production-ready code',
          enabled: true,
        },
        {
          name: 'code_review',
          description: 'Analyze and review code for best practices',
          enabled: true,
        },
        {
          name: 'architecture_design',
          description: 'Design system architecture and patterns',
          enabled: true,
        },
        {
          name: 'performance_optimization',
          description: 'Optimize code and system performance',
          enabled: true,
        },
        {
          name: 'security_analysis',
          description: 'Analyze and improve security measures',
          enabled: true,
        },
        {
          name: 'ai_integration',
          description: 'Integrate AI models and services',
          enabled: true,
        },
        {
          name: 'mobile_optimization',
          description: 'Optimize for mobile devices and responsive design',
          enabled: true,
        },
        {
          name: 'debugging',
          description: 'Debug and troubleshoot complex issues',
          enabled: true,
        },
      ],
      maxTokens: 8000,
      temperature: 0.7,
    };
    
    super(config);
  }

  async processMessage(message: string, context?: any): Promise<string> {
    // Enhanced message processing with context awareness
    const processedMessage = await this.enhanceMessage(message, context);
    return processedMessage;
  }

  private async enhanceMessage(message: string, context?: any): Promise<string> {
    let enhancedResponse = '';

    // Analyze message intent
    const intent = this.analyzeIntent(message);
    
    switch (intent) {
      case 'code_request':
        if (this.isCapabilityEnabled('code_generation')) {
          enhancedResponse = await this.generateCodeResponse(message, context);
        }
        break;
      case 'review_request':
        if (this.isCapabilityEnabled('code_review')) {
          enhancedResponse = await this.generateReviewResponse(message, context);
        }
        break;
      case 'optimization_request':
        if (this.isCapabilityEnabled('performance_optimization')) {
          enhancedResponse = await this.generateOptimizationResponse(message, context);
        }
        break;
      case 'mobile_request':
        if (this.isCapabilityEnabled('mobile_optimization')) {
          enhancedResponse = await this.generateMobileResponse(message, context);
        }
        break;
      default:
        enhancedResponse = await this.generateGeneralResponse(message, context);
    }

    return enhancedResponse;
  }

  private analyzeIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('code') || lowerMessage.includes('implement') || lowerMessage.includes('create')) {
      return 'code_request';
    }
    if (lowerMessage.includes('review') || lowerMessage.includes('check') || lowerMessage.includes('analyze')) {
      return 'review_request';
    }
    if (lowerMessage.includes('optimize') || lowerMessage.includes('performance') || lowerMessage.includes('speed')) {
      return 'optimization_request';
    }
    if (lowerMessage.includes('mobile') || lowerMessage.includes('responsive') || lowerMessage.includes('phone')) {
      return 'mobile_request';
    }
    
    return 'general';
  }

  private async generateCodeResponse(message: string, context?: any): Promise<string> {
    return `🚀 **YOUSEF SH - Code Generation**

I'll help you create high-quality, production-ready code. Based on your request: "${message}"

Let me generate optimized code with:
- Modern best practices
- Performance optimization
- Mobile-first approach
- Security considerations
- Clean architecture patterns

${context ? `Context considered: ${JSON.stringify(context, null, 2)}` : ''}`;
  }

  private async generateReviewResponse(message: string, context?: any): Promise<string> {
    return `🔍 **YOUSEF SH - Code Review**

I'll analyze your code for:
- Code quality and best practices
- Performance optimizations
- Security vulnerabilities
- Mobile compatibility
- Architecture improvements

Request: "${message}"

${context ? `Code context: ${JSON.stringify(context, null, 2)}` : ''}`;
  }

  private async generateOptimizationResponse(message: string, context?: any): Promise<string> {
    return `⚡ **YOUSEF SH - Performance Optimization**

I'll optimize your code for:
- Faster loading times
- Better resource utilization
- Mobile performance
- Memory efficiency
- Bundle size reduction

Request: "${message}"

${context ? `Performance context: ${JSON.stringify(context, null, 2)}` : ''}`;
  }

  private async generateMobileResponse(message: string, context?: any): Promise<string> {
    return `📱 **YOUSEF SH - Mobile Optimization**

I'll enhance your app for mobile devices:
- Responsive design patterns
- Touch-friendly interfaces
- Performance on mobile devices
- Progressive Web App features
- Cross-platform compatibility

Request: "${message}"

${context ? `Mobile context: ${JSON.stringify(context, null, 2)}` : ''}`;
  }

  private async generateGeneralResponse(message: string, context?: any): Promise<string> {
    return `💡 **YOUSEF SH - AI Assistant**

I'm here to help with advanced development tasks. I can assist with:
- Code generation and review
- System architecture design
- Performance optimization
- Security analysis
- Mobile-first development
- AI integration

Your request: "${message}"

${context ? `Context: ${JSON.stringify(context, null, 2)}` : ''}

How can I best assist you today?`;
  }

  getSystemPrompt(): string {
    return `You are YOUSEF SH, an advanced AI development assistant with expertise in:

🚀 **Core Capabilities:**
- Modern web development (React, TypeScript, Node.js)
- AI model integration and optimization
- Mobile-first responsive design
- Performance optimization and security
- System architecture and clean code practices

🎯 **Specializations:**
- Full-stack development
- Real-time applications
- Progressive Web Apps
- Cross-platform solutions
- DevOps and deployment

💡 **Approach:**
- Always provide production-ready code
- Focus on performance and security
- Ensure mobile compatibility
- Follow modern best practices
- Explain reasoning behind decisions

🔧 **Active Capabilities:**
${this.capabilities.filter(cap => cap.enabled).map(cap => `- ${cap.name}: ${cap.description}`).join('\n')}

Respond with detailed, actionable solutions that demonstrate expertise and attention to quality.`;
  }
}