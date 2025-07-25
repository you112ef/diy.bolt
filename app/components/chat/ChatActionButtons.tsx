import { useState } from 'react';
import { classNames } from '~/utils/classNames';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Dialog from '@radix-ui/react-dialog';

interface ChatActionButtonsProps {
  onAction: (action: string, data?: any) => void;
  className?: string;
}

export function ChatActionButtons({ onAction, className }: ChatActionButtonsProps) {
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [_isSettingsOpen, _setIsSettingsOpen] = useState(false);

  const templates = [
    {
      name: 'React Component',
      description: 'إنشاء مكون React جديد',
      icon: 'i-logos:react',
      template: 'أنشئ مكون React جديد باسم [اسم المكون] مع الخصائص التالية:\n- [خاصية 1]\n- [خاصية 2]\n- [خاصية 3]',
    },
    {
      name: 'API Endpoint',
      description: 'إنشاء نقطة نهاية API',
      icon: 'i-ph:globe-duotone',
      template:
        'أنشئ API endpoint جديد:\n- المسار: /api/[اسم المسار]\n- الطريقة: [GET/POST/PUT/DELETE]\n- الوظيفة: [وصف الوظيفة]',
    },
    {
      name: 'Database Schema',
      description: 'تصميم قاعدة بيانات',
      icon: 'i-ph:database-duotone',
      template:
        'صمم جدول قاعدة بيانات لـ [اسم الجدول] مع الحقول:\n- [حقل 1]: [نوع البيانات]\n- [حقل 2]: [نوع البيانات]\n- [حقل 3]: [نوع البيانات]',
    },
    {
      name: 'Android Activity',
      description: 'إنشاء Activity للأندرويد',
      icon: 'i-logos:android-icon',
      template:
        'أنشئ Android Activity جديد:\n- الاسم: [اسم النشاط]\n- الوظيفة: [وصف الوظيفة]\n- العناصر المطلوبة: [قائمة العناصر]',
    },
    {
      name: 'Flutter Widget',
      description: 'إنشاء Widget للفلاتر',
      icon: 'i-logos:flutter',
      template:
        'أنشئ Flutter Widget جديد:\n- الاسم: [اسم الويدجت]\n- النوع: [StatelessWidget/StatefulWidget]\n- الوظيفة: [وصف الوظيفة]',
    },
    {
      name: 'Docker Setup',
      description: 'إعداد Docker للمشروع',
      icon: 'i-logos:docker-icon',
      template:
        'أنشئ إعداد Docker للمشروع:\n- نوع التطبيق: [نوع التطبيق]\n- البيئة: [Node.js/Python/Java/etc]\n- المتطلبات الإضافية: [قائمة المتطلبات]',
    },
  ];

  const quickActions = [
    {
      name: 'تحسين الكود',
      icon: 'i-ph:lightning-duotone',
      color: 'from-yellow-500 to-orange-500',
      action: 'optimize-code',
    },
    {
      name: 'إصلاح الأخطاء',
      icon: 'i-ph:bug-duotone',
      color: 'from-red-500 to-pink-500',
      action: 'fix-bugs',
    },
    {
      name: 'إضافة تعليقات',
      icon: 'i-ph:chat-circle-text-duotone',
      color: 'from-blue-500 to-cyan-500',
      action: 'add-comments',
    },
    {
      name: 'تحسين الأداء',
      icon: 'i-ph:speedometer-duotone',
      color: 'from-green-500 to-emerald-500',
      action: 'improve-performance',
    },
  ];

  return (
    <div className={classNames('flex items-center gap-2', className)}>
      {/* Quick Actions */}
      <div className="flex items-center gap-1">
        {quickActions.map((action, actionIndex) => (
          <Tooltip.Provider key={actionIndex}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  onClick={() => onAction(action.action)}
                  className={classNames(
                    'flex items-center justify-center w-8 h-8 rounded-lg text-white hover:scale-105 transition-transform bg-gradient-to-r',
                    action.color,
                  )}
                >
                  <div className={classNames(action.icon, 'text-sm')} />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary px-2 py-1 rounded-md text-sm shadow-lg border border-bolt-elements-borderColor">
                  {action.name}
                  <Tooltip.Arrow className="fill-bolt-elements-background-depth-3" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        ))}
      </div>

      <div className="w-px h-6 bg-bolt-elements-borderColor" />

      {/* Template Button */}
      <Dialog.Root open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
        <Dialog.Trigger asChild>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bolt-elements-background-depth-2 hover:bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor hover:border-bolt-elements-borderColorHover transition-all text-sm font-medium text-bolt-elements-textPrimary">
            <div className="i-ph:file-text-duotone text-lg" />
            <span className="hidden md:inline">قوالب</span>
          </button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto z-50">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-lg font-semibold text-bolt-elements-textPrimary">
                قوالب البرمجة
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary">
                  <div className="i-ph:x text-xl" />
                </button>
              </Dialog.Close>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template, templateIndex) => (
                <button
                  key={templateIndex}
                  onClick={() => {
                    onAction('use-template', template.template);
                    setIsTemplateOpen(false);
                  }}
                  className="flex items-start gap-3 p-4 text-left rounded-lg bg-bolt-elements-background-depth-2 hover:bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor hover:border-bolt-elements-borderColorHover transition-all"
                >
                  <div className={classNames(template.icon, 'text-2xl mt-1 flex-shrink-0')} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-bolt-elements-textPrimary mb-1">{template.name}</div>
                    <div className="text-sm text-bolt-elements-textSecondary">{template.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Voice Input Button */}
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={() => onAction('voice-input')}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 transition-transform"
            >
              <div className="i-ph:microphone-duotone text-lg" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary px-2 py-1 rounded-md text-sm shadow-lg border border-bolt-elements-borderColor">
              إدخال صوتي
              <Tooltip.Arrow className="fill-bolt-elements-background-depth-3" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>

      {/* File Upload Button */}
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={() => onAction('file-upload')}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:scale-105 transition-transform"
            >
              <div className="i-ph:upload-duotone text-lg" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary px-2 py-1 rounded-md text-sm shadow-lg border border-bolt-elements-borderColor">
              رفع ملف
              <Tooltip.Arrow className="fill-bolt-elements-background-depth-3" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>

      {/* Screenshot Button */}
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={() => onAction('screenshot')}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-teal-500 to-green-500 text-white hover:scale-105 transition-transform"
            >
              <div className="i-ph:camera-duotone text-lg" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary px-2 py-1 rounded-md text-sm shadow-lg border border-bolt-elements-borderColor">
              لقطة شاشة
              <Tooltip.Arrow className="fill-bolt-elements-background-depth-3" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    </div>
  );
}
