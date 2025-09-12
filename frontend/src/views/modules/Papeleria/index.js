import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import {
    Box,
    Button,
    Dialog, DialogActions, DialogContent, DialogTitle,
    IconButton,
    LinearProgress,
    TextField,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
// import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { getClientes } from "../../../services/modules/Clientes";
import {
    getPapeleria,
    subirDocumento,
    eliminarDocumentoPapeleria,
    updatePapeleriaItem,
} from "../../../services/modules/Papeleria";

const Papeleria = () => {
    const [clientes, setClientes] = useState([]);
    const [papeleria, setPapeleria] = useState([]);
    const [loading, setLoading] = useState(true);

    const [openPapeleriaModal, setOpenPapeleriaModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);

    const [selectedCliente, setSelectedCliente] = useState(null);
    const [editRow, setEditRow] = useState(null);
    const [editData, setEditData] = useState({
        fecha_vencimiento: "",
        file: null,
    });

    useEffect(() => { fetchClientes(); }, []);

    const fetchClientes = async () => {
        try {
            const data = await getClientes();
            setClientes(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Error cargando clientes:", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchPapeleria = async (id_cliente) => {
        try {
            const data = await getPapeleria(id_cliente);
            setPapeleria(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Error cargando papelería:", e);
        }
    };

    const handleOpenPapeleriaModal = (cliente) => {
        setSelectedCliente(cliente);
        fetchPapeleria(cliente.id_cliente);
        setOpenPapeleriaModal(true);
    };

    const handleClosePapeleriaModal = () => {
        setOpenPapeleriaModal(false);
        setPapeleria([]);
        setSelectedCliente(null);
    };

    const handleOpenEditModal = (row) => {
        setEditRow(row);
        setEditData({
            fecha_vencimiento: row.fecha_vencimiento || "",
            file: null,
        });
        setOpenEditModal(true);
    };

    const handleCloseEditModal = () => {
        setOpenEditModal(false);
        setEditRow(null);
        setEditData({ fecha_vencimiento: "", file: null });
    };

    /* const handleDownload = async (urlOrRelative, suggestedName) => {

        console.log(suggestedName)
        if (!urlOrRelative) return alert("No existe documento.");

        const API = process.env.REACT_APP_API_URL;

        // Verificar si es URL absoluta o relativa
        const isAbsolute = /^https?:\/\//i.test(urlOrRelative);
        const clean = urlOrRelative.startsWith("/") ? urlOrRelative : `/${urlOrRelative}`;
        const fullUrl = isAbsolute ? urlOrRelative : `${API}${clean}`;

        try {
            // Pedir el archivo como blob
            const response = await fetch(fullUrl);
            if (!response.ok) throw new Error("No se pudo descargar el archivo.");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Crear enlace invisible con download forzado
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", suggestedName || "archivo_descargado");
            document.body.appendChild(link);
            link.click();

            // limpiar
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error descargando archivo:", err);
            alert("Error al descargar archivo");
        }
    };
*/
    const handleDeleteItem = async (row) => {
        if (!window.confirm("¿Eliminar este documento?")) return;
        try {
            await eliminarDocumentoPapeleria(row.id_papeleria);
            await fetchPapeleria(selectedCliente.id_cliente);
        } catch (e) {
            console.error(e);
            alert("Error al eliminar.");
        }
    };

    const handleSaveEdit = async () => {
        try {
            if (!selectedCliente || !editRow) return;

            if (editData.file) {
                console.log(selectedCliente, "clieeeeeeeente")
                // Reemplaza archivo (borra anterior si existía) + actualiza metadatos
                console.log(editData.nombre_documento, selectedCliente.nombre, selectedCliente.dpi, editRow.tipo_documento)
                await subirDocumento({

                    id_cliente: selectedCliente.id_cliente,
                    id_tipo_doc: editRow.id_tipo_doc,
                    nombre_documento: editRow.tipo_documento + "_" + selectedCliente.dpi + "_" + selectedCliente.nombre || editRow.tipo_documento,
                    fecha_vencimiento: editData.fecha_vencimiento || null,
                    file: editData.file,
                });
            } else {
                // Solo metadatos
                await updatePapeleriaItem(editRow.id_papeleria, {
                    nombre_documento: editRow.nombre_documento || editRow.tipo_documento,
                    fecha_vencimiento: editData.fecha_vencimiento || null,
                });
            }

            alert("Documento actualizado.");
            await fetchPapeleria(selectedCliente.id_cliente);
            handleCloseEditModal();
        } catch (e) {
            console.error(e);
            alert("Error al actualizar documento.");
        }
    };

    const calcularBadge = (row) => {
        if (!row.documento_url) return { txt: "No cargado", color: "red" };
        if (!row.fecha_vencimiento) return { txt: "Vigente", color: "green" };
        const hoy = new Date();
        const fv = new Date(row.fecha_vencimiento);
        return fv >= hoy ? { txt: "Vigente", color: "green" } : { txt: "Vencido", color: "red" };
    };

    const papeleriaColumns = [
        { name: "Tipo", selector: (row) => row.tipo_documento || row.nombre_documento, sortable: true },
        { name: "Nombre", selector: (row) => row.nombre_documento || "-", sortable: true },
        { name: "Vigencia", selector: (row) => row.fecha_vencimiento || "", sortable: true },
        {
            name: "Estado",
            cell: (row) => {
                const badge = calcularBadge(row);
                return (
                    <Box display="flex" alignItems="center" gap={1}>
                        <LinearProgress
                            variant="determinate"
                            value={100}
                            sx={{
                                width: 100, height: 8, bgcolor: "lightgray",
                                "& .MuiLinearProgress-bar": { bgcolor: badge.color }
                            }}
                        />
                        <span style={{ color: badge.color }}>{badge.txt}</span>
                    </Box>
                );
            },
        },
        {
            name: "Acciones",
            cell: (row) => (
                <Box display="flex" gap={1}>
                    {/*
                  <IconButton
                        color="primary"
                        onClick={() => handleDownload(row.documento_url, row.nombre_documento)}
                    >
                        <DownloadIcon />
                    </IconButton>  */


                    }  <a href={`${row.documento_url}`} target="_blank" rel="noopener noreferrer" download>
                        Descargar
                    </a>


                    <IconButton color="secondary" onClick={() => handleOpenEditModal(row)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteItem(row)}>
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ),
        },
    ];

    if (loading) return <p>Cargando...</p>;

    return (
        <div style={{ padding: 20 }}>
            <h1>Clientes</h1>

            <DataTable
                title="Lista de Clientes"
                columns={[
                    { name: "Nombre", selector: (row) => row.nombre, sortable: true },
                    { name: "DPI", selector: (row) => row.dpi || "", sortable: true },
                    {
                        name: "Papelería",
                        cell: (row) => (
                            <IconButton onClick={() => handleOpenPapeleriaModal(row)}>
                                <VisibilityIcon />
                            </IconButton>
                        ),
                    },
                ]}
                data={clientes}
                pagination
            />

            {/* Modal papelería por cliente */}
            <Dialog open={openPapeleriaModal} onClose={handleClosePapeleriaModal} maxWidth="lg" fullWidth>
                <DialogTitle>
                    Papelería de {selectedCliente?.nombre}
                </DialogTitle>
                <DialogContent>
                    <DataTable title="Papelería" columns={papeleriaColumns} data={papeleria} pagination />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePapeleriaModal} color="secondary">Cerrar</Button>
                </DialogActions>
            </Dialog>

            {/* Modal editar/actualizar */}
            <Dialog open={openEditModal} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
                <DialogTitle>Actualizar documento</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Fecha de vencimiento"
                        type="date"
                        fullWidth
                        margin="normal"
                        value={editData.fecha_vencimiento}
                        onChange={(e) => setEditData((p) => ({ ...p, fecha_vencimiento: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                    />
                    <div style={{ marginTop: 12 }}>
                        <input
                            type="file"
                            id="file-edit-upload"
                            style={{ display: "none" }}
                            onChange={(e) => setEditData((p) => ({ ...p, file: e.target.files?.[0] || null }))}
                        />
                        <label htmlFor="file-edit-upload">
                            <Button variant="contained" component="span">Seleccionar archivo</Button>
                        </label>
                        {editData.file && <p>Seleccionado: {editData.file.name}</p>}
                    </div>
                    <p style={{ fontSize: 12, color: "#666" }}>
                        * Si no seleccionas archivo, se actualiza solo la fecha.
                    </p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditModal} color="secondary">Cancelar</Button>
                    <Button onClick={handleSaveEdit} color="primary">Guardar cambios</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Papeleria;
