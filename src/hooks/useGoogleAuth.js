import { useEffect, useState, useCallback } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES =
  'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
const ALLOWED_TEST_USERS = (import.meta.env.VITE_ALLOWED_TEST_USERS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function useGoogleAuth({ setMensaje } = {}) {
  const [authStatus, setAuthStatus] = useState('CHECKING'); // 'CHECKING' | 'ALLOWED' | 'DENIED'
  const [userEmail, setUserEmail] = useState('');
  const [tokenClient, setTokenClient] = useState(null);
  const [googleAccessToken, setGoogleAccessToken] = useState(null);

  const verificarYGuardarToken = async (accessToken) => {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) throw new Error('Error al validar con Google');

      const userData = await res.json();
      const email = (userData.email || '').toLowerCase().trim();
      setUserEmail(email);

      // 🔒 VALIDACIÓN DE LISTA BLANCA
      if (ALLOWED_TEST_USERS.length > 0 && !ALLOWED_TEST_USERS.includes(email)) {
        console.warn(`Acceso denegado para: ${email}`);
        setGoogleAccessToken(null);
        setAuthStatus('DENIED');
        return;
      }

      setGoogleAccessToken(accessToken);
      setAuthStatus('ALLOWED');
    } catch (err) {
      console.error('Error de autenticación:', err);
      setAuthStatus('DENIED');
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
    // 1. Cargar el SDK de Google de forma segura si no está disponible
    const cargarSDKYInicializar = () => {
      if (window.google?.accounts?.oauth2) {
        crearTokenClient();
        setAuthStatus('DENIED'); // Pasa de CHECKING a DENIED para habilitar la vista de Login
        return;
      }

      // Si el script no está en el HTML, lo inyectamos dinámicamente
      const scriptExistente = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (!scriptExistente) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          crearTokenClient();
          setAuthStatus('DENIED'); // Finaliza el chequeo inicial
        };
        script.onerror = () => {
          console.error('No se pudo cargar el SDK de Google');
          setAuthStatus('DENIED');
        };
        document.body.appendChild(script);
      } else {
        scriptExistente.addEventListener('load', () => {
          crearTokenClient();
          setAuthStatus('DENIED');
        });
      }
    };

    cargarSDKYInicializar();
  }, [crearTokenClient]);

  return {
    authStatus,
    userEmail,
    googleAccessToken,
    conectarGoogle,
  };
}