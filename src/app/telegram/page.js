"use client";

import { useState, useEffect, useRef } from 'react';
import { Send, RefreshCw, AlertCircle, CheckCircle, Trash2, MessageSquareOff, Search, Bot, Shield, User } from 'lucide-react';

export default function TelegramChatPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [conversaciones, setConversaciones] = useState({});
  const [chatActivoId, setChatActivoId] = useState("");
  const [mensajeInput, setMensajeInput] = useState("");
  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [modoIAActivo, setModoIAActivo] = useState(true);

  const chatContainerRef = useRef(null);
  
  // ID designado para pruebas y gerencia
  const ADMIN_CHAT_ID = "896406306";

  
  useEffect(() => {
    setIsMounted(true);
    const chatsGuardados = localStorage.getItem('TELEGRAM_CONVERSACIONES_CRM');
    if (chatsGuardados) {
      try {
        const parsed = JSON.parse(chatsGuardados);
        setConversaciones(parsed);
        const ids = Object.keys(parsed);
        if (ids.length > 0) setChatActivoId(ids[0]);
      } catch (e) {
        console.error("Error al cargar historial", e);
      }
    } else {
      const inicial = {
        [ADMIN_CHAT_ID]: {
          nombreUsuario: "Francisco (Gerencia)",
          mensajes: [
            { id: 1, emisor: "cliente", texto: "Prueba de inicio de sistema.", hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          ]
        }
      };
      setConversaciones(inicial);
      setChatActivoId(ADMIN_CHAT_ID);
      localStorage.setItem('TELEGRAM_CONVERSACIONES_CRM', JSON.stringify(inicial));
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatActivoId, conversaciones]);

  const actualizarYGuardar = (nuevasConversaciones) => {
    setConversaciones(nuevasConversaciones);
    localStorage.setItem('TELEGRAM_CONVERSACIONES_CRM', JSON.stringify(nuevasConversaciones));
  };

  const obtenerRespuestaIA = (textoUsuario) => {
    const texto = textoUsuario.toLowerCase();
    if (texto.includes('hola') || texto.includes('saludos') || texto.includes('buenos')) {
      return "¡Hola! Bienvenido a Telecom AI Puerto Ordaz. ¿En qué podemos ayudarte hoy? (Puedes consultar planes, cobertura o soporte técnico).";
    }
    if (texto.includes('cobertura') || texto.includes('alta vista') || texto.includes('unare') || texto.includes('zona')) {
      return "📍 Tenemos cobertura activa de fibra óptica en Alta Vista, Unare, Los Olivos y Centro de Puerto Ordaz. ¿Deseas verificar factibilidad para tu dirección exacta?";
    }
    if (texto.includes('planes') || texto.includes('precio') || texto.includes('costo') || texto.includes('megas')) {
      return "📊 Contamos con planes de fibra simétrica: 50 Mbps ($20), 100 Mbps ($35) y 300 Mbps ($75). Todos incluyen instalación inmediata.";
    }
    if (texto.includes('soporte') || texto.includes('lento') || texto.includes('falla') || texto.includes('conexion')) {
      return "🛠️ Hemos registrado tu consulta de soporte técnico. Un operador humano revisará el estado de tu nodo OLT en breve.";
    }
    return "🤖 Entendido. Su solicitud ha sido procesada por Gemini AI. Un especialista se comunicará con usted de ser necesario.";
  };

  const nuevrasConvObjVerificacion = (mensajesArray, texto) => {
    return mensajesArray.some(m => m.texto === texto && m.emisor === 'cliente');
  };

  const ejecutarSincronizacion = async (esAutomatico = false) => {
    const token = localStorage.getItem('TELEGRAM_BOT_TOKEN');
    if (!token) return;

    if (!esAutomatico) setSincronizando(true);
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?allowed_updates=["message"]`);
      const data = await res.json();

      if (data.ok && data.result && data.result.length > 0) {
        const chatsActualesStr = localStorage.getItem('TELEGRAM_CONVERSACIONES_CRM');
        let nuevasConv = chatsActualesStr ? JSON.parse(chatsActualesStr) : { ...conversaciones };
        let contadorNuevos = 0;
        let ultimoChatId = chatActivoId;

        for (const update of data.result) {
          const mensajeObj = update.message || update.edited_message;
          if (mensajeObj && mensajeObj.text) {
            const chatId = String(mensajeObj.chat.id);
            const nombre = mensajeObj.from.username ? `@${mensajeObj.from.username}` : (mensajeObj.from.first_name || "Usuario");
            const textoMsg = mensajeObj.text;
            const horaMsg = new Date(mensajeObj.date * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            if (!nuevasConv[chatId]) {
              nuevasConv[chatId] = {
                nombreUsuario: chatId === ADMIN_CHAT_ID ? "Francisco (Gerencia)" : `${nombre} (${chatId})`,
                mensajes: []
              };
            }

            const yaExiste = nuevrasConvObjVerificacion(nuevasConv[chatId].mensajes, textoMsg);
            
            if (!yaExiste) {
              nuevasConv[chatId].mensajes.push({
                id: update.update_id,
                emisor: "cliente",
                texto: textoMsg,
                hora: horaMsg
              });
              contadorNuevos++;

              if (modoIAActivo) {
                const respuestaAuto = obtenerRespuestaIA(textoMsg);
                await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ chat_id: chatId, text: `[Bot Asistente IA]:\n${respuestaAuto}` })
                });

                nuevasConv[chatId].mensajes.push({
                  id: Date.now() + Math.random(),
                  emisor: "bot",
                  texto: respuestaAuto,
                  hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
              }
            }
            ultimoChatId = chatId;
          }
        }

        if (contadorNuevos > 0) {
          actualizarYGuardar(nuevasConv);
          if (ultimoChatId && !chatActivoId) setChatActivoId(ultimoChatId);
        }

        if (!esAutomatico) {
          if (contadorNuevos > 0) alert(`✅ ¡Se sincronizaron ${contadorNuevos} mensaje(s) nuevo(s)!`);
          else alert("ℹ️ Conexión exitosa. No hay mensajes nuevos en cola.");
        }
      } else if (!esAutomatico) {
        alert("ℹ️ El bot está conectado, pero no hay mensajes pendientes.");
      }
    } catch (error) {
      console.error("Error al sincronizar:", error);
      if (!esAutomatico) alert("Error de red al conectar con la API de Telegram.");
    } finally {
      if (!esAutomatico) setSincronizando(false);
    }
  };

  useEffect(() => {
    if (!modoIAActivo) return;
    const interval = setInterval(() => {
      ejecutarSincronizacion(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [modoIAActivo, conversaciones, chatActivoId]);

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!mensajeInput.trim() || !chatActivoId) return;

    const token = localStorage.getItem('TELEGRAM_BOT_TOKEN');
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
        const nuevoMensaje = {
          id: Date.now(),
          emisor: "admin",
          texto: mensajeInput,
          hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const chatActual = conversaciones[chatActivoId] || { nombreUsuario: `Usuario ${chatActivoId}`, mensajes: [] };
        const actualizado = {
          ...conversaciones,
          [chatActivoId]: {
            ...chatActual,
            mensajes: [...chatActual.mensajes, nuevoMensaje]
          }
        };

        actualizarYGuardar(actualizado);
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

  const limpiarHistorial = () => {
    if (window.confirm("¿Deseas limpiar TODAS las conversaciones del chat? (Esta acción no se puede deshacer)")) {
      setConversaciones({});
      setChatActivoId("");
      localStorage.removeItem('TELEGRAM_CONVERSACIONES_CRM');
    }
  };

  const eliminarChatIndividual = (idAEliminar) => {
    if (window.confirm("¿Seguro que deseas eliminar esta conversación en particular?")) {
      const nuevasConv = { ...conversaciones };
      delete nuevasConv[idAEliminar];
      actualizarYGuardar(nuevasConv);
      if (chatActivoId === idAEliminar) {
        const restantes = Object.keys(nuevasConv);
        setChatActivoId(restantes.length > 0 ? restantes[0] : "");
      }
    }
  };

  if (!isMounted) return null;

  
  const listaIds = Object.keys(conversaciones).filter(id => {
    const chat = conversaciones[id];
    const termino = busquedaUsuario.toLowerCase();
    return id.toLowerCase().includes(termino) || (chat.nombreUsuario && chat.nombreUsuario.toLowerCase().includes(termino));
  });

  const chatAdminIds = listaIds.filter(id => id === ADMIN_CHAT_ID);
  const chatClientIds = listaIds.filter(id => id !== ADMIN_CHAT_ID);
  const chatActivo = conversaciones[chatActivoId];

  
  const renderChatItem = (id, esAdmin = false) => {
    const chat = conversaciones[id];
    const ultimoMsg = chat.mensajes[chat.mensajes.length - 1];
    const estaSeleccionado = chatActivoId === id;

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
        <p className="text-xs text-gray-500 truncate">
          {ultimoMsg?.emisor === 'admin' ? 'Tú: ' : ultimoMsg?.emisor === 'bot' ? 'IA: ' : ''}{ultimoMsg?.texto || 'Sin mensajes'}
        </p>
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
        {/* PANEL LATERAL DE LISTA DE CHATS */}
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
                {/* SECCIÓN ADMINISTRADOR / PRUEBAS */}
                {chatAdminIds.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-2 px-1 border-b border-purple-100 pb-1">👨‍💻 Entorno de Pruebas / Gerencia</h4>
                    {chatAdminIds.map(id => renderChatItem(id, true))}
                  </div>
                )}
                
                {/* SECCIÓN CLIENTES REALES */}
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

        {/* ÁREA PRINCIPAL DEL CHAT */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
          {!chatActivo ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
              <AlertCircle className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-base font-semibold text-gray-600">Ningún chat seleccionado</p>
              <p className="text-xs text-gray-400 mt-1">Selecciona una conversación de la bandeja lateral</p>
            </div>
          ) : (
            <>
              {/* CABECERA DEL CHAT ACTIVO */}
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
                  <button 
                    onClick={() => eliminarChatIndividual(chatActivoId)}
                    title="Eliminar esta conversación"
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mr-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center ${modoIAActivo ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {modoIAActivo ? <Bot className="w-3 h-3 mr-1"/> : <User className="w-3 h-3 mr-1"/>}
                    {modoIAActivo ? 'Bot Asistente Activo' : 'Modo Manual'}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[11px] font-semibold flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> En línea
                  </span>
                </div>
              </div>

              {/* CONTENEDOR DE MENSAJES */}
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

              {/* INPUT DE ENVÍO */}
              <form onSubmit={enviarMensaje} className="p-4 bg-white rounded-b-2xl flex gap-3 border-t border-gray-100">
                <input 
                  type="text" 
                  placeholder={modoIAActivo ? "El bot está respondiendo. Escribe para intervenir manualmente..." : "Escribe tu respuesta como operador..."}
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