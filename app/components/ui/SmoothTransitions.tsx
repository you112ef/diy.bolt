import React, { useState, useEffect, useRef, type ReactNode } from 'react';
import { classNames } from '~/utils/classNames';

// أنواع الانتقالات المختلفة
export type TransitionType =
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale'
  | 'rotate'
  | 'bounce'
  | 'elastic'
  | 'flip';

export type TransitionDuration = 'fast' | 'normal' | 'slow' | 'custom';

export interface TransitionConfig {
  type: TransitionType;
  duration: TransitionDuration;
  customDuration?: number;
  delay?: number;
  easing?: string;
  triggerOnMount?: boolean;
  triggerOnHover?: boolean;
  triggerOnClick?: boolean;
}

// Hook للانتقالات
export function useTransition(config: TransitionConfig) {
  const [isVisible, setIsVisible] = useState(!config.triggerOnMount);
  const [isAnimating, setIsAnimating] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const durationMap = {
    fast: 150,
    normal: 300,
    slow: 500,
    custom: config.customDuration || 300,
  };

  const duration = durationMap[config.duration];

  useEffect(() => {
    if (config.triggerOnMount) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, config.delay || 0);
      return () => clearTimeout(timer);
    }
  }, [config.triggerOnMount, config.delay]);

  const trigger = () => {
    setIsAnimating(true);
    setIsVisible(!isVisible);

    setTimeout(() => {
      setIsAnimating(false);
    }, duration);
  };

  const transitionClasses = getTransitionClasses(config.type, isVisible, duration, config.easing);

  return {
    isVisible,
    isAnimating,
    trigger,
    elementRef,
    transitionClasses,
    handlers: {
      onMouseEnter: config.triggerOnHover ? trigger : undefined,
      onMouseLeave: config.triggerOnHover ? trigger : undefined,
      onClick: config.triggerOnClick ? trigger : undefined,
    },
  };
}

// مكون الانتقال الأساسي
interface SmoothTransitionProps {
  children: ReactNode;
  config: TransitionConfig;
  className?: string;
  style?: React.CSSProperties;
  show?: boolean;
  onTransitionEnd?: () => void;
}

export function SmoothTransition({
  children,
  config,
  className,
  style,
  show = true,
  onTransitionEnd,
}: SmoothTransitionProps) {
  const [isVisible, setIsVisible] = useState(show && !config.triggerOnMount);
  const [shouldRender, setShouldRender] = useState(show);
  const elementRef = useRef<HTMLDivElement>(null);

  const durationMap = {
    fast: 150,
    normal: 300,
    slow: 500,
    custom: config.customDuration || 300,
  };

  const duration = durationMap[config.duration];

  useEffect(() => {
    if (show) {
      setShouldRender(true);

      const timer = setTimeout(() => {
        setIsVisible(true);
      }, config.delay || 10);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);

      const timer = setTimeout(() => {
        setShouldRender(false);
        onTransitionEnd?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, config.delay, duration, onTransitionEnd]);

  if (!shouldRender) {
    return null;
  }

  const transitionClasses = getTransitionClasses(config.type, isVisible, duration, config.easing);

  return (
    <div
      ref={elementRef}
      className={classNames(transitionClasses, className)}
      style={{
        transitionDelay: `${config.delay || 0}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// مكون الانتقال المتقدم مع تأثيرات متعددة
interface AdvancedTransitionProps {
  children: ReactNode;
  transitions: TransitionConfig[];
  className?: string;
  show?: boolean;
  stagger?: number; // تأخير بين الانتقالات
}

export function AdvancedTransition({
  children,
  transitions,
  className,
  show = true,
  stagger = 0,
}: AdvancedTransitionProps) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <SmoothTransition
          key={index}
          config={{
            ...transitions[index % transitions.length],
            delay: (transitions[index % transitions.length].delay || 0) + stagger * index,
          }}
          show={show}
        >
          {child}
        </SmoothTransition>
      ))}
    </div>
  );
}

// مكون انتقال النص المتحرك
interface AnimatedTextProps {
  text: string;
  className?: string;
  animationType?: 'typewriter' | 'fade-in-words' | 'slide-in-chars';
  speed?: number;
}

export function AnimatedText({ text, className, animationType = 'typewriter', speed = 50 }: AnimatedTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (animationType === 'typewriter') {
      if (currentIndex < text.length) {
        const timer = setTimeout(() => {
          setDisplayedText((prev) => prev + text[currentIndex]);
          setCurrentIndex((prev) => prev + 1);
        }, speed);
        return () => clearTimeout(timer);
      }
    } else {
      setDisplayedText(text);
    }
  }, [currentIndex, text, animationType, speed]);

  if (animationType === 'fade-in-words') {
    return (
      <div className={className}>
        {text.split(' ').map((word, index) => (
          <SmoothTransition
            key={index}
            config={{
              type: 'fade',
              duration: 'normal',
              delay: index * 100,
              triggerOnMount: true,
            }}
            className="inline-block mr-1"
          >
            {word}
          </SmoothTransition>
        ))}
      </div>
    );
  }

  if (animationType === 'slide-in-chars') {
    return (
      <div className={className}>
        {text.split('').map((char, index) => (
          <SmoothTransition
            key={index}
            config={{
              type: 'slide-up',
              duration: 'fast',
              delay: index * 50,
              triggerOnMount: true,
            }}
            className="inline-block"
          >
            {char === ' ' ? '\u00A0' : char}
          </SmoothTransition>
        ))}
      </div>
    );
  }

  return (
    <div className={classNames('font-mono', className)}>
      {displayedText}
      <span className="animate-pulse">|</span>
    </div>
  );
}

// مكون التحميل المتحرك
interface LoadingTransitionProps {
  isLoading: boolean;
  children: ReactNode;
  loadingComponent?: ReactNode;
  className?: string;
}

export function LoadingTransition({ isLoading, children, loadingComponent, className }: LoadingTransitionProps) {
  const defaultLoading = (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        <div className="w-8 h-8 border-4 border-bolt-elements-borderColor rounded-full animate-spin"></div>
        <div
          className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"
          style={{ animationDirection: 'reverse', animationDuration: '0.75s' }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className={className}>
      <SmoothTransition
        config={{
          type: 'fade',
          duration: 'normal',
          triggerOnMount: false,
        }}
        show={isLoading}
      >
        {loadingComponent || defaultLoading}
      </SmoothTransition>

      <SmoothTransition
        config={{
          type: 'fade',
          duration: 'normal',
          triggerOnMount: false,
        }}
        show={!isLoading}
      >
        {children}
      </SmoothTransition>
    </div>
  );
}

// مساعد لإنشاء فئات CSS للانتقالات
function getTransitionClasses(type: TransitionType, isVisible: boolean, duration: number, easing?: string): string {
  const baseTransition = `transition-all duration-${duration} ${easing || 'ease-in-out'}`;

  const transitionMap = {
    fade: isVisible ? 'opacity-100' : 'opacity-0',

    'slide-up': isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-4 opacity-0',

    'slide-down': isVisible ? 'transform translate-y-0 opacity-100' : 'transform -translate-y-4 opacity-0',

    'slide-left': isVisible ? 'transform translate-x-0 opacity-100' : 'transform translate-x-4 opacity-0',

    'slide-right': isVisible ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-4 opacity-0',

    scale: isVisible ? 'transform scale-100 opacity-100' : 'transform scale-95 opacity-0',

    rotate: isVisible ? 'transform rotate-0 opacity-100' : 'transform rotate-12 opacity-0',

    bounce: isVisible ? 'transform scale-100 opacity-100' : 'transform scale-110 opacity-0',

    elastic: isVisible ? 'transform scale-100 opacity-100' : 'transform scale-90 opacity-0',

    flip: isVisible ? 'transform rotateY-0 opacity-100' : 'transform rotateY-90 opacity-0',
  };

  return classNames(baseTransition, transitionMap[type]);
}

// Hook للانتقالات المتقدمة مع تحكم في التسلسل
export function useSequentialTransitions(configs: TransitionConfig[]) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const nextStep = () => {
    if (currentStep < configs.length - 1) {
      setCompletedSteps((prev) => [...prev, currentStep]);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCompletedSteps((prev) => prev.filter((step) => step !== currentStep - 1));
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < configs.length) {
      setCurrentStep(step);
      setCompletedSteps(Array.from({ length: step }, (_, i) => i));
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setCompletedSteps([]);
  };

  return {
    currentStep,
    completedSteps,
    nextStep,
    prevStep,
    goToStep,
    reset,
    isLastStep: currentStep === configs.length - 1,
    isFirstStep: currentStep === 0,
  };
}

// مكون للانتقالات المتتالية
interface SequentialTransitionProps {
  children: ReactNode[];
  configs: TransitionConfig[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

export function SequentialTransition({
  children,
  configs,
  autoPlay = false,
  interval = 2000,
  className,
}: SequentialTransitionProps) {
  const { currentStep, nextStep } = useSequentialTransitions(configs);

  useEffect(() => {
    if (autoPlay) {
      const timer = setInterval(() => {
        nextStep();
      }, interval);
      return () => clearInterval(timer);
    }
  }, [autoPlay, interval, nextStep]);

  return (
    <div className={className}>
      {children.map((child, index) => (
        <SmoothTransition key={index} config={configs[index]} show={index <= currentStep}>
          {child}
        </SmoothTransition>
      ))}
    </div>
  );
}

// تصدير CSS classes مساعدة للانتقالات
export const transitionClasses = {
  // مدة الانتقالات
  duration: {
    fast: 'duration-150',
    normal: 'duration-300',
    slow: 'duration-500',
  },

  // أنواع التسارع
  easing: {
    linear: 'ease-linear',
    in: 'ease-in',
    out: 'ease-out',
    inOut: 'ease-in-out',
    bounce: 'ease-bounce',
    elastic: 'ease-elastic',
  },

  // تأثيرات الانتقال
  effects: {
    fadeIn: 'opacity-0 animate-fadeIn',
    slideUp: 'transform translate-y-4 opacity-0 animate-slideUp',
    slideDown: 'transform -translate-y-4 opacity-0 animate-slideDown',
    scaleIn: 'transform scale-95 opacity-0 animate-scaleIn',
    rotateIn: 'transform rotate-12 opacity-0 animate-rotateIn',
  },
};

// تصدير keyframes CSS للانتقالات المخصصة
export const customKeyframes = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateY(1rem); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes slideDown {
    from { transform: translateY(-1rem); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  
  @keyframes rotateIn {
    from { transform: rotate(12deg); opacity: 0; }
    to { transform: rotate(0deg); opacity: 1; }
  }
  
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
    40%, 43% { transform: translate3d(0, -30px, 0); }
    70% { transform: translate3d(0, -15px, 0); }
    90% { transform: translate3d(0, -4px, 0); }
  }
  
  @keyframes elastic {
    0% { transform: scale(0.3); }
    50% { transform: scale(1.05); }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @keyframes wiggle {
    0%, 7% { transform: rotateZ(0); }
    15% { transform: rotateZ(-15deg); }
    20% { transform: rotateZ(10deg); }
    25% { transform: rotateZ(-10deg); }
    30% { transform: rotateZ(6deg); }
    35% { transform: rotateZ(-4deg); }
    40%, 100% { transform: rotateZ(0); }
  }
`;
