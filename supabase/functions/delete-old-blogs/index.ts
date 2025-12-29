import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting deletion of blogs older than 30 days...');

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Delete blogs older than 30 days
    const { data: deletedBlogs, error } = await supabase
      .from('blogs')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString())
      .select();

    if (error) {
      console.error('Error deleting old blogs:', error);
      throw error;
    }

    console.log(`Successfully deleted ${deletedBlogs?.length || 0} old blogs`);

    return new Response(
      JSON.stringify({
        success: true,
        deletedCount: deletedBlogs?.length || 0,
        message: `Deleted ${deletedBlogs?.length || 0} blogs older than 30 days`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in delete-old-blogs function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
