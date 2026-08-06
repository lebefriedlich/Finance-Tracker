// ponytail: replaced raw push with firebase compat SDK for reliable background delivery
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// ponytail: Firebase config needed in SW too. You'll need to inject these or hardcode if simple.
// Using URL search params trick to pass config to SW is cleaner, but hardcoding works.
firebase.initializeApp({
    apiKey: new URL(location).searchParams.get('apiKey'),
    projectId: new URL(location).searchParams.get('projectId'),
    messagingSenderId: new URL(location).searchParams.get('messagingSenderId'),
    appId: new URL(location).searchParams.get('appId'),
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/favicon.svg'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
