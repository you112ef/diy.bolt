import { motion } from 'framer-motion';
import * as Tooltip from '@radix-ui/react-tooltip';
import { classNames } from '~/utils/classNames';
import type { TabVisibilityConfig } from '~/components/@settings/core/types';
import { TAB_LABELS, TAB_ICONS } from '~/components/@settings/core/constants';
import { useState, useEffect } from 'react';

interface TabTileProps {
  tab: TabVisibilityConfig;
  onClick?: () => void;
  isActive?: boolean;
  hasUpdate?: boolean;
  statusMessage?: string;
  description?: string;
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const TabTile: React.FC<TabTileProps> = ({
  tab,
  onClick,
  isActive,
  hasUpdate,
  statusMessage,
  description,
  isLoading,
  className,
  children,
}: TabTileProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <motion.div
            onClick={onClick}
            className={classNames(
              'relative flex flex-col items-center rounded-xl',
              'w-full h-full',
              isMobile ? 'p-3 min-h-[120px]' : 'p-6 min-h-[160px]',
              'bg-white dark:bg-[#141414]',
              'border border-[#E5E5E5] dark:border-[#333333]',
              'group',
              'hover:bg-purple-50 dark:hover:bg-[#1a1a1a]',
              'hover:border-purple-200 dark:hover:border-purple-900/30',
              'transition-all duration-200',
              'touch-action-manipulation',
              isActive ? 'border-purple-500 dark:border-purple-500/50 bg-purple-500/5 dark:bg-purple-500/10' : '',
              isLoading ? 'cursor-wait opacity-70' : 'cursor-pointer',
              className || '',
            )}
            whileTap={isMobile ? { scale: 0.98 } : {}}
            transition={{ duration: 0.1 }}
          >
            {/* Main Content */}
            <div className="flex flex-col items-center justify-center flex-1 w-full">
              {/* Icon */}
              <motion.div
                className={classNames(
                  'relative',
                  'flex items-center justify-center',
                  'rounded-xl',
                  'bg-gray-100 dark:bg-gray-800',
                  'ring-1 ring-gray-200 dark:ring-gray-700',
                  'group-hover:bg-purple-100 dark:group-hover:bg-gray-700/80',
                  'group-hover:ring-purple-200 dark:group-hover:ring-purple-800/30',
                  isMobile ? 'w-10 h-10' : 'w-14 h-14',
                  isActive ? 'bg-purple-500/10 dark:bg-purple-500/10 ring-purple-500/30 dark:ring-purple-500/20' : '',
                )}
              >
                <motion.div
                  className={classNames(
                    TAB_ICONS[tab.id],
                    'text-gray-600 dark:text-gray-300',
                    'group-hover:text-purple-500 dark:group-hover:text-purple-400/80',
                    isMobile ? 'w-5 h-5' : 'w-8 h-8',
                    isActive ? 'text-purple-500 dark:text-purple-400/90' : '',
                  )}
                />
              </motion.div>

              {/* Label and Description */}
              <div className={classNames(
                'flex flex-col items-center w-full',
                isMobile ? 'mt-2' : 'mt-5'
              )}>
                <h3
                  className={classNames(
                    'font-medium leading-snug',
                    'text-gray-700 dark:text-gray-200',
                    'group-hover:text-purple-600 dark:group-hover:text-purple-300/90',
                    'text-center',
                    isMobile ? 'text-xs mb-1' : 'text-[15px] mb-2',
                    isActive ? 'text-purple-500 dark:text-purple-400/90' : '',
                  )}
                >
                  {TAB_LABELS[tab.id]}
                </h3>
                {description && !isMobile && (
                  <p
                    className={classNames(
                      'text-[13px] leading-relaxed',
                      'text-gray-500 dark:text-gray-400',
                      'max-w-[85%]',
                      'text-center',
                      'group-hover:text-purple-500 dark:group-hover:text-purple-400/70',
                      isActive ? 'text-purple-400 dark:text-purple-400/80' : '',
                    )}
                  >
                    {description}
                  </p>
                )}
                {description && isMobile && (
                  <p
                    className={classNames(
                      'text-[10px] leading-tight',
                      'text-gray-500 dark:text-gray-400',
                      'max-w-full',
                      'text-center',
                      'line-clamp-2',
                      'group-hover:text-purple-500 dark:group-hover:text-purple-400/70',
                      isActive ? 'text-purple-400 dark:text-purple-400/80' : '',
                    )}
                  >
                    {description.length > 30 ? description.substring(0, 30) + '...' : description}
                  </p>
                )}
              </div>
            </div>

            {/* Update Indicator with Tooltip */}
            {hasUpdate && (
              <>
                <div className={classNames(
                  'absolute rounded-full bg-purple-500 dark:bg-purple-400 animate-pulse',
                  isMobile ? 'top-2 right-2 w-1.5 h-1.5' : 'top-4 right-4 w-2 h-2'
                )} />
                {!isMobile && (
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className={classNames(
                        'px-3 py-1.5 rounded-lg',
                        'bg-[#18181B] text-white',
                        'text-sm font-medium',
                        'select-none',
                        'z-[100]',
                      )}
                      side="top"
                      sideOffset={5}
                    >
                      {statusMessage}
                      <Tooltip.Arrow className="fill-[#18181B]" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                )}
              </>
            )}

            {/* Children (e.g. Beta Label) */}
            {children}
          </motion.div>
        </Tooltip.Trigger>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};
