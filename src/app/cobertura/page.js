"use client";

import { useState, useEffect } from 'react';
import { MapPin, CheckCircle, XCircle, Plus, Layers, Trash2, MousePointerClick, AlertTriangle, Search, Route, GitMerge, Undo, Save, Home, Building, Filter, User, Phone, CreditCard, Network, Edit, Target, X, Zap } from 'lucide-react';
import dynamic from 'next/dynamic';
import { supabase } from '../../lib/supabase';


const MapaCobertura = dynamic(() => import('../../components/MapaCobertura'), { 
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

  const [postes, setPostes] = useState([]);
  const [nombrePoste, setNombrePoste] = useState("");
  const [tipoPoste, setTipoPoste] = useState("NAP (Distribución)");
  const [nodoAsignadoPoste, setNodoAsignadoPoste] = useState("");
  
  const [clientes, setClientes] = useState([]);
  const [nombreCliente, setNombreCliente] = useState("");
  const [cedulaCliente, setCedulaCliente] = useState("");
  const [telefonoCliente, setTelefonoCliente] = useState("");
  const [generoCliente, setGeneroCliente] = useState("Masculino");
  const [tipoCliente, setTipoCliente] = useState("Casa");
  const [descripcionCliente, setDescripcionCliente] = useState("");
  const [nodoAsignadoCliente, setNodoAsignadoCliente] = useState("");
  const [posteAsignadoCliente, setPosteAsignadoCliente] = useState(""); 
  
  const [busquedaNodo, setBusquedaNodo] = useState("");
  const [busquedaRuta, setBusquedaRuta] = useState("");
  const [busquedaPoste, setBusquedaPoste] = useState("");
  const [busquedaCliente, setBusquedaCliente] = useState("");

  const [alertasActivas, setAlertasActivas] = useState([]);
  const [tabActiva, setTabActiva] = useState("nodos");
  const [latSeleccionada, setLatSeleccionada] = useState(null);
  const [lngSeleccionada, setLngSeleccionada] = useState(null);
  
  const [editandoId, setEditandoId] = useState(null); 
  const [centroMapa, setCentroMapa] = useState(null); 

  const [verNodos, setVerNodos] = useState(true);
  const [verRutas, setVerRutas] = useState(true);
  const [verPostes, setVerPostes] = useState(true);
  const [verClientes, setVerClientes] = useState(true); 


  useEffect(() => {
    const cargarDatosBD = async () => {
      try {
        const [nodosRes, rutasRes, clientesRes, postesRes] = await Promise.all([
          supabase.from('mapa_nodos').select('*'),
          supabase.from('mapa_rutas').select('*'),
          supabase.from('mapa_clientes').select('*'),
          supabase.from('mapa_postes').select('*') 
        ]);

        if (nodosRes.data) setZonas(nodosRes.data);
        if (rutasRes.data) setRutas(rutasRes.data);
        if (clientesRes.data) setClientes(clientesRes.data);
        if (postesRes.data) setPostes(postesRes.data);
      } catch (err) {
        console.error("Error al conectar con Supabase:", err);
      }
    };

    const obtenerAlertas = async () => {
      try {
        const res = await fetch('/api/alertas');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setAlertasActivas(data);
        }
      } catch (error) {
      
      }
    };
    
    cargarDatosBD();
    obtenerAlertas();
    
    const intervalo = setInterval(obtenerAlertas, 10000);
    return () => clearInterval(intervalo);
  }, []);


  const limpiarFormularios = () => {
    setEditandoId(null);
    setLatSeleccionada(null);
    setLngSeleccionada(null);
    setNuevoSector(""); setNuevoRadio("1500");
    setNombreRuta(""); setNodoAsignadoRuta(""); setRutaMadre(""); setPuntosRutaActual([]); setModoDibujo(false);
    setNombrePoste(""); setTipoPoste("NAP (Distribución)"); setNodoAsignadoPoste("");
    setNombreCliente(""); setCedulaCliente(""); setTelefonoCliente(""); setDescripcionCliente(""); setNodoAsignadoCliente(""); setPosteAsignadoCliente("");
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


  const guardarNodo = async (e) => {
    e.preventDefault();
    if (!nuevoSector.trim() || !latSeleccionada || !lngSeleccionada) {
      alert("Por favor, asigna un nombre y marca el punto en el mapa."); return;
    }
    const nodoData = { sector: nuevoSector, lat: parseFloat(latSeleccionada), lng: parseFloat(lngSeleccionada), radio: parseInt(nuevoRadio), factible: esFactible, color: esFactible ? "#2563eb" : "#dc2626" };

    if (editandoId) {
      const { data, error } = await supabase.from('mapa_nodos').update(nodoData).eq('id', editandoId).select();
      if (!error && data) { setZonas(zonas.map(z => z.id === editandoId ? data[0] : z)); alert("Nodo actualizado."); }
    } else {
      const { data, error } = await supabase.from('mapa_nodos').insert([nodoData]).select();
      if (!error && data) setZonas([...zonas, data[0]]);
    }
    limpiarFormularios();
  };

  const eliminarNodo = async (id) => {
    if (window.confirm("¿Eliminar este nodo?")) {
      const { error } = await supabase.from('mapa_nodos').delete().eq('id', id);
      if (!error) {
        setZonas(zonas.filter(z => z.id !== id)); 
        if (editandoId === id) limpiarFormularios();
      }
    }
  };

  const deshacerUltimoPunto = () => setPuntosRutaActual(prev => prev.slice(0, -1));
 
  const guardarRutaObj = async (e) => {
    e.preventDefault();
    if (!nombreRuta.trim() || puntosRutaActual.length < 2) {
      alert("Asigna un nombre y dibuja al menos una línea (2 puntos) en el mapa."); return;
    }
    const rutaData = { nombre: nombreRuta, nodo_id: nodoAsignadoRuta ? parseInt(nodoAsignadoRuta) : null, ruta_padre_id: rutaMadre ? parseInt(rutaMadre) : null, puntos: puntosRutaActual };

    if (editandoId) {
      const { data, error } = await supabase.from('mapa_rutas').update(rutaData).eq('id', editandoId).select();
      if (!error && data) setRutas(rutas.map(r => r.id === editandoId ? data[0] : r));
    } else {
      const { data, error } = await supabase.from('mapa_rutas').insert([rutaData]).select();
      if (!error && data) setRutas([...rutas, data[0]]);
    }
    limpiarFormularios();
  };

  const eliminarRuta = async (id) => {
    if (window.confirm("¿Eliminar este trazado de red?")) {
      const { error } = await supabase.from('mapa_rutas').delete().eq('id', id);
      if (!error) {
        setRutas(rutas.filter(r => r.id !== id));
        if (editandoId === id) limpiarFormularios();
      }
    }
  };

  const guardarPoste = async (e) => {
    e.preventDefault();
    if (!nombrePoste.trim() || !latSeleccionada || !lngSeleccionada || !nodoAsignadoPoste) {
      alert("Asigna un nombre, un nodo base y marca el punto en el mapa."); return;
    }
    const posteData = { nombre: nombrePoste, tipo: tipoPoste, nodo_id: parseInt(nodoAsignadoPoste), lat: parseFloat(latSeleccionada), lng: parseFloat(lngSeleccionada) };

    if (editandoId) {
      const { data, error } = await supabase.from('mapa_postes').update(posteData).eq('id', editandoId).select();
      if (!error && data) setPostes(postes.map(p => p.id === editandoId ? data[0] : p));
    } else {
      const { data, error } = await supabase.from('mapa_postes').insert([posteData]).select();
      if (!error && data) setPostes([...postes, data[0]]);
    }
    limpiarFormularios();
  };

  const eliminarPoste = async (id) => {
    if (window.confirm("¿Eliminar este poste de la red?")) {
      const { error } = await supabase.from('mapa_postes').delete().eq('id', id);
      if (!error) {
        setPostes(postes.filter(p => p.id !== id));
        if (editandoId === id) limpiarFormularios();
      }
    }
  };
 
  const guardarCliente = async (e) => {
    e.preventDefault();
    if (!nombreCliente.trim() || !cedulaCliente.trim() || !latSeleccionada || !lngSeleccionada || !nodoAsignadoCliente) {
      alert("Faltan datos obligatorios o marcar la ubicación en el mapa."); return;
    } 
    const clienteData = {
      nombre: nombreCliente, cedula: cedulaCliente, telefono: telefonoCliente, genero: generoCliente, tipo: tipoCliente, descripcion: descripcionCliente,
      nodo_id: parseInt(nodoAsignadoCliente), poste_id: posteAsignadoCliente ? parseInt(posteAsignadoCliente) : null,
      lat: parseFloat(latSeleccionada), lng: parseFloat(lngSeleccionada)
    };

    if (editandoId) {
      const { data, error } = await supabase.from('mapa_clientes').update(clienteData).eq('id', editandoId).select();
      if (!error && data) setClientes(clientes.map(c => c.id === editandoId ? data[0] : c));
    } else {
      const { data, error } = await supabase.from('mapa_clientes').insert([clienteData]).select();
      if (!error && data) setClientes([...clientes, data[0]]);
    }
    limpiarFormularios();
  };

  const eliminarCliente = async (id) => {
    if (window.confirm("¿Eliminar este punto de cliente?")) {
      const { error } = await supabase.from('mapa_clientes').delete().eq('id', id);
      if (!error) {
        setClientes(clientes.filter(c => c.id !== id));
        if (editandoId === id) limpiarFormularios(); 
      }
    }
  };

  const editarNodo = (nodo) => { cambiarTab("nodos"); setEditandoId(nodo.id); setNuevoSector(nodo.sector); setNuevoRadio(nodo.radio.toString()); setLatSeleccionada(nodo.lat); setLngSeleccionada(nodo.lng); ubicarEnMapa(nodo.lat, nodo.lng, 15); };
  const editarRuta = (ruta) => { cambiarTab("rutas"); setEditandoId(ruta.id); setNombreRuta(ruta.nombre); setNodoAsignadoRuta(ruta.nodo_id || ""); setRutaMadre(ruta.ruta_padre_id || ""); setPuntosRutaActual(ruta.puntos); setModoDibujo(true); if(ruta.puntos.length>0) ubicarEnMapa(ruta.puntos[0][0], ruta.puntos[0][1], 17); };
  const editarPoste = (poste) => { cambiarTab("postes"); setEditandoId(poste.id); setNombrePoste(poste.nombre); setTipoPoste(poste.tipo); setNodoAsignadoPoste(poste.nodo_id || ""); setLatSeleccionada(poste.lat); setLngSeleccionada(poste.lng); ubicarEnMapa(poste.lat, poste.lng, 19); };
  const editarCliente = (cliente) => { cambiarTab("clientes"); setEditandoId(cliente.id); setNombreCliente(cliente.nombre); setCedulaCliente(cliente.cedula); setTelefonoCliente(cliente.telefono || ""); setGeneroCliente(cliente.genero || "Masculino"); setTipoCliente(cliente.tipo || "Casa"); setDescripcionCliente(cliente.descripcion || ""); setNodoAsignadoCliente(cliente.nodo_id || ""); setPosteAsignadoCliente(cliente.poste_id || ""); setLatSeleccionada(cliente.lat); setLngSeleccionada(cliente.lng); ubicarEnMapa(cliente.lat, cliente.lng, 20); };

  const zonasConAlertas = zonas.map(zona => ({
    ...zona,
    tieneFalla: alertasActivas.some(alerta => alerta.nodo === zona.sector),
    color: alertasActivas.some(a => a.nodo === zona.sector) ? "#ef4444" : (zona.factible ? "#2563eb" : "#9ca3af")
  })); 

  const zonasFiltradas = zonasConAlertas.filter(z => z.sector.toLowerCase().includes(busquedaNodo.toLowerCase()));
  const rutasFiltradas = rutas.filter(r => r.nombre.toLowerCase().includes(busquedaRuta.toLowerCase()));
  const postesFiltrados = postes.filter(p => p.nombre.toLowerCase().includes(busquedaPoste.toLowerCase()));
  const clientesFiltrados = clientes.filter(c => c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) || c.cedula.includes(busquedaCliente));

  const postesDisponiblesParaCliente = postes.filter(p => p.nodo_id?.toString() === nodoAsignadoCliente?.toString() && p.tipo === "NAP (Distribución)");

  let mapaZonas = verNodos ? zonasConAlertas : [];
  let mapaRutas = verRutas ? rutas : [];
  let mapaPostes = verPostes ? postes : [];
  let mapaClientes = verClientes ? clientes : [];

  if (tabActiva === "clientes" && busquedaCliente.trim() !== "") {
    mapaClientes = verClientes ? clientesFiltrados : [];
    mapaPostes = verPostes ? postes.filter(p => clientesFiltrados.some(c => c.poste_id?.toString() === p.id.toString())) : [];
    mapaZonas = verNodos ? zonasConAlertas.filter(z => clientesFiltrados.some(c => c.nodo_id?.toString() === z.id.toString())) : [];
    mapaRutas = verRutas ? rutas.filter(r => mapaZonas.some(z => z.id.toString() === r.nodo_id?.toString())) : [];
  } else if (tabActiva === "postes" && busquedaPoste.trim() !== "") {
    mapaPostes = verPostes ? postesFiltrados : [];
    mapaClientes = verClientes ? clientes.filter(c => postesFiltrados.some(p => p.id.toString() === c.poste_id?.toString())) : [];
    mapaZonas = verNodos ? zonasConAlertas.filter(z => postesFiltrados.some(p => p.nodo_id?.toString() === z.id.toString())) : [];
    mapaRutas = verRutas ? rutas.filter(r => mapaZonas.some(z => z.id.toString() === r.nodo_id?.toString())) : [];
  } else if (tabActiva === "rutas" && busquedaRuta.trim() !== "") {
    mapaRutas = verRutas ? rutasFiltradas : [];
    mapaZonas = verNodos ? zonasConAlertas.filter(z => rutasFiltradas.some(r => r.nodo_id?.toString() === z.id.toString() || r.ruta_padre_id?.toString() === z.id.toString())) : [];
    mapaPostes = verPostes ? postes.filter(p => mapaZonas.some(z => z.id.toString() === p.nodo_id?.toString())) : [];
    mapaClientes = verClientes ? clientes.filter(c => mapaZonas.some(z => z.id.toString() === c.nodo_id?.toString())) : [];
  } else if (tabActiva === "nodos" && busquedaNodo.trim() !== "") {
    mapaZonas = verNodos ? zonasFiltradas : [];
    mapaRutas = verRutas ? rutas.filter(r => zonasFiltradas.some(z => z.id.toString() === r.nodo_id?.toString())) : [];
    mapaPostes = verPostes ? postes.filter(p => zonasFiltradas.some(z => z.id.toString() === p.nodo_id?.toString())) : [];
    mapaClientes = verClientes ? clientes.filter(c => zonasFiltradas.some(z => z.id.toString() === c.nodo_id?.toString())) : [];
  }

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <Route className="w-8 h-8 mr-3 text-blue-600" /> Infraestructura y Despliegue
        </h1>
        <p className="text-gray-500 mt-1">Gestiona nodos de cobertura, jerarquía de fibra, postes NAP y registro exacto de clientes.</p>
      </div>


      <div className="flex flex-col md:flex-row gap-4 mb-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-center justify-between">
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <div className="flex items-center text-gray-700 font-bold text-sm">
            <Filter className="w-4 h-4 mr-2 text-blue-500" /> Capas Visibles:
          </div>
          <label className="flex items-center text-sm cursor-pointer hover:text-blue-600">
            <input type="checkbox" className="mr-2 rounded text-blue-600 focus:ring-blue-500" checked={verNodos} onChange={e => setVerNodos(e.target.checked)} /> Nodos
          </label>
          <label className="flex items-center text-sm cursor-pointer hover:text-emerald-600">
            <input type="checkbox" className="mr-2 rounded text-emerald-600 focus:ring-emerald-500" checked={verRutas} onChange={e => setVerRutas(e.target.checked)} /> Rutas
          </label>
          <label className="flex items-center text-sm cursor-pointer hover:text-amber-600">
            <input type="checkbox" className="mr-2 rounded text-amber-600 focus:ring-amber-500" checked={verPostes} onChange={e => setVerPostes(e.target.checked)} /> Postes NAP
          </label>
          <label className="flex items-center text-sm cursor-pointer hover:text-purple-600">
            <input type="checkbox" className="mr-2 rounded text-purple-600 focus:ring-purple-500" checked={verClientes} onChange={e => setVerClientes(e.target.checked)} /> Clientes
          </label>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
          <button onClick={() => ubicarEnMapa(8.2932, -62.7303, 13)} className="flex items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-sm font-bold rounded-lg transition-colors">
            <MapPin className="w-4 h-4 mr-2 text-gray-500"/> Restaurar Vista General
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-[600px] relative z-10">
          <MapaCobertura 
            zonas={mapaZonas}
            rutas={mapaRutas}
            postes={mapaPostes}
            clientes={mapaClientes}
            puntosRutaActual={puntosRutaActual}
            modoDibujo={modoDibujo && tabActiva === "rutas"}
            onSeleccionarCoordenadas={manejarSeleccionCoordenadas}
            nuevaLat={latSeleccionada}
            nuevaLng={lngSeleccionada}
            centroEnfoque={centroMapa}
          />
        </div>


        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px] overflow-hidden">
          <div className="flex border-b border-gray-200 flex-wrap">
            <button onClick={() => cambiarTab("nodos")} className={`flex-1 min-w-[25%] py-3 text-[11px] uppercase font-bold text-center border-b-2 transition-colors ${tabActiva === "nodos" ? "border-blue-600 text-blue-600 bg-blue-50/30" : "border-transparent text-gray-500 hover:bg-gray-50"}`}>
              <MapPin className="w-4 h-4 mx-auto mb-1" /> Nodos
            </button>
            <button onClick={() => cambiarTab("rutas")} className={`flex-1 min-w-[25%] py-3 text-[11px] uppercase font-bold text-center border-b-2 transition-colors ${tabActiva === "rutas" ? "border-emerald-600 text-emerald-600 bg-emerald-50/30" : "border-transparent text-gray-500 hover:bg-gray-50"}`}>
              <GitMerge className="w-4 h-4 mx-auto mb-1" /> Rutas
            </button>
            <button onClick={() => cambiarTab("postes")} className={`flex-1 min-w-[25%] py-3 text-[11px] uppercase font-bold text-center border-b-2 transition-colors ${tabActiva === "postes" ? "border-amber-600 text-amber-600 bg-amber-50/30" : "border-transparent text-gray-500 hover:bg-gray-50"}`}>
              <Zap className="w-4 h-4 mx-auto mb-1" /> Postes
            </button>
            <button onClick={() => cambiarTab("clientes")} className={`flex-1 min-w-[25%] py-3 text-[11px] uppercase font-bold text-center border-b-2 transition-colors ${tabActiva === "clientes" ? "border-purple-600 text-purple-600 bg-purple-50/30" : "border-transparent text-gray-500 hover:bg-gray-50"}`}>
              <Home className="w-4 h-4 mx-auto mb-1" /> Clientes
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 relative">
            {editandoId && (
              <div className="absolute top-0 left-0 right-0 bg-amber-100 text-amber-800 text-xs font-bold py-1.5 px-4 flex justify-between items-center z-10 shadow-sm">
                <span>Modo Edición Activo</span>
                <button onClick={limpiarFormularios} className="hover:text-amber-900 flex items-center"><X className="w-3 h-3 mr-1"/> Cancelar</button>
              </div>
            )}


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
                  <input type="range" min="100" max="5000" step="100" value={nuevoRadio} onChange={(e) => setNuevoRadio(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>100m</span><span>5Km</span></div>
                </div> 
                <button type="submit" className={`w-full py-2.5 text-white rounded-lg font-semibold flex items-center justify-center transition-colors ${editandoId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {editandoId ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />} 
                  {editandoId ? "Actualizar Nodo" : "Guardar Nodo"}
                </button>
              </form>
            )}


            {tabActiva === "rutas" && (
              <form onSubmit={guardarRutaObj} className={`space-y-4 ${editandoId ? 'mt-4' : ''}`}>
                <div className="p-3 bg-emerald-50 rounded-lg text-xs text-emerald-800 font-medium">
                  {modoDibujo ? "🟢 Trazado Activo: Haz clics sucesivos en el mapa." : "Inicia el modo dibujo para trazar red."}
                </div> 
                <div className="flex gap-2">
                  <button type="button" onClick={() => setModoDibujo(!modoDibujo)} className={`flex-1 py-2 rounded-lg font-semibold text-xs transition-colors ${modoDibujo ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                    {modoDibujo ? "Detener Dibujo" : "Activar Trazado"}
                  </button>
                  <button type="button" onClick={deshacerUltimoPunto} disabled={puntosRutaActual.length === 0} className="px-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50"><Undo className="w-4 h-4" /></button>
                </div> 
                <div className="text-xs text-gray-500 text-center font-mono">{puntosRutaActual.length} Vértices marcados</div>
                <div> 
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre de la Vía/Red:</label>
                  <input type="text" value={nombreRuta} onChange={(e) => setNombreRuta(e.target.value)} placeholder="Ej: Troncal Unare..." className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" required />
                </div> 
                <div className="p-3 border border-emerald-100 bg-emerald-50/30 rounded-lg space-y-3">
                  <div className="text-xs font-bold text-emerald-800 border-b border-emerald-100 pb-1 mb-2 flex items-center"><Network className="w-3 h-3 mr-1"/> Jerarquía de Conexion</div>
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
            
            {tabActiva === "postes" && (
              <form onSubmit={guardarPoste} className={`space-y-4 ${editandoId ? 'mt-4' : ''}`}>
                <div className={`p-3 rounded-lg text-xs font-medium flex items-center ${latSeleccionada ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-500'}`}>
                  <MousePointerClick className="w-4 h-4 mr-2 flex-shrink-0" />
                  {latSeleccionada ? '✔ Ubicación del poste fijada' : '👉 Haz clic en el mapa para ubicar el poste'}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Identificador del Poste:</label>
                  <input type="text" value={nombrePoste} onChange={(e) => setNombrePoste(e.target.value)} placeholder="Ej: Poste NAP-01 Calle Central" className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de Poste/Equipamiento:</label>
                  <select value={tipoPoste} onChange={(e) => setTipoPoste(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500">
                    <option value="NAP (Distribución)">Caja NAP (Distribución a clientes)</option>
                    <option value="De Paso">De Paso (Solo tendido eléctrico/fibra)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Pertenece al Nodo Base:</label>
                  <select value={nodoAsignadoPoste} onChange={(e) => setNodoAsignadoPoste(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500" required>
                    <option value="">Seleccione Nodo...</option>
                    {zonas.map(z => <option key={z.id} value={z.id}>{z.sector}</option>)}
                  </select>
                </div>
                <button type="submit" className={`w-full py-2.5 text-white bg-amber-600 rounded-lg font-semibold flex items-center justify-center hover:bg-amber-700 ${editandoId ? 'bg-amber-500 hover:bg-amber-600' : ''}`}>
                  {editandoId ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />} 
                  {editandoId ? "Actualizar Poste" : "Guardar Poste"}
                </button>
              </form>
            )}
            
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">Cedula / RIF:</label>
                    <input type="text" value={cedulaCliente} onChange={(e) => setCedulaCliente(e.target.value)} placeholder="Ej: V-12345678" className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" required />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Telefono (Opcional):</label>
                    <input type="text" value={telefonoCliente} onChange={(e) => setTelefonoCliente(e.target.value)} placeholder="Ej: 0424..." className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div> 
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Genero / Entidad:</label>
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
                
                <div className="p-3 border border-purple-100 bg-purple-50/30 rounded-lg space-y-3">
                  <div className="text-xs font-bold text-purple-800 border-b border-purple-100 pb-1 mb-2">Conexion de Red (Acometida)</div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">1. Nodo Base:</label>
                    <select value={nodoAsignadoCliente} onChange={(e) => { setNodoAsignadoCliente(e.target.value); setPosteAsignadoCliente(""); }} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" required>
                      <option value="">Seleccione Nodo...</option>
                      {zonas.map(z => <option key={z.id} value={z.id}>{z.sector}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">2. Conectar a Caja NAP (Poste):</label>
                    <select value={posteAsignadoCliente} onChange={(e) => setPosteAsignadoCliente(e.target.value)} disabled={!nodoAsignadoCliente} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100">
                      <option value="">Ninguno (Cable directo o sin asignar)</option>
                      {postesDisponiblesParaCliente.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                    <p className="text-[10px] text-gray-500 mt-1">Solo se muestran los postes con NAP del nodo seleccionado.</p>
                  </div>
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


      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <button onClick={() => cambiarTab("nodos")} className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap ${tabActiva === 'nodos' ? 'bg-white shadow-sm text-blue-700 border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}>Nodos ({zonas.length})</button>
            <button onClick={() => cambiarTab("rutas")} className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap ${tabActiva === 'rutas' ? 'bg-white shadow-sm text-emerald-700 border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}>Rutas ({rutas.length})</button>
            <button onClick={() => cambiarTab("postes")} className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap ${tabActiva === 'postes' ? 'bg-white shadow-sm text-amber-700 border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}>Postes NAP ({postes.length})</button>
            <button onClick={() => cambiarTab("clientes")} className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap ${tabActiva === 'clientes' ? 'bg-white shadow-sm text-purple-700 border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}>Clientes ({clientes.length})</button>
          </div>
          
          <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1.5 w-full md:w-64">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input type="text" placeholder="Buscar en la lista..." 
              value={tabActiva === 'nodos' ? busquedaNodo : tabActiva === 'rutas' ? busquedaRuta : tabActiva === 'postes' ? busquedaPoste : busquedaCliente} 
              onChange={(e) => {
                if (tabActiva === 'nodos') setBusquedaNodo(e.target.value);
                else if (tabActiva === 'rutas') setBusquedaRuta(e.target.value);
                else if (tabActiva === 'postes') setBusquedaPoste(e.target.value);
                else setBusquedaCliente(e.target.value);
              }} 
              className="w-full outline-none text-sm text-gray-700" 
            />
          </div>
        </div>
        
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
                      <button onClick={() => ubicarEnMapa(zona.lat, zona.lng, 16)} title="Ubicar en Mapa" className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Target className="w-4 h-4" /></button>
                      <button onClick={() => editarNodo(zona)} title="Editar" className="p-1.5 bg-amber-50 text-amber-600 rounded hover:bg-amber-100"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => eliminarNodo(zona.id)} title="Eliminar" className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}


        {tabActiva === "rutas" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-white text-gray-500 text-xs uppercase border-b border-gray-100">
                  <th className="p-4">Ruta Principal</th><th className="p-4">Puntos</th><th className="p-4">Nodo Base</th><th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700 divide-y divide-gray-50">
                {rutasFiltradas.map((ruta) => {
                  const rutaMadreObj = ruta.ruta_padre_id ? rutas.find(r => r.id.toString() === ruta.ruta_padre_id.toString()) : null;
                  const nodoIdFinal = rutaMadreObj ? rutaMadreObj.nodo_id : ruta.nodo_id;
                  const nodoPadre = zonas.find(z => z.id.toString() === nodoIdFinal?.toString()); 
                  return (
                  <tr key={ruta.id} className={editandoId === ruta.id ? 'bg-amber-50' : 'hover:bg-gray-50'}>
                    <td className="p-4">
                      <div className="font-medium text-gray-800 flex items-center"><GitMerge className="w-4 h-4 inline mr-2 text-emerald-500" /> {ruta.nombre}</div>
                      {rutaMadreObj && <div className="text-[10px] text-gray-500 ml-6 mt-0.5">↳ Sub-conexión de: <span className="font-semibold text-emerald-600">{rutaMadreObj.nombre}</span></div>}
                    </td>
                    <td className="p-4 text-gray-600">{ruta.puntos.length} pts</td>
                    <td className="p-4 text-gray-500">{nodoPadre ? <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">{nodoPadre.sector}</span> : 'Independiente'}</td>
                    <td className="p-4 flex justify-center gap-2">
                      {ruta.puntos.length > 0 && <button onClick={() => ubicarEnMapa(ruta.puntos[0][0], ruta.puntos[0][1], 17)} title="Ubicar" className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Target className="w-4 h-4" /></button>}
                      <button onClick={() => editarRuta(ruta)} title="Editar" className="p-1.5 bg-amber-50 text-amber-600 rounded hover:bg-amber-100"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => eliminarRuta(ruta.id)} title="Eliminar" className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
        
        {tabActiva === "postes" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-white text-gray-500 text-xs uppercase border-b border-gray-100">
                  <th className="p-4">Identificador de Poste</th><th className="p-4">Tipo</th><th className="p-4">Nodo Base</th><th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700 divide-y divide-gray-50">
                {postesFiltrados.map((poste) => {
                  const nodoPadre = zonas.find(z => z.id.toString() === poste.nodo_id?.toString());
                  return (
                  <tr key={poste.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium"><Zap className={`w-4 h-4 inline mr-2 ${poste.tipo === 'NAP (Distribución)' ? 'text-amber-500' : 'text-gray-400'}`} /> {poste.nombre}</td>
                    <td className="p-4 text-xs font-bold">{poste.tipo === 'NAP (Distribución)' ? <span className="text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">Caja NAP</span> : <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200">De Paso</span>}</td>
                    <td className="p-4 text-gray-500">{nodoPadre?.sector || 'N/A'}</td>
                    <td className="p-4 flex justify-center gap-2">
                      <button onClick={() => ubicarEnMapa(poste.lat, poste.lng, 19)} title="Ubicar" className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Target className="w-4 h-4" /></button>
                      <button onClick={() => editarPoste(poste)} title="Editar" className="p-1.5 bg-amber-50 text-amber-600 rounded hover:bg-amber-100"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => eliminarPoste(poste.id)} title="Eliminar" className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}

        {tabActiva === "clientes" && (
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[800px]">
               <thead>
                 <tr className="bg-white text-gray-500 text-[11px] uppercase border-b border-gray-100 tracking-wider">
                   <th className="p-4">Cliente / Entidad</th><th className="p-4">Identificación</th><th className="p-4">Conectado a (Poste/Acometida)</th><th className="p-4 text-center">Acciones</th>
                 </tr>
               </thead>
               <tbody className="text-sm text-gray-700 divide-y divide-gray-50">
                 {clientesFiltrados.map((cliente) => {
                   const posteConectado = postes.find(p => p.id.toString() === cliente.poste_id?.toString());
                   const IconoUser = cliente.genero === 'Empresa' ? Building : User;
                   return (
                   <tr key={cliente.id} className={editandoId === cliente.id ? 'bg-amber-50' : 'hover:bg-purple-50/30'}>
                     <td className="p-4">
                       <div className="font-medium text-gray-800 flex items-center"><IconoUser className="w-4 h-4 mr-2 text-purple-600" /> {cliente.nombre}</div>
                     </td>
                     <td className="p-4 text-gray-600 font-mono text-xs">{cliente.cedula}</td>
                     <td className="p-4">
                        {posteConectado ? <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-200 font-bold"><Zap className="w-3 h-3 inline mr-1"/>{posteConectado.nombre}</span> : <span className="text-xs text-gray-400 font-medium">Cable Directo / Sin Asignar</span>}
                     </td>
                     <td className="p-4 flex justify-center gap-2">
                       <button onClick={() => ubicarEnMapa(cliente.lat, cliente.lng, 20)} title="Ubicar" className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Target className="w-4 h-4" /></button>
                       <button onClick={() => editarCliente(cliente)} title="Editar" className="p-1.5 bg-amber-50 text-amber-600 rounded hover:bg-amber-100"><Edit className="w-4 h-4" /></button>
                       <button onClick={() => eliminarCliente(cliente.id)} title="Eliminar" className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                     </td>
                   </tr>
                 )})}
               </tbody>
             </table>
           </div>
        )}
      </div>
    </div>
  );
}