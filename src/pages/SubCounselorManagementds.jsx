import React, { useState, useEffect } from 'react';
import {
    Container, Box, Typography, Button, TextField, Dialog, DialogTitle,
    DialogContent, DialogActions, Paper, IconButton, Grid, Autocomplete, CircularProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import axios from 'axios';
import ep1 from '../api/ep1';
import global1 from './global1';

const SubCounselorManagementds = () => {
    const [mappings, setMappings] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [formData, setFormData] = useState({
        counsellorname: '',
        counselloremail: '',
        subcounsellorname: '',
        subcounselloremail: '',
        status: 'active'
    });
    const [searchText, setSearchText] = useState('');

    const colid = localStorage.getItem('colid') || global1.colid;

    useEffect(() => {
        fetchMappings();
        fetchUsers();
    }, []);

    const fetchMappings = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallsubcounsellords?colid=${colid}`);
            if (res.data.success) {
                setMappings(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching mappings:', err);
        }
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const res = await ep1.post(`/api/v2/getallusers`, { colid: Number(colid) });
            if (res.data.status === 'success') {
                setUsers(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleOpen = (data = null) => {
        if (data) {
            setEditData(data);
            setFormData({
                counsellorname: data.counsellorname,
                counselloremail: data.counselloremail,
                subcounsellorname: data.subcounsellorname,
                subcounselloremail: data.subcounselloremail,
                status: data.status || 'active'
            });
        } else {
            setEditData(null);
            setFormData({
                counsellorname: '',
                counselloremail: '',
                subcounsellorname: '',
                subcounselloremail: '',
                status: 'active'
            });
        }
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                ...formData,
                colid: Number(colid),
                user: global1.user,
                name: global1.name
            };

            if (editData) {
                await ep1.post(`/api/v2/updatesubcounsellords`, {
                    id: editData._id,
                    ...payload
                });
            } else {
                await ep1.post(`/api/v2/createsubcounsellords`, payload);
            }
            handleClose();
            fetchMappings();
        } catch (err) {
            console.error('Error saving mapping:', err);
        }
    };


    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this mapping?')) {
            try {
                await ep1.delete(`/api/v2/deletesubcounsellords/${id}`);
                fetchMappings();
            } catch (err) {
                console.error('Error deleting mapping:', err);
            }
        }
    };


    const columns = [
        { field: 'counsellorname', headerName: 'Counselor Name', width: 200 },
        { field: 'counselloremail', headerName: 'Counselor Email', width: 250 },
        { field: 'subcounsellorname', headerName: 'Sub-Counselor Name', width: 200 },
        { field: 'subcounselloremail', headerName: 'Sub-Counselor Email', width: 250 },
        { field: 'status', headerName: 'Status', width: 120 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <Box>
                    <IconButton onClick={() => handleOpen(params.row)} color="primary">
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(params.row._id)} color="error">
                        <DeleteIcon />
                    </IconButton>
                </Box>
            )
        }
    ];

    const filteredRows = mappings.filter((row) => {
        const searchLower = searchText.toLowerCase();
        return (
            row.counselloremail?.toLowerCase().includes(searchLower) ||
            row.subcounsellorname?.toLowerCase().includes(searchLower) ||
            row.counsellorname?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold">Sub-Counselor Management</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    Add Mapping
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search by Counselor Email or Sub-Counselor Name..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                />
            </Paper>

            <Paper sx={{ height: 500, width: '100%' }}>
                <DataGrid
                    rows={filteredRows}
                    getRowId={(row) => row._id}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 20, 50]}
                    disableSelectionOnClick
                />
            </Paper>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>{editData ? 'Edit Mapping' : 'Add New Mapping'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <Autocomplete
                                options={users}
                                getOptionLabel={(option) => `${option.name} (${option.email})`}
                                value={users.find(u => u.email === formData.counselloremail) || null}
                                onChange={(event, newValue) => {
                                    setFormData({
                                        ...formData,
                                        counsellorname: newValue ? newValue.name : '',
                                        counselloremail: newValue ? newValue.email : ''
                                    });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Counselor"
                                        variant="outlined"
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <React.Fragment>
                                                    {loadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </React.Fragment>
                                            ),
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Autocomplete
                                options={users}
                                getOptionLabel={(option) => `${option.name} (${option.email})`}
                                value={users.find(u => u.email === formData.subcounselloremail) || null}
                                onChange={(event, newValue) => {
                                    setFormData({
                                        ...formData,
                                        subcounsellorname: newValue ? newValue.name : '',
                                        subcounselloremail: newValue ? newValue.email : ''
                                    });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Sub-Counselor"
                                        variant="outlined"
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <React.Fragment>
                                                    {loadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </React.Fragment>
                                            ),
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth label="Status" name="status"
                                value={formData.status} onChange={handleChange}
                                select
                                SelectProps={{ native: true }}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {editData ? 'Update' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default SubCounselorManagementds;

