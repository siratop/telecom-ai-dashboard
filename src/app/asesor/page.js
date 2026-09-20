"use client";

import { useState } from 'react';
import { BotMessageSquare, Sparkles, Send, Loader2 } from 'lucide-react';

export default function AsesorIAPage() {
  const [consulta, setConsulta] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [cargando, setCargando] = useState(false);

  
  const sugerenciasRapidas = [
    "¿Cómo optimizar el tiempo de respuesta para clientes con intermitencia en Ciudad Guayana?",
    "Sugiere estrategias de precios para planes de fibra óptica frente a la inflación.",
    "¿Qué tipo de mensajes automatizados reducen la tasa de abandono en WhatsApp?",
    "Estrategia para promocionar planes en sectores con alta demanda y poca cobertura."
  ];

  const enviarConsulta = (textoAPasar) => {
    const textoFinal = textoAPasar || consulta;
    if (!textoFinal.trim()) return;

    setCargando(true);
    setRespuesta("");

    
    setTimeout(() => {
      setRespuesta(`Análisis estratégico (Gemini AI) para el mercado venezolano: \n\nPara la consulta: "${textoFinal}", se recomienda implementar un filtro previo en n8n que detecte palabras clave sobre fallas eléctricas o de red. En el contexto de Ciudad Guayana, mantener plantillas de respuesta rápida que indiquen el estado de los nodos principales reduce hasta un 40% la saturación de los operadores humanos.`);
      setCargando(false);
    }, 1500);
  };

  return (
    <div className="p-8 w-full max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <BotMessageSquare className="w-8 h-8 mr-3 text-blue-600" /> Asesor Estratégico IA
        </h1>
        <p className="text-gray-500 mt-1">Utiliza el motor de Gemini para obtener recomendaciones de mejora continua adaptadas al sector de telecomunicaciones en Venezuela.</p>
      </div>

      {/* Tarjetas de Consultas Rápidas Predefinidas */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Consultas Rápidas Recomendadas</h3>
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

      {/* Input de Consulta Libre */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Escribe tu propia consulta al Asesor IA:</label>
        <div className="flex gap-3">
          <input 
            type="text"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            placeholder="Ej: ¿Qué mejoras aplicar al flujo de n8n para ahorrar tokens?"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
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

      {/* Resultado de la IA */}
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