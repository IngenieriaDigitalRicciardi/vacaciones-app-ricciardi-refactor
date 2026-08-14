import React from 'react';

export default function AlertaSolapamiento({ alerta, onAutorizar, onCancelar }) {
  if (!alerta) return null;

  return (
    <div className="bg-amber-950/30 border border-amber-500/30 p-6 rounded-2xl mb-8 shadow-lg">
      <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
        <span className="text-xl">⚠️</span> Solapamiento Detectado
      </div>
      <p className="text-amber-200/80 text-sm mb-4">
        Ya existen vacaciones para <strong className="font-semibold text-white">{alerta.empleadoConflicto}</strong> en
        la sucursal <strong>{alerta.sucursal}</strong> (Área {alerta.area}).
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => onAutorizar(alerta.empSeleccionado, alerta.diasPedidos)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs rounded-lg transition-colors shadow-sm"
        >
          Autorizar Excepción
        </button>
        <button
          onClick={onCancelar}
          className="px-4 py-2 bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 font-medium text-xs rounded-lg transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
