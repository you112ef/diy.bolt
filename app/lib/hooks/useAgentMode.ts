import { useState, useCallback, useRef } from 'react';
import { advancedAIAgent, type AgentResponse } from '~/lib/agents/advanced-ai-agent';
import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('useAgentMode');

export function useAgentMode() {
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [agentResponse, setAgentResponse] = useState<AgentResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);

  const enableAgentMode = useCallback(() => {
    logger.info('Enabling agent mode');
    setIsAgentMode(true);
    advancedAIAgent.setAgentMode(true);
  }, []);

  const disableAgentMode = useCallback(() => {
    logger.info('Disabling agent mode');
    setIsAgentMode(false);
    advancedAIAgent.setAgentMode(false);
    setAgentResponse(null);
    setIsProcessing(false);
  }, []);

  const toggleAgentMode = useCallback(() => {
    if (isAgentMode) {
      disableAgentMode();
    } else {
      enableAgentMode();
    }
  }, [isAgentMode, enableAgentMode, disableAgentMode]);

  const processAgentRequest = useCallback(
    async (userMessage: string): Promise<string> => {
      if (!isAgentMode || processingRef.current) {
        return userMessage; // إرجاع الرسالة كما هي إذا لم يكن في وضع الوكيل
      }

      processingRef.current = true;
      setIsProcessing(true);
      setAgentResponse(null);

      try {
        logger.info('Processing agent request', { message: userMessage });

        // معالجة الطلب باستخدام الوكيل الذكي
        const response = await advancedAIAgent.processRequest(userMessage);

        logger.info('Agent processing completed', {
          executionTime: response.executionTime,
          confidence: response.confidence,
          toolsUsed: response.toolsUsed.length,
        });

        setAgentResponse(response);

        // إرجاع الإجابة النهائية مع معلومات إضافية
        return `${response.finalAnswer}\n\n---\n**معلومات الوكيل الذكي:**\n- وقت التنفيذ: ${response.executionTime}ms\n- مستوى الثقة: ${Math.round(response.confidence * 100)}%\n- عدد الأدوات المستخدمة: ${response.toolsUsed.length}\n- خطوات التفكير: ${response.thinking.length}`;
      } catch (error) {
        logger.error('Agent processing failed', { error });

        const errorResponse: AgentResponse = {
          thinking: [
            {
              step: 1,
              thought: 'حدث خطأ في المعالجة',
              action: 'error_handling',
              reasoning: `فشل في معالجة الطلب: ${error}`,
              timestamp: new Date(),
            },
          ],
          toolsUsed: [],
          finalAnswer: `عذراً، حدث خطأ أثناء معالجة طلبك في وضع الوكيل الذكي: ${error}`,
          confidence: 0,
          executionTime: 0,
        };

        setAgentResponse(errorResponse);

        return errorResponse.finalAnswer;
      } finally {
        setIsProcessing(false);
        processingRef.current = false;
      }
    },
    [isAgentMode],
  );

  const enhancePromptForAgent = useCallback(
    (originalPrompt: string): string => {
      if (!isAgentMode) {
        return originalPrompt;
      }

      // تحسين الطلب لوضع الوكيل
      const enhancedPrompt = `[AGENT MODE] ${originalPrompt}

تعليمات للوكيل الذكي:
1. فكر خطوة بخطوة في حل هذا الطلب
2. حدد المعلومات التي تحتاجها
3. ابحث عن المعلومات المفقودة إذا لزم الأمر
4. اختر الأدوات المناسبة تلقائياً
5. قدم إجابة شاملة مع التبرير

قم بتنفيذ هذه العملية بالكامل واعرض خطوات تفكيرك.`;

      return enhancedPrompt;
    },
    [isAgentMode],
  );

  const getAgentCapabilities = useCallback(() => {
    return advancedAIAgent.getAvailableTools();
  }, []);

  const getThinkingSteps = useCallback(() => {
    return advancedAIAgent.getThinkingSteps();
  }, []);

  const getKnowledgeBase = useCallback(() => {
    return Array.from(advancedAIAgent.getKnowledgeBase().entries());
  }, []);

  const clearAgentHistory = useCallback(() => {
    setAgentResponse(null);
    setIsProcessing(false);
  }, []);

  return {
    // الحالة
    isAgentMode,
    agentResponse,
    isProcessing,

    // الإجراءات
    enableAgentMode,
    disableAgentMode,
    toggleAgentMode,
    processAgentRequest,
    enhancePromptForAgent,
    clearAgentHistory,

    // المعلومات
    getAgentCapabilities,
    getThinkingSteps,
    getKnowledgeBase,
  };
}
