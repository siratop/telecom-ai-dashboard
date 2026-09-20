"use client";

import { useState, useEffect } from 'react';
import { Settings, Save, Sliders, PhoneCall, Send, ToggleLeft, ToggleRight, CheckCircle2, Banknote, RefreshCcw, MessageSquareQuote } from 'lucide-react';

export default function ConfiguracionPage() {
  const [temperatura, setTemperatura] = useState("0.7");
  const [numeroSoporte, setNumeroSoporte] = useState("+58 412-0000000");
  const [botActivo, setBotActivo] = useState(true);
  
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  
  const [tipoTasa, setTipoTasa] = useState("api");
  const [tasaUSD, setTasaUSD] = useState("42.50");
  const [tasaEUR, setTasaEUR] = useState("45.10");
  const [tasaUSDT, setTasaUSDT] = useState("43.00");
  const [cargandoTasas, setCargandoTasas] = useState(false);

  const [promptSistema, setPromptSistema] = useState("Eres un asistente virtual de Telecom AI. Tu objetivo es ayudar a los clientes con información de planes, soporte técnico y validación de cobertura de fibra óptica.");
  
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    setTelegramToken(localStorage.getItem('TELEGRAM_BOT_TOKEN') || "");
    setTelegramChatId(localStorage.getItem('TELEGRAM_CHAT_ID') || "");
    setNumeroSoporte(localStorage.getItem('NUMERO_SOPORTE') || "+58 412-0000000");
    setTemperatura(localStorage.getItem('TEMPERATURA_IA') || "0.7");
    setPromptSistema(localStorage.getItem('PROMPT_SISTEMA') || "Eres un asistente virtual de Telecom AI...");
    
    setTipoTasa(localStorage.getItem('TIPO_TASA') || "api");
    setTasaUSD(localStorage.getItem('TASA_USD') || "42.50");
    setTasaEUR(localStorage.getItem('TASA_EUR') || "45.10");
    setTasaUSDT(localStorage.getItem('TASA_USDT') || "43.00");
    
    const estadoBot = localStorage.getItem('BOT_ACTIVO');
    if (estadoBot !== null) setBotActivo(estadoBot === 'true');

    if ((localStorage.getItem('TIPO_TASA') || "api") === "api") {
      actualizarTasasDesdeAPI();
    }
  }, []);

  const actualizarTasasDesdeAPI = async () => {
    setCargandoTasas(true);
    try {
      
      const fetchSeguro = async (url) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Error en respuesta");
        const text = await res.text();
        return text ? JSON.parse(text) : {};
      };

      const dataUsd = await fetchSeguro('https://ve.dolarapi.com/v1/dolares/oficial');
      if (dataUsd.promedio) setTasaUSD(dataUsd.promedio.toString());

      const dataEur = await fetchSeguro('https://ve.dolarapi.com/v1/euros/oficial');
      if (dataEur.promedio) setTasaEUR(dataEur.promedio.toString());

      const dataUsdt = await fetchSeguro('https://ve.dolarapi.com/v1/dolares/paralelo');
      if (dataUsdt.promedio) setTasaUSDT(dataUsdt.promedio.toString());
      
    } catch (error) {
      console.error("Error API:", error);
      alert("Hubo un problema al contactar la API de divisas. Revisa tu conexión o usa el modo manual.");
      setTipoTasa("manual"); 
    } finally {
      setCargandoTasas(false);
    }
  };

  const guardarConfiguracion = (e) => {
    e.preventDefault();
    localStorage.setItem('TELEGRAM_BOT_TOKEN', telegramToken);
    localStorage.setItem('TELEGRAM_CHAT_ID', telegramChatId);
    localStorage.setItem('NUMERO_SOPORTE', numeroSoporte);
    localStorage.setItem('TEMPERATURA_IA', temperatura);
    localStorage.setItem('BOT_ACTIVO', botActivo.toString());
    localStorage.setItem('PROMPT_SISTEMA', promptSistema);
    localStorage.setItem('TIPO_TASA', tipoTasa);
    localStorage.setItem('TASA_USD', tasaUSD);
    localStorage.setItem('TASA_EUR', tasaEUR);
    localStorage.setItem('TASA_USDT', tasaUSDT);

    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  return (
    <div className="p-8 w-full max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <Settings className="w-8 h-8 mr-3 text-blue-600" /> Configuración del Sistema
        </h1>
        <p className="text-gray-500 mt-1">Parámetros operativos del bot, umbrales de Gemini, finanzas y líneas de soporte.</p>
      </div>

      {guardado && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium flex items-center shadow-sm">
          <CheckCircle2 className="w-5 h-5 mr-2" /> Configuración y credenciales actualizadas correctamente en el sistema.
        </div>
      )}

      <form onSubmit={guardarConfiguracion} className="space-y-6">
        
        {/* FINANZAS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <Banknote className="w-5 h-5 mr-2 text-emerald-600" /> Parámetros Financieros (Tasas de Cambio)
              </h3>
              <p className="text-xs text-gray-500 mt-1">Define las tasas utilizadas para calcular presupuestos e informes.</p>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button type="button" onClick={() => setTipoTasa("api")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${tipoTasa === "api" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500"}`}>Auto (API)</button>
              <button type="button" onClick={() => setTipoTasa("manual")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${tipoTasa === "manual" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500"}`}>Manual</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Dólar (USD - BCV)</label>
              <input type="number" step="0.01" value={tasaUSD} onChange={(e) => setTasaUSD(e.target.value)} readOnly={tipoTasa === "api"} className={`w-full px-4 py-2 border rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-500 ${tipoTasa === "api" ? "bg-gray-50 text-gray-500" : "text-gray-800"}`} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Euro (EUR - BCV)</label>
              <input type="number" step="0.01" value={tasaEUR} onChange={(e) => setTasaEUR(e.target.value)} readOnly={tipoTasa === "api"} className={`w-full px-4 py-2 border rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-500 ${tipoTasa === "api" ? "bg-gray-50 text-gray-500" : "text-gray-800"}`} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Cripto (USDT / Paralelo)</label>
              <input type="number" step="0.01" value={tasaUSDT} onChange={(e) => setTasaUSDT(e.target.value)} readOnly={tipoTasa === "api"} className={`w-full px-4 py-2 border rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-500 ${tipoTasa === "api" ? "bg-gray-50 text-gray-500" : "text-gray-800"}`} />
            </div>
          </div>

          {tipoTasa === "api" && (
            <div className="flex justify-end">
              <button type="button" onClick={actualizarTasasDesdeAPI} disabled={cargandoTasas} className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 disabled:opacity-50">
                <RefreshCcw className={`w-3.5 h-3.5 mr-1.5 ${cargandoTasas ? 'animate-spin' : ''}`} /> 
                {cargandoTasas ? 'Actualizando...' : 'Forzar Sincronización API'}
              </button>
            </div>
          )}
        </div>

        {/* IA */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <Sliders className="w-5 h-5 mr-2 text-blue-600" /> Parámetros de Inteligencia Artificial (Gemini)
          </h3>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
              <MessageSquareQuote className="w-4 h-4 mr-1.5 text-gray-500"/> Prompt del Sistema (Rol y Reglas)
            </label>
            <textarea value={promptSistema} onChange={(e) => setPromptSistema(e.target.value)} rows="4" className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 resize-y" />
          </div>
          <div className="pt-2 border-t border-gray-100">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Temperatura: <span className="font-black text-blue-600">{temperatura}</span>
            </label>
            <input type="range" min="0.1" max="1.0" step="0.1" value={temperatura} onChange={(e) => setTemperatura(e.target.value)} className="w-full accent-blue-600 cursor-pointer mt-2" />
          </div>
        </div>

        {/* SOPORTE */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center"><PhoneCall className="w-5 h-5 mr-2 text-blue-600" /> Escalamiento a Soporte Humano</h3>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Número de Teléfono (WhatsApp / Llamadas):</label>
            <input type="text" value={numeroSoporte} onChange={(e) => setNumeroSoporte(e.target.value)} className="w-full md:w-1/2 px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono text-gray-700" required />
          </div>
        </div>

        {/* TELEGRAM */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center"><Send className="w-5 h-5 mr-2 text-blue-600" /> Asociación de Telegram Bot</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Telegram Bot Token:</label>
              <input type="password" value={telegramToken} onChange={(e) => setTelegramToken(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono text-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Chat ID del NOC / Admin:</label>
              <input type="text" value={telegramChatId} onChange={(e) => setTelegramChatId(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono text-gray-700" required />
            </div>
          </div>
        </div>

        {/* ESTADO GLOBAL */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Estado Global del Bot</h3>
            <p className="text-sm text-gray-500">Activa o detiene temporalmente las respuestas automáticas.</p>
          </div>
          <button type="button" onClick={() => setBotActivo(!botActivo)} className="text-blue-600 outline-none">
            {botActivo ? (
              <div className="flex items-center text-green-600 font-bold bg-green-50 px-4 py-2 rounded-lg border border-green-200"><ToggleRight className="w-6 h-6 mr-2" /> Sistema Activo</div>
            ) : (
              <div className="flex items-center text-red-600 font-bold bg-red-50 px-4 py-2 rounded-lg border border-red-200"><ToggleLeft className="w-6 h-6 mr-2" /> Sistema Detenido</div>
            )}
          </button>
        </div>

        <div className="flex justify-end pt-4 pb-12">
          <button type="submit" className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold text-sm shadow-md">
            <Save className="w-5 h-5 mr-2" /> Guardar Todos los Cambios
          </button>
        </div>
      </form>
    </div>
  );
}