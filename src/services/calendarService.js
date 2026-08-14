import { getGoogleColorId } from '../config/orgData';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID;

// Crear evento con color por área
export const crearEventoCalendar = async (googleAccessToken, { nombre, area, inicio, fin }) => {
  if (!googleAccessToken) return null;

  try {
    const fechaFinAjustada = new Date(fin);
    fechaFinAjustada.setDate(fechaFinAjustada.getDate() + 1);
    const endStr = fechaFinAjustada.toISOString().split('T')[0];

    const event = {
      summary: `🌴 Vacaciones: ${nombre} (${area})`,
      description: `Registro automatizado de vacaciones desde el panel general.`,
      start: { date: inicio },
      end: { date: endStr },
      colorId: getGoogleColorId(area), // <-- Asignación dinámica del color
    };

    const calIdEncoded = encodeURIComponent(GOOGLE_CALENDAR_ID);
    const url = `https://www.googleapis.com/calendar/v3/calendars/${calIdEncoded}/events?key=${GOOGLE_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${googleAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error al sincronizar con Google Calendar.');
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error Google Calendar:', error);
    throw error;
  }
};

// Actualizar fechas de un evento existente en Google Calendar
export const actualizarEventoCalendar = async (googleAccessToken, eventId, { nombre, area, inicio, fin }) => {
  if (!googleAccessToken || !eventId) return false;

  try {
    const fechaFinAjustada = new Date(fin);
    fechaFinAjustada.setDate(fechaFinAjustada.getDate() + 1);
    const endStr = fechaFinAjustada.toISOString().split('T')[0];

    const event = {
      summary: `🌴 Vacaciones: ${nombre} (${area})`,
      start: { date: inicio },
      end: { date: endStr },
    };

    const calIdEncoded = encodeURIComponent(GOOGLE_CALENDAR_ID);
    const url = `https://www.googleapis.com/calendar/v3/calendars/${calIdEncoded}/events/${eventId}?key=${GOOGLE_API_KEY}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${googleAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error al actualizar evento.');
    }

    return true;
  } catch (error) {
    console.error('Error Google Calendar:', error);
    throw error;
  }
};

// Eliminar evento de Google Calendar
export const eliminarEventoCalendar = async (googleAccessToken, eventId) => {
  if (!googleAccessToken) {
    console.error('❌ Error: googleAccessToken no está disponible.');
    throw new Error('No hay sesión activa con Google Calendar.');
  }

  if (!eventId) {
    console.error('❌ Error: eventId es nulo o indefinido.');
    throw new Error('La solicitud no tiene un ID de evento de Google asociado.');
  }

  const calIdEncoded = encodeURIComponent(GOOGLE_CALENDAR_ID);
  const url = `https://www.googleapis.com/calendar/v3/calendars/${calIdEncoded}/events/${eventId}?key=${GOOGLE_API_KEY}`;

  console.log(`📡 Enviando solicitud DELETE a Google Calendar para eventId: ${eventId}...`);

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${googleAccessToken}`,
      'Content-Type': 'application/json',
    },
  });

  // Google responde con HTTP Status 204 (No Content) cuando elimina con éxito
  if (res.status === 204 || res.ok) {
    console.log(`✅ Evento ${eventId} eliminado exitosamente de Google Calendar.`);
    return true;
  }

  // Si el evento ya no existía en Google Calendar (404), lo consideramos exito silencioso
  if (res.status === 404) {
    console.warn(`⚠️ El evento ${eventId} ya no existía en Google Calendar.`);
    return true;
  }

  // Si hubo un error (401 token inválido, 403 permisos insuficientes, etc.)
  const errData = await res.json().catch(() => ({}));
  console.error(`❌ Falló la eliminación en Google Calendar (Status ${res.status}):`, errData);

  throw new Error(
    errData.error?.message || `Error ${res.status} al intentar borrar el evento en Google Calendar.`
  );
};