import React from 'react';

export default function DashboardCards({ totalSolicitudes }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition-colors">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vacaciones Cargadas</span>
        <div className="text-2xl font-bold text-indigo-400 mt-1">
          {totalSolicitudes} <span className="text-sm font-normal text-slate-400">registros</span>
        </div>
      </div>
      <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition-colors">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estado de Servicios</span>
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-block w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
          <span className="text-sm font-medium text-slate-300">Base de datos en línea</span>
        </div>
      </div>
    </div>
  );
}
