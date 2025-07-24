import { useState } from 'react';
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

  return (
    <header
      className={classNames('flex items-center justify-between px-2 sm:px-3 py-2 sm:py-4 md:p-5 border-b h-[var(--header-height)]', {
        'border-transparent': !chat.started,
        'border-bolt-elements-borderColor': chat.started,
      })}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 z-logo text-bolt-elements-textPrimary cursor-pointer">
        <div className="i-ph:sidebar-simple-duotone text-lg md:text-xl" />
        <a href="/" className="text-xl md:text-2xl font-semibold text-accent flex items-center">
          <img
            src="/logo-light-styled.svg"
            alt="YOUSEF SH"
            className="w-[80px] sm:w-[100px] md:w-[120px] h-[24px] sm:h-[30px] md:h-[36px] inline-block dark:hidden"
          />
          <img
            src="/logo-dark-styled.svg"
            alt="YOUSEF SH"
            className="w-[80px] sm:w-[100px] md:w-[120px] h-[24px] sm:h-[30px] md:h-[36px] inline-block hidden dark:block"
          />
        </a>
      </div>

      {/* Chat Description - Hidden on mobile */}
      {chat.started && (
        <div className="flex-1 mx-2 sm:mx-4 hidden sm:block">
          <ClientOnly fallback={<div className="max-w-[200px] md:max-w-[300px] truncate opacity-80" />}>
            {() => (
              <div className="max-w-[200px] md:max-w-[300px] truncate opacity-80">
                <ChatDescription />
              </div>
            )}
          </ClientOnly>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Control Panel Button - Compact for mobile */}
        <button
          onClick={() => setIsControlPanelOpen(true)}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 hover:bg-bolt-elements-background-depth-3 transition-all text-xs sm:text-sm"
          title="لوحة التحكم"
        >
          <div className="i-ph:control-duotone text-sm sm:text-lg text-blue-500" />
          <span className="hidden sm:inline text-bolt-elements-textPrimary">إعدادات</span>
          <span className="sm:hidden text-bolt-elements-textPrimary">⚙️</span>
        </button>

        {/* Chat/Workbench Toggle */}
        <ClientOnly>
          {() => <HeaderActionButtons />}
        </ClientOnly>
      </div>

      {/* Control Panel Modal */}
      {isControlPanelOpen && (
        <ControlPanel
          onClose={() => setIsControlPanelOpen(false)}
        />
      )}
    </header>
  );
}
