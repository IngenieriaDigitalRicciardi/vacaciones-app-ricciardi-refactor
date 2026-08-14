import { useEffect, useState, useCallback } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES =
  'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
const ALLOWED_TEST_USERS = (import.meta.env.VITE_ALLOWED_TEST_USERS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const MINUTOS_EXPIRACION = 5; 

export function useGoogleAuth({ setMensaje } = {}) {
  const [authStatus, setAuthStatus] = useState('CHECKING'); // 'CHECKING' | 'ALLOWED' | 'DENIED'
  const [userEmail, setUserEmail] = useState('');
  const [tokenClient, setTokenClient] = useState(null);
  const [googleAccessToken, setGoogleAccessToken] = useState(null);

  // 🚪 Función para cerrar sesión y limpiar storage
  const cerrarSesion = useCallback(() => {
    localStorage.removeItem('g_auth_session');
    setUserEmail('');
    setGoogleAccessToken(null);
    setAuthStatus('DENIED');
  }, []);

  const verificarYGuardarToken = async (accessToken) => {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) throw new Error('Error al validar con Google');

      const userData = await res.json();
      const email = (userData.email || '').toLowerCase().trim();

      // 🔒 VALIDACIÓN DE LISTA BLANCA
      if (ALLOWED_TEST_USERS.length > 0 && !ALLOWED_TEST_USERS.includes(email)) {
        console.warn(`Acceso denegado para: ${email}`);
        cerrarSesion();
        return;
      }

      // ⏱️ 1. GUARDAR EN LOCALSTORAGE CON TIEMPO DE EXPIRACIÓN
      const expiresAt = Date.now() + MINUTOS_EXPIRACION * 60 * 1000;
      const sessionData = {
        accessToken,
        email,
        expiresAt,
      };

      localStorage.setItem('g_auth_session', JSON.stringify(sessionData));

      setUserEmail(email);
      setGoogleAccessToken(accessToken);
      setAuthStatus('ALLOWED');
    } catch (err) {
      console.error('Error de autenticación:', err);
      cerrarSesion();
    }
  };

  // Inicializa el tokenClient
  const crearTokenClient = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.error('Falta VITE_GOOGLE_CLIENT_ID en el archivo .env');
      setAuthStatus('DENIED');
      return null;
    }

    if (window.google?.accounts?.oauth2) {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: async (response) => {
          if (response.error) {
            console.error('Error del popup Google:', response);
            setAuthStatus('DENIED');
            return;
          }
          if (response.access_token) {
            await verificarYGuardarToken(response.access_token);
          } else {
            setAuthStatus('DENIED');
          }
        },
      });
      setTokenClient(client);
      return client;
    }
    return null;
  }, []);

  const conectarGoogle = () => {
    let client = tokenClient;
    if (!client) {
      client = crearTokenClient();
    }

    if (client) {
      client.requestAccessToken({ prompt: 'consent' });
    } else {
      if (setMensaje) {
        setMensaje({
          tipo: 'error',
          texto: 'El SDK de Google aún no ha cargado. Intenta de nuevo en unos segundos.',
        });
      }
    }
  };

  useEffect(() => {
    // ⏱️ 2. RESTAURAR SESIÓN AL REFRESCAR LA PÁGINA (Si no venció)
    const sessionRaw = localStorage.getItem('g_auth_session');

    if (sessionRaw) {
      try {
        const { accessToken, email, expiresAt } = JSON.parse(sessionRaw);

        // Si la hora actual es menor a la fecha de expiración, mantenemos la sesión activa
        if (Date.now() < expiresAt) {
          setGoogleAccessToken(accessToken);
          setUserEmail(email);
          setAuthStatus('ALLOWED');
        } else {
          // Si ya pasaron los minutos, limpiamos la sesión expirada
          cerrarSesion();
        }
      } catch (e) {
        cerrarSesion();
      }
    } else {
      setAuthStatus('DENIED');
    }

    // Cargar SDK de Google de forma segura
    const cargarSDKYInicializar = () => {
      if (window.google?.accounts?.oauth2) {
        crearTokenClient();
        return;
      }

      const scriptExistente = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (!scriptExistente) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => crearTokenClient();
        script.onerror = () => console.error('No se pudo cargar el SDK de Google');
        document.body.appendChild(script);
      } else {
        scriptExistente.addEventListener('load', () => crearTokenClient());
      }
    };

    cargarSDKYInicializar();
  }, [crearTokenClient, cerrarSesion]);

  return {
    authStatus,
    userEmail,
    googleAccessToken,
    conectarGoogle,
    cerrarSesion, // Exportado por si quieres agregar un botón de Logout
  };
}