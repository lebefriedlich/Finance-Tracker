import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Bell, X } from 'lucide-react';

export default function PushNotificationPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const { vapid_public_key } = usePage().props as any;

    useEffect(() => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            return;
        }

        if (Notification.permission === 'default') {
            setShowPrompt(true);
        }
    }, []);

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
        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                setShowPrompt(false);
                return;
            }

            const registration = await navigator.serviceWorker.ready;
            
            const subscribeOptions = {
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapid_public_key)
            };

            const pushSubscription = await registration.pushManager.subscribe(subscribeOptions);

            await axios.post('/push-subscribe', pushSubscription.toJSON());
            
            setShowPrompt(false);
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
            setShowPrompt(false);
        }
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-20 right-6 z-50 xl:bottom-6">
            <div className="bg-white dark:bg-darkblack-600 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-5 border border-gray-100 dark:border-darkblack-400 w-80 relative flex flex-col gap-3">
                <button 
                    onClick={() => setShowPrompt(false)} 
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 dark:bg-emerald-500/20 p-2.5 rounded-full text-emerald-600 dark:text-emerald-400">
                        <Bell className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white leading-tight">Aktifkan Notifikasi</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Dapatkan pengingat harian dan peringatan batas anggaran agar keuangan Anda tetap terkontrol.
                </p>
                <button 
                    onClick={subscribeToPush}
                    className="mt-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl transition-colors text-sm w-full"
                >
                    Izinkan Notifikasi
                </button>
            </div>
        </div>
    );
}
