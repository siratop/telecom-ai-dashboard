"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, RefreshCw, AlertCircle, CheckCircle, Trash2, MessageSquareOff, Search, Bot, Shield, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Sacamos la función fuera del componente para que esté disponible globalmente
const calcularUsoIA = (textoEntrada, textoSalida) => {
  const caracteresTotales = textoEntrada.length + textoSalida.length;
  const tokensEstimados = Math.ceil(caracteresTotales / 4);
  const costoEstimado = (tokensEstimados / 1000) * 0.0001; 
  return { tokens: tokensEstimados, costo: costoEstimado };
};

export default function TelegramChatPage() { 
  const [conversaciones, setConversaciones] = useState({});
  const [chatActivoId, setChatActivoId] = useState("");
  const [mensajeInput, setMensajeInput] = useState("");
  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [modoIAActivo, setModoIAActivo] = useState(true);

  const [chatsEscalados, setChatsEscalados] = useState([]);

  const chatContainerRef = useRef(null); 
  const ADMIN_CHAT_ID = "896406306";
  
  const offsetRef = useRef(0);
  const isFetchingRef = useRef(false);

  const procesarDatosBD = useCallback((convs, msgs) => {
    const newState = {};
    convs.forEach(c => {
      newState[c.chat_id] = { nombreUsuario: c.nombre_usuario, mensajes: [] };
    });
    
    msgs.forEach(m => {
      if (newState[m.chat_id]) {
        newState[m.chat_id].mensajes.push({ id: m.id, emisor: m.emisor, texto: m.texto, hora: m.hora });
      }
    });

    setConversaciones(newState);
    const ids = Object.keys(newState);
    if (ids.length > 0) {
      setChatActivoId(prev => prev || ids[0]);
    }
  }, []);

  const cargarChatsDesdeBD = useCallback(async () => {
    try { 
      const { data: convs, error: errC } = await supabase.from('chat_conversaciones').select('*');
      const { data: msgs, error: errM } = await supabase.from('chat_mensajes').select('*').order('created_at', { ascending: true });

      if (errC || errM) {
        console.error("Error al cargar base de datos", errC, errM);
        return;
      }

      
      if (convs.length === 0) {
        await supabase.from('chat_conversaciones').insert([{ chat_id: ADMIN_CHAT_ID, nombre_usuario: "Francisco (Gerencia)" }]);
        await supabase.from('chat_mensajes').insert([{
          chat_id: ADMIN_CHAT_ID,
          emisor: "cliente",
          texto: "Prueba de inicio de sistema. Conectado a PostgreSQL.",
          hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        
        const { data: newConvs } = await supabase.from('chat_conversaciones').select('*');
        const { data: newMsgs } = await supabase.from('chat_mensajes').select('*').order('created_at', { ascending: true });
        if (newConvs && newMsgs) procesarDatosBD(newConvs, newMsgs);
        return;
      }

      procesarDatosBD(convs, msgs);
    } catch (error) {
      console.error("Error general en carga de chats", error);
    }
  }, [procesarDatosBD]);

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarChatsDesdeBD();
    }, 0);
    return () => clearTimeout(timer);
  }, [cargarChatsDesdeBD]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatActivoId, conversaciones]);

  const ejecutarSincronizacion = useCallback(async (esAutomatico = false) => {
    let token = "";
    let telefonoConfig = "+58 424-9309876"; // Número por defecto
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('TELEGRAM_BOT_TOKEN') || process.env.NEXT_PUBLIC_TELEGRAM_TOKEN;
      telefonoConfig = localStorage.getItem('TELEFONO_SOPORTE') || telefonoConfig;
    }
    
    if (!token || isFetchingRef.current) return;

    isFetchingRef.current = true;
    if (!esAutomatico) setSincronizando(true);
    
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${offsetRef.current}&allowed_updates=["message"]`);
      const data = await res.json();

      if (data.ok && data.result && data.result.length > 0) { 
        let contadorNuevos = 0;
        let ultimoChatId = null;
        let highestUpdateId = offsetRef.current;

        const nuevosMensajesPorChat = {};
        const nuevasConversacionesInfo = {};

        for (const update of data.result) {
          if (update.update_id >= highestUpdateId) {
            highestUpdateId = update.update_id + 1; 
          }

          const mensajeObj = update.message || update.edited_message;
          if (!mensajeObj || !mensajeObj.text) continue;

          const chatId = String(mensajeObj.chat.id);
          const nombre = mensajeObj.from.username ? `@${mensajeObj.from.username}` : (mensajeObj.from.first_name || "Usuario");
          const textoMsg = mensajeObj.text;
          const horaMsg = new Date(mensajeObj.date * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          const chatState = conversaciones[chatId];
          let yaExisteLocal = false;
          if (chatState) {
            const ultimos = chatState.mensajes.slice(-10);
            yaExisteLocal = ultimos.some(m => m.texto === textoMsg && m.emisor === 'cliente');
          }

          if (!nuevosMensajesPorChat[chatId]) nuevosMensajesPorChat[chatId] = [];
          const existeEnAcumulador = nuevosMensajesPorChat[chatId].some(m => m.id === update.update_id || m.texto === textoMsg);

          if (!yaExisteLocal && !existeEnAcumulador) {
            if (!chatState && !nuevasConversacionesInfo[chatId]) {
              const nombreUsuario = chatId === ADMIN_CHAT_ID ? "Francisco (Gerencia)" : `${nombre} (${chatId})`;
              nuevasConversacionesInfo[chatId] = nombreUsuario;
              await supabase.from('chat_conversaciones').upsert({ chat_id: chatId, nombre_usuario: nombreUsuario });
            }

            await supabase.from('chat_mensajes').insert({ chat_id: chatId, emisor: "cliente", texto: textoMsg, hora: horaMsg });
            nuevosMensajesPorChat[chatId].push({ id: update.update_id, emisor: "cliente", texto: textoMsg, hora: horaMsg });
            contadorNuevos++;
            ultimoChatId = chatId;

            if (modoIAActivo) {
              let respuestaAuto = null;
              let nuevoEstado = 'activo';
              let intencionCierre = false;

              if (chatsEscalados.includes(chatId)) {
                // El usuario ya fue transferido a ti. El bot se queda callado.
                respuestaAuto = null; 
              } else {
                const texto = textoMsg.toLowerCase();
                
                // 1. Detección de Cierre Exitoso ("Aún interesado / lo pensaré")
                if (texto.includes('gracias') || texto.includes('lo pensare') || texto.includes('mas tarde') || texto.includes('interesado')) {
                  respuestaAuto = "¡De nada! Estaremos aquí cuando nos necesites. Que tengas una excelente tarde. (Chat cerrado)";
                  nuevoEstado = 'exitoso';
                  intencionCierre = true;
                } 
                // 2. Detección de Pérdida / Rechazo ("No me interesa / cerrar")
                else if (texto === 'no' || texto.includes('no quiero') || texto.includes('cerrar') || texto.includes('cancelar')) {
                  respuestaAuto = "Entendido. Hemos cerrado tu solicitud. ¡Gracias por contactarnos!";
                  nuevoEstado = 'perdido';
                  intencionCierre = true;
                }
                // 3. Flujo normal de consultas
                else if (texto === 'hola' || texto === 'saludos' || texto.includes('buenos dias') || texto.includes('buenas')) {
                  respuestaAuto = "¡Hola! Bienvenido a Telecom AI Puerto Ordaz. ¿En qué podemos ayudarte hoy? (Puedes consultar planes o cobertura).";
                } 
                else if (texto.includes('cobertura') || texto.includes('alta vista') || texto.includes('unare')) {
                  respuestaAuto = "📍 Tenemos cobertura activa de fibra optica en Alta Vista, Unare, Los Olivos y Centro. ¿Deseas verificar factibilidad para tu direccion exacta?";
                } 
                else if ((texto.includes('precio') || texto.includes('costo') || texto.includes('planes')) && !texto.includes('mejor') && !texto.includes('cual')) {
                  respuestaAuto = "📊 Contamos con planes de fibra simétrica: 50 Mbps ($20), 100 Mbps ($35) y 300 Mbps ($75). Todos incluyen instalación inmediata.";
                } 
                // 4. Escalamiento a Humano
                else {
                  setChatsEscalados(prev => [...prev, chatId]);
                  
                  respuestaAuto = `🤖 Entendido. Para asesorarte mejor con esa consulta, te he transferido con un operador humano. Por favor espera un momento en línea o escríbenos a nuestro WhatsApp: ${telefonoConfig}.`;

                  const mensajeAviso = `🚨 *NUEVO REQUERIMIENTO DE SOPORTE* 🚨\n\nEl usuario *${nombre}* requiere atención humana.\n\n💬 *Pregunta:* "${textoMsg}"\n\nVe al panel de Dashboard Telecom para responderle.`;
                  
                  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: mensajeAviso, parse_mode: 'Markdown' })
                  });
                }
              }

              if (respuestaAuto) {
                // Enviar mensaje a Telegram
                await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ chat_id: chatId, text: `[Bot Asistente IA]:\n${respuestaAuto}` })
                });

                const horaMsgBot = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                // Guardar mensaje en Base de Datos
                await supabase.from('chat_mensajes').insert({ chat_id: chatId, emisor: "bot", texto: respuestaAuto, hora: horaMsgBot });
                nuevosMensajesPorChat[chatId].push({ id: Date.now() + Math.random(), emisor: "bot", texto: respuestaAuto, hora: horaMsgBot });

                // Calcular tokens y costos
                const { tokens, costo } = calcularUsoIA(textoMsg, respuestaAuto);
                
                // Actualizar métricas en la tabla chat_conversaciones
                const { data: convActual } = await supabase.from('chat_conversaciones').select('tokens_usados, costo_usd, estado').eq('chat_id', chatId).single();
                
                await supabase.from('chat_conversaciones').update({
                  estado: intencionCierre ? nuevoEstado : (convActual?.estado || 'activo'),
                  tokens_usados: (convActual?.tokens_usados || 0) + tokens,
                  costo_usd: (convActual?.costo_usd || 0) + costo,
                  ultima_interaccion: new Date().toISOString()
                }).eq('chat_id', chatId);
              }
            } 
          }
        }

        offsetRef.current = highestUpdateId;

        if (contadorNuevos > 0) {
          setConversaciones(prevConv => {
            const updated = { ...prevConv };
            for (const cId in nuevosMensajesPorChat) {
              if (!updated[cId]) {
                updated[cId] = { nombreUsuario: nuevasConversacionesInfo[cId] || `Usuario ${cId}`, mensajes: [] };
              }
              updated[cId] = {
                ...updated[cId],
                mensajes: [...updated[cId].mensajes, ...nuevosMensajesPorChat[cId]]
              };
            }
            return updated;
          });

          if (!esAutomatico) {
            setTimeout(() => alert(`✅ ¡Se sincronizaron ${contadorNuevos} mensaje(s) nuevo(s)!`), 100);
          }
          setChatActivoId(prev => prev || ultimoChatId);
        } else {
          if (!esAutomatico) alert("ℹ️ Conexión exitosa. No hay mensajes nuevos en cola.");
        }
      } else if (!esAutomatico) {
        alert("ℹ️ El bot está conectado, pero no hay mensajes pendientes.");
      }
    } catch (error) {
      console.error("Error al sincronizar:", error);
      if (!esAutomatico) alert("Error de red al conectar con la API de Telegram.");
    } finally {
      isFetchingRef.current = false;
      if (!esAutomatico) setSincronizando(false);
    }
  }, [modoIAActivo, conversaciones, chatsEscalados]);

  useEffect(() => {
    if (!modoIAActivo) return;
    const interval = setInterval(() => {
      ejecutarSincronizacion(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [modoIAActivo, ejecutarSincronizacion]);
 
  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!mensajeInput.trim() || !chatActivoId) return;

    let token = "";
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('TELEGRAM_BOT_TOKEN') || process.env.NEXT_PUBLIC_TELEGRAM_TOKEN;
    }
    if (!token) {
      alert("⚠️ Configura el Token de Telegram en la sección de Configuración.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatActivoId,
          text: `[Soporte Operador]:\n${mensajeInput}`
        })
      });

      const data = await res.json();
      if (data.ok) {
        const horaAdmin = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
         
        await supabase.from('chat_mensajes').insert({
          chat_id: chatActivoId,
          emisor: "admin",
          texto: mensajeInput,
          hora: horaAdmin
        });

        // Actualizamos última interacción al responder como admin
        await supabase.from('chat_conversaciones').update({
          ultima_interaccion: new Date().toISOString()
        }).eq('chat_id', chatActivoId);

        const nuevoMensaje = { id: Date.now(), emisor: "admin", texto: mensajeInput, hora: horaAdmin };

        setConversaciones(prev => {
          const chatActual = prev[chatActivoId] || { nombreUsuario: `Usuario ${chatActivoId}`, mensajes: [] };
          return {
            ...prev,
            [chatActivoId]: {
              ...chatActual,
              mensajes: [...chatActual.mensajes, nuevoMensaje]
            }
          };
        });
        
        setMensajeInput("");
      } else {
        alert(`❌ Error al enviar: ${data.description}`);
      }
    } catch (error) {
      alert("Error de red al conectar con la API de Telegram.");
    } finally {
      setEnviando(false);
    }
  };
 
  const limpiarHistorial = async () => {
    if (window.confirm("¿Deseas limpiar TODAS las conversaciones del chat en la Base de Datos? (Irreversible)")) { 
      await supabase.from('chat_conversaciones').delete().neq('chat_id', '0');
      setConversaciones({});
      setChatActivoId("");
      setChatsEscalados([]); 
    }
  };

  const eliminarChatIndividual = async (idAEliminar) => {
    if (window.confirm("¿Seguro que deseas eliminar esta conversación de la Base de Datos?")) {
      await supabase.from('chat_conversaciones').delete().eq('chat_id', idAEliminar);
      
      setConversaciones(prev => {
        const nuevasConv = { ...prev };
        delete nuevasConv[idAEliminar];
        
        if (chatActivoId === idAEliminar) {
          const restantes = Object.keys(nuevasConv);
          setChatActivoId(restantes.length > 0 ? restantes[0] : "");
        }
        return nuevasConv;
      });
      setChatsEscalados(prev => prev.filter(id => id !== idAEliminar));
    }
  };


  const listaIds = Object.keys(conversaciones).filter(id => {
    const chat = conversaciones[id];
    const termino = busquedaUsuario.toLowerCase();
    return id.toLowerCase().includes(termino) || (chat.nombreUsuario && chat.nombreUsuario.toLowerCase().includes(termino));
  });

  const chatAdminIds = listaIds.filter(id => id === ADMIN_CHAT_ID);
  const chatClientIds = listaIds.filter(id => id !== ADMIN_CHAT_ID);
  const chatActivo = conversaciones[chatActivoId];
  
  const estaEscaladoActual = chatsEscalados.includes(chatActivoId);

  const renderChatItem = (id, esAdmin = false) => {
    const chat = conversaciones[id];
    const ultimoMsg = chat.mensajes[chat.mensajes.length - 1];
    const estaSeleccionado = chatActivoId === id;
    const requiereAtencion = chatsEscalados.includes(id);

    return (
      <div 
        key={id} 
        onClick={() => setChatActivoId(id)}
        className={`p-3.5 border rounded-xl cursor-pointer transition-all mb-2 ${estaSeleccionado ? 'bg-blue-50/80 border-blue-300 shadow-sm' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
      >
        <div className="flex justify-between items-center mb-1">
          <span className={`text-sm font-bold truncate flex items-center ${estaSeleccionado ? 'text-blue-900' : 'text-gray-800'}`}>
            {esAdmin ? <Shield className="w-3.5 h-3.5 mr-1.5 text-purple-600" /> : <User className="w-3.5 h-3.5 mr-1.5 text-blue-500" />}
            {chat.nombreUsuario}
          </span>
          <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">
            {ultimoMsg?.hora}
          </span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500 truncate w-3/4">
            {ultimoMsg?.emisor === 'admin' ? 'Tú: ' : ultimoMsg?.emisor === 'bot' ? 'IA: ' : ''}{ultimoMsg?.texto || 'Sin mensajes'}
          </p>
          {requiereAtencion && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Send className="w-8 h-8 mr-3 text-blue-600" /> Centro de Chat Telegram (En Vivo)
          </h1>
          <p className="text-gray-500 mt-1">Supervisa chats, alterna el modo IA automático o responde manualmente.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setModoIAActivo(!modoIAActivo)}
            className={`flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer border ${
              modoIAActivo 
                ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' 
                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
            }`}
          >
            <Bot className="w-4 h-4 mr-1.5" />
            {modoIAActivo ? "Modo IA: Activado" : "Modo IA: Desactivado"}
          </button>

          <button 
            onClick={() => ejecutarSincronizacion(false)}
            disabled={sincronizando}
            className="flex items-center px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-600 hover:bg-blue-100 transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${sincronizando ? 'animate-spin' : ''}`} /> Sincronizar
          </button>

          {Object.keys(conversaciones).length > 0 && (
            <button 
              onClick={limpiarHistorial}
              className="flex items-center px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors shadow-sm cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Limpiar Todo
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-[600px] flex flex-col">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Bandeja de Conversaciones</h3>
          
          <div className="mb-4 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Buscar usuario o ID..."
              value={busquedaUsuario}
              onChange={(e) => setBusquedaUsuario(e.target.value)}
              className="w-full bg-transparent text-xs text-gray-700 outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            {listaIds.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-4">
                <MessageSquareOff className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm font-medium">No se encontraron chats</p>
              </div>
            ) : (
              <>
                {chatAdminIds.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-2 px-1 border-b border-purple-100 pb-1">👨‍💻 Entorno de Pruebas / Gerencia</h4>
                    {chatAdminIds.map(id => renderChatItem(id, true))}
                  </div>
                )}
                
                {chatClientIds.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-1 border-b border-gray-100 pb-1">👥 Clientes Registrados</h4>
                    {chatClientIds.map(id => renderChatItem(id, false))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
          {!chatActivo ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
              <AlertCircle className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-base font-semibold text-gray-600">Ningún chat seleccionado</p>
              <p className="text-xs text-gray-400 mt-1">Selecciona una conversación de la bandeja lateral</p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70 rounded-t-2xl">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-3 shadow-sm ${chatActivoId === ADMIN_CHAT_ID ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    {chatActivoId === ADMIN_CHAT_ID ? <Shield className="w-5 h-5"/> : 'TG'}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-bold text-gray-800 text-sm">{chatActivo.nombreUsuario}</h4>
                      {chatActivoId === ADMIN_CHAT_ID && <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-bold uppercase tracking-wide">Gerencia</span>}
                    </div>
                    <p className="text-xs text-gray-500 font-mono">Chat ID: {chatActivoId}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {estaEscaladoActual && (
                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold uppercase tracking-wide animate-pulse border border-red-200">
                      Requiere Atención Humana
                    </span>
                  )}
                  <button 
                    onClick={() => eliminarChatIndividual(chatActivoId)}
                    title="Eliminar y reiniciar chat"
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mr-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center ${modoIAActivo && !estaEscaladoActual ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {modoIAActivo && !estaEscaladoActual ? <Bot className="w-3 h-3 mr-1"/> : <User className="w-3 h-3 mr-1"/>}
                    {modoIAActivo && !estaEscaladoActual ? 'Bot Asistente Activo' : 'Modo Manual'}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[11px] font-semibold flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> En línea
                  </span>
                </div>
              </div>

              <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto bg-[#F8FAFC] flex flex-col gap-3">
                {chatActivo.mensajes.length === 0 && (
                  <div className="text-center text-gray-400 my-auto text-sm">
                    No hay mensajes en esta conversación.
                  </div>
                )}
                
                {chatActivo.mensajes.map((msg) => (
                  <div key={msg.id} className={`flex flex-col max-w-[80%] ${msg.emisor === 'cliente' ? 'self-start' : 'self-end'}`}>
                    
                    {msg.emisor === 'cliente' && (
                      <div className="flex flex-col items-start">
                        <div className="bg-white text-gray-800 p-3.5 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-sm">
                          {msg.texto}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 ml-1">{msg.hora}</span>
                      </div>
                    )}

                    {msg.emisor === 'bot' && (
                      <div className="flex flex-col items-end">
                        <div className="bg-purple-600 text-white p-3.5 rounded-2xl rounded-tr-none shadow-sm text-sm">
                          {msg.texto}
                        </div>
                        <div className="flex items-center mt-1 space-x-1 text-[10px] text-purple-400 mr-1">
                          <span>🤖 Bot Asistente IA • {msg.hora}</span>
                        </div>
                      </div>
                    )}

                    {msg.emisor === 'admin' && (
                      <div className="flex flex-col items-end">
                        <div className="bg-blue-600 text-white p-3.5 rounded-2xl rounded-tr-none shadow-sm text-sm">
                          {msg.texto}
                        </div>
                        <div className="flex items-center mt-1 space-x-1 text-[10px] text-gray-400 mr-1">
                          <span>👤 Operador Manual • {msg.hora}</span>
                          <CheckCircle className="w-3 h-3 text-blue-500" />
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>

              <form onSubmit={enviarMensaje} className="p-4 bg-white rounded-b-2xl flex gap-3 border-t border-gray-100">
                <input 
                  type="text" 
                  placeholder={modoIAActivo && !estaEscaladoActual ? "El bot está respondiendo. Escribe para intervenir manualmente..." : "Escribe tu respuesta como operador humano..."}
                  value={mensajeInput}
                  onChange={(e) => setMensajeInput(e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700 font-medium"
                />
                <button 
                  type="submit"
                  disabled={enviando || !mensajeInput.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm flex items-center shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 mr-2" /> {enviando ? "Enviando..." : "Responder"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}