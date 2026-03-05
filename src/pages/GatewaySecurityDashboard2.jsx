import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Tabs, Tab, Paper, Grid, TextField, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';

const GatewaySecurityDashboard2 = () => {
    const [tabValue, setTabValue] = useState(0);
    const [approvedPOs, setApprovedPOs] = useState([]);
    const [gatewayPasses, setGatewayPasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openPassModal, setOpenPassModal] = useState(false);

    // Gateway Pass Form State
    const [selectedPO, setSelectedPO] = useState(null);
    const [poItems, setPoItems] = useState([]);
    const [passType, setPassType] = useState('Inward');
    const [vehicleNo, setVehicleNo] = useState('');
    const [lrNo, setLrNo] = useState('');
    const [deliveryPersonName, setDeliveryPersonName] = useState('');
    const [contactNo, setContactNo] = useState('');
    const [dcInvoiceNo, setDcInvoiceNo] = useState('');
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        if (!global1.colid && localStorage.getItem('colid')) {
            global1.colid = localStorage.getItem('colid');
            global1.user = localStorage.getItem('user');
            global1.name = localStorage.getItem('name') || 'Security Guard';
        }

        if (tabValue === 0) fetchApprovedPOs();
        if (tabValue === 1) fetchGatewayPasses();
    }, [tabValue]);

    const fetchApprovedPOs = async () => {
        setLoading(true);
        try {
            // Fetch POs that are Approved or Partially Delivered
            const res = await ep1.get(`/api/v2/getallstorepoorderds2?colid=${global1.colid}`);
            const allPOs = res.data.data.poOrders || res.data.data || [];
            const validFlowPOs = allPOs.filter(p => p.postatus === 'Approved' || p.postatus === 'Partially Delivered');
            setApprovedPOs(validFlowPOs.map(p => ({ ...p, id: p._id })));
        } catch (e) {
            console.error("Error fetching Approved POs", e);
        }
        setLoading(false);
    };

    const fetchGatewayPasses = async () => {
        setLoading(true);
        try {
            const res = await ep1.get(`/api/v2/getallgatewaypasses2?colid=${global1.colid}`);
            const passes = res.data.data || [];
            setGatewayPasses(passes.map(p => ({ ...p, id: p._id })));
        } catch (e) {
            console.error("Error fetching Gateway Passes", e);
        }
        setLoading(false);
    };

    const handleOpenGatePassGeneration = async (po) => {
        setSelectedPO(po);
        setPassType('Inward');
        setVehicleNo('');
        setLrNo('');
        setDeliveryPersonName('');
        setContactNo('');
        setDcInvoiceNo('');
        setRemarks('');

        try {
            const res = await ep1.get(`/api/v2/getallstorepoitemsds2?colid=${global1.colid}`);
            const allItems = res.data.data.poItems || [];
            const myItems = allItems.filter(i => i.poid === po.poid).map(i => ({
                itemid: i.itemid,
                itemname: i.itemname,
                unit: i.unit,
                expectedQuantity: i.quantity,
                deliveredQuantity: 0 // Default for UI input
            }));
            setPoItems(myItems);
            setOpenPassModal(true);
        } catch (error) {
            console.error("Error fetching PO items for Pass", error);
            alert("Could not load PO items.");
        }
    };

    const handleQuantityChange = (index, value) => {
        const newItems = [...poItems];
        newItems[index].deliveredQuantity = Number(value);
        setPoItems(newItems);
    };

    const handleCreateGatePass = async () => {
        if (!vehicleNo || !deliveryPersonName || !contactNo || !dcInvoiceNo) {
            alert("Vehicle No, Delivery Person, Contact, and DC/Invoice No are required.");
            return;
        }

        const payload = {
            passNumber: `GP-${Date.now()}`,
            passType,
            colid: global1.colid,
            poid: selectedPO.poid,
            vendorName: selectedPO.vendor,
            vendorAddress: '', // Add mapping if available
            vehicleNo,
            lrNo,
            deliveryPersonName,
            contactNo,
            securityName: global1.name || 'Security Guard',
            dcInvoiceNo,
            billAmount: selectedPO.netprice || selectedPO.price,
            remarks,
            items: poItems
        };

        try {
            await ep1.post('/api/v2/addgatewaypass2', payload);
            alert("Gateway Pass generated successfully!");
            setOpenPassModal(false);
            fetchApprovedPOs(); // Refresh
        } catch (e) {
            console.error("Error generating Gate Pass", e);
            alert(e.response?.data?.message || "Failed to generate Gate Pass.");
        }
    };

    const poCols = [
        { field: 'poid', headerName: 'PO Number', width: 200 },
        { field: 'vendor', headerName: 'Vendor', width: 200 },
        { field: 'deliveryType', headerName: 'Delivery Type', width: 150 },
        { field: 'postatus', headerName: 'Status', width: 150 },
        {
            field: 'actions', headerName: 'Actions', width: 200, renderCell: (params) => (
                <Button variant="contained" color="primary" size="small" onClick={() => handleOpenGatePassGeneration(params.row)}>
                    Generate Inward Pass
                </Button>
            )
        }
    ];

    const passCols = [
        { field: 'passNumber', headerName: 'Pass No.', width: 150 },
        { field: 'poid', headerName: 'PO No.', width: 150 },
        { field: 'passType', headerName: 'Type', width: 120 },
        { field: 'vehicleNo', headerName: 'Vehicle No', width: 150 },
        { field: 'deliveryPersonName', headerName: 'Delivery Person', width: 180 },
        { field: 'securityName', headerName: 'Security Officer', width: 180 },
        { field: 'createdAt', headerName: 'Date', width: 180, valueFormatter: (params) => new Date(params.value).toLocaleString() }
    ];

    return (
        <Box p={3} sx={{ height: '85vh', width: '100%' }}>
            <Typography variant="h4" gutterBottom>Gateway Security Station</Typography>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
                <Tab label="Incoming Approved POs" />
                <Tab label="Gateway Pass History" />
            </Tabs>

            {tabValue === 0 && (
                <Paper sx={{ height: 600, width: '100%' }}>
                    <DataGrid rows={approvedPOs} columns={poCols} loading={loading} />
                </Paper>
            )}

            {tabValue === 1 && (
                <Paper sx={{ height: 600, width: '100%' }}>
                    <DataGrid rows={gatewayPasses} columns={passCols} loading={loading} />
                </Paper>
            )}

            <Dialog open={openPassModal} onClose={() => setOpenPassModal(false)} maxWidth="md" fullWidth>
                <DialogTitle>Generate Gateway Inward Pass</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={6}><Typography variant="subtitle2">PO No:</Typography> <Typography>{selectedPO?.poid}</Typography></Grid>
                        <Grid item xs={6}><Typography variant="subtitle2">Vendor:</Typography> <Typography>{selectedPO?.vendor}</Typography></Grid>

                        <Grid item xs={12} md={4}><TextField fullWidth label="Vehicle No" size="small" value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} /></Grid>
                        <Grid item xs={12} md={4}><TextField fullWidth label="LR No / Bilty No" size="small" value={lrNo} onChange={e => setLrNo(e.target.value)} /></Grid>
                        <Grid item xs={12} md={4}><TextField fullWidth label="Delivery Person Name" size="small" value={deliveryPersonName} onChange={e => setDeliveryPersonName(e.target.value)} /></Grid>
                        <Grid item xs={12} md={4}><TextField fullWidth label="Contact No" size="small" value={contactNo} onChange={e => setContactNo(e.target.value)} /></Grid>
                        <Grid item xs={12} md={4}><TextField fullWidth label="DC / Invoice No" size="small" value={dcInvoiceNo} onChange={e => setDcInvoiceNo(e.target.value)} /></Grid>

                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Delivery Items Checklist</Typography>
                            {poItems.map((item, index) => (
                                <Box key={index} display="flex" gap={2} alignItems="center" mb={1} p={1} border="1px solid #ccc" borderRadius={1}>
                                    <Box flexGrow={1}>
                                        <Typography variant="body2"><b>{item.itemname}</b></Typography>
                                        <Typography variant="caption" color="textSecondary">Expected: {item.expectedQuantity} {item.unit}</Typography>
                                    </Box>
                                    <TextField
                                        label="Actual Delivered Qty"
                                        type="number"
                                        size="small"
                                        value={item.deliveredQuantity}
                                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                                    />
                                </Box>
                            ))}
                        </Grid>

                        <Grid item xs={12}>
                            <TextField fullWidth multiline rows={2} label="Remarks (Optional)" size="small" value={remarks} onChange={e => setRemarks(e.target.value)} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPassModal(false)}>Cancel</Button>
                    <Button variant="contained" color="primary" onClick={handleCreateGatePass}>Generate Gate Pass</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GatewaySecurityDashboard2;
