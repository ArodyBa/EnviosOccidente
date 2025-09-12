import React, { useEffect, useState } from 'react';
import { getMovimientosPorFecha } from "../../../services/modules/Reportes";

const ReporteMovimientos = () => {
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getMovimientosPorFecha(fecha);
        setDatos(res);
      } catch (err) {
        console.error("Error al cargar movimientos:", err.message);
      }
    };
    fetchData();
  }, [fecha]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Reporte de Ventas y Abonos - {fecha}</h2>
      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        style={{ marginBottom: '10px', padding: '5px' }}
      />

      {datos && (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#000', color: '#fff' }}>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Monto (Q)</th>
              </tr>
            </thead>
            <tbody>
              {datos.movimientos.map((m, idx) => (
                <tr key={idx} style={{ textAlign: 'center', borderBottom: '1px solid #ccc' }}>
                  <td>{m.id}</td>
                  <td>{m.tipo}</td>
                  <td>{m.cliente}</td>
                  <td>{new Date(m.fecha).toLocaleString()}</td>
                  <td>Q{Number(m.monto).toFixed(2)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan="4" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Ventas</td>
                <td><strong>Q{datos.total_ventas.toFixed(2)}</strong></td>
              </tr>
              <tr>
                <td colSpan="4" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Abonos</td>
                <td><strong>Q{datos.total_abonos.toFixed(2)}</strong></td>
              </tr>
              <tr>
                <td colSpan="4" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total General</td>
                <td style={{ fontWeight: 'bold' }}>
                  Q{(datos.total_ventas + datos.total_abonos).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ReporteMovimientos;
