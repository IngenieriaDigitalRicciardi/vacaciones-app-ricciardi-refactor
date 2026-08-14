import React, { useEffect, useState } from 'react';

import { useGoogleAuth } from './hooks/useGoogleAuth';
import { useEmpleados } from './hooks/useEmpleados';
import { useSolicitudes } from './hooks/useSolicitudes';

import { AccessChecking, AccessDenied } from './components/layout/AccessScreens';
import Header from './components/layout/Header';
import DashboardCards from './components/layout/DashboardCards';
import TabNav from './components/tabs/TabNav';
import Mensaje from './components/layout/Mensaje';
import AlertaSolapamiento from './components/layout/AlertaSolapamiento';

import TabSolicitudes from './components/tabs/TabSolicitudes';
import TabVacaciones from './components/tabs/TabVacaciones';
import TabEmpleados from './components/tabs/TabEmpleados';

import ModalEditarEmpleado from './components/modals/ModalEditarEmpleado';
import ModalEditarLicencia from './components/modals/ModalEditarLicencia';

export default function App() {
  const [pestana, setPestana] = useState('solicitudes');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const { authStatus, userEmail, googleAccessToken, conectarGoogle } = useGoogleAuth({ setMensaje });

  const empleadosHook = useEmpleados({ setMensaje, setLoading });
  const solicitudesHook = useSolicitudes({
    empleados: empleadosHook.empleados,
    setEmpleados: empleadosHook.setEmpleados,
    googleAccessToken,
    setMensaje,
    setLoading,
  });

  // Carga inicial de datos (equivalente a cargarDatos() en la versión anterior)
  useEffect(() => {
    setLoading(true);
    Promise.all([empleadosHook.cargarEmpleados(), solicitudesHook.cargarSolicitudes()])
      .catch((err) => setMensaje({ tipo: 'error', texto: err.message || 'Error cargando datos.' }))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cambiarPestana = (tab) => {
    setPestana(tab);
    setMensaje(null);
  };

  /**
   * Guarda la edición de un empleado y, si cambió el nombre, propaga
   * el cambio a sus solicitudes de vacaciones (misma lógica que tenía
   * App.jsx antes de separarse en hooks).
   */
  const handleGuardarEdicionEmpleado = async (e) => {
    const nombreAnterior = empleadosHook.empEditando?.nombre;
    const idEditado = empleadosHook.empEditando?.id;

    const resultado = await empleadosHook.guardarEdicionEmpleado(e, solicitudesHook.solicitudes);

    if (resultado?.nombreCambio && idEditado) {
      const empleadoActualizado = empleadosHook.empleados.find((emp) => emp.id === idEditado);
      solicitudesHook.actualizarNombreEmpleadoEnSolicitudes(idEditado, empleadoActualizado?.nombre ?? nombreAnterior);
    }
  };

  /**
   * Elimina un empleado y, en cascada, todas sus vacaciones (Firestore +
   * Google Calendar). Es el único flujo que cruza los dos dominios, así
   * que se coordina acá en vez de meterlo dentro de un solo hook.
   */
  const eliminarEmpleadoHandler = async (id, nombre) => {
    const vacacionesEmpleado = solicitudesHook.solicitudes.filter((s) => s.empleadoId === id);
    const totalVacaciones = vacacionesEmpleado.length;

    const mensajeConfirmacion =
      totalVacaciones > 0
        ? `⚠️ ATENCIÓN: ${nombre} tiene ${totalVacaciones} vacación(es) cargada(s).\n\n¿Estás seguro de eliminar al empleado? Se borrarán permanentemente.`
        : `¿Estás seguro de eliminar a ${nombre}?`;

    if (!window.confirm(mensajeConfirmacion)) return;

    setMensaje(null);

    try {
      for (const sol of vacacionesEmpleado) {
        await solicitudesHook.eliminarSolicitudPorBajaDeEmpleado(sol);
      }
      await empleadosHook.eliminarEmpleado(id);

      solicitudesHook.setSolicitudes((prev) => prev.filter((sol) => sol.empleadoId !== id));

      setMensaje({
        tipo: 'exito',
        texto: `Empleado '${nombre}' y sus vacaciones fueron eliminados correctamente.`,
      });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    }
  };

  if (authStatus === 'CHECKING') {
    return <AccessChecking />;
  }

  if (authStatus === 'DENIED') {
    return <AccessDenied userEmail={userEmail} onConectar={conectarGoogle} />;
  }

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 font-sans pb-12 selection:bg-indigo-500 selection:text-white">
      <style>{`
        html, body {
          background-color: #020617 !important;
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100vh;
        }
      `}</style>

      <Header googleAccessToken={googleAccessToken} onConectarGoogle={conectarGoogle} />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <DashboardCards totalSolicitudes={solicitudesHook.solicitudes.length} />

        <TabNav pestana={pestana} onCambiarPestana={cambiarPestana} />

        <Mensaje mensaje={mensaje} onCerrar={() => setMensaje(null)} />

        <AlertaSolapamiento
          alerta={solicitudesHook.alertaSolapamiento}
          onAutorizar={solicitudesHook.ejecutarGuardado}
          onCancelar={() => solicitudesHook.setAlertaSolapamiento(null)}
        />

        {pestana === 'solicitudes' && (
          <TabSolicitudes
            loading={loading}
            busquedaSeleccion={solicitudesHook.busquedaSeleccion}
            setBusquedaSeleccion={solicitudesHook.setBusquedaSeleccion}
            empleadosSugeridos={solicitudesHook.empleadosSugeridos}
            empSeleccionado={solicitudesHook.empSeleccionado}
            setEmpSeleccionado={solicitudesHook.setEmpSeleccionado}
            solicitud={solicitudesHook.solicitud}
            setSolicitud={solicitudesHook.setSolicitud}
            onSubmit={solicitudesHook.validarYProcesarSolicitud}
          />
        )}

        {pestana === 'licencias' && (
          <TabVacaciones
            solicitudes={solicitudesHook.solicitudes}
            solicitudesFiltradas={solicitudesHook.solicitudesFiltradas}
            empleados={empleadosHook.empleados}
            filtroLicBusqueda={solicitudesHook.filtroLicBusqueda}
            setFiltroLicBusqueda={solicitudesHook.setFiltroLicBusqueda}
            filtroLicSociedad={solicitudesHook.filtroLicSociedad}
            setFiltroLicSociedad={solicitudesHook.setFiltroLicSociedad}
            filtroLicSucursal={solicitudesHook.filtroLicSucursal}
            setFiltroLicSucursal={solicitudesHook.setFiltroLicSucursal}
            filtroLicArea={solicitudesHook.filtroLicArea}
            setFiltroLicArea={solicitudesHook.setFiltroLicArea}
            filtroLicFechaDesde={solicitudesHook.filtroLicFechaDesde}
            setFiltroLicFechaDesde={solicitudesHook.setFiltroLicFechaDesde}
            filtroLicFechaHasta={solicitudesHook.filtroLicFechaHasta}
            setFiltroLicFechaHasta={solicitudesHook.setFiltroLicFechaHasta}
            limpiarFiltrosLicencias={solicitudesHook.limpiarFiltrosLicencias}
            setLicenciaEditando={solicitudesHook.setLicenciaEditando}
            onEliminarLicencia={solicitudesHook.eliminarLicencia}
          />
        )}

        {pestana === 'empleados' && (
          <TabEmpleados
            loading={loading}
            nuevoEmp={empleadosHook.nuevoEmp}
            setNuevoEmp={empleadosHook.setNuevoEmp}
            onGuardarEmpleado={empleadosHook.guardarEmpleado}
            empleadosFiltrados={empleadosHook.empleadosFiltrados}
            filtroTexto={empleadosHook.filtroTexto}
            setFiltroTexto={empleadosHook.setFiltroTexto}
            filtroSucursal={empleadosHook.filtroSucursal}
            setFiltroSucursal={empleadosHook.setFiltroSucursal}
            filtroSociedad={empleadosHook.filtroSociedad}
            setFiltroSociedad={empleadosHook.setFiltroSociedad}
            filtroArea={empleadosHook.filtroArea}
            setFiltroArea={empleadosHook.setFiltroArea}
            filtroEstadoDias={empleadosHook.filtroEstadoDias}
            setFiltroEstadoDias={empleadosHook.setFiltroEstadoDias}
            limpiarFiltros={empleadosHook.limpiarFiltros}
            setEmpEditando={empleadosHook.setEmpEditando}
            onEliminarEmpleado={eliminarEmpleadoHandler}
          />
        )}
      </main>

      <ModalEditarEmpleado
        empEditando={empleadosHook.empEditando}
        setEmpEditando={empleadosHook.setEmpEditando}
        onGuardar={handleGuardarEdicionEmpleado}
        solicitudes={solicitudesHook.solicitudes}
      />

      <ModalEditarLicencia
        licenciaEditando={solicitudesHook.licenciaEditando}
        setLicenciaEditando={solicitudesHook.setLicenciaEditando}
        onGuardar={solicitudesHook.guardarEdicionLicencia}
      />
    </div>
  );
}
