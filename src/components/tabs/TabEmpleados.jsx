import React from 'react';
import { SOCIEDADES, SUCURSALES, AREAS } from '../../config/orgData';

export default function TabEmpleados({
  loading,
  nuevoEmp,
  setNuevoEmp,
  onGuardarEmpleado,
  empleadosFiltrados,
  filtroTexto,
  setFiltroTexto,
  filtroSucursal,
  setFiltroSucursal,
  filtroSociedad,
  setFiltroSociedad,
  filtroArea,
  setFiltroArea,
  filtroEstadoDias,
  setFiltroEstadoDias,
  limpiarFiltros,
  setEmpEditando,
  onEliminarEmpleado,
}) {
  const hayFiltrosActivos =
    filtroTexto || filtroSucursal !== 'TODAS' || filtroArea !== 'TODAS' || filtroEstadoDias !== 'TODOS';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* FORMULARIO DE ALTA */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
        <h2 className="text-lg font-semibold text-white mb-6">Alta de Empleado</h2>
        <form onSubmit={onGuardarEmpleado} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              placeholder="Ej. Maria Gomez"
              value={nuevoEmp.nombre}
              onChange={(e) => setNuevoEmp({ ...nuevoEmp, nombre: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-200 placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Legajo / DNI</label>
            <input
              type="text"
              required
              placeholder="Ej. 40323531"
              value={nuevoEmp.legajo}
              onChange={(e) => setNuevoEmp({ ...nuevoEmp, legajo: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-200 placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Sociedad</label>
            <select
              value={nuevoEmp.sociedad}
              onChange={(e) => setNuevoEmp({ ...nuevoEmp, sociedad: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-200"
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
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Sucursal</label>
              <select
                value={nuevoEmp.sucursal}
                onChange={(e) => setNuevoEmp({ ...nuevoEmp, sucursal: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-200"
              >
                {SUCURSALES.map((suc) => (
                  <option key={suc} value={suc}>
                    {suc}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Área</label>
              <select
                required
                value={nuevoEmp.area}
                onChange={(e) => setNuevoEmp({ ...nuevoEmp, area: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-200"
              >
                <option value="" disabled>
                  Seleccionar Área...
                </option>
                {Object.entries(AREAS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Días de Vacaciones Anuales</label>
            <input
              type="number"
              required
              min="1"
              value={nuevoEmp.diasVacaciones}
              onChange={(e) => {
                const cantidad = Number(e.target.value);
                setNuevoEmp({
                  ...nuevoEmp,
                  diasVacaciones: cantidad,
                  diasTotales: cantidad,
                  diasDisponibles: cantidad,
                });
              }}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-200"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-md transition-all text-sm disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Registrar Empleado'}
            </button>
            {/* Carga masiva de nómina: disponible en el hook (importarNominaMasiva),
                el botón se dejó comentado en el diseño original. */}
          </div>
        </form>
      </div>

      {/* TABLA DE NÓMINA CON FILTROS */}
      <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-white">
            Nómina de Empleados <span className="text-xs text-slate-500 font-normal">({empleadosFiltrados.length} resultados)</span>
          </h2>
          {hayFiltrosActivos && (
            <button onClick={limpiarFiltros} className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium self-start sm:self-auto">
              Limpiar Filtros
            </button>
          )}
        </div>

        {/* PANEL DE FILTROS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Buscar</label>
            <input
              type="text"
              placeholder="Nombre o legajo..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none placeholder-slate-600"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sucursal</label>
            <select
              value={filtroSucursal}
              onChange={(e) => setFiltroSucursal(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="TODAS">Todas las sucursales</option>
              {SUCURSALES.map((suc) => (
                <option key={suc} value={suc}>
                  {suc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sociedad</label>
            <select
              value={filtroSociedad}
              onChange={(e) => setFiltroSociedad(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="TODAS">Todas las sociedades</option>
              {SOCIEDADES.map((soc) => (
                <option key={soc} value={soc}>
                  {soc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Área</label>
            <select
              value={filtroArea}
              onChange={(e) => setFiltroArea(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="TODAS">Todas las áreas</option>
              {Object.entries(AREAS).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Días Disponibles</label>
            <select
              value={filtroEstadoDias}
              onChange={(e) => setFiltroEstadoDias(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="TODOS">Todos</option>
              <option value="CON_DIAS">Con días (&gt; 0)</option>
              <option value="SIN_DIAS">Sin días (= 0)</option>
            </select>
          </div>
        </div>

        {/* TABLA */}
        <div className="w-full overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="pb-2 px-2">Legajo</th>
                <th className="pb-2 px-2">Nombre</th>
                <th className="pb-2 px-2">Sociedad</th>
                <th className="pb-2 px-2">Sucursal</th>
                <th className="pb-2 px-2">Área</th>
                <th className="pb-2 px-2 text-center">Días Disp.</th>
                <th className="pb-2 px-2 text-right">Acción</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-xs">
              {empleadosFiltrados.map((e) => {
                const areaInfo = AREAS[e.area];

                return (
                  <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-2 text-[11px] text-slate-400 font-mono">{e.legajo}</td>
                    <td className="py-2 px-2 text-[11px] text-slate-200">{e.nombre}</td>
                    <td className="py-2 px-2 text-[11px] text-indigo-300 font-semibold">{e.sociedad || 'N/A'}</td>
                    <td className="py-2 px-2 text-[11px] text-slate-400">{e.sucursal}</td>
                    <td className="py-2 px-2">
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] border font-medium inline-block ${
                          areaInfo?.badgeStyle || 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {areaInfo?.label || e.area}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center whitespace-nowrap">
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          Number(e.diasDisponibles) > 0
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {e.diasDisponibles}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setEmpEditando({ ...e })}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors mr-3"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onEliminarEmpleado(e.id, e.nombre)}
                        className="text-[11px] text-rose-400 hover:text-rose-300 font-medium transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}

              {empleadosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-500 text-xs">
                    No se encontraron empleados con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
