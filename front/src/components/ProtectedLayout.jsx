import { useAuth } from '@/context/AuthContext';
import AuthComponent from '@/components/Auth';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Handle loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, show login
  if (!user) {
    return <AuthComponent />;
  }

  // If authenticated, show protected content
  return <>{children}</>;
}