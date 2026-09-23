"use client";

import { useState } from 'react';
import { BotMessageSquare, Sparkles, Send, Loader2 } from 'lucide-react';

export default function AsesorIAPage() {
  const [consulta, setConsulta] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [cargando, setCargando] = useState(false);

  
  const sugerenciasRapidas = [
    "¿Como optimizar el tiempo de respuesta para clientes con intermitencia en Ciudad Guayana?",
    "Sugiere estrategias de precios para planes de fibra óptica frente a la inflacion.",
    "¿Que tipo de mensajes automatizados reducen la tasa de abandono en Telegram?",
    "Estrategia para promocionar planes en sectores con alta demanda y poca cobertura."
  ];

  const enviarConsulta = async (textoAPasar) => {
    const textoFinal = textoAPasar || consulta;
    if (!textoFinal.trim()) return;

    setCargando(true);
    setRespuesta("");

    try {
      
      
      const res = await fetch('/api/asesor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: textoFinal })
      });

      const data = await res.json();

      if (res.ok && data.respuesta) {
        setRespuesta(data.respuesta);
      } else {
        setRespuesta("Error: El servicio de asesoría IA no pudo procesar la solicitud en este momento.");
      }
    } catch (error) {
      console.error("Error al consultar la IA:", error);
      setRespuesta("Error de conexión con el servidor de la API de Gemini.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-8 w-full max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <BotMessageSquare className="w-8 h-8 mr-3 text-blue-600" /> Asesor Estratégico IA
        </h1>
        <p className="text-gray-500 mt-1">Utiliza el motor de Gemini para obtener recomendaciones de mejora continua adaptadas al sector de telecomunicaciones en Venezuela.</p>
      </div>


      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Consultas Rapidas Recomendadas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sugerenciasRapidas.map((sug, index) => (
            <button
              key={index}
              onClick={() => { setConsulta(sug); enviarConsulta(sug); }}
              className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all text-left flex items-start group"
            >
              <Sparkles className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-sm text-gray-700 font-medium">{sug}</span>
            </button>
          ))}
        </div>
      </div>


      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Escribe tu propia consulta al Asesor IA:</label>
        <div className="flex gap-3">
          <input 
            type="text"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            placeholder="Ej: ¿Qué mejoras aplicar al flujo de n8n para ahorrar tokens?"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') enviarConsulta(); }}
          />
          <button
            onClick={() => enviarConsulta()}
            disabled={cargando}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm disabled:opacity-50"
          >
            {cargando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>


      {(cargando || respuesta) && (
        <div className="bg-blue-900 text-white p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-3">
            <Sparkles className="w-5 h-5 text-yellow-400 mr-2" />
            <h3 className="font-bold text-lg">Respuesta del Asesor IA</h3>
          </div>
          {cargando ? (
            <div className="flex items-center text-blue-200 py-4">
              <Loader2 className="w-5 h-5 animate-spin mr-3" /> Procesando consulta mediante la API de Gemini...
            </div>
          ) : (
            <p className="text-blue-100 leading-relaxed whitespace-pre-line">{respuesta}</p>
          )}
        </div>
      )}
    </div>
  );
}