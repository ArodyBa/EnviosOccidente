import api from '../api/axios';

const UsuariosService = {
  obtenerUsuarios: async () => {
    const response = await api.get('/usuarios');
    return response.data;
  },
  crearUsuario: async (usuario) => {
    const response = await api.post('/usuarios', usuario);
    return response.data;
  },
  eliminarUsuario: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },
};

export default UsuariosService;
