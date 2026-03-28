import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Tabs, Tab, Paper, Grid, TextField, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, InputLabel, FormControl,
    CircularProgress, Chip, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, IconButton,
    Autocomplete
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DataGrid } from '@mui/x-data-grid';
import { createRoot } from 'react-dom/client';
import ep1 from '../api/ep1';
import global1 from './global1';
import GatePassTemplate2 from './GatePassTemplate2';

const StoreGatePassds2 = () => {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    
    // Selection State
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState('');
    
    // Approved POs / NPOs State
    const [approvedPOs, setApprovedPOs] = useState([]);
    const [qualityChecks, setQualityChecks] = useState([]); // New
    const [orderType, setOrderType] = useState('PO'); // 'PO' or 'NPO'
    const [npoSubType, setNpoSubType] = useState('LPO'); // 'LPO', 'Cash Memo', 'Imprest'
    const [passDirection, setPassDirection] = useState('Inward'); // 'Inward' or 'Outward'
    const [outwardCategory, setOutwardCategory] = useState('RGP'); // 'Internal', 'RGP', 'NRGP'

    // Gateway Pass History
    const [gatewayPasses, setGatewayPasses] = useState([]);

    // Modal State
    const [openPassModal, setOpenPassModal] = useState(false);
    const [selectedPO, setSelectedPO] = useState(null);
    const [poItems, setPoItems] = useState([]);
    
    // Form State
    const [vehicleNo, setVehicleNo] = useState('');
    const [driverName, setDriverName] = useState('');
    const [contactNo, setContactNo] = useState('');
    const [dcInvoiceNo, setDcInvoiceNo] = useState('');
    const [remarks, setRemarks] = useState('');
    const [remarkType, setRemarkType] = useState('Countable');

    useEffect(() => {
        fetchStores();
    }, []);

    useEffect(() => {
        if (tabValue === 1) fetchGatewayPasses();
        else {
            if (passDirection === 'Inward') fetchApprovedPOs();
            else fetchQualityChecks();
        }
    }, [tabValue, orderType, npoSubType, passDirection, selectedStore, outwardCategory]);

    const fetchStores = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallstoremasterds2?colid=${global1.colid}`);
            setStores(res.data.data.stores || []);
        } catch (e) { console.error(e); }
    };

    const fetchApprovedPOs = async () => {
        if (!selectedStore && orderType === 'PO') return setApprovedPOs([]);
        setLoading(true);
        try {
            const response = await ep1.get(`/api/v2/getallstorepoorderds2?colid=${global1.colid}`);
            if (response.data.success) {
                const allPos = response.data.data.poOrders || [];
                const activePOs = allPos.filter(p => 
                    ['Approved', 'Auto Approved', 'Partially Delivered', 'Completed'].includes(p.postatus)
                );

                let filtered = activePOs;
                // Filter by store if selected (mostly for POs, Local purchases might not have storeid yet)
                if (selectedStore) {
                    filtered = filtered.filter(p => p.storeid === selectedStore || !p.storeid);
                }

                if (orderType === 'PO') {
                    filtered = filtered.filter(p => !p.localOrderType);
                } else if (orderType === 'NPO') {
                    filtered = filtered.filter(p => p.localOrderType === npoSubType);
                }
                setApprovedPOs(filtered.map(p => ({ ...p, id: p._id })));
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const fetchQualityChecks = async () => {
        setLoading(true);
        try {
            const res = await ep1.get(`/api/v2/getallqualitycheckds2?colid=${global1.colid}`);
            const all = res.data.data || [];
            // Filter by outwardCategory and reject count
            const filtered = all.filter(qc => {
                const hasRejects = (qc.items || []).some(i => Number(i.rejectedQuantity) > 0);
                if (outwardCategory === 'Internal') return true; 
                return hasRejects;
            });
            setQualityChecks(filtered.map(q => ({ ...q, id: q._id })));
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const fetchGatewayPasses = async () => {
        setLoading(true);
        try {
            const response = await ep1.get(`/api/v2/getallgatewaypasses2?colid=${global1.colid}`);
            if (response.data.success) {
                let data = response.data.data;
                if (selectedStore) {
                    // Filter history by store if possible (backend might need to save storeid in gatepass)
                    // For now, showing all
                }
                setGatewayPasses(data.map(p => ({ ...p, id: p._id })));
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const handleOpenPassModal = async (record) => {
        setSelectedPO(record);
        setVehicleNo(''); setDriverName(''); setContactNo(''); setDcInvoiceNo(''); setRemarks(''); setRemarkType('Countable');
        
        if (passDirection === 'Inward') {
            try {
                const res = await ep1.get(`/api/v2/getallstorepoitemsds2?colid=${global1.colid}`);
                const allItems = res.data.data.poItems || [];
                const items = allItems.filter(i => i.poid === record.poid).map(i => ({
                    itemid: i.itemid, itemname: i.itemname, itemcode: i.itemcode, unit: i.unit,
                    expectedQuantity: i.quantity, deliveredQuantity: i.quantity
                }));
                setPoItems(items);
                setOpenPassModal(true);
            } catch (error) { console.error(error); alert('Failed to load items'); }
        } else {
            // Outward from QC Record
            const items = (record.items || []).filter(i => Number(i.rejectedQuantity) > 0).map(i => ({
                itemid: i.itemid, itemname: i.itemname, itemcode: i.itemcode, unit: i.unit,
                expectedQuantity: i.rejectedQuantity, deliveredQuantity: i.rejectedQuantity
            }));
            setPoItems(items);
            setDcInvoiceNo(record.challanNo || '');
            setOpenPassModal(true);
        }
    };

    const handleCreatePass = async () => {
        if (!vehicleNo || !driverName || !dcInvoiceNo) { 
            alert('Please fill Vehicle No, Driver Name, and Invoice No.'); return; 
        }
        const date = new Date();
        const passNo = `GP-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(Date.now()).slice(-4)}`;
        const st = stores.find(s => s._id === selectedStore);
        const payload = {
            passNumber: passNo, passType: passDirection, colid: global1.colid, 
            poid: selectedPO.poid || selectedPO.woPoNo || 'N/A',
            vendorName: selectedPO.vendorname || selectedPO.vendor || selectedPO.partyName || 'N/A', 
            vehicleNo, deliveryPersonName: driverName,
            contactNo, dcInvoiceNo, remarks, remarkType, securityName: global1.name || global1.user || 'Store Manager',
            items: poItems, orderType: orderType, npoSubType: orderType === 'NPO' ? npoSubType : '',
            storeid: selectedStore, // Save store context
            storeName: st?.storename || st?.name || '',
            returnCategory: passDirection === 'Outward' ? outwardCategory : '',
            outwardCategory: passDirection === 'Outward' ? outwardCategory : ''
        };
        try {
            await ep1.post('/api/v2/addgatewaypass2', payload);
            alert('Gate Pass Generated: ' + passNo);
            setOpenPassModal(false);
            fetchGatewayPasses(); fetchApprovedPOs();
        } catch (error) { console.error(error); alert('Failed to generate gate pass.'); }
    };

    const handlePrint = (pass) => {
        const printWindow = window.open('', '', 'height=800,width=800');
        printWindow.document.write('<html><head><title>Print Gate Pass</title></head><body><div id="print-gp-root"></div></body></html>');
        printWindow.document.close();
        const root = createRoot(printWindow.document.getElementById('print-gp-root'));
        const config = { institutionname: 'Campus Technology', address: 'Main Campus', phone: '000-000-0000' }; // Fallback
        root.render(<GatePassTemplate2 passData={pass} instituteName={config.institutionname} instituteAddress={config.address} institutePhone={config.phone} />);
        setTimeout(() => { printWindow.focus(); printWindow.print(); }, 500);
    };

    const columns = [
        { field: 'poid', headerName: 'PO Number', width: 180 },
        { field: 'storename', headerName: 'Store Name', width: 180 }, // Added Store Name
        { field: 'vendorname', headerName: 'Vendor', width: 220, valueGetter: (params) => params.row.vendorname || params.row.vendor || 'N/A' },
        { field: 'localOrderType', headerName: 'Type', width: 130, renderCell: (p) => <Chip label={p.value || 'Standard PO'} color={p.value ? "secondary" : "primary"} size="small" variant="outlined" /> },
        { field: 'postatus', headerName: 'Status', width: 130, renderCell: (p) => <Chip label={p.value} color={p.value === 'Completed' ? "success" : "warning"} size="small" /> },
        { field: 'actions', headerName: 'Actions', width: 150, renderCell: (p) => <Button variant="contained" size="small" onClick={() => handleOpenPassModal(p.row)}>Create Pass</Button> }
    ];

    const qcColumns = [
        { field: 'inspectionId', headerName: 'Inspection ID', width: 180 },
        { field: 'grnNo', headerName: 'GRN No', width: 160 },
        { field: 'storeName', headerName: 'Store Name', width: 160 }, // Added Store Name
        { field: 'partyName', headerName: 'Vendor/Party', width: 220 },
        { field: 'inspectionDate', headerName: 'QC Date', width: 130, valueFormatter: (p) => p.value ? new Date(p.value).toLocaleDateString() : '' },
        { field: 'actions', headerName: 'Actions', width: 150, renderCell: (p) => <Button variant="contained" size="small" onClick={() => handleOpenPassModal(p.row)}>Create Return Pass</Button> }
    ];

    const historyColumns = [
        { field: 'passNumber', headerName: 'Pass No', width: 180 },
        { field: 'poid', headerName: 'PO No', width: 140 },
        { field: 'storeName', headerName: 'Store Name', width: 140 },
        { field: 'passType', headerName: 'Direction', width: 110 },
        { field: 'returnCategory', headerName: 'Category', width: 150 },
        { field: 'vehicleNo', headerName: 'Vehicle', width: 130 },
        { field: 'createdAt', headerName: 'Date', width: 160, valueFormatter: (p) => p?.value ? new Date(p.value).toLocaleString('en-GB') : 'N/A' },
        { field: 'print', headerName: 'Print', width: 100, renderCell: (p) => <Button onClick={() => handlePrint(p.row)}>Print</Button> }
    ];

    return (
        <Box p={3} sx={{ pt: 10 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#1a237e' }}>Manual Gate Pass Management</Typography>
            <Paper sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} indicatorColor="primary" textColor="primary">
                    <Tab label="Generate Gate Pass" />
                    <Tab label="Pass History" />
                </Tabs>
            </Paper>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Select Store</InputLabel>
                            <Select value={selectedStore} label="Select Store" onChange={(e) => setSelectedStore(e.target.value)}>
                                <MenuItem value=""><em>All Stores</em></MenuItem>
                                {stores.map(s => <MenuItem key={s._id} value={s._id}>{s.storename || s.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Direction</InputLabel>
                            <Select value={passDirection} label="Direction" onChange={(e) => setPassDirection(e.target.value)}>
                                <MenuItem value="Inward">Inward</MenuItem>
                                <MenuItem value="Outward">Outward (Returns)</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    {passDirection === 'Inward' ? (
                        <>
                            <Grid item xs={12} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Order Group</InputLabel>
                                    <Select value={orderType} label="Order Group" onChange={(e) => setOrderType(e.target.value)}>
                                        <MenuItem value="PO">Standard PO</MenuItem>
                                        <MenuItem value="NPO">NPO (Local)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            {orderType === 'NPO' && (
                                <Grid item xs={12} md={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>NPO Type</InputLabel>
                                        <Select value={npoSubType} label="NPO Type" onChange={(e) => setNpoSubType(e.target.value)}>
                                            <MenuItem value="LPO">LPO</MenuItem>
                                            <MenuItem value="Cash Memo">Cash Memo</MenuItem>
                                            <MenuItem value="Imprest">Imprest</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}
                        </>
                    ) : (
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Outward Category</InputLabel>
                                <Select value={outwardCategory} label="Outward Category" onChange={(e) => setOutwardCategory(e.target.value)}>
                                    <MenuItem value="Internal">Internal Movement</MenuItem>
                                    <MenuItem value="RGP">RGP (Returnable)</MenuItem>
                                    <MenuItem value="NRGP">NRGP (Non-Returnable)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    )}
                    <Grid item xs />
                    <Grid item><Button variant="outlined" onClick={fetchApprovedPOs}>Refresh</Button></Grid>
                </Grid>
            </Paper>

            <Paper sx={{ height: 600 }}>
                <DataGrid 
                    rows={tabValue === 1 ? gatewayPasses : (passDirection === 'Inward' ? approvedPOs : qualityChecks)} 
                    columns={tabValue === 1 ? historyColumns : (passDirection === 'Inward' ? columns : qcColumns)} 
                    loading={loading} 
                />
            </Paper>

            <Dialog open={openPassModal} onClose={() => setOpenPassModal(false)} maxWidth="md" fullWidth>
                <DialogTitle>Generate Gate Pass ({passDirection})</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={6}><Typography variant="body2">PO Number: {selectedPO?.poid}</Typography></Grid>
                        <Grid item xs={6}><Typography variant="body2">Vendor: {selectedPO?.vendorname || selectedPO?.vendor}</Typography></Grid>
                        <Grid item xs={12} md={4}><TextField fullWidth label="Vehicle No" value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} /></Grid>
                        <Grid item xs={12} md={4}><TextField fullWidth label="Driver Name" value={driverName} onChange={e => setDriverName(e.target.value)} /></Grid>
                        <Grid item xs={12} md={4}><TextField fullWidth label="Contact No" value={contactNo} onChange={e => setContactNo(e.target.value)} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="DC / Invoice No" value={dcInvoiceNo} onChange={e => setDcInvoiceNo(e.target.value)} /></Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth><InputLabel>Remark Type</InputLabel>
                                <Select value={remarkType} label="Remark Type" onChange={e => setRemarkType(e.target.value)}>
                                    <MenuItem value="Countable">Countable</MenuItem>
                                    <MenuItem value="Non Countable">Non Countable</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead><TableRow><TableCell>Item</TableCell><TableCell align="right">Exp Qty</TableCell><TableCell align="right">Rec Qty</TableCell></TableRow></TableHead>
                                    <TableBody>{poItems.map((item, i) => (
                                        <TableRow key={i}><TableCell>{item.itemname}</TableCell><TableCell align="right">{item.expectedQuantity}</TableCell>
                                            <TableCell align="right"><TextField size="small" type="number" value={item.deliveredQuantity} onChange={e => { const ni = [...poItems]; ni[i].deliveredQuantity = e.target.value; setPoItems(ni); }} sx={{ width: 80 }} /></TableCell>
                                        </TableRow>))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions><Button onClick={() => setOpenPassModal(false)}>Cancel</Button><Button variant="contained" onClick={handleCreatePass}>Generate</Button></DialogActions>
            </Dialog>
        </Box>
    );
};

export default StoreGatePassds2;
