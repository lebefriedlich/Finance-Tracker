import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Bell, BellOff, AlertTriangle, Info } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { requestFCMToken } from '../../../firebase';

export default function NotificationSettingsForm({ className = '' }: { className?: string }) {
    const { vapid_public_key } = usePage().props as any;
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);

    const [modalData, setModalData] = useState<{
        show: boolean;
        type: 'alert' | 'confirm';
        message: string;
        onConfirm?: () => void;
    }>({ show: false, type: 'alert', message: '' });

    useEffect(() => {
        checkSubscription();
    }, []);

    const checkSubscription = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            setLoading(false);
            return;
        }

        try {
            setIsSubscribed(Notification.permission === 'granted');
        } catch (error) {
            console.error('Error checking subscription:', error);
        }
        setLoading(false);
    };

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const subscribeToPush = async () => {
        setLoading(true);
        try {
            if (!('Notification' in window)) {
                setModalData({
                    show: true,
                    type: 'alert',
                    message: "Browser ini tidak mendukung notifikasi. Jika Anda menggunakan iPhone/iOS, pastikan Anda sudah menambahkan aplikasi ini ke Layar Utama (Add to Home Screen) terlebih dahulu."
                });
                setLoading(false);
                return;
            }

            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                if (permission === 'denied') {
                    setModalData({
                        show: true,
                        type: 'alert',
                        message: "Anda telah memblokir izin notifikasi. Silakan ubah pengaturan browser Anda untuk mengizinkan."
                    });
                }
                setLoading(false);
                return;
            }

            const token = await requestFCMToken();
            if (token) {
                await axios.post('/device-token', { token });
                setIsSubscribed(true);
            } else {
                throw new Error("Token tidak didapatkan");
            }
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
            setModalData({
                show: true,
                type: 'alert',
                message: "Gagal mengaktifkan notifikasi. Pastikan browser mendukung fitur ini."
            });
        }
        setLoading(false);
    };

    const confirmUnsubscribe = () => {
        setModalData({
            show: true,
            type: 'confirm',
            message: 'Anda yakin ingin menonaktifkan notifikasi di perangkat ini?',
            onConfirm: () => {
                setModalData(prev => ({ ...prev, show: false }));
                unsubscribeFromPush();
            }
        });
    };

    const unsubscribeFromPush = async () => {
        setLoading(true);
        try {
            const token = await requestFCMToken();
            if (token) {
                await axios.delete('/device-token', { data: { token } });
            }
            setIsSubscribed(false);
        } catch (error) {
            console.error('Error unsubscribing:', error);
            setModalData({
                show: true,
                type: 'alert',
                message: "Gagal menonaktifkan notifikasi."
            });
        }
        setLoading(false);
    };

    const closeModal = () => {
        setModalData(prev => ({ ...prev, show: false }));
    };

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return (
            <section className={className}>
                <header>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Pengaturan Notifikasi</h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Browser Anda tidak mendukung Web Push Notification.
                    </p>
                </header>
            </section>
        );
    }

    return (
        <section className={className}>
            <header>
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Pengaturan Notifikasi</h2>
                    {isSubscribed ? (
                        <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-full flex items-center gap-1">
                            <Bell className="w-3 h-3" /> Aktif
                        </span>
                    ) : (
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full flex items-center gap-1">
                            <BellOff className="w-3 h-3" /> Nonaktif
                        </span>
                    )}
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Aktifkan notifikasi untuk menerima peringatan anggaran dan pengingat harian. Pengaturan ini spesifik untuk perangkat/browser yang sedang Anda gunakan saat ini.
                </p>
            </header>

            <div className="mt-6">
                {isSubscribed ? (
                    <SecondaryButton onClick={confirmUnsubscribe} disabled={loading} className="text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-900/50">
                        {loading ? 'Memproses...' : 'Nonaktifkan Notifikasi'}
                    </SecondaryButton>
                ) : (
                    <PrimaryButton onClick={subscribeToPush} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600">
                        {loading ? 'Memproses...' : 'Aktifkan Notifikasi'}
                    </PrimaryButton>
                )}
            </div>

            <Transition show={modalData.show}>
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
                                            <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${modalData.type === 'confirm' ? 'bg-rose-100 dark:bg-rose-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                                                {modalData.type === 'confirm' ? (
                                                    <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-500" aria-hidden="true" />
                                                ) : (
                                                    <Info className="h-6 w-6 text-blue-600 dark:text-blue-500" aria-hidden="true" />
                                                )}
                                            </div>
                                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                                <DialogTitle as="h3" className="text-lg font-bold leading-6 text-gray-900 dark:text-white">
                                                    {modalData.type === 'confirm' ? 'Konfirmasi' : 'Informasi'}
                                                </DialogTitle>
                                                <div className="mt-2">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                                        {modalData.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
                                        <button
                                            type="button"
                                            className={`inline-flex w-full justify-center rounded-xl px-3 py-2 text-sm font-semibold text-white shadow-sm sm:w-auto disabled:opacity-50 ${modalData.type === 'confirm' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                                            onClick={modalData.type === 'confirm' ? modalData.onConfirm : closeModal}
                                        >
                                            {modalData.type === 'confirm' ? 'Ya, Nonaktifkan' : 'Mengerti'}
                                        </button>
                                        {modalData.type === 'confirm' && (
                                            <button
                                                type="button"
                                                className="mt-3 inline-flex w-full justify-center rounded-xl bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 sm:mt-0 sm:w-auto"
                                                onClick={closeModal}
                                            >
                                                Batal
                                            </button>
                                        )}
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
