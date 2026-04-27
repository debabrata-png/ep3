import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Paper, Autocomplete, Grid, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';

const PRApproverConfigds = () => {
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        approvername: '', approveruserid: '', level: ''
    });

    // Lists
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchData();
        fetchUsers();
    }, []);

    const fetchData = async () => {
        try {
            const res = await ep1.get(`/api/v2/getprapprovers2?colid=${global1.colid}`);
            setData((res.data.data || []).map(i => ({ ...i, id: i._id })));
        } catch (e) { console.error(e); }
    };

    const fetchUsers = async () => {
        try {
            const res = await ep1.post('/api/v2/getallusers', { colid: global1.colid });
            setUsers(res.data.data || []);
        } catch (e) { console.error(e); }
    };

    const handleSave = async () => {
        const payload = {
            ...formData,
            colid: global1.colid,
            level: Number(formData.level)
        };
        try {
            const res = await ep1.post('/api/v2/addprapprover2', payload);
            if (res.data.success) {
                setOpen(false);
                fetchData();
                setFormData({ approvername: '', approveruserid: '', level: '' });
                setSelectedUser(null);
            } else {
                alert(res.data.message || "Error saving approver");
            }
        } catch (e) {
            console.error(e);
            alert(e.response?.data?.message || "Error saving approver");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this PR approver?')) {
            await ep1.get(`/api/v2/deleteprapprover2?id=${id}`);
            fetchData();
        }
    };

    const handleUserSelect = (event, value) => {
        setSelectedUser(value);
        if (value) {
            setFormData({ ...formData, approvername: value.name, approveruserid: value.email });
        }
    };

    const columns = [
        { field: 'level', headerName: 'Approval Level', width: 150, align: 'center', headerAlign: 'center', renderCell: (p) => <Chip label={`Level ${p.value}`} color="primary" variant="outlined" /> },
        { field: 'approvername', headerName: 'Approver Name', width: 250 },
        { field: 'approveruserid', headerName: 'Approver ID / Email', width: 300 },
        {
            field: 'actions', headerName: 'Actions', width: 150, renderCell: (p) => (
                <Box>
                    <Button size="small" color="error" onClick={() => handleDelete(p.row.id)}>Delete</Button>
                </Box>
            )
        }
    ];

    return (
        <Box p={3}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>PR Approval Workflow Configuration</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Define sequential levels for Store Indent approvals.
            </Typography>

            <Button variant="contained" onClick={() => {
                setOpen(true);
                setSelectedUser(null);
                setFormData({ approvername: '', approveruserid: '', level: '' });
            }}>Add Approver Level</Button>

            <Paper sx={{ height: 500, mt: 3 }} elevation={3}>
                <DataGrid rows={data} columns={columns} disableSelectionOnClick />
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Add Indent Approver Level</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle2" gutterBottom color="primary">Approver Selection</Typography>
                    <Autocomplete
                        options={users}
                        getOptionLabel={(option) => `${option.name} (${option.email})`}
                        value={selectedUser}
                        onChange={handleUserSelect}
                        renderInput={(params) => <TextField {...params} label="Search User" margin="normal" fullWidth />}
                        isOptionEqualToValue={(option, value) => option.email === value.email}
                    />

                    <Box mt={3}>
                        <Typography variant="subtitle2" gutterBottom color="primary">Workflow Configuration</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Approval Level (e.g., 1 for Level 1, 2 for Level 2)"
                                    fullWidth margin="normal"
                                    value={formData.level}
                                    type="number"
                                    onChange={e => setFormData({ ...formData, level: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" disabled={!formData.level || !formData.approveruserid}>Save Configuration</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PRApproverConfigds;
