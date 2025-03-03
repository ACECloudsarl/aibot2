import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';

export default function AuthComponent() {
  return (
    <div className="max-w-md mx-auto my-8 p-8 bg-background border rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Welcome to AI Chat</h2>
      <Auth 
        supabaseClient={supabase} 
        appearance={{ theme: ThemeSupa }}
        theme={ThemeSupa}
        providers={['google', 'github']}
        redirectTo={`${window.location.origin}/`}
        magicLink={true}
      />
    </div>
  );
}