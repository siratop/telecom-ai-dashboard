import { ShieldAlert, Scale, FileText, Database, Lock, UserCheck } from 'lucide-react';

export default function TerminosLegalesPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6 max-w-5xl mx-auto">
      {/* Cabecera */}
      <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Scale className="w-7 h-7 mr-3 text-blue-600" />
            Términos Legales, Privacidad y Normativa
          </h2>
          <p className="text-gray-500 mt-2 text-sm max-w-2xl">
            Marco normativo, políticas de manejo de datos y directrices operativas implementadas para el sistema de automatización de telecomunicaciones en Ciudad Guayana.
          </p>
        </div>
        <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 flex items-center shadow-sm">
          <ShieldAlert className="w-4 h-4 mr-2" />
          Marco Legal Venezolano
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="p-6 md:p-8 space-y-8 text-gray-700">
        
        {/* Sección 1: Marco Legal Venezolano */}
        <div className="p-6 bg-blue-50/40 rounded-xl border border-blue-100 space-y-3">
          <h3 className="text-base font-bold text-blue-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            1. Fundamento Legal en la Legislación Venezolana
          </h3>
          <p className="text-sm leading-relaxed text-gray-600">
            El desarrollo y operación de este sistema se rige bajo los lineamientos establecidos en el ordenamiento jurídico de la República Bolivariana de Venezuela:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1.5 text-gray-600 pl-2">
            <li><strong>Ley Orgánica de Telecomunicaciones:</strong> Regula la prestación de servicios de telecomunicaciones, garantizando la eficiencia, calidad y los derechos de los usuarios en el acceso a la red de fibra óptica.</li>
            <li><strong>Ley Especial contra los Delitos Informáticos:</strong> Establece la protección integral de los sistemas que utilicen tecnologías de información, resguardando la confidencialidad de los datos almacenados en nuestras bases de datos PostgreSQL (Supabase).</li>
            <li><strong>Derechos del Usuario (CONATEL):</strong> Las respuestas automatizadas del bot y la atención del operador aseguran el respeto a los derechohabientes del servicio de telecomunicaciones, brindando información transparente y veraz sobre planes y factibilidad.</li>
          </ul>
        </div>

        {/* Seccion 2: Protección de Datos y Privacidad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
            <div className="flex items-center text-gray-900 font-bold text-sm">
              <Database className="w-5 h-5 mr-2 text-emerald-600" />
              2. Almacenamiento y Cifrado (Supabase)
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Los números telefónicos y registros conversacionales recolectados a través de las pasarelas de Telegram y WhatsApp son seudonimizados y almacenados en bases de datos relacionales cifradas. No se comercializan ni ceden datos personales a terceros bajo ninguna circunstancia.
            </p>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
            <div className="flex items-center text-gray-900 font-bold text-sm">
              <Lock className="w-5 h-5 mr-2 text-purple-600" />
              3. Uso Ético de Inteligencia Artificial
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Las consultas procesadas por Google Gemini (API) se limitan estrictamente a la extracción de intenciones, validación geoespacial de cobertura y soporte técnico inicial, cumpliendo con estrictas políticas de minimización de datos personales identificables (PII).
            </p>
          </div>
        </div>

        {/* Seccion 3: Directrices de Atención al Cliente */}
        <div className="p-6 bg-amber-50/50 rounded-xl border border-amber-200 space-y-3">
          <h3 className="text-base font-bold. text-amber-900 flex items-center">
            <UserCheck className="w-5 h-5 mr-2. text-amber-600" />
            4. Directrices de Atención al Cliente y Transparencia Operativa
          </h3>
          <p className="text-sm leading-relaxed text-gray-600">
            Para garantizar una experiencia de usuario óptima y profesional en Ciudad Guayana, el sistema contempla los siguientes compromisos de servicio:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-white p-4 rounded-lg border border-amber-100 shadow-sm">
              <span className="font-bold text-xs text-amber-800 uppercase block mb-1">Disponibilidad 24/7</span>
              <p className="text-xs text-gray-600">El bot de asistencia responde de forma inmediata consultas sobre planes y cobertura a cualquier hora.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-amber-100 shadow-sm">
              <span className="font-bold text-xs text-amber-800 uppercase block mb-1">Intervención Humana</span>
              <p className="text-xs text-gray-600">El operador humano puede desactivar el Modo IA en cualquier momento para atender casos complejos de soporte.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-amber-100 shadow-sm">
              <span className="font-bold text-xs text-amber-800 uppercase block mb-1">Auditoría y Trazabilidad</span>
              <p className="text-xs text-gray-600">Cada interacción queda registrada en los logs del sistema, permitiendo auditorías de calidad de servicio.</p>
            </div>
          </div>
        </div>

        {/* Pie Informativo */}
        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Telecom  • Universidad Nacional Experimental de Guayana (UNEG) • Puerto Ordaz, Venezuela.
          </p>
        </div>

      </div>
    </div>
  );
}