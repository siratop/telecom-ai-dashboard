"use client";

import { useEffect, useState } from 'react';
import { Activity, DollarSign, MessageSquare, CheckCircle, TrendingUp, ShieldAlert, Info, AlertOctagon, Search } from 'lucide-react';
import { supabase } from '../lib/supabase'; 

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  

  const [tasaActiva, setTasaActiva] = useState(42.50);
  const [tipoTasa, setTipoTasa] = useState("api");
  const [cargandoTasa, setCargandoTasa] = useState(true);


  useEffect(() => {
    const cargarTasa = async () => {
      setCargandoTasa(true);
      const tipoGuardado = localStorage.getItem('TIPO_TASA') || 'api';
      const tasaGuardada = localStorage.getItem('TASA_USD');
      
      setTipoTasa(tipoGuardado);

      if (tipoGuardado === 'api') {
        try {
          const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
          if (res.ok) {
            const text = await res.text();
            const data = text ? JSON.parse(text) : null;
            
            if (data && data.promedio) {
              setTasaActiva(data.promedio);
              setCargandoTasa(false);
              return; 
            }
          }
        } catch (error) {
          console.warn("Fallo la API en el Dashboard, usando tasa de respaldo.", error);
        }
      }
      

      if (tasaGuardada) {
        setTasaActiva(parseFloat(tasaGuardada));
      }
      setCargandoTasa(false);
    };

    cargarTasa();
  }, []);


  useEffect(() => {
    async function fetchLogs() {
      try {
        
        const { data, error } = await supabase
          .from('chat_conversaciones')
          .select('*')
          .neq('chat_id', '896406306') 
          .order('ultima_interaccion', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          setLogs(data);
          const costoAcumulado = data.reduce((acc, log) => acc + Number(log.costo_usd || 0), 0);
          setTotalCost(costoAcumulado);
        }
      } catch (err) {
        console.error("Error de red conectando a Supabase:", err);
      }
    }
    
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const logsFiltrados = logs.filter(log => 
    (log.nombre_usuario && log.nombre_usuario.toLowerCase().includes(busqueda.toLowerCase())) ||
    (log.estado && log.estado.toLowerCase().includes(busqueda.toLowerCase())) ||
    (log.chat_id && log.chat_id.includes(busqueda))
  );

  const ventasProtegidasEstimadas = logs.reduce((acc, log) => {
    if (log.estado === "exitoso") return acc + 30; 
    if (log.estado === "activo") return acc + 10;  
    return acc; 
  }, 0);

  const interaccionesFallidas = logs.filter(log => log.estado === "perdido").length;
  const interaccionesExitosas = logs.filter(log => log.estado === "exitoso").length;

  const generarAnalisisDinamico = () => {
    if (logs.length === 0) return "Esperando interacciones para generar análisis operativo...";

    let enfoqueEstrategico = "";
    if (interaccionesExitosas >= interaccionesFallidas) {
      enfoqueEstrategico = "El volumen de consultas muestra una excelente retención. El bot está filtrando exitosamente solicitudes, asegurando la captación de prospectos de manera automática y protegiendo la facturación (valorada hasta en $30 por cliente retenido).";
    } else {
      enfoqueEstrategico = "Se detecta un volumen considerable de abandonos (clientes perdidos). El sistema de IA está filtrando intenciones iniciales, pero se recomienda a Gerencia revisar los historiales para optimizar las respuestas automáticas.";
    }

    return `Análisis Gerencial Operativo: Con un costo marginal de apenas $${totalCost.toFixed(4)} (Bs. ${(totalCost * tasaActiva).toFixed(2)}) en IA, el sistema ha gestionado ${logs.length} interacciones. ${enfoqueEstrategico}`;
  };

  return (
    <div className="p-8 w-full max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Métricas de Rendimiento - Automatización IA</h1>
          <p className="text-gray-500 mt-1">Monitoreo en tiempo real del flujo de Telegram, Google Gemini y análisis de costo-beneficio operativo.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
            {tipoTasa === 'api' ? 'TASA OFICIAL BCV (Auto)' : 'TASA CONFIGURADA (Manual)'}
          </p>
          <div className="inline-flex items-center bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
            <span className="font-mono text-sm font-bold text-blue-700">
              {cargandoTasa ? "Cargando..." : `Bs. ${tasaActiva.toFixed(2)}`}
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs text-gray-500 font-semibold">Consultas Exitosas</p>
            <MessageSquare className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{interaccionesExitosas}</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-red-500 flex flex-col justify-between group relative">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs text-gray-500 font-semibold">Fallas / Canceladas</p>
            <AlertOctagon className="w-4 h-4 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-red-600">{interaccionesFallidas}</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs text-gray-500 font-semibold">Estado de IA</p>
            <Activity className="w-4 h-4 text-green-400" />
          </div>
          <h3 className="text-sm font-bold text-green-600 flex items-center mt-1">
            <CheckCircle className="w-4 h-4 mr-1.5" /> Activo (Gemini)
          </h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs text-gray-500 font-semibold">Gasto (Tokens)</p>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-purple-600">${totalCost.toFixed(4)}</h3>
            <p className="text-[10px] text-gray-400 mt-1">Bs. {(totalCost * tasaActiva).toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-emerald-500 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs text-gray-500 font-semibold">Valor Protegido</p>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-emerald-600">${ventasProtegidasEstimadas}</h3>
            <p className="text-[10px] text-gray-400 mt-1">Bs. {(ventasProtegidasEstimadas * tasaActiva).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start">
        <ShieldAlert className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <span dangerouslySetInnerHTML={{ __html: generarAnalisisDinamico().replace('Análisis Gerencial Operativo:', '<strong class="font-bold">Análisis Gerencial Operativo:</strong>') }} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
          <h3 className="text-sm font-bold text-gray-800">Historial de Operaciones</h3>
          <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1.5 w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Buscar por cliente o estado..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full outline-none text-sm text-gray-700"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-white text-gray-500 text-[10px] uppercase border-b border-gray-100">
                <th className="p-4 font-semibold">Fecha</th>
                <th className="p-4 font-semibold">Cliente</th>
                <th className="p-4 font-semibold">Estado de Conversación</th>
                <th className="p-4 font-semibold text-center">Tokens IA</th>
                <th className="p-4 font-semibold text-center">Costo Est. ($)</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 divide-y divide-gray-50">
              {logsFiltrados.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400 text-sm">No se encontraron interacciones con ese filtro.</td></tr>
              ) : (
                logsFiltrados.map((log, index) => {
                  const esFalla = log.estado === 'perdido';
                  const esExito = log.estado === 'exitoso';
                  
                  return (
                    <tr key={log.chat_id || index} className={esFalla ? 'bg-red-50/30' : 'hover:bg-gray-50/80'}>
                      <td className="p-4 text-xs text-gray-500">{new Date(log.ultima_interaccion).toLocaleString('es-VE')}</td>
                      <td className="p-4 font-medium text-gray-800">
                        {log.nombre_usuario}
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {log.chat_id}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${esFalla ? 'bg-red-100 text-red-700' : esExito ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                          {log.estado}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-xs font-mono text-center">{log.tokens_usados || 0}</td>
                      <td className="p-4 text-purple-600 font-mono font-medium text-xs text-center">${Number(log.costo_usd || 0).toFixed(4)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}