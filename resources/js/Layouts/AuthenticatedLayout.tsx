import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <Toaster />

            {/* NAVBAR */}
            <motion.nav
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
                className="border-b border-gray-100 bg-white"
            >
                <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">

                        {/* LEFT SIDE */}
                        <div className="flex items-center">
                            <div className="flex shrink-0 items-center">
                                <motion.div whileHover={{ scale: 1.04 }}>
                                    <Link href="/">
                                        <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                    </Link>
                                </motion.div>
                            </div>

                            <div className="hidden space-x-8 sm:ml-10 sm:flex">
                                <motion.div whileHover={{ scale: 1.05 }}>
                                    <NavLink
                                        href={route('dashboard')}
                                        active={route().current('dashboard')}
                                    >
                                        Dashboard
                                    </NavLink>
                                </motion.div>

                                <motion.div whileHover={{ scale: 1.05 }}>
                                    <NavLink
                                        href={route('periods.index')}
                                        active={route().current('periods.*')}
                                    >
                                        Periods
                                    </NavLink>
                                </motion.div>

                                <motion.div whileHover={{ scale: 1.05 }}>
                                    <NavLink
                                        href={route('projects.index')}
                                        active={route().current('projects.*')}>
                                        Projects
                                    </NavLink>
                                </motion.div>
                            </div>
                        </div>

                        {/* PROFILE DROPDOWN */}
                        <div className="hidden sm:flex sm:items-center">
                            <div className="relative ml-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-600"
                                        >
                                            {user.name}
                                            <svg
                                                className="ml-2 h-4 w-4"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </motion.button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* MOBILE BUTTON */}
                        <div className="flex items-center sm:hidden">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                    setShowingNavigationDropdown(prev => !prev)
                                }
                                className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={!showingNavigationDropdown ? 'block' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'block' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* MOBILE DROPDOWN */}
                <AnimatePresence>
                    {showingNavigationDropdown && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="sm:hidden overflow-hidden"
                        >
                            <div className="space-y-1 pb-3 pt-2">
                                <ResponsiveNavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('periods.index')}
                                    active={route().current('periods.*')}
                                >
                                    Periods
                                </ResponsiveNavLink>
                            </div>

                            <div className="border-t border-gray-200 pb-1 pt-4">
                                <div className="px-4">
                                    <div className="text-base font-medium text-gray-800">
                                        {user.name}
                                    </div>
                                    <div className="text-sm font-medium text-gray-500">
                                        {user.email}
                                    </div>
                                </div>

                                <div className="mt-3 space-y-1">
                                    <ResponsiveNavLink href={route('profile.edit')}>
                                        Profile
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink
                                        method="post"
                                        href={route('logout')}
                                        as="button"
                                    >
                                        Log Out
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-full px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>
                <div className="w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
