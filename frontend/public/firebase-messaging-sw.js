// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyAvv-3Zp9y3UUpM9Uq1_LqTEJ6fwgsQ6Ms",
  authDomain: "app-integration-poc-442701.firebaseapp.com",
  projectId: "app-integration-poc-442701",
  storageBucket: "app-integration-poc-442701.firebasestorage.app",
  messagingSenderId: "133604368448",
  appId: "1:133604368448:web:649aaf2cc75d7fafd4bfa5"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  // Handle the click action
  event.waitUntil(
    clients.openWindow('/')
  );
});
