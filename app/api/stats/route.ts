import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-client';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    // Fetch counts from the identified tables
    const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: platformsCount } = await supabase.from('platform').select('*', { count: 'exact', head: true });
    const { count: workspacesCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
    const { count: messagesCount } = await supabase.from('messages').select('*', { count: 'exact', head: true });
    const { count: conversationsCount } = await supabase.from('global_chats').select('*', { count: 'exact', head: true });

    const stats = {
      users: usersCount || 0,
      platforms: platformsCount || 0,
      workspaces: workspacesCount || 0,
      messages: messagesCount || 0,
      conversations: conversationsCount || 0,
    };

    return NextResponse.json({ success: true, stats });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ success: false, error: 'Failed to connect to Supabase or fetch data.' }, { status: 500 });
  }
}
