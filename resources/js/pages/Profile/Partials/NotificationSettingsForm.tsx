import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Bell, BellOff } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function NotificationSettingsForm({ className = '' }: { className?: string }) {
    const { vapid_public_key } = usePage().props as any;
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkSubscription();
    }, []);

    const checkSubscription = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            setLoading(false);
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
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
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                setLoading(false);
                return;
            }

            const registration = await navigator.serviceWorker.ready;
            const subscribeOptions = {
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapid_public_key)
            };

            const pushSubscription = await registration.pushManager.subscribe(subscribeOptions);
            await axios.post('/push-subscribe', pushSubscription.toJSON());
            
            setIsSubscribed(true);
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
            alert("Gagal mengaktifkan notifikasi.");
        }
        setLoading(false);
    };

    const unsubscribeFromPush = async () => {
        if (!confirm('Anda yakin ingin menonaktifkan notifikasi di perangkat ini?')) return;
        
        setLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            
            if (subscription) {
                await axios.delete('/push-subscribe', { data: { endpoint: subscription.endpoint } });
                await subscription.unsubscribe();
            }
            setIsSubscribed(false);
        } catch (error) {
            console.error('Error unsubscribing:', error);
            alert("Gagal menonaktifkan notifikasi.");
        }
        setLoading(false);
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
                    <SecondaryButton onClick={unsubscribeFromPush} disabled={loading} className="text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-900/50">
                        {loading ? 'Memproses...' : 'Nonaktifkan Notifikasi'}
                    </SecondaryButton>
                ) : (
                    <PrimaryButton onClick={subscribeToPush} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600">
                        {loading ? 'Memproses...' : 'Aktifkan Notifikasi'}
                    </PrimaryButton>
                )}
            </div>
        </section>
    );
}
