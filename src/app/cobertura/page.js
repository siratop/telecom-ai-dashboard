"use client";

import { useState, useEffect } from 'react';
import { MapPin, CheckCircle, XCircle, Plus, Layers, Trash2, MousePointerClick, AlertTriangle, Search, Route, GitMerge, Undo, Save, Home, Building, Filter, User, Phone, CreditCard, Network, Edit, Target, X } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapaCobertura = dynamic(() => import('@/components/MapaCobertura'), { 
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400">Cargando mapa interactivo de Puerto Ordaz...</div>
});

export default function ZonasCoberturaPage() {
  
  const [zonas, setZonas] = useState([]);
  const [nuevoSector, setNuevoSector] = useState("");
  const [nuevoRadio, setNuevoRadio] = useState("1500");
  const [esFactible, setEsFactible] = useState(true);
  
  
  const [rutas, setRutas] = useState([]);
  const [nombreRuta, setNombreRuta] = useState("");
  const [nodoAsignadoRuta, setNodoAsignadoRuta] = useState("");
  const [rutaMadre, setRutaMadre] = useState(""); 
  const [modoDibujo, setModoDibujo] = useState(false);
  const [puntosRutaActual, setPuntosRutaActual] = useState([]);
  
  
  const [clientes, setClientes] = useState([]);
  const [nombreCliente, setNombreCliente] = useState("");
  const [cedulaCliente, setCedulaCliente] = useState("");
  const [telefonoCliente, setTelefonoCliente] = useState("");
  const [generoCliente, setGeneroCliente] = useState("Masculino");
  const [tipoCliente, setTipoCliente] = useState("Casa");
  const [descripcionCliente, setDescripcionCliente] = useState("");
  const [nodoAsignadoCliente, setNodoAsignadoCliente] = useState("");
  
 
  const [busquedaNodo, setBusquedaNodo] = useState("");
  const [busquedaRuta, setBusquedaRuta] = useState("");
  const [busquedaCliente, setBusquedaCliente] = useState("");

 
  const [alertasActivas, setAlertasActivas] = useState([]);
  const [tabActiva, setTabActiva] = useState("nodos");
  const [latSeleccionada, setLatSeleccionada] = useState(null);
  const [lngSeleccionada, setLngSeleccionada] = useState(null);
  
  
  const [editandoId, setEditandoId] = useState(null); 
  const [centroMapa, setCentroMapa] = useState(null); 

  
  const [verNodos, setVerNodos] = useState(true);
  const [verRutas, setVerRutas] = useState(true);
  const [verClientes, setVerClientes] = useState(true);
  const [elementoEnfoque, setElementoEnfoque] = useState("todos"); 

  
  useEffect(() => {
    const nodosGuardados = localStorage.getItem('NODOS_FIBRA_PUERTO_ORDAZ');
    const rutasGuardadas = localStorage.getItem('RUTAS_FIBRA_PUERTO_ORDAZ');
    const clientesGuardados = localStorage.getItem('CLIENTES_FIBRA_PUERTO_ORDAZ');
    
    if (nodosGuardados) setZonas(JSON.parse(nodosGuardados));
    if (rutasGuardadas) setRutas(JSON.parse(rutasGuardadas));
    if (clientesGuardados) setClientes(JSON.parse(clientesGuardados));

    cargarAlertas();
    const intervalo = setInterval(cargarAlertas, 10000);
    return () => clearInterval(intervalo);
  }, []);

  const cargarAlertas = async () => {
    try {
      const res = await fetch('/api/alertas');
      const data = await res.json();
      if (Array.isArray(data)) setAlertasActivas(data);
    } catch (error) {
      console.error("Error al cargar alertas:", error);
    }
  };

  const persistirNodos = (nuevasZonas) => {
    setZonas(nuevasZonas);
    localStorage.setItem('NODOS_FIBRA_PUERTO_ORDAZ', JSON.stringify(nuevasZonas));
  };
  const persistirRutas = (nuevasRutas) => {
    setRutas(nuevasRutas);
    localStorage.setItem('RUTAS_FIBRA_PUERTO_ORDAZ', JSON.stringify(nuevasRutas));
  };
  const persistirClientes = (nuevosClientes) => {
    setClientes(nuevosClientes);
    localStorage.setItem('CLIENTES_FIBRA_PUERTO_ORDAZ', JSON.stringify(nuevosClientes));
  };

  const limpiarFormularios = () => {
    setEditandoId(null);
    setLatSeleccionada(null);
    setLngSeleccionada(null);
    setNuevoSector("");
    setNuevoRadio("1500");
    setNombreRuta(""); setNodoAsignadoRuta(""); setRutaMadre(""); setPuntosRutaActual([]); setModoDibujo(false);
    setNombreCliente(""); setCedulaCliente(""); setTelefonoCliente(""); setDescripcionCliente(""); setNodoAsignadoCliente("");
  };

  const cambiarTab = (tab) => {
    setTabActiva(tab);
    limpiarFormularios();
  };

  const manejarSeleccionCoordenadas = (lat, lng) => {
    if (modoDibujo && tabActiva === "rutas") {
      setPuntosRutaActual(prev => [...prev, [lat, lng]]);
    } else {
      setLatSeleccionada(lat);
      setLngSeleccionada(lng);
    }
  };

  
  const ubicarEnMapa = (lat, lng, zoomLevel = 17) => {
    setCentroMapa({ lat: parseFloat(lat), lng: parseFloat(lng), zoom: zoomLevel, timestamp: Date.now() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const manejarEnfoque = (valor) => {
    setElementoEnfoque(valor);
    if (valor === "todos") {
      ubicarEnMapa(8.2932, -62.7303, 13); 
      return;
    }
    
    const [tipo, idStr] = valor.split('-');
    const idNum = parseInt(idStr);
    
    if (tipo === 'nodo') {
      const n = zonas.find(z => z.id === idNum);
      if (n) ubicarEnMapa(n.lat, n.lng, 15);
    } else if (tipo === 'ruta') {
      const r = rutas.find(r => r.id === idNum);
      if (r && r.puntos.length > 0) ubicarEnMapa(r.puntos[0][0], r.puntos[0][1], 17);
    } else if (tipo === 'cliente') {
      const c = clientes.find(c => c.id === idNum);
      if (c) ubicarEnMapa(c.lat, c.lng, 19); 
    }
  };

 
  const guardarNodo = (e) => {
    e.preventDefault();
    if (!nuevoSector.trim() || !latSeleccionada || !lngSeleccionada) {
      alert("Por favor, asigna un nombre y marca el punto en el mapa.");
      return;
    }
    
    const nodoData = {
      sector: nuevoSector, 
      lat: parseFloat(latSeleccionada), 
      lng: parseFloat(lngSeleccionada),
      radio: parseInt(nuevoRadio), 
      factible: esFactible, 
      color: esFactible ? "#2563eb" : "#dc2626"
    };

    if (editandoId) {
      persistirNodos(zonas.map(z => z.id === editandoId ? { ...z, ...nodoData } : z));
      alert("Nodo actualizado correctamente.");
    } else {
      persistirNodos([...zonas, { id: Date.now(), ...nodoData }]);
    }
    limpiarFormularios();
  };

  const editarNodo = (nodo) => {
    setTabActiva("nodos");
    setEditandoId(nodo.id);
    setNuevoSector(nodo.sector);
    setNuevoRadio(nodo.radio.toString());
    setLatSeleccionada(nodo.lat);
    setLngSeleccionada(nodo.lng);
    manejarEnfoque(`nodo-${nodo.id}`);
  };

  const eliminarNodo = (id) => {
    if (window.confirm("¿Eliminar este nodo? (Las rutas y clientes asignados quedarán huérfanos)")) {
      persistirNodos(zonas.filter(z => z.id !== id));
      if (elementoEnfoque === `nodo-${id}`) setElementoEnfoque("todos");
      if (editandoId === id) limpiarFormularios();
    }
  };

 
  const deshacerUltimoPunto = () => setPuntosRutaActual(prev => prev.slice(0, -1));

  const guardarRutaObj = (e) => {
    e.preventDefault();
    if (!nombreRuta.trim() || puntosRutaActual.length < 2) {
      alert("Asigna un nombre y dibuja al menos una línea (2 puntos) en el mapa.");
      return;
    }
    const rutaData = {
      nombre: nombreRuta, 
      nodo_id: nodoAsignadoRuta, 
      ruta_padre_id: rutaMadre,
      puntos: puntosRutaActual
    };

    if (editandoId) {
      persistirRutas(rutas.map(r => r.id === editandoId ? { ...r, ...rutaData } : r));
      alert("Ruta actualizada correctamente.");
    } else {
      persistirRutas([...rutas, { id: Date.now(), ...rutaData }]);
    }
    limpiarFormularios();
  };

  const editarRuta = (ruta) => {
    setTabActiva("rutas");
    setEditandoId(ruta.id);
    setNombreRuta(ruta.nombre);
    setNodoAsignadoRuta(ruta.nodo_id || "");
    setRutaMadre(ruta.ruta_padre_id || "");
    setPuntosRutaActual(ruta.puntos);
    setModoDibujo(true);
    manejarEnfoque(`ruta-${ruta.id}`);
  };

  const eliminarRuta = (id) => {
    if (window.confirm("¿Eliminar este trazado de red?")) {
      persistirRutas(rutas.filter(r => r.id !== id));
      if (elementoEnfoque === `ruta-${id}`) setElementoEnfoque("todos");
      if (editandoId === id) limpiarFormularios();
    }
  };

 
  const guardarCliente = (e) => {
    e.preventDefault();
    if (!nombreCliente.trim() || !cedulaCliente.trim() || !latSeleccionada || !lngSeleccionada || !nodoAsignadoCliente) {
      alert("Faltan datos obligatorios o marcar la ubicación en el mapa.");
      return;
    }
    
    const clienteData = {
      nombre: nombreCliente,
      cedula: cedulaCliente,
      telefono: telefonoCliente,
      genero: generoCliente,
      tipo: tipoCliente,
      descripcion: descripcionCliente,
      nodo_id: nodoAsignadoCliente,
      lat: parseFloat(latSeleccionada),
      lng: parseFloat(lngSeleccionada)
    };

    if (editandoId) {
      persistirClientes(clientes.map(c => c.id === editandoId ? { ...c, ...clienteData } : c));
      alert("Cliente actualizado correctamente.");
    } else {
      persistirClientes([...clientes, { id: Date.now(), ...clienteData }]);
    }
    limpiarFormularios();
  };

  const editarCliente = (cliente) => {
    setTabActiva("clientes");
    setEditandoId(cliente.id);
    setNombreCliente(cliente.nombre);
    setCedulaCliente(cliente.cedula);
    setTelefonoCliente(cliente.telefono || "");
    setGeneroCliente(cliente.genero || "Masculino");
    setTipoCliente(cliente.tipo || "Casa");
    setDescripcionCliente(cliente.descripcion || "");
    setNodoAsignadoCliente(cliente.nodo_id || "");
    setLatSeleccionada(cliente.lat);
    setLngSeleccionada(cliente.lng);
    manejarEnfoque(`cliente-${cliente.id}`);
  };

  const eliminarCliente = (id) => {
    if (window.confirm("¿Eliminar este punto de cliente?")) {
      persistirClientes(clientes.filter(c => c.id !== id));
      if (elementoEnfoque === `cliente-${id}`) setElementoEnfoque("todos");
      if (editandoId === id) limpiarFormularios();
    }
  };

 
  const zonasConAlertas = zonas.map(zona => ({
    ...zona,
    tieneFalla: alertasActivas.some(alerta => alerta.nodo === zona.sector),
    color: alertasActivas.some(a => a.nodo === zona.sector) ? "#ef4444" : (zona.factible ? "#2563eb" : "#9ca3af")
  }));

  const zonasParaMapa = verNodos ? zonasConAlertas.filter(z => {
    if (elementoEnfoque === "todos") return true;
    const [tipo, id] = elementoEnfoque.split('-');
    if (tipo === 'nodo') return z.id.toString() === id;
    if (tipo === 'ruta') {
      const r = rutas.find(ruta => ruta.id.toString() === id);
      return r && r.nodo_id?.toString() === z.id.toString();
    }
    if (tipo === 'cliente') {
      const c = clientes.find(cli => cli.id.toString() === id);
      return c && c.nodo_id?.toString() === z.id.toString();
    }
    return true;
  }) : [];
  
  const rutasParaMapa = verRutas ? rutas.filter(r => {
    if (elementoEnfoque === "todos") return true;
    const [tipo, id] = elementoEnfoque.split('-');
    if (tipo === 'nodo') return r.nodo_id?.toString() === id;
    if (tipo === 'ruta') return r.id.toString() === id || r.ruta_padre_id?.toString() === id; 
    if (tipo === 'cliente') {
      const c = clientes.find(cli => cli.id.toString() === id);
      return c && r.nodo_id?.toString() === c.nodo_id?.toString();
    }
    return true;
  }) : [];
  
  const clientesParaMapa = verClientes ? clientes.filter(c => {
    if (!c.lat || !c.lng) return false;
    if (elementoEnfoque === "todos") return true;
    const [tipo, id] = elementoEnfoque.split('-');
    if (tipo === 'nodo') return c.nodo_id?.toString() === id;
    if (tipo === 'ruta') {
      const r = rutas.find(ruta => ruta.id.toString() === id);
      return r && c.nodo_id?.toString() === r.nodo_id?.toString();
    }
    if (tipo === 'cliente') return c.id.toString() === id;
    return true;
  }) : [];

 
  const zonasFiltradas = zonasConAlertas.filter(z => z.sector.toLowerCase().includes(busquedaNodo.toLowerCase()));
  const rutasFiltradas = rutas.filter(r => r.nombre.toLowerCase().includes(busquedaRuta.toLowerCase()));
  const clientesFiltrados = clientes.filter(c => c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) || c.cedula.includes(busquedaCliente));

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <Route className="w-8 h-8 mr-3 text-blue-600" /> Infraestructura y Despliegue
        </h1>
        <p className="text-gray-500 mt-1">Gestiona nodos de cobertura, jerarquía de fibra óptica y registro exacto de clientes.</p>
      </div>

      {/* BARRA DE CONTROL DEL MAPA */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center text-gray-700 font-bold text-sm">
            <Filter className="w-4 h-4 mr-2 text-blue-500" /> Capas Visibles:
          </div>
          <label className="flex items-center text-sm cursor-pointer hover:text-blue-600">
            <input type="checkbox" className="mr-2 rounded text-blue-600 focus:ring-blue-500" checked={verNodos} onChange={e => setVerNodos(e.target.checked)} /> 
            Nodos (Áreas)
          </label>
          <label className="flex items-center text-sm cursor-pointer hover:text-emerald-600">
            <input type="checkbox" className="mr-2 rounded text-emerald-600 focus:ring-emerald-500" checked={verRutas} onChange={e => setVerRutas(e.target.checked)} /> 
            Rutas (Fibra)
          </label>
          <label className="flex items-center text-sm cursor-pointer hover:text-purple-600">
            <input type="checkbox" className="mr-2 rounded text-purple-600 focus:ring-purple-500" checked={verClientes} onChange={e => setVerClientes(e.target.checked)} /> 
            Clientes
          </label>
        </div>
        
        {/* NUEVO SELECTOR GLOBAL */}
        <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
          <span className="text-sm font-bold text-gray-700">Enfocar en Mapa:</span>
          <select value={elementoEnfoque} onChange={e => manejarEnfoque(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 min-w-[220px]">
            <option value="todos">🌍 Toda la ciudad (Ver Todo)</option>
            
            {zonas.length > 0 && (
              <optgroup label="📍 Nodos / Sectores">
                {zonas.map(z => <option key={`opt-n-${z.id}`} value={`nodo-${z.id}`}>{z.sector}</option>)}
              </optgroup>
            )}
            
            {rutas.length > 0 && (
              <optgroup label="🛤️ Rutas de Fibra">
                {rutas.map(r => <option key={`opt-r-${r.id}`} value={`ruta-${r.id}`}>{r.nombre}</option>)}
              </optgroup>
            )}
            
            {clientes.length > 0 && (
              <optgroup label="🏠 Clientes Registrados">
                {clientes.map(c => <option key={`opt-c-${c.id}`} value={`cliente-${c.id}`}>{c.nombre} ({c.cedula})</option>)}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* MAPA */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-[600px] relative z-10">
          <MapaCobertura 
            zonas={zonasParaMapa}
            rutas={rutasParaMapa}
            clientes={clientesParaMapa}
            puntosRutaActual={puntosRutaActual}
            modoDibujo={modoDibujo && tabActiva === "rutas"}
            onSeleccionarCoordenadas={manejarSeleccionCoordenadas}
            nuevaLat={latSeleccionada}
            nuevaLng={lngSeleccionada}
            centroEnfoque={centroMapa}
          />
        </div>

        {/* CONTROLES LATERALES */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px] overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button onClick={() => cambiarTab("nodos")} className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors ${tabActiva === "nodos" ? "border-blue-600 text-blue-600 bg-blue-50/30" : "border-transparent text-gray-500 hover:bg-gray-50"}`}>
              <MapPin className="w-4 h-4 mx-auto mb-1" /> Nodos
            </button>
            <button onClick={() => cambiarTab("rutas")} className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors ${tabActiva === "rutas" ? "border-emerald-600 text-emerald-600 bg-emerald-50/30" : "border-transparent text-gray-500 hover:bg-gray-50"}`}>
              <GitMerge className="w-4 h-4 mx-auto mb-1" /> Rutas
            </button>
            <button onClick={() => cambiarTab("clientes")} className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors ${tabActiva === "clientes" ? "border-purple-600 text-purple-600 bg-purple-50/30" : "border-transparent text-gray-500 hover:bg-gray-50"}`}>
              <Home className="w-4 h-4 mx-auto mb-1" /> Registro Clientes
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 relative">
            {editandoId && (
              <div className="absolute top-0 left-0 right-0 bg-amber-100 text-amber-800 text-xs font-bold py-1.5 px-4 flex justify-between items-center z-10 shadow-sm">
                <span>Modo Edición Activo</span>
                <button onClick={limpiarFormularios} className="hover:text-amber-900 flex items-center"><X className="w-3 h-3 mr-1"/> Cancelar</button>
              </div>
            )}

            {/* FORMULARIO NODOS */}
            {tabActiva === "nodos" && (
              <form onSubmit={guardarNodo} className={`space-y-4 ${editandoId ? 'mt-4' : ''}`}>
                <div className={`p-3 rounded-lg text-xs font-medium flex items-center ${latSeleccionada ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-500'}`}>
                  <MousePointerClick className="w-4 h-4 mr-2 flex-shrink-0" />
                  {latSeleccionada ? '✔ Centro fijado en el mapa' : '👉 Haz clic en el mapa para marcar el centro'}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del Nodo:</label>
                  <input type="text" value={nuevoSector} onChange={(e) => setNuevoSector(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 flex justify-between">
                    <span>Radio de Cobertura:</span>
                    <span className="text-blue-700 font-bold">{nuevoRadio} metros</span>
                  </label>
                  <input 
                    type="range" 
                    min="100" 
                    max="5000" 
                    step="100" 
                    value={nuevoRadio} 
                    onChange={(e) => setNuevoRadio(e.target.value)} 
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>100m</span>
                    <span>5Km</span>
                  </div>
                </div>

                <button type="submit" className={`w-full py-2.5 text-white rounded-lg font-semibold flex items-center justify-center transition-colors ${editandoId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {editandoId ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />} 
                  {editandoId ? "Actualizar Nodo" : "Guardar Nodo"}
                </button>
              </form>
            )}

            {/* FORMULARIO RUTAS */}
            {tabActiva === "rutas" && (
              <form onSubmit={guardarRutaObj} className={`space-y-4 ${editandoId ? 'mt-4' : ''}`}>
                <div className="p-3 bg-emerald-50 rounded-lg text-xs text-emerald-800 font-medium">
                  {modoDibujo ? "🟢 Trazado Activo: Haz clics sucesivos en el mapa." : "Inicia el modo dibujo para trazar red."}
                </div>
                
                <div className="flex gap-2">
                  <button type="button" onClick={() => setModoDibujo(!modoDibujo)} className={`flex-1 py-2 rounded-lg font-semibold text-xs transition-colors ${modoDibujo ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                    {modoDibujo ? "Detener Dibujo" : "Activar Trazado"}
                  </button>
                  <button type="button" onClick={deshacerUltimoPunto} disabled={puntosRutaActual.length === 0} className="px-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50">
                    <Undo className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-gray-500 text-center font-mono">{puntosRutaActual.length} Vértices marcados</div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre de la Vía/Red:</label>
                  <input type="text" value={nombreRuta} onChange={(e) => setNombreRuta(e.target.value)} placeholder="Ej: Troncal Unare..." className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" required />
                </div>
                
                <div className="p-3 border border-emerald-100 bg-emerald-50/30 rounded-lg space-y-3">
                  <div className="text-xs font-bold text-emerald-800 border-b border-emerald-100 pb-1 mb-2 flex items-center"><Network className="w-3 h-3 mr-1"/> Jerarquía de Conexión</div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Es sub-conexión de (Ruta Madre):</label>
                    <select value={rutaMadre} onChange={(e) => setRutaMadre(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="">Ninguna (Es ruta principal)</option>
                      {rutas.filter(r => r.id !== editandoId).map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nodo Base (Solo si es principal):</label>
                    <select value={nodoAsignadoRuta} onChange={(e) => setNodoAsignadoRuta(e.target.value)} disabled={!!rutaMadre} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:text-gray-400">
                      <option value="">Seleccione nodo...</option>
                      {zonas.map(z => <option key={z.id} value={z.id}>{z.sector}</option>)}
                    </select>
                  </div>
                </div>

                <button type="submit" className={`w-full py-2.5 text-white rounded-lg font-semibold flex items-center justify-center transition-colors ${editandoId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                  {editandoId ? <Save className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />} 
                  {editandoId ? "Actualizar Trazado" : "Guardar Trazado"}
                </button>
              </form>
            )}

            {/* FORMULARIO CLIENTES */}
            {tabActiva === "clientes" && (
              <form onSubmit={guardarCliente} className={`space-y-4 ${editandoId ? 'mt-4' : ''}`}>
                <div className={`p-3 rounded-lg text-xs font-medium flex items-center ${latSeleccionada ? 'bg-purple-50 text-purple-700' : 'bg-gray-50 text-gray-500'}`}>
                  <MousePointerClick className="w-4 h-4 mr-2 flex-shrink-0" />
                  {latSeleccionada ? '✔ Ubicación fijada' : '👉 Haz clic en el mapa para ubicar la casa/apto'}
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre y Apellido (o Empresa):</label>
                  <input type="text" value={nombreCliente} onChange={(e) => setNombreCliente(e.target.value)} placeholder="Ej: Francisco Fonseca" className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" required />
                </div>
                
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Cédula / RIF:</label>
                    <input type="text" value={cedulaCliente} onChange={(e) => setCedulaCliente(e.target.value)} placeholder="Ej: V-12345678" className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" required />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono (Opcional):</label>
                    <input type="text" value={telefonoCliente} onChange={(e) => setTelefonoCliente(e.target.value)} placeholder="Ej: 0424..." className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Género / Entidad:</label>
                    <select value={generoCliente} onChange={(e) => setGeneroCliente(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Empresa">Empresa / Otro</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tipo Inmueble:</label>
                    <select value={tipoCliente} onChange={(e) => setTipoCliente(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="Casa">Casa</option>
                      <option value="Apartamento">Apartamento</option>
                      <option value="Comercio">Comercio</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nodo Base a Conectar:</label>
                  <select value={nodoAsignadoCliente} onChange={(e) => setNodoAsignadoCliente(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" required>
                    <option value="">Seleccione Nodo...</option>
                    {zonas.map(z => <option key={z.id} value={z.id}>{z.sector}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Dirección / Referencia:</label>
                  <textarea value={descripcionCliente} onChange={(e) => setDescripcionCliente(e.target.value)} placeholder="Ej: Portón negro, calle principal..." className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 resize-none" rows="2"></textarea>
                </div>

                <button type="submit" className={`w-full py-2.5 text-white rounded-lg font-semibold flex items-center justify-center transition-colors ${editandoId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-purple-600 hover:bg-purple-700'}`}>
                  {editandoId ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />} 
                  {editandoId ? "Actualizar Cliente" : "Registrar Cliente"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* LISTADOS Y TABLAS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <button onClick={() => cambiarTab("nodos")} className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap ${tabActiva === 'nodos' ? 'bg-white shadow-sm text-blue-700 border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}>Nodos ({zonas.length})</button>
            <button onClick={() => cambiarTab("rutas")} className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap ${tabActiva === 'rutas' ? 'bg-white shadow-sm text-emerald-700 border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}>Rutas ({rutas.length})</button>
            <button onClick={() => cambiarTab("clientes")} className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap ${tabActiva === 'clientes' ? 'bg-white shadow-sm text-purple-700 border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}>Clientes Registrados ({clientes.length})</button>
          </div>
          
          <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1.5 w-full md:w-64">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input type="text" placeholder={tabActiva === 'nodos' ? "Buscar nodo..." : tabActiva === 'rutas' ? "Buscar ruta..." : "Buscar por nombre o cédula..."} 
              value={tabActiva === 'nodos' ? busquedaNodo : tabActiva === 'rutas' ? busquedaRuta : busquedaCliente} 
              onChange={(e) => {
                if (tabActiva === 'nodos') setBusquedaNodo(e.target.value);
                else if (tabActiva === 'rutas') setBusquedaRuta(e.target.value);
                else setBusquedaCliente(e.target.value);
              }} 
              className="w-full outline-none text-sm text-gray-700" 
            />
          </div>
        </div>
        
        {/* TABLA NODOS */}
        {tabActiva === "nodos" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-white text-gray-500 text-xs uppercase border-b border-gray-100">
                  <th className="p-4">Nodo / Sector</th><th className="p-4">Radio</th><th className="p-4">Estado</th><th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700 divide-y divide-gray-50">
                {zonasFiltradas.map((zona) => (
                  <tr key={zona.id} className={zona.tieneFalla ? 'bg-red-50/50' : (editandoId === zona.id ? 'bg-amber-50' : 'hover:bg-gray-50')}>
                    <td className="p-4 font-medium"><MapPin className={`w-4 h-4 inline mr-2 ${zona.tieneFalla ? 'text-red-500' : 'text-blue-500'}`} /> {zona.sector}</td>
                    <td className="p-4 text-gray-600">{zona.radio} m</td>
                    <td className="p-4">{zona.tieneFalla ? <span className="text-red-600 font-bold text-xs bg-red-100 px-2 py-1 rounded">CAÍDA RED</span> : <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">Activo</span>}</td>
                    <td className="p-4 flex justify-center gap-2">
                      <button onClick={() => manejarEnfoque(`nodo-${zona.id}`)} title="Ubicar en Mapa" className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Target className="w-4 h-4" /></button>
                      <button onClick={() => editarNodo(zona)} title="Editar Nodo" className="p-1.5 bg-amber-50 text-amber-600 rounded hover:bg-amber-100"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => eliminarNodo(zona.id)} title="Eliminar Nodo" className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLA RUTAS */}
        {tabActiva === "rutas" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-white text-gray-500 text-xs uppercase border-b border-gray-100">
                  <th className="p-4">Nombre de Ruta / Jerarquía</th><th className="p-4">Puntos</th><th className="p-4">Nodo Base</th><th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700 divide-y divide-gray-50">
                {rutasFiltradas.map((ruta) => {
                  const rutaMadreObj = ruta.ruta_padre_id ? rutas.find(r => r.id.toString() === ruta.ruta_padre_id) : null;
                  const nodoIdFinal = rutaMadreObj ? rutaMadreObj.nodo_id : ruta.nodo_id;
                  const nodoPadre = zonas.find(z => z.id.toString() === nodoIdFinal?.toString());
                  
                  return (
                    <tr key={ruta.id} className={editandoId === ruta.id ? 'bg-amber-50' : 'hover:bg-gray-50'}>
                      <td className="p-4">
                        <div className="font-medium text-gray-800 flex items-center">
                          <GitMerge className="w-4 h-4 inline mr-2 text-emerald-500" /> {ruta.nombre}
                        </div>
                        {rutaMadreObj && (
                          <div className="text-[10px] text-gray-500 ml-6 mt-0.5">
                            ↳ Sub-conexión de: <span className="font-semibold text-emerald-600">{rutaMadreObj.nombre}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-gray-600">{ruta.puntos.length} puntos</td>
                      <td className="p-4 text-gray-500">{nodoPadre ? <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">{nodoPadre.sector}</span> : 'Red Independiente'}</td>
                      <td className="p-4 flex justify-center gap-2">
                        {ruta.puntos.length > 0 && <button onClick={() => manejarEnfoque(`ruta-${ruta.id}`)} title="Ubicar Ruta" className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Target className="w-4 h-4" /></button>}
                        <button onClick={() => editarRuta(ruta)} title="Editar Ruta" className="p-1.5 bg-amber-50 text-amber-600 rounded hover:bg-amber-100"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => eliminarRuta(ruta.id)} title="Eliminar Ruta" className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLA CLIENTES */}
        {tabActiva === "clientes" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-white text-gray-500 text-[11px] uppercase border-b border-gray-100 tracking-wider">
                  <th className="p-4">Cliente / Entidad</th><th className="p-4">Identificación</th><th className="p-4">Contacto</th><th className="p-4">Inmueble</th><th className="p-4">Nodo Base</th><th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700 divide-y divide-gray-50">
                {clientesFiltrados.map((cliente) => {
                  const nodoPadre = zonas.find(z => z.id.toString() === cliente.nodo_id?.toString());
                  const IconoUser = cliente.genero === 'Empresa' ? Building : User;
                  const IconoInmueble = cliente.tipo === 'Apartamento' || cliente.tipo === 'Comercio' ? Building : Home;
                  return (
                    <tr key={cliente.id} className={editandoId === cliente.id ? 'bg-amber-50' : 'hover:bg-purple-50/30'}>
                      <td className="p-4">
                        <div className="font-medium text-gray-800 flex items-center">
                          <IconoUser className="w-4 h-4 mr-2 text-purple-600" /> {cliente.nombre}
                        </div>
                        <div className="text-[10px] text-gray-500 ml-6 mt-0.5">Género: {cliente.genero}</div>
                      </td>
                      <td className="p-4 text-gray-600 font-mono text-xs">{cliente.cedula}</td>
                      <td className="p-4 text-gray-500 text-xs">
                        {cliente.telefono ? <span className="flex items-center"><Phone className="w-3 h-3 mr-1 text-gray-400"/> {cliente.telefono}</span> : 'N/A'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center text-gray-700 text-xs">
                          <IconoInmueble className="w-3 h-3 mr-1 text-gray-400" /> {cliente.tipo}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[120px]" title={cliente.descripcion}>{cliente.descripcion || 'Sin ref.'}</div>
                      </td>
                      <td className="p-4 text-gray-500">
                        {nodoPadre ? <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-[11px] font-bold">{nodoPadre.sector}</span> : 'No asignado'}
                      </td>
                      <td className="p-4 flex justify-center gap-2">
                        <button onClick={() => manejarEnfoque(`cliente-${cliente.id}`)} title="Ubicar Cliente" className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Target className="w-4 h-4" /></button>
                        <button onClick={() => editarCliente(cliente)} title="Editar Cliente" className="p-1.5 bg-amber-50 text-amber-600 rounded hover:bg-amber-100"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => eliminarCliente(cliente.id)} title="Eliminar Cliente" className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}