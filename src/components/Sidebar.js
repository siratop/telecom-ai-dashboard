"use client";

import { useEffect } from 'react';
import Link from 'next/link';

import { useRouter, usePathname } from 'next/navigation'; 
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, 
  Send,
  MapPin, 
  History, 
  Settings, 
  BookOpen, 
  Shield, 
  Activity, 
  BotMessageSquare,
  LogOut
} from 'lucide-react';

const supabaseUrl = 'https://symfbpwmwuedqatdwlrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bWZicHdtd3VlZHFhdGR3bHJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODk3MTAzOCwiZXhwIjoyMTA0NTQ3MDM4fQ.W9Fn-roMcTQ78PdV-LhOEAL2HoM8lpUwsGlD6EI4YEk' ; 
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname(); 

  
  useEffect(() => {
    const verificarSesion = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/login'); 
      }
    };
    verificarSesion();
  }, [router, pathname]); 

  const manejarCierreSesion = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push('/login'); 
      router.refresh();
    } else {
      console.error("Error al cerrar sesión:", error.message);
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Chats Telegram (En Vivo)', icon: Send, path: '/telegram' },
    { name: 'Zonas de Cobertura', icon: MapPin, path: '/cobertura' },
    { name: 'Historial y Exportación', icon: History, path: '/historial' },
    { name: 'Monitor de Red', icon: Activity, path: '/monitor' },
    { name: 'Asesor IA', icon: BotMessageSquare, path: '/asesor' },
    { name: 'Configuración', icon: Settings, path: '/configuracion' },
  ];

  const infoItems = [
    { name: 'Manual de Usuario', icon: BookOpen, path: '/manual' },
    { name: 'Legal y Privacidad', icon: Shield, path: '/legal' },
  ];

  return (
    <aside className="flex flex-col w-64 h-screen px-4 py-8 bg-blue-900 border-r text-white flex-shrink-0">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Telecom AI</h2>
        <p className="text-xs text-blue-300 mt-1">Panel de Administrador</p>
      </div>
      
      <div className="flex flex-col justify-between flex-1 overflow-y-auto">
        <nav className="space-y-1">
          <p className="px-3 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
            Gestión Principal
          </p>
          {menuItems.map((item, index) => (
            <Link key={index} href={item.path} className="flex items-center px-3 py-2.5 text-gray-100 hover:bg-blue-800 rounded-lg text-sm font-medium transition-colors">
              <item.icon className="w-4 h-4 mr-3 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          ))}

          <p className="px-3 text-xs font-semibold text-blue-400 uppercase tracking-wider mt-6 mb-2">
            Documentación
          </p>
          {infoItems.map((item, index) => (
            <Link key={index} href={item.path} className="flex items-center px-3 py-2 text-gray-300 hover:text-white hover:bg-blue-800 rounded-lg text-sm transition-colors">
              <item.icon className="w-4 h-4 mr-3 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="pt-4 border-t border-blue-800 mt-4">
          <div 
            onClick={manejarCierreSesion}
            className="flex items-center px-3 py-2.5 text-red-300 hover:text-red-100 hover:bg-blue-800 rounded-lg cursor-pointer transition-colors text-sm"
          >
            <LogOut className="w-4 h-4 mr-3" />
            <span>Cerrar Sesión</span>
          </div>
        </div>
      </div>
    </aside>
  );
}