import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';
import { LazyMobileToolbar, LazyWrapper, LazyErrorBoundary } from '~/components/LazyComponents';
import { usePerformanceMonitor } from '~/lib/hooks/useOptimizedState';
import { ThemeProvider } from '~/components/ui/SmartThemeSystem';
import { SmoothTransition } from '~/components/ui/SmoothTransitions';
import BackgroundRays from '~/components/ui/BackgroundRays';

export const meta: MetaFunction = () => {
  return [
    { title: 'YOUSEF SH - AI Assistant' },
    { name: 'description', content: 'Talk with YOUSEF SH AI Assistant - Advanced AI-powered development tool' },
  ];
};

export const loader = () => json({});

/**
 * Landing page component for Bolt
 * Note: Settings functionality should ONLY be accessed through the sidebar menu.
 * Do not add settings button/panel to this landing page as it was intentionally removed
 * to keep the UI clean and consistent with the design system.
 */
export default function Index() {
  // مراقبة الأداء
  const { markRender } = usePerformanceMonitor('IndexPage');

  const handleExecuteCommand = (command: string) => {
    markRender('command-execution');
    console.log('Executing command from mobile toolbar:', command);

    // يمكن إضافة المزيد من المنطق هنا لتنفيذ الأوامر
  };

  return (
    <ThemeProvider>
      <LazyErrorBoundary>
        <SmoothTransition
          config={{
            type: 'fade',
            duration: 'normal',
            triggerOnMount: true,
            delay: 100,
          }}
          className="flex flex-col h-full w-full"
          style={{
            background: 'var(--theme-bg-primary)',
            color: 'var(--theme-text-primary)',
          }}
        >
          <BackgroundRays />
          <Header />
          <div className="flex-1 pb-20 md:pb-0">
            <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
          </div>
          <LazyWrapper>
            <ClientOnly>{() => <LazyMobileToolbar onExecuteCommand={handleExecuteCommand} />}</ClientOnly>
          </LazyWrapper>
        </SmoothTransition>
      </LazyErrorBoundary>
    </ThemeProvider>
  );
}
