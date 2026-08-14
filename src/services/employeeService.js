import { db } from '../config/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
} from 'firebase/firestore';

const COLLECTION_NAME = 'employees';

/**
 * Función auxiliar para formatear errores técnicos de Firebase
 * a mensajes amigables.
 */
const handleFirebaseError = (error, defaultMessage) => {
  console.error('Error en Firebase:', error);

  if (error.code === 'permission-denied') {
    return 'No tienes permisos suficientes para realizar esta operación.';
  }

  if (error.code === 'unavailable') {
    return 'Error de conexión. Revisa tu acceso a internet.';
  }

  return error.message || defaultMessage;
};

/**
 * Valida que el legajo pueda utilizarse como ID de documento
 * en Firestore.
 */
const validarLegajo = (legajo) => {
  const valor = String(legajo ?? '').trim();

  if (!valor) {
    throw new Error('El número de legajo es obligatorio.');
  }

  // Valores que NO deben utilizarse como ID.
  if (valor.toUpperCase() === 'S/D') {
    throw new Error(
      `Legajo inválido: '${valor}'. El empleado debe tener un legajo válido.`
    );
  }

  // Firestore utiliza "/" como separador de segmentos.
  if (valor.includes('/')) {
    throw new Error(
      `Legajo inválido: '${valor}'. No puede contener el carácter '/'.`
    );
  }

  return valor;
};

/**
 * Agrega un nuevo empleado asegurando UNICIDAD por legajo/DNI.
 */
export const createEmployee = async (employeeData) => {
  try {
    const {
      legajo,
      nombre,
      sucursal,
      area,
    } = employeeData;

    // ==========================================
    // VALIDACIONES
    // ==========================================

    const legajoValido = validarLegajo(legajo);

    if (!nombre || !String(nombre).trim()) {
      throw new Error('El nombre del empleado es obligatorio.');
    }

    // ==========================================
    // ID SEGURO PARA FIRESTORE
    // ==========================================

    const customId = legajoValido.toLowerCase();

    // Protección adicional:
    // jamás permitimos que el ID contenga "/".
    if (customId.includes('/')) {
      throw new Error(
        `No se puede crear el empleado porque el legajo '${legajoValido}' contiene '/'.`
      );
    }

    // ==========================================
    // REFERENCIA FIRESTORE
    // ==========================================

    const employeeRef = doc(
      db,
      COLLECTION_NAME,
      customId
    );

    // ==========================================
    // VERIFICAR DUPLICADO
    // ==========================================

    const docSnap = await getDoc(employeeRef);

    if (docSnap.exists()) {
      throw new Error(
        `⚠️ Ya existe un empleado registrado con el legajo/DNI '${legajoValido}'.`
      );
    }

    // ==========================================
    // DATOS A GUARDAR
    // ==========================================

    const payload = {
      ...employeeData,
      legajo: legajoValido,
      diasTotales: Number(employeeData.diasTotales) || 14,
      diasDisponibles: Number(employeeData.diasDisponibles) || 14,
      createdAt: new Date().toISOString(),
    };

    // ==========================================
    // GUARDAR
    // ==========================================

    await setDoc(employeeRef, payload);

    return {
      id: customId,
      ...payload,
    };

  } catch (error) {
    throw new Error(
      handleFirebaseError(
        error,
        'No se pudo registrar el empleado.'
      )
    );
  }
};

/**
 * Obtener lista de empleados.
 */
export const getEmployeesPaginated = async (pageSize = 200) => {
  try {
    const employeesRef = collection(db, COLLECTION_NAME);

    const q = query(
      employeesRef,
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

  } catch (error) {
    throw new Error(
      handleFirebaseError(
        error,
        'Error al cargar la lista de empleados.'
      )
    );
  }
};

/**
 * Registra un empleado desde el formulario de "Alta de Empleado".
 * A diferencia de createEmployee (usado en la carga masiva), este flujo
 * usa un ID autogenerado por Firestore y valida duplicados por el campo
 * "legajo" en vez de usarlo como ID del documento. Se mantiene así para
 * no alterar el comportamiento actual de la app.
 */
export const registrarEmpleado = async (employeeData) => {
  try {
    const legajoLimpio = String(employeeData?.legajo ?? '').trim();

    if (!legajoLimpio) {
      throw new Error('El DNI / Legajo no puede estar vacío.');
    }

    const employeesRef = collection(db, COLLECTION_NAME);
    const q = query(employeesRef, where('legajo', '==', legajoLimpio));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      throw new Error(`El DNI / Legajo ${legajoLimpio} ya pertenece a otro empleado.`);
    }

    const payload = {
      ...employeeData,
      legajo: legajoLimpio,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(employeesRef, payload);

    return { id: docRef.id, ...payload };
  } catch (error) {
    throw new Error(
      handleFirebaseError(error, 'No se pudo registrar el empleado.')
    );
  }
};

/**
 * Actualiza los datos de un empleado existente.
 */
export const updateEmployee = async (id, data) => {
  try {
    if (!id) {
      throw new Error('ID de empleado no válido para actualizar.');
    }

    const employeeRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(employeeRef, data);
  } catch (error) {
    throw new Error(
      handleFirebaseError(error, 'No se pudieron guardar los cambios del empleado.')
    );
  }
};

/**
 * Elimina un empleado por ID/legajo.
 */
export const deleteEmployee = async (id) => {
  try {
    if (!id) {
      throw new Error(
        'ID de empleado no válido para eliminar.'
      );
    }

    // Protección adicional contra IDs inválidos.
    if (String(id).includes('/')) {
      throw new Error(
        'ID de empleado no válido.'
      );
    }

    const employeeRef = doc(
      db,
      COLLECTION_NAME,
      id
    );

    await deleteDoc(employeeRef);

  } catch (error) {
    throw new Error(
      handleFirebaseError(
        error,
        'Error al intentar eliminar el empleado.'
      )
    );
  }
};