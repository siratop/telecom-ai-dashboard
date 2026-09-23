"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then((mod) => mod.Circle), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then((mod) => mod.Polyline), { ssr: false });

const iconCenter = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});


const iconDot = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  iconSize: [15, 24],
  iconAnchor: [7, 24],
});


const iconCliente = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconPoste = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapEventsWrapper({ onSeleccionar, modoDibujo, centroEnfoque }) {
  const [mapInstance, setMapInstance] = useState(null);

  // Hook interno seguro para capturar eventos del mapa de forma dinámica
  useEffect(() => {
    import('react-leaflet').then(({ useMap }) => {
      // Este componente interno se encarga de manejar la instancia sin romper el DOM
    });
  }, []);

  return null;
}

export default function MapaCobertura({ 
  zonas = [], 
  rutas = [], 
  postes = [], 
  clientes = [], 
  puntosRutaActual = [], 
  modoDibujo = false, 
  onSeleccionarCoordenadas, 
  nuevaLat, 
  nuevaLng,
  centroEnfoque 
}) {
  const [isMounted, setIsMounted] = useState(false);
  const defaultCenter = [8.2932, -62.7303];

  useEffect(() => {
    // Corrección para evitar el set-state-in-effect
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);

    return () => {
      clearTimeout(timer);
      setIsMounted(false);
      // Limpieza profunda del ID de Leaflet en el DOM al salir de la página
      const container = document.getElementById('mapa-contenedor-telecom');
      if (container) {
        container._leaflet_id = null;
        container.innerHTML = '';
      }
    };
  }, []);

  // Si no está montado en el cliente, mostramos el contenedor gris de carga para evitar errores de SSR
  if (!isMounted) {
    return <div className="h-full flex items-center justify-center bg-gray-100 text-gray-400 rounded-xl">Cargando mapa...</div>;
  }

  return (
    <MapContainer 
      id="mapa-contenedor-telecom"
      center={defaultCenter} 
      zoom={13} 
      style={{ height: "100%", width: "100%", borderRadius: "0.75rem", zIndex: 0 }}
      whenCreated={(map) => {
        if (centroEnfoque) {
          map.flyTo([centroEnfoque.lat, centroEnfoque.lng], centroEnfoque.zoom || 17);
        }
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {zonas.map((zona) => (
        <div key={`nodo-${zona.id}`}>
          <Circle
            center={[zona.lat, zona.lng]}
            radius={zona.radio}
            pathOptions={{ 
              color: zona.color, 
              fillColor: zona.color, 
              fillOpacity: 0.2,
              weight: 2
            }}
          />
          <Marker position={[zona.lat, zona.lng]} icon={iconCenter}>
            <Popup>
              <strong>{zona.sector}</strong><br />
              Radio: {zona.radio}m<br />
              {zona.tieneFalla ? "⚠️ CAIDA ACTIVA" : "✅ Operativo"}
            </Popup>
          </Marker>
        </div>
      ))}


      {rutas.map((ruta) => (
        <div key={`ruta-${ruta.id}`}>
          <Polyline 
            positions={ruta.puntos} 
            pathOptions={{ color: '#10b981', weight: 4, opacity: 0.8 }} 
          />
        </div>
      ))}

      {postes.map((poste) => (
        <Marker key={`poste-${poste.id}`} position={[poste.lat, poste.lng]} icon={iconPoste}>
          <Popup>
            <strong>{poste.nombre}</strong><br />
            Tipo: {poste.tipo}
          </Popup>
        </Marker>
      ))}

      {clientes.map((cliente) => (
        <Marker key={`cliente-${cliente.id}`} position={[cliente.lat, cliente.lng]} icon={iconCliente}>
          <Popup>
            <strong>{cliente.nombre}</strong><br />
            CI/RIF: {cliente.cedula}<br />
            Tipo: {cliente.tipo}
          </Popup>
        </Marker>
      ))}


      {puntosRutaActual.length > 0 && (
        <>
          <Polyline 
            positions={puntosRutaActual} 
            pathOptions={{ color: '#f59e0b', weight: 3, dashArray: '5, 10' }} 
          />
          {puntosRutaActual.map((pto, idx) => (
            <Marker key={`pto-${idx}`} position={pto} icon={iconDot} />
          ))}
        </>
      )}


      {nuevaLat && nuevaLng && !modoDibujo && (
        <Marker position={[nuevaLat, nuevaLng]} icon={iconCenter}>
          <Popup>Ubicacion seleccionada</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}