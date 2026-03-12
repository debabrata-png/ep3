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
    CardContent,
    Autocomplete
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Home as HomeIcon } from '@mui/icons-material';
import ep1 from '../api/ep1';
import global1 from './global1';

const VendorCatalogds2 = () => {
    const [vendorItems, setVendorItems] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedCatalogItem, setSelectedCatalogItem] = useState(null);
    const [formData, setFormData] = useState({
        vendorid: '',
        vendorname: '',
        itemid: '',
        item: '', // itemname
        price: '',
        gst: '',
        discount: '0',
        status: 'Available',
        type: '',
        category: ''
    });

    const fetchData = async () => {
        try {
            const [viRes, vRes, iRes] = await Promise.all([
                ep1.get(`/api/v2/getallvendoritemds2?colid=${global1.colid}`),
                ep1.get(`/api/v2/getallvendords2?colid=${global1.colid}`),
                ep1.get(`/api/v2/getallstoreitemds2?colid=${global1.colid}`)
            ]);

            if (viRes.data.success) {
                const rawItems = viRes.data.data?.vendorItems || viRes.data.data || [];
                setVendorItems((Array.isArray(rawItems) ? rawItems : []).map(v => ({ ...v, id: v._id })));
            }
            if (vRes.data.success) {
                const rawVendors = vRes.data.data || [];
                setVendors(Array.isArray(rawVendors) ? rawVendors : []);
            }
            if (iRes.data.success) {
                setAllItems((iRes.data.data?.storeItems || iRes.data.data || []).reduce((acc, item) => {
                    if (!acc.find(i => i.itemname === item.itemname)) acc.push(item);
                    return acc;
                }, []));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenAdd = () => {
        setEditMode(false);
        setFormData({
            vendorid: '',
            vendorname: '',
            itemid: '',
            item: '',
            price: '',
            gst: '',
            discount: '0',
            status: 'Available',
            type: '',
            category: ''
        });
        setOpenModal(true);
    };

    const handleOpenEdit = (catalogItem) => {
        setEditMode(true);
        setSelectedCatalogItem(catalogItem);
        setFormData({
            vendorid: catalogItem.vendorid || '',
            vendorname: catalogItem.vendorname || '',
            itemid: catalogItem.itemid || '',
            item: catalogItem.item || '',
            price: catalogItem.price || '',
            gst: catalogItem.gst || '',
            discount: catalogItem.discount || '0',
            status: catalogItem.status || 'Available',
            type: catalogItem.type || '',
            category: catalogItem.category || ''
        });
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedCatalogItem(null);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                ...formData,
                colid: global1.colid,
                user: global1.user,
                name: global1.name || global1.user,
                price: Number(formData.price),
                gst: Number(formData.gst),
                discount: Number(formData.discount),
                total: Number(formData.price) + (Number(formData.price) * Number(formData.gst) / 100)
            };

            if (editMode) {
                await ep1.post(`/api/v2/updatevendoritemds2?id=${selectedCatalogItem._id}`, payload);
                alert('Catalog item updated successfully');
            } else {
                await ep1.post('/api/v2/addvendoritemds2', payload);
                alert('Catalog item added successfully');
            }
            handleCloseModal();
            fetchData();
        } catch (error) {
            console.error('Error saving catalog item:', error);
            alert('Failed to save catalog item');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item from the catalog?')) {
            try {
                await ep1.get(`/api/v2/deletevendoritemds2?id=${id}`);
                alert('Item deleted successfully');
                fetchData();
            } catch (error) {
                console.error('Error deleting item:', error);
                alert('Failed to delete item');
            }
        }
    };

    const columns = [
        { field: 'vendorname', headerName: 'Vendor Name', width: 200 },
        { field: 'item', headerName: 'Item Name', width: 200 },
        { field: 'price', headerName: 'Price (₹)', width: 120 },
        { field: 'gst', headerName: 'GST (%)', width: 100 },
        {
            field: 'total',
            headerName: 'Net Price (₹)',
            width: 130,
            valueGetter: (params) => {
                const row = params.row || params;
                const price = Number(row.price || 0);
                const gst = Number(row.gst || 0);
                return (price + (price * gst / 100)).toFixed(2);
            }
        },
        { field: 'status', headerName: 'Status', width: 120 },
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
                    <Typography color="text.primary">Vendor Item Catalog</Typography>
                </Breadcrumbs>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" fontWeight="bold" color="primary">
                        Vendor Item Catalog
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenAdd}
                        sx={{ borderRadius: 2 }}
                    >
                        Add Item to Catalog
                    </Button>
                </Box>
            </Box>

            <Card sx={{ borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
                <CardContent>
                    <Box sx={{ height: 600, width: '100%' }}>
                        <DataGrid
                            rows={vendorItems}
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
                <DialogTitle>{editMode ? 'Edit Catalog Item' : 'Add Item to Catalog'}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                options={Array.isArray(vendors) ? vendors : []}
                                getOptionLabel={(option) => option.vendorname || ""}
                                value={(Array.isArray(vendors) ? vendors : []).find(v => v._id === formData.vendorid) || null}
                                onChange={(e, newValue) => {
                                    setFormData({ ...formData, vendorid: newValue?._id || '', vendorname: newValue?.vendorname || '' });
                                }}
                                renderInput={(params) => <TextField {...params} label="Select Vendor" required />}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                options={Array.isArray(allItems) ? allItems : []}
                                getOptionLabel={(option) => option.itemname || ""}
                                value={(Array.isArray(allItems) ? allItems : []).find(i => i._id === formData.itemid) || null}
                                onChange={(e, newValue) => {
                                    setFormData({
                                        ...formData,
                                        itemid: newValue?._id || '',
                                        item: newValue?.itemname || '',
                                        category: newValue?.category || '',
                                        type: newValue?.itemtype || ''
                                    });
                                }}
                                renderInput={(params) => <TextField {...params} label="Select Item" required />}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Base Price (₹)"
                                name="price"
                                type="number"
                                value={formData.price}
                                onChange={handleInputChange}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="GST (%)"
                                name="gst"
                                type="number"
                                value={formData.gst}
                                onChange={handleInputChange}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Discount (Optional)"
                                name="discount"
                                type="number"
                                value={formData.discount}
                                onChange={handleInputChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Status"
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Category"
                                name="category"
                                value={formData.category}
                                fullWidth
                                disabled
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseModal} color="inherit">Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {editMode ? 'Update Item' : 'Save Item'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default VendorCatalogds2;
