import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Paper, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';

const BudgetGroupds = () => {
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ groupname: '', category: '' });
    const [itemCategories, setItemCategories] = useState([]);

    useEffect(() => {
        fetchData();
        fetchItemCategories();
    }, []);

    const fetchData = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallbudgetgroupds?colid=${global1.colid}`);
            setData(res.data.data.items.map(i => ({ ...i, id: i._id })));
        } catch (e) { console.error(e); }
    };

    const fetchItemCategories = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallitemcategoryds2?colid=${global1.colid}`);
            setItemCategories(res.data.data.items);
        } catch (e) { console.error(e); }
    };

    const handleSave = async () => {
        const payload = { 
            ...formData, 
            colid: global1.colid, 
            user: global1.user, 
            name: global1.name,
            username: global1.name,
            useremail: global1.user
        };
        try {
            if (editId) await ep1.post(`/api/v2/updatebudgetgroupds?id=${editId}`, payload);
            else await ep1.post('/api/v2/addbudgetgroupds', payload);
            setOpen(false); fetchData(); setFormData({ groupname: '', category: '' }); setEditId(null);
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this budget group mapping?')) {
            await ep1.get(`/api/v2/deletebudgetgroupds?id=${id}&username=${global1.name}&useremail=${global1.user}`);
            fetchData();
        }
    };

    const columns = [
        { field: 'groupname', headerName: 'Group Name', width: 250 },
        { field: 'category', headerName: 'Category', width: 250 },
        {
            field: 'actions', headerName: 'Actions', width: 200, renderCell: (p) => (
                <Box>
                    <Button size="small" onClick={() => {
                        setEditId(p.row.id);
                        setFormData({ groupname: p.row.groupname, category: p.row.category });
                        setOpen(true);
                    }}>Edit</Button>
                    <Button size="small" color="error" onClick={() => handleDelete(p.row.id)}>Delete</Button>
                </Box>
            )
        }
    ];

    return (
        <Box p={3}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>Budget Group Configuration</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Map categories to specific budget groups for aggregated tracking.
            </Typography>
            <Button variant="contained" onClick={() => { setOpen(true); setEditId(null); setFormData({ groupname: '', category: '' }) }}>
                Add New Mapping
            </Button>
            <Paper sx={{ height: 500, mt: 2 }} elevation={2}>
                <DataGrid rows={data} columns={columns} />
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editId ? 'Edit' : 'Add'} Budget Group Mapping</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Group Name"
                        fullWidth
                        margin="normal"
                        value={formData.groupname}
                        onChange={e => setFormData({ ...formData, groupname: e.target.value })}
                        placeholder="e.g. Administrative, Academic, Infrastructure"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={formData.category}
                            label="Category"
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            {itemCategories.map(c => (
                                <MenuItem key={c._id} value={c.categoryname || c.name}>
                                    {c.categoryname || c.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" disabled={!formData.groupname || !formData.category}>
                        Save Mapping
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BudgetGroupds;
