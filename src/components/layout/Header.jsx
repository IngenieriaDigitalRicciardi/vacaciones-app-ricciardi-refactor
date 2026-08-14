import React from 'react';

export default function Header({ googleAccessToken, onConectarGoogle }) {
  return (
    <header className="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20 shadow-lg">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center p-2 shadow-md shadow-red-500/10 group hover:border-red-500/40 transition-colors">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-red-600 group-hover:scale-105 transition-transform">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 1.6c4.64 0 8.4 3.76 8.4 8.4s-3.76 8.4-8.4 8.4S3.6 16.64 3.6 12 7.36 3.6 12 3.6zm0 1.8c-3.76 0-6.8 2.96-6.8 6.6s3.04 6.6 6.8 6.6 6.8-2.96 6.8-6.6-3.04-6.6-6.8-6.6zm0 1.6c2.87 0 5.2 2.24 5.2 5s-2.33 5-5.2 5-5.2-2.24-5.2-5 2.33-5 5.2-5zm0 1.6c-1.77 0-3.2 1.52-3.2 3.4s1.43 3.4 3.2 3.4 3.2-1.52 3.2-3.4-1.43-3.4-3.2-3.4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xs font-bold text-white tracking-tight">Gestión de Vacaciones - Ricciardi</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open('https://calendar.google.com', '_blank', 'noopener,noreferrer')}
            className="px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 rounded-lg font-semibold text-xs tracking-wide transition-all shadow-sm flex items-center gap-2"
          >
            Abrir Calendar ↗
          </button>

          <button
            onClick={onConectarGoogle}
            className={`px-4 py-2 rounded-lg font-semibold text-xs tracking-wide transition-all shadow-sm flex items-center gap-2 border ${
              googleAccessToken
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${googleAccessToken ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
            {googleAccessToken ? 'Google Calendar Conectado' : 'Conectar Google Calendar'}
          </button>
        </div>
      </div>
    </header>
  );
}
