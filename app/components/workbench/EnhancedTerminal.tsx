import { memo, useEffect, useRef, useState } from 'react';
import { classNames } from '~/utils/classNames';
import * as Tooltip from '@radix-ui/react-tooltip';

interface EnhancedTerminalProps {
  className?: string;
  onCommand?: (command: string) => void;
}

const LANGUAGE_COMMANDS = {
  javascript: {
    name: 'JavaScript/Node.js',
    icon: 'i-logos:nodejs-icon',
    commands: [
      { name: 'Run', cmd: 'node index.js', desc: 'تشغيل ملف JavaScript' },
      { name: 'Install', cmd: 'npm install', desc: 'تثبيت التبعيات' },
      { name: 'Dev', cmd: 'npm run dev', desc: 'تشغيل وضع التطوير' },
      { name: 'Build', cmd: 'npm run build', desc: 'بناء المشروع' },
      { name: 'Test', cmd: 'npm test', desc: 'تشغيل الاختبارات' },
    ],
  },
  typescript: {
    name: 'TypeScript',
    icon: 'i-logos:typescript-icon',
    commands: [
      { name: 'Compile', cmd: 'tsc', desc: 'تحويل TypeScript إلى JavaScript' },
      { name: 'Run', cmd: 'ts-node index.ts', desc: 'تشغيل ملف TypeScript مباشرة' },
      { name: 'Build', cmd: 'npm run build', desc: 'بناء المشروع' },
      { name: 'Type Check', cmd: 'tsc --noEmit', desc: 'فحص الأنواع' },
    ],
  },
  python: {
    name: 'Python',
    icon: 'i-logos:python',
    commands: [
      { name: 'Run', cmd: 'python main.py', desc: 'تشغيل ملف Python' },
      { name: 'Install', cmd: 'pip install -r requirements.txt', desc: 'تثبيت التبعيات' },
      { name: 'Virtual Env', cmd: 'python -m venv venv && source venv/bin/activate', desc: 'إنشاء بيئة افتراضية' },
      { name: 'Django Run', cmd: 'python manage.py runserver', desc: 'تشغيل خادم Django' },
      { name: 'Flask Run', cmd: 'flask run', desc: 'تشغيل تطبيق Flask' },
    ],
  },
  java: {
    name: 'Java',
    icon: 'i-logos:java',
    commands: [
      { name: 'Compile', cmd: 'javac Main.java', desc: 'تحويل Java إلى bytecode' },
      { name: 'Run', cmd: 'java Main', desc: 'تشغيل تطبيق Java' },
      { name: 'Maven Build', cmd: 'mvn clean install', desc: 'بناء مشروع Maven' },
      { name: 'Gradle Build', cmd: './gradlew build', desc: 'بناء مشروع Gradle' },
      { name: 'Spring Boot', cmd: 'mvn spring-boot:run', desc: 'تشغيل تطبيق Spring Boot' },
    ],
  },
  android: {
    name: 'Android',
    icon: 'i-logos:android-icon',
    commands: [
      { name: 'Build APK', cmd: './gradlew assembleDebug', desc: 'بناء APK للتطوير' },
      { name: 'Build Release', cmd: './gradlew assembleRelease', desc: 'بناء APK للإنتاج' },
      { name: 'Install', cmd: './gradlew installDebug', desc: 'تثبيت التطبيق على الجهاز' },
      { name: 'Clean', cmd: './gradlew clean', desc: 'تنظيف ملفات البناء' },
      { name: 'Test', cmd: './gradlew test', desc: 'تشغيل الاختبارات' },
    ],
  },
  flutter: {
    name: 'Flutter',
    icon: 'i-logos:flutter',
    commands: [
      { name: 'Run', cmd: 'flutter run', desc: 'تشغيل تطبيق Flutter' },
      { name: 'Build APK', cmd: 'flutter build apk', desc: 'بناء APK' },
      { name: 'Build iOS', cmd: 'flutter build ios', desc: 'بناء تطبيق iOS' },
      { name: 'Get Packages', cmd: 'flutter pub get', desc: 'تحديث التبعيات' },
      { name: 'Clean', cmd: 'flutter clean', desc: 'تنظيف المشروع' },
    ],
  },
  react: {
    name: 'React',
    icon: 'i-logos:react',
    commands: [
      { name: 'Start', cmd: 'npm start', desc: 'تشغيل خادم التطوير' },
      { name: 'Build', cmd: 'npm run build', desc: 'بناء للإنتاج' },
      { name: 'Test', cmd: 'npm test', desc: 'تشغيل الاختبارات' },
      { name: 'Eject', cmd: 'npm run eject', desc: 'إخراج إعدادات Webpack' },
    ],
  },
  docker: {
    name: 'Docker',
    icon: 'i-logos:docker-icon',
    commands: [
      { name: 'Build', cmd: 'docker build -t myapp .', desc: 'بناء صورة Docker' },
      { name: 'Run', cmd: 'docker run -p 3000:3000 myapp', desc: 'تشغيل حاوية' },
      { name: 'Compose Up', cmd: 'docker-compose up', desc: 'تشغيل خدمات متعددة' },
      { name: 'Compose Down', cmd: 'docker-compose down', desc: 'إيقاف الخدمات' },
      { name: 'List Images', cmd: 'docker images', desc: 'عرض الصور المتاحة' },
    ],
  },
  git: {
    name: 'Git',
    icon: 'i-logos:git-icon',
    commands: [
      { name: 'Status', cmd: 'git status', desc: 'عرض حالة المستودع' },
      { name: 'Add All', cmd: 'git add .', desc: 'إضافة جميع التغييرات' },
      { name: 'Commit', cmd: 'git commit -m "message"', desc: 'حفظ التغييرات' },
      { name: 'Push', cmd: 'git push origin main', desc: 'رفع التغييرات' },
      { name: 'Pull', cmd: 'git pull', desc: 'جلب التغييرات' },
    ],
  },
};

export const EnhancedTerminal = memo(({ className, onCommand }: EnhancedTerminalProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');
  const [customCommand, setCustomCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [isQuickCommandsOpen, setIsQuickCommandsOpen] = useState(false);

  const executeCommand = (command: string) => {
    setCommandHistory((prev) => [...prev, command]);
    onCommand?.(command);
  };

  const handleCustomCommand = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customCommand.trim()) {
      executeCommand(customCommand);
      setCustomCommand('');
    }
  };

  return (
    <div
      className={classNames(
        'bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-lg',
        className,
      )}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between p-3 border-b border-bolt-elements-borderColor">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-bolt-elements-textPrimary">Enhanced Terminal</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-1 text-sm bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor rounded text-bolt-elements-textPrimary"
          >
            {Object.entries(LANGUAGE_COMMANDS).map(([key, lang]) => (
              <option key={key} value={key}>
                {lang.name}
              </option>
            ))}
          </select>

          {/* Quick Commands Toggle */}
          <button
            onClick={() => setIsQuickCommandsOpen(!isQuickCommandsOpen)}
            className={classNames(
              'px-3 py-1 text-sm rounded border transition-all',
              isQuickCommandsOpen
                ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                : 'bg-bolt-elements-background-depth-3 border-bolt-elements-borderColor text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary',
            )}
          >
            Quick Commands
          </button>
        </div>
      </div>

      {/* Quick Commands Panel */}
      {isQuickCommandsOpen && (
        <div className="p-3 border-b border-bolt-elements-borderColor bg-bolt-elements-background-depth-1">
          <div className="flex items-center gap-2 mb-3">
            <div className={classNames((LANGUAGE_COMMANDS as any)[selectedLanguage]?.icon || 'i-ph:code', 'text-lg')} />
            <span className="font-medium text-bolt-elements-textPrimary">
              {(LANGUAGE_COMMANDS as any)[selectedLanguage]?.name || selectedLanguage} Commands
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {((LANGUAGE_COMMANDS as any)[selectedLanguage]?.commands || []).map((cmd: any, index: number) => (
              <Tooltip.Provider key={index}>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={() => executeCommand(cmd.cmd)}
                      className="flex flex-col items-center gap-1 p-3 rounded-lg bg-bolt-elements-background-depth-2 hover:bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor hover:border-bolt-elements-borderColorHover transition-all text-center"
                    >
                      <span className="text-sm font-medium text-bolt-elements-textPrimary">{cmd.name}</span>
                      <span className="text-xs text-bolt-elements-textSecondary font-mono">
                        {cmd.cmd.length > 15 ? cmd.cmd.substring(0, 15) + '...' : cmd.cmd}
                      </span>
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content className="bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary px-3 py-2 rounded-md text-sm shadow-lg border border-bolt-elements-borderColor max-w-xs">
                      <div className="font-medium mb-1">{cmd.desc}</div>
                      <div className="text-xs text-bolt-elements-textSecondary font-mono">{cmd.cmd}</div>
                      <Tooltip.Arrow className="fill-bolt-elements-background-depth-3" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            ))}
          </div>
        </div>
      )}

      {/* Custom Command Input */}
      <div className="p-3">
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-mono">$</span>
          <input
            type="text"
            value={customCommand}
            onChange={(e) => setCustomCommand(e.target.value)}
            onKeyDown={handleCustomCommand}
            placeholder="Enter command..."
            className="flex-1 bg-transparent outline-none text-bolt-elements-textPrimary font-mono text-sm"
          />
          <button
            onClick={() => customCommand.trim() && executeCommand(customCommand)}
            disabled={!customCommand.trim()}
            className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-bolt-elements-background-depth-3 disabled:text-bolt-elements-textSecondary text-white rounded transition-all"
          >
            Run
          </button>
        </div>

        {/* Command History */}
        {commandHistory.length > 0 && (
          <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
            {commandHistory.slice(-5).map((cmd, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <span className="text-green-400 font-mono">$</span>
                <span className="text-bolt-elements-textSecondary font-mono">{cmd}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
