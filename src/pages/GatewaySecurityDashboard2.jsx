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
    const [returnsList, setReturnsList] = useState([]); // Pending Returns
    const [openPassModal, setOpenPassModal] = useState(false);

    // Gateway Pass Form State
    const [selectedPO, setSelectedPO] = useState(null);
    const [poItems, setPoItems] = useState([]);
    const [passDirection, setPassDirection] = useState('Inward'); // 'Inward' or 'Outdoor'
    const [passType, setPassType] = useState('Inward');
    const [vehicleNo, setVehicleNo] = useState('');
    const [lrNo, setLrNo] = useState('');
    const [deliveryPersonName, setDeliveryPersonName] = useState('');
    const [contactNo, setContactNo] = useState('');
    const [dcInvoiceNo, setDcInvoiceNo] = useState('');
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        if (tabValue === 0) fetchApprovedPOs();
        if (tabValue === 1) fetchReturns();
        if (tabValue === 2) fetchGatewayPasses();
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

    const fetchReturns = async () => {
        try {
            const [delRes, qcRes, passRes] = await Promise.all([
                ep1.get(`/api/v2/getalldeliverydsds2?colid=${global1.colid}`),
                ep1.get(`/api/v2/getallqualitycheckds2?colid=${global1.colid}`),
                ep1.get(`/api/v2/getallgatewaypasses2?colid=${global1.colid}`)
            ]);

            const deliveries = delRes.data?.data?.deliveries || [];
            const qualityChecks = qcRes.data?.data || [];
            const outdoorPasses = passRes.data?.data?.filter(p => p.passType === 'Outdoor') || [];

            // Group deliveries with returns by PO
            const groupedReturns = {};
            deliveries.forEach(d => {
                const returnedQty = Number(d.return || d.returned || 0);
                if (returnedQty > 0) {
                    if (!groupedReturns[d.poid]) {
                        groupedReturns[d.poid] = { poid: d.poid, items: [] };
                    }
                    // Aggregate returns if multiple deliveries for same item
                    const extItem = groupedReturns[d.poid].items.find(i => i.item === d.item);
                    if (extItem) {
                        extItem.returnQty += returnedQty;
                    } else {
                        groupedReturns[d.poid].items.push({ item: d.item, itemcode: d.itemcode, returnQty: returnedQty });
                    }
                }
            });

            // Add rejected items from Quality Check phase
            qualityChecks.forEach(qc => {
                if (!qc.items) return;
                qc.items.forEach(i => {
                    const rejectedQty = Number(i.rejectedQuantity || 0);
                    if (rejectedQty > 0) {
                        if (!groupedReturns[qc.poid]) {
                            groupedReturns[qc.poid] = { poid: qc.poid, items: [] };
                        }
                        const extItem = groupedReturns[qc.poid].items.find(existing => existing.item === i.itemname);
                        if (extItem) {
                            extItem.returnQty += rejectedQty;
                        } else {
                            // Map the items correctly based on quality checks
                            groupedReturns[qc.poid].items.push({ item: i.itemname, itemcode: i.itemid, returnQty: rejectedQty });
                        }
                    }
                });
            });

            // Adjust by already shipped outdoor passes
            outdoorPasses.forEach(pass => {
                if (groupedReturns[pass.poid]) {
                    pass.items?.forEach(passItem => {
                        const rec = groupedReturns[pass.poid].items.find(i => i.item === passItem.itemname || i.itemcode === passItem.itemid);
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

    const handleOpenGatePassGeneration = async (po, isOutward = false) => {
        setSelectedPO(po);
        setPassDirection(isOutward ? 'Outdoor' : 'Inward');
        setPassType(isOutward ? 'Outdoor' : 'Inward');
        setVehicleNo('');
        setLrNo('');
        setDeliveryPersonName('');
        setContactNo('');
        setDcInvoiceNo('');
        setRemarks('');

        if (isOutward) {
            const items = po.items.map(i => ({
                itemid: i.itemcode,
                itemname: i.item,
                unit: 'Nos',
                expectedQuantity: i.returnQty,
                deliveredQuantity: i.returnQty
            }));
            setPoItems(items);
            setOpenPassModal(true);
        } else {
            try {
                const res = await ep1.get(`/api/v2/getallstorepoitemsds2?colid=${global1.colid}`);
                const rawItems = res.data.data.poItems || [];

                const aggregatedItems = {};
                rawItems.filter(i => i.poid === po.poid).forEach(item => {
                    const key = item.itemid || item.itemname;
                    if (!aggregatedItems[key]) {
                        aggregatedItems[key] = {
                            itemid: item.itemid,
                            itemname: item.itemname,
                            unit: item.unit,
                            quantity: Number(item.quantity || 0),
                            gateReceivedQuantity: Number(item.gateReceivedQuantity || 0)
                        };
                    } else {
                        aggregatedItems[key].quantity += Number(item.quantity || 0);
                        aggregatedItems[key].gateReceivedQuantity += Number(item.gateReceivedQuantity || 0);
                    }
                });

                const myItems = Object.values(aggregatedItems).map(i => {
                    const pendingQty = Math.max(0, i.quantity - i.gateReceivedQuantity);
                    return {
                        itemid: i.itemid,
                        itemname: i.itemname,
                        unit: i.unit,
                        expectedQuantity: pendingQty,
                        deliveredQuantity: 0 // Default for UI input
                    };
                }).filter(i => i.expectedQuantity > 0);

                setPoItems(myItems);
                setOpenPassModal(true);
            } catch (error) {
                console.error("Error fetching PO items for Pass", error);
                alert("Could not load PO items.");
            }
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

        // Generate sequential Gate Pass number: GP-{YYYY}{MM}{seq}
        const gpDate = new Date();
        const gpYYYY = gpDate.getFullYear();
        const gpMM = String(gpDate.getMonth() + 1).padStart(2, '0');
        const gpBase = `GP-${gpYYYY}${gpMM}`;
        let gpSeq = 1;
        try {
            const seqRes = await ep1.get(`/api/v2/getallgatewaypasses2?colid=${global1.colid}`);
            const allPasses = seqRes.data.data || [];
            const matching = allPasses.filter(p => p.passNumber && p.passNumber.startsWith(gpBase));
            if (matching.length > 0) {
                const maxSeq = Math.max(...matching.map(p => {
                    const parts = p.passNumber.split('-');
                    return parseInt(parts[parts.length - 1], 10) || 0;
                }));
                gpSeq = maxSeq + 1;
            }
        } catch (e) { console.error('Error fetching Gate Passes for sequence:', e); }
        const newPassNumber = `${gpBase}-${String(gpSeq).padStart(3, '0')}`;

        const payload = {
            passNumber: newPassNumber,
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
            items: poItems.filter(i => Number(i.deliveredQuantity) > 0) // Only include items with actual delivery
        };

        if (payload.items.length === 0) {
            alert('Please enter at least one item with a delivery quantity greater than 0.');
            return;
        }

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
                <Button variant="contained" color="primary" size="small" onClick={() => handleOpenGatePassGeneration(params.row, false)}>
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
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }} textColor="secondary" indicatorColor="secondary">
                <Tab label="Incoming Approved POs" />
                <Tab label="Outgoing Deliveries (Returns)" />
                <Tab label="Gateway Pass History" />
            </Tabs>

            {tabValue === 0 && (
                <Paper sx={{ height: 600, width: '100%' }}>
                    <DataGrid rows={approvedPOs} columns={poCols} loading={loading} />
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
                                    <Button variant="contained" color="warning" size="small" onClick={() => handleOpenGatePassGeneration(params.row, true)}>
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
                    <DataGrid rows={gatewayPasses} columns={passCols} loading={loading} />
                </Paper>
            )}

            <Dialog open={openPassModal} onClose={() => setOpenPassModal(false)} maxWidth="md" fullWidth>
                <DialogTitle>Generate Gateway {passDirection === 'Inward' ? 'Inward' : 'Outward'} Pass</DialogTitle>
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
                                        <Typography variant="caption" color="textSecondary">{passDirection === 'Inward' ? 'Expected' : 'Pending Return'}: {item.expectedQuantity} {item.unit}</Typography>
                                    </Box>
                                    <TextField
                                        label={passDirection === 'Inward' ? "Actual Delivered Qty" : "Actual Returned Qty"}
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
