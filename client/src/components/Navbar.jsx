import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  UserCheck,
  Send,
  HelpCircle,
  LogOut,
  FolderSync,
  ChevronDown,
  Shield,
  Layers,
  ArrowRightLeft,
  Search,
  Cpu,
  X,
  Sun,
  Moon,
  Mail,
  Clock,
  AlertTriangle,
  ArrowRight,
  Filter,
} from 'lucide-react';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { OwnlyLogoMark } from './OwnlyLogo';

export const Navbar = ({ aiStatus }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, switchRoleLocally } = useAuthStore();
  const {
    chatOpen,
    setChatOpen,
    setAccountsModalOpen,
    setSimulateModalOpen,
    setShortcutsModalOpen,
    mobilePane,
    setMobilePane,
    searchQuery,
    setSearchQuery,
    setActiveConversationId,
    setActiveSegment,
    theme,
    toggleTheme,
    setTheme,
  } = useUIStore();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const searchContainerRef = useRef(null);

  const [navSearch, setNavSearch] = useState(searchQuery || '');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const isClient = user?.role === 'client';

  // Fetch conversations for fast live search suggestions
  const { data: convData } = useQuery({
    queryKey: ['navbarSuggestions'],
    queryFn: async () => {
      const res = await api.get('/conversations?limit=60');
      return res.data?.data?.conversations || [];
    },
    staleTime: 30000,
  });

  const allConversations = convData || [];

  // Filter conversations for search suggestions
  const queryLower = navSearch.trim().toLowerCase();
  const matchedConversations = queryLower
    ? allConversations.filter((c) => {
        const subject = (c.subject || '').toLowerCase();
        const sender = (c.participants?.[0]?.name || c.participants?.[0]?.email || '').toLowerCase();
        const snippet = (c.snippet || '').toLowerCase();
        return subject.includes(queryLower) || sender.includes(queryLower) || snippet.includes(queryLower);
      }).slice(0, 5)
    : [];

  // Sync navSearch with global searchQuery
  useEffect(() => {
    setNavSearch(searchQuery || '');
  }, [searchQuery]);

  // Listen for Ctrl+K / Cmd+K global shortcut to toggle Ask AI
  // and '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setChatOpen(!chatOpen);
      } else if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
      ) {
        e.preventDefault();
        const navbarSearch = document.getElementById('navbar-search-input');
        if (navbarSearch) {
          navbarSearch.focus();
          setShowSuggestions(true);
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chatOpen, setChatOpen]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleToggle = async () => {
    const targetRole = isClient ? 'assistant' : 'client';
    await switchRoleLocally(targetRole);
    setUserMenuOpen(false);
    if (targetRole === 'client') {
      navigate('/client');
    } else {
      navigate('/overview');
    }
  };

  const executeSearch = (queryText) => {
    const query = (queryText !== undefined ? queryText : navSearch).trim();
    setNavSearch(query);
    setSearchQuery(query);
    setShowSuggestions(false);

    const searchParams = new URLSearchParams(location.search);
    if (query) {
      searchParams.set('search', query);
    } else {
      searchParams.delete('search');
    }

    if (location.pathname !== '/dashboard') {
      navigate(`/dashboard?${searchParams.toString()}`);
    } else {
      navigate(`/dashboard?${searchParams.toString()}`, { replace: true });
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    executeSearch();
  };

  const handleClearSearch = () => {
    setNavSearch('');
    setSearchQuery('');
    setShowSuggestions(false);
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('search');
    if (location.pathname === '/dashboard') {
      navigate(`/dashboard?${searchParams.toString()}`, { replace: true });
    }
  };

  const handleSelectConversation = (conv) => {
    setShowSuggestions(false);
    setActiveConversationId(conv._id);
    navigate('/dashboard?segment=assistant-to-reply');
  };

  const handleSelectSegmentQuickFilter = (segmentKey, label) => {
    setShowSuggestions(false);
    setActiveSegment(segmentKey);
    navigate(`/dashboard?segment=${segmentKey}`);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="h-14 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 flex items-center justify-between sticky top-0 z-40 select-none shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors">
      {/* Left: Brand Badge + Workspace Name + Mobile trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobilePane(mobilePane === 'sidebar' ? 'list' : 'sidebar')}
          className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Toggle Navigation"
        >
          <Layers className="w-4 h-4" />
        </button>

        <div
          onClick={() => navigate(isClient ? '/client' : '/overview')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <OwnlyLogoMark size={28} className="rounded-lg shadow-xs group-hover:scale-105 transition-transform" />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-slate-50">
              Ownly
            </span>
            <span className="text-slate-300 dark:text-slate-600 text-xs font-normal">/</span>
            <span className="font-medium text-xs text-slate-500 dark:text-slate-400">
              Hastings Ventures
            </span>
            {isClient && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#ff4800] border border-orange-200 dark:border-orange-800/50">
                Client View
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Controls: Search with Suggestions, Theme Toggle, Ask AI, and Avatar menu */}
      <div className="flex items-center gap-3">
        {/* Interactive Search Bar + Live Suggestions Popover */}
        <div ref={searchContainerRef} className="relative hidden sm:block">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center"
          >
            <input
              id="navbar-search-input"
              type="text"
              value={navSearch}
              onChange={(e) => {
                setNavSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search emails (/)"
              className="w-48 md:w-64 text-xs bg-slate-100/80 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-transparent focus:border-slate-300 dark:focus:border-slate-700 rounded-full pl-8 pr-7 py-1.5 outline-none transition-all shadow-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#ff4800] dark:hover:text-[#ff4800] transition-colors p-0.5"
              title="Execute search"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
            {navSearch ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 dark:text-slate-500 font-sans px-1.5 py-0.2 rounded-full bg-white dark:bg-slate-800 shadow-xs border border-slate-200 dark:border-slate-700 pointer-events-none">
                /
              </kbd>
            )}
          </form>

          {/* Search Suggestions Popover Menu */}
          {showSuggestions && (
            <div className="absolute left-0 top-full mt-2 w-80 md:w-96 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-hover p-2.5 z-50 text-xs animate-in fade-in-50 slide-in-from-top-1">
              {queryLower ? (
                /* Filtered Suggestions when user has typed */
                <div className="space-y-2">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
                    <span>Matched Threads ({matchedConversations.length})</span>
                    <span className="text-[10px] font-normal text-slate-400">Press Enter to search all</span>
                  </div>

                  {matchedConversations.length === 0 ? (
                    <div className="px-3 py-3 text-center text-slate-400 dark:text-slate-500 text-xs">
                      No direct thread matches for "{navSearch}"
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-56 overflow-y-auto">
                      {matchedConversations.map((conv) => (
                        <div
                          key={conv._id}
                          onClick={() => handleSelectConversation(conv)}
                          className="p-2 rounded-xl hover:bg-[#fff4f0] dark:hover:bg-slate-800/80 cursor-pointer transition-colors group flex items-start justify-between gap-2 border border-transparent hover:border-orange-100 dark:hover:border-slate-700"
                        >
                          <div className="min-w-0 flex items-start gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#ff4800] shrink-0 mt-0.5 transition-colors" />
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#ff4800] dark:group-hover:text-[#ff4800] truncate block transition-colors">
                                {conv.subject}
                              </span>
                              <span className="text-[11px] text-slate-400 truncate block">
                                {conv.participants?.[0]?.name || 'Sender'}
                              </span>
                            </div>
                          </div>
                          <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {conv.classification?.label || 'General'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Search term execution shortcut */}
                  <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => executeSearch()}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-between text-xs font-medium"
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <Search className="w-3.5 h-3.5 text-slate-400" />
                        <span>Search inbox for <strong>"{navSearch}"</strong></span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Quick Shortcuts when search input is empty */
                <div className="space-y-2">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Quick Segments & Shortcuts
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSelectSegmentQuickFilter('assistant-to-reply', 'Assistant to Reply')}
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-2 border border-slate-100 dark:border-slate-800"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate font-medium text-xs">Needs your reply</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectSegmentQuickFilter('client-to-reply', 'Client to Reply')}
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-2 border border-slate-100 dark:border-slate-800"
                    >
                      <Shield className="w-3.5 h-3.5 text-[#ff4800] shrink-0" />
                      <span className="truncate font-medium text-xs">Client to reply</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectSegmentQuickFilter('needs-review', 'Needs Review')}
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-2 border border-slate-100 dark:border-slate-800"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate font-medium text-xs">Needs review</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectSegmentQuickFilter('waiting-for-response', 'Waiting for Response')}
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-2 border border-slate-100 dark:border-slate-800"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate font-medium text-xs">Waiting replies</span>
                    </button>
                  </div>

                  {/* Common Keyword Suggestions */}
                  <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block px-2 pb-1">
                      Popular Keywords
                    </span>
                    <div className="flex flex-wrap gap-1.5 px-1">
                      {['Term sheet', 'Sync reschedule', 'Founder signoff', 'Indemnity', 'Due diligence', 'Wire transfer'].map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => executeSearch(term)}
                          className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-[#fff4f0] dark:hover:bg-orange-950/60 hover:text-[#ff4800] dark:hover:text-[#ff4800] text-slate-600 dark:text-slate-400 text-[11px] font-medium transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dark / Light Theme Toggle Pill Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200/60 dark:border-slate-700/60 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4800]"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 animate-in spin-in-180 duration-300" />
          )}
        </button>

        {/* Ask AI Pill (Payoneer Signature Brand Style) */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4800] ${
            chatOpen
              ? 'bg-[#ff4800] text-white shadow-orange-500/25'
              : 'bg-[#fff4f0] dark:bg-orange-950/50 text-[#ff4800] border border-[#ffd4c4] dark:border-orange-800/60 hover:bg-[#ffece5] dark:hover:bg-orange-900/60'
          }`}
          title="Ask AI (Ctrl+K)"
        >
          <Sparkles className={`w-3.5 h-3.5 ${chatOpen ? 'text-white' : 'text-[#ff4800]'}`} />
          <span>Ask AI</span>
          <kbd
            className={`hidden sm:inline px-1.5 py-0.5 rounded-full text-[10px] font-sans font-medium tabular-nums ${
              chatOpen
                ? 'bg-orange-600 text-white'
                : 'bg-white dark:bg-slate-800 text-orange-700 dark:text-orange-400 border border-orange-200/80 dark:border-orange-800/80 shadow-xs'
            }`}
          >
            Ctrl+K
          </kbd>
        </button>

        {/* User Menu Dropdown (Avatar + Role Switcher + AI Status + Theme Toggle + Demo Tools Inside) */}
        <div className="relative pl-0.5" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-orange-500/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4800]"
            title={`${user?.name || 'User'} (${user?.role || 'assistant'})`}
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center text-xs font-bold select-none shadow-xs">
              {getInitials(user?.name)}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Menu Dropdown Card */}
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-hover py-2 z-50 text-xs">
              {/* User Identity Header */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-slate-100 block truncate text-xs">
                  {user?.name || 'User'}
                </span>
                <span className="text-[11px] text-slate-400 block truncate">
                  {user?.email || ''}
                </span>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {isClient ? (
                    <Shield className="w-3 h-3 text-[#ff4800]" />
                  ) : (
                    <UserCheck className="w-3 h-3 text-[#ff4800]" />
                  )}
                  <span>{isClient ? 'Client role' : 'Assistant role'}</span>
                </div>
              </div>

              {/* Theme Selector */}
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2 font-medium">
                  {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-slate-400" />}
                  <span>Appearance</span>
                </span>
                <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
                  <button
                    onClick={() => setTheme('light')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      theme === 'light' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      theme === 'dark' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    Dark
                  </button>
                </div>
              </div>

              {/* Role Switcher Action */}
              <div className="py-1">
                <button
                  onClick={handleRoleToggle}
                  className="w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors font-medium"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
                  <span>Switch to {isClient ? 'Assistant HQ' : 'Client View'}</span>
                </button>
              </div>

              {/* AI Status Item */}
              <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                    <Cpu className="w-3 h-3 text-slate-400" />
                    <span>AI status</span>
                  </span>
                  <div
                    className="flex items-center gap-1.5 font-semibold"
                    title={
                      aiStatus?.live
                        ? 'AI active with Claude LLM'
                        : 'Using rule-based classification. Add an API key for full AI.'
                    }
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        aiStatus?.live ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                    <span className={aiStatus?.live ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}>
                      {aiStatus?.live ? 'AI active' : 'Smart rules'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Demo Tools Section */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-1.5">
                <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Demo tools
                </div>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    setSimulateModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors font-medium"
                >
                  <Send className="w-3.5 h-3.5 text-slate-400" />
                  <span>Simulate email</span>
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    setAccountsModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors font-medium"
                >
                  <FolderSync className="w-3.5 h-3.5 text-slate-400" />
                  <span>Connected accounts</span>
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    setShortcutsModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors font-medium"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Keyboard shortcuts</span>
                </button>
              </div>

              {/* Sign Out */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-1">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors font-medium"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
