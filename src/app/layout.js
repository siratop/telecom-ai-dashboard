"use client";

import { usePathname } from 'next/navigation';
import './globals.css';
import Sidebar from '../components/Sidebar';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  // Verifica si el usuario está en la raíz o en la página de login
  const esPaginaLogin = pathname === '/login';

  return (
    <html lang="es">
      <body className={`flex h-screen bg-gray-100 ${esPaginaLogin ? '' : 'overflow-hidden'}`}>
        
        {/* Menú lateral fijo: Solo se renderiza si NO estamos en login */}
        {!esPaginaLogin && <Sidebar />}
        
        {/* Contenedor principal dinámico */}
        <main className={`flex-1 ${esPaginaLogin ? 'overflow-auto' : 'overflow-y-auto'}`}>
          {children}
        </main>
        
      </body>
    </html>
  );
}