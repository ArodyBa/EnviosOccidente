import proyecto from "../../api/Proyecto"; // tu axios preconfigurado
import { subirArchivo } from "../../uploadService";

const base = "/papeleria";

// Lista por cliente
export const getPapeleria = async (id_cliente) => {
  const { data } = await proyecto.get(`${base}/cliente/${id_cliente}`);
  return data; // [{id_papeleria, id_tipo_doc, tipo_documento, nombre_documento, documento_url, ...}]
};

// Sube archivo y registra/actualiza papelería (cliente + tipo_doc)
export const subirDocumento = async ({ id_cliente, id_tipo_doc, nombre_documento, fecha_vencimiento, file }) => {
  // sube en subcarpeta por cliente:
  const up = await subirArchivo(file, { subdir: `papeleria/${id_cliente}` });

  const payload = {
    id_cliente,
    id_tipo_doc,
    nombre_documento: nombre_documento || up.name,
    fecha_vencimiento: fecha_vencimiento || null,
    fecha_carga: new Date(),
    archivo: {
      url: up.url,                    // ya absoluta
      relative_path: up.relative_path,
      name: up.name,
      mime_type: up.mime_type,
      size_bytes: up.size_bytes,
    },
  };

  const { data } = await proyecto.post(`/papeleria/upsert`, payload);
  return data;
};
// Borrar item de papelería (y opcionalmente archivo físico en el controller)
export const eliminarDocumentoPapeleria = async (id_papeleria) => {
  const { data } = await proyecto.delete(`${base}/item/${id_papeleria}`);
  return data; // { ok: true }
};
export const updatePapeleriaItem = async (id_papeleria, { nombre_documento, fecha_vencimiento }) => {
  const { data } = await proyecto.put(`${base}/item/${id_papeleria}`, {
    nombre_documento,
    fecha_vencimiento, // "YYYY-MM-DD" o null/""
  });
  return data;
};
