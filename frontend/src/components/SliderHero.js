import React, { useEffect, useMemo, useState } from 'react';
import { Box, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import proyecto from '../services/api/Proyecto';

// Slider elegante, responsivo, con auto-fit de imágenes y controles
const SliderHero = ({ height = undefined, intervalMs = 5000, fit = 'cover', position = 'center', blurBackdrop = true }) => {
  const [items, setItems] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await proyecto.get('/slider'); // público
        if (mounted) setItems(Array.isArray(r.data) ? r.data : []);
      } catch { setItems([]); }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => setIdx((p) => (p + 1) % items.length), intervalMs);
    return () => clearInterval(t);
  }, [items, intervalMs]);

  if (!items.length) return null;

  const goPrev = () => setIdx((p) => (p - 1 + items.length) % items.length);
  const goNext = () => setIdx((p) => (p + 1) % items.length);

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 3,
        px: { xs: 1, md: 2 },
        py: { xs: 2, md: 3 },
        mb: 2,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          mx: 'auto',
          width: { xs: '100%', md: '90%' },
          height: height ?? { xs: 220, md: 340 },
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
        }}
      >
        {items.map((it, i) => (
          <React.Fragment key={it.id_slider || i}>
            {/* Backdrop blurred to fill letterboxing when fit='contain' */}
            {blurBackdrop && (
              <Box
                sx={{
                  position: 'absolute', inset: 0,
                  backgroundImage: `url(${it.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'blur(16px) brightness(0.8)',
                  transform: 'scale(1.1)',
                  opacity: i === idx ? 1 : 0,
                  transition: 'opacity 700ms ease',
                }}
              />
            )}
            {/* Foreground image (contain/cover) */}
            <Box
              component="img"
              src={it.url}
              alt={it.titulo || `slide-${i}`}
              sx={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: fit,
                objectPosition: position,
                opacity: i === idx ? 1 : 0,
                transform: i === idx ? 'scale(1)' : 'scale(1.02)',
                transition: 'opacity 700ms ease, transform 900ms ease',
              }}
            />
          </React.Fragment>
        ))}

        {/* Controles */}
        {items.length > 1 && (
          <>
            <IconButton
              size="small"
              onClick={goPrev}
              sx={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.45)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={goNext}
              sx={{ position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.45)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } }}
            >
              <ChevronRightIcon />
            </IconButton>
          </>
        )}
      </Box>

      {/* Dots */}
      {items.length > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
          {items.map((_, i) => (
            <Box
              key={i}
              onClick={() => setIdx(i)}
              sx={{ width: 10, height: 10, borderRadius: '50%', cursor: 'pointer', bgcolor: i === idx ? '#fff' : 'rgba(255,255,255,0.5)' }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SliderHero;
