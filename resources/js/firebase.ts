import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// ponytail: config is public anyway. Using Vite env vars.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const requestFCMToken = async () => {
    try {
        const registration = await navigator.serviceWorker.ready;
        const token = await getToken(messaging, {
            // ponytail: pass custom SW registration since we use sw.js instead of firebase-messaging-sw.js
            serviceWorkerRegistration: registration,
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
        });
        return token;
    } catch (error) {
        console.error('Error retrieving FCM token', error);
        return null;
    }
};

export const onForegroundMessage = (callback: (payload: any) => void) => {
    return onMessage(messaging, callback);
};
