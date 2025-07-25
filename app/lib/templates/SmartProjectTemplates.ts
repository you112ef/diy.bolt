import { createScopedLogger } from '~/utils/logger';
import { smartCache } from '~/lib/cache/SmartCacheManager';

// import pluginSystem from '~/lib/plugins/PluginSystem';

const logger = createScopedLogger('SmartProjectTemplates');

// أنواع المشاريع المختلفة
export type ProjectType =
  | 'web-app'
  | 'mobile-app'
  | 'desktop-app'
  | 'api-server'
  | 'microservice'
  | 'library'
  | 'cli-tool'
  | 'game'
  | 'ai-project'
  | 'blockchain';

// تقنيات التطوير
export type Technology =
  | 'react'
  | 'vue'
  | 'angular'
  | 'svelte'
  | 'nextjs'
  | 'nuxtjs'
  | 'gatsby'
  | 'react-native'
  | 'flutter'
  | 'ionic'
  | 'electron'
  | 'tauri'
  | 'nodejs'
  | 'express'
  | 'fastify'
  | 'nestjs'
  | 'typescript'
  | 'vite'
  | 'python'
  | 'django'
  | 'flask'
  | 'fastapi'
  | 'rust'
  | 'go'
  | 'java'
  | 'spring'
  | 'dotnet'
  | 'php'
  | 'laravel'
  | 'unity'
  | 'unreal'
  | 'tensorflow'
  | 'pytorch'
  | 'solidity'
  | 'web3';

// مستوى التعقيد
export type ComplexityLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// ميزات المشروع
export interface ProjectFeature {
  id: string;
  name: string;
  description: string;
  dependencies: string[];
  files: ProjectFile[];
  configuration: Record<string, any>;
  optional: boolean;
  category: 'core' | 'ui' | 'backend' | 'database' | 'auth' | 'testing' | 'deployment';
}

// ملفات المشروع
export interface ProjectFile {
  path: string;
  _content: string;
  type: 'code' | 'config' | 'documentation' | 'asset';
  executable?: boolean;
}

// قالب المشروع
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  technologies: Technology[];
  complexity: ComplexityLevel;
  tags: string[];
  features: ProjectFeature[];
  baseFiles: ProjectFile[];
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  configuration: {
    buildTool?: string;
    testFramework?: string;
    linter?: string;
    formatter?: string;
    bundler?: string;
  };
  estimatedTime: number; // بالدقائق
  difficulty: number; // 1-10
  popularity: number;
  lastUpdated: Date;
  author: string;
  license: string;
  repository?: string;
  demo?: string;
  tutorial?: string;
}

// خيارات إنشاء المشروع
export interface ProjectCreationOptions {
  name: string;
  description?: string;
  directory?: string;
  features: string[];
  customizations: Record<string, any>;
  skipInstall?: boolean;
  initGit?: boolean;
  setupCI?: boolean;
}

// نتيجة إنشاء المشروع
export interface ProjectCreationResult {
  success: boolean;
  _projectPath: string;
  filesCreated: string[];
  scriptsAvailable: string[];
  nextSteps: string[];
  estimatedSetupTime: number;
  error?: string;
}

// مدير القوالب الذكية
export class SmartProjectTemplates {
  private templates = new Map<string, ProjectTemplate>();
  private userPreferences: Record<string, any> = {};
  private isInitialized = false;

  constructor() {
    this.loadUserPreferences();
  }

  // تهيئة النظام
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      logger.info('Initializing smart project templates');

      // تحميل القوالب المدمجة
      await this.loadBuiltinTemplates();

      // تحميل القوالب المخصصة
      await this.loadCustomTemplates();

      // تحميل تفضيلات المستخدم
      await this.loadUserPreferences();

      this.isInitialized = true;
      logger.info('Smart project templates initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize smart project templates', { error });
      throw error;
    }
  }

  // الحصول على جميع القوالب
  getAllTemplates(): ProjectTemplate[] {
    return Array.from(this.templates.values());
  }

  // البحث في القوالب
  searchTemplates(
    query: string,
    filters?: {
      type?: ProjectType;
      technologies?: Technology[];
      complexity?: ComplexityLevel;
      tags?: string[];
    },
  ): ProjectTemplate[] {
    let results = Array.from(this.templates.values());

    // البحث النصي
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(
        (template) =>
          template.name.toLowerCase().includes(lowerQuery) ||
          template.description.toLowerCase().includes(lowerQuery) ||
          template.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
      );
    }

    // تطبيق المرشحات
    if (filters) {
      if (filters.type) {
        results = results.filter((t) => t.type === filters.type);
      }

      if (filters.technologies && filters.technologies.length > 0) {
        results = results.filter((t) => filters.technologies!.some((tech) => t.technologies.includes(tech)));
      }

      if (filters.complexity) {
        results = results.filter((t) => t.complexity === filters.complexity);
      }

      if (filters.tags && filters.tags.length > 0) {
        results = results.filter((t) => filters.tags!.some((tag) => t.tags.includes(tag)));
      }
    }

    // ترتيب النتائج حسب الشعبية والملاءمة
    return results.sort((a, b) => {
      // تفضيل القوالب المستخدمة مؤخراً
      const aRecentlyUsed = this.isRecentlyUsed(a.id);
      const bRecentlyUsed = this.isRecentlyUsed(b.id);

      if (aRecentlyUsed && !bRecentlyUsed) {
        return -1;
      }

      if (!aRecentlyUsed && bRecentlyUsed) {
        return 1;
      }

      // ترتيب حسب الشعبية
      return b.popularity - a.popularity;
    });
  }

  // الحصول على قوالب مقترحة بناءً على تاريخ المستخدم
  getRecommendedTemplates(limit: number = 6): ProjectTemplate[] {
    const preferences = this.userPreferences;
    const allTemplates = Array.from(this.templates.values());

    // حساب نقاط التوصية لكل قالب
    const scored = allTemplates.map((template) => {
      let score = template.popularity;

      // زيادة النقاط للتقنيات المفضلة
      if (preferences.preferredTechnologies) {
        const techMatches = template.technologies.filter((tech) =>
          preferences.preferredTechnologies.includes(tech),
        ).length;
        score += techMatches * 10;
      }

      // زيادة النقاط لنوع المشروع المفضل
      if (preferences.preferredProjectTypes?.includes(template.type)) {
        score += 15;
      }

      // زيادة النقاط لمستوى التعقيد المناسب
      if (preferences.skillLevel === template.complexity) {
        score += 8;
      }

      // تقليل النقاط للقوالب المستخدمة مؤخراً لتنويع التوصيات
      if (this.isRecentlyUsed(template.id)) {
        score -= 5;
      }

      return { template, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.template);
  }

  // الحصول على قالب محدد
  getTemplate(id: string): ProjectTemplate | undefined {
    return this.templates.get(id);
  }

  // إنشاء مشروع من قالب
  async createProject(templateId: string, options: ProjectCreationOptions): Promise<ProjectCreationResult> {
    const template = this.templates.get(templateId);

    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    try {
      logger.info('Creating project from template', { templateId, projectName: options.name });

      const startTime = Date.now();
      const _projectPath = options.directory || `./${options.name}`;
      const filesCreated: string[] = [];

      // إنشاء هيكل المشروع
      await this.createProjectStructure(template, options, _projectPath, filesCreated);

      // تطبيق التخصيصات
      await this.applyCustomizations(template, options, _projectPath);

      // تثبيت التبعيات
      if (!options.skipInstall) {
        await this.installDependencies(template, _projectPath);
      }

      // تهيئة Git
      if (options.initGit) {
        await this.initializeGit(_projectPath);
      }

      // إعداد CI/CD
      if (options.setupCI) {
        await this.setupContinuousIntegration(template, _projectPath);
      }

      // تسجيل الاستخدام
      await this.recordTemplateUsage(templateId);

      const executionTime = Date.now() - startTime;

      const result: ProjectCreationResult = {
        success: true,
        _projectPath,
        filesCreated,
        scriptsAvailable: Object.keys(template.scripts),
        nextSteps: this.generateNextSteps(template, options),
        estimatedSetupTime: Math.ceil(executionTime / 1000),
      };

      logger.info('Project created successfully', { templateId, projectName: options.name, executionTime });

      return result;
    } catch (error) {
      logger.error('Failed to create project', { templateId, error });
      return {
        success: false,
        _projectPath: '',
        filesCreated: [],
        scriptsAvailable: [],
        nextSteps: [],
        estimatedSetupTime: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // إضافة قالب مخصص
  async addCustomTemplate(template: ProjectTemplate): Promise<void> {
    try {
      // التحقق من صحة القالب
      this.validateTemplate(template);

      // حفظ القالب
      this.templates.set(template.id, template);

      // حفظ في التخزين المؤقت
      await this.saveCustomTemplates();

      logger.info('Custom template added successfully', { templateId: template.id });
    } catch (error) {
      logger.error('Failed to add custom template', { templateId: template.id, error });
      throw error;
    }
  }

  // حذف قالب مخصص
  async removeCustomTemplate(templateId: string): Promise<void> {
    if (!this.templates.has(templateId)) {
      throw new Error(`Template ${templateId} not found`);
    }

    try {
      this.templates.delete(templateId);
      await this.saveCustomTemplates();

      logger.info('Custom template removed successfully', { templateId });
    } catch (error) {
      logger.error('Failed to remove custom template', { templateId, error });
      throw error;
    }
  }

  // تحديث تفضيلات المستخدم
  async updateUserPreferences(preferences: Partial<typeof this.userPreferences>): Promise<void> {
    this.userPreferences = { ...this.userPreferences, ...preferences };

    smartCache.set('user-project-preferences', this.userPreferences, {
      ttl: 365 * 24 * 60 * 60 * 1000, // سنة واحدة
    });

    logger.info('User preferences updated', { preferences });
  }

  // الحصول على إحصائيات الاستخدام
  getUsageStats() {
    const usageHistory = smartCache.get<any[]>('template-usage-history') || [];
    const templates = Array.from(this.templates.values());

    return {
      totalTemplates: templates.length,
      totalProjects: usageHistory.length,
      popularTemplates: templates
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 5)
        .map((t) => ({ id: t.id, name: t.name, usage: t.popularity })),
      recentActivity: usageHistory.slice(-10).map((entry) => ({
        templateId: entry.templateId,
        projectName: entry.projectName,
        date: entry.date,
      })),
      technologiesUsed: this.getTechnologyStats(usageHistory),
      projectTypes: this.getProjectTypeStats(templates),
    };
  }

  // تحميل القوالب المدمجة
  private async loadBuiltinTemplates(): Promise<void> {
    const builtinTemplates: ProjectTemplate[] = [
      {
        id: 'react-vite-app',
        name: 'React + Vite App',
        description: 'تطبيق React حديث مع Vite وTypeScript',
        type: 'web-app',
        technologies: ['react', 'typescript', 'vite'],
        complexity: 'beginner',
        tags: ['frontend', 'spa', 'modern'],
        features: [],
        baseFiles: [
          {
            path: 'package.json',
            _content: JSON.stringify(
              {
                name: '{{projectName}}',
                version: '1.0.0',
                type: 'module',
                scripts: {
                  dev: 'vite',
                  build: 'tsc && vite build',
                  preview: 'vite preview',
                },
                dependencies: {
                  react: '^18.2.0',
                  'react-dom': '^18.2.0',
                },
                devDependencies: {
                  '@types/react': '^18.2.0',
                  '@types/react-dom': '^18.2.0',
                  '@vitejs/plugin-react': '^4.0.0',
                  typescript: '^5.0.0',
                  vite: '^4.4.0',
                },
              },
              null,
              2,
            ),
            type: 'config',
          },
          {
            path: 'src/App.tsx',
            _content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>مرحباً بك في {{projectName}}</h1>
        <p>تطبيق React حديث مع Vite وTypeScript</p>
      </header>
    </div>
  );
}

export default App;`,
            type: 'code',
          },
          {
            path: 'src/main.tsx',
            _content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);`,
            type: 'code',
          },
          {
            path: 'index.html',
            _content: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" _content="width=device-width, initial-scale=1.0" />
    <title>{{projectName}}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
            type: 'code',
          },
          {
            path: 'README.md',
            _content: `# {{projectName}}

{{projectDescription}}

## البدء السريع

\`\`\`bash
npm install
npm run dev
\`\`\`

## البناء للإنتاج

\`\`\`bash
npm run build
\`\`\`

## المعاينة

\`\`\`bash
npm run preview
\`\`\``,
            type: 'documentation',
          },
        ],
        scripts: {
          dev: 'vite',
          build: 'tsc && vite build',
          preview: 'vite preview',
        },
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0',
        },
        devDependencies: {
          '@types/react': '^18.2.0',
          '@types/react-dom': '^18.2.0',
          '@vitejs/plugin-react': '^4.0.0',
          typescript: '^5.0.0',
          vite: '^4.4.0',
        },
        configuration: {
          buildTool: 'vite',
          bundler: 'vite',
        },
        estimatedTime: 5,
        difficulty: 3,
        popularity: 95,
        lastUpdated: new Date(),
        author: 'Bolt AI',
        license: 'MIT',
      },
      {
        id: 'nextjs-app',
        name: 'Next.js App',
        description: 'تطبيق Next.js مع TypeScript وTailwind CSS',
        type: 'web-app',
        technologies: ['nextjs', 'react', 'typescript'],
        complexity: 'intermediate',
        tags: ['fullstack', 'ssr', 'modern'],
        features: [],
        baseFiles: [
          {
            path: 'package.json',
            _content: JSON.stringify(
              {
                name: '{{projectName}}',
                version: '0.1.0',
                private: true,
                scripts: {
                  dev: 'next dev',
                  build: 'next build',
                  start: 'next start',
                  lint: 'next lint',
                },
                dependencies: {
                  next: '14.0.0',
                  react: '^18',
                  'react-dom': '^18',
                },
                devDependencies: {
                  '@types/node': '^20',
                  '@types/react': '^18',
                  '@types/react-dom': '^18',
                  eslint: '^8',
                  'eslint-config-next': '14.0.0',
                  typescript: '^5',
                },
              },
              null,
              2,
            ),
            type: 'config',
          },
          {
            path: 'app/page.tsx',
            _content: `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center">
          مرحباً بك في {{projectName}}
        </h1>
        <p className="text-center mt-4">
          تطبيق Next.js حديث مع TypeScript
        </p>
      </div>
    </main>
  );
}`,
            type: 'code',
          },
          {
            path: 'app/layout.tsx',
            _content: `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '{{projectName}}',
  description: '{{projectDescription}}',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>{children}</body>
    </html>
  );
}`,
            type: 'code',
          },
        ],
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint',
        },
        dependencies: {
          next: '14.0.0',
          react: '^18',
          'react-dom': '^18',
        },
        devDependencies: {
          '@types/node': '^20',
          '@types/react': '^18',
          '@types/react-dom': '^18',
          eslint: '^8',
          'eslint-config-next': '14.0.0',
          typescript: '^5',
        },
        configuration: {
          buildTool: 'next',
          bundler: 'webpack',
        },
        estimatedTime: 8,
        difficulty: 5,
        popularity: 88,
        lastUpdated: new Date(),
        author: 'Bolt AI',
        license: 'MIT',
      },
      {
        id: 'express-api',
        name: 'Express.js API',
        description: 'API REST مع Express.js وTypeScript وMongoDB',
        type: 'api-server',
        technologies: ['nodejs', 'express', 'typescript'],
        complexity: 'intermediate',
        tags: ['backend', 'api', 'rest'],
        features: [],
        baseFiles: [
          {
            path: 'package.json',
            _content: JSON.stringify(
              {
                name: '{{projectName}}',
                version: '1.0.0',
                description: '{{projectDescription}}',
                main: 'dist/index.js',
                scripts: {
                  dev: 'ts-node-dev --respawn --transpile-only src/index.ts',
                  build: 'tsc',
                  start: 'node dist/index.js',
                  test: 'jest',
                },
                dependencies: {
                  express: '^4.18.0',
                  cors: '^2.8.5',
                  helmet: '^7.0.0',
                  morgan: '^1.10.0',
                },
                devDependencies: {
                  '@types/express': '^4.17.0',
                  '@types/cors': '^2.8.0',
                  '@types/morgan': '^1.9.0',
                  '@types/node': '^20.0.0',
                  'ts-node-dev': '^2.0.0',
                  typescript: '^5.0.0',
                },
              },
              null,
              2,
            ),
            type: 'config',
          },
          {
            path: 'src/index.ts',
            _content: `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'مرحباً بك في {{projectName}} API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
});`,
            type: 'code',
          },
        ],
        scripts: {
          dev: 'ts-node-dev --respawn --transpile-only src/index.ts',
          build: 'tsc',
          start: 'node dist/index.js',
          test: 'jest',
        },
        dependencies: {
          express: '^4.18.0',
          cors: '^2.8.5',
          helmet: '^7.0.0',
          morgan: '^1.10.0',
        },
        devDependencies: {
          '@types/express': '^4.17.0',
          '@types/cors': '^2.8.0',
          '@types/morgan': '^1.9.0',
          '@types/node': '^20.0.0',
          'ts-node-dev': '^2.0.0',
          typescript: '^5.0.0',
        },
        configuration: {
          buildTool: 'tsc',
          testFramework: 'jest',
        },
        estimatedTime: 10,
        difficulty: 6,
        popularity: 78,
        lastUpdated: new Date(),
        author: 'Bolt AI',
        license: 'MIT',
      },
    ];

    for (const template of builtinTemplates) {
      this.templates.set(template.id, template);
    }
  }

  // تحميل القوالب المخصصة
  private async loadCustomTemplates(): Promise<void> {
    try {
      const customTemplates = smartCache.get<ProjectTemplate[]>('custom-project-templates') || [];

      for (const template of customTemplates) {
        this.templates.set(template.id, template);
      }

      logger.debug('Custom templates loaded', { count: customTemplates.length });
    } catch (error) {
      logger.error('Failed to load custom templates', { error });
    }
  }

  // حفظ القوالب المخصصة
  private async saveCustomTemplates(): Promise<void> {
    try {
      const customTemplates = Array.from(this.templates.values()).filter((t) => t.author !== 'Bolt AI'); // حفظ القوالب المخصصة فقط

      smartCache.set('custom-project-templates', customTemplates, {
        ttl: 365 * 24 * 60 * 60 * 1000, // سنة واحدة
      });
    } catch (error) {
      logger.error('Failed to save custom templates', { error });
    }
  }

  // تحميل تفضيلات المستخدم
  private loadUserPreferences(): void {
    this.userPreferences = smartCache.get('user-project-preferences') || {
      preferredTechnologies: ['react', 'typescript', 'nodejs'],
      preferredProjectTypes: ['web-app', 'api-server'],
      skillLevel: 'intermediate',
      autoInstallDependencies: true,
      initGitByDefault: true,
    };
  }

  // التحقق من استخدام القالب مؤخراً
  private isRecentlyUsed(templateId: string): boolean {
    const usageHistory = smartCache.get<any[]>('template-usage-history') || [];
    const recentUsage = usageHistory.find(
      (entry) =>
        entry.templateId === templateId && Date.now() - new Date(entry.date).getTime() < 7 * 24 * 60 * 60 * 1000, // آخر 7 أيام
    );

    return !!recentUsage;
  }

  // تسجيل استخدام القالب
  private async recordTemplateUsage(templateId: string): Promise<void> {
    const usageHistory = smartCache.get<any[]>('template-usage-history') || [];

    usageHistory.push({
      templateId,
      date: new Date().toISOString(),
      projectName: `project-${Date.now()}`,
    });

    // الاحتفاظ بآخر 100 استخدام
    const limitedHistory = usageHistory.slice(-100);

    smartCache.set('template-usage-history', limitedHistory, {
      ttl: 365 * 24 * 60 * 60 * 1000, // سنة واحدة
    });

    // تحديث شعبية القالب
    const template = this.templates.get(templateId);

    if (template) {
      template.popularity += 1;
    }
  }

  // إنشاء هيكل المشروع
  private async createProjectStructure(
    template: ProjectTemplate,
    options: ProjectCreationOptions,
    _projectPath: string,
    filesCreated: string[],
  ): Promise<void> {
    // محاكاة إنشاء الملفات
    for (const file of template.baseFiles) {
      const _content = this.processFileTemplate(file._content, {
        projectName: options.name,
        projectDescription: options.description || `مشروع ${options.name}`,
      });

      filesCreated.push(`${_projectPath}/${file.path}`);
      logger.debug('File created', { path: file.path });
    }
  }

  // معالجة قالب الملف
  private processFileTemplate(_content: string, variables: Record<string, string>): string {
    let processed = _content;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      processed = processed.replace(new RegExp(placeholder, 'g'), value);
    }

    return processed;
  }

  // تطبيق التخصيصات
  private async applyCustomizations(
    template: ProjectTemplate,
    options: ProjectCreationOptions,
    _projectPath: string,
  ): Promise<void> {
    // تطبيق الميزات المحددة
    for (const featureId of options.features) {
      const feature = template.features.find((f) => f.id === featureId);

      if (feature) {
        logger.debug('Applying feature', { featureId });

        // تطبيق الميزة
      }
    }
  }

  // تثبيت التبعيات
  private async installDependencies(template: ProjectTemplate, _projectPath: string): Promise<void> {
    logger.info('Installing dependencies', { _projectPath });

    // محاكاة تثبيت التبعيات
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // تهيئة Git
  private async initializeGit(_projectPath: string): Promise<void> {
    logger.info('Initializing Git repository', { _projectPath });

    // محاكاة تهيئة Git
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // إعداد CI/CD
  private async setupContinuousIntegration(template: ProjectTemplate, _projectPath: string): Promise<void> {
    logger.info('Setting up CI/CD', { _projectPath });

    // محاكاة إعداد CI/CD
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // إنتاج خطوات ما بعد الإنشاء
  private generateNextSteps(template: ProjectTemplate, options: ProjectCreationOptions): string[] {
    const steps = [`cd ${options.name}`, 'تحقق من ملف README.md للحصول على تعليمات مفصلة'];

    if (options.skipInstall) {
      steps.push('npm install # لتثبيت التبعيات');
    }

    if (template.scripts.dev) {
      steps.push(`${template.scripts.dev} # لبدء التطوير`);
    }

    return steps;
  }

  // التحقق من صحة القالب
  private validateTemplate(template: ProjectTemplate): void {
    if (!template.id || !template.name || !template.type) {
      throw new Error('Template must have id, name, and type');
    }

    if (this.templates.has(template.id)) {
      throw new Error(`Template with id ${template.id} already exists`);
    }
  }

  // إحصائيات التقنيات
  private getTechnologyStats(usageHistory: any[]) {
    const techCount: Record<string, number> = {};

    for (const entry of usageHistory) {
      const template = this.templates.get(entry.templateId);

      if (template) {
        for (const tech of template.technologies) {
          techCount[tech] = (techCount[tech] || 0) + 1;
        }
      }
    }

    return Object.entries(techCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tech, count]) => ({ technology: tech, count }));
  }

  // إحصائيات أنواع المشاريع
  private getProjectTypeStats(templates: ProjectTemplate[]) {
    const typeCount: Record<string, number> = {};

    for (const template of templates) {
      typeCount[template.type] = (typeCount[template.type] || 0) + 1;
    }

    return Object.entries(typeCount).map(([type, count]) => ({ type, count }));
  }
}

// إنشاء مثيل مشترك
export const smartProjectTemplates = new SmartProjectTemplates();

// تهيئة النظام عند التحميل
if (typeof window !== 'undefined') {
  smartProjectTemplates.initialize().catch((error) => {
    logger.error('Failed to initialize smart project templates', { error });
  });
}
