// Listado de sucursales y sociedades disponibles
export const SUCURSALES = ['Lobos', 'Mercedes', 'Peugeot', 'Fiat', 'Ayacucho'];
export const SOCIEDADES = ['GRSA', 'BLOIS', 'GVO'];

// Configuración centralizada de áreas y puestos (18 Áreas)
export const AREAS = {
  // --- FAMILIA VENTAS Y COMERCIAL (Google Color: 9 - Blueberry / Azul) ---
  Vendedor: {
    label: 'Vendedor',
    googleColorId: '1',
    badgeStyle: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  Vendedor_Plan_De_Ahorro: {
    label: 'Vendedor Plan de Ahorro',
    googleColorId: '2',
    badgeStyle: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  Administracion: {
    label: 'Administración',
    googleColorId: '3',
    badgeStyle: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  },
  Posventa: {
    label: 'Posventa',
    googleColorId: '4',
    badgeStyle: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  Tecnico: {
    label: 'Técnico',
    googleColorId: '5',
    badgeStyle: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  Lavador: {
    label: 'Lavador',
    googleColorId: '6',
    badgeStyle: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  ChapaYPintura: {
    label: 'Chapa y Pintura',
    googleColorId: '7',
    badgeStyle: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  Repuesto: {
    label: 'Repuestos',
    googleColorId: '8',
    badgeStyle: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  Recepcionista: {
    label: 'Recepcionista',
    googleColorId: '9',
    badgeStyle: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
    AdministracionPlanDeAhorrro: {
    label: 'Administración Plan de Ahorro',
    googleColorId: '10',
    badgeStyle: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  },
  Cajera: {
    label: 'Cajera',
    googleColorId: '11',
    badgeStyle: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  },
  Contabilidad: {
    label: 'Contabilidad',
    googleColorId: '11',
    badgeStyle: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  },
  MKT: {
    label: 'Marketing',
    googleColorId: '11',
    badgeStyle: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  },
  RRHH: {
    label: 'Recursos Humanos',
    googleColorId: '11',
    badgeStyle: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  },
  Sistemas: {
    label: 'Sistemas',
    googleColorId: '11',
    badgeStyle: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  },
  Seguros: {
    label: 'Seguros - Kinto',
    googleColorId: '11',
    badgeStyle: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  },
  Sustentabilidad: {
    label: 'Sustentabilidad',
    googleColorId: '11',
    badgeStyle: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  },
  IngenieriaDigital: {
    label: 'Ing. Digital',
    googleColorId: '11',
    badgeStyle: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  },
};

// Función robusta para obtener el color de Google Calendar sin errores de API
export const getGoogleColorId = (areaKey) => {
  let color = AREAS[areaKey]?.googleColorId;

  // Si se envió el texto del Label en vez de la Key (ej "Ing. Digital")
  if (!color) {
    const areaEncontrada = Object.values(AREAS).find(
      (a) => a.label?.toLowerCase() === String(areaKey)?.toLowerCase()
    );
    color = areaEncontrada?.googleColorId;
  }

  const numColor = parseInt(color, 10);
  if (isNaN(numColor) || numColor < 1 || numColor > 11) {
    return '8'; // Fallback a Charcoal/Gris si no lo encuentra o supera el límite
  }

  return String(numColor);
};