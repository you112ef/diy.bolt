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
      className={classNames('flex items-center px-6 py-4 border-b h-[var(--header-height)]', {
        'border-transparent': !chat.started,
        'border-bolt-elements-borderColor': chat.started,
      })}
    >
      <div className="flex items-center gap-2 z-logo text-bolt-elements-textPrimary cursor-pointer">
        <div className="i-ph:sidebar-simple-duotone text-xl" />
        <a href="/" className="text-2xl font-semibold text-accent flex items-center">
          bolt.diy
        </a>
      </div>
      {chat.started && (
        <>
          <span className="flex-1 px-4 truncate text-center text-bolt-elements-textPrimary text-sm">
            <ClientOnly>{() => <ChatDescription />}</ClientOnly>
          </span>
          <ClientOnly>
            {() => (
              <div className="mr-1 flex items-center gap-2">
                {/* Control Panel Button */}
                <button
                  onClick={() => setIsControlPanelOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 hover:bg-bolt-elements-background-depth-3 transition-all text-sm"
                  title="Control Panel"
                >
                  <div className="i-ph:control-duotone text-base text-accent" />
                  <span className="text-bolt-elements-textPrimary">Settings</span>
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
          onClose={() => setIsControlPanelOpen(false)}
        />
      )}
    </header>
  );
}
