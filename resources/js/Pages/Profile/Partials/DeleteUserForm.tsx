import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormEventHandler, useRef, useState } from 'react';
import { AlertTriangle, Trash2, ShieldAlert } from 'lucide-react';

export default function DeleteUserForm() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Danger Zone
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Permanently delete your account
                    </p>
                </div>

                {/* Icon Button Only */}
                <motion.button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all flex-shrink-0 ${isExpanded
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400'
                        }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Delete Account"
                >
                    <Trash2 className="h-5 w-5" />
                </motion.button>
            </div>

            {/* Accordion Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mt-4 space-y-4"
                    >
                        {/* Warning Box */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-900/10 p-4 border border-red-200 dark:border-red-800"
                        >
                            <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-red-900 dark:text-red-200 mb-1">
                                    Permanent Account Deletion
                                </p>
                                <p className="text-xs text-red-700 dark:text-red-300">
                                    Once your account is deleted, all of its resources and data will be permanently deleted. Please download any data you wish to retain before proceeding.
                                </p>
                            </div>
                        </motion.div>

                        {/* Delete Button */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <DangerButton onClick={confirmUserDeletion} className="rounded-xl">
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Delete My Account
                            </DangerButton>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirmation Modal */}
            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="p-6"
                >
                    <div className="flex items-start gap-4 mb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 flex-shrink-0">
                            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Delete Account
                            </h2>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                This action is <span className="font-semibold text-red-600 dark:text-red-400">permanent and irreversible</span>. All your data will be deleted immediately.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={deleteUser}>
                        <div>
                            <InputLabel
                                htmlFor="password"
                                value="Confirm with your password"
                                className="text-gray-700 dark:text-gray-300"
                            />

                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="mt-2 block w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                isFocused
                                placeholder="Enter your password"
                            />

                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <SecondaryButton onClick={closeModal} className="rounded-xl w-full sm:w-auto">
                                    Cancel
                                </SecondaryButton>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <DangerButton disabled={processing} className="rounded-xl w-full sm:w-auto">
                                    {processing ? 'Deleting...' : 'Yes, Delete My Account'}
                                </DangerButton>
                            </motion.div>
                        </div>
                    </form>
                </motion.div>
            </Modal>
        </section>
    );
}
