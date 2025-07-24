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

  const handleExecuteCommand = (command: string) => {
    console.log('Executing command:', command);

    // يمكن إضافة المزيد من المنطق هنا لتنفيذ الأوامر
  };

  return (
    <header
      className={classNames('flex items-center px-3 py-4 md:p-5 border-b h-[var(--header-height)]', {
        'border-transparent': !chat.started,
        'border-bolt-elements-borderColor': chat.started,
      })}
    >
      <div className="flex items-center gap-2 z-logo text-bolt-elements-textPrimary cursor-pointer">
        <div className="i-ph:sidebar-simple-duotone text-lg md:text-xl" />
        <a href="/" className="text-xl md:text-2xl font-semibold text-accent flex items-center">
          <img
            src="/logo-light-styled.svg"
            alt="YOUSEF SH"
            className="w-[100px] md:w-[120px] h-[30px] md:h-[36px] inline-block dark:hidden"
          />
          <img
            src="/logo-dark-styled.svg"
            alt="YOUSEF SH"
            className="w-[100px] md:w-[120px] h-[30px] md:h-[36px] inline-block hidden dark:block"
          />
        </a>
      </div>

      {/* Control Panel Button */}
      <button
        onClick={() => setIsControlPanelOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 hover:bg-bolt-elements-background-depth-3 transition-all text-sm md:text-base ml-2 md:ml-4"
        title="Control Panel"
      >
        <div className="i-ph:control-duotone text-lg text-blue-500" />
        <span className="hidden md:inline text-bolt-elements-textPrimary">Control Panel</span>
      </button>
      {chat.started && ( // Display ChatDescription and HeaderActionButtons only when the chat has started.
        <>
          <span className="flex-1 px-2 md:px-4 truncate text-center text-bolt-elements-textPrimary text-sm md:text-base">
            <ClientOnly>{() => <ChatDescription />}</ClientOnly>
          </span>
          <ClientOnly>
            {() => (
              <div className="mr-1">
                <HeaderActionButtons />
              </div>
            )}
          </ClientOnly>
        </>
      )}

      {/* Control Panel Modal */}
      <ControlPanel
        isOpen={isControlPanelOpen}
        onClose={() => setIsControlPanelOpen(false)}
        onExecuteCommand={handleExecuteCommand}
      />
    </header>
  );
}
