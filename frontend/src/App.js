import React, { useState, useEffect } from 'react';
import './App.css';
import { getFCMToken, onMessageListener } from './firebase';

function App() {
  const [token, setToken] = useState('');
  const [notification, setNotification] = useState({ title: '', body: '' });
  const [registeredTokens, setRegisteredTokens] = useState(0);
  const [isTokenRegistered, setIsTokenRegistered] = useState(false);
  const [message, setMessage] = useState('');

  // Register for notifications and get FCM token
  useEffect(() => {
    const registerToken = async () => {
      try {
        // Request notification permission
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          const fcmToken = await getFCMToken();
          if (fcmToken) {
            setToken(fcmToken);
            
            // Register token with backend
            const response = await fetch('http://localhost:3001/register-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token: fcmToken }),
            });
            
            if (response.ok) {
              setIsTokenRegistered(true);
              setMessage('Token registered successfully!');
              updateTokensCount();
            } else {
              setMessage('Failed to register token');
            }
          }
        } else {
          setMessage('Notification permission denied');
        }
      } catch (error) {
        console.error('Error registering token:', error);
        setMessage('Error registering token');
      }
    };

    registerToken();

    // Listen for foreground messages
    onMessageListener().then((payload) => {
      console.log('Message received in foreground:', payload);
      setMessage(`Notification received: ${payload.notification.title}`);
    }).catch((error) => {
      console.error('Error in message listener:', error);
    });
  }, []);

  const updateTokensCount = async () => {
    try {
      const response = await fetch('http://localhost:3001/tokens-count');
      const data = await response.json();
      setRegisteredTokens(data.count);
    } catch (error) {
      console.error('Error fetching tokens count:', error);
    }
  };

  const sendNotification = async (toAll = true) => {
    if (!notification.title || !notification.body) {
      setMessage('Please fill in both title and body');
      return;
    }

    console.log('Sending notification:', { toAll, notification });
    setMessage('Sending notification...');

    try {
      const endpoint = toAll ? '/send-notification' : '/send-notification-to-device';
      const body = toAll 
        ? { title: notification.title, body: notification.body }
        : { token, title: notification.title, body: notification.body };

      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(`Notification sent successfully! Success: ${data.successCount || 1}, Failures: ${data.failureCount || 0}`);
        setNotification({ title: '', body: '' });
        updateTokensCount(); // Refresh token count
        
        // Show a browser notification as well
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.body,
            icon: '/logo192.png'
          });
        }
      } else {
        setMessage(`Error: ${data.error}${data.details ? ` - ${data.details}` : ''}`);
        if (data.error.includes('Invalid or expired device tokens')) {
          // Refresh the page to get new tokens
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setMessage('Error sending notification');
    }
  };

  const testNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from your browser',
        icon: '/logo192.png'
      });
    }
  };

  const clearTokens = async () => {
    try {
      const response = await fetch('http://localhost:3001/clear-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message);
        updateTokensCount();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error clearing tokens:', error);
      setMessage('Error clearing tokens');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Firebase Notifications Demo</h1>
        
        <div className="status-section">
          <h2>Status</h2>
          <p>Token: {token ? `${token.substring(0, 20)}...` : 'Not available'}</p>
          <p>Registered: {isTokenRegistered ? 'Yes' : 'No'}</p>
          <p>Total Registered Devices: {registeredTokens}</p>
          <p>Notification Permission: {Notification.permission}</p>
        </div>

        <div className="notification-section">
          <h2>Send Notification</h2>
          <div className="form-group">
            <input
              type="text"
              placeholder="Notification Title"
              value={notification.title}
              onChange={(e) => setNotification({ ...notification, title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <textarea
              placeholder="Notification Body"
              value={notification.body}
              onChange={(e) => setNotification({ ...notification, body: e.target.value })}
            />
          </div>
          <div className="button-group">
            <button onClick={() => sendNotification(true)} disabled={!isTokenRegistered}>
              Send to All Devices
            </button>
            <button onClick={() => sendNotification(false)} disabled={!isTokenRegistered}>
              Send to This Device
            </button>
            <button onClick={testNotification}>
              Test Browser Notification
            </button>
            <button onClick={updateTokensCount}>
              Refresh Token Count
            </button>
            <button onClick={clearTokens} style={{backgroundColor: '#e53e3e'}}>
              Clear All Tokens
            </button>
          </div>
        </div>

        {message && (
          <div className="message">
            {message}
          </div>
        )}

        <div className="instructions">
          <h3>Instructions:</h3>
          <ol>
            <li>Make sure the backend server is running on port 3001</li>
            <li>Allow notifications when prompted</li>
            <li>Fill in the notification form and send a test notification</li>
            <li>Check the browser console for detailed logs</li>
          </ol>
        </div>
      </header>
    </div>
  );
}

export default App;
