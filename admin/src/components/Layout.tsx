import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type NavItem = { to: string; label: string; icon: React.ReactNode };
type NavGroup =
  | { label: string; to: string; icon: React.ReactNode }
  | { label: string; items: NavItem[]; icon: React.ReactNode };

const iconClass = 'w-5 h-5 shrink-0';

const icons = {
  dashboard: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  users: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  folder: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  question: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  clipboard: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  book: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  bell: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-12 0v3.159c0 .538-.214 1.055-.595 1.436L6 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  chevronDown: (
    <svg className="w-4 h-4 shrink-0 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  logout: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
};

const navGroups: NavGroup[] = [
  { label: 'Dashboard', to: '/', icon: icons.dashboard },
  { label: 'User Management', icon: icons.users, items: [{ to: '/users', label: 'Users', icon: icons.users }] },
  { label: 'Content', icon: icons.folder, items: [{ to: '/subjects', label: 'Subjects', icon: icons.folder }, { to: '/topics', label: 'Topics', icon: icons.folder }] },
  { label: 'Questions', icon: icons.question, items: [{ to: '/question-bank', label: 'Question Bank', icon: icons.question }, { to: '/question-options', label: 'Question Options', icon: icons.question }] },
  { label: 'Assessments', icon: icons.clipboard, items: [{ to: '/tests', label: 'Tests', icon: icons.clipboard }, { to: '/mock-tests', label: 'Mock Tests', icon: icons.clipboard }, { to: '/sample-papers', label: 'Sample Papers', icon: icons.clipboard }] },
  { label: 'Learning', icon: icons.book, items: [{ to: '/interview-prep', label: 'Interview Prep', icon: icons.book }, { to: '/blog', label: 'Blog', icon: icons.book }, { to: '/notes', label: 'Notes', icon: icons.book }] },
  { label: 'Notifications', icon: icons.bell, items: [{ to: '/notifications', label: 'Notifications', icon: icons.bell }] },
];

function isActive(pathname: string, to: string) {
  return to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(to + '/');
}

function groupContainsPath(group: NavGroup, pathname: string): boolean {
  if ('to' in group) return isActive(pathname, group.to);
  return group.items.some((item) => isActive(pathname, item.to));
}

const linkBase =
  'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150';
const linkInactive = 'text-slate-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent';
const linkActive = 'text-white bg-indigo-600 hover:bg-indigo-500 border-l-2 border-white/80';

function NavContent({ location, onNavigate }: { location: ReturnType<typeof useLocation>; onNavigate?: () => void }) {
  const pathname = location.pathname;
  const [openKeys, setOpenKeys] = useState<Set<string>>(() =>
    new Set(navGroups.filter((g) => 'items' in g && groupContainsPath(g, pathname)).map((g) => g.label))
  );

  useEffect(() => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      navGroups.forEach((g) => {
        if ('items' in g && groupContainsPath(g, pathname)) next.add(g.label);
      });
      return next;
    });
  }, [pathname]);

  const toggle = (label: string) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <div className="sidebar-nav space-y-1">
      {navGroups.map((group) => {
        if ('to' in group) {
          const active = isActive(pathname, group.to);
          return (
            <Link
              key={group.label}
              to={group.to}
              onClick={onNavigate}
              className={`${linkBase} ${active ? linkActive : linkInactive}`}
            >
              {group.icon}
              <span>{group.label}</span>
            </Link>
          );
        }
        const isOpen = openKeys.has(group.label);
        const hasActive = group.items.some((item) => isActive(pathname, item.to));
        return (
          <div key={group.label} className="rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggle(group.label)}
              className={`${linkBase} w-full justify-between text-left ${hasActive ? 'text-white bg-white/5' : linkInactive}`}
            >
              <span className="flex items-center gap-3 min-w-0">
                {group.icon}
                <span>{group.label}</span>
              </span>
              <span className={isOpen ? 'rotate-180' : ''}>{icons.chevronDown}</span>
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-200 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="pl-8 pr-2 pb-2 pt-0.5 space-y-0.5">
                  {group.items.map(({ to, label, icon: itemIcon }) => {
                    const active = isActive(pathname, to);
                    return (
                      <Link
                        key={to}
                        to={to}
                        onClick={onNavigate}
                        className={`${linkBase} ${active ? linkActive : linkInactive}`}
                      >
                        {itemIcon}
                        <span>{label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile menu button */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between h-14 px-4 bg-slate-900 text-white border-b border-slate-700">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-semibold text-lg">Admin</span>
        <div className="w-10" />
      </header>

      {/* Backdrop when sidebar is open on mobile */}
      <div
        role="presentation"
        className={`md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeSidebar}
        aria-hidden
      />

      {/* Sidebar */}
      <aside
        className={`
          admin-sidebar w-64 h-screen flex flex-col bg-slate-900 text-white shrink-0 overflow-hidden
          fixed inset-y-0 left-0 z-50
          transform transition-transform duration-200 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="sidebar-header flex items-center gap-3 p-4 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold text-white text-base tracking-tight">Admin</h1>
            <p className="text-slate-400 text-xs truncate mt-0.5">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={closeSidebar}
            className="md:hidden p-2 -m-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-3">
          <NavContent location={location} onNavigate={closeSidebar} />
        </nav>
        <div className="sidebar-footer p-3 shrink-0 border-t border-white/10">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm font-medium text-slate-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            {icons.logout}
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content: margin for fixed sidebar on desktop, top padding for mobile header */}
      <main className="flex-1 overflow-auto p-4 md:p-6 pt-14 md:pt-6 md:ml-64 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
