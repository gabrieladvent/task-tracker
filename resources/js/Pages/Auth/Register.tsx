import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormEventHandler, useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, Check, X } from 'lucide-react';

interface PasswordStrength {
    score: number;
    label: string;
    color: string;
    bgColor: string;
    textColor: string;
}

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
    const [showStrength, setShowStrength] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);
    const [emailValid, setEmailValid] = useState(true);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const calculatePasswordStrength = (password: string): PasswordStrength => {
        let score = 0;

        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
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

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
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

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value;
        setData('email', newEmail);
        setEmailValid(validateEmail(newEmail) || newEmail === '');
    };

    const passwordRequirements = [
        { label: 'At least 8 characters', met: data.password.length >= 8 },
        { label: 'Contains lowercase letter', met: /[a-z]/.test(data.password) },
        { label: 'Contains uppercase letter', met: /[A-Z]/.test(data.password) },
        { label: 'Contains number', met: /[0-9]/.test(data.password) },
        { label: 'Contains special character', met: /[^a-zA-Z0-9]/.test(data.password) },
    ];

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => {
                reset('password', 'password_confirmation');
                setShowStrength(false);
                setPasswordStrength(null);
                setPasswordMatch(null);
            },
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Create Account
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Sign up to get started
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {/* Name Field */}
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <InputLabel
                            htmlFor="name"
                            value="Name"
                            className="text-gray-700 dark:text-gray-300 font-medium"
                        />

                        <div className="relative mt-2">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                className="block w-full pl-10 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                                autoComplete="name"
                                isFocused={true}
                                placeholder="John Doe"
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                        </div>

                        <InputError message={errors.name} className="mt-2" />
                    </motion.div>

                    {/* Email Field */}
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <InputLabel
                            htmlFor="email"
                            value="Email"
                            className="text-gray-700 dark:text-gray-300 font-medium"
                        />

                        <div className="relative mt-2">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className={`block w-full pl-10 pr-10 rounded-xl ${data.email && !emailValid
                                    ? 'border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400'
                                    } dark:bg-gray-700 dark:text-white`}
                                autoComplete="username"
                                placeholder="your@email.com"
                                onChange={handleEmailChange}
                                required
                            />
                            <AnimatePresence>
                                {data.email && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        {emailValid ? (
                                            <Check className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <X className="h-5 w-5 text-red-500" />
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {data.email && !emailValid && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-2 text-sm text-red-600 dark:text-red-400"
                            >
                                Please enter a valid email address
                            </motion.p>
                        )}
                        <InputError message={errors.email} className="mt-2" />
                    </motion.div>

                    {/* Password Field */}
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <InputLabel
                            htmlFor="password"
                            value="Password"
                            className="text-gray-700 dark:text-gray-300 font-medium"
                        />

                        <div className="relative mt-2">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <TextInput
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={data.password}
                                className="block w-full pl-10 pr-10 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                                autoComplete="new-password"
                                placeholder="••••••••"
                                onChange={handlePasswordChange}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>

                        {/* Password Strength Indicator */}
                        <AnimatePresence>
                            {showStrength && passwordStrength && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-3 space-y-2"
                                >
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
                                        <span className={`text-xs font-medium ${passwordStrength.textColor}`}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>

                                    <div className={`rounded-lg p-3 ${passwordStrength.bgColor}`}>
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

                    {/* Confirm Password Field */}
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <InputLabel
                            htmlFor="password_confirmation"
                            value="Confirm Password"
                            className="text-gray-700 dark:text-gray-300 font-medium"
                        />

                        <div className="relative mt-2">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <TextInput
                                id="password_confirmation"
                                type={showPasswordConfirm ? "text" : "password"}
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className={`block w-full pl-10 pr-10 rounded-xl ${passwordMatch === false
                                    ? 'border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-500'
                                    : passwordMatch === true
                                        ? 'border-green-500 dark:border-green-400 focus:border-green-500 focus:ring-green-500'
                                        : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400'
                                    } dark:bg-gray-700 dark:text-white`}
                                autoComplete="new-password"
                                placeholder="••••••••"
                                onChange={handleConfirmPasswordChange}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                {showPasswordConfirm ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
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

                    {/* Submit Button & Login Link */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2"
                    >
                        <Link
                            href={route('login')}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors order-2 sm:order-1"
                        >
                            Already registered?
                        </Link>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full sm:w-auto order-1 sm:order-2"
                        >
                            <PrimaryButton
                                className="w-full sm:w-auto justify-center rounded-xl relative overflow-hidden"
                                disabled={processing || passwordMatch === false || (data.email !== '' && !emailValid)}
                            >
                                {processing && (
                                    <motion.div
                                        className="absolute inset-0 bg-white/20"
                                        initial={{ x: '-100%' }}
                                        animate={{ x: '100%' }}
                                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                    />
                                )}
                                <UserPlus className="h-4 w-4 mr-2" />
                                <span className="relative">
                                    {processing ? 'Creating account...' : 'Create Account'}
                                </span>
                            </PrimaryButton>
                        </motion.div>
                    </motion.div>
                </form>
            </motion.div>
        </GuestLayout>
    );
}
