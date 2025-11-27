import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-client';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    // Fetch all platforms from the 'platform' table
    const { data: platforms, error } = await supabase.from('platform').select('*');
    
    if (error) throw error;

    // The frontend expects a 'data' array
    return NextResponse.json({ success: true, data: platforms });

  } catch (error) {
    console.error('Error fetching platforms:', error);
    return NextResponse.json({ success: false, error: 'Failed to connect to Supabase or fetch data.' }, { status: 500 });
  }
}
