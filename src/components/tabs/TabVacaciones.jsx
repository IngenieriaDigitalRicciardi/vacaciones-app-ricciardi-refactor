import React, { useState } from 'react';
import { SOCIEDADES, SUCURSALES, AREAS } from '../../config/orgData';
import { obtenerAreaInfo } from '../../utils/areaUtils';
import { generarNotaVacaciones } from '../../services/pdfGenerator';
import { generarReportePDF } from '../../services/pdfGeneratorVacaciones';

export default function TabVacaciones({
  solicitudes,
  solicitudesFiltradas,
  empleados,
  filtroLicBusqueda,
  setFiltroLicBusqueda,
  filtroLicSociedad,
  setFiltroLicSociedad,
  filtroLicSucursal,
  setFiltroLicSucursal,
  filtroLicArea,
  setFiltroLicArea,
  filtroLicFechaDesde,
  setFiltroLicFechaDesde,
  filtroLicFechaHasta,
  setFiltroLicFechaHasta,
  limpiarFiltrosLicencias,
  setLicenciaEditando,
  onEliminarLicencia,
}) {
  const [exportando, setExportando] = useState(false);
  const [notaGenerandoId, setNotaGenerandoId] = useState(null);

  const hayFiltrosActivos =
    filtroLicBusqueda ||
    filtroLicSociedad !== 'TODAS' ||
    filtroLicSucursal !== 'TODAS' ||
    filtroLicArea !== 'TODAS' ||
    filtroLicFechaDesde ||
    filtroLicFechaHasta;

  const handleExportarPDF = async () => {
    setExportando(true);
    try {
      await generarReportePDF(solicitudesFiltradas, empleados, AREAS);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
    } finally {
      setExportando(false);
    }
  };

  const handleGenerarNota = async (s, emp) => {
    setNotaGenerandoId(s.id);
    await generarNotaVacaciones(s, emp);
    setNotaGenerandoId(null);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Registro de Vacaciones Cargadas</h2>
          <p className="text-xs text-slate-400">
            Mostrando {solicitudesFiltradas.length} de {solicitudes.length} registros
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {hayFiltrosActivos && (
            <button
              type="button"
              onClick={limpiarFiltrosLicencias}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline transition-colors"
            >
              Limpiar todos los filtros
            </button>
          )}

          <button
            type="button"
            disabled={solicitudesFiltradas.length === 0 || exportando}
            onClick={handleExportarPDF}
            className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            {exportando ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Generando...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Exportar PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* PANEL DE FILTROS COMPLETO */}
      <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-3">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Buscar Empleado</label>
          <input
            type="text"
            placeholder="Nombre o legajo..."
            value={filtroLicBusqueda}
            onChange={(e) => setFiltroLicBusqueda(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none placeholder-slate-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sociedad</label>
            <select
              value={filtroLicSociedad}
              onChange={(e) => setFiltroLicSociedad(e.target.value)}
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
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sucursal</label>
            <select
              value={filtroLicSucursal}
              onChange={(e) => setFiltroLicSucursal(e.target.value)}
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
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Área</label>
            <select
              value={filtroLicArea}
              onChange={(e) => setFiltroLicArea(e.target.value)}
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

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Desde</label>
              <input
                type="date"
                value={filtroLicFechaDesde}
                onChange={(e) => setFiltroLicFechaDesde(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Hasta</label>
              <input
                type="date"
                value={filtroLicFechaHasta}
                onChange={(e) => setFiltroLicFechaHasta(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* TABLA DE LICENCIAS */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="pb-3 px-3">Empleado</th>
              <th className="pb-3 px-3">Sociedad / Sucursal</th>
              <th className="pb-3 px-3">Área</th>
              <th className="pb-3 px-3">Fecha Desde</th>
              <th className="pb-3 px-3">Fecha Hasta</th>
              <th className="pb-3 px-3 text-center">Días</th>
              <th className="pb-3 px-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {solicitudesFiltradas.map((s) => {
              const emp = empleados.find((e) => e.id === s.empleadoId);
              const areaInfo = obtenerAreaInfo(emp?.area);
              const generandoEstaNota = notaGenerandoId === s.id;

              return (
                <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-200">{s.nombreEmpleado}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{emp?.legajo}</div>
                  </td>
                  <td className="py-3 px-3 text-xs text-slate-300">
                    <span className="font-semibold text-indigo-300">{emp?.sociedad || 'N/A'}</span>
                    <span className="mx-1.5 text-slate-600">•</span>
                    <span className="text-slate-400">{emp?.sucursal || 'N/A'}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs border font-medium inline-block ${
                        areaInfo?.badgeStyle || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {areaInfo?.label || emp?.area || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-mono text-xs">{s.startDate}</td>
                  <td className="py-3 px-3 text-slate-400 font-mono text-xs">{s.endDate}</td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded-full text-xs font-semibold inline-block whitespace-nowrap">
                      {s.diasTomados} días
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => setLicenciaEditando({ ...s })}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onEliminarLicencia(s)}
                      className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
                    >
                      Eliminar
                    </button>
                    <button
                      type="button"
                      disabled={generandoEstaNota}
                      onClick={() => handleGenerarNota(s, emp)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 disabled:text-slate-500 font-medium transition-colors cursor-pointer"
                    >
                      {generandoEstaNota ? '⏳ Generando...' : 'Generar Nota'}
                    </button>
                  </td>
                </tr>
              );
            })}
            {solicitudesFiltradas.length === 0 && (
              <tr>
                <td colSpan="7" className="py-10 text-center text-slate-500 text-sm">
                  No se encontraron vacaciones con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
