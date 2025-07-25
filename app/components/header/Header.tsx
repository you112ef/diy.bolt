import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { ControlPanel } from '~/components/control-panel/ControlPanel';

export function Header() {
  const chat = useStore(chatStore);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
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
    <header
      className={classNames(
        'flex items-center border-b h-[var(--header-height)]',
        isMobile 
          ? 'px-3 py-2' 
          : 'px-6 py-4',
        {
          'border-transparent': !chat.started,
          'border-bolt-elements-borderColor': chat.started,
        }
      )}
    >
      <div className={classNames(
        'flex items-center z-logo text-bolt-elements-textPrimary cursor-pointer',
        isMobile ? 'gap-1' : 'gap-2'
      )}>
        <div className={classNames(
          'i-ph:sidebar-simple-duotone',
          isMobile ? 'text-lg' : 'text-xl'
        )} />
        <a href="/" className={classNames(
          'font-semibold text-accent flex items-center',
          isMobile ? 'text-lg' : 'text-2xl'
        )}>
          bolt.diy
        </a>
      </div>
      {chat.started && (
        <>
          <span className={classNames(
            'flex-1 truncate text-center text-bolt-elements-textPrimary',
            isMobile 
              ? 'px-2 text-xs' 
              : 'px-4 text-sm'
          )}>
            <ClientOnly>{() => <ChatDescription />}</ClientOnly>
          </span>
          <ClientOnly>
            {() => (
              <div className={classNames(
                'flex items-center',
                isMobile ? 'mr-0 gap-1' : 'mr-1 gap-2'
              )}>
                {/* Control Panel Button */}
                <button
                  onClick={() => setIsControlPanelOpen(true)}
                  className={classNames(
                    'flex items-center rounded-md border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 hover:bg-bolt-elements-background-depth-3 transition-all',
                    isMobile 
                      ? 'gap-1 px-2 py-1 text-xs' 
                      : 'gap-2 px-3 py-1.5 text-sm'
                  )}
                  title="Control Panel"
                >
                  <div className={classNames(
                    'i-ph:control-duotone text-accent',
                    isMobile ? 'text-sm' : 'text-base'
                  )} />
                  {!isMobile && (
                    <span className="text-bolt-elements-textPrimary">Settings</span>
                  )}
                </button>
                <HeaderActionButtons />
              </div>
            )}
          </ClientOnly>
        </>
      )}

      {/* Control Panel Modal - Keep our enhanced version */}
      {isControlPanelOpen && (
        <ControlPanel
          open={isControlPanelOpen}
          onClose={() => setIsControlPanelOpen(false)}
        />
      )}
    </header>
  );
}
