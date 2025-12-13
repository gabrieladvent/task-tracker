import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, X } from 'lucide-react';

interface PasswordStrength {
    score: number;
    label: string;
    color: string;
    bgColor: string;
    textColor: string;
}

export default function UpdatePasswordForm() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
    const [showStrength, setShowStrength] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (recentlySuccessful) {
            toast.success('Password updated successfully!', {
                icon: '🔒',
                style: {
                    borderRadius: '12px',
                    background: '#8b5cf6',
                    color: '#fff',
                },
            });
        }
    }, [recentlySuccessful]);

    const calculatePasswordStrength = (password: string): PasswordStrength => {
        let score = 0;

        // Length check
        if (password.length >= 6) score++;
        if (password.length >= 12) score++;

        // Character variety checks
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;

        if (score <= 2) {
            return {
                score: 1,
                label: 'Weak',
                color: 'bg-red-500',
                bgColor: 'bg-red-100 dark:bg-red-900/20',
                textColor: 'text-red-700 dark:text-red-400'
            };
        } else if (score <= 4) {
            return {
                score: 2,
                label: 'Medium',
                color: 'bg-amber-500',
                bgColor: 'bg-amber-100 dark:bg-amber-900/20',
                textColor: 'text-amber-700 dark:text-amber-400'
            };
        } else {
            return {
                score: 3,
                label: 'Strong',
                color: 'bg-green-500',
                bgColor: 'bg-green-100 dark:bg-green-900/20',
                textColor: 'text-green-700 dark:text-green-400'
            };
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setData('password', newPassword);

        if (newPassword.length > 0) {
            setShowStrength(true);
            setPasswordStrength(calculatePasswordStrength(newPassword));
        } else {
            setShowStrength(false);
            setPasswordStrength(null);
        }

        // Check password match
        if (data.password_confirmation) {
            setPasswordMatch(newPassword === data.password_confirmation);
        }
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setData('password_confirmation', value);

        if (data.password && value) {
            setPasswordMatch(data.password === value);
        } else {
            setPasswordMatch(null);
        }
    };

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowStrength(false);
                setPasswordStrength(null);
                setPasswordMatch(null);
            },
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                    setShowStrength(false);
                    setPasswordMatch(null);
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    const passwordRequirements = [
        { label: 'At least 6 characters', met: data.password.length >= 6 },
        { label: 'Contains lowercase letter', met: /[a-z]/.test(data.password) },
        { label: 'Contains uppercase letter', met: /[A-Z]/.test(data.password) },
        { label: 'Contains number', met: /[0-9]/.test(data.password) },
        { label: 'Contains special character', met: /[^a-zA-Z0-9]/.test(data.password) },
    ];

    return (
        <section>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                Ensure your account is using a long, random password to stay secure.
            </p>

            <form onSubmit={updatePassword} className="space-y-5">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <InputLabel htmlFor="current_password" value="Current Password" className="text-gray-700 dark:text-gray-300" />
                    <TextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type="password"
                        className="mt-2 block w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-purple-500 focus:ring-purple-500 dark:focus:border-purple-400 dark:focus:ring-purple-400"
                        autoComplete="current-password"
                    />
                    <InputError message={errors.current_password} className="mt-2" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <InputLabel htmlFor="password" value="New Password" className="text-gray-700 dark:text-gray-300" />
                    <TextInput
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={handlePasswordChange}
                        type="password"
                        className="mt-2 block w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-purple-500 focus:ring-purple-500 dark:focus:border-purple-400 dark:focus:ring-purple-400"
                        autoComplete="new-password"
                    />

                    {/* Password Strength Indicator */}
                    <AnimatePresence>
                        {showStrength && passwordStrength && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 space-y-2"
                            >
                                {/* Strength Bar */}
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 flex gap-1">
                                        {[1, 2, 3].map((level) => (
                                            <motion.div
                                                key={level}
                                                initial={{ scaleX: 0 }}
                                                animate={{ scaleX: 1 }}
                                                transition={{ delay: level * 0.1 }}
                                                className={`h-2 flex-1 rounded-full ${level <= passwordStrength.score
                                                        ? passwordStrength.color
                                                        : 'bg-gray-200 dark:bg-gray-700'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className={`text-sm font-medium ${passwordStrength.textColor}`}>
                                        {passwordStrength.label}
                                    </span>
                                </div>

                                {/* Password Requirements */}
                                <div className={`rounded-lg p-3 ${passwordStrength.bgColor}`}>
                                    <p className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">
                                        Password requirements:
                                    </p>
                                    <div className="space-y-1">
                                        {passwordRequirements.map((req, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="flex items-center gap-2 text-xs"
                                            >
                                                {req.met ? (
                                                    <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                                ) : (
                                                    <X className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                                )}
                                                <span className={req.met ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                                                    {req.label}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <InputError message={errors.password} className="mt-2" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="text-gray-700 dark:text-gray-300" />
                    <div className="relative">
                        <TextInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={handleConfirmPasswordChange}
                            type="password"
                            className={`mt-2 block w-full rounded-xl pr-12 ${passwordMatch === false
                                    ? 'border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-500'
                                    : passwordMatch === true
                                        ? 'border-green-500 dark:border-green-400 focus:border-green-500 focus:ring-green-500'
                                        : 'border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500 dark:focus:border-purple-400 dark:focus:ring-purple-400'
                                } dark:bg-gray-700 dark:text-white`}
                            autoComplete="new-password"
                        />
                        <AnimatePresence>
                            {passwordMatch !== null && data.password_confirmation && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 mt-1"
                                >
                                    {passwordMatch ? (
                                        <Check className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <X className="h-5 w-5 text-red-500" />
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    {passwordMatch === false && (
                        <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 text-sm text-red-600 dark:text-red-400"
                        >
                            Passwords do not match
                        </motion.p>
                    )}
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </motion.div>

                <div className="flex items-center gap-4 pt-2">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative"
                    >
                        <PrimaryButton disabled={processing || passwordMatch === false} className="relative overflow-hidden">
                            {processing && (
                                <motion.div
                                    className="absolute inset-0 bg-white/20"
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '100%' }}
                                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                />
                            )}
                            <span className="relative">
                                {processing ? 'Updating...' : 'Update Password'}
                            </span>
                        </PrimaryButton>
                    </motion.div>
                </div>
            </form>
        </section>
    );
}
