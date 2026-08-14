import jsPDF from 'jspdf';

const LOGOS_POR_SOCIEDAD = {
  'GRSA': '/logo_ricciardi.png',
  'GVO': '/logo_gvo.png',
  'BLOIS': '/logo_blois.png'
};

const LOGO_DEFAULT = '/logo_gruporicciardi.png';

// 🎨 DETALLES Y ACENTOS DE COLOR POR SOCIEDAD (ÚNICAMENTE PARA BORDES, FONDOS Y BARRAS)
const TEMAS_POR_SOCIEDAD = {
  'GRSA': {
    ACCENT: [185, 28, 28],       // Rojo Corporativo (Red 700)
    BG_LIGHT: [254, 242, 242],   // Fondo Rojo Suave (Red 50)
    BORDER: [252, 165, 165]      // Borde Rojo Suave (Red 300)
  },
  'GVO': {
    ACCENT: [21, 128, 61],       // Verde Corporativo (Green 700)
    BG_LIGHT: [240, 253, 244],   // Fondo Verde Suave (Green 50)
    BORDER: [187, 247, 208]      // Borde Verde Suave (Green 200)
  },
  'BLOIS': {
    ACCENT: [24, 24, 27],        // Negro Elegante (Zinc 900)
    BG_LIGHT: [244, 244, 245],    // Fondo Gris Claro (Zinc 100)
    BORDER: [212, 212, 216]       // Borde Gris (Zinc 300)
  }
};

const TEMA_DEFAULT = {
  ACCENT: [15, 23, 42],         // Slate 900
  BG_LIGHT: [248, 250, 252],     // Slate 50
  BORDER: [226, 232, 240]        // Slate 200
};

// 🔤 PALETA TIPOGRÁFICA STRICTAMENTE MONOCROMÁTICA / GRISES
const COLOR_TEXT_DARK = [15, 23, 42];      // Texto principal, títulos y datos (Casi Negro)
const COLOR_TEXT_MUTED = [71, 85, 105];    // Etiquetas y subtítulos (Gris Medio)
const COLOR_TEXT_LIGHT = [148, 163, 184];   // Aclaraciones y pie de página (Gris Claro)

// CARGAR IMAGEN EN ALTA RESOLUCIÓN (3X) Y MANTENER NITIDEZ
const cargarImagen = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 3;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      resolve({
        data: canvas.toDataURL('image/png'),
        width: img.width,
        height: img.height
      });
    };
    img.onerror = () => resolve(null);
  });
};

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return 'XX/XX/XXXX';
  if (fechaStr.includes('/')) return fechaStr;
  const [year, month, day] = fechaStr.split('-');
  return `${day}/${month}/${year}`;
};

const calcularReintegro = (fechaFinStr) => {
  if (!fechaFinStr) return 'XX/XX/XXXX';
  const partes = fechaFinStr.includes('/') ? fechaFinStr.split('/') : fechaFinStr.split('-');
  let fecha;
  if (fechaFinStr.includes('/')) {
    fecha = new Date(partes[2], partes[1] - 1, partes[0]);
  } else {
    fecha = new Date(partes[0], partes[1] - 1, partes[2]);
  }

  fecha.setDate(fecha.getDate() + 1);

  const day = String(fecha.getDate()).padStart(2, '0');
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const year = fecha.getFullYear();
  return `${day}/${month}/${year}`;
};

export const generarNotaVacaciones = async (s, emp) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // SELECCIÓN DE TEMA (Únicamente para elementos de diseño/gráficos)
  const sociedadEmp = emp?.sociedad ? String(emp.sociedad).trim().toUpperCase() : '';
  const tema = TEMAS_POR_SOCIEDAD[sociedadEmp] || TEMA_DEFAULT;

  // 1. BARRA SUPERIOR DE ACCENTO (Elemento gráfico)
  doc.setFillColor(...tema.ACCENT);
  doc.rect(0, 0, 210, 3.5, 'F');

  // 2. LOGO EN ALTA DEFINICIÓN
  const rutaLogo = LOGOS_POR_SOCIEDAD[sociedadEmp] || LOGO_DEFAULT;
  const logoObj = await cargarImagen(rutaLogo);

  if (logoObj) {
    const maxWidth = 55;
    const maxHeight = 20;
    let imgWidth = maxWidth;
    let imgHeight = (logoObj.height * maxWidth) / logoObj.width;

    if (imgHeight > maxHeight) {
      imgHeight = maxHeight;
      imgWidth = (logoObj.width * maxHeight) / logoObj.height;
    }

    doc.addImage(logoObj.data, 'PNG', 20, 12, imgWidth, imgHeight);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...COLOR_TEXT_DARK);
    doc.text(emp?.sociedad || 'GRUPO RICCIARDI', 20, 22);
  }

  // DETALLES SUPERIORES (DERECHA)
  const fechaHoy = formatearFecha(new Date().toISOString().split('T')[0]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_TEXT_MUTED);
  doc.text('DOCUMENTO OFICIAL DE NOTIFICACIÓN', 190, 16, { align: 'right' });
  doc.text(`Fecha de emisión: ${fechaHoy}`, 190, 21, { align: 'right' });

  // LÍNEA DIVISORIA ENCABEZADO
  doc.setDrawColor(...tema.BORDER);
  doc.setLineWidth(0.4);
  doc.line(20, 36, 190, 36);

  // 3. TÍTULO DEL DOCUMENTO
  let y = 46;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...COLOR_TEXT_DARK);
  doc.text('NOTIFICACIÓN DE GOCE DE VACACIONES', 105, y, { align: 'center' });

  // 4. TARJETA DE DATOS DEL EMPLEADO (Fondo y borde con color de marca, texto en grises)
  y += 8;
  const nombreEmpleado = emp?.nombreCompleto || s?.nombreEmpleado || 'XXXXXXXXXX';
  const documentoEmpleado = emp?.dni || emp?.legajo || emp?.documento || s?.legajo || 'XXXXXXXX';
  const legajoEmp = emp?.legajo || s?.legajo || '-';

  doc.setFillColor(...tema.BG_LIGHT);
  doc.setDrawColor(...tema.BORDER);
  doc.roundedRect(20, y, 170, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_TEXT_MUTED);
  doc.text('INFORMACIÓN DEL EMPLEADO', 25, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_TEXT_DARK);
  doc.text(nombreEmpleado.toUpperCase(), 25, y + 12.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_TEXT_MUTED);
  doc.text(`DNI: ${documentoEmpleado}`, 25, y + 17.5);

  // 5. BLOQUES DESTACADOS DE FECHAS (4 Cajas métricas)
  y += 28;
  const fechaInicio = formatearFecha(s?.startDate);
  const fechaFin = formatearFecha(s?.endDate);
  const fechaReintegro = s?.reintegrarseDate 
    ? formatearFecha(s.reintegrarseDate) 
    : calcularReintegro(s?.endDate);
  const anio = s?.anio || new Date().getFullYear();
  const diasTomados = s?.diasTomados || 'XX';

  const boxWidth = 39;
  const boxHeight = 17;
  const gap = 4.6;
  const items = [
    { label: 'DÍAS CORRESPOND.', val: `${diasTomados} Días` },
    { label: 'FECHA INICIO', val: fechaInicio },
    { label: 'FECHA FIN', val: fechaFin },
    { label: 'FECHA REINTEGRO', val: fechaReintegro }
  ];

  items.forEach((item, idx) => {
    const xPos = 20 + idx * (boxWidth + gap);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...tema.BORDER);
    doc.roundedRect(xPos, y, boxWidth, boxHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...COLOR_TEXT_MUTED);
    doc.text(item.label, xPos + boxWidth / 2, y + 5.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_TEXT_DARK);
    doc.text(item.val, xPos + boxWidth / 2, y + 12.5, { align: 'center' });
  });

  // 6. CUERPO DE TEXTO LEGAL
  y += boxHeight + 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLOR_TEXT_DARK);

  const textoP1 = `Por medio de la presente, le comunicamos a Ud. que, de acuerdo con las disposiciones legales e internas vigentes, se le otorga el goce de las vacaciones anuales correspondientes al período lectivo ${anio}, por un total de ${diasTomados} días corridos.`;
  const lineasP1 = doc.splitTextToSize(textoP1, 170);
  doc.text(lineasP1, 20, y);

  y += (lineasP1.length * 5) + 4;

  const textoP2 = s?.textoFraccionado || `Las mismas serán gozadas desde el día ${fechaInicio} hasta el día ${fechaFin} inclusive, debiendo reincorporarse a sus tareas habituales el día ${fechaReintegro} en su horario habitual.`;
  const lineasP2 = doc.splitTextToSize(textoP2, 170);
  doc.text(lineasP2, 20, y);

  y += (lineasP2.length * 5) + 12;

  // 7. CUADRO DE NOTIFICACIÓN CON LÍNEA LATERAL DE COLOR (Texto en gris neutro)
  doc.setFillColor(...tema.BG_LIGHT);
  doc.setDrawColor(...tema.BORDER);
  doc.roundedRect(20, y, 170, 13, 1.5, 1.5, 'FD');

  // Marcador de acento vertical de la marca
  doc.setFillColor(...tema.ACCENT);
  doc.rect(20, y, 1.5, 13, 'F');

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_TEXT_MUTED);
  doc.text('« Tomo conocimiento y me declaro debidamente notificado/a de la comunicación precedente en la fecha indicativa. »', 25, y + 8);

  // 8. SECCIÓN DE FIRMAS
  y += 48;

  doc.setDrawColor(...COLOR_TEXT_LIGHT);
  doc.setLineWidth(0.4);

  // Firma Trabajador
  doc.line(25, y, 90, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_TEXT_DARK);
  doc.text('FIRMA DEL TRABAJADOR', 57.5, y + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_TEXT_MUTED);
  doc.text('Aclaración / DNI', 57.5, y + 9, { align: 'center' });

  // Firma Empleador
  doc.line(120, y, 185, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_TEXT_DARK);
  doc.text('FIRMA Y SELLO EMPLEADOR / RRHH', 152.5, y + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_TEXT_MUTED);
  doc.text('Recibido por la Empresa', 152.5, y + 9, { align: 'center' });

  // 9. PIE DE PÁGINA
  doc.setDrawColor(...tema.BORDER);
  doc.setLineWidth(0.3);
  doc.line(20, 275, 190, 275);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_TEXT_LIGHT);
  doc.text(`${sociedadEmp || 'Grupo Ricciardi'} — Gestión de Recursos Humanos`, 20, 281);
  doc.text('www.gricciardi.com.ar', 190, 281, { align: 'right' });

  // DESCARGA DEL ARCHIVO
  const nombreLimpio = nombreEmpleado.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Notificacion_Vacaciones_${nombreLimpio}.pdf`);
};