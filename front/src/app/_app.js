// src/app/_app.js
import { useState, useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { ThemeProvider } from 'next-themes';
import client from '@/client/feathers';
import { setupRealTimeListeners } from '@/client/api';

function MyApp({ Component, pageProps }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Setup Feathers.js listeners
    setupRealTimeListeners();
    setInitialized(true);
  }, []);

  if (!initialized) {
    return <div>Loading...</div>;
  }

  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="system">
        <ChatProvider>
          <Component {...pageProps} />
        </ChatProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default MyApp;