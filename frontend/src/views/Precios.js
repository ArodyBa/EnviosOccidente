import React, { useEffect, useMemo, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Container, Grid, Paper, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigationBar from '../components/NavigationBar';
import proyecto from '../services/api/Proyecto';

const Precios = () => {
  const [tipos, setTipos] = useState([]);
  const [tarifas, setTarifas] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [tp, tf] = await Promise.all([
          proyecto.get('/envios/tipos'),
          proyecto.get('/envios/tarifas'),
        ]);
        setTipos(tp.data || []);
        setTarifas(tf.data || []);
      } catch (e) {
        setTipos([]); setTarifas([]);
      }
    })();
  }, []);

  const grouped = useMemo(() => {
    const byTipo = new Map();
    for (const t of tipos) byTipo.set(t.id_tipo_envio, { tipo: t, items: [] });
    for (const x of tarifas) {
      const g = byTipo.get(x.id_tipo_envio) || { tipo: { id_tipo_envio: x.id_tipo_envio, nombre: 'Otro' }, items: [] };
      g.items.push(x);
      byTipo.set(x.id_tipo_envio, g);
    }
    return [...byTipo.values()].filter(g => g.items.length > 0);
  }, [tipos, tarifas]);

  return (
    <>
      <NavigationBar />
      <Container sx={{ py: { xs: 6, md: 8 } }}>
        <Typography variant="h3" fontWeight={800} gutterBottom>
          Tarifas de Envío
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Consulta precios referenciales por tipo de paquete. Los valores pueden variar según ruta y cobertura.
        </Typography>

        {grouped.length === 0 && (
          <Paper sx={{ p:3, borderRadius:3 }}><Typography>No hay tarifas publicadas.</Typography></Paper>
        )}

        {grouped.map((g, idx) => (
          <Accordion key={idx} defaultExpanded sx={{ mb: 2, borderRadius: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems:'center', gap:1 }}>
                {g.tipo.nombre}
                {g.tipo.priced_by_weight ? <Chip size="small" label="por kg" /> : null}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {g.items.map((it) => (
                  <Grid item xs={12} md={4} key={it.id_tarifa_envio}>
                    <Paper sx={{ p:2, borderRadius:2 }}>
                      <Typography fontWeight={700}>{it.nombre}</Typography>
                      <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                        {it.largo_cm || it.ancho_cm || it.alto_cm ? `${it.largo_cm ?? '—'}×${it.ancho_cm ?? '—'}×${it.alto_cm ?? '—'} cm` : (it.peso_base_kg ? `${it.peso_base_kg} kg base` : 'Tarifa')} 
                      </Typography>
                      <Typography sx={{ mt: 1.5 }}>Q{Number(it.precio_base).toFixed(2)}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </>
  );
};

export default Precios;

