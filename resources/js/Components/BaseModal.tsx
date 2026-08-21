import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from '@headlessui/react';
import { PropsWithChildren } from 'react';

/**
 * Accessible modal shell built on Headless UI's Dialog: it provides a focus
 * trap, Escape-to-close, `aria-modal`, scroll locking and focus restore for
 * free. Unlike `Modal.tsx` it does not force a panel background — the caller
 * styles the panel via `panelClassName`, so dark-aware content keeps its own
 * styling. `zIndexClassName` lets nested modals (e.g. a delete confirmation)
 * stack above their parent.
 */
interface BaseModalProps {
    show: boolean;
    onClose: () => void;
    closeable?: boolean;
    panelClassName?: string;
    zIndexClassName?: string;
}

export default function BaseModal({
    show,
    onClose,
    closeable = true,
    panelClassName = '',
    zIndexClassName = 'z-50',
    children,
}: PropsWithChildren<BaseModalProps>) {
    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    return (
        <Transition show={show} leave="duration-200">
            <Dialog
                as="div"
                className={`fixed inset-0 ${zIndexClassName} flex items-center justify-center overflow-y-auto p-4`}
                onClose={close}
            >
                <TransitionChild
                    enter="ease-out duration-300 motion-reduce:transition-none"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200 motion-reduce:transition-none"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        aria-hidden="true"
                    />
                </TransitionChild>

                <TransitionChild
                    enter="duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
                    enterFrom="opacity-0 scale-95 translate-y-6"
                    enterTo="opacity-100 scale-100 translate-y-0"
                    leave="ease-in duration-200 motion-reduce:transition-none"
                    leaveFrom="opacity-100 scale-100 translate-y-0"
                    leaveTo="opacity-0 scale-95 translate-y-4"
                >
                    <DialogPanel className={`relative ${panelClassName}`}>
                        {children}
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}
