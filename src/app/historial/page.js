"use client";

import { useState, useEffect } from 'react';
import { Download, Trash2, Search, AlertCircle, History, Calendar, Bot, Loader2, X, FileText, List, MessageCircle, Send, CornerDownRight, ChevronDown, ChevronUp, DollarSign, Zap, Filter, CheckCircle, MessageSquare } from 'lucide-react';
import jsPDF from 'jspdf';
import { supabase } from '../../lib/supabase';

export default function HistorialPage() {
 
  const [logs, setLogs] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [periodo, setPeriodo] = useState("todos"); 
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [cargandoLogs, setCargandoLogs] = useState(true);
  

  const [reportes, setReportes] = useState([]);
  const [busquedaReportes, setBusquedaReportes] = useState("");
  const [cargandoReportes, setCargandoReportes] = useState(true);
  const [cargandoGeneracion, setCargandoGeneracion] = useState(false);
  
 
  const [tabActiva, setTabActiva] = useState("logs");
  const [reporteReciente, setReporteReciente] = useState(null);

  const [reporteExpandido, setReporteExpandido] = useState(null); 

  const [chatActivo, setChatActivo] = useState(null);
  const [pregunta, setPregunta] = useState("");
  const [respuestaIA, setRespuestaIA] = useState("");
  const [cargandoPregunta, setCargandoPregunta] = useState(false);

  const cargarDatos = async () => {
    setCargandoLogs(true);
    setCargandoReportes(true);

    try {
      // 1. Limpieza de chats inactivos (> 24 hrs) en Supabase
      const tiempoLimite = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: inactivos } = await supabase
        .from('chat_conversaciones')
        .select('chat_id')
        .eq('estado', 'activo')
        .lt('ultima_interaccion', tiempoLimite);

      if (inactivos && inactivos.length > 0) {
        const ids = inactivos.map(c => c.chat_id);
        await supabase.from('chat_conversaciones').update({ estado: 'perdido' }).in('chat_id', ids);
      }

      // 2. Cargar Logs de Telegram desde Supabase
      const { data: dataLogs, error: errLogs } = await supabase
        .from('chat_conversaciones')
        .select('*')
        .neq('chat_id', '896406306') 
        .order('ultima_interaccion', { ascending: false });

      if (errLogs) throw errLogs;
      if (dataLogs) setLogs(dataLogs);

     
      const { data: dataReportes, error: errReportes } = await supabase
        .from('reportes_ia')
        .select('*')
        .order('created_at', { ascending: false });

      if (!errReportes && dataReportes) setReportes(dataReportes);

    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setCargandoLogs(false);
      setCargandoReportes(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarDatos();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

 
  const logsFiltrados = logs.filter(log => {

    const cumpleBusqueda = 
      (log.nombre_usuario && log.nombre_usuario.toLowerCase().includes(busqueda.toLowerCase())) || 
      (log.chat_id && log.chat_id.includes(busqueda));
    
    if (!cumpleBusqueda) return false;
    if (filtroEstado !== "todos" && log.estado !== filtroEstado) return false;

    if (periodo === "todos") return true;
    
    const fechaLog = new Date(log.ultima_interaccion);
    const ahora = new Date();

    if (periodo === "hoy") return fechaLog.toDateString() === ahora.toDateString();
    if (periodo === "semana") {
      const unaSemanaAtras = new Date();
      unaSemanaAtras.setDate(ahora.getDate() - 7);
      return fechaLog >= unaSemanaAtras;
    }
    if (periodo === "mes") return fechaLog.getMonth() === ahora.getMonth() && fechaLog.getFullYear() === ahora.getFullYear();
    if (periodo === "año") return fechaLog.getFullYear() === ahora.getFullYear();
    
    return true;
  });

  
  const balanceCosto = logsFiltrados.reduce((acc, log) => acc + (Number(log.costo_usd) || 0), 0);
  const balanceTokens = logsFiltrados.reduce((acc, log) => acc + (Number(log.tokens_usados) || 0), 0);

  
  const reportesFiltrados = reportes.filter(rep => {
    const textoReporte = rep.reporte_texto ? rep.reporte_texto.toLowerCase() : "";
    const fechaReporte = rep.created_at ? new Date(rep.created_at).toLocaleDateString() : "";
    return textoReporte.includes(busquedaReportes.toLowerCase()) || fechaReporte.includes(busquedaReportes);
  });

  const getEstadoUI = (estado) => {
    switch (estado) {
      case 'exitoso':
        return <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center w-max"><CheckCircle className="w-3 h-3 mr-1" /> Retenido</span>;
      case 'perdido':
        return <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center w-max"><AlertCircle className="w-3 h-3 mr-1" /> Perdido</span>;
      default:
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center w-max"><MessageSquare className="w-3 h-3 mr-1" /> En curso</span>;
    }
  };

  const exportarPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(30, 58, 138); 
      doc.text("Telecom AI - Auditoría de Telegram", 14, 20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Ciudad Guayana, Venezuela | Sistema de Atención Automatizada", 14, 28);
      doc.text(`Filtro: ${periodo.toUpperCase()} | Costo Total: $${balanceCosto.toFixed(4)}`, 14, 34);
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 40, 196, 40);
      
      let posY = 50;
      if (logsFiltrados.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.text("No hay registros en este período seleccionado.", 14, posY);
      }
      
      logsFiltrados.forEach((log, index) => {
        if (posY > 270) { 
          doc.addPage();
          posY = 20;
        }
        doc.setFillColor(245, 247, 250);
        doc.roundedRect(14, posY, 182, 24, 2, 2, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(30, 30, 30);
        doc.text(`Registro #${index + 1} - Cliente: ${log.nombre_usuario || "N/A"}`, 18, posY + 8);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text(`Estado: ${log.estado.toUpperCase()}`, 18, posY + 16);
        doc.text(`Tokens: ${log.tokens_usados || 0}`, 100, posY + 16);
        doc.text(`Costo: $${Number(log.costo_usd || 0).toFixed(4)}`, 160, posY + 16);
        posY += 30;
      });
      doc.save(`Auditoria_Telegram_${periodo}_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (error) {
      console.warn("Error al generar el PDF:", error);
      alert("Hubo un error al generar el PDF.");
    }
  };

  const confirmarBorrado = async () => {
    const confirmacion = window.confirm("⚠️ ¿Estás seguro de que deseas vaciar TODOS los registros de interacciones?");
    if (confirmacion) {
      try {
        await supabase.from('chat_conversaciones').delete().neq('chat_id', '0');
        await supabase.from('chat_mensajes').delete().neq('id', 0);
        setLogs([]); 
        alert("✅ Registros eliminados exitosamente.");
      } catch (error) {
        console.warn("Error al borrar registros:", error);
      }
    }
  };

  const generarReporte = async () => {
    setCargandoGeneracion(true);
    setReporteReciente(null); 
    setTabActiva("reportes"); 
    
    const chatGuardado = localStorage.getItem('TELEGRAM_CHAT_ID');
    const CHAT_ID_ADMIN = chatGuardado ? chatGuardado : '896406306'; 
    
    const datosLimpios = logsFiltrados.map(log => ({
      fecha: log.ultima_interaccion,
      estado: log.estado,
      total_tokens: log.tokens_usados,
      costo: log.costo_usd
    }));
    
    try {
      const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/reporte-ia';
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'generar_reporte_diario', chat_id_admin: CHAT_ID_ADMIN, datos: datosLimpios })
      });
      
      const data = await response.json(); 
      
      if(data && data.reporte) {
        setReporteReciente(data.reporte); 

        try {
          const { data: savedData, error: dbError } = await supabase
            .from('reportes_ia')
            .insert([{ reporte_texto: data.reporte, solicitado_por: 'admin' }])
            .select();
          
          if (dbError) {
            console.warn(`Error BD: ${dbError.message}`);
          } else if (savedData && savedData.length > 0) {
            setReportes(prev => [savedData[0], ...prev]);
          }
        } catch (saveError) {
          console.warn("Fallo al guardar reporte:", saveError);
        }
      } else {
        alert("El reporte se genero, pero n8n no devolvio el texto.");
      }
    } catch (error) {
      console.warn("Error n8n:", error);
      alert("Hubo un error al enviar la señal al servidor automatizado.");
    } finally {
      setCargandoGeneracion(false);
    }
  };

  const eliminarReporte = async (id, e) => {
    e.stopPropagation(); 
    if (window.confirm("¿Estás seguro de eliminar este reporte gerencial?")) {
      try {
        const { error } = await supabase.from('reportes_ia').delete().eq('id', id);
        if (!error) setReportes(prev => prev.filter(rep => rep.id !== id));
      } catch (error) {
        console.warn("Error borrando reporte:", error);
      }
    }
  };

  const preguntarSobreReporte = async (reporteTexto) => {
    if (!pregunta.trim()) return;
    setCargandoPregunta(true);
    setRespuestaIA("");
    try {
      const N8N_CHAT_URL = 'http://localhost:5678/webhook/reporte-ia';
      const response = await fetch(N8N_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'preguntar_reporte', reporte_contexto: reporteTexto, pregunta_usuario: pregunta })
      });
      const data = await response.json();
      setRespuestaIA(data?.respuesta || "Análisis completado, pero sin formato válido.");
    } catch (error) {
      console.warn("Error de conexión con n8n:", error);
      setRespuestaIA("⚠️ Error de conexion con n8n.");
    } finally {
      setCargandoPregunta(false);
    }
  };

  const toggleReporte = (id) => {
    if (reporteExpandido === id) {
      setReporteExpandido(null);
      setChatActivo(null);
    } else {
      setReporteExpandido(id);
      setChatActivo(null); 
    }
  };

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <History className="w-8 h-8 mr-3 text-blue-600" /> Auditoría e Informes
          </h1>
          <p className="text-gray-500 mt-1">Revisa el historial de interacciones de Telegram o consulta reportes de IA.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={generarReporte}
            disabled={cargandoGeneracion}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium text-sm disabled:opacity-60 cursor-pointer"
          >
            {cargandoGeneracion ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
            {cargandoGeneracion ? 'Analizando...' : 'Generar Nuevo Reporte'}
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex space-x-2 border-b border-gray-200 mb-6">
        <button onClick={() => setTabActiva("logs")} className={`flex items-center px-6 py-3 font-medium text-sm transition-colors border-b-2 ${tabActiva === "logs" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
          <List className="w-4 h-4 mr-2" /> Interacciones de Telegram
        </button>
        <button onClick={() => setTabActiva("reportes")} className={`flex items-center px-6 py-3 font-medium text-sm transition-colors border-b-2 ${tabActiva === "reportes" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
          <FileText className="w-4 h-4 mr-2" /> Reportes Gerenciales (IA)
        </button>
      </div>

      {/* VISTA LOGS */}
      {tabActiva === "logs" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Costo IA Acumulado ({periodo})</p>
                <h3 className="text-3xl font-bold text-purple-600">${balanceCosto.toFixed(4)}</h3>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Tokens Consumidos ({periodo})</p>
                <h3 className="text-3xl font-bold text-blue-600">{balanceTokens.toLocaleString()}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center flex-1 w-full max-w-sm">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input type="text" placeholder="Buscar por usuario o ID..." className="w-full outline-none text-gray-700 bg-transparent text-sm" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">

              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2">
                <Filter className="w-4 h-4 text-gray-500 mr-2 ml-1" />
                <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="py-2 bg-transparent text-sm text-gray-700 outline-none font-medium min-w-[140px]">
                  <option value="todos">Todos los Estados</option>
                  <option value="activo">En Curso (Activo)</option>
                  <option value="exitoso">Retenidos (Exitoso)</option>
                  <option value="perdido">Perdidos / Abandonos</option>
                </select>
              </div>


              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2">
                <Calendar className="w-4 h-4 text-blue-600 mr-2 ml-1" />
                <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="py-2 bg-transparent text-sm text-gray-700 outline-none font-medium">
                  <option value="todos">Historial Completo</option>
                  <option value="hoy">Día (Hoy)</option>
                  <option value="semana">Última Semana</option>
                  <option value="mes">Mes Actual</option>
                  <option value="año">Este Año</option>
                </select>
              </div>

              <button onClick={exportarPDF} className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold whitespace-nowrap"><Download className="w-4 h-4 mr-1.5" /> PDF</button>
              <button onClick={confirmarBorrado} className="flex items-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold whitespace-nowrap"><Trash2 className="w-4 h-4 mr-1.5" /> Limpiar</button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {cargandoLogs ? (
              <div className="p-8 text-center text-gray-500 flex justify-center items-center"><Loader2 className="w-5 h-5 animate-spin mr-2"/> Sincronizando con Supabase...</div>
            ) : logsFiltrados.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No se encontraron interacciones de Telegram para estos filtros</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                      <th className="p-4 font-semibold">Cliente</th>
                      <th className="p-4 font-semibold">Estado</th>
                      <th className="p-4 font-semibold text-center">Tokens Usados</th>
                      <th className="p-4 font-semibold text-center">Costo Est.</th>
                      <th className="p-4 font-semibold text-right">Última Actividad</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 text-sm divide-y divide-gray-100">
                    {logsFiltrados.map((log) => (
                      <tr key={log.chat_id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-gray-800">{log.nombre_usuario}</div>
                          <div className="text-[10px] text-gray-400 font-mono">ID: {log.chat_id}</div>
                        </td>
                        <td className="p-4">{getEstadoUI(log.estado)}</td>
                        <td className="p-4 text-center font-mono text-gray-500 bg-gray-50/50">{log.tokens_usados || 0}</td>
                        <td className="p-4 text-center font-mono text-purple-600 font-medium">${Number(log.costo_usd || 0).toFixed(4)}</td>
                        <td className="p-4 text-right text-gray-500 text-xs">{new Date(log.ultima_interaccion).toLocaleString('es-VE')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VISTA REPORTES */}
      {tabActiva === "reportes" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {reporteReciente && (
            <div className="mb-6 p-6 bg-emerald-50 border border-emerald-200 rounded-xl relative shadow-sm">
              <button onClick={() => setReporteReciente(null)} className="absolute top-4 right-4 text-emerald-600 hover:text-emerald-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold text-emerald-900 mb-2 flex items-center">
                <Bot className="w-5 h-5 mr-2" /> Reporte Generado Exitosamente
              </h3>
              <div className="text-emerald-800 text-sm whitespace-pre-wrap leading-relaxed">
                {reporteReciente}
              </div>
            </div>
          )}

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input type="text" placeholder="Buscar en reportes guardados..." className="w-full outline-none text-gray-700 bg-transparent text-sm" value={busquedaReportes} onChange={(e) => setBusquedaReportes(e.target.value)} />
          </div>

          <div className="space-y-4">
            {cargandoReportes ? (
              <div className="p-8 text-center text-gray-500 flex justify-center"><Loader2 className="w-5 h-5 animate-spin mr-2"/> Cargando biblioteca...</div>
            ) : reportesFiltrados.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-xl border border-gray-100">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No se encontraron reportes guardados.</p>
              </div>
            ) : (
              reportesFiltrados.map((rep) => {
                const estaExpandido = reporteExpandido === rep.id;
                
                return (
                  
                <div key={rep.id} className={`bg-white rounded-xl shadow-sm border ${estaExpandido ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-100 hover:border-blue-100'} overflow-hidden transition-all duration-200`}>
                    <div 
                      className={`px-6 py-4 flex justify-between items-center cursor-pointer ${estaExpandido ? 'bg-blue-50/50 border-b border-blue-100' : 'bg-white'}`}
                      onClick={() => toggleReporte(rep.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${estaExpandido ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-gray-800 text-sm block">
                            Reporte de IA Gerencial
                          </span>
                          <span className="text-xs text-gray-500 flex items-center mt-0.5">
                            <Calendar className="w-3 h-3 mr-1" /> Emisión: {new Date(rep.created_at).toLocaleString('es-VE')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button 
                          onClick={(e) => eliminarReporte(rep.id, e)} 
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar reporte"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="text-gray-400">
                          {estaExpandido ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>
                    

                    {estaExpandido && (
                      <div className="animate-in slide-in-from-top-2 duration-200">
                        <div className="p-6 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-mono bg-white">
                          {rep.reporte_texto}
                        </div>


                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                          <button 
                            onClick={() => setChatActivo(chatActivo === rep.id ? null : rep.id)} 
                            className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${chatActivo === rep.id ? 'bg-purple-100 text-purple-700' : 'bg-white border border-gray-200 text-gray-600 hover:text-purple-600 hover:border-purple-200 shadow-sm'}`}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" /> 
                            {chatActivo === rep.id ? 'Cerrar Consultas' : 'Preguntar a IA sobre este reporte'}
                          </button>
                        </div>


                        {chatActivo === rep.id && (
                          <div className="bg-purple-50/50 p-6 border-t border-purple-100">
                            <h4 className="text-sm font-bold text-purple-900 flex items-center mb-3">
                              <Bot className="w-4 h-4 mr-2" /> Asistente de Análisis de Documentos
                            </h4>
                            
                            <div className="flex gap-2 mb-4">
                              <input 
                                type="text" 
                                placeholder="Ej: ¿Cuáles son las intenciones principales detectadas en este reporte?"
                                value={pregunta}
                                onChange={(e) => setPregunta(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && preguntarSobreReporte(rep.reporte_texto)}
                                className="flex-1 px-4 py-2 border border-purple-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                              />
                              <button 
                                onClick={() => preguntarSobreReporte(rep.reporte_texto)}
                                disabled={cargandoPregunta || !pregunta.trim()}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center cursor-pointer shadow-sm"
                              >
                                {cargandoPregunta ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                              </button>
                            </div>

                            {respuestaIA && (
                              <div className="bg-white p-4 border border-purple-100 rounded-lg shadow-sm flex items-start">
                                <CornerDownRight className="w-5 h-5 text-purple-400 mr-3 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                  {respuestaIA}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}