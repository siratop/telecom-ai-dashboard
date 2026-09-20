import './globals.css';
import Sidebar from '../components/Sidebar';

export const metadata = {
  title: 'Telecom AI - Panel Administrador',
  description: 'Sistema de atención automatizada',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="flex h-screen bg-gray-100 overflow-hidden">
        {/* Menú lateral fijo */}
        <Sidebar />
        
        {/* Contenedor principal dinámico */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}