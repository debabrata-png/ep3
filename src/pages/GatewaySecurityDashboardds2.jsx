import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Typography, Paper, Tabs, Tab, Button, Grid, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions, Drawer, Divider, IconButton
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';

const global1 = { colid: 1, user: 'Security' }; // Placeholder for actual auth context
try {
    const sessionColid = sessionStorage.getItem("colid");
    const sessionUser = sessionStorage.getItem("user");
    if (sessionColid) global1.colid = sessionColid;
    if (sessionUser) global1.user = sessionUser;
} catch (e) { }

const ep1 = axios.create({
    baseURL: 'http://localhost:8000', // Adjust to generic if proxied
});

function GatewaySecurityDashboardds2() {
    const [tabValue, setTabValue] = useState(0);
    const [approvedPOs, setApprovedPOs] = useState([]);
    const [gatePasses, setGatePasses] = useState([]);

    // Gate Pass Modal State
    const [openPassModal, setOpenPassModal] = useState(false);
    const [selectedPO, setSelectedPO] = useState(null);
    const [poItems, setPoItems] = useState([]);
    const [formData, setFormData] = useState({
        vehicleNo: '',
        lrNo: '',
        deliveryPersonName: '',
        contactNo: '',
        dcInvoiceNo: '',
        billAmount: '',
        remarks: ''
    });

    const fetchPOs = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallstorepoorderds2?colid=${global1.colid}`);
            const pos = res.data.data.poOrders || [];
            // Security needs to see Approved or Partially Delivered POs
            const incomingPOs = pos.filter(p => p.postatus === 'Approved' || p.postatus === 'Partially Delivered');
            setApprovedPOs(incomingPOs.map(p => ({ ...p, id: p._id })));
        } catch (e) { console.error(e); }
    };

    const fetchGatePasses = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallgatewaypasses2?colid=${global1.colid}`);
            setGatePasses(res.data.data.map(p => ({ ...p, id: p._id })));
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (tabValue === 0) fetchPOs();
        if (tabValue === 1) fetchGatePasses();
    }, [tabValue]);

    const handleOpenPassForm = async (po) => {
        setSelectedPO(po);
        setFormData({
            vehicleNo: '', lrNo: '', deliveryPersonName: '',
            contactNo: '', dcInvoiceNo: '', billAmount: '', remarks: ''
        });

        try {
            const res = await ep1.get(`/api/v2/getallstorepoitemsds2?colid=${global1.colid}`);
            const items = res.data.data.poItems.filter(i => i.poid === po.poid);
            setPoItems(items.map(i => ({ ...i, deliveredQuantity: i.quantity }))); // Default to expected qty
            setOpenPassModal(true);
        } catch (e) {
            console.error(e);
            alert("Failed to load PO items");
        }
    };

    const handleItemDeliveredChange = (index, value) => {
        const newItems = [...poItems];
        newItems[index].deliveredQuantity = Number(value);
        setPoItems(newItems);
    };

    const handleSubmitPass = async () => {
        if (!formData.vehicleNo || !formData.deliveryPersonName || !formData.dcInvoiceNo) {
            alert("Please fill in essential fields: Vehicle No, Delivery Person, DC/Invoice No");
            return;
        }

        const passData = {
            ...formData,
            passType: 'Inward',
            colid: global1.colid,
            poid: selectedPO.poid,
            securityName: global1.user,
            items: poItems.map(item => ({
                itemid: item.itemid,
                itemname: item.itemname,
                unit: item.unit,
                expectedQuantity: item.quantity,
                deliveredQuantity: item.deliveredQuantity
            }))
        };

        try {
            await ep1.post('/api/v2/addgatewaypass2', passData);
            alert('Gate Pass Generated Successfully');
            setOpenPassModal(false);
            fetchPOs();
        } catch (err) {
            console.error(err);
            alert('Error generating pass');
        }
    };

    const poColumns = [
        { field: 'poid', headerName: 'PO #', width: 150 },
        { field: 'postatus', headerName: 'Status', width: 130 },
        { field: 'vendorname', headerName: 'Vendor', width: 200 },
        { field: 'totalAmount', headerName: 'Total', width: 130 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            renderCell: (params) => (
                <Button variant="contained" size="small" onClick={() => handleOpenPassForm(params.row)}>
                    Generate Gate Pass
                </Button>
            )
        }
    ];

    const gpColumns = [
        { field: 'passNumber', headerName: 'Pass #', width: 150 },
        { field: 'passType', headerName: 'Type', width: 100 },
        { field: 'poid', headerName: 'PO #', width: 150 },
        { field: 'vehicleNo', headerName: 'Vehicle', width: 130 },
        { field: 'deliveryPersonName', headerName: 'Delivery Person', width: 150 },
        { field: 'createdAt', headerName: 'Date', width: 200, valueFormatter: (params) => new Date(params.value).toLocaleString() }
    ];

    return (
        <Box p={3} sx={{ height: '85vh', width: '100%' }}>
            <Typography variant="h4" gutterBottom>Security Gate Dashboard</Typography>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
                <Tab label="Incoming Deliveries (Approved POs)" />
                <Tab label="Gate Pass History" />
            </Tabs>

            {tabValue === 0 && (
                <Paper sx={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={approvedPOs}
                        columns={poColumns}
                        pageSizeOptions={[10, 25]}
                        disableSelectionOnClick
                    />
                </Paper>
            )}

            {tabValue === 1 && (
                <Paper sx={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={gatePasses}
                        columns={gpColumns}
                        pageSizeOptions={[10, 25]}
                        disableSelectionOnClick
                    />
                </Paper>
            )}

            {/* Inward Gate Pass Modal */}
            <Dialog open={openPassModal} onClose={() => setOpenPassModal(false)} maxWidth="lg" fullWidth>
                <DialogTitle>
                    Generate Inward Gate Pass
                    <IconButton aria-label="close" onClick={() => setOpenPassModal(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Vehicle No *" value={formData.vehicleNo} onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })} margin="dense" />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="LR No / Courier Receipt" value={formData.lrNo} onChange={(e) => setFormData({ ...formData, lrNo: e.target.value })} margin="dense" />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Delivery Person Name *" value={formData.deliveryPersonName} onChange={(e) => setFormData({ ...formData, deliveryPersonName: e.target.value })} margin="dense" />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Contact No" value={formData.contactNo} onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })} margin="dense" />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="DC / Invoice No *" value={formData.dcInvoiceNo} onChange={(e) => setFormData({ ...formData, dcInvoiceNo: e.target.value })} margin="dense" />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Bill Amount" type="number" value={formData.billAmount} onChange={(e) => setFormData({ ...formData, billAmount: e.target.value })} margin="dense" />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Remarks" multiline rows={2} value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} margin="dense" />
                        </Grid>
                    </Grid>

                    <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Delivery Item Verification</Typography>
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Item Name</TableCell>
                                    <TableCell>Unit</TableCell>
                                    <TableCell>Expected Qty (from PO)</TableCell>
                                    <TableCell>Actual Delivered Qty</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {poItems.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.itemname}</TableCell>
                                        <TableCell>{item.unit}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={item.deliveredQuantity}
                                                onChange={(e) => handleItemDeliveredChange(index, e.target.value)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPassModal(false)}>Cancel</Button>
                    <Button variant="contained" color="primary" onClick={handleSubmitPass}>Submit Pass</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default GatewaySecurityDashboardds2;
