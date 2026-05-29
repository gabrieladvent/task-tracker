import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import ThemeToggle from '@/Components/ThemeToggle';
import NotesReminderWidget from '@/Components/Notes/NotesReminderWidget';

function NavBadge({ count }: { count: number }) {
    if (!count || count === 0) return null;
    return (
        <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px]
                    px-1 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold
                    leading-none dark:bg-gray-900 dark:text-gray-300 ring-1 ring-gray-200
                    dark:ring-gray-700"
        >
            {count > 99 ? '99+' : count}
        </motion.span>
    );
}

const navItems = (badges: any) => [
    { label: 'Dashboard', route: 'dashboard', match: 'dashboard', badge: null },
    { label: 'Periods', route: 'periods.index', match: 'periods.*', badge: badges?.periods, excludeMatch: 'periods.reports.*' },
    { label: 'Projects', route: 'projects.index', match: 'projects.*', badge: badges?.projects },
    { label: 'Reports', route: 'reports.index', match: 'reports.*', badge: badges?.reports },
    { label: 'Tech Dev', route: 'tech-dev.index', match: 'tech-dev.*', badge: badges?.techDev },
    { label: 'Notes', route: 'notes.index', match: 'notes.*', badge: badges?.notes },
];

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const { badges } = usePage().props as any;

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const items = navItems(badges);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Toaster position="top-right" />

            {/* ── NAVBAR ── */}
            <motion.nav
                initial={{ y: -64, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className={`sticky top-0 z-50 transition-all duration-300
                    ${scrolled
                        ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md shadow-gray-200/60 dark:shadow-gray-900/60 border-b border-gray-200/80 dark:border-gray-700/60'
                        : 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800'
                    }`}
            >
                <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-4">

                        {/* ── LEFT: Logo + Nav Links ── */}
                        <div className="flex items-center gap-2 min-w-0">
                            {/* Logo */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.97 }}
                                className="shrink-0"
                            >
                                <Link href="/" className="flex items-center">
                                    <ApplicationLogo className="block h-8 w-auto fill-current text-gray-800 dark:text-gray-100" />
                                </Link>
                            </motion.div>

                            {/* Divider */}
                            <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />

                            {/* Desktop Nav Links */}
                            <div className="hidden sm:flex items-center gap-1">
                                {items.map((item) => {
                                    const isActive = item.excludeMatch
                                        ? route().current(item.match) && !route().current(item.excludeMatch)
                                        : route().current(item.match);

                                    return (
                                        <motion.div key={item.label} whileHover={{ scale: 1.02 }}>
                                            <Link
                                                href={route(item.route)}
                                                className={`relative inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium
                                                    transition-all duration-200 group
                                                    ${isActive
                                                        ? 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/50'
                                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                    }`}
                                            >
                                                {item.label}
                                                {item.badge != null && <NavBadge count={item.badge} />}

                                                {/* Active indicator dot */}
                                                {isActive && (
                                                    <motion.span
                                                        layoutId="activeNavDot"
                                                        className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gray-500"
                                                    />
                                                )}
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── RIGHT: Theme + User ── */}
                        <div className="hidden sm:flex items-center gap-2 shrink-0">
                            <ThemeToggle />

                            {/* Divider */}
                            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

                            {/* User Dropdown */}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2
                                                   text-sm font-medium text-gray-700 dark:text-gray-300
                                                   bg-gray-50 dark:bg-gray-800 hover:bg-gray-100
                                                   dark:hover:bg-gray-700 border border-gray-200
                                                   dark:border-gray-700 transition-all duration-200"
                                    >
                                        {/* Avatar */}
                                        <span className="flex items-center justify-center h-6 w-6 rounded-full
                                                         bg-gray-100 dark:bg-gray-900 text-gray-700
                                                         dark:text-gray-300 text-xs font-bold shrink-0">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                        <span className="max-w-[120px] truncate">{user.name}</span>
                                        <svg className="h-3.5 w-3.5 text-gray-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </motion.button>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        {/* ── MOBILE: Theme + Hamburger ── */}
                        <div className="flex items-center gap-2 sm:hidden">
                            <ThemeToggle />
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowingNavigationDropdown(prev => !prev)}
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800
                                           hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                                aria-label="Toggle menu"
                            >
                                <motion.svg
                                    className="h-5 w-5"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    animate={{ rotate: showingNavigationDropdown ? 90 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {showingNavigationDropdown ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </motion.svg>
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* ── MOBILE DROPDOWN ── */}
                <AnimatePresence>
                    {showingNavigationDropdown && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="sm:hidden overflow-hidden border-t border-gray-100 dark:border-gray-800"
                        >
                            {/* Nav Links */}
                            <div className="px-3 py-3 space-y-1">
                                {items.map((item, i) => {
                                    const isActive = item.excludeMatch
                                        ? route().current(item.match) && !route().current(item.excludeMatch)
                                        : route().current(item.match);

                                    return (
                                        <motion.div
                                            key={item.label}
                                            initial={{ opacity: 0, x: -12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                        >
                                            <Link
                                                href={route(item.route)}
                                                onClick={() => setShowingNavigationDropdown(false)}
                                                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg
                                                    text-sm font-medium transition-all duration-200
                                                    ${isActive
                                                        ? 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/50'
                                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                    }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    {isActive && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500 shrink-0" />
                                                    )}
                                                    {item.label}
                                                </span>
                                                {item.badge != null && <NavBadge count={item.badge} />}
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* User Section */}
                            <div className="border-t border-gray-100 dark:border-gray-800 px-3 py-3">
                                {/* User Info */}
                                <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-lg
                                                bg-gray-50 dark:bg-gray-800/50">
                                    <span className="flex items-center justify-center h-9 w-9 rounded-full
                                                     bg-gray-100 dark:bg-gray-900 text-gray-700
                                                     dark:text-gray-300 text-sm font-bold shrink-0">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                                            {user.name}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {user.email}
                                        </div>
                                    </div>
                                </div>

                                {/* Profile & Logout */}
                                <div className="space-y-1">
                                    <ResponsiveNavLink href={route('profile.edit')}>
                                        Profile
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                        Log Out
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {/* ── PAGE HEADER ── */}
            {header && (
                <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <div className="mx-auto max-w-full px-4 py-5 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            {/* ── MAIN CONTENT ── */}
            <main>
                <div className="w-full dark:bg-gray-950">
                    {children}
                </div>
            </main>

            {/* ── GLOBAL NOTES REMINDER ── */}
            <NotesReminderWidget />

            {/* ── SCROLL TO TOP ── */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 20 }}
                        transition={{ duration: 0.25 }}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={scrollToTop}
                        className="fixed bottom-8 right-8 z-50 rounded-full bg-gray-600 hover:bg-gray-700
                                dark:bg-gray-500 dark:hover:bg-gray-600 p-3 text-white
                                shadow-lg shadow-gray-500/30 dark:shadow-indigo-900/50 transition-colors"
                        aria-label="Scroll to top"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
