# Firebase Notifications Demo

A full-stack application demonstrating Firebase Cloud Messaging (FCM) for push notifications.

## Features

- Backend API for sending notifications
- React frontend with notification management
- Device token registration
- Send notifications to all devices or specific devices
- Background notification handling

## Setup Instructions

### 1. Firebase Project Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Cloud Messaging in your project
3. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Firebase credentials:
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account-email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
   PORT=3001
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Add Firebase SDK:
   ```bash
   npm install firebase
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## API Endpoints

- `POST /register-token` - Register a device token
- `POST /send-notification` - Send notification to all devices
- `POST /send-notification-to-device` - Send notification to specific device
- `GET /tokens-count` - Get registered tokens count
- `GET /health` - Health check

## Usage

1. Open the frontend application
2. Allow notifications when prompted
3. The device token will be automatically registered
4. Use the notification form to send test notifications
5. Check the backend logs for delivery status

## Project Structure

```
firebase-notifications-demo/
├── backend/
│   ├── server.js          # Express server with FCM endpoints
│   └── package.json       # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   └── firebase.js    # Firebase configuration
│   └── public/
│       └── firebase-messaging-sw.js  # Service worker
└── README.md
```
