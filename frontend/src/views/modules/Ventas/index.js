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
  Menu
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { getProductos } from "../../../services/modules/Productos";
import { insertarVenta, GenerarFactura, validarSeries } from "../../../services/modules/Ventas";
import { getClientes } from "../../../services/modules/Clientes";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoAGOP from "../../../assets/Logo.png";
const generarPDFVenta = (res) => {
  const { cliente, detalles, id_venta } = res;
  const total = detalles.reduce((sum, item) => sum + item.total, 0);
  const fecha = new Date().toISOString().split("T")[0]; // fecha local

  const doc = new jsPDF();

  const img = new Image();
  img.src = logoAGOP;
  console.log(detalles);
  img.onload = () => {
    doc.addImage(img, "PNG", 10, 10, 40, 20);

    doc.setFontSize(18);
    doc.text("COMPROBANTE", 105, 30, { align: "center" });

    doc.setFontSize(12);
    doc.text("Armerías AGOP", 15, 40);
    doc.text("Dirección: 2da. Avenida, Zona 1, Malacatán, San Marcos", 15, 46);
    doc.text("Tel: 7937-4297", 15, 52);
    doc.text("Confianza y Seguridad en un mismo lugar", 15, 58);

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
      )
      ,
      styles: {
        halign: "center",
        lineWidth: 0.3, // ← bordes
        lineColor: [0, 0, 0], // negro
        cellPadding: 3,
        textColor: 20,
      }, headStyles: {
        fillColor: [0, 0, 0], // ← fondo negro
        textColor: [255, 255, 255], // texto blanco
        halign: "center",
      },
      theme: "grid", // ← agrega bordes a toda la tabla
    });

    doc.setFontSize(14);
    doc.text(`Total a pagar: Q${total.toFixed(2)}`, 150, doc.lastAutoTable.finalY + 10);

    doc.save(`Factura_${id_venta}.pdf`);
  };
};

const DateFormatter = (Fecha) => {

  // Crear un objeto Date a partir de la cadena original
  const dateObject = new Date(Fecha);

  // Obtener los componentes de la fecha y hora
  const day = String(dateObject.getDate()).padStart(2, '0');
  const month = String(dateObject.getMonth() + 1).padStart(2, '0');
  const year = dateObject.getFullYear();
  const hours = String(dateObject.getHours()).padStart(2, '0');
  const minutes = String(dateObject.getMinutes()).padStart(2, '0');

  // Construir la cadena con el formato deseado
  const formattedDate = `${day}-${month}-${year} ${hours}:${minutes}`;

  return formattedDate;
};

function convertirNumeroALetras(numero) {
  // Convertir el número a string y separar la parte entera y la decimal
  const [parteEntera, parteDecimal] = numero.toString().split('.');

  // Arrays para convertir números a palabras en español
  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const diezHastaDiecinueve = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const decenas = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  // Función interna para convertir números de 3 dígitos a palabras
  function convertirCifras(numStr) {
    if (numStr === '0') return '';

    let num = parseInt(numStr, 10);
    let resultado = '';

    // Convertir centenas
    if (num >= 100) {
      if (num === 100) {
        resultado += 'CIEN';
      } else {
        resultado += centenas[Math.floor(num / 100)];
      }
      num %= 100;
      if (num > 0) resultado += ' ';
    }

    // Convertir decenas y unidades
    if (num > 0) {
      if (num < 10) {
        resultado += unidades[num];
      } else if (num < 20) {
        resultado += diezHastaDiecinueve[num - 10];
      } else {
        resultado += decenas[Math.floor(num / 10)];
        if (num % 10 > 0) {
          if (Math.floor(num / 10) === 2 && num % 10 > 0) {
            resultado += ' Y ' + unidades[num % 10];
          } else {
            resultado += ' Y ' + unidades[num % 10];
          }
        }
      }
    }
    return resultado;
  }

  // Manejar la parte entera
  let textoEntero = '';
  const numeroEntero = parseInt(parteEntera, 10);

  if (numeroEntero === 0) {
    textoEntero = 'CERO';
  } else if (numeroEntero > 0 && numeroEntero <= 999999) {
    // Manejar miles
    const miles = Math.floor(numeroEntero / 1000);
    const restoMiles = numeroEntero % 1000;

    if (miles > 0) {
      if (miles === 1) {
        textoEntero += 'MIL';
      } else {
        textoEntero += convertirCifras(miles.toString()) + ' MIL';
      }
    }
    if (restoMiles > 0) {
      if (miles > 0) textoEntero += ' ';
      textoEntero += convertirCifras(restoMiles.toString());
    }
  } else if (numeroEntero > 999999) {
    // Manejar millones
    const millones = Math.floor(numeroEntero / 1000000);
    const restoMillones = numeroEntero % 1000000;

    if (millones > 0) {
      if (millones === 1) {
        textoEntero += 'UN MILLÓN';
      } else {
        textoEntero += convertirCifras(millones.toString()) + ' MILLONES';
      }
    }
    if (restoMillones > 0) {
      if (millones > 0) textoEntero += ' ';
      textoEntero += convertirCifras(restoMillones.toString()) + ' MIL';
    }
  }

  // Formatear la parte decimal
  let textoDecimal = '';
  if (parteDecimal) {
    const decimalPadded = parteDecimal.padEnd(2, '0').substring(0, 2);
    textoDecimal = `CON ${decimalPadded}/100`;
  } else {
    textoDecimal = `CON 00/100`;
  }

  // Unir las partes y agregar la moneda
  const resultado = `${textoEntero} ${textoDecimal} QUETZALES`.replace(/\s+/g, ' ').trim();
  return resultado;
}

const generarPDFFactura = (res, resFactura) => {
  console.log(resFactura);
  const { cliente, detalles, id_venta } = res;
  const total = detalles.reduce((sum, item) => sum + item.total, 0);

  const doc = new jsPDF();
  const img = new Image();
  img.src = logoAGOP;

  img.onload = () => {
    // Declaraciones para el QR
    const qrImageSize = 35;
    const fullQrCodeBase64 = "data:image/png;base64," + resFactura.datos.codigoQR;

    // --- CABECERA MEJORADA ---
    // Logo en la esquina superior izquierda
    doc.addImage(img, "PNG", 15, 15, 35, 18);

    // Información de Armerías AGOP (centrada)
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("Armerías AGOP", 105, 20, { align: "center" });

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text("Dirección: 2da. Avenida, Zona 1, Malacatán, San Marcos", 105, 26, { align: "center" });
    doc.text("Tel: 7937-4297", 105, 31, { align: "center" });
    doc.text("Confianza y Seguridad en un mismo lugar", 105, 36, { align: "center" });

    // --- RECUADRO "DOCUMENTO TRIBUTARIO ELECTRÓNICO" CON SERIE Y NÚMERO ---
    doc.setDrawColor(0);
    doc.setLineWidth(1);
    // Alineado con el final del contenido principal (donde termina "TOTAL")
    doc.roundedRect(150, 15, 45, 40, 3, 3);

    doc.setFontSize(6);
    doc.setFont(undefined, 'bold');
    doc.text("DOCUMENTO", 172.5, 20, { align: "center" });
    doc.text("TRIBUTARIO", 172.5, 24, { align: "center" });
    doc.text("ELECTRÓNICO", 172.5, 28, { align: "center" });
    doc.setFontSize(9);
    doc.text("Factura", 172.5, 34, { align: "center" });

    // Serie y número dentro del mismo recuadro
    doc.setFontSize(7);
    doc.setFont(undefined, 'normal');
    doc.text(`Serie:`, 152, 42);
    doc.text(`${resFactura?.datos.SerieDocumento}`, 170, 42);
    doc.text(`Número:`, 152, 47);
    doc.text(`${resFactura.datos.NumeroDocumento}`, 170, 47);

    // --- RECUADRO DE FECHA Y MONEDA (separado y alineado) ---
    doc.roundedRect(150, 60, 45, 20, 2, 2);
    doc.setFontSize(7);
    doc.setFont(undefined, 'bold');
    doc.text("FECHA EMISIÓN", 172.5, 66, { align: "center" });
    doc.setFont(undefined, 'normal');
    doc.setFontSize(6);
    doc.text(DateFormatter(resFactura.datos.FechaHoraEmision), 172.5, 70, { align: "center" });
    doc.setFontSize(7);
    doc.setFont(undefined, 'bold');
    doc.text("MONEDA", 172.5, 75, { align: "center" });
    doc.setFont(undefined, 'normal');
    doc.text("GTQ", 172.5, 78, { align: "center" });

    // --- SECCIÓN "REFERENCIA" Y DATOS DEL CLIENTE ---
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text("Referencia", 10, 55);

    // Recuadro para datos del cliente - alineado con donde empieza "CANT."
    doc.setDrawColor(0);
    doc.setLineWidth(1);
    doc.roundedRect(10, 60, 135, 22, 3, 3);

    // Contenido del recuadro del cliente
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(`NOMBRE:`, 15, 68);
    doc.setFont(undefined, 'normal');
    doc.text(`${cliente?.nombre || "CF"}`, 55, 68);

    doc.setFont(undefined, 'bold');
    doc.text(`NIT:`, 15, 73);
    doc.setFont(undefined, 'normal');
    doc.text(`${cliente?.nit || "CF"}`, 40, 73);

    doc.setFont(undefined, 'bold');
    doc.text(`DIRECCIÓN:`, 15, 78);
    doc.setFont(undefined, 'normal');
    // Dividir texto largo si es necesario
    const direccionTexto = doc.splitTextToSize(`${cliente?.direccion || "Ciudad"}`, 65);
    doc.text(direccionTexto, 65, 78);

    // --- TABLA DE DETALLES ---
    autoTable(doc, {
      startY: 90,
      head: [["CANT.", "TIPO", "CÓDIGO", "DESCRIPCIÓN", "P. UNIT.", "DESC.", "TOTAL"]],
      body: detalles.flatMap((item) =>
        item.series && item.series.length > 0
          ? item.series.map((serie) => [
            "1",
            "B",
            item.codigo || "",
            `${item.descripcion} - Serie: ${serie}`,
            `Q${item.precio_unitario.toFixed(2)}`,
            `Q 0.00`,
            `Q${item.precio_unitario.toFixed(2)}`,
          ])
          : [[
            item.cantidad.toString(),
            "B",
            item.codigo || "",
            item.descripcion,
            `Q${item.precio_unitario.toFixed(2)}`,
            `Q 0.00`,
            `Q${item.total.toFixed(2)}`,
          ]]
      ),
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
        halign: 'left',
      },
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        halign: "center",
        fontSize: 8,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 }, // CANT
        1: { halign: 'center', cellWidth: 15 }, // TIPO
        2: { halign: 'center', cellWidth: 20 }, // CÓDIGO
        3: { halign: 'left', cellWidth: 70 },   // DESCRIPCIÓN
        4: { halign: 'right', cellWidth: 25 },  // P. UNIT
        5: { halign: 'right', cellWidth: 20 },  // DESC
        6: { halign: 'right', cellWidth: 25 },  // TOTAL
      },
      theme: "grid",
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.3,
      margin: { left: 10, right: 10 },
      tableWidth: 'wrap',
    });

    // --- SECCIÓN "SUJETO A PAGOS TRIMESTRALES ISR" ---
    let UltimaY = doc.lastAutoTable.finalY;

    // Crear rectángulo con fondo gris
    doc.setFillColor(240, 240, 240);
    doc.rect(10, UltimaY + 2, 185, 8, 'F');

    // Texto centrado
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text("SUJETO A PAGOS TRIMESTRALES ISR", 102.5, UltimaY + 7, { align: "center" });

    // --- SECCIÓN DE TOTALES Y LETRAS (UNA SOLA TABLA UNIFICADA) ---
    const ySeccionTotales = UltimaY + 18;

    // Crear UNA SOLA tabla que incluya todo
     autoTable(doc, {
      startY: ySeccionTotales,
      head: [],
      body: [
        // Fila "Resumen de impuestos" eliminada de aquí
        ['TOTAL EN LETRAS', 'Subtotal', `${(Number(resFactura?.datos.GranTotal) - Number(resFactura?.datos.TotalImpuesto)).toFixed(2)}`],
        [convertirNumeroALetras(Number(resFactura?.datos.GranTotal).toFixed(2)), 'Descuento', '0.00'],
        ['', 'TOTAL', `${Number(resFactura?.datos.GranTotal).toFixed(2)}`],
        // Nueva fila para IVA y "Resumen de impuestos"
        [{ content: 'Resumen de impuestos', colSpan: 1, styles: { halign: 'center', fontStyle: 'bold' } }, 'IVA', `${Number(resFactura?.datos.TotalImpuesto).toFixed(2)}`]
      ],
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
        halign: 'left',
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 100 }, 
        1: { halign: 'right', cellWidth: 45, fontStyle: 'bold' }, 
        2: { halign: 'right', cellWidth: 45, fontStyle: 'bold' }, 
      },
      theme: "grid",
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.3,
      margin: { left: 10, right: 10 },
      showHead: false,
      didDrawCell: function (data) {
        // Ajusta los índices de fila si es necesario
        // 'TOTAL EN LETRAS' ahora es row.index 0, column.index 0
        if (data.row.index === 0 && data.column.index === 0) { 
          data.cell.styles.fontStyle = 'bold';
        }

        // 'TOTAL' ahora es row.index 2, column.index 1
        if (data.row.index === 2 && data.column.index === 1) { 
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fontSize = 10;
        }

        // Estilo específico para la celda "Resumen de impuestos" en la última fila
        if (data.row.index === 3 && data.column.index === 0) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.halign = 'center'; // Centra el texto "Resumen de impuestos"
        }
      }
    });

    // Eliminar esta línea, ya que el texto se agrega en la tabla
    // doc.text("Resumen de impuestos", 60, UltimaYTabla - 15, { align: "center" });

    // --- INFORMACIÓN DEL CERTIFICADOR CON QR ---
    let UltimaYTotales = doc.lastAutoTable.finalY + 5;

    autoTable(doc, {
      startY: UltimaYTotales,
      head: [],
      body: [
        ['AUTORIZACIÓN', `${resFactura?.datos.NumeroAutorizacion}`, {
          content: '',
          rowSpan: 4,
          colSpan: 2,
          styles: { halign: 'center', valign: 'middle', cellWidth: 55 }
        }],
        ['CERTIFICADOR', `${resFactura?.datos.NombreCertificador}`],
        ['NIT', `${resFactura?.datos.NITCertificador}`],
        ['FECHA CERTIFICACIÓN', `${DateFormatter(resFactura.datos.FechaHoraCertificacion)}`],
      ],
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
      },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold' },
        1: { halign: 'left' },
        2: { halign: 'center', cellWidth: 25 },
        3: { halign: 'center', cellWidth: 30 },
      },
      theme: "plain", // <-- CAMBIO CLAVE
      margin: { left: 10, right: 10 },
      showHead: false,
      didDrawCell: function (data) {
        const { cell, row, column } = data;
        // Colocar el QR en la celda combinada
        if (row.index === 0 && column.index === 2) {
          const qrX = cell.x + (cell.width / 2) - (qrImageSize / 2);
          const qrY = cell.y + (cell.height / 2) - (qrImageSize / 2);
          doc.addImage(fullQrCodeBase64, 'PNG', qrX, qrY, qrImageSize, qrImageSize);
        }
      },

      // Nuevo gancho para dibujar los bordes y la línea de separación
      didDrawTable: function (data) {
        const { table } = data;

        // Dibuja el borde exterior redondeado
        doc.setDrawColor(0);
        doc.setLineWidth(0.3);
        doc.roundedRect(table.startX, table.startY, table.width, table.height, 3, 3);

        // Dibuja la línea vertical que separa el texto del QR
        const lineX = table.columns[2].x;
        doc.line(lineX, table.startY, lineX, table.finalY);
      }
    });

    // --- REFERENCIA EN EL PIE DE PÁGINA (POSICIÓN FIJA) ---
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text("Referencia", 175, 275, { align: "center" });
    doc.text("1 de 1", 175, 280, { align: "center" });

    doc.save(`Factura_${id_venta}.pdf`);
  };
};

const Ventas = () => {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [detalleVenta, setDetalleVenta] = useState([]);
  const [productoInput, setProductoInput] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [idCliente, setIdCliente] = useState("1"); // ← Cliente CF por defecto
  const [tipoVenta, setTipoVenta] = useState("Contado");
  const [moneda, setMoneda] = useState(1);
  const [precioSeleccionado, setPrecioSeleccionado] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [seriesVenta, setSeriesVenta] = useState([]);


  const obtenerFechaLocal = () => {
    const ahora = new Date();
    const offsetMs = ahora.getTimezoneOffset() * 60000;
    const localISOTime = new Date(ahora.getTime() - offsetMs).toISOString().split("T")[0];
    return localISOTime;
  };
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
  const [fechaVenta, setFechaVenta] = useState(obtenerFechaLocal());

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

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleOpenPrecioMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePrecioMenu = () => {
    setAnchorEl(null);
  };

  const handleSeleccionarPrecio = (precio) => {
    setPrecioSeleccionado(precio);
    handleClosePrecioMenu();
  };
  /*
    const agregarDetalle = () => {
      if (!productoSeleccionado) return;
      if (cantidad <= 0) {
        alert("Cantidad inválida");
        return;
      }
      if (productoSeleccionado.cantidad_inicial <= 0) {
        alert("Producto sin stock disponible");
        return;
      }
      if (cantidad > productoSeleccionado.cantidad_inicial) {
        alert("Cantidad excede el stock disponible");
        return;
      }
      if (productoSeleccionado && cantidad > 0) {
        setDetalleVenta((prev) => [
          ...prev,
          {
            id_producto: productoSeleccionado.id,
            descripcion: productoSeleccionado.descripcion,
            precio_unitario: precioSeleccionado || parseFloat(productoSeleccionado.precio_venta),
            cantidad,
            total: cantidad * (precioSeleccionado || parseFloat(productoSeleccionado.precio_venta))
          }
        ]);
        setProductoSeleccionado(null);
        setProductoInput("");
        setCantidad(1);
        setPrecioSeleccionado(null);
      }
    };
  */
  const agregarDetalle = () => {
    if (!productoSeleccionado) return;
    if (cantidad <= 0) {
      alert("Cantidad inválida");
      return;
    }
    if (productoSeleccionado.cantidad_inicial < cantidad) {
      alert("Cantidad excede stock");
      return;
    }
    if (seriesVenta.length !== cantidad || seriesVenta.some(s => !s)) {
      alert("Debe ingresar todas las series");
      return;
    }

    const precio = precioSeleccionado || parseFloat(productoSeleccionado.precio_venta);

    const nuevosDetalles = seriesVenta.map((serie) => ({
      id_producto: productoSeleccionado.id,
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

  const calcularTotal = () => {
    return detalleVenta.reduce((acc, item) => acc + item.total, 0);
  };

  const guardarVenta = async () => {
    if (!idCliente) {
      alert("Debe seleccionar un cliente.");
      return;
    }

    if (detalleVenta.length === 0) {
      alert("Debe agregar al menos un producto a la venta.");
      return;
    }
    try {
      const venta = {
        id_cliente: idCliente,
        tipo_venta: tipoVenta,
        id_moneda: moneda,
        fecha_venta: fechaVenta,
        detalles: agruparPorProducto()

      };
      const res = await insertarVenta(venta);
      alert(res.message);
      const cliente = clientes.find(c => c.id_cliente === idCliente);
      console.log(res)
      // Generar PDF
      if (tipoVenta === "Contado") {
        const itemsFactura = detalleVenta.map(item => ({
          descripcion: item.descripcion,
          bienOServicio: "B", // item.BienOServicio,
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
        }
        console.log(facturar);
        const resFactura = await GenerarFactura(facturar);
        if (resFactura.exitoso) {
          generarPDFFactura(res, resFactura);
        }

      } else {
        generarPDFVenta(res);
      }

      setDetalleVenta([]);
      setIdCliente("");
    } catch (error) {
      console.error("Error al guardar venta", error);
      alert("Error al guardar la venta");
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Registrar Venta
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Cliente"
            select
            value={idCliente}
            onChange={(e) => setIdCliente(e.target.value)}
            fullWidth
          >
            {clientes.map((cli) => (
              <MenuItem key={cli.id_cliente} value={cli.id_cliente}>
                {cli.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            label="Tipo de Venta"
            select
            value={tipoVenta}
            onChange={(e) => setTipoVenta(e.target.value)}
            fullWidth
          >
            <MenuItem value="Contado">Contado</MenuItem>
            <MenuItem value="Crédito">Crédito</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            label="Moneda"
            type="number"
            value={moneda}
            onChange={(e) => setMoneda(e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Fecha de Venta"
            type="date"
            value={fechaVenta}
            onChange={(e) => setFechaVenta(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" gap={2}>
            <TextField
              label="Cantidad"
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(parseInt(e.target.value))}
              sx={{ width: "20%" }}
            />
            <Box flexGrow={1}>
              <Autocomplete
                freeSolo
                options={productos}
                getOptionLabel={(option) => option.descripcion || ""}
                value={productoSeleccionado}
                onChange={(event, newValue) => {
                  setProductoSeleccionado(newValue);
                  setPrecioSeleccionado(null);
                }}
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
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleOpenPrecioMenu}
                  sx={{ minWidth: "40px", padding: 0, mb: 1 }}
                >
                  P
                </Button>

                {precioSeleccionado && (
                  <Typography variant="body2">
                    Q{precioSeleccionado.toFixed(2)}
                  </Typography>
                )}

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClosePrecioMenu}
                >
                  <MenuItem onClick={() => handleSeleccionarPrecio(parseFloat(productoSeleccionado.precio_venta))}>
                    Precio 1: Q{parseFloat(productoSeleccionado.precio_venta).toFixed(2)}
                  </MenuItem>
                  <MenuItem onClick={() => handleSeleccionarPrecio(parseFloat(productoSeleccionado.precio_venta) * 1.5)}>
                    Precio 2: Q{(parseFloat(productoSeleccionado.precio_venta) * 1.5).toFixed(2)}
                  </MenuItem>
                  <MenuItem onClick={() => handleSeleccionarPrecio(parseFloat(productoSeleccionado.precio_venta) * 1.75)}>
                    Precio 3: Q{(parseFloat(productoSeleccionado.precio_venta) * 1.75).toFixed(2)}
                  </MenuItem>
                </Menu>
              </Box>
            )}

            <Button variant="contained" onClick={agregarDetalle}>
              Agregar
            </Button>

          </Box>
        </Grid>
      </Grid>
      {productoSeleccionado && cantidad > 0 && (
        <Box mt={2} width="100%">
          <Typography variant="subtitle2" gutterBottom>
            Ingresar series para {cantidad} unidad(es):
          </Typography>
          <Grid container spacing={1}>
            {Array.from({ length: cantidad }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <TextField
                  label={`Serie ${i + 1}`}
                  value={seriesVenta[i] || ""}
                  onChange={async (e) => {
                    const nuevasSeries = [...seriesVenta];
                    nuevasSeries[i] = e.target.value;
                    setSeriesVenta(nuevasSeries);

                    // Validar la serie si el campo no está vacío
                    /* if (productoSeleccionado && e.target.value.trim()) {
                      try {
                        const { seriesVendidas } = await validarSeries(
                          productoSeleccionado.id,
                          [e.target.value.trim()]
                        );

                        if (seriesVendidas.includes(e.target.value.trim())) {
                          alert(`⚠️ La serie "${e.target.value.trim()}" ya fue vendida.`);
                          nuevasSeries[i] = "";
                          setSeriesVenta(nuevasSeries);
                        }
                      } catch (error) {
                        console.error("Error al validar la serie:", error);
                      }
                    } */
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
              <TableCell colSpan={3} align="right">
                <strong>Total:</strong>
              </TableCell>
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
        <Button variant="contained" color="success" onClick={guardarVenta}>
          Guardar Venta
        </Button>
      </Box>
    </Box>
  );
};

export default Ventas;
