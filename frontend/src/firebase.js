import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration
// Replace with your Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyAvv-3Zp9y3UUpM9Uq1_LqTEJ6fwgsQ6Ms",
    authDomain: "app-integration-poc-442701.firebaseapp.com",
    projectId: "app-integration-poc-442701",
    storageBucket: "app-integration-poc-442701.firebasestorage.app",
    messagingSenderId: "133604368448",
    appId: "1:133604368448:web:649aaf2cc75d7fafd4bfa5",
    measurementId: "G-TQMM52323J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = getMessaging(app);

// VAPID key for web push notifications
// Get this from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
const vapidKey = "BITWW2ZthC4PWkjHtpoYLQfZE98NBgshjQIKkFeMaarjdIxedQaZJl6Pd5yCNx7pC1dfeU-P4F1bzxVq5yo_Z9g";

// Function to get FCM token
export const getFCMToken = async () => {
  try {
    const token = await getToken(messaging, { vapidKey });
    if (token) {
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('No registration token available.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

// Function to handle foreground messages
export const onMessageListener = () => {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      resolve(payload);
    });
  });
};

export { messaging };
