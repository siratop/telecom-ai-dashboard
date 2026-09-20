import { BookOpen, LayoutDashboard, MessageCircle, Map, History, Settings, Bot, ShieldCheck } from 'lucide-react';

export default function ManualUsuario() {
  const secciones = [
    {
      icono: <LayoutDashboard className="w-6 h-6 text-blue-600" />,
      titulo: "1. Panel Principal (Dashboard)",
      descripcion: "Centro de monitoreo en tiempo real. Visualiza el total de consultas procesadas, el estado de conectividad con Supabase y el cálculo de costos operativos basado en el consumo de tokens de Gemini AI.",
      color: "bg-blue-50 border-blue-200"
    },
    {
      icono: <MessageCircle className="w-6 h-6 text-emerald-600" />,
      titulo: "2. Centros de Chat (Telegram)",
      descripcion: "Pasarelas de comunicación CRM en vivo. Permite sincronizar mensajes entrantes, alternar entre respuestas automáticas del Bot IA o pausarlo para intervenir de forma manual como operador.",
      color: "bg-emerald-50 border-emerald-200"
    },
    {
      icono: <Map className="w-6 h-6 text-amber-600" />,
      titulo: "3. Mapa de Cobertura e Infraestructura",
      descripcion: "Herramienta geoespacial interactiva para visualizar la red de fibra óptica. Permite trazar nuevos nodos, consultar coordenadas precisas y determinar radios de factibilidad técnica para clientes.",
      color: "bg-amber-50 border-amber-200"
    },
    {
      icono: <History className="w-6 h-6 text-purple-600" />,
      titulo: "4. Historial y Auditoría",
      descripcion: "Registro inmutable de todas las interacciones. Incluye filtros de búsqueda avanzada por intención o teléfono, limpieza segura de base de datos y exportación de reportes oficiales en formato PDF.",
      color: "bg-purple-50 border-purple-200"
    },
    {
      icono: <Settings className="w-6 h-6 text-slate-600" />,
      titulo: "5. Configuración del Sistema",
      descripcion: "Panel de administración segura. Gestiona las credenciales de la API de Telegram (Token y Chat ID), enciende o apaga el sistema global, y ajusta la temperatura (creatividad) de las respuestas de la IA.",
      color: "bg-slate-50 border-slate-200"
    },
    {
      icono: <ShieldCheck className="w-6 h-6 text-indigo-600" />,
      titulo: "6. Monitor de Red y Webhooks",
      descripcion: "Diagnóstico automatizado de la arquitectura del sistema. Verifica la latencia y disponibilidad de los flujos de n8n, la base de datos PostgreSQL y los servicios de Google AI Studio.",
      color: "bg-indigo-50 border-indigo-200"
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
      <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <BookOpen className="w-7 h-7 mr-3 text-blue-600" />
            Manual de Operación Corporativa
          </h2>
          <p className="text-gray-500 mt-2 text-sm max-w-2xl">
            Documentación técnica y guía de usuario para el personal administrativo y operadores de red de Telecom AI. Este panel unifica la atención al cliente automatizada y la gestión de infraestructura.
          </p>
        </div>
        <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 flex items-center shadow-sm">
          <Bot className="w-4 h-4 mr-2" />
          Telecom
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {secciones.map((seccion, index) => (
            <div 
              key={index} 
              className={`p-6 rounded-xl border transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${seccion.color}`}
            >
              <div className="flex items-center mb-4">
                <div className="p-2.5 bg-white rounded-lg shadow-sm mr-4">
                  {seccion.icono}
                </div>
                <h3 className="font-bold text-gray-800 text-base">{seccion.titulo}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {seccion.descripcion}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 text-center">
          <strong>Nota de Privacidad:</strong> Todas las operaciones realizadas a través del Centro de Chat y Modificaciones de Configuración son registradas bajo estrictos protocolos de auditoría en Supabase.
        </div>
      </div>
    </div>
  );
}