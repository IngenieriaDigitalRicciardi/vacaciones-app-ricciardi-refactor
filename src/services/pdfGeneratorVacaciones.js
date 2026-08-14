import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Carga una imagen en Alta Definición (3x) garantizando nitidez perfecta.
 */
const cargarImagenHD = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 3; // Escalado 3x para nitidez
      canvas.width = (img.naturalWidth || img.width) * scale;
      canvas.height = (img.naturalHeight || img.height) * scale;
      
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      resolve({
        dataUrl: canvas.toDataURL('image/png', 1.0),
        aspectRatio: canvas.width / canvas.height,
      });
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

/**
 * Retorna la paleta de acentos de marca (Bordes/Detalles) según la Sociedad.
 */
const obtenerTemaSociedad = (socNombre = '') => {
  const socUpper = socNombre.toUpperCase();
  if (socUpper.includes('GRSA')) {
    return {
      ACCENT: [185, 28, 28],       // Rojo Corporativo (Red 700)
      BG_LIGHT: [254, 242, 242],   // Fondo suave (Red 50)
      BORDER: [252, 165, 165]      // Borde (Red 300)
    };
  }
  if (socUpper.includes('BLOIS')) {
    return {
      ACCENT: [24, 24, 27],        // Negro Elegante (Zinc 900)
      BG_LIGHT: [244, 244, 245],    // Fondo suave (Zinc 100)
      BORDER: [212, 212, 216]       // Borde (Zinc 300)
    };
  }
  if (socUpper.includes('GVO')) {
    return {
      ACCENT: [21, 128, 61],       // Verde Corporativo (Green 700)
      BG_LIGHT: [240, 253, 244],   // Fondo suave (Green 50)
      BORDER: [187, 247, 208]      // Borde (Green 200)
    };
  }
  return {
    ACCENT: [15, 23, 42],         // Slate 900
    BG_LIGHT: [248, 250, 252],     // Slate 50
    BORDER: [226, 232, 240]        // Slate 200
  };
};

/**
 * Suma 1 día a la fecha 'Hasta' para calcular el retorno.
 */
const calcularReincorporacion = (fechaHasta) => {
  if (!fechaHasta || fechaHasta === '-') return '-';

  let year, month, day;

  if (fechaHasta.includes('/')) {
    const parts = fechaHasta.split('/');
    if (parts.length === 3) {
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      year = parseInt(parts[2], 10);
    }
  } else if (fechaHasta.includes('-')) {
    const parts = fechaHasta.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[2], 10);
      } else {
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        year = parseInt(parts[2], 10);
      }
    }
  }

  if (isNaN(year) || isNaN(month) || isNaN(day)) return '-';

  const date = new Date(year, month, day);
  date.setDate(date.getDate() + 1);

  const dayStr = String(date.getDate()).padStart(2, '0');
  const monthStr = String(date.getMonth() + 1).padStart(2, '0');
  const yearStr = date.getFullYear();

  return `${dayStr}/${monthStr}/${yearStr}`;
};

/**
 * Genera un reporte PDF empresarial agrupado y tematizado por Sociedad.
 */
export const generarReportePDF = async (
  solicitudesFiltradas = [],
  empleados = [],
  AREAS = {},
  filtros = {}
) => {
  if (!solicitudesFiltradas || solicitudesFiltradas.length === 0) return;

  const logo = await cargarImagenHD('/logo_gruporicciardi.png');

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();  // 297mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210mm

  // --- PALETA MONOCROMÁTICA NEUTRA ---
  const COLOR_TEXT_DARK = [15, 23, 42];      // Texto Principal (Casi negro)
  const COLOR_TEXT_MUTED = [71, 85, 105];    // Etiquetas / Secundario (Gris medio)
  const COLOR_TEXT_LIGHT = [148, 163, 184];  // Aclaraciones (Gris claro)
  const COLOR_BORDER_NEUTRAL = [226, 232, 240];

  // 1. AGRUPAMIENTO POR SOCIEDAD
  const agrupadoPorSociedad = solicitudesFiltradas.reduce((acc, s) => {
    const emp = empleados.find((e) => e.id === s.empleadoId);
    const soc = (emp?.sociedad || s.sociedad || 'SIN SOCIEDAD').toUpperCase();

    if (!acc[soc]) acc[soc] = [];
    acc[soc].push({ solicitud: s, empleado: emp });
    return acc;
  }, {});

  const sociedadesUnicas = Object.keys(agrupadoPorSociedad);

  // --- ENCABEZADO Y BRANDING ---
  doc.setFillColor(...COLOR_TEXT_DARK);
  doc.rect(0, 0, pageWidth, 3.5, 'F');

  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_TEXT_DARK);
  doc.text('REPORTE EJECUTIVO DE VACACIONES', 14, 15);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_TEXT_MUTED);
  const fechaEmision = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Emisión: ${fechaEmision} hs  |  Auditoría Interna`, 14, 20);

  // Logo en Alta Definición
  if (logo) {
    try {
      const targetWidth = 48;
      const targetHeight = targetWidth / logo.aspectRatio;
      doc.addImage(logo.dataUrl, 'PNG', pageWidth - 14 - targetWidth, 7, targetWidth, targetHeight);
    } catch (e) {
      console.warn('Logo no renderizado:', e);
    }
  }

  // --- FILTROS ACTIVOS ---
  let currentY = 26;
  const { busqueda, sociedad, sucursal, area, fechaDesde, fechaHasta } = filtros;
  const tieneFiltrosActivos = busqueda || (sociedad && sociedad !== 'TODAS') || (sucursal && sucursal !== 'TODAS') || (area && area !== 'TODAS') || fechaDesde || fechaHasta;

  if (tieneFiltrosActivos) {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...COLOR_TEXT_MUTED);

    const partesFiltros = [];
    if (busqueda) partesFiltros.push(`Búsqueda: "${busqueda}"`);
    if (sociedad && sociedad !== 'TODAS') partesFiltros.push(`Sociedad: ${sociedad}`);
    if (sucursal && sucursal !== 'TODAS') partesFiltros.push(`Sucursal: ${sucursal}`);
    if (area && area !== 'TODAS') partesFiltros.push(`Área: ${AREAS[area]?.label || area}`);
    if (fechaDesde) partesFiltros.push(`Desde: ${fechaDesde}`);
    if (fechaHasta) partesFiltros.push(`Hasta: ${fechaHasta}`);

    doc.text(`Filtros aplicados: ${partesFiltros.join('  |  ')}`, 14, currentY, { maxWidth: pageWidth - 28 });
    currentY += 6;
  }

  currentY += 2;

  // --- TABLAS TEMATIZADAS POR SOCIEDAD ---
  sociedadesUnicas.forEach((socNombre) => {
    const items = agrupadoPorSociedad[socNombre];
    const tema = obtenerTemaSociedad(socNombre);

    // Salto de página preventivo
    if (currentY + 35 > pageHeight - 15) {
      doc.addPage();
      currentY = 16;
    }

    // BANNER CONTENEDOR DE SOCIEDAD (Fondo tenue + línea lateral de marca)
    doc.setFillColor(...tema.BG_LIGHT);
    doc.setDrawColor(...tema.BORDER);
    doc.roundedRect(14, currentY, pageWidth - 28, 7, 1, 1, 'FD');

    // Acento lateral de la marca
    doc.setFillColor(...tema.ACCENT);
    doc.rect(14, currentY, 1.5, 7, 'F');

    // Texto de la Sociedad en Gris Oscuro (Neutro)
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLOR_TEXT_DARK);
    doc.text(`SOCIEDAD: ${socNombre}`, 18, currentY + 4.8);

    currentY += 9;

    const tableRows = items.map(({ solicitud: s, empleado: emp }) => {
      const nombre = s.nombreEmpleado || (emp ? `${emp.apellido || ''} ${emp.nombre || ''}`.trim() : 'N/A');
      const legajo = emp?.legajo ? `Legajo: ${emp.legajo}` : '';
      const empleadoCol = legajo ? `${nombre}\n${legajo}` : nombre;

      const areaKey = emp?.area || s.area;
      const areaCol = AREAS[areaKey]?.label || areaKey || 'N/A';
      const sucursalCol = emp?.sucursal || s.sucursal || 'N/A';
      const desdeCol = s.startDate || s.fechaDesde || '-';
      const hastaCol = s.endDate || s.fechaHasta || '-';
      const reincorporacionCol = s.reincorporacionDate || s.fechaReincorporacion || s.seReincorpora || calcularReincorporacion(hastaCol);
      const diasCol = s.diasTomados !== undefined ? `${s.diasTomados} d` : '-';

      return [empleadoCol, areaCol, sucursalCol, desdeCol, hastaCol, reincorporacionCol, diasCol];
    });

    // AutoTable Profesional Neutra
    autoTable(doc, {
      startY: currentY,
      head: [['Nombre y Apellido', 'Área', 'Sucursal', 'Desde', 'Hasta', 'Se Reincorpora', 'Días']],
      body: tableRows,
      theme: 'plain',
      headStyles: {
        fillColor: [241, 245, 249], // Fondo gris ultra claro para la cabecera
        textColor: COLOR_TEXT_DARK,  // Texto oscuro neutro
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: 2.5,
        lineWidth: { bottom: 0.5 },
        borderColor: tema.ACCENT,   // Línea inferior con detalle sutil de la marca
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [51, 65, 85],     // Texto legible neutro
        cellPadding: 2.2,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],  // Alternancia sutil en gris Slate
      },
      columnStyles: {
        0: { cellWidth: 58 },
        1: { cellWidth: 46 },
        2: { cellWidth: 42 },
        3: { cellWidth: 28, halign: 'center' },
        4: { cellWidth: 28, halign: 'center' },
        5: { cellWidth: 38, halign: 'center' },
        6: { cellWidth: 29, halign: 'center', fontStyle: 'bold' },
      },
      styles: {
        overflow: 'linebreak',
        valign: 'middle',
      },
      margin: { left: 14, right: 14, bottom: 15 },
    });

    currentY = doc.lastAutoTable.finalY + 8;
  });

  // --- PIE DE PÁGINA ---
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setDrawColor(...COLOR_BORDER_NEUTRAL);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 10, pageWidth - 14, pageHeight - 10);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLOR_TEXT_LIGHT);

    doc.text('Grupo Ricciardi — Documento Corporativo de Uso Confidencial', 14, pageHeight - 5);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, pageHeight - 5, { align: 'right' });
  }

  // --- DESCARGA ---
  const fechaHoy = new Date().toISOString().split('T')[0];
  doc.save(`Reporte_Licencias_Sociedades_${fechaHoy}.pdf`);
};