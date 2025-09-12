// controllers/filesController.js
const path = require('path');
const crypto = require('crypto');
const ftp = require('basic-ftp');               // FTPS
const SFTPClient = require('ssh2-sftp-client'); // SFTP
const { promisePool } = require('../config/db');

const MAX_MB = parseInt(process.env.MAX_UPLOAD_MB || '20', 10);
const proto = (process.env.STORAGE_PROTOCOL || 'ftps').toLowerCase();
const baseRemote = process.env.REMOTE_BASE;  // /home/USER/public_html/uploads
const pubDomain  = process.env.PUBLIC_DOMAIN;

function yyyymm() {
  const d = new Date();
  return { yyyy: d.getFullYear(), mm: String(d.getMonth() + 1).padStart(2, '0') };
}
function publicUrl(y,m,name){ return `https://${pubDomain}/uploads/${y}/${m}/${name}`; }
function remotePaths(y,m,name){ const dir=`${baseRemote}/${y}/${m}`; return { dir, full: `${dir}/${name}` }; }
const toRel = (p) => p.replace(/^.*public_html\//, '');

async function uploadFTPS(buffer, dir, full) {
  const client = new ftp.Client();
  try {
    await client.access({
      host: process.env.FTPS_HOST,
      port: Number(process.env.FTPS_PORT || 21),
      user: process.env.FTPS_USER,
      password: process.env.FTPS_PASS,
      secure: true
    });
    await client.ensureDir(toRel(dir));
    await client.uploadFrom(Buffer.from(buffer), toRel(full));
  } finally { client.close(); }
}

async function deleteFTPS(full) {
  const client = new ftp.Client();
  try {
    await client.access({
      host: process.env.FTPS_HOST,
      port: Number(process.env.FTPS_PORT || 21),
      user: process.env.FTPS_USER,
      password: process.env.FTPS_PASS,
      secure: true
    });
    try { await client.remove(toRel(full)); } catch {}
  } finally { client.close(); }
}

async function uploadSFTP(buffer, dir, full) {
  const sftp = new SFTPClient();
  await sftp.connect({
    host: process.env.SFTP_HOST,
    port: Number(process.env.SFTP_PORT || 21098),
    username: process.env.SFTP_USER,
    password: process.env.SFTP_PASS
  });
  try { await sftp.mkdir(dir, true); } catch {}
  await sftp.put(buffer, full);
  await sftp.end();
}

async function deleteSFTP(full) {
  const sftp = new SFTPClient();
  await sftp.connect({
    host: process.env.SFTP_HOST,
    port: Number(process.env.SFTP_PORT || 21098),
    username: process.env.SFTP_USER,
    password: process.env.SFTP_PASS
  });
  try { await sftp.delete(full); } catch {}
  await sftp.end();
}

exports.upload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Archivo requerido' });

    const { originalname, buffer, mimetype, size } = req.file;
    if (size > MAX_MB * 1024 * 1024) {
      return res.status(413).json({ message: `El archivo excede ${MAX_MB}MB` });
    }

    const { yyyy, mm } = yyyymm();
    const ext = path.extname(originalname) || '';
    const safeName = crypto.randomUUID() + ext;
    const { dir, full } = remotePaths(yyyy, mm, safeName);
    const url = publicUrl(yyyy, mm, safeName);

    if (proto === 'sftp') await uploadSFTP(buffer, dir, full);
    else                  await uploadFTPS(buffer, dir, full);

    const provider = proto === 'sftp' ? 'namecheap_sftp' : 'namecheap_ftps';
    const [r] = await promisePool.query(
      `INSERT INTO archivos (original_name, mime_type, size_bytes, storage_provider, storage_path, public_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [originalname, mimetype, size, provider, full, url]
    );

    res.json({ ok:true, id:r.insertId, url, name:originalname, size_bytes:size, mime_type:mimetype, storage_path: full });
  } catch (e) {
    console.error('Upload error:', e);
    res.status(500).json({ message: 'Error subiendo archivo' });
  }
};

exports.remove = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ message: 'ID inválido' });

  try {
    const [[row]] = await promisePool.query('SELECT storage_path, storage_provider FROM archivos WHERE id=?', [id]);
    if (!row) return res.status(404).json({ message: 'No encontrado' });

    if (row.storage_provider === 'namecheap_sftp') await deleteSFTP(row.storage_path);
    else                                           await deleteFTPS(row.storage_path);

    await promisePool.query('DELETE FROM archivos WHERE id=?', [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error('Delete error:', e);
    res.status(500).json({ message: 'Error eliminando archivo' });
  }
};
