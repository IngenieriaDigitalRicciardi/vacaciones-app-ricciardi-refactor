import React from 'react';
import { SOCIEDADES, SUCURSALES, AREAS } from '../../config/orgData';

export default function ModalEditarEmpleado({
  empEditando,
  setEmpEditando,
  onGuardar,
  solicitudes = [],
}) {
  if (!empEditando) return null;

  const hoy = new Date().toISOString().split('T')[0];
  const vacacionesEmpleado = solicitudes.filter((s) => s.empleadoId === empEditando.id);
  const tieneVacacionActiva = vacacionesEmpleado.some((s) => s.startDate <= hoy && s.endDate >= hoy);
  const tieneVacacionesProgramadas = vacacionesEmpleado.some((s) => s.endDate >= hoy);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
        <h3 className="text-lg font-semibold text-white mb-4 shrink-0">Editar Empleado</h3>

        <div className="overflow-y-auto pr-1 space-y-4 flex-1 custom-scrollbar">
          {tieneVacacionesProgramadas && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-start gap-2.5">
              <span className="text-base leading-none">⚠️</span>
              <div>
                <p className="font-semibold mb-0.5">
                  {tieneVacacionActiva ? 'El empleado está de vacaciones actualmente.' : 'El empleado tiene vacaciones programadas.'}
                </p>
                <p className="text-[11px] text-amber-300/80 leading-relaxed">
                  Modificar su <strong>Área</strong> o <strong>Sucursal</strong> puede alterar el control de solapamientos.
                </p>
              </div>
            </div>
          )}

          <form id="form-edit-emp" onSubmit={onGuardar} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Legajo / DNI (No editable)</label>
              <input
                type="text"
                disabled
                value={empEditando.legajo || ''}
                className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800/50 rounded-xl text-sm text-slate-500 cursor-not-allowed outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nombre Completo</label>
              <input
                type="text"
                required
                value={empEditando.nombre || ''}
                onChange={(e) => setEmpEditando({ ...empEditando, nombre: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sociedad</label>
              <select
                value={empEditando.sociedad || ''}
                onChange={(e) => setEmpEditando({ ...empEditando, sociedad: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 outline-none"
              >
                {SOCIEDADES.map((soc) => (
                  <option key={soc} value={soc}>
                    {soc}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sucursal</label>
                <select
                  value={empEditando.sucursal || ''}
                  onChange={(e) => setEmpEditando({ ...empEditando, sucursal: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 outline-none"
                >
                  {SUCURSALES.map((suc) => (
                    <option key={suc} value={suc}>
                      {suc}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Área</label>
                <select
                  value={empEditando.area || ''}
                  onChange={(e) => setEmpEditando({ ...empEditando, area: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 outline-none"
                >
                  {Object.entries(AREAS).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Días de Vacaciones</label>
              <input
                type="number"
                min="0"
                step="1"
                value={empEditando.diasVacaciones ?? empEditando.diasTotales ?? empEditando.diasDisponibles ?? 0}
                onChange={(e) =>
                  setEmpEditando({
                    ...empEditando,
                    diasVacaciones: Number(e.target.value),
                    diasTotales: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
              <p className="text-[10px] text-slate-500 mt-1">Cantidad total de días asignados al empleado.</p>
            </div>
          </form>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800/80 mt-2 shrink-0">
          <button
            type="button"
            onClick={() => setEmpEditando(null)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="form-edit-emp"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}
