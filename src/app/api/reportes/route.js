import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


export async function GET() {
  try {
    const { data, error } = await supabase
      .from('reportes_ia')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error obteniendo reportes:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function POST(request) {
  try {
    const body = await request.json();
    
   
    const { data, error } = await supabase
      .from('reportes_ia')
      .insert([
        { 
          reporte_texto: body.reporte_texto,
          solicitado_por: body.solicitado_por || 'admin'
        }
      ])
      .select(); 

    if (error) throw error;
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error guardando reporte:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function DELETE(request) {
  try {
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const { error } = await supabase
      .from('reportes_ia')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al borrar reporte:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}