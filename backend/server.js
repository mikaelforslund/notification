const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// Store device tokens (in production, use a database)
const deviceTokens = new Set();

// Register device token endpoint
app.post('/register-token', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }
  
  deviceTokens.add(token);
  console.log('Device token registered:', token);
  
  res.json({ 
    success: true, 
    message: 'Token registered successfully',
    totalTokens: deviceTokens.size 
  });
});

// Send notification to all devices
app.post('/send-notification', async (req, res) => {
  const { title, body, data } = req.body;
  
  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body are required' });
  }
  
  if (deviceTokens.size === 0) {
    return res.status(400).json({ error: 'No devices registered' });
  }
  
  try {
    const tokens = Array.from(deviceTokens);
    
    // If only one token, use send instead of sendMulticast
    if (tokens.length === 1) {
      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        token: tokens[0],
      };
      
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message to single device:', response);
      
      res.json({
        success: true,
        message: 'Notification sent successfully',
        successCount: 1,
        failureCount: 0,
        response
      });
    } else {
      // For multiple tokens, use sendMulticast with better error handling
      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        tokens: tokens,
      };
      
      const response = await admin.messaging().sendMulticast(message);
      
      console.log('Successfully sent message to multiple devices:', response);
      
      // Remove failed tokens from our set
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.log(`Removing invalid token: ${tokens[idx]}`);
          deviceTokens.delete(tokens[idx]);
        }
      });
      
      res.json({
        success: true,
        message: 'Notification sent successfully',
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses
      });
    }
    
  } catch (error) {
    console.error('Error sending message:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'messaging/unknown-error' && error.message.includes('404')) {
      res.status(400).json({ 
        error: 'Invalid or expired device tokens. Please refresh the page to get new tokens.',
        details: 'Some device tokens are no longer valid. The app will automatically clean up invalid tokens.'
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send notification',
        details: error.message 
      });
    }
  }
});

// Send notification to specific device
app.post('/send-notification-to-device', async (req, res) => {
  const { token, title, body, data } = req.body;
  
  if (!token || !title || !body) {
    return res.status(400).json({ error: 'Token, title and body are required' });
  }
  
  try {
    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      token,
    };
    
    const response = await admin.messaging().send(message);
    
    console.log('Successfully sent message to device:', response);
    
    res.json({
      success: true,
      message: 'Notification sent successfully',
      response
    });
    
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Get registered tokens count
app.get('/tokens-count', (req, res) => {
  res.json({ 
    count: deviceTokens.size,
    tokens: Array.from(deviceTokens)
  });
});

// Clear all tokens (useful for testing)
app.post('/clear-tokens', (req, res) => {
  const previousCount = deviceTokens.size;
  deviceTokens.clear();
  res.json({ 
    success: true,
    message: `Cleared ${previousCount} tokens`,
    count: deviceTokens.size
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
