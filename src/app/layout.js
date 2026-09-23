"use client";

import { usePathname } from 'next/navigation';
import './globals.css';
import Sidebar from '../components/Sidebar';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  
  const esPaginaLogin = pathname === '/login';

  return (
    <html lang="es">
      <body className={`flex h-screen bg-gray-100 ${esPaginaLogin ? '' : 'overflow-hidden'}`}>
        
       
        {!esPaginaLogin && <Sidebar />}
        
        
        <main className={`flex-1 ${esPaginaLogin ? 'overflow-auto' : 'overflow-y-auto'}`}>
          {children}
        </main>
        
      </body>
    </html>
  );
}