import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Typography, Paper, Tabs, Tab, Button, Grid, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Autocomplete
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
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
    const [returnsList, setReturnsList] = useState([]); // Pending Returns

    const [openPassModal, setOpenPassModal] = useState(false);
    const [passDirection, setPassDirection] = useState('Inward'); // 'Inward' or 'Outdoor'
    const [selectedPO, setSelectedPO] = useState(null);
    const [allPoItems, setAllPoItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [currentSelectedItem, setCurrentSelectedItem] = useState(null);
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

    const fetchReturns = async () => {
        try {
            const [delRes, qcRes, passRes] = await Promise.all([
                ep1.get(`/api/v2/getalldeliverydsds2?colid=${global1.colid}`),
                ep1.get(`/api/v2/getallqualitycheckds2?colid=${global1.colid}`),
                ep1.get(`/api/v2/getallgatewaypasses2?colid=${global1.colid}`)
            ]);

            const deliveries = delRes.data?.data?.deliveries || [];
            const qcChecks = qcRes.data?.data || [];
            const outdoorPasses = passRes.data?.data?.filter(p => p.passType === 'Outdoor') || [];

            // Group deliveries and QC rejections with returns by PO
            const groupedReturns = {};

            // 1. Process Delivery Returns
            deliveries.forEach(d => {
                const returnedQty = Number(d.return || d.returned || 0);
                if (returnedQty > 0) {
                    if (!groupedReturns[d.poid]) {
                        groupedReturns[d.poid] = { poid: d.poid, items: [] };
                    }
                    const extItem = groupedReturns[d.poid].items.find(i => i.item === d.item);
                    if (extItem) {
                        extItem.returnQty += returnedQty;
                    } else {
                        groupedReturns[d.poid].items.push({ item: d.item, itemcode: d.itemcode, returnQty: returnedQty });
                    }
                }
            });

            // 2. Process QA Rejections
            qcChecks.forEach(qc => {
                const targetPoid = qc.poid || qc.woPoNo;
                if (!targetPoid) return;

                (qc.items || []).forEach(item => {
                    const rejectedQty = Number(item.rejectedQuantity || 0);
                    if (rejectedQty > 0) {
                        if (!groupedReturns[targetPoid]) {
                            groupedReturns[targetPoid] = { poid: targetPoid, items: [] };
                        }
                        const extItem = groupedReturns[targetPoid].items.find(i => i.item === item.itemname);
                        if (extItem) {
                            extItem.returnQty += rejectedQty;
                        } else {
                            groupedReturns[targetPoid].items.push({ item: item.itemname, itemcode: item.itemid, returnQty: rejectedQty });
                        }
                    }
                });
            });

            // 3. Adjust by already shipped outdoor passes
            outdoorPasses.forEach(pass => {
                if (groupedReturns[pass.poid]) {
                    pass.items?.forEach(passItem => {
                        const passItemName = passItem.itemname || passItem.item;
                        const rec = groupedReturns[pass.poid].items.find(i => i.item === passItemName);
                        if (rec) {
                            rec.returnQty -= Number(passItem.deliveredQuantity || passItem.expectedQuantity || 0);
                        }
                    });
                }
            });

            // Filter out POs where all returns are shipped
            const finalReturns = [];
            Object.values(groupedReturns).forEach(grp => {
                const pendingItems = grp.items.filter(i => i.returnQty > 0);
                if (pendingItems.length > 0) {
                    finalReturns.push({ ...grp, items: pendingItems, id: grp.poid });
                }
            });

            setReturnsList(finalReturns);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (tabValue === 0) fetchPOs();
        if (tabValue === 1) fetchReturns();
        if (tabValue === 2) fetchGatePasses();
    }, [tabValue]);

    const handleOpenPassForm = async (po, isOutward = false) => {
        setSelectedPO(po);
        setPassDirection(isOutward ? 'Outdoor' : 'Inward');
        setFormData({
            vehicleNo: '', lrNo: '', deliveryPersonName: '',
            contactNo: '', dcInvoiceNo: '', billAmount: '', remarks: ''
        });

        if (isOutward) {
            // For Outward, items are populated from the returns list calculation
            const items = po.items.map(i => ({
                itemid: i.itemcode, // fallback mapping
                itemname: i.item,
                unit: 'Nos',
                quantity: i.returnQty,
                pendingQuantity: i.returnQty
            }));
            setAllPoItems(items);
            setSelectedItems([]);
            setCurrentSelectedItem(null);
            setOpenPassModal(true);
        } else {
            // For Inward
            try {
                const res = await ep1.get(`/api/v2/getallstorepoitemsds2?colid=${global1.colid}`);
                const rawItems = res.data.data.poItems.filter(i => i.poid === po.poid);

                // Aggregate items by name or ID to prevent duplicates if multiple rows exist
                const aggregatedItems = {};
                rawItems.forEach(item => {
                    const key = item.itemid || item.itemname;
                    if (!aggregatedItems[key]) {
                        aggregatedItems[key] = {
                            ...item,
                            quantity: Number(item.quantity || 0),
                            gateReceivedQuantity: Number(item.gateReceivedQuantity || 0)
                        };
                    } else {
                        aggregatedItems[key].quantity += Number(item.quantity || 0);
                        aggregatedItems[key].gateReceivedQuantity += Number(item.gateReceivedQuantity || 0);
                    }
                });

                // Calculate pending quantity = ordered quantity - what gate has already seen
                const itemsToReceive = Object.values(aggregatedItems).map(item => {
                    // Floor at 0 in case of weird math anomalies
                    const pendingQty = Math.max(0, item.quantity - item.gateReceivedQuantity);
                    return {
                        ...item,
                        pendingQuantity: pendingQty
                    };
                }).filter(i => i.pendingQuantity > 0);

                setAllPoItems(itemsToReceive);
                setSelectedItems([]);
                setCurrentSelectedItem(null);
                setOpenPassModal(true);
            } catch (e) {
                console.error(e);
                alert("Failed to load PO items");
            }
        }
    };

    const handleAddItem = () => {
        if (!currentSelectedItem) return;
        // Avoid duplicates
        if (selectedItems.find(i => i.itemid === currentSelectedItem.itemid)) {
            alert("Item already added.");
            return;
        }
        // pendingQuantity is already pre-calculated in handleOpenPassForm
        const pendingQty = currentSelectedItem.pendingQuantity;
        setSelectedItems([...selectedItems, { ...currentSelectedItem, deliveredQuantity: pendingQty }]);
        setCurrentSelectedItem(null);
    };

    const handleItemDeliveredChange = (index, value) => {
        const newItems = [...selectedItems];
        newItems[index].deliveredQuantity = Number(value);
        setSelectedItems(newItems);
    };

    const handleSubmitPass = async () => {
        if (!formData.vehicleNo || !formData.deliveryPersonName || !formData.dcInvoiceNo) {
            alert("Please fill in essential fields: Vehicle No, Delivery Person, DC/Invoice No");
            return;
        }

        const passData = {
            ...formData,
            passType: passDirection,
            colid: global1.colid,
            poid: selectedPO.poid,
            securityName: global1.user,
            items: selectedItems.map(item => ({
                itemid: item.itemid,
                itemname: item.itemname,
                unit: item.unit,
                expectedQuantity: item.pendingQuantity || item.quantity,
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
                <Button variant="contained" size="small" onClick={() => handleOpenPassForm(params.row, false)}>
                    Generate Inward Pass
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
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }} textColor="secondary" indicatorColor="secondary">
                <Tab label="Incoming Deliveries (Approved POs)" />
                <Tab label="Outgoing Deliveries (Returns)" />
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
                        rows={returnsList}
                        columns={[
                            { field: 'poid', headerName: 'PO #', width: 180 },
                            {
                                field: 'itemsDesc', headerName: 'Pending Return Items', width: 400,
                                valueGetter: (params) => {
                                    if (!params.row || !params.row.items) return '';
                                    return params.row.items.map(i => `${i.item} (Qty: ${i.returnQty})`).join(', ');
                                }
                            },
                            {
                                field: 'actions', headerName: 'Action', width: 250,
                                renderCell: (params) => (
                                    <Button variant="contained" color="warning" size="small" onClick={() => handleOpenPassForm(params.row, true)}>
                                        Generate Outward Pass
                                    </Button>
                                )
                            }
                        ]}
                        pageSizeOptions={[10, 25]}
                        disableSelectionOnClick
                    />
                </Paper>
            )}

            {tabValue === 2 && (
                <Paper sx={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={gatePasses}
                        columns={gpColumns}
                        pageSizeOptions={[10, 25]}
                        disableSelectionOnClick
                    />
                </Paper>
            )}

            {/* Gate Pass Modal */}
            <Dialog open={openPassModal} onClose={() => setOpenPassModal(false)} maxWidth="lg" fullWidth>
                <DialogTitle>
                    Generate {passDirection} Gate Pass
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

                    <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                        <Autocomplete
                            sx={{ flexGrow: 1 }}
                            options={allPoItems}
                            getOptionLabel={(option) => option.itemname ? `${option.itemname} (Pending: ${option.pendingQuantity || (option.quantity - (option.gateReceivedQuantity || 0))})` : ""}
                            value={currentSelectedItem}
                            onChange={(e, val) => setCurrentSelectedItem(val)}
                            renderInput={(params) => <TextField {...params} label={passDirection === 'Inward' ? "Select Delivered Item from PO" : "Select Returned Item"} size="small" />}
                        />
                        <Button variant="contained" color="secondary" onClick={handleAddItem}>
                            Add Item
                        </Button>
                    </Box>

                    {selectedItems.length > 0 && (
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Item Name</TableCell>
                                        <TableCell>Unit</TableCell>
                                        <TableCell>Pending Qty</TableCell>
                                        <TableCell>Actual {passDirection === 'Inward' ? "Delivered" : "Returned"} Qty</TableCell>
                                        <TableCell>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedItems.map((item, index) => (
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
                                            <TableCell>
                                                <Button size="small" color="error" onClick={() => {
                                                    const newArr = [...selectedItems];
                                                    newArr.splice(index, 1);
                                                    setSelectedItems(newArr);
                                                }}>
                                                    Remove
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
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
