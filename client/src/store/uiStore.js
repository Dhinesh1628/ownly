import { create } from 'zustand';

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem('app_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

const initialTheme = getInitialTheme();
if (typeof document !== 'undefined') {
  if (initialTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export const useUIStore = create((set) => ({
  activeSegment: 'assistant-to-reply',
  activeConversationId: null,
  searchQuery: '',
  filterUnreadOnly: false,
  filterImportantOnly: false,
  chatOpen: false,
  accountsModalOpen: false,
  simulateModalOpen: false,
  shortcutsModalOpen: false,
  replyComposerOpen: false,
  mobilePane: 'list', // 'list' | 'detail' | 'sidebar'
  toasts: [],
  theme: initialTheme,

  toggleTheme: () => {
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('app_theme', next);
      } catch {}
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme: next };
    });
  },

  setTheme: (theme) => {
    try {
      localStorage.setItem('app_theme', theme);
    } catch {}
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },

  setActiveSegment: (segment) => set({ activeSegment: segment, activeConversationId: null }),
  setActiveConversationId: (id) => set({ activeConversationId: id, mobilePane: 'detail' }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterUnreadOnly: (val) => set({ filterUnreadOnly: val }),
  setFilterImportantOnly: (val) => set({ filterImportantOnly: val }),
  setChatOpen: (open) => set({ chatOpen: open }),
  setAccountsModalOpen: (open) => set({ accountsModalOpen: open }),
  setSimulateModalOpen: (open) => set({ simulateModalOpen: open }),
  setShortcutsModalOpen: (open) => set({ shortcutsModalOpen: open }),
  setReplyComposerOpen: (open) => set({ replyComposerOpen: open }),
  setMobilePane: (pane) => set({ mobilePane: pane }),

  addToast: (toast) => {
    const id = Date.now().toString();
    set((state) => ({
      toasts: [...state.toasts, { id, ...toast }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, toast.duration || 4500);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
