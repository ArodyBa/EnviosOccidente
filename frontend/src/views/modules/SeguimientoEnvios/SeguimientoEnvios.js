import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Container, Grid, MenuItem, Paper, TextField, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import proyecto from '../../../services/api/Proyecto';

const SeguimientoEnvios = () => {
  const [q, setQ] = useState('');
  const [dpi, setDpi] = useState('');
  const [code, setCode] = useState('');
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [estados, setEstados] = useState([]);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [nota, setNota] = useState('');

  const fetchEstados = async () => {
    try {
      const r = await proyecto.get('/envios/estados');
      setEstados(r.data || []);
    } catch {}
  };

  useEffect(() => { fetchEstados(); }, []);

  const onBuscar = async () => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (dpi) params.set('dpi', dpi);
    if (code) params.set('code', code);
    try {
      const r = await proyecto.get(`/envios/seguimiento?${params.toString()}`);
      setRows(r.data || []);
      setSelected(null);
    } catch (e) {
      setRows([]);
    }
  };

  const onSelect = async (row) => {
    setSelected({ ...row, history: null });
    try {
      // Reusar endpoint público de tracking
      const r = await proyecto.get(`/tracking/${encodeURIComponent(row.tracking_code)}`);
      setSelected(prev => ({ ...prev, history: r.data }));
    } catch {}
  };

  const onAddEstado = async () => {
    if (!selected) return;
    const payload = {};
    if (nuevoEstado && !/^[0-9]+$/.test(nuevoEstado)) {
      payload.nombre = nuevoEstado;
      payload.createIfMissing = true;
    } else if (nuevoEstado) {
      payload.id_estado_envio = Number(nuevoEstado);
    }
    payload.nota = nota || null;
    try {
      await proyecto.post(`/envios/${selected.id_envio}/estado`, payload);
      setNota('');
      setNuevoEstado('');
      await fetchEstados();
      await onSelect(selected);
    } catch {}
  };

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={700}>Seguimiento de Envíos</Typography>
      <Paper sx={{ p: 2, mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField label="Cliente" value={q} onChange={e => setQ(e.target.value)} size="small" fullWidth />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="DPI" value={dpi} onChange={e => setDpi(e.target.value)} size="small" fullWidth />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Tracking" value={code} onChange={e => setCode(e.target.value)} size="small" fullWidth />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={onBuscar}>Buscar</Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography fontWeight={600} sx={{ mb: 1 }}>Resultados</Typography>
            <List dense>
              {rows.map(r => (
                <React.Fragment key={r.id_envio}>
                  <ListItem button onClick={() => onSelect(r)} selected={selected?.id_envio === r.id_envio}>
                    <ListItemText primary={`${r.tracking_code || '—'} · ${r.cliente}`} secondary={`${r.fecha} · ${r.estado || '—'} · Q${Number(r.total).toFixed(2)}`} />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, minHeight: 300 }}>
            <Typography fontWeight={600} sx={{ mb: 1 }}>Detalle</Typography>
            {!selected && <Typography color="text.secondary">Selecciona un envío para ver su historial.</Typography>}
            {selected && (
              <>
                <Typography variant="body2">Tracking: <b>{selected.tracking_code}</b></Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>Cliente: {selected.cliente}</Typography>

                <Typography variant="subtitle2">Historial</Typography>
                <List dense>
                  {selected.history?.checkpoints?.map((h, i) => (
                    <ListItem key={i}>
                      <ListItemText primary={h.text} secondary={h.ts} />
                    </ListItem>
                  ))}
                </List>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Agregar actualización</Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Estado"
                        select
                        size="small"
                        value={nuevoEstado}
                        onChange={e => setNuevoEstado(e.target.value)}
                        fullWidth
                      >
                        {estados.map(es => (
                          <MenuItem key={es.id_estado_envio} value={es.id_estado_envio}>{es.nombre}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField label="Nota" value={nota} onChange={e => setNota(e.target.value)} size="small" fullWidth />
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Button variant="contained" onClick={onAddEstado}>Guardar</Button>
                    <TextField
                      placeholder="Nuevo estado (crear y usar)"
                      value={typeof nuevoEstado === 'string' && !/^[0-9]+$/.test(nuevoEstado) ? nuevoEstado : ''}
                      onChange={e => setNuevoEstado(e.target.value)}
                      size="small"
                    />
                  </Box>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SeguimientoEnvios;

