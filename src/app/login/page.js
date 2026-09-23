"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { ShieldCheck, Lock, Mail, Loader2, Key, UserPlus, LogIn } from 'lucide-react';


const supabaseUrl = 'https://symfbpwmwuedqatdwlrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bWZicHdtd3VlZHFhdGR3bHJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODk3MTAzOCwiZXhwIjoyMTA0NTQ3MDM4fQ.W9Fn-roMcTQ78PdV-LhOEAL2HoM8lpUwsGlD6EI4YEk';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codigoAdmin, setCodigoAdmin] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const router = useRouter();

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");
    setExito("");

    if (isLogin) {
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError("Credenciales invalidas. Verifica tu correo y contraseña.");
        setCargando(false);
      } else {
        router.push('/'); 
        router.refresh();
      }
    } else {
     
      
     
      const { data: configData, error: configError } = await supabase
        .from('configuracion')
        .select('valor')
        .eq('clave', 'codigo_admin')
        .single();

      if (configError || !configData) {
        setError("Error: El código de administrador no está configurado en la base de datos.");
        setCargando(false);
        return;
      }

      
      if (codigoAdmin !== configData.valor) {
        setError("Código de administrador incorrecto. Acceso denegado.");
        setCargando(false);
        return;
      }

      if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        setCargando(false);
        return;
      }

      
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setExito("¡Cuenta creada con exito! Ya puedes iniciar sesion.");
        setIsLogin(true);
        setPassword("");
        setCodigoAdmin("");
      }
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden relative z-10">
        
        <div className="bg-blue-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white/10 transform -skew-y-12 -translate-y-10"></div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm relative z-10 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white relative z-10 tracking-wide">Telecom AI</h2>
          <p className="text-blue-100 text-sm mt-2 relative z-10 font-medium">
            {isLogin ? "Acceso al Panel Administrativo" : "Registro de Nuevo Operador"}
          </p>
        </div>

        <form onSubmit={manejarSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm text-center font-bold flex items-center justify-center">
              {error}
            </div>
          )}
          {exito && (
            <div className="p-3 bg-green-50 text-green-600 border border-green-100 rounded-xl text-sm text-center font-bold">
              {exito}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Correo Electronico</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-sm transition-all"
                placeholder="operador@telecom.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contraseña</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-sm transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-bold text-purple-600 uppercase tracking-wider">Codigo de Administrador</label>
              <div className="relative">
                <Key className="w-5 h-5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={codigoAdmin}
                  onChange={(e) => setCodigoAdmin(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-purple-50 border border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-purple-700 text-sm transition-all placeholder-purple-300"
                  placeholder="Código secreto requerido"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-sm flex items-center justify-center shadow-lg shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {cargando ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isLogin ? (
              <><LogIn className="w-5 h-5 mr-2"/> Iniciar Sesion</>
            ) : (
              <><UserPlus className="w-5 h-5 mr-2"/> Crear Cuenta</>
            )}
          </button>
        </form>

        <div className="px-8 pb-8 text-center border-t border-gray-100 pt-5 bg-gray-50/50">
          <p className="text-sm text-gray-500">
            {isLogin ? "¿No tienes acceso?" : "¿Ya tienes una cuenta?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setExito("");
              }}
              className="text-blue-600 font-bold hover:underline"
            >
              {isLogin ? "Solicitar Cuenta" : "Iniciar Sesión"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}