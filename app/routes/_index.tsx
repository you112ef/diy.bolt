import React from 'react';
import BackgroundRays from '~/components/ui/BackgroundRays';

const features = [
  {
    icon: '🧠',
    title: 'Smart AI Assistant',
    desc: 'Context-aware development with real-time code suggestions',
  },
  {
    icon: '🚀',
    title: 'Instant Deploy',
    desc: 'Deploy to Vercel, Netlify, or Cloudflare in one click',
  },
  {
    icon: '💻',
    title: 'Full IDE Experience',
    desc: 'Advanced editor with terminal and file management',
  },
];

const quickStarts = [
  'Build a todo app in React using Tailwind',
  'Build a simple blog using Astro',
  'Create a cookie consent form using Material UI',
  'Make a space invaders game',
  'Make a Tic Tac Toe game in html, css and js only',
];

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
        {/* Features */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl bg-gradient-to-br from-[#2d1e5f]/80 to-[#8A5FFF]/40 shadow-xl p-6 flex flex-col items-center text-center border border-white/10 hover:scale-105 transition-transform"
            >
              <div className="text-4xl mb-3">{f.icon}</div>
              <div className="font-bold text-lg mb-1 text-white">{f.title}</div>
              <div className="text-white/80 text-sm">{f.desc}</div>
            </div>
          ))}
        </div>
        {/* Quick Start Buttons */}
        <div className="w-full flex flex-col items-center mb-8">
          {quickStarts.map((q, i) => (
            <button
              key={q}
              className="w-full md:w-auto mb-3 px-6 py-2 rounded-full bg-gradient-to-r from-[#8A5FFF] to-[#6ec1e4] text-white font-semibold shadow hover:from-[#a78bfa] hover:to-[#8A5FFF] transition-all"
            >
              {q}
            </button>
          ))}
          <div className="mt-2 text-white/60">or start a blank app with your favorite stack</div>
        </div>
        {/* Tech Icons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8 opacity-80">
          {techIcons.map((icon) => (
            <span key={icon} className={`iconify text-3xl`} data-icon={icon}></span>
          ))}
        </div>
      </main>
    </div>
  );
}
