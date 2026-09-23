import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  try {
    const { mensaje } = await request.json();

    if (!mensaje) {
      return NextResponse.json({ error: "Falta el mensaje" }, { status: 400 });
    }

    
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: [
        {
          role: 'user',
          parts: [{ text: `Actúa como un asesor estratégico experto en telecomunicaciones, redes de fibra óptica y automatizaciones con n8n enfocado en el mercado de Ciudad Guayana, Venezuela. Responde a la siguiente consulta de forma profesional, técnica y detallada: ${mensaje}` }]
        }
      ],
    });

    const textoRespuesta = response.text || "No se pudo generar una respuesta.";

    return NextResponse.json({ respuesta: textoRespuesta });
  } catch (error) {
    console.error("Error en la API de Gemini:", error);
    return NextResponse.json({ error: "Error al procesar la solicitud con Gemini" }, { status: 500 });
  }
}