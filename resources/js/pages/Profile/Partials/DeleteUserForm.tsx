import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function DeleteUserForm({
    className = '',
}: {
    className?: string;
}) {
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
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Hapus Akun
                </h2>

                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Setelah akun Anda dihapus, semua sumber daya dan datanya akan dihapus secara permanen. Sebelum menghapus akun Anda, harap unduh data atau informasi apa pun yang ingin Anda simpan.
                </p>
            </header>

            <button onClick={confirmUserDeletion} className="bg-rose-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-rose-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                Hapus Akun
            </button>

            <Transition show={confirmingUserDeletion}>
                <Dialog className="relative z-[9999]" onClose={closeModal}>
                    <TransitionChild enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-gray-900/60 dark:bg-gray-900/80 backdrop-blur-sm" />
                    </TransitionChild>
                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                            <TransitionChild enter="ease-out duration-300" enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enterTo="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 translate-y-0 sm:scale-100" leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                                <DialogPanel className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 dark:text-gray-100 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100 dark:border-gray-800">
                                    <div className="bg-white dark:bg-gray-900 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                        <div className="sm:flex sm:items-start">
                                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30 sm:mx-0 sm:h-10 sm:w-10">
                                                <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-500" aria-hidden="true" />
                                            </div>
                                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                                <DialogTitle as="h3" className="text-lg font-bold leading-6 text-gray-900 dark:text-white">
                                                    Hapus akun
                                                </DialogTitle>
                                                <div className="mt-2">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Apakah Anda yakin ingin menghapus akun Anda? Semua data Anda akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                                                    </p>
                                                </div>
                                                
                                                <div className="mt-6 w-full">
                                                    <label htmlFor="password" className="block text-sm font-semibold mb-2 dark:text-gray-200">Kata Sandi</label>
                                                    <input
                                                        id="password"
                                                        type="password"
                                                        name="password"
                                                        ref={passwordInput}
                                                        value={data.password}
                                                        onChange={(e) => setData('password', e.target.value)}
                                                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 px-4 py-3 min-h-[50px]"
                                                        placeholder="Masukkan kata sandi Anda untuk mengonfirmasi"
                                                    />
                                                    {errors.password && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.password}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
                                        <button
                                            type="button"
                                            className="inline-flex w-full justify-center rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 sm:w-auto disabled:opacity-50"
                                            onClick={deleteUser}
                                            disabled={processing}
                                        >
                                            Hapus Akun
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-xl bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 sm:mt-0 sm:w-auto"
                                            onClick={closeModal}
                                            data-autofocus
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </section>
    );
}
