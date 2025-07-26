import { atom } from 'nanostores';

export const sidebarStore = atom({
  isOpen: false,
});

export const toggleSidebar = () => {
  sidebarStore.set({ isOpen: !sidebarStore.get().isOpen });
};

export const openSidebar = () => {
  sidebarStore.set({ isOpen: true });
};

export const closeSidebar = () => {
  sidebarStore.set({ isOpen: false });
};