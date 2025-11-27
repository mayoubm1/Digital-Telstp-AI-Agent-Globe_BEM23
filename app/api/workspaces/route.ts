import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-client';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    // Fetch all workspaces from the 'projects' table
    const { data: workspaces, error } = await supabase.from('projects').select('*');
    
    if (error) throw error;

    // The frontend expects a 'data' array
    return NextResponse.json({ success: true, data: workspaces });

  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json({ success: false, error: 'Failed to connect to Supabase or fetch data.' }, { status: 500 });
  }
}
