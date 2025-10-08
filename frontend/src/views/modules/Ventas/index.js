import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Autocomplete,
  IconButton,
  Menu,
  Backdrop,
  CircularProgress
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { getProductos } from "../../../services/modules/Productos";
import { insertarVenta, GenerarFactura, validarSeries } from "../../../services/modules/Ventas";
import { getClientes } from "../../../services/modules/Clientes";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoAGOP from "../../../assets/Logo.jpg";

/* -------------------- Helpers -------------------- */
async function shrinkQR(base64Png, sizePx = 256) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = sizePx;
      c.height = sizePx;
      const ctx = c.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, sizePx, sizePx);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = "data:image/png;base64," + base64Png;
  });
}

function createDoc() {
  return new jsPDF({
    unit: "mm",
    format: "letter",
    compress: true,
    precision: 2
  });
}

const DateFormatter = (Fecha) => {
  const dateObject = new Date(Fecha);
  const day = String(dateObject.getDate()).padStart(2, '0');
  const month = String(dateObject.getMonth() + 1).padStart(2, '0');
  const year = dateObject.getFullYear();
  const hours = String(dateObject.getHours()).padStart(2, '0');
  const minutes = String(dateObject.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

function convertirNumeroALetras(numero) {
  const [parteEntera, parteDecimal] = numero.toString().split('.');
  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const diezHastaDiecinueve = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const decenas = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS'];
  function convertirCifras(numStr) {
    if (numStr === '0') return '';
    let num = parseInt(numStr, 10);
    let resultado = '';
    if (num >= 100) {
      if (num === 100) resultado += 'CIEN';
      else resultado += centenas[Math.floor(num / 100)];
      num %= 100;
      if (num > 0) resultado += ' ';
    }
    if (num > 0) {
      if (num < 10) resultado += unidades[num];
      else if (num < 20) resultado += diezHastaDiecinueve[num - 10];
      else {
        resultado += decenas[Math.floor(num / 10)];
        if (num % 10 > 0) resultado += ' Y ' + unidades[num % 10];
      }
    }
    return resultado;
  }
  let textoEntero = '';
  const numeroEntero = parseInt(parteEntera, 10);
  if (numeroEntero === 0) textoEntero = 'CERO';
  else if (numeroEntero <= 999999) {
    const miles = Math.floor(numeroEntero / 1000);
    const restoMiles = numeroEntero % 1000;
    if (miles > 0) textoEntero += (miles === 1) ? 'MIL' : convertirCifras(miles.toString()) + ' MIL';
    if (restoMiles > 0) {
      if (miles > 0) textoEntero += ' ';
      textoEntero += convertirCifras(restoMiles.toString());
    }
  } else {
    const millones = Math.floor(numeroEntero / 1000000);
    const restoMillones = numeroEntero % 1000000;
    if (millones > 0) textoEntero += (millones === 1) ? 'UN MILLÓN' : convertirCifras(millones.toString()) + ' MILLONES';
    if (restoMillones > 0) {
      if (millones > 0) textoEntero += ' ';
      textoEntero += convertirCifras(restoMillones.toString()) + ' MIL';
    }
  }
  const decimalPadded = (parteDecimal ? parteDecimal.padEnd(2, '0') : '00').substring(0, 2);
  return `${textoEntero} CON ${decimalPadded}/100 QUETZALES`.replace(/\s+/g, ' ').trim();
}

/* -------------------- Generadores PDF -------------------- */
const generarPDFVenta = (res, logoImgEl) => {
  const { cliente, detalles, id_venta } = res;
  const total = detalles.reduce((sum, item) => sum + item.total, 0);
  const fecha = new Date().toISOString().split("T")[0];

  const doc = createDoc();
  if (logoImgEl) doc.addImage(logoImgEl, "JPEG", 10, 10, 40, 20);

  doc.setFontSize(18);
  doc.text("COMPROBANTE", 105, 30, { align: "center" });

  doc.setFontSize(12);
  doc.text("Armerías 38Super Escobar", 15, 40);
  doc.text("Dirección: , Malacatán, San Marcos", 15, 46);
  doc.text("Tel: xxxxx", 15, 52);
  doc.text("Slogan", 15, 58);

  doc.text(`Cliente: ${cliente?.nombre || "CF"}`, 140, 40);
  doc.text(`NIT: ${cliente?.nit || "CF"}`, 140, 46);
  doc.text(`Fecha: ${fecha}`, 140, 52);
  doc.text(`Factura ID: ${id_venta}`, 140, 58);

  autoTable(doc, {
    startY: 65,
    head: [["Cantidad", "Descripción", "Precio Unitario", "Total"]],
    body: detalles.flatMap((item) =>
    (item.series && item.series.length > 0
      ? item.series.map((serie) => [
        1,
        `${item.descripcion} - Serie: ${serie}`,
        `Q${item.precio_unitario.toFixed(2)}`,
        `Q${item.precio_unitario.toFixed(2)}`,
      ])
      : [[
        item.cantidad,
        item.descripcion,
        `Q${item.precio_unitario.toFixed(2)}`,
        `Q${item.total.toFixed(2)}`,
      ]]
    )
    ),
    styles: { halign: "center", lineWidth: 0.3, lineColor: [0, 0, 0], cellPadding: 3, textColor: 20 },
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], halign: "center" },
    theme: "grid",
  });

  doc.setFontSize(14);
  doc.text(`Total a pagar: Q${total.toFixed(2)}`, 150, doc.lastAutoTable.finalY + 10);

  doc.save(`Factura_${id_venta}.pdf`);
};

const generarPDFFactura = async (res, resFactura, logoImgEl) => {
  const { cliente, detalles, id_venta } = res;

  const doc = createDoc();
  const qrImageSize = 35;
  const fullQrCodeBase64 = await shrinkQR(resFactura?.datos?.codigoQR || "", 256);

  // --- Cabecera de la empresa (se mantiene) ---
  if (logoImgEl) doc.addImage(logoImgEl, "JPEG", 15, 15, 35, 18);

  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text("Armerías 38Super Escobar", 105, 20, { align: "center" });

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(", Malacatán, San Marcos", 105, 26, { align: "center" });
  doc.text("Tel: xxxx", 105, 31, { align: "center" });
  doc.text("Slogan", 105, 36, { align: "center" });

  // ----------------------------------------------------------------------
  // ✅ SECCIÓN 1: DOCUMENTO Y FECHA (AJUSTE DE POSICIÓN Y ANCHO)
  // ----------------------------------------------------------------------
  const xStartDTE = 145; // Nueva posición de inicio (antes 150)
  const widthDTE = 55;   // Nuevo ancho (antes 45). Termina en 145 + 55 = 200 (margen de la línea azul).
  const xCenterDTE = xStartDTE + (widthDTE / 2); // 145 + 27.5 = 172.5

  doc.setDrawColor(0);
  doc.setLineWidth(1);
  doc.roundedRect(xStartDTE, 15, widthDTE, 55, 3, 3);

  doc.setFontSize(6);
  doc.setFont(undefined, 'bold');
  doc.text("DOCUMENTO", xCenterDTE, 20, { align: "center" });
  doc.text("TRIBUTARIO", xCenterDTE, 24, { align: "center" });
  doc.text("ELECTRÓNICO", xCenterDTE, 28, { align: "center" });
  doc.setFontSize(9);
  doc.text("Factura", xCenterDTE, 33, { align: "center" });

  doc.setFontSize(7);
  doc.setFont(undefined, 'normal');
  // Se mueve el texto de serie y número
  doc.text(`Serie:`, xStartDTE + 2, 39);
  doc.text(`${resFactura?.datos?.SerieDocumento || ""}`, xStartDTE + 30, 39); // Ajuste de posición
  doc.text(`Número:`, xStartDTE + 2, 44);
  doc.text(`${resFactura?.datos?.NumeroDocumento || ""}`, xStartDTE + 30, 44); // Ajuste de posición

  doc.setFontSize(7);
  doc.setFont(undefined, 'bold');
  doc.text("FECHA EMISIÓN", xCenterDTE, 51, { align: "center" });
  doc.setFont(undefined, 'normal');
  doc.setFontSize(6);
  doc.text(DateFormatter(resFactura?.datos?.FechaHoraEmision), xCenterDTE, 55, { align: "center" });
  doc.setFontSize(7);
  doc.setFont(undefined, 'bold');
  doc.text("MONEDA", xCenterDTE, 60, { align: "center" });
  doc.setFont(undefined, 'normal');
  doc.text("GTQ", xCenterDTE, 63, { align: "center" });

  // ----------------------------------------------------------------------
  // SECCIÓN 2: DATOS DEL CLIENTE (Mantenido el ajuste para no chocar)
  // ----------------------------------------------------------------------
  const yBloqueCliente = 45;
  const xTextStart = 40; 
  // Ancho ahora llega hasta 145, ya que el DTE empieza ahí.
  const anchoRectCliente = xStartDTE - 10 - 5; // 145 - 10 - 5 = 130mm (Ajustado para dejar un pequeño espacio)
  // Nota: El ancho era 135 antes del ajuste, lo dejaremos en 130 para asegurar el espacio visual entre rectángulos.

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text("Referencia", 10, yBloqueCliente);

  doc.setDrawColor(0);
  doc.setLineWidth(1);

  const yRectCliente = yBloqueCliente + 3; 
  const hRectCliente = 21; 
  doc.roundedRect(10, yRectCliente, anchoRectCliente, hRectCliente, 3, 3); 

  // 1. NOMBRE:
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text(`NOMBRE:`, 15, yRectCliente + 5); 
  doc.setFont(undefined, 'normal');
  doc.text(`${cliente?.nombre || "CF"}`, xTextStart, yRectCliente + 5); 

  // 2. NIT:
  doc.setFont(undefined, 'bold');
  doc.text(`NIT:`, 15, yRectCliente + 12); 
  doc.setFont(undefined, 'normal');
  doc.text(`${cliente?.nit || "CF"}`, xTextStart, yRectCliente + 12); 

  // 3. DIRECCIÓN:
  doc.setFont(undefined, 'bold');
  doc.text(`DIRECCIÓN:`, 15, yRectCliente + 17); 
  doc.setFont(undefined, 'normal');
  // Ajustar el ancho del splitTextToSize al nuevo ancho (130 - 40 - 5 = 85)
  const direccionTexto = doc.splitTextToSize(`${cliente?.direccion || "Ciudad"}`, 85); 
  doc.text(direccionTexto, xTextStart, yRectCliente + 17); 

  // ----------------------------------------------------------------------
  // TABLA DE DETALLES (Mantiene ancho uniforme de 190)
  // ----------------------------------------------------------------------
  autoTable(doc, {
    startY: 75,
    head: [["CANT.", "TIPO", "CÓDIGO", "DESCRIPCIÓN", "P. UNIT.", "DESC.", "TOTAL"]],
    body: detalles.flatMap((item) =>
      item.series && item.series.length > 0
        ? item.series.map((serie) => [
            "1", "B", item.codigo || "",
            `${item.descripcion} - Serie: ${serie}`,
            `Q${item.precio_unitario.toFixed(2)}`,
            `Q 0.00`,
            `Q${item.precio_unitario.toFixed(2)}`
          ])
        : [[
            item.cantidad.toString(), "B", item.codigo || "",
            item.descripcion,
            `Q${item.precio_unitario.toFixed(2)}`,
            `Q 0.00`,
            `Q${item.total.toFixed(2)}`
          ]]
    ),
    styles: { fontSize: 8, cellPadding: 2, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.3, halign: 'left' },
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], halign: "center", fontSize: 8, fontStyle: 'bold' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'center', cellWidth: 15 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'left', cellWidth: 70 },
      4: { halign: 'right', cellWidth: 25 },
      5: { halign: 'right', cellWidth: 20 },
      6: { halign: 'right', cellWidth: 25 },
    },
    theme: "grid",
    margin: { left: 10, right: 10 },
    tableWidth: 190, 
  });

  // --- Recuadro ISR ---
  let UltimaY = doc.lastAutoTable.finalY;
  doc.setFillColor(240, 240, 240);
  doc.rect(10, UltimaY + 2, 185, 8, 'F');
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text("SUJETO A PAGOS TRIMESTRALES ISR", 102.5, UltimaY + 7, { align: "center" });

  // ----------------------------------------------------------------------
  // TABLA DE TOTALES Y CERTIFICACIÓN (Fusionada y con ancho uniforme de 190)
  // ----------------------------------------------------------------------
  const ySeccionTotales = UltimaY + 18;
  
  autoTable(doc, {
    startY: ySeccionTotales,
    head: [],
    // Cuerpo de la tabla con 8 filas y 3 columnas para manejar los datos
    body: [
        // Filas de Totales (4 filas)
        ['TOTAL EN LETRAS', 'Subtotal', `${(Number(resFactura?.datos?.GranTotal) - Number(resFactura?.datos?.TotalImpuesto)).toFixed(2)}`],
        [convertirNumeroALetras(Number(resFactura?.datos?.GranTotal).toFixed(2)), 'Descuento', '0.00'],
        ['', 'TOTAL', `${Number(resFactura?.datos?.GranTotal).toFixed(2)}`],
        [{ content: 'Resumen de impuestos', colSpan: 1, styles: { halign: 'center', fontStyle: 'bold' } }, 'IVA', `${Number(resFactura?.datos?.TotalImpuesto).toFixed(2)}`],
        
        // Filas de Certificación (4 filas), Col 2 es la celda del QR con rowspan
        ['AUTORIZACIÓN', `${resFactura?.datos?.NumeroAutorizacion || ""}`, { content: '', rowSpan: 4, styles: { halign: 'center', valign: 'middle' } }],
        ['CERTIFICADOR', `${resFactura?.datos?.NombreCertificador || ""}`],
        ['NIT', `${resFactura?.datos?.NITCertificador || ""}`],
        ['FECHA CERTIFICACIÓN', `${DateFormatter(resFactura?.datos?.FechaHoraCertificacion)}`],
    ],
    // Estilos unificados con la tabla de detalles (FontSize: 8)
    styles: { fontSize: 8, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.3, halign: 'left' },
    columnStyles: {
        // Columna de títulos (TOTAL EN LETRAS, Resumen, Títulos de Certificación)
        0: { halign: 'left', cellWidth: 55 }, 
        // Columna de subtítulos/datos (Subtotal/Descuento/TOTAL/IVA y Datos de Certificación)
        1: { halign: 'left', cellWidth: 80 }, 
        // Columna de Montos y QR
        2: { halign: 'right', cellWidth: 55 },
    },
    theme: "grid",
    tableWidth: 190, 
    margin: { left: 10, right: 10 },
    showHead: false,
    didDrawCell: (data) => {
        const { cell, row, column } = data;
        
        // --- Estilos y Contenido de las Filas de Totales (Índices 0-3) ---
        if (row.index === 0 && column.index === 0) data.cell.styles.fontStyle = 'bold';
        
        // Resaltar TOTAL
        if (row.index === 2 && column.index === 1) { data.cell.styles.fontStyle = 'bold'; data.cell.styles.fontSize = 9; data.cell.styles.halign = 'right'; } 
        if (row.index === 2 && column.index === 2) { data.cell.styles.fontStyle = 'bold'; data.cell.styles.fontSize = 9; } 
        
        // Aplicar Negrita a los títulos de la columna 1 de Totales (Subtotal/Descuento/TOTAL/IVA)
        if (row.index <= 3 && column.index === 1) data.cell.styles.fontStyle = 'bold'; 
        // Aplicar Negrita a los montos de la columna 2 de Totales
        if (row.index <= 3 && column.index === 2) data.cell.styles.fontStyle = 'bold';
        // Alinear a la derecha los títulos de la columna 1 de Totales
        if (row.index <= 3 && column.index === 1) data.cell.styles.halign = 'right';


        // --- Estilos de las Filas de Certificación (Índices 4-7) ---
        if (row.index >= 4 && column.index === 0) data.cell.styles.fontStyle = 'bold'; // Títulos de Certificación
        
        // DIBUJAR QR (Celda de índice 4, Columna de índice 2)
        if (row.index === 4 && column.index === 2) { 
            const qrX = cell.x + (cell.width / 2) - (qrImageSize / 2);
            const qrY = cell.y + (cell.height / 2) - (qrImageSize / 2);
            doc.addImage(fullQrCodeBase64, 'PNG', qrX, qrY, qrImageSize, qrImageSize);
        }
    },
    didDrawTable: (data) => {
        const { table } = data;
        
        // 1. Dibuja el recuadro que engloba toda la tabla
        doc.setDrawColor(0);
        doc.setLineWidth(0.3);
        doc.roundedRect(table.startX, table.startY, table.width, table.height, 3, 3);
        
        // 2. Dibuja la línea horizontal que separa Totales de Certificación (después de la fila de IVA)
        const ySeparacionTotales = table.body.cells[3][0].y + table.body.cells[3][0].height;
        doc.line(table.startX, ySeparacionTotales, table.finalX, ySeparacionTotales);

        // 3. Dibuja la línea vertical que separa los datos de la columna del QR
        const xSeparacionQR = table.columns[2].x; 
        doc.line(xSeparacionQR, table.startY, xSeparacionQR, table.finalY);
    }
  });

  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text("Referencia", 175, 275, { align: "center" });
  doc.text("1 de 1", 175, 280, { align: "center" });

  doc.save(`Factura_${id_venta}.pdf`);
};

/* -------------------- Componente -------------------- */
const Ventas = () => {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [detalleVenta, setDetalleVenta] = useState([]);
  const [productoInput, setProductoInput] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [idCliente, setIdCliente] = useState("1"); // Cliente CF por defecto
  const [tipoVenta, setTipoVenta] = useState("Contado");
  const [moneda, setMoneda] = useState(1);
  const [precioSeleccionado, setPrecioSeleccionado] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [seriesVenta, setSeriesVenta] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const [logoImgEl, setLogoImgEl] = useState(null);
  useEffect(() => {
    const img = new Image();
    img.onload = () => setLogoImgEl(img);
    img.src = logoAGOP;
  }, []);

  const obtenerFechaLocal = () => {
    const ahora = new Date();
    const offsetMs = ahora.getTimezoneOffset() * 60000;
    return new Date(ahora.getTime() - offsetMs).toISOString().split("T")[0];
  };
  const [fechaVenta, setFechaVenta] = useState(obtenerFechaLocal());

  const agruparPorProducto = () => {
    const agrupado = {};
    detalleVenta.forEach(item => {
      const key = item.id_producto;
      if (!agrupado[key]) {
        agrupado[key] = {
          id_producto: item.id_producto,
          descripcion: item.descripcion.split(" - Serie:")[0],
          cantidad: 0,
          precio_unitario: item.precio_unitario,
          total: 0,
          series: []
        };
      }
      agrupado[key].cantidad += 1;
      agrupado[key].total += item.total;
      agrupado[key].series.push(item.serie);
    });
    return Object.values(agrupado);
  };

  const cargarDatos = async () => {
    try {
      const productosData = await getProductos();
      const clientesData = await getClientes();
      setProductos(productosData);
      setClientes(clientesData);
    } catch (error) {
      console.error("Error al cargar datos", error);
    }
  };
  useEffect(() => { cargarDatos(); }, []);

  // Refresca el producto al abrir menú de precios (por si hubo compras que cambiaron precios)
  const handleOpenPrecioMenu = async (e) => {
    setAnchorEl(e.currentTarget);
    try {
      const productosData = await getProductos();
      setProductos(productosData);
      if (productoSeleccionado) {
        const selId = productoSeleccionado.id ?? productoSeleccionado.id_producto;
        const actualizado = productosData.find(p => (p.id ?? p.id_producto) === selId);
        if (actualizado) {
          setProductoSeleccionado(actualizado);
          // Si quieres: preseleccionar el precio base
          // setPrecioSeleccionado(+actualizado.precio_venta || null);
        }
      }
    } catch (err) {
      console.error("No se pudo refrescar el producto", err);
    }
  };

  const handleClosePrecioMenu = () => setAnchorEl(null);
  const handleSeleccionarPrecio = (precio) => { setPrecioSeleccionado(precio); handleClosePrecioMenu(); };

  const agregarDetalle = () => {
    if (!productoSeleccionado) return alert("Seleccione un producto.");
    if (cantidad <= 0) return alert("Cantidad inválida");
    if ((productoSeleccionado.cantidad_inicial ?? 0) < cantidad) return alert("Cantidad excede stock");
    if (seriesVenta.length !== cantidad || seriesVenta.some(s => !s)) return alert("Debe ingresar todas las series");

    const precio = Number(precioSeleccionado ?? productoSeleccionado.precio_venta);
    if (!precio || isNaN(precio) || precio <= 0) return alert("Seleccione un precio válido.");

    const prodId = productoSeleccionado.id ?? productoSeleccionado.id_producto;

    const nuevosDetalles = seriesVenta.map((serie) => ({
      id_producto: prodId,
      descripcion: `${productoSeleccionado.descripcion} - Serie: ${serie}`,
      cantidad: 1,
      precio_unitario: precio,
      total: precio,
      serie
    }));

    setDetalleVenta(prev => [...prev, ...nuevosDetalles]);
    setCantidad(1);
    setSeriesVenta([]);
    setProductoSeleccionado(null);
    setProductoInput("");
    setPrecioSeleccionado(null);
  };

  const eliminarDetalle = (index) => {
    const copia = [...detalleVenta];
    copia.splice(index, 1);
    setDetalleVenta(copia);
  };

  const calcularTotal = () => detalleVenta.reduce((acc, item) => acc + item.total, 0);

  const guardarVenta = async () => {
    if (!idCliente) return alert("Debe seleccionar un cliente.");
    if (detalleVenta.length === 0) return alert("Debe agregar al menos un producto a la venta.");

    try {
      setLoading(true);
      setLoadingText("Guardando venta...");

      const venta = {
        id_cliente: idCliente,
        tipo_venta: tipoVenta,
        id_moneda: moneda,
        fecha_venta: fechaVenta,
        detalles: agruparPorProducto()
      };
      const res = await insertarVenta(venta);

      const cliente = clientes.find(c => c.id_cliente === idCliente);

      if (tipoVenta === "Contado") {
        setLoadingText("Certificando con TEKRA...");
        const itemsFactura = detalleVenta.map(item => ({
          descripcion: item.descripcion,
          bienOServicio: "B",
          cantidad: item.cantidad,
          precioUnitario: item.precio_unitario,
          precioDescuento: 0
        }));

        const facturar = {
          nitEmisor: "107346834",
          nombreEmisor: "TEKRA SOCIEDAD ANONIMA",
          nitReceptor: cliente.nit,
          nombreReceptor: cliente.nombre,
          items: itemsFactura,
          id_venta: res.id_venta
        };

        const resFactura = await GenerarFactura(facturar);

        if (resFactura.exitoso) {
          setLoadingText("Generando PDF de la factura...");
          await generarPDFFactura(res, resFactura, logoImgEl);
        } else {
          alert("No se pudo certificar la factura.");
        }
      } else {
        setLoadingText("Generando comprobante PDF...");
        await generarPDFVenta(res, logoImgEl);
      }

      alert(res.message);
      setDetalleVenta([]);
      setIdCliente("1"); // vuelve a CF por defecto
    } catch (error) {
      console.error("Error al guardar venta", error);
      alert("Error al guardar la venta");
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Registrar Venta</Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField label="Cliente" select value={idCliente} onChange={(e) => setIdCliente(e.target.value)} fullWidth>
            {clientes.map((cli) => (
              <MenuItem key={cli.id_cliente} value={cli.id_cliente}>{cli.nombre}</MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField label="Tipo de Venta" select value={tipoVenta} onChange={(e) => setTipoVenta(e.target.value)} fullWidth>
            <MenuItem value="Contado">Contado</MenuItem>
            <MenuItem value="Crédito">Crédito</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField label="Moneda" type="number" value={moneda} onChange={(e) => setMoneda(e.target.value)} fullWidth />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField label="Fecha de Venta" type="date" value={fechaVenta} onChange={(e) => setFechaVenta(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" gap={2}>
            <TextField label="Cantidad" type="number" value={cantidad} onChange={(e) => setCantidad(parseInt(e.target.value, 10) || 0)} sx={{ width: "20%" }} />
            <Box flexGrow={1}>
              <Autocomplete
                freeSolo
                options={productos}
                getOptionLabel={(option) => option.descripcion || ""}
                value={productoSeleccionado}
                onChange={(event, newValue) => { setProductoSeleccionado(newValue); setPrecioSeleccionado(null); }}
                inputValue={productoInput}
                onInputChange={(event, newInputValue) => setProductoInput(newInputValue)}
                renderInput={(params) => <TextField {...params} label="Producto" fullWidth />}
              />
              {productoSeleccionado && (
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Stock disponible: <strong>{productoSeleccionado.cantidad_inicial}</strong>
                </Typography>
              )}
            </Box>

            {productoSeleccionado && (
              <Box>
                <Button variant="contained" size="small" onClick={handleOpenPrecioMenu} sx={{ minWidth: "40px", padding: 0, mb: 1 }}>P</Button>
                {precioSeleccionado && <Typography variant="body2">Q{Number(precioSeleccionado).toFixed(2)}</Typography>}
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClosePrecioMenu}>
                  {/* Precio base desde BD */}
                  {productoSeleccionado?.precio_venta && (
                    <MenuItem onClick={() => handleSeleccionarPrecio(+productoSeleccionado.precio_venta)}>
                      Precio: Q{Number(productoSeleccionado.precio_venta).toFixed(2)}
                    </MenuItem>
                  )}
                  {/* Si manejas varios precios en BD, se muestran automáticamente */}
                  {productoSeleccionado?.precio_publico && (
                    <MenuItem onClick={() => handleSeleccionarPrecio(+productoSeleccionado.precio_publico)}>
                      Público: Q{Number(productoSeleccionado.precio_publico).toFixed(2)}
                    </MenuItem>
                  )}
                  {productoSeleccionado?.precio_mayoreo && (
                    <MenuItem onClick={() => handleSeleccionarPrecio(+productoSeleccionado.precio_mayoreo)}>
                      Mayoreo: Q{Number(productoSeleccionado.precio_mayoreo).toFixed(2)}
                    </MenuItem>
                  )}
                  {productoSeleccionado?.precio_especial && (
                    <MenuItem onClick={() => handleSeleccionarPrecio(+productoSeleccionado.precio_especial)}>
                      Especial: Q{Number(productoSeleccionado.precio_especial).toFixed(2)}
                    </MenuItem>
                  )}
                </Menu>
              </Box>
            )}

            <Button variant="contained" onClick={agregarDetalle}>Agregar</Button>
          </Box>
        </Grid>
      </Grid>

      {productoSeleccionado && cantidad > 0 && (
        <Box mt={2} width="100%">
          <Typography variant="subtitle2" gutterBottom>Ingresar series para {cantidad} unidad(es):</Typography>
          <Grid container spacing={1}>
            {Array.from({ length: cantidad }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <TextField
                  label={`Serie ${i + 1}`}
                  value={seriesVenta[i] || ""}
                  onChange={(e) => {
                    const nuevas = [...seriesVenta];
                    nuevas[i] = e.target.value;
                    setSeriesVenta(nuevas);
                  }}
                  fullWidth
                  required
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Box mt={4}>
        <Typography variant="h6">Detalle de Venta</Typography>
        <Table sx={{ border: "1px solid #ccc" }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "black" }}>
              <TableCell sx={{ color: "white", border: "1px solid #ccc" }}>Cantidad</TableCell>
              <TableCell sx={{ color: "white", border: "1px solid #ccc" }}>Descripción</TableCell>
              <TableCell sx={{ color: "white", border: "1px solid #ccc" }}>Precio Unitario</TableCell>
              <TableCell sx={{ color: "white", border: "1px solid #ccc" }}>Total</TableCell>
              <TableCell sx={{ color: "white", border: "1px solid #ccc" }}>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {detalleVenta.map((item, index) => (
              <TableRow key={index}>
                <TableCell sx={{ border: "1px solid #ccc" }}>{item.cantidad}</TableCell>
                <TableCell sx={{ border: "1px solid #ccc" }}>{item.descripcion}</TableCell>
                <TableCell sx={{ border: "1px solid #ccc" }}>
                  <TextField
                    type="number"
                    size="small"
                    value={item.precio_unitario}
                    onChange={(e) => {
                      const updated = [...detalleVenta];
                      updated[index].precio_unitario = parseFloat(e.target.value);
                      updated[index].total = updated[index].precio_unitario * updated[index].cantidad;
                      setDetalleVenta(updated);
                    }}
                    InputProps={{ inputProps: { min: 0, step: "0.01" } }}
                    fullWidth
                  />
                </TableCell>
                <TableCell sx={{ border: "1px solid #ccc" }}>Q{item.total.toFixed(2)}</TableCell>
                <TableCell sx={{ border: "1px solid #ccc" }}>
                  <IconButton onClick={() => eliminarDetalle(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3} align="right"><strong>Total:</strong></TableCell>
              <TableCell colSpan={2}>
                <Typography variant="h4" color="error" fontWeight="bold">
                  Q{calcularTotal().toFixed(2)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      <Box mt={4}>
        <Button variant="contained" color="success" onClick={guardarVenta} disabled={loading}>
          {loading ? "Procesando..." : "Guardar Venta"}
        </Button>
      </Box>

      <Backdrop open={loading} sx={{ color: "#fff", zIndex: (t) => t.zIndex.modal + 1 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress />
          <Typography variant="body2">{loadingText || "Procesando..."}</Typography>
        </Box>
      </Backdrop>
    </Box>
  );
};

export default Ventas;
