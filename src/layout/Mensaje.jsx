import React from 'react';

export default function Mensaje({ mensaje, onCerrar }) {
  if (!mensaje) return null;

  return (
    <div
      className={`p-4 rounded-xl mb-6 text-sm flex items-start justify-between gap-3 border shadow-md transition-all ${
        mensaje.tipo === 'exito'
          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
          : 'bg-rose-950/60 text-rose-200 border-rose-500/40'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{mensaje.tipo === 'exito' ? '✅' : '🚫'}</span>
        <div className="font-medium">{mensaje.texto}</div>
      </div>
      <button onClick={onCerrar} className="text-xs text-slate-400 hover:text-white font-bold px-2 py-1 rounded">
        ✕
      </button>
    </div>
  );
}
