import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
    Typography,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    IconButton,
    Breadcrumbs,
    Link,
    Card,
    CardContent
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Home as HomeIcon } from '@mui/icons-material';
import ep1 from '../api/ep1';
import global1 from './global1';

const VendorsMasterds2 = () => {
    const [vendors, setVendors] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [formData, setFormData] = useState({
        vendorname: '',
        email: '',
        mobileno: '',
        address: '',
        city: '',
        state: '',
        gst: '',
        pan: '',
        type: ''
    });

    const fetchVendors = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallvendords2?colid=${global1.colid}`);
            if (res.data.success) {
                setVendors(res.data.data.map(v => ({ ...v, id: v._id })));
            }
        } catch (error) {
            console.error('Error fetching vendors:', error);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const handleOpenAdd = () => {
        setEditMode(false);
        setFormData({
            vendorname: '',
            email: '',
            mobileno: '',
            address: '',
            city: '',
            state: '',
            gst: '',
            pan: '',
            type: ''
        });
        setOpenModal(true);
    };

    const handleOpenEdit = (vendor) => {
        setEditMode(true);
        setSelectedVendor(vendor);
        setFormData({
            vendorname: vendor.vendorname || '',
            email: vendor.email || '',
            mobileno: vendor.mobileno || '',
            address: vendor.address || '',
            city: vendor.city || '',
            state: vendor.state || '',
            gst: vendor.gst || '',
            pan: vendor.pan || '',
            type: vendor.type || ''
        });
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedVendor(null);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            if (editMode) {
                await ep1.post(`/api/v2/updatevendords2?id=${selectedVendor._id}`, {
                    ...formData,
                    colid: global1.colid,
                    user: global1.user,
                    name: global1.name || global1.user
                });
                alert('Vendor updated successfully');
            } else {
                await ep1.post('/api/v2/addvendords2', {
                    ...formData,
                    colid: global1.colid,
                    user: global1.user,
                    name: global1.name || global1.user
                });
                alert('Vendor added successfully');
            }
            handleCloseModal();
            fetchVendors();
        } catch (error) {
            console.error('Error saving vendor:', error);
            alert('Failed to save vendor');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this vendor?')) {
            try {
                await ep1.get(`/api/v2/deletevendords2?id=${id}`);
                alert('Vendor deleted successfully');
                fetchVendors();
            } catch (error) {
                console.error('Error deleting vendor:', error);
                alert('Failed to delete vendor');
            }
        }
    };

    const columns = [
        { field: 'vendorname', headerName: 'Vendor Name', width: 200 },
        { field: 'email', headerName: 'Email', width: 200 },
        { field: 'mobileno', headerName: 'Phone', width: 130 },
        { field: 'gst', headerName: 'GST', width: 130 },
        { field: 'city', headerName: 'City', width: 120 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <Box>
                    <IconButton size="small" color="primary" onClick={() => handleOpenEdit(params.row)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(params.row._id)}>
                        <DeleteIcon />
                    </IconButton>
                </Box>
            )
        }
    ];

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box mb={3}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <Typography color="text.primary">Vendors Master</Typography>
                </Breadcrumbs>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" fontWeight="bold" color="primary">
                        Vendors Master
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenAdd}
                        sx={{ borderRadius: 2 }}
                    >
                        Add Vendor
                    </Button>
                </Box>
            </Box>

            <Card sx={{ borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
                <CardContent>
                    <Box sx={{ height: 600, width: '100%' }}>
                        <DataGrid
                            rows={vendors}
                            columns={columns}
                            pageSizeOptions={[10, 25, 50]}
                            disableRowSelectionOnClick
                            autoHeight
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-cell:focus': { outline: 'none' },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: '#f8f9fa',
                                    borderBottom: '1px solid #eee',
                                    fontWeight: 'bold'
                                }
                            }}
                        />
                    </Box>
                </CardContent>
            </Card>

            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
                <DialogTitle>{editMode ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Vendor Name"
                                name="vendorname"
                                value={formData.vendorname}
                                onChange={handleInputChange}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Mobile No"
                                name="mobileno"
                                value={formData.mobileno}
                                onChange={handleInputChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="GST Number"
                                name="gst"
                                value={formData.gst}
                                onChange={handleInputChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="PAN Number"
                                name="pan"
                                value={formData.pan}
                                onChange={handleInputChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Vendor Type"
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                fullWidth
                                placeholder="e.g. Local, Regular"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                fullWidth
                                multiline
                                rows={2}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="City"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="State"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseModal} color="inherit">Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {editMode ? 'Update Vendor' : 'Save Vendor'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default VendorsMasterds2;
