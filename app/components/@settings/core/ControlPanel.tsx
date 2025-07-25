import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@nanostores/react';
import { Switch } from '@radix-ui/react-switch';
import * as RadixDialog from '@radix-ui/react-dialog';
import { classNames } from '~/utils/classNames';
import { TabManagement } from '~/components/@settings/shared/components/TabManagement';
import { TabTile } from '~/components/@settings/shared/components/TabTile';
import { useUpdateCheck } from '~/lib/hooks/useUpdateCheck';
import { useFeatures } from '~/lib/hooks/useFeatures';
import { useNotifications } from '~/lib/hooks/useNotifications';
import { useConnectionStatus } from '~/lib/hooks/useConnectionStatus';
import { useDebugStatus } from '~/lib/hooks/useDebugStatus';
import {
  tabConfigurationStore,
  developerModeStore,
  setDeveloperMode,
  resetTabConfiguration,
} from '~/lib/stores/settings';
import { profileStore } from '~/lib/stores/profile';
import type { TabType, TabVisibilityConfig, Profile } from './types';
import { TAB_LABELS, DEFAULT_TAB_CONFIG } from './constants';
import { DialogTitle } from '~/components/ui/Dialog';
import { AvatarDropdown } from './AvatarDropdown';
import BackgroundRays from '~/components/ui/BackgroundRays';

// Import all tab components
import ProfileTab from '~/components/@settings/tabs/profile/ProfileTab';
import SettingsTab from '~/components/@settings/tabs/settings/SettingsTab';
import NotificationsTab from '~/components/@settings/tabs/notifications/NotificationsTab';
import FeaturesTab from '~/components/@settings/tabs/features/FeaturesTab';
import { DataTab } from '~/components/@settings/tabs/data/DataTab';
import DebugTab from '~/components/@settings/tabs/debug/DebugTab';
import { EventLogsTab } from '~/components/@settings/tabs/event-logs/EventLogsTab';
import UpdateTab from '~/components/@settings/tabs/update/UpdateTab';
import ConnectionsTab from '~/components/@settings/tabs/connections/ConnectionsTab';
import CloudProvidersTab from '~/components/@settings/tabs/providers/cloud/CloudProvidersTab';
import ServiceStatusTab from '~/components/@settings/tabs/providers/status/ServiceStatusTab';
import LocalProvidersTab from '~/components/@settings/tabs/providers/local/LocalProvidersTab';
import TaskManagerTab from '~/components/@settings/tabs/task-manager/TaskManagerTab';

interface ControlPanelProps {
  open: boolean;
  onClose: () => void;
}

interface TabWithDevType extends TabVisibilityConfig {
  isExtraDevTab?: boolean;
}

interface ExtendedTabConfig extends TabVisibilityConfig {
  isExtraDevTab?: boolean;
}

interface BaseTabConfig {
  id: TabType;
  visible: boolean;
  window: 'user' | 'developer';
  order: number;
}

interface AnimatedSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id: string;
  label: string;
}

const TAB_DESCRIPTIONS: Record<TabType, string> = {
  profile: 'Manage your profile and account settings',
  settings: 'Configure application preferences',
  notifications: 'View and manage your notifications',
  features: 'Explore new and upcoming features',
  data: 'Manage your data and storage',
  'cloud-providers': 'Configure cloud AI providers and models',
  'local-providers': 'Configure local AI providers and models',
  'service-status': 'Monitor cloud LLM service status',
  connection: 'Check connection status and settings',
  debug: 'Debug tools and system information',
  'event-logs': 'View system events and logs',
  update: 'Check for updates and release notes',
  'task-manager': 'Monitor system resources and processes',
  'tab-management': 'Configure visible tabs and their order',
};

// Beta status for experimental features
const BETA_TABS = new Set<TabType>(['task-manager', 'service-status', 'update', 'local-providers']);

const BetaLabel = () => (
  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-purple-500/10 dark:bg-purple-500/20">
    <span className="text-[10px] font-medium text-purple-600 dark:text-purple-400">BETA</span>
  </div>
);

const AnimatedSwitch = ({ checked, onCheckedChange, id, label }: AnimatedSwitchProps) => {
  return (
    <div className="flex items-center gap-2">
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={classNames(
          'relative inline-flex h-6 w-11 items-center rounded-full',
          'transition-all duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)]',
          'bg-gray-200 dark:bg-gray-700',
          'data-[state=checked]:bg-purple-500',
          'focus:outline-none focus:ring-2 focus:ring-purple-500/20',
          'cursor-pointer',
          'group',
        )}
      >
        <motion.span
          className={classNames(
            'absolute left-[2px] top-[2px]',
            'inline-block h-5 w-5 rounded-full',
            'bg-white shadow-lg',
            'transition-shadow duration-300',
            'group-hover:shadow-md group-active:shadow-sm',
            'group-hover:scale-95 group-active:scale-90',
          )}
          initial={false}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
            duration: 0.2,
          }}
          animate={{
            x: checked ? '1.25rem' : '0rem',
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-white"
            initial={false}
            animate={{
              scale: checked ? 1 : 0.8,
            }}
            transition={{ duration: 0.2 }}
          />
        </motion.span>
        <span className="sr-only">Toggle {label}</span>
      </Switch>
      <div className="flex items-center gap-2">
        <label
          htmlFor={id}
          className="text-sm text-gray-500 dark:text-gray-400 select-none cursor-pointer whitespace-nowrap w-[88px]"
        >
          {label}
        </label>
      </div>
    </div>
  );
};

export const ControlPanel = ({ open, onClose }: ControlPanelProps) => {
  // State
  const [activeTab, setActiveTab] = useState<TabType | null>(null);
  const [loadingTab, setLoadingTab] = useState<TabType | null>(null);
  const [showTabManagement, setShowTabManagement] = useState(false);
  // نافذة الملحقات
  const [showExtensions, setShowExtensions] = useState(false);
  // نافذة المظهر
  const [showTheme, setShowTheme] = useState(false);
  // نافذة النماذج
  const [showModels, setShowModels] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [installing, setInstalling] = useState(false);
  const [installMsg, setInstallMsg] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  // 2. Function to install extension
  async function handleInstallExtension() {
    if (!searchTerm) return;
    setInstalling(true);
    setInstallMsg('');
    try {
      const res = await fetch('/api/vscode/extension', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extensionId: searchTerm }),
      });
      const data = await res.json();
      setInstallMsg(data.status === 'success' ? 'تم التثبيت بنجاح' : data.message || 'حدث خطأ');
      setSearchTerm('');
      // يمكنك تحديث قائمة الملحقات المثبتة هنا
    } catch (e) {
      setInstallMsg('حدث خطأ أثناء التثبيت');
    }
    setInstalling(false);
  }

  // Store values
  const tabConfiguration = useStore(tabConfigurationStore);
  const developerMode = useStore(developerModeStore);
  const profile = useStore(profileStore) as Profile;

  // Status hooks
  const { hasUpdate, currentVersion, acknowledgeUpdate } = useUpdateCheck();
  const { hasNewFeatures, unviewedFeatures, acknowledgeAllFeatures } = useFeatures();
  const { hasUnreadNotifications, unreadNotifications, markAllAsRead } = useNotifications();
  const { hasConnectionIssues, currentIssue, acknowledgeIssue } = useConnectionStatus();
  const { hasActiveWarnings, activeIssues, acknowledgeAllIssues } = useDebugStatus();

  // Memoize the base tab configurations to avoid recalculation
  const baseTabConfig = useMemo(() => {
    return new Map(DEFAULT_TAB_CONFIG.map((tab) => [tab.id, tab]));
  }, []);

  // Add visibleTabs logic using useMemo with optimized calculations
  const visibleTabs = useMemo(() => {
    if (!tabConfiguration?.userTabs || !Array.isArray(tabConfiguration.userTabs)) {
      console.warn('Invalid tab configuration, resetting to defaults');
      resetTabConfiguration();

      return [];
    }

    const notificationsDisabled = profile?.preferences?.notifications === false;

    // In developer mode, show ALL tabs without restrictions
    if (developerMode) {
      const seenTabs = new Set<TabType>();
      const devTabs: ExtendedTabConfig[] = [];

      // Process tabs in order of priority: developer, user, default
      const processTab = (tab: BaseTabConfig) => {
        if (!seenTabs.has(tab.id)) {
          seenTabs.add(tab.id);
          devTabs.push({
            id: tab.id,
            visible: true,
            window: 'developer',
            order: tab.order || devTabs.length,
          });
        }
      };

      // Process tabs in priority order
      tabConfiguration.developerTabs?.forEach((tab) => processTab(tab as BaseTabConfig));
      tabConfiguration.userTabs.forEach((tab) => processTab(tab as BaseTabConfig));
      DEFAULT_TAB_CONFIG.forEach((tab) => processTab(tab as BaseTabConfig));

      // Add Tab Management tile
      devTabs.push({
        id: 'tab-management' as TabType,
        visible: true,
        window: 'developer',
        order: devTabs.length,
        isExtraDevTab: true,
      });

      return devTabs.sort((a, b) => a.order - b.order);
    }

    // Optimize user mode tab filtering
    return tabConfiguration.userTabs
      .filter((tab) => {
        if (!tab?.id) {
          return false;
        }

        if (tab.id === 'notifications' && notificationsDisabled) {
          return false;
        }

        return tab.visible && tab.window === 'user';
      })
      .sort((a, b) => a.order - b.order);
  }, [tabConfiguration, developerMode, profile?.preferences?.notifications, baseTabConfig]);

  // Optimize animation performance with layout animations
  const gridLayoutVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
        mass: 0.6,
      },
    },
  };

  // Reset to default view when modal opens/closes
  useEffect(() => {
    if (!open) {
      // Reset when closing
      setActiveTab(null);
      setLoadingTab(null);
      setShowTabManagement(false);
    } else {
      // When opening, set to null to show the main view
      setActiveTab(null);
    }
  }, [open]);

  // Handle closing
  const handleClose = () => {
    setActiveTab(null);
    setLoadingTab(null);
    setShowTabManagement(false);
    onClose();
  };

  // Handlers
  const handleBack = () => {
    if (showTabManagement) {
      setShowTabManagement(false);
    } else if (activeTab) {
      setActiveTab(null);
    }
  };

  const handleDeveloperModeChange = (checked: boolean) => {
    console.log('Developer mode changed:', checked);
    setDeveloperMode(checked);
  };

  // Add effect to log developer mode changes
  useEffect(() => {
    console.log('Current developer mode:', developerMode);
  }, [developerMode]);

  const getTabComponent = (tabId: TabType | 'tab-management') => {
    if (tabId === 'tab-management') {
      return <TabManagement />;
    }

    switch (tabId) {
      case 'profile':
        return <ProfileTab />;
      case 'settings':
        return <SettingsTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'features':
        return <FeaturesTab />;
      case 'data':
        return <DataTab />;
      case 'cloud-providers':
        return <CloudProvidersTab />;
      case 'local-providers':
        return <LocalProvidersTab />;
      case 'connection':
        return <ConnectionsTab />;
      case 'debug':
        return <DebugTab />;
      case 'event-logs':
        return <EventLogsTab />;
      case 'update':
        return <UpdateTab />;
      case 'task-manager':
        return <TaskManagerTab />;
      case 'service-status':
        return <ServiceStatusTab />;
      default:
        return null;
    }
  };

  const getTabUpdateStatus = (tabId: TabType): boolean => {
    switch (tabId) {
      case 'update':
        return hasUpdate;
      case 'features':
        return hasNewFeatures;
      case 'notifications':
        return hasUnreadNotifications;
      case 'connection':
        return hasConnectionIssues;
      case 'debug':
        return hasActiveWarnings;
      default:
        return false;
    }
  };

  const getStatusMessage = (tabId: TabType): string => {
    switch (tabId) {
      case 'update':
        return `New update available (v${currentVersion})`;
      case 'features':
        return `${unviewedFeatures.length} new feature${unviewedFeatures.length === 1 ? '' : 's'} to explore`;
      case 'notifications':
        return `${unreadNotifications.length} unread notification${unreadNotifications.length === 1 ? '' : 's'}`;
      case 'connection':
        return currentIssue === 'disconnected'
          ? 'Connection lost'
          : currentIssue === 'high-latency'
            ? 'High latency detected'
            : 'Connection issues detected';
      case 'debug': {
        const warnings = activeIssues.filter((i) => i.type === 'warning').length;
        const errors = activeIssues.filter((i) => i.type === 'error').length;

        return `${warnings} warning${warnings === 1 ? '' : 's'}, ${errors} error${errors === 1 ? '' : 's'}`;
      }
      default:
        return '';
    }
  };

  const handleTabClick = (tabId: TabType) => {
    setLoadingTab(tabId);
    setActiveTab(tabId);
    setShowTabManagement(false);

    // Acknowledge notifications based on tab
    switch (tabId) {
      case 'update':
        acknowledgeUpdate();
        break;
      case 'features':
        acknowledgeAllFeatures();
        break;
      case 'notifications':
        markAllAsRead();
        break;
      case 'connection':
        acknowledgeIssue();
        break;
      case 'debug':
        acknowledgeAllIssues();
        break;
    }

    // Clear loading state after a delay
    setTimeout(() => setLoadingTab(null), 500);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--bg-main)] py-16">
      <div className="w-full max-w-lg card flex flex-col items-center justify-center text-center shadow-lg p-10">
        <div className="icon mb-8" style={{ background: 'var(--primary-light)', width: '5rem', height: '5rem', fontSize: '2.5rem' }}>
          <span className="i-ph:gear-six-bold text-5xl" style={{ color: 'var(--primary)' }} />
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>
          الإعدادات
        </h1>
        <p className="text-lg mb-10" style={{ color: 'var(--text-secondary)' }}>
          تحكم كامل في جميع خيارات وميزات التطبيق من مكان واحد.
        </p>
        <div className="flex flex-col gap-5 w-full">
          <button className="button w-full flex items-center justify-center gap-2 text-lg" onClick={() => setShowExtensions(true)}>
            <span className="i-ph:puzzle-piece-bold text-xl" /> الملحقات
          </button>
          <button className="button w-full flex items-center justify-center gap-2 text-lg" onClick={() => setShowTheme(true)}>
            <span className="i-ph:paint-brush-broad-bold text-xl" /> المظهر
          </button>
          <button className="button w-full flex items-center justify-center gap-2 text-lg" onClick={() => setShowModels(true)}>
            <span className="i-ph:cpu-bold text-xl" /> النماذج
          </button>
        </div>
      </div>
      {/* نافذة الملحقات */}
      {showExtensions && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#fff] rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col relative">
            <button
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-black"
              onClick={() => setShowExtensions(false)}
            >
              <span className="i-ph:x text-xl" />
            </button>
            <div className="flex items-center gap-2 p-6 border-b border-[#ececec]">
              <span className="i-ph:puzzle-piece-bold text-2xl text-[#8A5FFF]" />
              <span className="text-lg font-bold text-black">إدارة ملحقات VSCode</span>
            </div>
            <div className="flex-1 overflow-hidden flex items-center justify-center">
              <iframe
                src="http://localhost:3001"
                title="VSCode Web"
                className="w-full h-full border-0 rounded-b-2xl"
              />
            </div>
          </div>
        </div>
      )}
      {/* نافذة المظهر */}
      {showTheme && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#fff] rounded-2xl shadow-2xl w-full max-w-md h-[60vh] flex flex-col relative p-8 items-center justify-center">
            <button
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-black"
              onClick={() => setShowTheme(false)}
            >
              <span className="i-ph:x text-xl" />
            </button>
            <span className="i-ph:paint-brush-broad-bold text-3xl text-[#8A5FFF] mb-4" />
            <h2 className="text-xl font-bold mb-2">تغيير المظهر</h2>
            <p className="text-base mb-4 text-gray-600">اختر الوضع الليلي أو النهاري أو لون مخصص.</p>
            {/* خيارات المظهر (ليلي/نهاري/مخصص) */}
            <div className="flex gap-4">
              <button className="button">ليلي</button>
              <button className="button">نهاري</button>
              <button className="button">مخصص</button>
            </div>
          </div>
        </div>
      )}
      {/* نافذة النماذج */}
      {showModels && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#fff] rounded-2xl shadow-2xl w-full max-w-md h-[60vh] flex flex-col relative p-8 items-center justify-center">
            <button
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-black"
              onClick={() => setShowModels(false)}
            >
              <span className="i-ph:x text-xl" />
            </button>
            <span className="i-ph:cpu-bold text-3xl text-[#8A5FFF] mb-4" />
            <h2 className="text-xl font-bold mb-2">إدارة النماذج</h2>
            <p className="text-base mb-4 text-gray-600">إضافة أو إزالة أو تخصيص نماذج الذكاء الاصطناعي.</p>
            {/* قائمة النماذج أو خيارات الإدارة */}
            <div className="flex flex-col gap-2 w-full">
              <button className="button w-full">إضافة نموذج جديد</button>
              <button className="button w-full">إزالة نموذج</button>
              <button className="button w-full">تخصيص</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
