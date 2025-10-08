import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Grid, Paper, Switch, TextField, Typography } from '@mui/material';
import proyecto from '../../../services/api/Proyecto';

const Estados = () => {
  const [estados, setEstados] = useState([]);
  const [nuevo, setNuevo] = useState({ nombre: '', orden: 99 });

  const load = async () => {
    const r = await proyecto.get('/envios/estados');
    setEstados(r.data || []);
  };
  useEffect(()=>{ load(); },[]);

  const add = async () => {
    if (!nuevo.nombre.trim()) return;
    await proyecto.post('/envios/estados', { nombre: nuevo.nombre.trim(), orden: Number(nuevo.orden)||99 });
    setNuevo({ nombre:'', orden:99 });
    await load();
  };
  const upd = async (e) => {
    await proyecto.put(`/envios/estados/${e.id_estado_envio}`, { nombre: e.nombre, orden: e.orden, activo: e.activo });
    await load();
  };
  const del = async (id) => { await proyecto.delete(`/envios/estados/${id}`); await load(); };

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={700}>Catálogo: Estados de Envío</Typography>
      <Paper sx={{ p:2, mt:2 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} md={6}><TextField label="Nombre" size="small" fullWidth value={nuevo.nombre} onChange={e=>setNuevo(s=>({...s,nombre:e.target.value}))} /></Grid>
          <Grid item xs={12} md={2}><TextField label="Orden" size="small" type="number" value={nuevo.orden} onChange={e=>setNuevo(s=>({...s,orden:e.target.value}))} fullWidth /></Grid>
          <Grid item xs={12} md={2}><Button variant="contained" onClick={add}>Agregar</Button></Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p:2, mt:2 }}>
        {estados.map(es => (
          <Grid key={es.id_estado_envio} container spacing={1} alignItems="center" sx={{ mb:1 }}>
            <Grid item xs={12} md={6}><TextField size="small" value={es.nombre} onChange={e=>{ es.nombre=e.target.value; }} fullWidth /></Grid>
            <Grid item xs={12} md={2}><TextField size="small" type="number" value={es.orden} onChange={e=>{ es.orden=Number(e.target.value)||99; }} fullWidth /></Grid>
            <Grid item xs={12} md={2}><Box sx={{ display:'flex', alignItems:'center', gap:1 }}><Switch checked={!!es.activo} onChange={e=>{ es.activo = e.target.checked ? 1 : 0; }} /><Typography>Activo</Typography></Box></Grid>
            <Grid item xs={12} md={2}><Box sx={{ display:'flex', gap:1 }}><Button size="small" variant="outlined" onClick={()=>upd(es)}>Guardar</Button><Button size="small" color="error" onClick={()=>del(es.id_estado_envio)}>Desactivar</Button></Box></Grid>
          </Grid>
        ))}
      </Paper>
    </Container>
  );
};

export default Estados;

