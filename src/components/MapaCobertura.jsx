"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Icono personalizado para el centro del nodo
const iconCenter = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

// Icono personalizado para trazos de ruta
const iconDot = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  iconSize: [15, 24],
  iconAnchor: [7, 24],
});

// Icono personalizado para los clientes (Púrpura)
const iconCliente = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});


function MoverCamara({ centroEnfoque }) {
  const map = useMap();
  useEffect(() => {
    if (centroEnfoque && centroEnfoque.lat && centroEnfoque.lng) {
      map.flyTo([centroEnfoque.lat, centroEnfoque.lng], centroEnfoque.zoom || 17, {
        animate: true,
        duration: 1.5
      });
    }
  }, [centroEnfoque, map]);
  return null;
}


function MapEvents({ onSeleccionar, modoDibujo }) {
  useMapEvents({
    click(e) {
      if (onSeleccionar) {
        onSeleccionar(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  
  
  useEffect(() => {
    const mapContainer = document.querySelector('.leaflet-container');
    if (mapContainer) {
      mapContainer.style.cursor = modoDibujo ? 'crosshair' : 'grab';
    }
  }, [modoDibujo]);

  return null;
}

export default function MapaCobertura({ 
  zonas = [], 
  rutas = [], 
  clientes = [], 
  puntosRutaActual = [], 
  modoDibujo = false, 
  onSeleccionarCoordenadas, 
  nuevaLat, 
  nuevaLng,
  centroEnfoque 
}) {
  // Coordenadas centrales de Puerto Ordaz
  const defaultCenter = [8.2932, -62.7303];

  return (
    <MapContainer 
      center={defaultCenter} 
      zoom={13} 
      style={{ height: "100%", width: "100%", borderRadius: "0.75rem", zIndex: 0 }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      
      {/* Hooks internos del mapa */}
      <MoverCamara centroEnfoque={centroEnfoque} />
      <MapEvents onSeleccionar={onSeleccionarCoordenadas} modoDibujo={modoDibujo} />

      {/* DIBUJAR NODOS (CIRCULOS) */}
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
              {zona.tieneFalla ? "⚠️ CAÍDA ACTIVA" : "✅ Operativo"}
            </Popup>
          </Marker>
        </div>
      ))}

      {/* DIBUJAR RUTAS GUARDADAS (POLYLINES) */}
      {rutas.map((ruta) => (
        <div key={`ruta-${ruta.id}`}>
          <Polyline 
            positions={ruta.puntos} 
            pathOptions={{ color: '#10b981', weight: 4, opacity: 0.8 }} 
          />
        </div>
      ))}

      {/* DIBUJAR CLIENTES REGISTRADOS */}
      {clientes.map((cliente) => (
        <Marker key={`cliente-${cliente.id}`} position={[cliente.lat, cliente.lng]} icon={iconCliente}>
          <Popup>
            <strong>{cliente.nombre}</strong><br />
            CI/RIF: {cliente.cedula}<br />
            Tipo: {cliente.tipo}
          </Popup>
        </Marker>
      ))}

      {/* DIBUJAR RUTA ACTUAL EN CREACIÓN (EN VIVO) */}
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

      {/* MARCADOR TEMPORAL PARA NUEVO REGISTRO */}
      {nuevaLat && nuevaLng && !modoDibujo && (
        <Marker position={[nuevaLat, nuevaLng]} icon={iconCenter}>
          <Popup>Ubicación seleccionada</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}