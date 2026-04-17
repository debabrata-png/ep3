import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Paper, FormControlLabel, Checkbox, Autocomplete, Chip, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';

const BudgetApproverds = () => {
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ 
        approvername: '', approveremail: '', levelofapproval: '', 
        iscreateaccess: false, iseditaccess: false, isdeleteaccess: false, 
        status: 'Active', remarks: '', approvaltype: 'Global', department: '' 
    });

    // Lists
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => { 
        fetchData(); 
        fetchUsers(); 
        fetchDepartments();
    }, []);

    const fetchData = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallbudgetapproverds?colid=${global1.colid}`);
            setData(res.data.data.items.map(i => ({ ...i, id: i._id })));
        } catch (e) { console.error(e); }
    };

    const fetchUsers = async () => {
        try {
            const res = await ep1.post('/api/v2/getallusers', { colid: global1.colid });
            setUsers(res.data.data || []);
        } catch (e) { console.error(e); }
    };

    const fetchDepartments = async () => {
        try {
            const res = await ep1.post('/api/v2/getdepartmentindentds', { colid: global1.colid });
            setDepartments(res.data.data || []);
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
            if (editId) await ep1.post(`/api/v2/updatebudgetapproverds?id=${editId}`, payload);
            else await ep1.post('/api/v2/addbudgetapproverds', payload);
            setOpen(false); fetchData();
            setFormData({ 
                approvername: '', approveremail: '', levelofapproval: '', 
                iscreateaccess: false, iseditaccess: false, isdeleteaccess: false, 
                status: 'Active', remarks: '', approvaltype: 'Global', department: '' 
            });
            setEditId(null); setSelectedUser(null);
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this approver?')) {
            await ep1.get(`/api/v2/deletebudgetapproverds?id=${id}&username=${global1.name}&useremail=${global1.user}`);
            fetchData();
        }
    };

    const handleUserSelect = (event, value) => {
        setSelectedUser(value);
        if (value) {
            setFormData({ ...formData, approvername: value.name, approveremail: value.email });
        }
    };

    const columns = [
        { field: 'approvername', headerName: 'Approver Name', width: 180 },
        { field: 'approveremail', headerName: 'Approver Email', width: 220 },
        { field: 'approvaltype', headerName: 'Type', width: 100, renderCell: (p) => <Chip label={p.value || 'Global'} size="small" color={p.value === 'Department' ? 'secondary' : 'primary'} /> },
        { field: 'department', headerName: 'Department', width: 150 },
        { field: 'levelofapproval', headerName: 'Level', width: 80, align: 'center', headerAlign: 'center' },
        { field: 'iscreateaccess', headerName: 'Create', width: 80, renderCell: (p) => p.value ? 'Yes' : 'No' },
        { field: 'iseditaccess', headerName: 'Edit', width: 80, renderCell: (p) => p.value ? 'Yes' : 'No' },
        { field: 'isdeleteaccess', headerName: 'Delete', width: 80, renderCell: (p) => p.value ? 'Yes' : 'No' },
        { field: 'status', headerName: 'Status', width: 80 },
        {
            field: 'actions', headerName: 'Actions', width: 150, renderCell: (p) => (
                <Box>
                    <Button size="small" onClick={() => {
                        setEditId(p.row.id);
                        setFormData({
                            approvername: p.row.approvername || '', approveremail: p.row.approveremail || '',
                            levelofapproval: p.row.levelofapproval || '', iscreateaccess: p.row.iscreateaccess || false, iseditaccess: p.row.iseditaccess || false,
                            isdeleteaccess: p.row.isdeleteaccess || false, status: p.row.status || 'Active', remarks: p.row.remarks || '',
                            approvaltype: p.row.approvaltype || 'Global', department: p.row.department || ''
                        });
                        // Find and set matching user for Autocomplete
                        const matchingUser = users.find(u => u.email === p.row.approveremail);
                        setSelectedUser(matchingUser || null);
                        setOpen(true);
                    }}>Edit</Button>
                    <Button size="small" color="error" onClick={() => handleDelete(p.row.id)}>Delete</Button>
                </Box>
            )
        }
    ];

    return (
        <Box p={3}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>Budget Approver Configuration</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Configure multi-level approval workflows globally or for specific departments.
            </Typography>
            <Button variant="contained" onClick={() => {
                setOpen(true); setEditId(null); setSelectedUser(null);
                setFormData({ 
                    approvername: '', approveremail: '', levelofapproval: '', 
                    iscreateaccess: false, iseditaccess: false, isdeleteaccess: false, 
                    status: 'Active', remarks: '', approvaltype: 'Global', department: '' 
                });
            }}>Add Approver</Button>
            <Paper sx={{ height: 600, mt: 2 }} elevation={3}><DataGrid rows={data} columns={columns} /></Paper>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>{editId ? 'Edit' : 'Add'} Budget Approver</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle2" gutterBottom color="primary">Approver Identity</Typography>
                    <Autocomplete
                        options={users}
                        getOptionLabel={(option) => `${option.name} (${option.email})`}
                        value={selectedUser}
                        onChange={handleUserSelect}
                        filterOptions={(options, { inputValue }) => {
                            const lower = inputValue.toLowerCase();
                            return options.filter(o =>
                                (o.name && o.name.toLowerCase().includes(lower)) ||
                                (o.email && o.email.toLowerCase().includes(lower))
                            );
                        }}
                        renderInput={(params) => <TextField {...params} label="Search User (by name or email)" margin="normal" fullWidth />}
                        isOptionEqualToValue={(option, value) => option.email === value.email}
                        sx={{ mt: 1 }}
                    />
                    
                    <Box mt={3}>
                        <Typography variant="subtitle2" gutterBottom color="primary">Workflow Settings</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Approval Type</InputLabel>
                                    <Select
                                        value={formData.approvaltype}
                                        label="Approval Type"
                                        onChange={e => setFormData({ ...formData, approvaltype: e.target.value })}
                                    >
                                        <MenuItem value="Global">Global</MenuItem>
                                        <MenuItem value="Department">Department-wise</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField 
                                    label="Approval Level (1, 2...)" 
                                    fullWidth margin="normal" 
                                    value={formData.levelofapproval} 
                                    type="number"
                                    onChange={e => setFormData({ ...formData, levelofapproval: e.target.value })} 
                                />
                            </Grid>
                        </Grid>

                        {formData.approvaltype === 'Department' && (
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Assign to Department</InputLabel>
                                <Select
                                    value={formData.department}
                                    label="Assign to Department"
                                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                                >
                                    {departments.map(d => (
                                        <MenuItem key={d._id} value={d.departmentname}>{d.departmentname}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </Box>

                    <Box mt={3}>
                        <Typography variant="subtitle2" gutterBottom color="primary">Access & Permissions</Typography>
                        <Box sx={{ bgcolor: '#f8fafc', p: 1, borderRadius: 1, mt: 1 }}>
                            <FormControlLabel 
                                control={<Checkbox checked={formData.iscreateaccess} onChange={e => setFormData({ ...formData, iscreateaccess: e.target.checked })} />} 
                                label="Create Access (Add categories during approval)" 
                            />
                            <FormControlLabel 
                                control={<Checkbox checked={formData.iseditaccess} onChange={e => setFormData({ ...formData, iseditaccess: e.target.checked })} />} 
                                label="Edit Access (Modify amounts)" 
                            />
                            <FormControlLabel 
                                control={<Checkbox checked={formData.isdeleteaccess} onChange={e => setFormData({ ...formData, isdeleteaccess: e.target.checked })} />} 
                                label="Delete Access (Remove categories)" 
                            />
                        </Box>
                    </Box>

                    <TextField label="Status" fullWidth margin="normal" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} sx={{ mt: 3 }} />
                    <TextField label="Remarks" fullWidth margin="normal" value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value })} />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpen(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" sx={{ fontWeight: 700, px: 4 }}>Save Approver</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
export default BudgetApproverds;

