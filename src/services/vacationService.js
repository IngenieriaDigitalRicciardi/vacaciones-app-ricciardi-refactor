import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

const COLLECTION_NAME = 'vacationRequests';

/**
 * Obtiene todas las solicitudes de vacaciones cargadas.
 */
export const getVacationRequests = async () => {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Crea una nueva solicitud de vacaciones.
 */
export const createVacationRequest = async (data) => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
  return { id: docRef.id, ...data };
};

/**
 * Actualiza una solicitud existente (por ejemplo, al editar fechas).
 */
export const updateVacationRequest = async (id, data) => {
  await updateDoc(doc(db, COLLECTION_NAME, id), data);
};

/**
 * Elimina una solicitud de vacaciones.
 */
export const deleteVacationRequest = async (id) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};
