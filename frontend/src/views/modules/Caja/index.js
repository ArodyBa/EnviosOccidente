import React, { useEffect, useMemo, useState } from 'react';
import CajaAPI from '../../../services/cajaService';
import { useLocation, useNavigate } from 'react-router-dom';

const Section = ({ title, children }) => (
  <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, marginTop: 12 }}>
    <h3 style={{ marginTop: 0 }}>{title}</h3>
    {children}
  </div>
);

const Row = ({ label, children }) => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
    <div style={{ width: 160, color: '#555' }}>{label}</div>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

const Caja = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apertura, setApertura] = useState(null);
  const [saldo, setSaldo] = useState(null);
  const [movs, setMovs] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const refrescar = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await CajaAPI.getAperturaActual();
      if (data.abierta) {
        setApertura(data.apertura);
        setSaldo(data.saldo);
        setMovs(data.movimientos || []);
      } else {
        setApertura(null);
        setSaldo(null);
        setMovs([]);
      }
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { refrescar(); }, []);

  // Formularios
  const [saldoInicial, setSaldoInicial] = useState('0');
  const [obsApertura, setObsApertura] = useState('');

  const abrir = async () => {
    try {
      setError(null);
      await CajaAPI.abrir({ saldo_inicial: Number(saldoInicial || 0), observaciones: obsApertura || null });
      await refrescar();
      const dest = location.state?.from?.pathname || '/dashboard';
      navigate(dest, { replace: true });
    } catch (e) { setError(e?.response?.data?.message || e.message); }
  };

  const [tipo, setTipo] = useState('INGRESO');
  const [monto, setMonto] = useState('');
  const [desc, setDesc] = useState('');
  const [origen, setOrigen] = useState('MANUAL');
  const [efectivo, setEfectivo] = useState(true);

  const registrar = async () => {
    try {
      setError(null);
      await CajaAPI.movimiento({ tipo, monto: Number(monto), descripcion: desc || null, origen, es_efectivo: efectivo });
      setMonto(''); setDesc('');
      await refrescar();
    } catch (e) { setError(e?.response?.data?.message || e.message); }
  };

  const [conteo, setConteo] = useState('');
  const [obsCierre, setObsCierre] = useState('');
  const cerrar = async () => {
    try {
      setError(null);
      await CajaAPI.cerrar({ conteo_efectivo: Number(conteo), observaciones: obsCierre || null });
      await refrescar();
    } catch (e) { setError(e?.response?.data?.message || e.message); }
  };

  const saldoTeorico = useMemo(() => saldo?.saldo_teorico ?? 0, [saldo]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Caja</h2>
      {loading && <div>Cargando...</div>}
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

      {!loading && !apertura && (
        <Section title="Apertura de Caja">
          <Row label="Saldo inicial">
            <input type="number" step="0.01" value={saldoInicial} onChange={e => setSaldoInicial(e.target.value)} />
          </Row>
          <Row label="Observaciones">
            <input type="text" value={obsApertura} onChange={e => setObsApertura(e.target.value)} />
          </Row>
          <button onClick={abrir}>Abrir Caja</button>
        </Section>
      )}

      {!loading && apertura && (
        <>
          <Section title="Estado de Caja">
            <div style={{ display: 'flex', gap: 24 }}>
              <div>
                <div><b>Apertura</b>: {new Date(apertura.fecha_apertura).toLocaleString()}</div>
                <div><b>Saldo inicial</b>: Q {Number(apertura.saldo_inicial).toFixed(2)}</div>
              </div>
              <div>
                <div><b>Ingresos</b>: Q {Number(saldo?.ingresos || 0).toFixed(2)}</div>
                <div><b>Egresos</b>: Q {Number(saldo?.egresos || 0).toFixed(2)}</div>
              </div>
              <div>
                <div><b>Saldo teórico</b>: Q {Number(saldoTeorico).toFixed(2)}</div>
              </div>
            </div>
          </Section>

          <Section title="Registrar Movimiento">
            <Row label="Tipo">
              <select value={tipo} onChange={e => setTipo(e.target.value)}>
                <option value="INGRESO">INGRESO</option>
                <option value="EGRESO">EGRESO</option>
              </select>
            </Row>
            <Row label="Monto">
              <input type="number" step="0.01" value={monto} onChange={e => setMonto(e.target.value)} />
            </Row>
            <Row label="Origen">
              <select value={origen} onChange={e => setOrigen(e.target.value)}>
                <option value="MANUAL">MANUAL</option>
                <option value="VENTA">VENTA</option>
                <option value="ABONO">ABONO</option>
                <option value="ENVIO">ENVIO</option>
                <option value="OTRO">OTRO</option>
              </select>
            </Row>
            <Row label="Descripción">
              <input type="text" value={desc} onChange={e => setDesc(e.target.value)} />
            </Row>
            <Row label="Efectivo">
              <input type="checkbox" checked={efectivo} onChange={e => setEfectivo(e.target.checked)} />
            </Row>
            <button onClick={registrar} disabled={!monto}>Guardar</button>
          </Section>

          <Section title="Movimientos (últimos 50)">
            <div style={{ maxHeight: 280, overflow: 'auto' }}>
              <table width="100%" cellPadding={6} style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f6f6f6' }}>
                    <th align="left">Fecha</th>
                    <th>Tipo</th>
                    <th align="right">Monto</th>
                    <th>Origen</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {movs.map(m => (
                    <tr key={m.id} style={{ borderTop: '1px solid #eee' }}>
                      <td>{new Date(m.fecha).toLocaleString()}</td>
                      <td align="center">{m.tipo}</td>
                      <td align="right">Q {Number(m.monto).toFixed(2)}</td>
                      <td align="center">{m.origen}</td>
                      <td>{m.descripcion || ''}</td>
                    </tr>
                  ))}
                  {!movs.length && (
                    <tr><td colSpan="5" align="center" style={{ color: '#888' }}>Sin movimientos</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Cierre de Caja">
            <Row label="Conteo efectivo">
              <input type="number" step="0.01" value={conteo} onChange={e => setConteo(e.target.value)} />
            </Row>
            <Row label="Observaciones">
              <input type="text" value={obsCierre} onChange={e => setObsCierre(e.target.value)} />
            </Row>
            <div style={{ marginBottom: 8, color: '#555' }}>
              Saldo teórico: <b>Q {Number(saldoTeorico).toFixed(2)}</b>
            </div>
            <button onClick={cerrar} disabled={!conteo}>Cerrar Caja</button>
          </Section>
        </>
      )}
    </div>
  );
};

export default Caja;
