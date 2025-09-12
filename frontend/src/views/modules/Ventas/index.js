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
    // Declaraciones para el QR (correctamente colocadas una sola vez)
    const qrImageSize = 35;
    const fullQrCodeBase64 = "data:image/png;base64," + resFactura.datos.codigoQR;

    // --- CABECERA (LOGO Y DATOS DE LA EMPRESA) ---
    // Dibujar el logo de la empresa
    doc.addImage(img, "PNG", 10, 10, 40, 20);

    // Título y datos de la empresa
    doc.setFontSize(14);
    doc.text("Armerías AGOP", 105, 15, { align: "center" });
    doc.setFontSize(10);
    doc.text("Dirección: 2da. Avenida, Zona 1, Malacatán, San Marcos", 105, 20, { align: "center" });
    doc.text("Tel: 7937-4297", 105, 25, { align: "center" });
    doc.text("Confianza y Seguridad en un mismo lugar", 105, 30, { align: "center" });

    // --- RECUADRO DE INFORMACIÓN DE FACTURA ---
    doc.setDrawColor(0);
    // Ajuste del recuadro a 40 de alto para incluir todo el texto
    doc.rect(140, 40, 60, 40); 
    
    // Título "Factura"
    doc.setFontSize(12);
    doc.text("Factura", 185, 45, { align: "right" });
    
    // Contenido del recuadro
    doc.setFontSize(10);
    doc.text(`Serie: ${resFactura?.datos.SerieDocumento}`, 145, 55);
    doc.text(`Número: ${resFactura.datos.NumeroDocumento}`, 145, 60);
    doc.text(`FECHA EMISIÓN: ${DateFormatter(resFactura.datos.FechaHoraEmision)}`, 145, 65);
    doc.text(`MONEDA: GTQ`, 145, 70);

    // --- RECUADRO DE DATOS DEL CLIENTE ---
    doc.setDrawColor(0);
    // Ajuste del recuadro a 20 de alto para incluir todo el texto
    doc.rect(10, 65, 120, 20); 
    
    // Contenido del recuadro
    doc.setFontSize(10);
    doc.text(`NOMBRE: ${cliente?.nombre || "CF"}`, 15, 70);
    doc.text(`NIT: ${cliente?.nit || "CF"}`, 15, 75);
    doc.text(`DIRECCION: ${cliente?.direccion || ""}`, 15, 80);

    // --- TABLA DE DETALLES CON BORDES (TEMA GRID) ---
    autoTable(doc, {
      startY: 90,
      head: [["CANT.", "TIPO", "CÓDIGO", "DESCRIPCIÓN", "P. UNIT.", "DESC.", "TOTAL"]],
      body: detalles.flatMap((item) =>
        item.series && item.series.length > 0
          ? item.series.map((serie) => [
              1,
              "B",
              item.codigo || "",
              `${item.descripcion} - Serie: ${serie}`,
              `Q${item.precio_unitario.toFixed(2)}`,
              `Q 0.00`,
              `Q${item.precio_unitario.toFixed(2)}`,
            ])
          : [[
              item.cantidad,
              "B",
              item.codigo || "",
              item.descripcion,
              `Q${item.precio_unitario.toFixed(2)}`,
              `Q 0.00`,
              `Q${item.total.toFixed(2)}`,
            ]]
      ),
      styles: {
        halign: "left",
        cellPadding: 3,
        textColor: 20,
      },
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        halign: "center",
      },
      theme: "grid",
    });

    // --- PIE DE PÁGINA ---
    let UltimaY = doc.lastAutoTable.finalY;

    // Información de totales y certificador
    doc.setFontSize(10);
    doc.text(`TOTAL EN LETRAS`, 15, UltimaY + 10);
    doc.text(`${convertirNumeroALetras(Number(resFactura?.datos.GranTotal).toFixed(2))}`, 15, UltimaY + 15);

    doc.text(`TOTAL : ${Number(resFactura?.datos.GranTotal).toFixed(2)}`, 150, UltimaY + 5);
    doc.text(`IVA : ${Number(resFactura?.datos.TotalImpuesto).toFixed(3)}`, 150, UltimaY + 10);

    doc.text(`AUTORIZACIÓN: ${resFactura?.datos.NumeroAutorizacion}`, 15, UltimaY + 25);
    doc.text(`CERTIFICADOR: ${resFactura?.datos.NombreCertificador}`, 15, UltimaY + 30);
    doc.text(`NIT: ${resFactura?.datos.NITCertificador}`, 15, UltimaY + 35);
    doc.text(`FECHA CERTIFICACIÓN: ${DateFormatter(resFactura.datos.FechaHoraCertificacion)}`, 15, UltimaY + 40);

    // QR
    doc.addImage(fullQrCodeBase64, 'PNG', 15, UltimaY + 50, qrImageSize, qrImageSize);

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
