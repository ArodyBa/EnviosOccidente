import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Container, Grid, MenuItem, Paper, TextField, Typography } from '@mui/material';
import proyecto from '../../../services/api/Proyecto';

const DetalleRow = ({ index, row, tipos, tarifas, onChange, onRemove }) => {
  const tipo = tipos.find(t => t.id_tipo_envio === row.id_tipo_envio);
  const tarifasFiltradas = useMemo(() => tarifas.filter(x => x.id_tipo_envio === row.id_tipo_envio), [tarifas, row.id_tipo_envio]);
  const byWeight = tipo?.priced_by_weight === 1 || tipo?.priced_by_weight === true;

  return (
    <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
      <Grid item xs={12} md={1.5}>
        <TextField
          label="Cant"
          type="number"
          size="small"
          value={row.cantidad}
          onChange={e => onChange(index, { cantidad: Number(e.target.value) })}
          inputProps={{ min: 1, step: '1' }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} md={2.5}>
        <TextField
          label="Tipo"
          select
          size="small"
          value={row.id_tipo_envio || ''}
          onChange={e => onChange(index, { id_tipo_envio: Number(e.target.value), id_tarifa_envio: '' })}
          fullWidth
        >
          {tipos.map(t => (
            <MenuItem key={t.id_tipo_envio} value={t.id_tipo_envio}>{t.nombre}{t.priced_by_weight ? ' (kg)' : ''}</MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12} md={3}>
        <TextField
          label="Tarifa"
          select
          size="small"
          value={row.id_tarifa_envio || ''}
          onChange={e => {
            const id_tarifa_envio = e.target.value ? Number(e.target.value) : '';
            const tarifa = tarifas.find(x => x.id_tarifa_envio === id_tarifa_envio);
            onChange(index, {
              id_tarifa_envio,
              precio_unitario: tarifa ? Number(tarifa.precio_base) : row.precio_unitario
            });
          }}
          fullWidth
          disabled={!row.id_tipo_envio}
        >
          {tarifasFiltradas.map(t => (
            <MenuItem key={t.id_tarifa_envio} value={t.id_tarifa_envio}>{t.nombre} · Q{Number(t.precio_base).toFixed(2)}</MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12} md={2}>
        <TextField
          label="Precio"
          type="number"
          size="small"
          value={row.precio_unitario}
          onChange={e => onChange(index, { precio_unitario: Number(e.target.value) })}
          inputProps={{ min: 0, step: '0.01' }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} md={2}>
        <TextField
          label="Peso (kg)"
          type="number"
          size="small"
          value={row.peso_kg ?? ''}
          onChange={e => onChange(index, { peso_kg: e.target.value === '' ? null : Number(e.target.value) })}
          inputProps={{ min: 0, step: '0.01' }}
          fullWidth
          disabled={!byWeight}
        />
      </Grid>
      <Grid item xs={12} md={1}>
        <Button color="error" variant="outlined" onClick={() => onRemove(index)} fullWidth>Quitar</Button>
      </Grid>
    </Grid>
  );
};

const NuevoEnvio = () => {
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0,10));
  const [idCliente, setIdCliente] = useState('');
  const [clientes, setClientes] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [obs, setObs] = useState('');
  const [tracking, setTracking] = useState('');
  const [detalle, setDetalle] = useState([ { cantidad: 1, id_tipo_envio: '', id_tarifa_envio: '', precio_unitario: 0, peso_kg: null } ]);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // cargar catálogos
    (async () => {
      try {
        const [ct, tp, tf] = await Promise.all([
          proyecto.get('/clientes'),
          proyecto.get('/envios/tipos'),
          proyecto.get('/envios/tarifas'),
        ]);
        setClientes(ct.data || []);
        setTipos(tp.data || []);
        setTarifas(tf.data || []);
      } catch (e) {
        console.error('Error cargando catálogos', e);
      }
    })();
  }, []);

  const onChangeRow = (i, patch) => {
    setDetalle(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  };
  const onRemoveRow = (i) => setDetalle(prev => prev.filter((_, idx) => idx !== i));
  const onAddRow = () => setDetalle(prev => [...prev, { cantidad: 1, id_tipo_envio: '', id_tarifa_envio: '', precio_unitario: 0, peso_kg: null }]);

  const total = useMemo(() => {
    return detalle.reduce((acc, r) => {
      const tipo = tipos.find(t => t.id_tipo_envio === r.id_tipo_envio);
      const byWeight = tipo?.priced_by_weight === 1 || tipo?.priced_by_weight === true;
      const base = byWeight ? (r.precio_unitario * (r.peso_kg || 0)) : r.precio_unitario;
      return acc + (Number(r.cantidad || 0) * Number(base || 0));
    }, 0);
  }, [detalle, tipos]);

  const onSave = async () => {
    if (!fecha || !idCliente || detalle.length === 0 || !tracking.trim()) return;
    setSaving(true);
    setResult(null);
    try {
      const payload = {
        fecha,
        id_cliente: Number(idCliente),
        observaciones: obs || null,
        tracking_code: tracking.trim(),
        detalles: detalle.map(d => ({
          cantidad: Number(d.cantidad),
          id_tipo_envio: Number(d.id_tipo_envio),
          id_tarifa_envio: d.id_tarifa_envio ? Number(d.id_tarifa_envio) : null,
          precio_unitario: Number(d.precio_unitario),
          peso_kg: d.peso_kg == null || d.peso_kg === '' ? null : Number(d.peso_kg),
        })),
      };
      const res = await proyecto.post('/envios', payload);
      setResult(res.data);
    } catch (e) {
      setResult({ error: e?.response?.data?.error || e?.response?.data?.message || 'Error al guardar' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={700}>Nuevo Envío</Typography>
      <Paper sx={{ p: 2, mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              label="Fecha"
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Cliente"
              select
              value={idCliente}
              onChange={e => setIdCliente(e.target.value)}
              size="small"
              fullWidth
            >
              {clientes.map(c => (
                <MenuItem key={c.id_cliente} value={c.id_cliente}>{c.nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Observaciones"
              value={obs}
              onChange={e => setObs(e.target.value)}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Tracking"
              value={tracking}
              onChange={e => setTracking(e.target.value)}
              size="small"
              fullWidth
              required
              helperText={!tracking.trim() ? 'Requerido' : ' '}
              error={!tracking.trim()}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Detalle</Typography>
        {detalle.map((r, i) => (
          <DetalleRow
            key={i}
            index={i}
            row={r}
            tipos={tipos}
            tarifas={tarifas}
            onChange={onChangeRow}
            onRemove={onRemoveRow}
          />
        ))}
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Button variant="outlined" onClick={onAddRow}>Agregar línea</Button>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="h6">Total: Q{total.toFixed(2)}</Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Button variant="contained" onClick={onSave} disabled={saving}>Guardar</Button>
        {result && (
          <Typography sx={{ ml: 2 }} color={result?.error ? 'error' : 'success.main'}>
            {result?.error
              ? result.error
              : `Envío #${result.id_envio} · Tracking ${result.tracking_code || '—'} · Total Q${result.total?.toFixed?.(2) ?? result.total}`}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default NuevoEnvio;
