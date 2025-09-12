  import React, { useState } from 'react';
  import {
    buscarSerie,
    editarSerie,
    eliminarSerie,
  } from '../../../services/modules/Correcciones';

  const CorreccionesSerieIndividual = () => {
    const [serieBuscada, setSerieBuscada] = useState('');
    const [serie, setSerie] = useState(null);
    const [editando, setEditando] = useState(false);
    const [nuevaSerie, setNuevaSerie] = useState('');

    const handleBuscar = async () => {
      try {
        const res = await buscarSerie(serieBuscada);
        setSerie(res);
        setEditando(false);
        setNuevaSerie('');
      } catch (error) {
        if (error.response?.status === 404) {
          alert("⚠️ Serie no encontrada");
        } else {
          alert("❌ Error al buscar la serie");
        }
        setSerie(null);
      }
    };

    const guardarEdicion = async () => {
      try {
        await editarSerie(serie.serie, nuevaSerie);
        alert("✅ Serie actualizada correctamente");
        handleBuscar(); // volver a buscar para refrescar
      } catch (error) {
        alert("❌ Error al editar la serie");
        console.error(error);
      }
    };

    const eliminarSerieIndividual = async () => {
      if (!window.confirm("¿Seguro que deseas eliminar esta serie?")) return;
      try {
        await eliminarSerie(serie.serie);
        alert("✅ Serie eliminada");
        setSerie(null);
        setSerieBuscada('');
      } catch (error) {
        alert("❌ Error al eliminar la serie");
      }
    };

    return (
      <div style={{ padding: '20px' }}>
        <h2>Buscar Serie Individual</h2>
        <input
          type="text"
          placeholder="Ingrese la serie"
          value={serieBuscada}
          onChange={(e) => setSerieBuscada(e.target.value)}
        />
        <button onClick={handleBuscar}>Buscar</button>

        {serie && (
          <table style={{ marginTop: '20px', borderCollapse: 'collapse', width: '100%' }}>
            <thead style={{ backgroundColor: 'black', color: 'white' }}>
              <tr>
                <th>ID</th>
                <th>ID Producto</th>
                <th>Descripción</th>
                <th>Serie</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{serie.serie}</td>
                <td>{serie.id_producto}</td>
                <td>{serie.descripcion}</td>
                <td>
                  {editando ? (
                    <input
                      value={nuevaSerie}
                      onChange={(e) => setNuevaSerie(e.target.value)}
                    />
                  ) : (
                    serie.serie
                  )}
                </td>
             <td>{parseInt(serie.estado) === 1 ? "Disponible" : "Vendida"}</td>

                <td>
                  {editando ? (
                    <>
                      <button onClick={guardarEdicion}>Guardar</button>
                      <button onClick={() => setEditando(false)}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => {
                        setEditando(true);
                        setNuevaSerie(serie.serie);
                      }}>Editar</button>
                      <button onClick={eliminarSerieIndividual}>Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    );
  };

  export default CorreccionesSerieIndividual;
