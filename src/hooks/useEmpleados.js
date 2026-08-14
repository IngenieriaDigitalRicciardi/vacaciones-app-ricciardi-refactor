import { useMemo, useState } from 'react';
import { SUCURSALES, SOCIEDADES, AREAS } from '../config/orgData';
import { obtenerClaveArea } from '../utils/areaUtils';
import {
  getEmployeesPaginated,
  registrarEmpleado,
  updateEmployee,
  deleteEmployee,
  createEmployee,
} from '../services/employeeService';

const empleadoVacio = () => ({
  nombre: '',
  legajo: '',
  sucursal: SUCURSALES[0] || '',
  sociedad: SOCIEDADES[0] || '',
  area: Object.keys(AREAS)[0] || '',
  diasVacaciones: 14,
  diasTotales: 14,
  diasDisponibles: 14,
});

/**
 * Estado y operaciones sobre la colección de empleados: alta, edición,
 * baja, carga masiva desde nómina y los filtros de la tabla de nómina.
 *
 * `setMensaje` y `setLoading` los maneja App.jsx para que el mismo
 * banner de mensajes y el mismo indicador de carga se compartan con
 * el resto de la app (igual que en la versión original).
 */
export function useEmpleados({ setMensaje, setLoading }) {
  const [empleados, setEmpleados] = useState([]);
  const [nuevoEmp, setNuevoEmp] = useState(empleadoVacio());
  const [empEditando, setEmpEditando] = useState(null);

  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroSucursal, setFiltroSucursal] = useState('TODAS');
  const [filtroSociedad, setFiltroSociedad] = useState('TODAS');
  const [filtroArea, setFiltroArea] = useState('TODAS');
  const [filtroEstadoDias, setFiltroEstadoDias] = useState('TODOS');

  const cargarEmpleados = async () => {
    const empData = await getEmployeesPaginated(200);
    setEmpleados(empData);
  };

  const guardarEmpleado = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const areaLimpia = obtenerClaveArea(nuevoEmp.area);
      const dias = Number(nuevoEmp.diasVacaciones || 0);

      const empleadoAGuardar = {
        nombre: nuevoEmp.nombre?.trim() || '',
        legajo: nuevoEmp.legajo?.trim() || '',
        sociedad: nuevoEmp.sociedad || SOCIEDADES[0],
        sucursal: nuevoEmp.sucursal || SUCURSALES[0],
        area: areaLimpia,
        diasVacaciones: dias,
        diasTotales: dias,
        diasDisponibles: dias,
      };

      const empleadoCreado = await registrarEmpleado(empleadoAGuardar);
      setEmpleados((prev) => [...prev, empleadoCreado]);

      setMensaje({
        tipo: 'exito',
        texto: `Empleado ${empleadoCreado.nombre} cargado exitosamente.`,
      });

      setNuevoEmp(empleadoVacio());
    } catch (error) {
      console.error('Error al registrar empleado:', error);
      setMensaje({
        tipo: 'error',
        texto: `Error al guardar empleado: ${error?.message || error}`,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Guarda los cambios del modal de edición. Recibe `solicitudes` como
   * parámetro (en vez de tenerlas como dependencia del hook) porque
   * viven en useSolicitudes y sólo se necesitan acá para el aviso de
   * "tiene vacaciones vigentes" al cambiar área/sucursal.
   */
  const guardarEdicionEmpleado = async (e, solicitudes = []) => {
    e.preventDefault();
    if (!empEditando) return;

    try {
      const empOriginal = empleados.find((item) => item.id === empEditando.id);
      const hoy = new Date().toISOString().split('T')[0];

      const areaLimpiaEdicion = obtenerClaveArea(empEditando.area);
      const areaLimpiaOriginal = obtenerClaveArea(empOriginal?.area);

      const cambioAreaOSucursal =
        empOriginal &&
        (areaLimpiaOriginal !== areaLimpiaEdicion ||
          empOriginal.sucursal !== empEditando.sucursal);

      const tieneVacacionesVigentes = solicitudes.some(
        (s) => s.empleadoId === empEditando.id && s.endDate >= hoy
      );

      if (cambioAreaOSucursal && tieneVacacionesVigentes) {
        const confirmar = window.confirm(
          `⚠️ ADVERTENCIA DE ESTRUCTURA: \n\n` +
          `El empleado tiene vacaciones activas o programadas.\n` +
          `Al cambiar de Área o Sucursal, tenga en cuenta que pueden existir ` +
          `solapamientos de personal de vacaciones ` +
          `(${empEditando.sucursal} - ${AREAS[areaLimpiaEdicion]?.label || areaLimpiaEdicion}).\n\n` +
          `¿Desea guardar los cambios de todos modos?`
        );

        if (!confirmar) return;
      }

      const diasVacaciones = Number(empEditando.diasVacaciones ?? 0);
      const diasTotalesOriginal = Number(
        empOriginal?.diasTotales ?? empOriginal?.diasVacaciones ?? 0
      );
      const diasDisponiblesOriginal = Number(
        empOriginal?.diasDisponibles ?? diasTotalesOriginal
      );

      const diferenciaDias = diasVacaciones - diasTotalesOriginal;
      const diasTotales = diasVacaciones;
      const diasDisponibles = Math.max(0, diasDisponiblesOriginal + diferenciaDias);

      const empleadoActualizado = {
        nombre: empEditando.nombre?.trim() || '',
        sociedad: empEditando.sociedad || '',
        sucursal: empEditando.sucursal || '',
        area: areaLimpiaEdicion,
        legajo: empEditando.legajo || '',
        diasVacaciones,
        diasTotales,
        diasDisponibles,
        ...(empOriginal?.createdAt
          ? { createdAt: empOriginal.createdAt }
          : { createdAt: new Date().toISOString() }),
      };

      await updateEmployee(empEditando.id, empleadoActualizado);

      setEmpleados((prev) =>
        prev.map((emp) =>
          emp.id === empEditando.id
            ? { ...emp, id: emp.id, ...empleadoActualizado }
            : emp
        )
      );

      setEmpEditando(null);

      return { nombreCambio: empOriginal?.nombre !== empEditando.nombre };
    } catch (error) {
      console.error('Error al guardar el empleado en Firestore:', error);
      alert('No se pudieron guardar los cambios en Firestore.');
    }
  };

  /**
   * Elimina sólo el documento del empleado (sin tocar sus vacaciones).
   * El borrado en cascada de vacaciones lo orquesta App.jsx, que
   * también tiene acceso a useSolicitudes.
   */
  const eliminarEmpleado = async (id) => {
    await deleteEmployee(id);
    setEmpleados((prev) => prev.filter((e) => e.id !== id));
  };

  const importarNominaMasiva = async (nomina = []) => {
    setLoading(true);
    setMensaje(null);

    const resultado = {
      total: nomina.length,
      cargados: [],
      sd: [],
      duplicados: [],
      errores: [],
    };

    try {
      for (let i = 0; i < nomina.length; i++) {
        const emp = nomina[i];
        const nombre = String(emp.nombre ?? '').trim();
        const legajo = String(emp.legajo ?? '').trim();

        if (
          !legajo ||
          legajo.toUpperCase() === 'S/D' ||
          legajo.toUpperCase() === 'SD' ||
          legajo.includes('/')
        ) {
          resultado.sd.push({
            nombre,
            legajo: emp.legajo,
            sociedad: emp.sociedad,
            sucursal: emp.sucursal,
            motivo: 'Legajo S/D o inválido',
          });
          continue;
        }

        try {
          const nuevoEmpleado = await createEmployee({
            ...emp,
            legajo,
            area: obtenerClaveArea(emp.area),
          });
          resultado.cargados.push(nuevoEmpleado);
        } catch (errorEmpleado) {
          const mensajeError = errorEmpleado?.message || String(errorEmpleado);
          const esDuplicado =
            mensajeError.toLowerCase().includes('ya existe') ||
            mensajeError.toLowerCase().includes('duplicado') ||
            mensajeError.toLowerCase().includes('ya está registrado');

          if (esDuplicado) {
            resultado.duplicados.push({
              nombre,
              legajo,
              sociedad: emp.sociedad,
              sucursal: emp.sucursal,
              motivo: mensajeError,
            });
            continue;
          }

          resultado.errores.push({
            nombre,
            legajo,
            sociedad: emp.sociedad,
            sucursal: emp.sucursal,
            motivo: mensajeError,
          });
        }
      }

      if (resultado.cargados.length > 0) {
        setEmpleados((prev) => [...resultado.cargados, ...prev]);
      }

      setMensaje({
        tipo: resultado.errores.length > 0 ? 'error' : 'exito',
        texto: `Carga finalizada: ${resultado.cargados.length} cargados / ${resultado.sd.length} S/D / ${resultado.duplicados.length} duplicados / ${resultado.errores.length} errores.`,
      });
    } catch (errorGeneral) {
      setMensaje({
        tipo: 'error',
        texto: `Error general en la carga masiva: ${errorGeneral?.message || errorGeneral}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltroTexto('');
    setFiltroSucursal('TODAS');
    setFiltroArea('TODAS');
    setFiltroEstadoDias('TODOS');
  };

  const empleadosFiltrados = useMemo(() => {
    return empleados.filter((emp) => {
      const textoMatch =
        emp.nombre?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        emp.legajo?.toLowerCase().includes(filtroTexto.toLowerCase());

      const sociedadMatch = filtroSociedad === 'TODAS' || emp.sociedad === filtroSociedad;
      const sucursalMatch = filtroSucursal === 'TODAS' || emp.sucursal === filtroSucursal;
      const areaMatch =
        filtroArea === 'TODAS' ||
        obtenerClaveArea(emp?.area) === obtenerClaveArea(filtroArea);

      let diasMatch = true;
      if (filtroEstadoDias === 'CON_DIAS') {
        diasMatch = Number(emp.diasDisponibles) > 0;
      } else if (filtroEstadoDias === 'SIN_DIAS') {
        diasMatch = Number(emp.diasDisponibles) <= 0;
      }

      return textoMatch && sucursalMatch && areaMatch && diasMatch && sociedadMatch;
    });
  }, [empleados, filtroTexto, filtroSucursal, filtroArea, filtroEstadoDias, filtroSociedad]);

  return {
    empleados,
    setEmpleados,
    cargarEmpleados,

    nuevoEmp,
    setNuevoEmp,
    guardarEmpleado,

    empEditando,
    setEmpEditando,
    guardarEdicionEmpleado,

    eliminarEmpleado,
    importarNominaMasiva,

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
    empleadosFiltrados,
    limpiarFiltros,
  };
}
