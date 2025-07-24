export interface AdvancedTool {
  name: string;
  description: string;
  category: 'development' | 'build' | 'deploy' | 'test' | 'mobile' | 'ai';
  icon: string;
  command: string;
  languages?: string[];
  platforms?: string[];
}

export const ADVANCED_TOOLS: AdvancedTool[] = [
  // Frontend Development Tools
  {
    name: 'React App Builder',
    description: 'إنشاء تطبيق React كامل مع أفضل الممارسات',
    category: 'development',
    icon: 'i-logos:react',
    command: 'create-react-app',
    languages: ['javascript', 'typescript'],
    platforms: ['web'],
  },
  {
    name: 'Vue.js Project',
    description: 'إنشاء مشروع Vue.js مع Vite',
    category: 'development',
    icon: 'i-logos:vue',
    command: 'vue-create',
    languages: ['javascript', 'typescript'],
    platforms: ['web'],
  },
  {
    name: 'Next.js Full-Stack',
    description: 'إنشاء تطبيق Next.js كامل مع API Routes',
    category: 'development',
    icon: 'i-logos:nextjs-icon',
    command: 'nextjs-create',
    languages: ['javascript', 'typescript'],
    platforms: ['web', 'serverless'],
  },
  {
    name: 'Angular Application',
    description: 'إنشاء تطبيق Angular مع CLI',
    category: 'development',
    icon: 'i-logos:angular-icon',
    command: 'angular-create',
    languages: ['typescript'],
    platforms: ['web'],
  },

  // Backend Development Tools
  {
    name: 'Node.js API Server',
    description: 'إنشاء خادم API باستخدام Express.js',
    category: 'development',
    icon: 'i-logos:nodejs-icon',
    command: 'nodejs-api',
    languages: ['javascript', 'typescript'],
    platforms: ['server'],
  },
  {
    name: 'Python FastAPI',
    description: 'إنشاء API سريع باستخدام FastAPI',
    category: 'development',
    icon: 'i-logos:python',
    command: 'fastapi-create',
    languages: ['python'],
    platforms: ['server'],
  },
  {
    name: 'Django Project',
    description: 'إنشاء مشروع Django كامل',
    category: 'development',
    icon: 'i-logos:django-icon',
    command: 'django-create',
    languages: ['python'],
    platforms: ['server'],
  },
  {
    name: 'Spring Boot API',
    description: 'إنشاء API باستخدام Spring Boot',
    category: 'development',
    icon: 'i-logos:spring-icon',
    command: 'spring-boot-create',
    languages: ['java'],
    platforms: ['server'],
  },
  {
    name: 'Go Web Server',
    description: 'إنشاء خادم ويب باستخدام Go',
    category: 'development',
    icon: 'i-logos:go',
    command: 'go-server-create',
    languages: ['go'],
    platforms: ['server'],
  },
  {
    name: 'Rust Web API',
    description: 'إنشاء API باستخدام Actix-web',
    category: 'development',
    icon: 'i-logos:rust',
    command: 'rust-api-create',
    languages: ['rust'],
    platforms: ['server'],
  },

  // Mobile Development Tools
  {
    name: 'React Native App',
    description: 'إنشاء تطبيق React Native للأندرويد و iOS',
    category: 'mobile',
    icon: 'i-logos:react',
    command: 'react-native-create',
    languages: ['javascript', 'typescript'],
    platforms: ['android', 'ios'],
  },
  {
    name: 'Flutter Application',
    description: 'إنشاء تطبيق Flutter متعدد المنصات',
    category: 'mobile',
    icon: 'i-logos:flutter',
    command: 'flutter-create',
    languages: ['dart'],
    platforms: ['android', 'ios', 'web'],
  },
  {
    name: 'Native Android App',
    description: 'إنشاء تطبيق أندرويد أصلي بـ Kotlin',
    category: 'mobile',
    icon: 'i-logos:android-icon',
    command: 'android-native-create',
    languages: ['kotlin', 'java'],
    platforms: ['android'],
  },
  {
    name: 'Ionic Hybrid App',
    description: 'إنشاء تطبيق هجين باستخدام Ionic',
    category: 'mobile',
    icon: 'i-logos:ionic-icon',
    command: 'ionic-create',
    languages: ['typescript'],
    platforms: ['android', 'ios', 'web'],
  },

  // Build Tools
  {
    name: 'Webpack Bundle',
    description: 'تحزيم المشروع باستخدام Webpack',
    category: 'build',
    icon: 'i-logos:webpack',
    command: 'webpack-build',
    languages: ['javascript', 'typescript'],
    platforms: ['web'],
  },
  {
    name: 'Vite Build',
    description: 'بناء سريع باستخدام Vite',
    category: 'build',
    icon: 'i-logos:vitejs',
    command: 'vite-build',
    languages: ['javascript', 'typescript'],
    platforms: ['web'],
  },
  {
    name: 'Docker Container',
    description: 'إنشاء حاوية Docker للتطبيق',
    category: 'build',
    icon: 'i-logos:docker-icon',
    command: 'docker-build',
    languages: ['any'],
    platforms: ['any'],
  },
  {
    name: 'Android APK Build',
    description: 'بناء ملف APK للأندرويد',
    category: 'build',
    icon: 'i-logos:android-icon',
    command: 'android-build-apk',
    languages: ['kotlin', 'java', 'dart'],
    platforms: ['android'],
  },

  // Testing Tools
  {
    name: 'Jest Unit Tests',
    description: 'إنشاء وتشغيل اختبارات الوحدة',
    category: 'test',
    icon: 'i-logos:jest',
    command: 'jest-test',
    languages: ['javascript', 'typescript'],
    platforms: ['any'],
  },
  {
    name: 'Cypress E2E Tests',
    description: 'اختبارات النهاية إلى النهاية',
    category: 'test',
    icon: 'i-logos:cypress-icon',
    command: 'cypress-test',
    languages: ['javascript', 'typescript'],
    platforms: ['web'],
  },
  {
    name: 'Playwright Tests',
    description: 'اختبارات متصفح متقدمة',
    category: 'test',
    icon: 'i-logos:playwright',
    command: 'playwright-test',
    languages: ['javascript', 'typescript'],
    platforms: ['web'],
  },

  // Deployment Tools
  {
    name: 'Vercel Deploy',
    description: 'نشر التطبيق على Vercel',
    category: 'deploy',
    icon: 'i-logos:vercel-icon',
    command: 'vercel-deploy',
    languages: ['any'],
    platforms: ['web'],
  },
  {
    name: 'Netlify Deploy',
    description: 'نشر التطبيق على Netlify',
    category: 'deploy',
    icon: 'i-logos:netlify',
    command: 'netlify-deploy',
    languages: ['any'],
    platforms: ['web'],
  },
  {
    name: 'Firebase Deploy',
    description: 'نشر على Firebase Hosting',
    category: 'deploy',
    icon: 'i-logos:firebase',
    command: 'firebase-deploy',
    languages: ['any'],
    platforms: ['web', 'mobile'],
  },
  {
    name: 'AWS Deploy',
    description: 'نشر على Amazon Web Services',
    category: 'deploy',
    icon: 'i-logos:aws',
    command: 'aws-deploy',
    languages: ['any'],
    platforms: ['any'],
  },
  {
    name: 'Google Play Store',
    description: 'نشر التطبيق على متجر Google Play',
    category: 'deploy',
    icon: 'i-logos:google-play-icon',
    command: 'playstore-deploy',
    languages: ['kotlin', 'java', 'dart'],
    platforms: ['android'],
  },

  // AI Tools
  {
    name: 'AI Code Generator',
    description: 'توليد كود ذكي باستخدام الذكاء الاصطناعي',
    category: 'ai',
    icon: 'i-ph:robot-duotone',
    command: 'ai-code-generate',
    languages: ['any'],
    platforms: ['any'],
  },
  {
    name: 'Code Optimizer',
    description: 'تحسين الكود تلقائياً',
    category: 'ai',
    icon: 'i-ph:lightning-duotone',
    command: 'ai-optimize',
    languages: ['any'],
    platforms: ['any'],
  },
  {
    name: 'Bug Detector',
    description: 'اكتشاف الأخطاء تلقائياً',
    category: 'ai',
    icon: 'i-ph:bug-duotone',
    command: 'ai-bug-detect',
    languages: ['any'],
    platforms: ['any'],
  },
];

export function getToolsByCategory(category: string): AdvancedTool[] {
  return ADVANCED_TOOLS.filter((tool) => tool.category === category);
}

export function getToolsByLanguage(language: string): AdvancedTool[] {
  return ADVANCED_TOOLS.filter((tool) => tool.languages?.includes(language) || tool.languages?.includes('any'));
}

export function getToolsByPlatform(platform: string): AdvancedTool[] {
  return ADVANCED_TOOLS.filter((tool) => tool.platforms?.includes(platform) || tool.platforms?.includes('any'));
}

export function searchTools(query: string): AdvancedTool[] {
  const lowerQuery = query.toLowerCase();
  return ADVANCED_TOOLS.filter(
    (tool) => tool.name.toLowerCase().includes(lowerQuery) || tool.description.toLowerCase().includes(lowerQuery),
  );
}
