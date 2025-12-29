import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SheetData {
  type: 'listing' | 'user' | 'admin_activity';
  data: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Authentication required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate user session
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Invalid user session:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid session' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { type, data }: SheetData = await req.json();

    // Validate input
    if (!type || !['listing', 'user', 'admin_activity'].includes(type)) {
      console.error('Invalid type parameter:', type);
      return new Response(
        JSON.stringify({ error: 'Invalid type parameter' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!data || typeof data !== 'object') {
      console.error('Invalid data parameter');
      return new Response(
        JSON.stringify({ error: 'Invalid data parameter' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify admin role for admin_activity syncs
    if (type === 'admin_activity') {
      const { data: hasAdminRole } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (!hasAdminRole) {
        console.error('Non-admin user attempted admin_activity sync:', user.id);
        return new Response(
          JSON.stringify({ error: 'Admin access required for admin_activity syncs' }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    const GOOGLE_SHEETS_API_KEY = Deno.env.get('GOOGLE_SHEETS_API_KEY');
    const SPREADSHEET_ID = Deno.env.get('GOOGLE_SPREADSHEET_ID');

    if (!GOOGLE_SHEETS_API_KEY || !SPREADSHEET_ID) {
      throw new Error('Missing Google Sheets credentials');
    }

    // Format data based on type
    let values: any[][];
    let sheetName: string;
    
    if (type === 'listing') {
      sheetName = 'Listings';
      values = [[
        data.id,
        data.product_name,
        data.description,
        data.rent_price,
        data.product_type,
        data.owner_user_id,
        data.listing_status,
        data.payment_verified ? 'Yes' : 'No',
        data.views,
        data.rating,
        data.created_at
      ]];
    } else if (type === 'user') {
      sheetName = 'Users';
      values = [[
        data.id,
        data.name,
        data.phone,
        data.pin_code,
        data.created_at
      ]];
    } else {
      sheetName = 'Admin Activity';
      values = [[
        data.action,
        data.admin_id,
        data.target_id,
        data.details,
        data.timestamp
      ]];
    }

    // Append data to Google Sheets
    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}:append?valueInputOption=RAW&key=${GOOGLE_SHEETS_API_KEY}`;

    const response = await fetch(sheetsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Google Sheets API error:', error);
      throw new Error(`Failed to sync to Google Sheets: ${error}`);
    }

    const result = await response.json();
    console.log('Successfully synced to Google Sheets for user:', user.id, 'type:', type);

    return new Response(
      JSON.stringify({ success: true, message: 'Data synced to Google Sheets' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
