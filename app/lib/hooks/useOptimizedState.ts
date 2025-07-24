import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('OptimizedState');

// Hook محسّن للحالة مع memoization
export function useOptimizedState<T>(initialValue: T, equalityFn?: (prev: T, next: T) => boolean) {
  const [state, setState] = useState<T>(initialValue);
  const prevStateRef = useRef<T>(initialValue);

  const optimizedSetState = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setState((prevState) => {
        const nextState = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prevState) : newValue;

        // تحسين: تجنب إعادة الرندر إذا لم تتغير القيمة
        const isEqual = equalityFn ? equalityFn(prevState, nextState) : Object.is(prevState, nextState);

        if (isEqual) {
          return prevState;
        }

        prevStateRef.current = nextState;

        return nextState;
      });
    },
    [equalityFn],
  );

  return [state, optimizedSetState] as const;
}

// Hook للتخزين المؤقت الذكي
export function useMemoizedValue<T>(
  factory: () => T,
  deps: React.DependencyList,
  options?: {
    maxAge?: number;
    onExpire?: () => void;
  },
) {
  const cacheRef = useRef<{
    value: T;
    timestamp: number;
    deps: React.DependencyList;
  } | null>(null);

  return useMemo(() => {
    const now = Date.now();
    const maxAge = options?.maxAge || Infinity;

    // فحص إذا كان التخزين المؤقت صالح
    if (cacheRef.current) {
      const isExpired = now - cacheRef.current.timestamp > maxAge;
      const depsChanged = !deps.every((dep, index) => Object.is(dep, cacheRef.current!.deps[index]));

      if (!isExpired && !depsChanged) {
        return cacheRef.current.value;
      }

      if (isExpired && options?.onExpire) {
        options.onExpire();
      }
    }

    // إنشاء قيمة جديدة
    const newValue = factory();
    cacheRef.current = {
      value: newValue,
      timestamp: now,
      deps: [...deps],
    };

    logger.debug('Memoized value updated', { timestamp: now });

    return newValue;
  }, deps);
}

// Hook لتحسين العمليات المكلفة
export function useExpensiveComputation<T, Args extends any[]>(
  computeFn: (...args: Args) => T,
  deps: React.DependencyList,
  options?: {
    debounceMs?: number;
    maxCacheSize?: number;
  },
) {
  const cacheRef = useRef<Map<string, { value: T; timestamp: number }>>(new Map());
  const debounceRef = useRef<NodeJS.Timeout>();
  const [result, setResult] = useState<T | null>(null);
  const [isComputing, setIsComputing] = useState(false);

  const debouncedCompute = useCallback(
    (...args: Args) => {
      const debounceMs = options?.debounceMs || 0;
      const maxCacheSize = options?.maxCacheSize || 100;

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        setIsComputing(true);

        try {
          // إنشاء مفتاح للتخزين المؤقت
          const cacheKey = JSON.stringify({ args, deps });

          // فحص التخزين المؤقت
          if (cacheRef.current.has(cacheKey)) {
            const cached = cacheRef.current.get(cacheKey)!;
            setResult(cached.value);
            setIsComputing(false);

            return;
          }

          // حساب القيمة الجديدة
          const newValue = computeFn(...args);

          // تنظيف التخزين المؤقت إذا تجاوز الحد الأقصى
          if (cacheRef.current.size >= maxCacheSize) {
            const oldestKey = cacheRef.current.keys().next().value;

            if (oldestKey) {
              cacheRef.current.delete(oldestKey);
            }
          }

          // حفظ في التخزين المؤقت
          cacheRef.current.set(cacheKey, {
            value: newValue,
            timestamp: Date.now(),
          });

          setResult(newValue);
        } catch (error) {
          logger.error('Expensive computation failed', { error });
        } finally {
          setIsComputing(false);
        }
      }, debounceMs);
    },
    [computeFn, ...deps],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    compute: debouncedCompute,
    result,
    isComputing,
    clearCache: useCallback(() => {
      cacheRef.current.clear();
    }, []),
  };
}

// Hook لتحسين القوائم الكبيرة
export function useVirtualizedList<T>(
  items: T[],
  options: {
    itemHeight: number;
    containerHeight: number;
    overscan?: number;
  },
) {
  const [scrollTop, setScrollTop] = useState(0);
  const { itemHeight, containerHeight, overscan = 5 } = options;

  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(visibleStart + Math.ceil(containerHeight / itemHeight), items.length - 1);

    return {
      start: Math.max(0, visibleStart - overscan),
      end: Math.min(items.length - 1, visibleEnd + overscan),
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1).map((item, index) => ({
      item,
      index: visibleRange.start + index,
      style: {
        position: 'absolute' as const,
        top: (visibleRange.start + index) * itemHeight,
        height: itemHeight,
        width: '100%',
      },
    }));
  }, [items, visibleRange, itemHeight]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    visibleRange,
  };
}

// Hook لتحسين الأحداث
export function useOptimizedEvent<T extends (...args: any[]) => any>(
  handler: T,
  deps: React.DependencyList,
  options?: {
    throttleMs?: number;
    debounceMs?: number;
  },
): T {
  const handlerRef = useRef<T>(handler);
  const throttleRef = useRef<NodeJS.Timeout>();
  const debounceRef = useRef<NodeJS.Timeout>();
  const lastCallRef = useRef<number>(0);

  // تحديث المرجع عند تغيير المعاملات
  useEffect(() => {
    handlerRef.current = handler;
  }, deps);

  return useCallback(
    (...args: any[]) => {
      const now = Date.now();
      const { throttleMs, debounceMs } = options || {};

      // تطبيق throttling
      if (throttleMs && now - lastCallRef.current < throttleMs) {
        return;
      }

      // تطبيق debouncing
      if (debounceMs) {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
          handlerRef.current(...args);
          lastCallRef.current = Date.now();
        }, debounceMs);

        return;
      }

      // تطبيق throttling
      if (throttleMs) {
        if (throttleRef.current) {
          clearTimeout(throttleRef.current);
        }

        throttleRef.current = setTimeout(() => {
          handlerRef.current(...args);
        }, throttleMs);
        lastCallRef.current = now;

        return;
      }

      // تنفيذ عادي
      handlerRef.current(...args);
    },
    [options?.throttleMs, options?.debounceMs],
  ) as T;
}

// Hook لمراقبة الأداء
export function usePerformanceMonitor(componentName: string) {
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef<number>(0);
  const lastRenderRef = useRef<number>(0);

  useEffect(() => {
    mountTimeRef.current = performance.now();

    return () => {
      const totalTime = performance.now() - mountTimeRef.current;
      logger.info(`Component ${componentName} performance`, {
        totalRenderTime: totalTime,
        renderCount: renderCountRef.current,
        averageRenderTime: totalTime / renderCountRef.current,
      });
    };
  }, [componentName]);

  useEffect(() => {
    const now = performance.now();
    renderCountRef.current++;

    if (lastRenderRef.current > 0) {
      const renderTime = now - lastRenderRef.current;

      if (renderTime > 16) {
        // أكثر من 16ms قد يسبب مشاكل في الأداء
        logger.warn(`Slow render detected in ${componentName}`, {
          renderTime,
          renderCount: renderCountRef.current,
        });
      }
    }

    lastRenderRef.current = now;
  });

  return {
    renderCount: renderCountRef.current,
    markRender: useCallback(
      (label: string) => {
        performance.mark(`${componentName}-${label}`);
      },
      [componentName],
    ),
  };
}
