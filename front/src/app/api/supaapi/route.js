// File: app/api/supaapi/route.js

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-app.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'xxx';
const supabaseServer = createClient(supabaseUrl, supabaseAnonKey);

// This handles all POST requests to /api/supaapi
export async function POST(request) {
  try {
    // Parse the JSON body
    const { action, ...params } = await request.json();

    switch (action) {
      case 'signIn': {
        const { email, password } = params;
        const { data, error } = await supabaseServer.auth.signInWithPassword({
          email,
          password,
        });
        return NextResponse.json({ data, error });
      }

      case 'signOut': {
        const { error } = await supabaseServer.auth.signOut();
        return NextResponse.json({ data: null, error });
      }

       case 'createChat': {
              const { userId, title, model } = params;
              const { data, error } = await supabaseServer
                .from('chats')
                .insert([
                  {
                    user_id: userId,
                    title,
                    model,
                  },
                ])
                .select()
                .single();
              return NextResponse.json({ chat: data, error });
            }

      // ... repeat for all your other actions ...

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
