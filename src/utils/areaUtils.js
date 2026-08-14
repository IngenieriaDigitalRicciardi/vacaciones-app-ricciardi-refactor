import { AREAS } from '../config/orgData';

/**
 * Normaliza cadenas quitando tildes, mayúsculas y espacios extra.
 */
export const normalizarTexto = (texto) =>
  String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

/**
 * Mapea cualquier variante del nombre de un área a su clave oficial en orgData.js
 */
export const obtenerClaveArea = (areaInput) => {
  if (!areaInput) return '';
  if (AREAS[areaInput]) return areaInput;

  const busqueda = normalizarTexto(areaInput);
  const claveEncontrada = Object.keys(AREAS).find((key) => {
    const keyNormalizada = normalizarTexto(key);
    const labelNormalizado = normalizarTexto(AREAS[key]?.label);
    return keyNormalizada === busqueda || labelNormalizado === busqueda;
  });

  return claveEncontrada || String(areaInput).trim();
};

/**
 * Devuelve el objeto completo del área dada su clave o nombre
 */
export const obtenerAreaInfo = (areaInput) => {
  const clave = obtenerClaveArea(areaInput);
  return AREAS[clave] || null;
};