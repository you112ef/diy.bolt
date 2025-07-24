import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { classNames } from '~/utils/classNames';
import { agentModelsStore, isModelInAgentMode } from '~/lib/stores/agent-mode';
import { realAITools } from '~/lib/ai-integrations/real-ai-tools';
import { AgentModeToggle } from '~/components/agent/AgentModeToggle';
import { AgentAnalytics } from '~/components/agent/AgentAnalytics';
import { PluginManager } from '~/components/plugins/PluginManager';
import { useAgentMode } from '~/lib/hooks/useAgentMode';
import { SmoothTransition, AnimatedText } from '~/components/ui/SmoothTransitions';
import { useTheme } from '~/components/ui/SmartThemeSystem';
import { usePerformanceMonitor } from '~/lib/hooks/useOptimizedState';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import * as Tooltip from '@radix-ui/react-tooltip';

interface ControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (command: string) => void;
  currentModel?: string;
  currentProvider?: string;
}

export function ControlPanel({ isOpen, onClose, onExecuteCommand, currentModel, currentProvider }: ControlPanelProps) {
  const [activeTab, setActiveTab] = useState('development');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string>('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPluginManager, setShowPluginManager] = useState(false);
  const agentModels = useStore(agentModelsStore);
  const { isAgentMode, toggleAgentMode, agentResponse } = useAgentMode();
  const { colors, isDark } = useTheme();
  const { markRender } = usePerformanceMonitor('ControlPanel');

  const executeRealCommand = async (command: string, description: string) => {
    setIsExecuting(true);
    setExecutionResult('جاري التنفيذ...');

    try {
      // تنفيذ أوامر الذكاء الاصطناعي الحقيقية
      if (command.includes('ai-code-review')) {
        const sampleCode = `function calculateSum(a, b) {
          return a + b;
        }`;
        const result = await realAITools.reviewCode(sampleCode, 'javascript');

        if (result.success) {
          setExecutionResult(`✅ ${description}: ${result.analysis}`);
        } else {
          setExecutionResult(`❌ ${result.analysis}`);
        }
      } else if (command.includes('ai-optimize')) {
        const sampleCode = `for (let i = 0; i < array.length; i++) {
          console.log(array[i]);
        }`;
        const result = await realAITools.optimizeCode(sampleCode, 'javascript');

        if (result.success) {
          setExecutionResult(`✅ ${description}: تم تحسين الكود بنسبة ${result.performanceGain?.toFixed(1)}%`);
        } else {
          setExecutionResult(`❌ فشل في تحسين الكود`);
        }
      } else {
        // تنفيذ الأوامر العادية
        onExecuteCommand(command);
        setExecutionResult(`✅ تم تنفيذ: ${description}`);
      }
    } catch (error) {
      setExecutionResult(`❌ خطأ في التنفيذ: ${error}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const developmentTools = [
    {
      id: 'create-react-app',
      name: 'React App',
      icon: 'i-logos:react',
      description: 'إنشاء تطبيق React كامل',
      command: `npx create-react-app my-app --template typescript
cd my-app
npm install @types/react @types/react-dom
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm start`,
      category: 'frontend',
      size: 'large',
    },
    {
      id: 'create-nextjs-app',
      name: 'Next.js App',
      icon: 'i-logos:nextjs-icon',
      description: 'إنشاء تطبيق Next.js مع TypeScript',
      command: `npx create-next-app@latest my-nextjs-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd my-nextjs-app
npm run dev`,
      category: 'fullstack',
      size: 'large',
    },
    {
      id: 'create-nodejs-api',
      name: 'Node.js API',
      icon: 'i-logos:nodejs-icon',
      description: 'إنشاء API خادم Node.js',
      command: `mkdir nodejs-api && cd nodejs-api
npm init -y
npm install express cors helmet morgan dotenv
npm install -D @types/node @types/express typescript ts-node nodemon
npx tsc --init
mkdir src routes middleware
echo 'console.log("API Server Started")' > src/index.ts
npm run dev`,
      category: 'backend',
      size: 'medium',
    },
    {
      id: 'create-python-fastapi',
      name: 'FastAPI',
      icon: 'i-logos:python',
      description: 'إنشاء API Python FastAPI',
      command: `mkdir fastapi-app && cd fastapi-app
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn python-multipart
echo 'from fastapi import FastAPI
app = FastAPI()
@app.get("/")
def read_root():
    return {"Hello": "World"}' > main.py
uvicorn main:app --reload`,
      category: 'backend',
      size: 'medium',
    },
  ];

  const mobileTools = [
    {
      id: 'create-react-native',
      name: 'React Native',
      icon: 'i-logos:react',
      description: 'تطبيق React Native',
      command: `npx react-native@latest init MyReactNativeApp --template react-native-template-typescript
cd MyReactNativeApp
npm install @react-navigation/native @react-navigation/stack
npx react-native run-android`,
      category: 'mobile',
      size: 'large',
    },
    {
      id: 'create-flutter-app',
      name: 'Flutter App',
      icon: 'i-logos:flutter',
      description: 'تطبيق Flutter',
      command: `flutter create my_flutter_app
cd my_flutter_app
flutter pub get
flutter run`,
      category: 'mobile',
      size: 'large',
    },
    {
      id: 'create-android-native',
      name: 'Android Native',
      icon: 'i-logos:android-icon',
      description: 'تطبيق أندرويد أصلي',
      command: `mkdir AndroidApp && cd AndroidApp
gradle init --type java-application
./gradlew build
./gradlew run`,
      category: 'mobile',
      size: 'large',
    },
  ];

  const buildTools = [
    {
      id: 'docker-setup',
      name: 'Docker',
      icon: 'i-logos:docker-icon',
      description: 'إعداد Docker',
      command: `echo 'FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]' > Dockerfile
docker build -t my-app .
docker run -p 3000:3000 my-app`,
      category: 'devops',
      size: 'medium',
    },
    {
      id: 'webpack-setup',
      name: 'Webpack',
      icon: 'i-logos:webpack',
      description: 'إعداد Webpack',
      command: `npm install --save-dev webpack webpack-cli webpack-dev-server
npm install --save-dev html-webpack-plugin css-loader style-loader
npx webpack --mode development
npx webpack serve`,
      category: 'build',
      size: 'small',
    },
  ];

  const testingTools = [
    {
      id: 'jest-setup',
      name: 'Jest Tests',
      icon: 'i-logos:jest',
      description: 'إعداد اختبارات Jest',
      command: `npm install --save-dev jest @types/jest ts-jest
npx ts-jest config:init
npm test`,
      category: 'testing',
      size: 'small',
    },
    {
      id: 'cypress-setup',
      name: 'Cypress E2E',
      icon: 'i-logos:cypress-icon',
      description: 'اختبارات Cypress',
      command: `npm install --save-dev cypress
npx cypress open
npx cypress run`,
      category: 'testing',
      size: 'small',
    },
  ];

  const deploymentTools = [
    {
      id: 'vercel-deploy',
      name: 'Vercel',
      icon: 'i-logos:vercel-icon',
      description: 'نشر على Vercel',
      command: `npm install -g vercel
vercel login
vercel --prod`,
      category: 'deployment',
      size: 'small',
    },
    {
      id: 'netlify-deploy',
      name: 'Netlify',
      icon: 'i-logos:netlify',
      description: 'نشر على Netlify',
      command: `npm install -g netlify-cli
netlify login
netlify deploy --prod`,
      category: 'deployment',
      size: 'small',
    },
  ];

  const aiTools = [
    {
      id: 'ai-code-review',
      name: 'مراجعة الكود',
      icon: 'i-ph:robot-duotone',
      description: 'مراجعة ذكية للكود',
      command: 'قم بمراجعة الكود الحالي وتحديد نقاط التحسين والأخطاء المحتملة مع اقتراحات محددة للتحسين',
      category: 'ai',
      size: 'medium',
    },
    {
      id: 'ai-optimize',
      name: 'تحسين الأداء',
      icon: 'i-ph:lightning-duotone',
      description: 'تحسين أداء الكود',
      command: 'حلل الكود الحالي وقدم تحسينات للأداء مع قياسات محددة وأمثلة عملية',
      category: 'ai',
      size: 'medium',
    },
  ];

  const renderToolGrid = (tools: any[], cols = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4') => (
    <div className={classNames('grid gap-2', cols)}>
      {tools.map((tool) => (
        <Tooltip.Provider key={tool.id}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={() => executeRealCommand(tool.command, tool.description)}
                disabled={isExecuting}
                className={classNames(
                  'flex flex-col items-center gap-2 p-3 rounded-lg border transition-all text-center',
                  'bg-bolt-elements-background-depth-2 hover:bg-bolt-elements-background-depth-3',
                  'border-bolt-elements-borderColor hover:border-bolt-elements-borderColorHover',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  tool.size === 'large' ? 'min-h-[80px]' : tool.size === 'medium' ? 'min-h-[70px]' : 'min-h-[60px]',
                )}
              >
                <div className={classNames(tool.icon, 'text-lg md:text-xl')} />
                <span className="text-xs md:text-sm font-medium text-bolt-elements-textPrimary">{tool.name}</span>
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary px-3 py-2 rounded-md text-sm shadow-lg border border-bolt-elements-borderColor max-w-xs z-50">
                <div className="font-medium mb-1">{tool.description}</div>
                <div className="text-xs text-bolt-elements-textSecondary">انقر للتنفيذ</div>
                <Tooltip.Arrow className="fill-bolt-elements-background-depth-3" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      ))}
    </div>
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed top-2 left-2 right-2 bottom-2 md:top-4 md:left-4 md:right-4 md:bottom-4 bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor rounded-lg shadow-lg overflow-hidden z-50">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-3 md:p-4 border-b border-bolt-elements-borderColor">
              <div className="flex items-center gap-2">
                <div className="i-ph:control-duotone text-xl text-blue-500" />
                <Dialog.Title className="text-lg md:text-xl font-semibold text-bolt-elements-textPrimary">
                  Control Panel
                </Dialog.Title>
                {isAgentMode && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-400">
                    <div className="i-ph:robot-duotone text-sm" />
                    <span>Agent Mode Active</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Plugin Manager Button */}
                <SmoothTransition
                  config={{
                    type: 'scale',
                    duration: 'fast',
                    triggerOnMount: true,
                    delay: 100,
                  }}
                >
                  <button
                    onClick={() => {
                      markRender('plugin-manager-open');
                      setShowPluginManager(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:scale-105"
                    style={{
                      backgroundColor: colors.surface.elevated,
                      borderColor: colors.border.primary,
                      color: colors.text.primary,
                    }}
                    title="إدارة الإضافات"
                  >
                    <div className="i-ph:puzzle-piece-duotone text-lg" />
                    <span className="hidden md:inline text-sm">الإضافات</span>
                  </button>
                </SmoothTransition>

                {/* Analytics Button */}
                {isAgentMode && (
                  <SmoothTransition
                    config={{
                      type: 'scale',
                      duration: 'fast',
                      triggerOnMount: true,
                      delay: 200,
                    }}
                  >
                    <button
                      onClick={() => {
                        markRender('analytics-open');
                        setShowAnalytics(true);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:scale-105"
                      style={{
                        backgroundColor: colors.surface.elevated,
                        borderColor: colors.border.primary,
                        color: colors.text.primary,
                      }}
                      title="تحليلات الوكيل"
                    >
                      <div className="i-ph:chart-bar-duotone text-lg" />
                      <span className="hidden md:inline text-sm">التحليلات</span>
                    </button>
                  </SmoothTransition>
                )}

                <Dialog.Close asChild>
                  <button
                    className="p-2 rounded-lg transition-colors hover:scale-105"
                    style={{
                      backgroundColor: colors.surface.elevated,
                      color: colors.text.secondary,
                    }}
                  >
                    <div className="i-ph:x text-xl" />
                  </button>
                </Dialog.Close>
              </div>
            </div>

            {/* Agent Mode Toggle */}
            <div className="p-3 md:p-4 border-b border-bolt-elements-borderColor">
              <AgentModeToggle
                currentModel={currentModel}
                currentProvider={currentProvider}
                onAgentModeChange={(enabled) => {
                  if (enabled !== isAgentMode) {
                    toggleAgentMode();
                  }
                }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                {/* Tabs List */}
                <Tabs.List className="flex border-b border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 overflow-x-auto">
                  {[
                    { id: 'agent', name: 'وكيل ذكي', icon: 'i-ph:robot-duotone', agentOnly: true },
                    { id: 'development', name: 'تطوير', icon: 'i-ph:code-duotone' },
                    { id: 'mobile', name: 'موبايل', icon: 'i-ph:device-mobile-duotone' },
                    { id: 'build', name: 'بناء', icon: 'i-ph:hammer-duotone' },
                    { id: 'testing', name: 'اختبار', icon: 'i-ph:test-tube-duotone' },
                    { id: 'deployment', name: 'نشر', icon: 'i-ph:rocket-duotone' },
                    { id: 'ai', name: 'ذكاء اصطناعي', icon: 'i-ph:robot-duotone' },
                  ]
                    .filter((tab) => !tab.agentOnly || isAgentMode)
                    .map((tab) => (
                      <Tabs.Trigger
                        key={tab.id}
                        value={tab.id}
                        className={classNames(
                          'flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all whitespace-nowrap',
                          'data-[state=active]:bg-bolt-elements-background-depth-1 data-[state=active]:text-blue-500',
                          'data-[state=inactive]:text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary',
                        )}
                      >
                        <div className={classNames(tab.icon, 'text-lg')} />
                        <span className="hidden md:inline">{tab.name}</span>
                      </Tabs.Trigger>
                    ))}
                </Tabs.List>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto">
                  <Tabs.Content value="agent" className="p-3 md:p-4">
                    <h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-4">الوكيل الذكي</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="i-ph:info-duotone text-blue-500" />
                          <span className="text-sm font-medium text-blue-400">معلومات الوكيل</span>
                        </div>
                        <p className="text-xs text-blue-300">
                          الوكيل الذكي يقوم بالتفكير التلقائي واختيار الأدوات المناسبة لحل المشاكل البرمجية. يتضمن البحث
                          الذكي وجمع المعلومات وتحليل الكود وتحسين الأداء.
                        </p>
                      </div>

                      <div className="grid gap-3">
                        <button
                          onClick={() => executeRealCommand('agent-status', 'فحص حالة الوكيل')}
                          disabled={isExecuting}
                          className="flex items-center gap-3 p-3 rounded-lg border bg-bolt-elements-background-depth-2 hover:bg-bolt-elements-background-depth-3 border-bolt-elements-borderColor transition-all"
                        >
                          <div className="i-ph:pulse-duotone text-lg text-green-500" />
                          <div className="text-left">
                            <div className="font-medium text-bolt-elements-textPrimary text-sm">فحص حالة الوكيل</div>
                            <div className="text-xs text-bolt-elements-textSecondary">
                              التحقق من جاهزية الوكيل والأدوات
                            </div>
                          </div>
                        </button>

                        <button
                          onClick={() => executeRealCommand('agent-capabilities', 'عرض قدرات الوكيل')}
                          disabled={isExecuting}
                          className="flex items-center gap-3 p-3 rounded-lg border bg-bolt-elements-background-depth-2 hover:bg-bolt-elements-background-depth-3 border-bolt-elements-borderColor transition-all"
                        >
                          <div className="i-ph:list-duotone text-lg text-blue-500" />
                          <div className="text-left">
                            <div className="font-medium text-bolt-elements-textPrimary text-sm">قدرات الوكيل</div>
                            <div className="text-xs text-bolt-elements-textSecondary">
                              عرض جميع الأدوات والقدرات المتاحة
                            </div>
                          </div>
                        </button>

                        <button
                          onClick={() => executeRealCommand('agent-knowledge', 'عرض قاعدة المعرفة')}
                          disabled={isExecuting}
                          className="flex items-center gap-3 p-3 rounded-lg border bg-bolt-elements-background-depth-2 hover:bg-bolt-elements-background-depth-3 border-bolt-elements-borderColor transition-all"
                        >
                          <div className="i-ph:books-duotone text-lg text-purple-500" />
                          <div className="text-left">
                            <div className="font-medium text-bolt-elements-textPrimary text-sm">قاعدة المعرفة</div>
                            <div className="text-xs text-bolt-elements-textSecondary">استعراض المعلومات المخزنة</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </Tabs.Content>

                  <Tabs.Content value="development" className="p-3 md:p-4">
                    <h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-4">أدوات التطوير</h3>
                    {renderToolGrid(developmentTools)}
                  </Tabs.Content>

                  <Tabs.Content value="mobile" className="p-3 md:p-4">
                    <h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-4">تطوير الموبايل</h3>
                    {renderToolGrid(mobileTools)}
                  </Tabs.Content>

                  <Tabs.Content value="build" className="p-3 md:p-4">
                    <h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-4">أدوات البناء</h3>
                    {renderToolGrid(buildTools)}
                  </Tabs.Content>

                  <Tabs.Content value="testing" className="p-3 md:p-4">
                    <h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-4">أدوات الاختبار</h3>
                    {renderToolGrid(testingTools)}
                  </Tabs.Content>

                  <Tabs.Content value="deployment" className="p-3 md:p-4">
                    <h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-4">أدوات النشر</h3>
                    {renderToolGrid(deploymentTools)}
                  </Tabs.Content>

                  <Tabs.Content value="ai" className="p-3 md:p-4">
                    <h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-4">
                      أدوات الذكاء الاصطناعي
                    </h3>
                    {renderToolGrid(aiTools)}
                  </Tabs.Content>
                </div>
              </Tabs.Root>
            </div>

            {/* Footer with execution status */}
            {(isExecuting || executionResult) && (
              <div className="p-3 border-t border-bolt-elements-borderColor bg-bolt-elements-background-depth-2">
                <div className="flex items-center gap-2">
                  {isExecuting && <div className="i-svg-spinners:90-ring-with-bg text-blue-500 animate-spin" />}
                  <span className="text-sm text-bolt-elements-textPrimary">{executionResult}</span>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>

      {/* Plugin Manager */}
      <PluginManager isOpen={showPluginManager} onClose={() => setShowPluginManager(false)} />

      {/* Agent Analytics */}
      <AgentAnalytics agentResponse={agentResponse} isVisible={showAnalytics} onClose={() => setShowAnalytics(false)} />
    </Dialog.Root>
  );
}
