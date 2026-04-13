import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Paper, MenuItem, FormControlLabel, Checkbox, Grid } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';
import * as XLSX from 'xlsx';
import { CloudUpload, Download, SaveAlt } from '@mui/icons-material';
import { LinearProgress } from '@mui/material';

const VendorPaySchdsds = () => {
    const [data, setData] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        vendorid: '',
        vendorname: '',
        isadvance: 'No',
        isdeliverylinked: 'No',
        deliverytype: 'Offline',
        paymenttype: 'Cash',
        paymentdesc: '',
        deliverydesc: '',
        status: 'Active'
    });
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        fetchData();
        fetchVendors();
    }, []);

    const fetchData = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallvendorpayschds?colid=${global1.colid}`);
            if (res.data && res.data.data && res.data.data.results) {
                setData(res.data.data.results.map(i => ({ ...i, id: i._id })));
            }
        } catch (e) {
            console.error('Error fetching data:', e);
        }
    };

    const fetchVendors = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallvendords2?colid=${global1.colid}`);
            if (res.data && res.data.data && res.data.data.vendors) {
                setVendors(res.data.data.vendors);
            }
        } catch (e) {
            console.error('Error fetching vendors:', e);
        }
    };

    const handleSave = async () => {
        const payload = {
            ...formData,
            name: global1.name,
            colid: global1.colid,
            user: global1.user
        };
        try {
            if (editId) {
                await ep1.post(`/api/v2/updatevendorpayschds?id=${editId}`, payload);
            } else {
                await ep1.post('/api/v2/addvendorpayschds', payload);
            }
            setOpen(false);
            fetchData();
            resetForm();
        } catch (e) {
            console.error('Error saving data:', e);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this payment schedule?')) {
            try {
                await ep1.get(`/api/v2/deletevendorpayschds?id=${id}`);
                fetchData();
            } catch (e) {
                console.error('Error deleting data:', e);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            vendorid: '',
            vendorname: '',
            isadvance: 'No',
            isdeliverylinked: 'No',
            deliverytype: 'Offline',
            paymenttype: 'Cash',
            paymentdesc: '',
            deliverydesc: '',
            status: 'Active'
        });
        setEditId(null);
    };

    const handleVendorChange = (e) => {
        const vendorId = e.target.value;
        const vendor = vendors.find(v => v._id === vendorId);
        setFormData({
            ...formData,
            vendorid: vendorId,
            vendorname: vendor ? (vendor.vendorname || vendor.name) : ''
        });
    };

    const downloadTemplate = () => {
        const headers = [['Vendor Name', 'Is Advance (Yes/No)', 'Payment after Delivery (Yes/No)', 'Delivery Type (Online/Offline)', 'Payment Type', 'Description', 'Delivery Description', 'Status (Active/Inactive)']];
        const ws = XLSX.utils.aoa_to_sheet(headers);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Vendor_Payment_Schedule_Template.xlsx");
    };

    const handleBulkUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                setUploading(true);
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    alert("No data found in Excel");
                    setUploading(false);
                    return;
                }

                let successCount = 0;
                for (let i = 0; i < data.length; i++) {
                    const row = data[i];
                    const vendor = vendors.find(v => 
                        (v.vendorname || v.name || '').toString().toLowerCase() === (row['Vendor Name'] || '').toString().toLowerCase()
                    );

                    if (!vendor) {
                        console.warn(`Vendor not found: ${row['Vendor Name']}`);
                        continue;
                    }

                    const payload = {
                        name: global1.name,
                        vendorname: vendor.vendorname || vendor.name,
                        vendorid: vendor._id,
                        isadvance: row['Is Advance (Yes/No)'] || 'No',
                        isdeliverylinked: row['Payment after Delivery (Yes/No)'] || 'No',
                        deliverytype: row['Delivery Type (Online/Offline)'] || 'Offline',
                        paymenttype: row['Payment Type'] || 'Cash',
                        paymentdesc: row['Description'] || '',
                        deliverydesc: row['Delivery Description'] || '',
                        status: row['Status (Active/Inactive)'] || 'Active',
                        colid: global1.colid,
                        user: global1.user
                    };

                    await ep1.post('/api/v2/addvendorpayschds', payload);
                    successCount++;
                    setProgress(Math.round(((i + 1) / data.length) * 100));
                }

                alert(`Bulk Upload Completed: ${successCount} records added.`);
                fetchData();
            } catch (err) {
                console.error("Bulk upload error:", err);
                alert("Error during bulk upload. Check console for details.");
            } finally {
                setUploading(false);
                setProgress(0);
                e.target.value = null;
            }
        };
        reader.readAsBinaryString(file);
    };

    const columns = [
        { field: 'vendorname', headerName: 'Vendor', width: 200 },
        { field: 'isadvance', headerName: 'Advance', width: 100 },
        { field: 'isdeliverylinked', headerName: 'Post Delivery', width: 120 },
        { field: 'deliverytype', headerName: 'Delivery Type', width: 120 },
        { field: 'paymenttype', headerName: 'Payment Mode', width: 150 },
        { field: 'paymentdesc', headerName: 'Description', width: 250 },
        { field: 'status', headerName: 'Status', width: 100 },
        { field: 'name', headerName: 'Created By', width: 150 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 180,
            sortable: false,
            renderCell: (params) => (
                <Box>
                    <Button
                        size="small"
                        onClick={() => {
                            setEditId(params.row.id);
                            setFormData({ ...params.row });
                            setOpen(true);
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        size="small"
                        color="error"
                        onClick={() => handleDelete(params.row.id)}
                    >
                        Delete
                    </Button>
                </Box>
            )
        }
    ];

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="600">Vendor Payment Schedules</Typography>
                <Box display="flex" gap={2}>
                    <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={downloadTemplate}
                    >
                        Template
                    </Button>
                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUpload />}
                        disabled={uploading}
                    >
                        Bulk Upload
                        <input
                            type="file"
                            hidden
                            accept=".xlsx, .xls"
                            onChange={handleBulkUpload}
                        />
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveAlt />}
                        onClick={() => {
                            resetForm();
                            setOpen(true);
                        }}
                    >
                        Add Schedule
                    </Button>
                </Box>
            </Box>

            {uploading && (
                <Box mb={2}>
                    <Typography variant="caption">Uploading... {progress}%</Typography>
                    <LinearProgress variant="determinate" value={progress} />
                </Box>
            )}

            <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={data}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    disableSelectionOnClick
                />
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editId ? 'Edit' : 'Add'} Payment Schedule</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                select
                                label="Vendor"
                                fullWidth
                                required
                                value={formData.vendorid}
                                onChange={handleVendorChange}
                            >
                                {vendors.map((vendor) => (
                                    <MenuItem key={vendor._id} value={vendor._id}>
                                        {vendor.vendorname}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                select
                                label="Is Advance?"
                                fullWidth
                                value={formData.isadvance}
                                onChange={e => setFormData({ ...formData, isadvance: e.target.value })}
                            >
                                <MenuItem value="Yes">Yes</MenuItem>
                                <MenuItem value="No">No</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                select
                                label="Delivery Type"
                                fullWidth
                                value={formData.deliverytype}
                                onChange={e => setFormData({ ...formData, deliverytype: e.target.value })}
                            >
                                <MenuItem value="Online">Online</MenuItem>
                                <MenuItem value="Offline">Offline</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                select
                                label="Payment after Delivery?"
                                fullWidth
                                value={formData.isdeliverylinked}
                                onChange={e => setFormData({ ...formData, isdeliverylinked: e.target.value })}
                            >
                                <MenuItem value="Yes">Yes</MenuItem>
                                <MenuItem value="No">No</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                select
                                label="Payment Mode"
                                fullWidth
                                value={formData.paymenttype}
                                onChange={e => setFormData({ ...formData, paymenttype: e.target.value })}
                            >
                                {['Cash', 'Cheque', 'UPI', 'NFT', 'Net Banking', 'Others'].map(mode => (
                                    <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Payment Description"
                                fullWidth
                                multiline
                                rows={2}
                                value={formData.paymentdesc}
                                onChange={e => setFormData({ ...formData, paymentdesc: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Delivery Description"
                                fullWidth
                                multiline
                                rows={2}
                                value={formData.deliverydesc}
                                onChange={e => setFormData({ ...formData, deliverydesc: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                select
                                label="Status"
                                fullWidth
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Inactive">Inactive</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" color="primary">
                        {editId ? 'Update' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default VendorPaySchdsds;
