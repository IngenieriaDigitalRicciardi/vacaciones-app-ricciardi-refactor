import React from 'react';

export default function TabSolicitudes({
  loading,
  busquedaSeleccion,
  setBusquedaSeleccion,
  empleadosSugeridos,
  empSeleccionado,
  setEmpSeleccionado,
  solicitud,
  setSolicitud,
  onSubmit,
}) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-3xl">
      <h2 className="text-lg font-semibold text-white mb-6">Nueva Solicitud de Vacaciones</h2>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="relative">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Empleado</label>

          {!empSeleccionado ? (
            <>
              <input
                type="text"
                placeholder="Buscar por nombre o legajo..."
                value={busquedaSeleccion}
                onChange={(e) => setBusquedaSeleccion(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm text-slate-200 placeholder-slate-500"
              />
              {empleadosSugeridos.length > 0 && (
                <ul className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-h-56 overflow-y-auto z-30 divide-y divide-slate-800/60">
                  {empleadosSugeridos.map((e) => (
                    <li
                      key={e.id}
                      onClick={() => {
                        setEmpSeleccionado(e);
                        setBusquedaSeleccion('');
                      }}
                      className="p-3 hover:bg-slate-800/70 cursor-pointer flex justify-between items-center transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-slate-100 text-sm">{e.nombre}</div>
                        <div className="text-xs text-slate-400">
                          {e.sucursal} • {e.area}
                        </div>
                      </div>
                      <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">
                        {e.diasDisponibles} días disp.
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-bold text-white text-sm">{empSeleccionado.nombre}</div>
                <div className="text-xs text-indigo-300 mt-0.5">
                  {empSeleccionado.sucursal} • {empSeleccionado.area} | Disponible:{' '}
                  <strong className="font-bold text-indigo-200">{empSeleccionado.diasDisponibles} días</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEmpSeleccionado(null)}
                className="text-xs text-indigo-300 hover:text-white font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg transition-all"
              >
                Cambiar
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fecha Inicio</label>
            <input
              type="date"
              required
              value={solicitud.fechaInicio}
              onChange={(e) => setSolicitud({ ...solicitud, fechaInicio: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fecha Fin</label>
            <input
              type="date"
              required
              value={solicitud.fechaFin}
              onChange={(e) => setSolicitud({ ...solicitud, fechaFin: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-200"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 text-sm"
        >
          {loading ? 'Procesando e impactando...' : 'Confirmar e Impactar en Google Calendar'}
        </button>
      </form>
    </div>
  );
}
