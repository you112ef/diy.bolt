import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { AgentIndicator } from '~/components/chat/AgentIndicator';

export function Header() {
  const chat = useStore(chatStore);

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
          <img src="/logo-light-styled.svg" alt="YOUSEF SH" className="w-[100px] md:w-[120px] h-[30px] md:h-[36px] inline-block dark:hidden" />
          <img src="/logo-dark-styled.svg" alt="YOUSEF SH" className="w-[100px] md:w-[120px] h-[30px] md:h-[36px] inline-block hidden dark:block" />
        </a>
      </div>
      {chat.started && ( // Display ChatDescription and HeaderActionButtons only when the chat has started.
        <>
          <span className="flex-1 px-2 md:px-4 truncate text-center text-bolt-elements-textPrimary text-sm md:text-base">
            <ClientOnly>{() => <ChatDescription />}</ClientOnly>
          </span>
          <div className="hidden md:block mr-3">
            <ClientOnly>{() => <AgentIndicator />}</ClientOnly>
          </div>
          <ClientOnly>
            {() => (
              <div className="mr-1">
                <HeaderActionButtons />
              </div>
            )}
          </ClientOnly>
        </>
      )}
      {!chat.started && (
        <div className="ml-auto">
          <ClientOnly>{() => <AgentIndicator />}</ClientOnly>
        </div>
      )}
    </header>
  );
}
