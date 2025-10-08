import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Grid, Paper, Switch, TextField, Typography } from '@mui/material';
import proyecto from '../../../services/api/Proyecto';

const SliderConfig = () => {
  const [rows, setRows] = useState([]);
  const [nuevo, setNuevo] = useState({ titulo: '', descripcion: '', url: '', orden: 1, file: null });
  const load = async () => {
    const r = await proyecto.get('/slider'); // protegido en backend devuelve todos
    setRows(r.data || []);
  };
  useEffect(()=>{ load(); },[]);

  const onUpload = async () => {
    if (!nuevo.file) return;
    const form = new FormData();
    form.append('file', nuevo.file);
    const up = await fetch((proyecto.defaults.baseURL || '') + '/upload', { method:'POST', body: form });
    const data = await up.json();
    if (!data?.ok) return alert('Error al subir');
    setNuevo(s => ({ ...s, url: data.url }));
  };

  const add = async () => {
    if (!nuevo.url) return alert('Primero sube una imagen');
    await proyecto.post('/slider', { titulo: nuevo.titulo, descripcion: nuevo.descripcion, url: nuevo.url, orden: Number(nuevo.orden)||1 });
    setNuevo({ titulo:'', descripcion:'', url:'', orden:1, file:null });
    await load();
  };

  const upd = async (it) => {
    await proyecto.put(`/slider/${it.id_slider}`, { titulo: it.titulo, descripcion: it.descripcion, url: it.url, orden: it.orden, activo: it.activo });
    await load();
  };
  const del = async (id) => { await proyecto.delete(`/slider/${id}`); await load(); };

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={700}>Configurar Slider</Typography>
      <Paper sx={{ p:2, mt:2 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} md={3}><TextField label="Título" size="small" value={nuevo.titulo} onChange={e=>setNuevo(s=>({...s,titulo:e.target.value}))} fullWidth /></Grid>
          <Grid item xs={12} md={4}><TextField label="Descripción" size="small" value={nuevo.descripcion} onChange={e=>setNuevo(s=>({...s,descripcion:e.target.value}))} fullWidth /></Grid>
          <Grid item xs={12} md={2}><TextField label="Orden" size="small" type="number" value={nuevo.orden} onChange={e=>setNuevo(s=>({...s,orden:e.target.value}))} fullWidth /></Grid>
          <Grid item xs={12} md={3}>
            <input type="file" accept="image/*" onChange={e=>setNuevo(s=>({...s,file:e.target.files?.[0]||null}))} />
            <Button size="small" variant="outlined" onClick={onUpload} sx={{ ml:1 }}>Subir</Button>
          </Grid>
          <Grid item xs={12} md={9}><TextField label="URL" size="small" value={nuevo.url} onChange={e=>setNuevo(s=>({...s,url:e.target.value}))} fullWidth /></Grid>
          <Grid item xs={12} md={3}><Button variant="contained" onClick={add}>Agregar</Button></Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p:2, mt:2 }}>
        {rows.map(it => (
          <Grid key={it.id_slider} container spacing={1} alignItems="center" sx={{ mb:1 }}>
            <Grid item xs={12} md={3}><TextField size="small" value={it.titulo||''} onChange={e=>{ it.titulo=e.target.value; }} fullWidth /></Grid>
            <Grid item xs={12} md={4}><TextField size="small" value={it.descripcion||''} onChange={e=>{ it.descripcion=e.target.value; }} fullWidth /></Grid>
            <Grid item xs={12} md={2}><TextField size="small" type="number" value={it.orden||1} onChange={e=>{ it.orden=Number(e.target.value)||1; }} fullWidth /></Grid>
            <Grid item xs={12} md={1}><Switch checked={!!it.activo} onChange={e=>{ it.activo = e.target.checked ? 1 : 0; }} /></Grid>
            <Grid item xs={12} md={2}><Box sx={{ display:'flex', gap:1 }}><Button size="small" variant="outlined" onClick={()=>upd(it)}>Guardar</Button><Button size="small" color="error" onClick={()=>del(it.id_slider)}>Eliminar</Button></Box></Grid>
            <Grid item xs={12} md={12}><TextField size="small" value={it.url} onChange={e=>{ it.url=e.target.value; }} fullWidth /></Grid>
          </Grid>
        ))}
      </Paper>
    </Container>
  );
};

export default SliderConfig;

