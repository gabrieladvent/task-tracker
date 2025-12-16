import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Link, useForm, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormEventHandler, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const user = usePage().props.auth.user;
    const [emailValid, setEmailValid] = useState(true);

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    useEffect(() => {
        if (recentlySuccessful) {
            toast.success('Profile updated successfully!', {
                icon: '✨',
                style: {
                    borderRadius: '12px',
                    background: '#10b981',
                    color: '#fff',
                },
            });
        }
    }, [recentlySuccessful]);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value;
        setData('email', newEmail);
        setEmailValid(validateEmail(newEmail) || newEmail === '');
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!emailValid) {
            toast.error('Please enter a valid email address');
            return;
        }
        patch(route('profile.update'));
    };

    return (
        <section>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                Update your account's profile information and email address.
            </p>

            <form onSubmit={submit} className="space-y-5">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <InputLabel htmlFor="name" value="Name" className="text-gray-700 dark:text-gray-300" />
                    <TextInput
                        id="name"
                        className="mt-2 block w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <InputLabel htmlFor="email" value="Email" className="text-gray-700 dark:text-gray-300" />
                    <div className="relative">
                        <TextInput
                            id="email"
                            type="email"
                            className={`mt-2 block w-full rounded-xl pr-12 ${data.email && !emailValid
                                    ? 'border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400'
                                } dark:bg-gray-700 dark:text-white`}
                            value={data.email}
                            onChange={handleEmailChange}
                            required
                            autoComplete="username"
                        />
                        <AnimatePresence>
                            {data.email && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="absolute right-3 top-1/4 -translate-y-1/2"
                                >
                                    {emailValid ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-red-500" />
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
                    <InputError className="mt-2" message={errors.email} />
                </motion.div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-start gap-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-200 dark:border-amber-800"
                    >
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                Your email address is unverified.{' '}
                                <Link
                                    href={route('verification.send')}
                                    method="post"
                                    as="button"
                                    className="font-semibold underline hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
                                >
                                    Click here to re-send the verification email.
                                </Link>
                            </p>

                            {status === 'verification-link-sent' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-2 flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    A new verification link has been sent!
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}

                <div className="flex items-center gap-4 pt-2">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative"
                    >
                        <PrimaryButton disabled={processing || (data.email !== '' && !emailValid)} className="relative overflow-hidden">
                            {processing && (
                                <motion.div
                                    className="absolute inset-0 bg-white/20"
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '100%' }}
                                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                />
                            )}
                            <span className="relative">
                                {processing ? 'Saving...' : 'Save Changes'}
                            </span>
                        </PrimaryButton>
                    </motion.div>
                </div>
            </form>
        </section>
    );
}
