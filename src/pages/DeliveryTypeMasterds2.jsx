import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, TextField, Grid, Dialog, DialogTitle,
    DialogContent, DialogActions, IconButton, Switch, FormControlLabel
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ep1 from '../api/ep1';
import global1 from './global1';

const DeliveryTypeMasterds2 = () => {
    const [deliveryTypes, setDeliveryTypes] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', isDefault: false });
    const [loading, setLoading] = useState(false);

    const fetchTypes = async () => {
        setLoading(true);
        try {
            const res = await ep1.get(`/api/v2/getalldeliverytypeds2?colid=${global1.colid}`);
            const types = res.data.data.deliveryTypes || [];
            setDeliveryTypes(types.map(t => ({ ...t, id: t._id })));
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { fetchTypes(); }, []);

    const handleOpenNew = () => {
        setEditId(null);
        setForm({ name: '', description: '', isDefault: false });
        setOpenDialog(true);
    };

    const handleOpenEdit = (row) => {
        setEditId(row._id);
        setForm({ name: row.name, description: row.description || '', isDefault: row.isDefault || false });
        setOpenDialog(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) return alert('Name is required');
        try {
            if (editId) {
                await ep1.post(`/api/v2/updatedeliverytypeds2?id=${editId}`, form);
            } else {
                await ep1.post('/api/v2/adddeliverytypeds2', { ...form, colid: global1.colid, user: global1.user });
            }
            setOpenDialog(false);
            fetchTypes();
        } catch (e) {
            alert('Failed to save: ' + (e.response?.data?.message || e.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this delivery type?')) return;
        try {
            await ep1.get(`/api/v2/deletedeliverytypeds2?id=${id}`);
            fetchTypes();
        } catch (e) { alert('Failed to delete'); }
    };

    const columns = [
        { field: 'name', headerName: 'Delivery Type', flex: 1 },
        { field: 'description', headerName: 'Description', flex: 2 },
        {
            field: 'isDefault', headerName: 'Default', width: 100,
            renderCell: (params) => params.value ? '⭐ Yes' : 'No'
        },
        {
            field: 'actions', headerName: 'Actions', width: 130,
            renderCell: (params) => (
                <Box>
                    <IconButton onClick={() => handleOpenEdit(params.row)} size="small"><EditIcon fontSize="small" /></IconButton>
                    <IconButton onClick={() => handleDelete(params.row._id)} size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
                </Box>
            )
        }
    ];

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" fontWeight={600}>Delivery Type Master</Typography>
                <Button variant="contained" onClick={handleOpenNew}>+ Add Delivery Type</Button>
            </Box>
            <Paper sx={{ height: 500, width: '100%' }}>
                <DataGrid rows={deliveryTypes} columns={columns} loading={loading} pageSizeOptions={[10, 25]} />
            </Paper>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editId ? 'Edit Delivery Type' : 'Add Delivery Type'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Description" multiline rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Switch checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />}
                                label="Set as default delivery type"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DeliveryTypeMasterds2;
