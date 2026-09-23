"use client";

import { useEffect, useState } from 'react';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Circle, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';


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


function MapController({ centroEnfoque, onSeleccionarCoordenadas }) {
  const map = useMap();

  
  useEffect(() => {
    if (centroEnfoque && centroEnfoque.lat && centroEnfoque.lng) {
      map.flyTo([centroEnfoque.lat, centroEnfoque.lng], centroEnfoque.zoom || 17, {
        animate: true,
        duration: 1.5 
      });
    }
  }, [centroEnfoque, map]);

 
  useMapEvents({
    click(e) {
      if (onSeleccionarCoordenadas) {
        onSeleccionarCoordenadas(e.latlng.lat, e.latlng.lng);
      }
    }
  });

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

    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);

    return () => {
      clearTimeout(timer);
      setIsMounted(false);

      const container = document.getElementById('mapa-contenedor-telecom');
      if (container) {
        container._leaflet_id = null;
        container.innerHTML = '';
      }
    };
  }, []);


  if (!isMounted) {
    return <div className="h-full flex items-center justify-center bg-gray-100 text-gray-400 rounded-xl">Cargando mapa...</div>;
  }

  return (
    <MapContainer 
      id="mapa-contenedor-telecom"
      center={defaultCenter} 
      zoom={13} 
      style={{ height: "100%", width: "100%", borderRadius: "0.75rem", zIndex: 0 }}

    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {/* Controlador de Eventos y Animaciones */}
      <MapController 
        centroEnfoque={centroEnfoque} 
        onSeleccionarCoordenadas={onSeleccionarCoordenadas} 
      />

      {/* Zonas de Cobertura (Nodos) */}
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

      {/* Rutas (Fibra Óptica) */}
      {rutas.map((ruta) => (
        <div key={`ruta-${ruta.id}`}>
          <Polyline 
            positions={ruta.puntos} 
            pathOptions={{ color: '#10b981', weight: 4, opacity: 0.8 }} 
          />
        </div>
      ))}

      {/* Postes NAP */}
      {postes.map((poste) => (
        <Marker key={`poste-${poste.id}`} position={[poste.lat, poste.lng]} icon={iconPoste}>
          <Popup>
            <strong>{poste.nombre}</strong><br />
            Tipo: {poste.tipo}
          </Popup>
        </Marker>
      ))}

      {/* Clientes */}
      {clientes.map((cliente) => (
        <Marker key={`cliente-${cliente.id}`} position={[cliente.lat, cliente.lng]} icon={iconCliente}>
          <Popup>
            <strong>{cliente.nombre}</strong><br />
            CI/RIF: {cliente.cedula}<br />
            Tipo: {cliente.tipo}
          </Popup>
        </Marker>
      ))}

      {/* Dibujo en vivo de rutas */}
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

      {/* Marcador temporal al seleccionar un punto */}
      {nuevaLat && nuevaLng && !modoDibujo && (
        <Marker position={[nuevaLat, nuevaLng]} icon={iconCenter}>
          <Popup>Ubicacion seleccionada</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}