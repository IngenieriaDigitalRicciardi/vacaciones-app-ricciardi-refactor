import { useMemo, useState } from 'react';
import { obtenerClaveArea } from '../utils/areaUtils';
import {
  getVacationRequests,
  createVacationRequest,
  updateVacationRequest,
  deleteVacationRequest,
} from '../services/vacationService';
import { updateEmployee } from '../services/employeeService';
import {
  crearEventoCalendar,
  actualizarEventoCalendar,
  eliminarEventoCalendar,
} from '../services/calendarService';

/**
 * Estado y operaciones sobre las solicitudes de vacaciones: alta con
 * detección de solapamientos, edición de fechas, baja, sincronización
 * con Google Calendar y los filtros de la tabla de licencias.
 *
 * Recibe `empleados`/`setEmpleados` de useEmpleados porque aprobar,
 * editar o cancelar una solicitud modifica el saldo de días del
 * empleado — igual que en la versión original.
 */
export function useSolicitudes({ empleados, setEmpleados, googleAccessToken, setMensaje, setLoading }) {
  const [solicitudes, setSolicitudes] = useState([]);

  const [busquedaSeleccion, setBusquedaSeleccion] = useState('');
  const [empSeleccionado, setEmpSeleccionado] = useState(null);
  const [solicitud, setSolicitud] = useState({ fechaInicio: '', fechaFin: '' });
  const [alertaSolapamiento, setAlertaSolapamiento] = useState(null);

  const [licenciaEditando, setLicenciaEditando] = useState(null);

  const [filtroLicBusqueda, setFiltroLicBusqueda] = useState('');
  const [filtroLicSociedad, setFiltroLicSociedad] = useState('TODAS');
  const [filtroLicSucursal, setFiltroLicSucursal] = useState('TODAS');
  const [filtroLicArea, setFiltroLicArea] = useState('TODAS');
  const [filtroLicFechaDesde, setFiltroLicFechaDesde] = useState('');
  const [filtroLicFechaHasta, setFiltroLicFechaHasta] = useState('');

  const cargarSolicitudes = async () => {
    const data = await getVacationRequests();
    setSolicitudes(data);
  };

  const empleadosSugeridos =
    busquedaSeleccion.trim() === ''
      ? []
      : empleados.filter(
          (e) =>
            e.nombre.toLowerCase().includes(busquedaSeleccion.toLowerCase()) ||
            (e.legajo && String(e.legajo).toLowerCase().includes(busquedaSeleccion.toLowerCase()))
        );

  const ejecutarGuardado = async (empleadoObj, diasPedidos) => {
    try {
      let eventId = null;
      try {
        eventId = await crearEventoCalendar(googleAccessToken, {
          nombre: empleadoObj.nombre,
          area: empleadoObj.area,
          inicio: solicitud.fechaInicio,
          fin: solicitud.fechaFin,
        });
      } catch (e) {
        console.warn('Fallo Google Calendar, pero se continúa en Firestore:', e.message);
      }

      const nuevaSolicitudData = {
        empleadoId: empleadoObj.id,
        nombreEmpleado: empleadoObj.nombre,
        startDate: solicitud.fechaInicio,
        endDate: solicitud.fechaFin,
        diasTomados: diasPedidos,
        status: 'Approved',
        googleEventId: eventId,
      };

      const creada = await createVacationRequest(nuevaSolicitudData);

      const nuevosDias = empleadoObj.diasDisponibles - diasPedidos;
      await updateEmployee(empleadoObj.id, { diasDisponibles: nuevosDias });

      setSolicitudes((prev) => [creada, ...prev]);
      setEmpleados((prev) =>
        prev.map((e) => (e.id === empleadoObj.id ? { ...e, diasDisponibles: nuevosDias } : e))
      );

      setMensaje({ tipo: 'exito', texto: 'Vacaciones aprobadas correctamente.' });
      setEmpSeleccionado(null);
      setSolicitud({ fechaInicio: '', fechaFin: '' });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: `Error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const validarYProcesarSolicitud = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setMensaje(null);
    setAlertaSolapamiento(null);

    try {
      if (!empSeleccionado) throw new Error('Debes seleccionar un empleado.');
      if (!solicitud.fechaInicio || !solicitud.fechaFin) throw new Error('Debes seleccionar fechas.');

      const inicio = new Date(solicitud.fechaInicio);
      const fin = new Date(solicitud.fechaFin);

      if (fin < inicio) throw new Error('La fecha fin no puede ser anterior a la inicio.');

      const diffTime = Math.abs(fin - inicio);
      const diasPedidos = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (diasPedidos > empSeleccionado.diasDisponibles) {
        throw new Error(`Días insuficientes. Solicitó ${diasPedidos} pero tiene ${empSeleccionado.diasDisponibles}.`);
      }

      const solapado = solicitudes.find((s) => {
        const empExistente = empleados.find((e) => e.id === s.empleadoId);
        if (!empExistente) return false;
        const mismaArea = empExistente.sucursal === empSeleccionado.sucursal && empExistente.area === empSeleccionado.area;
        if (mismaArea) {
          const sInicio = new Date(s.startDate);
          const sFin = new Date(s.endDate);
          return inicio <= sFin && fin >= sInicio;
        }
        return false;
      });

      if (solapado) {
        const empConflicto = empleados.find((e) => e.id === solapado.empleadoId);
        setAlertaSolapamiento({
          empleadoConflicto: empConflicto?.nombre || 'Un compañero',
          sucursal: empSeleccionado.sucursal,
          area: empSeleccionado.area,
          diasPedidos,
          empSeleccionado,
        });
        setLoading(false);
        return;
      }

      await ejecutarGuardado(empSeleccionado, diasPedidos);
      setAlertaSolapamiento(null);
      setSolicitud({ fechaInicio: '', fechaFin: '' });
      setEmpSeleccionado(null);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
      setLoading(false);
    }
  };

  const guardarEdicionLicencia = async (e) => {
    e.preventDefault();
    if (!licenciaEditando) return;

    const emp = empleados.find((item) => item.id === licenciaEditando.empleadoId);

    if (licenciaEditando.googleEventId) {
      try {
        await actualizarEventoCalendar(googleAccessToken, licenciaEditando.googleEventId, {
          nombre: licenciaEditando.nombreEmpleado,
          area: emp?.area || '',
          inicio: licenciaEditando.startDate,
          fin: licenciaEditando.endDate,
        });
      } catch (error) {
        setMensaje({
          tipo: 'error',
          texto: `Vacación actualizada localmente, pero falló Google Calendar: ${error.message}`,
        });
      }
    }

    const inicio = new Date(licenciaEditando.startDate);
    const fin = new Date(licenciaEditando.endDate);
    const diffTime = Math.abs(fin - inicio);
    const nuevosDiasTomados = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const solPrevia = solicitudes.find((s) => s.id === licenciaEditando.id);
    const viejosDias = solPrevia ? solPrevia.diasTomados : 0;
    const saldoRestaurado = (emp?.diasDisponibles || 0) + viejosDias;

    if (nuevosDiasTomados > saldoRestaurado) {
      alert(`El empleado no tiene suficientes días disponibles. Saldo disponible: ${saldoRestaurado} días.`);
      return;
    }

    await updateVacationRequest(licenciaEditando.id, {
      startDate: licenciaEditando.startDate,
      endDate: licenciaEditando.endDate,
      diasTomados: nuevosDiasTomados,
    });
    await updateEmployee(licenciaEditando.empleadoId, {
      diasDisponibles: saldoRestaurado - nuevosDiasTomados,
    });

    setEmpleados((prev) =>
      prev.map((item) =>
        item.id === licenciaEditando.empleadoId
          ? { ...item, diasDisponibles: saldoRestaurado - nuevosDiasTomados }
          : item
      )
    );

    setSolicitudes((prev) =>
      prev.map((s) =>
        s.id === licenciaEditando.id
          ? { ...licenciaEditando, diasTomados: nuevosDiasTomados }
          : s
      )
    );

    setLicenciaEditando(null);
  };

  const eliminarLicencia = async (solicitudObj) => {
    if (!solicitudObj) return;

    if (!window.confirm(`¿Cancelar vacaciones de ${solicitudObj.nombreEmpleado}?`)) return;

    try {
      if (solicitudObj.googleEventId) {
        await eliminarEventoCalendar(googleAccessToken, solicitudObj.googleEventId);
      }
      await deleteVacationRequest(solicitudObj.id);

      const empExistente = empleados.find((e) => e.id === solicitudObj.empleadoId);
      if (empExistente) {
        const nuevosDias = Number(empExistente.diasDisponibles) + Number(solicitudObj.diasTomados);
        await updateEmployee(empExistente.id, { diasDisponibles: nuevosDias });
        setEmpleados((prev) => prev.map((e) => (e.id === empExistente.id ? { ...e, diasDisponibles: nuevosDias } : e)));
      }

      setSolicitudes((prev) => prev.filter((s) => s.id !== solicitudObj.id));
      setMensaje({ tipo: 'exito', texto: 'Licencia eliminada de BD y Google Calendar.' });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    }
  };

  /**
   * Elimina la solicitud de un empleado como parte de la baja del
   * empleado: a diferencia de `eliminarLicencia`, acá NO se restaura
   * el saldo de días (el empleado se está borrando de todos modos).
   * Usado por App.jsx al eliminar un empleado con vacaciones cargadas.
   */
  const eliminarSolicitudPorBajaDeEmpleado = async (solicitudObj) => {
    if (solicitudObj.googleEventId) {
      await eliminarEventoCalendar(googleAccessToken, solicitudObj.googleEventId);
    }
    await deleteVacationRequest(solicitudObj.id);
  };

  /**
   * Mantiene sincronizado el nombre mostrado en las solicitudes cuando
   * se edita el nombre de un empleado.
   */
  const actualizarNombreEmpleadoEnSolicitudes = (empleadoId, nuevoNombre) => {
    setSolicitudes((prev) =>
      prev.map((sol) =>
        sol.empleadoId === empleadoId ? { ...sol, nombreEmpleado: nuevoNombre } : sol
      )
    );
  };

  const limpiarFiltrosLicencias = () => {
    setFiltroLicBusqueda('');
    setFiltroLicSociedad('TODAS');
    setFiltroLicSucursal('TODAS');
    setFiltroLicArea('TODAS');
    setFiltroLicFechaDesde('');
    setFiltroLicFechaHasta('');
  };

  const solicitudesFiltradas = useMemo(() => {
    return solicitudes.filter((sol) => {
      const emp = empleados.find((e) => e.id === sol.empleadoId);
      const busquedaLimpia = filtroLicBusqueda.toLowerCase().trim();
      const textoMatch =
        !busquedaLimpia ||
        sol.nombreEmpleado?.toLowerCase().includes(busquedaLimpia) ||
        emp?.legajo?.toString().includes(busquedaLimpia);

      const sociedadMatch =
        filtroLicSociedad === 'TODAS' || emp?.sociedad === filtroLicSociedad;
      const sucursalMatch =
        filtroLicSucursal === 'TODAS' || emp?.sucursal === filtroLicSucursal;
      const areaMatch =
        filtroLicArea === 'TODAS' ||
        obtenerClaveArea(emp?.area) === obtenerClaveArea(filtroLicArea);

      const fechaDesdeMatch =
        !filtroLicFechaDesde || sol.startDate >= filtroLicFechaDesde;
      const fechaHastaMatch =
        !filtroLicFechaHasta || sol.endDate <= filtroLicFechaHasta;

      return (
        textoMatch &&
        sociedadMatch &&
        sucursalMatch &&
        areaMatch &&
        fechaDesdeMatch &&
        fechaHastaMatch
      );
    });
  }, [
    solicitudes,
    empleados,
    filtroLicBusqueda,
    filtroLicSociedad,
    filtroLicSucursal,
    filtroLicArea,
    filtroLicFechaDesde,
    filtroLicFechaHasta,
  ]);

  return {
    solicitudes,
    setSolicitudes,
    cargarSolicitudes,

    busquedaSeleccion,
    setBusquedaSeleccion,
    empSeleccionado,
    setEmpSeleccionado,
    empleadosSugeridos,
    solicitud,
    setSolicitud,
    alertaSolapamiento,
    setAlertaSolapamiento,
    validarYProcesarSolicitud,
    ejecutarGuardado,

    licenciaEditando,
    setLicenciaEditando,
    guardarEdicionLicencia,
    eliminarLicencia,
    eliminarSolicitudPorBajaDeEmpleado,
    actualizarNombreEmpleadoEnSolicitudes,

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
    solicitudesFiltradas,
    limpiarFiltrosLicencias,
  };
}
