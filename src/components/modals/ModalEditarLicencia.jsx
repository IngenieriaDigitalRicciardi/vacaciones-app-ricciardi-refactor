import React from 'react';

export default function ModalEditarLicencia({
  licenciaEditando,
  setLicenciaEditando,
  onGuardar,
}) {
  if (!licenciaEditando) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
        <h3 className="text-lg font-semibold text-white">Editar Vacaciones</h3>
        <p className="text-xs text-slate-400">
          Empleado: <span className="text-slate-200 font-medium">{licenciaEditando.nombreEmpleado}</span>
        </p>

        <form onSubmit={onGuardar} className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fecha Desde</label>
            <input
              type="date"
              required
              value={licenciaEditando.startDate || ''}
              onChange={(e) => setLicenciaEditando({ ...licenciaEditando, startDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fecha Hasta</label>
            <input
              type="date"
              required
              value={licenciaEditando.endDate || ''}
              onChange={(e) => setLicenciaEditando({ ...licenciaEditando, endDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3">
            <button
              type="button"
              onClick={() => setLicenciaEditando(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Actualizar Fechas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
