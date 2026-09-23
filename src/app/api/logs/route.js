import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://symfbpwmwuedqatdwlrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bWZicHdtd3VlZHFhdGR3bHJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODk3MTAzOCwiZXhwIjoyMTA0NTQ3MDM4fQ.W9Fn-roMcTQ78PdV-LhOEAL2HoM8lpUwsGlD6EI4YEk';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('token_usage_logs')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) {
      console.error("Error devuelto por Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Excepcion en la API de logs:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    
    const { error } = await supabase
      .from('token_usage_logs') 
      .delete()
      .not('id', 'is', null); 

    if (error) throw error;

    return new Response(JSON.stringify({ message: "Historial limpiado correctamente" }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}