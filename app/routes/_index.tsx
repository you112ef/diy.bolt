import React from 'react';
import BackgroundRays from '~/components/ui/BackgroundRays';
import { Chat } from '~/components/chat/Chat.client';

const techIcons = [
  'logos:astro',
  'logos:nextjs-icon',
  'logos:react',
  'logos:svelte-icon',
  'logos:solidjs-icon',
  'logos:vue',
  'logos:typescript-icon',
  'logos:vercel-icon',
  'logos:netlify-icon',
  'logos:cloudflare-icon',
];

export default function Index() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start bg-gradient-to-br from-[#1a133a] via-[#2d1e5f] to-[#18122b] text-white overflow-x-hidden">
      <BackgroundRays />
      {/* Header */}
      <header className="w-full flex flex-col items-center pt-8 pb-4">
        <div className="flex items-center gap-2 text-3xl font-bold bg-gradient-to-r from-[#8A5FFF] to-[#6ec1e4] bg-clip-text text-transparent tracking-tight">
          <span className="i-ph:code-duotone text-2xl" />
          YOUSEF SH
        </div>
      </header>
      {/* Main Title & Description */}
      <main className="flex flex-col items-center w-full max-w-2xl px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4 mt-4 bg-gradient-to-r from-[#fff] via-[#a78bfa] to-[#6ec1e4] bg-clip-text text-transparent drop-shadow-lg">
          Where Ideas Begin
        </h1>
        <p className="text-lg md:text-xl text-center mb-10 text-white/80">
          Build, code, and deploy with the power of AI - from same.new to production
        </p>
      </main>
      {/* Chat Box Section */}
      <section className="w-full flex flex-col items-center justify-center flex-1">
        <div className="relative w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/10 p-0 md:p-2 flex flex-col items-center justify-center z-10">
          <div className="w-full p-0 md:p-6">
            <Chat />
          </div>
        </div>
        {/* Tech Icons */}
        <div className="flex flex-wrap justify-center gap-4 mt-10 mb-8 opacity-80">
          {techIcons.map((icon) => (
            <span key={icon} className={`iconify text-3xl`} data-icon={icon}></span>
          ))}
        </div>
      </section>
    </div>
  );
}
