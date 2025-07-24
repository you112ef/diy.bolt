import React, { lazy, Suspense, type ComponentType } from 'react';
import { classNames } from '~/utils/classNames';

// تحميل المكونات الثقيلة بشكل تدريجي
export const LazyControlPanel = lazy(() =>
  import('~/components/control-panel/ControlPanel').then((module) => ({
    default: module.ControlPanel,
  })),
);

export const LazyAgentThinkingDisplay = lazy(() =>
  import('~/components/agent/AgentThinkingDisplay').then((module) => ({
    default: module.AgentThinkingDisplay,
  })),
);

export const LazyMobileToolbar = lazy(() =>
  import('~/components/mobile/MobileToolbar').then((module) => ({
    default: module.MobileToolbar,
  })),
);

export const LazyAgentModeToggle = lazy(() =>
  import('~/components/agent/AgentModeToggle').then((module) => ({
    default: module.AgentModeToggle,
  })),
);

// مكون Loading محسّن
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={classNames('flex items-center justify-center p-4', className)}>
      <div
        className={classNames(
          'animate-spin rounded-full border-2 border-bolt-elements-borderColor border-t-blue-500',
          sizeClasses[size],
        )}
      />
    </div>
  );
}

// Wrapper للمكونات المحمّلة تدريجياً
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function LazyWrapper({ children, fallback, className }: LazyWrapperProps) {
  const defaultFallback = <LoadingSpinner className={className} />;

  return <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>;
}

// HOC لتحسين المكونات
export function withLazyLoading<T extends {}>(Component: ComponentType<T>, fallback?: React.ReactNode) {
  return function LazyComponent(props: T) {
    return (
      <LazyWrapper fallback={fallback}>
        <Component {...props} />
      </LazyWrapper>
    );
  };
}

// مكون محسّن للأخطاء
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center p-4 text-bolt-elements-textSecondary">
            <div className="text-center">
              <div className="i-ph:warning-duotone text-2xl mb-2 text-yellow-500" />
              <p className="text-sm">فشل في تحميل المكون</p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="mt-2 px-3 py-1 text-xs bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded hover:bg-bolt-elements-background-depth-3 transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
