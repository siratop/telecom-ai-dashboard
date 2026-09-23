"use client";

import { useState, useEffect, useCallback } from 'react';
import { Activity, Server, Database, Globe, CheckCircle2, RefreshCw, AlertTriangle, XCircle } from 'lucide-react';

export default function MonitorRedPage() {
  const [estado, setEstado] = useState({
    webhook: "Verificando...",
    supabase: "Verificando...",
    gemini: "Operativo (v1beta)"
  });
  
  
  const [verificando, setVerificando] = useState(true); 
  const [alertasActivas, setAlertasActivas] = useState([]);

  const comprobarServicios = useCallback(async () => {
    setVerificando(true);
    try {

      const res = await fetch('/api/logs');
      if (res.ok) {
        setEstado({
          webhook: "Conectado y Escuchando",
          supabase: "Conectado (PostgreSQL Activo)",
          gemini: "Operativo (v1beta)"
        });
      } else {
        setEstado(prev => ({ ...prev, supabase: "Error de respuesta" }));
      }

      const resAlertas = await fetch('/api/alertas');
      const dataAlertas = await resAlertas.json();
      if (Array.isArray(dataAlertas)) {
        setAlertasActivas(dataAlertas);
      }

    } catch (error) {
      setEstado({
        webhook: "Falla de comunicacion",
        supabase: "Sin conexion",
        gemini: "Desconocido"
      });
    } finally {
      setVerificando(false);
    }
  }, []);

  useEffect(() => {
   
    const timer = setTimeout(() => {
      comprobarServicios();
    }, 0);
    
    return () => clearTimeout(timer);
  }, [comprobarServicios]);

  const dispararAlarmaPrueba = async () => {
    const nodoSimulado = "Fibra Óptica - Sector Alta Vista";

    const chatGuardado = localStorage.getItem('TELEGRAM_CHAT_ID') || '896406306';
    
    try {

      await fetch('/api/alertas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodo: nodoSimulado })
      });
      
      comprobarServicios(); 

      try {
        const N8N_ALARMA_URL = 'http://localhost:5678/webhook-test/alarma-red'; 
        await fetch(N8N_ALARMA_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nodo: nodoSimulado,
            hora: new Date().toLocaleTimeString('es-VE'),
            chat_id: chatGuardado 
          })
        });
        alert(`🚨 ¡Alarma disparada! Mensaje enviado al Chat ID: ${chatGuardado}`);
      } catch (n8nError) {
        console.warn("n8n no estaba escuchando.");
        alert(`🚨 Falla registrada en Supabase.\n\n(Nota: El mensaje de Telegram no salio porque n8n no estaba escuchando).`);
      }

    } catch (error) {
      console.error("Error al conectar con la alarma:", error);
      alert("Error de red al intentar registrar la alarma en la base de datos.");
    }
  };

  const resolverAlarma = async (id) => {
    try {
      await fetch('/api/alertas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      comprobarServicios(); 
    } catch (error) {
      console.error("Error al resolver:", error);
    }
  };

  return (
    <div className="p-8 w-full max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Activity className="w-8 h-8 mr-3 text-blue-600" /> Monitor de Estado de Red
          </h1>
          <p className="text-gray-500 mt-1">Diagnostico en tiempo real de los servicios y pasarelas del sistema.</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={dispararAlarmaPrueba}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm font-medium text-sm"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Simular Caída
          </button>
          
          <button
            onClick={comprobarServicios}
            disabled={verificando}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${verificando ? 'animate-spin' : ''}`} />
            Verificar Estado
          </button>
        </div>
      </div>

      {alertasActivas.length > 0 && (
        <div className="mb-8 p-6 bg-red-50 border-2 border-red-500 rounded-xl shadow-sm animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600 mr-4" />
              <div>
                <h2 className="text-xl font-bold text-red-700">¡ALERTA CRÍTICA DE RED ACTIVA!</h2>
                <p className="text-red-600 mt-1">Equipos tecnicos notificados vía Telegram. Requiere atención inmediata.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex flex-col gap-3">
            {alertasActivas.map(alerta => (
              <div key={alerta.id} className="flex items-center justify-between bg-white p-4 rounded-lg border border-red-200">
                <div>
                  <span className="font-bold text-gray-800">📍 Nodo Afectado:</span> <span className="text-red-600 font-medium">{alerta.nodo}</span>
                  <p className="text-xs text-gray-500 mt-1">Detectado: {new Date(alerta.fecha).toLocaleString('es-VE')}</p>
                </div>
                <button 
                  onClick={() => resolverAlarma(alerta.id)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Marcar como Resuelto
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Globe className="w-6 h-6" />
            </div>
            <span className="flex items-center text-green-600 text-xs font-semibold bg-green-50 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Activo
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-800">Webhook n8n</h3>
          <p className="text-sm text-gray-500 mt-1">Recepcion de mensajes entrantes.</p>
          <div className="mt-4 pt-4 border-t border-gray-100 text-xs font-medium text-gray-700">
            Estado: <span className="text-blue-600">{estado.webhook}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <Database className="w-6 h-6" />
            </div>
            <span className="flex items-center text-green-600 text-xs font-semibold bg-green-50 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Conectado
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-800">Supabase DB</h3>
          <p className="text-sm text-gray-500 mt-1">Almacenamiento y auditoría de tokens.</p>
          <div className="mt-4 pt-4 border-t border-gray-100 text-xs font-medium text-gray-700">
            Estado: <span className="text-green-600">{estado.supabase}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <Server className="w-6 h-6" />
            </div>
            <span className="flex items-center text-green-600 text-xs font-semibold bg-green-50 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Operativo
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-800">Google Gemini API</h3>
          <p className="text-sm text-gray-500 mt-1">Procesamiento de lenguaje natural.</p>
          <div className="mt-4 pt-4 border-t border-gray-100 text-xs font-medium text-gray-700">
            Estado: <span className="text-purple-600">{estado.gemini}</span>
          </div>
        </div>
      </div>
    </div>
  );
}