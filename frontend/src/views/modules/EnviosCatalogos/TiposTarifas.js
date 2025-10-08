import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Container, Grid, MenuItem, Paper, Switch, TextField, Typography } from '@mui/material';
import proyecto from '../../../services/api/Proyecto';

const TiposTarifas = () => {
  const [tipos, setTipos] = useState([]);
  const [selTipo, setSelTipo] = useState('');
  const [tarifas, setTarifas] = useState([]);

  const [nuevoTipo, setNuevoTipo] = useState({ nombre: '', priced_by_weight: false });
  const [nuevaTarifa, setNuevaTarifa] = useState({ nombre: '', largo_cm:'', ancho_cm:'', alto_cm:'', peso_base_kg:'', precio_base:'' });

  const loadTipos = async () => {
    const r = await proyecto.get('/envios/tipos');
    setTipos(r.data || []);
  };
  const loadTarifas = async (tipoId) => {
    const r = await proyecto.get(`/envios/tarifas?tipo=${tipoId}`);
    setTarifas(r.data || []);
  };

  useEffect(() => { loadTipos(); }, []);
  useEffect(() => { if (selTipo) loadTarifas(selTipo); else setTarifas([]); }, [selTipo]);

  const addTipo = async () => {
    if (!nuevoTipo.nombre.trim()) return;
    await proyecto.post('/envios/tipos', { nombre: nuevoTipo.nombre.trim(), priced_by_weight: nuevoTipo.priced_by_weight });
    setNuevoTipo({ nombre: '', priced_by_weight: false });
    await loadTipos();
  };
  const updTipo = async (t) => {
    await proyecto.put(`/envios/tipos/${t.id_tipo_envio}`, { nombre: t.nombre, priced_by_weight: t.priced_by_weight, activo: t.activo });
    await loadTipos();
  };
  const delTipo = async (id) => { await proyecto.delete(`/envios/tipos/${id}`); await loadTipos(); if (selTipo === id) setSelTipo(''); };

  const addTarifa = async () => {
    if (!selTipo || !nuevaTarifa.nombre.trim() || !nuevaTarifa.precio_base) return;
    await proyecto.post('/envios/tarifas', {
      id_tipo_envio: Number(selTipo),
      nombre: nuevaTarifa.nombre.trim(),
      largo_cm: nuevaTarifa.largo_cm || null,
      ancho_cm: nuevaTarifa.ancho_cm || null,
      alto_cm: nuevaTarifa.alto_cm || null,
      peso_base_kg: nuevaTarifa.peso_base_kg || null,
      precio_base: Number(nuevaTarifa.precio_base)
    });
    setNuevaTarifa({ nombre: '', largo_cm:'', ancho_cm:'', alto_cm:'', peso_base_kg:'', precio_base:'' });
    await loadTarifas(selTipo);
  };
  const updTarifa = async (t) => {
    await proyecto.put(`/envios/tarifas/${t.id_tarifa_envio}`, {
      nombre: t.nombre,
      largo_cm: t.largo_cm,
      ancho_cm: t.ancho_cm,
      alto_cm: t.alto_cm,
      peso_base_kg: t.peso_base_kg,
      precio_base: t.precio_base,
      activo: t.activo,
    });
    await loadTarifas(selTipo);
  };
  const delTarifa = async (id) => { await proyecto.delete(`/envios/tarifas/${id}`); await loadTarifas(selTipo); };

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={700}>Catálogo: Tipos y Tarifas de Envío</Typography>

      <Paper sx={{ p:2, mt:2 }}>
        <Typography variant="subtitle1" fontWeight={600}>Tipos</Typography>
        <Grid container spacing={1} sx={{ mt:1 }}>
          <Grid item xs={12} md={4}>
            <TextField label="Nombre" size="small" fullWidth value={nuevoTipo.nombre} onChange={e=>setNuevoTipo(s=>({...s,nombre:e.target.value}))} />
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
              <Switch checked={nuevoTipo.priced_by_weight} onChange={e=>setNuevoTipo(s=>({...s, priced_by_weight: e.target.checked}))} />
              <Typography>Precio por peso (kg)</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button variant="contained" onClick={addTipo}>Agregar tipo</Button>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label="Seleccionar tipo" size="small" select value={selTipo} onChange={e=>setSelTipo(Number(e.target.value))} fullWidth>
              <MenuItem value="">—</MenuItem>
              {tipos.map(t=>(<MenuItem key={t.id_tipo_envio} value={t.id_tipo_envio}>{t.nombre}{t.priced_by_weight?' (kg)':''}</MenuItem>))}
            </TextField>
          </Grid>
        </Grid>

        {/* Lista editable de tipos */}
        <Box sx={{ mt:2 }}>
          {tipos.map(t => (
            <Grid key={t.id_tipo_envio} container spacing={1} alignItems="center" sx={{ mb:1 }}>
              <Grid item xs={12} md={4}>
                <TextField size="small" value={t.nombre} onChange={e=>{ t.nombre=e.target.value; }} fullWidth />
              </Grid>
              <Grid item xs={12} md={2}>
                <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                  <Switch checked={!!t.priced_by_weight} onChange={e=>{ t.priced_by_weight = e.target.checked ? 1 : 0; }} />
                  <Typography>Por peso</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={2}>
                <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                  <Switch checked={!!t.activo} onChange={e=>{ t.activo = e.target.checked ? 1 : 0; }} />
                  <Typography>Activo</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display:'flex', gap:1 }}>
                  <Button size="small" variant="outlined" onClick={()=>updTipo(t)}>Guardar</Button>
                  <Button size="small" color="error" onClick={()=>delTipo(t.id_tipo_envio)}>Desactivar</Button>
                </Box>
              </Grid>
            </Grid>
          ))}
        </Box>
      </Paper>

      <Paper sx={{ p:2, mt:2 }}>
        <Typography variant="subtitle1" fontWeight={600}>Tarifas del tipo seleccionado</Typography>
        {!selTipo && <Typography color="text.secondary">Seleccione un tipo para gestionar sus tarifas.</Typography>}
        {selTipo && (
          <>
            <Grid container spacing={1} sx={{ mt:1 }}>
              <Grid item xs={12} md={3}><TextField label="Nombre" size="small" value={nuevaTarifa.nombre} onChange={e=>setNuevaTarifa(s=>({...s, nombre:e.target.value}))} fullWidth /></Grid>
              <Grid item xs={12} md={2}><TextField label="Largo (cm)" size="small" type="number" value={nuevaTarifa.largo_cm} onChange={e=>setNuevaTarifa(s=>({...s, largo_cm:e.target.value}))} fullWidth /></Grid>
              <Grid item xs={12} md={2}><TextField label="Ancho (cm)" size="small" type="number" value={nuevaTarifa.ancho_cm} onChange={e=>setNuevaTarifa(s=>({...s, ancho_cm:e.target.value}))} fullWidth /></Grid>
              <Grid item xs={12} md={2}><TextField label="Alto (cm)" size="small" type="number" value={nuevaTarifa.alto_cm} onChange={e=>setNuevaTarifa(s=>({...s, alto_cm:e.target.value}))} fullWidth /></Grid>
              <Grid item xs={12} md={1.5}><TextField label="Peso (kg)" size="small" type="number" value={nuevaTarifa.peso_base_kg} onChange={e=>setNuevaTarifa(s=>({...s, peso_base_kg:e.target.value}))} fullWidth /></Grid>
              <Grid item xs={12} md={1.5}><TextField label="Precio" size="small" type="number" value={nuevaTarifa.precio_base} onChange={e=>setNuevaTarifa(s=>({...s, precio_base:e.target.value}))} fullWidth /></Grid>
              <Grid item xs={12} md={12}><Button variant="contained" onClick={addTarifa}>Agregar tarifa</Button></Grid>
            </Grid>
            <Box sx={{ mt:2 }}>
              {tarifas.map(t => (
                <Grid key={t.id_tarifa_envio} container spacing={1} alignItems="center" sx={{ mb:1 }}>
                  <Grid item xs={12} md={3}><TextField size="small" value={t.nombre} onChange={e=>{ t.nombre=e.target.value; }} fullWidth /></Grid>
                  <Grid item xs={12} md={2}><TextField size="small" type="number" label="L" value={t.largo_cm ?? ''} onChange={e=>{ t.largo_cm=e.target.value||null; }} fullWidth /></Grid>
                  <Grid item xs={12} md={2}><TextField size="small" type="number" label="A" value={t.ancho_cm ?? ''} onChange={e=>{ t.ancho_cm=e.target.value||null; }} fullWidth /></Grid>
                  <Grid item xs={12} md={2}><TextField size="small" type="number" label="H" value={t.alto_cm ?? ''} onChange={e=>{ t.alto_cm=e.target.value||null; }} fullWidth /></Grid>
                  <Grid item xs={12} md={1.5}><TextField size="small" type="number" label="kg" value={t.peso_base_kg ?? ''} onChange={e=>{ t.peso_base_kg=e.target.value||null; }} fullWidth /></Grid>
                  <Grid item xs={12} md={1.5}><TextField size="small" type="number" label="Precio" value={t.precio_base} onChange={e=>{ t.precio_base=Number(e.target.value)||0; }} fullWidth /></Grid>
                  <Grid item xs={12} md={12}>
                    <Box sx={{ display:'flex', gap:1 }}>
                      <Button size="small" variant="outlined" onClick={()=>updTarifa(t)}>Guardar</Button>
                      <Button size="small" color="error" onClick={()=>delTarifa(t.id_tarifa_envio)}>Desactivar</Button>
                    </Box>
                  </Grid>
                </Grid>
              ))}
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default TiposTarifas;

