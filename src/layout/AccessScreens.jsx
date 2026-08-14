import React from 'react';

export function AccessChecking() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-center text-slate-300">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-sm font-medium">Verificando credenciales de acceso...</p>
    </div>
  );
}

export function AccessDenied({ userEmail, onConectar }) {
  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-center text-rose-300 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl flex flex-col items-center">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-2xl mb-4">
          🚫
        </div>
        <h1 className="text-xl font-bold text-white mb-2">403 - Acceso Restringido</h1>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          {userEmail ? (
            <>
              La cuenta <strong className="text-slate-200">{userEmail}</strong> no tiene permisos para acceder a
              esta aplicación.
            </>
          ) : (
            <>Debes iniciar sesión con una cuenta de Google autorizada para utilizar el sistema.</>
          )}
        </p>
        <button
          onClick={onConectar}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
        >
          Iniciar Sesión con Google
        </button>
      </div>
    </div>
  );
}
