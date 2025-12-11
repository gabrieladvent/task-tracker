import { useAppearance } from '@/hooks/useAppearance';
import { Moon, Sun, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Appearance } from '@/types';

export default function ThemeToggle() {
    const { appearance, updateAppearance } = useAppearance();
    const [isOpen, setIsOpen] = useState(false);

    const options: { value: Appearance; icon: typeof Sun; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    const currentOption = options.find(opt => opt.value === appearance) || options[2];
    const CurrentIcon = currentOption.icon;

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                aria-label="Toggle theme"
            >
                <CurrentIcon className="h-5 w-5" />
            </motion.button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 z-20 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800"
                    >
                        {options.map(({ value, icon: Icon, label }) => (
                            <button
                                key={value}
                                onClick={() => {
                                    updateAppearance(value);
                                    setIsOpen(false);
                                }}
                                className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${appearance === value
                                        ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <Icon className="mr-3 h-4 w-4" />
                                {label}
                                {appearance === value && (
                                    <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                                )}
                            </button>
                        ))}
                    </motion.div>
                </>
            )}
        </div>
    );
}
