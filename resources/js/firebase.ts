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
        const token = await getToken(messaging, {
            // ponytail: VAPID key is required for Web Push. Add VITE_FIREBASE_VAPID_KEY to .env
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
