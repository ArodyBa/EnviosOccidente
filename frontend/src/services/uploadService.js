// src/services/uploadService.js
const UPLOAD_URL = process.env.REACT_APP_UPLOAD_URL;        // ej: http://localhost:5001/upload
const API_BASE   = process.env.REACT_APP_API_URL;           // ej: http://localhost:5001
const TOKEN      = process.env.REACT_APP_UPLOAD_TOKEN || ""; // opcional

/**
 * Sube un archivo al backend con Multer.
 * @param {File} file - archivo del input
 * @param {{ subdir?: string }} opts - subdir opcional (p.ej. "papeleria/123")
 * @returns {{ url: string, relative_path: string|null, name: string, mime_type: string, size_bytes: number }}
 */
export async function subirArchivo(file, opts = {}) {
  if (!file) throw new Error("Archivo requerido");
  if (!UPLOAD_URL) throw new Error("Falta REACT_APP_UPLOAD_URL en el .env");

  const fd = new FormData();
  fd.append("file", file);

  // agrega ?subdir=papeleria/ID si se especifica
  const url = opts.subdir
    ? `${UPLOAD_URL}?subdir=${encodeURIComponent(opts.subdir)}`
    : UPLOAD_URL;

  const headers = {};
  if (TOKEN) headers["X-Upload-Token"] = TOKEN;

  const res = await fetch(url, { method: "POST", body: fd, headers });

  // valida HTTP
  if (!res.ok) {
    let msg = `Upload HTTP ${res.status}`;
    try {
      const j = await res.json();
      msg = j.message || msg;
    } catch (_) {}
    throw new Error(msg);
  }

  // valida payload
  const data = await res.json();
  if (!(data.ok || data.success)) {
    throw new Error(data.message || "Error al subir archivo");
  }

  // si el backend devuelve url relativa, compón absoluta con API_BASE
  let finalUrl = data.url;
  if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
    const clean = finalUrl.startsWith("/") ? finalUrl : `/${finalUrl}`;
    finalUrl = `${API_BASE}${clean}`;
  }

  return {
    url: finalUrl,                           // absoluta lista para <a href>
    relative_path: data.relative_path || null,
    name: data.name || file.name,
    mime_type: data.mime_type || file.type,
    size_bytes: data.size_bytes ?? file.size,
  };
}
