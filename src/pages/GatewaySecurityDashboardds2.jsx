import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Tabs, Tab, Paper, Grid, TextField, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, InputLabel, FormControl,
    CircularProgress, Chip, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';

const GatewaySecurityDashboardds2 = () => {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    
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

    // Additional Outward Fields
    const [storeUsers, setStoreUsers] = useState([]);
    const [shiftFrom, setShiftFrom] = useState('');
    const [shiftTo, setShiftTo] = useState('');
    const [totalTrip, setTotalTrip] = useState('');
    const [purpose, setPurpose] = useState('');
    const [authorizedBy, setAuthorizedBy] = useState('');
    const [expectedDateOfReturn, setExpectedDateOfReturn] = useState('');
    const [materialTakenBy, setMaterialTakenBy] = useState('');

    useEffect(() => {
        fetchStoreUsers();
    }, []);

    useEffect(() => {
        if (tabValue === 1) fetchGatewayPasses();
        else {
            if (passDirection === 'Inward') fetchApprovedPOs();
            else fetchQualityChecks();
        }
    }, [tabValue, orderType, npoSubType, passDirection, outwardCategory]);

    const fetchStoreUsers = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallstoreuserds2?colid=${global1.colid}`);
            setStoreUsers(res.data.data.storeUsers || []);
        } catch (e) { console.error(e); }
    };

    const fetchApprovedPOs = async () => {
        setLoading(true);
        try {
            const response = await ep1.get(`/api/v2/getallstorepoorderds2?colid=${global1.colid}`);
            
            if (response.data.success) {
                const allPos = response.data.data.poOrders || [];

                // Filter for 'Approved', 'Auto Approved', or 'Partially Delivered'
                const activePOs = allPos.filter(p => 
                    p.postatus === 'Approved' || 
                    p.postatus === 'Auto Approved' || 
                    p.postatus === 'Partially Delivered' ||
                    p.postatus === 'Completed'
                );

                let filtered = [];
                if (orderType === 'PO') {
                    // Standard POs (no localOrderType)
                    filtered = activePOs.filter(p => !p.localOrderType);
                } else if (orderType === 'NPO') {
                    // Filter by specific sub-type (LPO, Cash Memo, Imprest)
                    filtered = activePOs.filter(p => p.localOrderType === npoSubType);
                }

                setApprovedPOs(filtered.map(p => ({ ...p, id: p._id })));
            }
        } catch (error) {
            console.error('Error fetching approved POs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchQualityChecks = async () => {
        setLoading(true);
        try {
            const res = await ep1.get(`/api/v2/getallqualitycheckds2?colid=${global1.colid}`);
            const all = res.data.data || [];
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
                setGatewayPasses(response.data.data.map(p => ({ ...p, id: p._id })));
            }
        } catch (error) {
            console.error('Error fetching gateway passes:', error);
        } finally {
            setLoading(false);
        }
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
            alert('Please fill Vehicle No, Driver Name, and Invoice No.');
            return;
        }

        const date = new Date();
        const passNo = `GP-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(Date.now()).slice(-4)}`;

        const payload = {
            passNumber: passNo, passType: passDirection, colid: global1.colid,
            poid: selectedPO.poid || selectedPO.woPoNo || 'N/A',
            vendorName: selectedPO.vendorname || selectedPO.vendor || selectedPO.partyName || 'N/A',
            vehicleNo, deliveryPersonName: driverName, contactNo, dcInvoiceNo, remarks, remarkType,
            securityName: global1.name || global1.user || 'Security Guard',
            items: poItems, orderType: orderType, npoSubType: orderType === 'NPO' ? npoSubType : '',
            storeName: selectedPO.storename || selectedPO.storeName || '',
            returnCategory: passDirection === 'Outward' ? outwardCategory : '',
            shiftFrom, shiftTo, totalTrip, purpose, authorizedBy, expectedDateOfReturn, materialTakenBy
        };

        try {
            await ep1.post('/api/v2/addgatewaypass2', payload);
            alert('Gateway Pass Generated Successfully: ' + passNo);
            setOpenPassModal(false);
            fetchGatewayPasses();
            fetchApprovedPOs();
        } catch (error) {
            console.error('Error generating gate pass:', error);
            alert('Failed to generate gate pass.');
        }
    };

    const handlePrint = (pass) => {
        if (pass.passType === 'Inward') {
            return alert("Inward Passes don't have a designated outbound format.");
        }
        
        if (pass.returnCategory === 'Institution Movement') {
            printIMPass(pass);
        } else if (pass.returnCategory === 'RGP') {
            printRGPPass(pass);
        } else {
            // Default to NRGP register format
            printNRGPPass(pass);
        }
    };

    const printIMPass = (pass) => {
        const printWindow = window.open('', '_blank');
        const itemsHtml = (pass.items || []).map((item, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${item.itemname}</td>
                <td>${item.unit}</td>
                <td>${item.deliveredQuantity}</td>
                <td>${item.remarks || ''}</td>
            </tr>`).join('');

        printWindow.document.write(`
            <html><head><title>Institution Movement Pass</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                .container { max-width: 800px; margin: 0 auto; border: 2px solid #000; padding: 30px; position: relative; }
                .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
                .header h1 { margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px; }
                .header p { margin: 5px 0; font-size: 14px; color: #555; }
                .top-meta { display: flex; justify-content: space-between; margin-bottom: 25px; font-weight: bold; font-size: 16px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #000; padding: 12px 15px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; text-transform: uppercase; font-size: 13px; }
                .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0; }
                .detail-item { font-size: 15px; }
                .detail-item span { font-weight: bold; display: inline-block; width: 140px; }
                .footer { margin-top: 50px; display: flex; justify-content: space-between; text-align: center; }
                .sig-box { border-top: 1px solid #000; width: 200px; padding-top: 10px; font-weight: bold; font-size: 14px; }
                @media print { body { padding: 0; } .container { border: none; } }
            </style>
            </head><body>
            <div class="container">
                <div class="header">
                    <h1>Institution Movement Pass</h1>
                    <p>Internal Tracking Document</p>
                </div>
                <div class="top-meta">
                    <div>PASS NO: ${pass.passNumber}</div>
                    <div>DATE: ${new Date(pass.createdAt).toLocaleDateString()}</div>
                </div>
                <div class="details-grid">
                    <div class="detail-item"><span>Shift From:</span> ${pass.shiftFrom || 'N/A'}</div>
                    <div class="detail-item"><span>Shift To:</span> ${pass.shiftTo || 'N/A'}</div>
                    <div class="detail-item"><span>Taken By:</span> ${pass.materialTakenBy || 'N/A'}</div>
                    <div class="detail-item"><span>Total Trips:</span> ${pass.totalTrip || 'N/A'}</div>
                </div>
                <table>
                    <thead><tr><th>Sr.</th><th>Item Description</th><th>Unit</th><th>Qty</th><th>Remarks</th></tr></thead>
                    <tbody>${itemsHtml}</tbody>
                </table>
                <div class="footer">
                    <div class="sig-box">Receiver's Signature</div>
                    <div class="sig-box">Authorized Signatory</div>
                </div>
            </div>
            <script>window.print();</script>
            </body></html>
        `);
        printWindow.document.close();
    };

    const printNRGPPass = (pass) => {
        const printWindow = window.open('', '_blank');
        const itemsHtml = (pass.items || []).map((item, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${item.itemname}</td>
                <td>${item.unit}</td>
                <td>${item.deliveredQuantity}</td>
                <td>NRGP</td>
            </tr>`).join('');

        printWindow.document.write(`
            <html><head><title>NRGP Register</title>
            <style>
                @page { size: landscape; margin: 10mm; }
                body { font-family: 'Arial', sans-serif; padding: 10px; }
                .title { text-align: center; font-size: 24px; font-weight: bold; text-decoration: underline; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; table-layout: fixed; }
                th, td { border: 1px solid #000; padding: 10px; text-align: center; font-size: 13px; word-wrap: break-word; }
                th { background: #eee; }
                .header-info { display: flex; justify-content: space-between; margin-bottom: 15px; font-weight: bold; }
            </style>
            </head><body>
            <div class="title">NON-RETURNABLE GATE PASS (NRGP) REGISTER</div>
            <div class="header-info">
                <div>Gate Pass No: ${pass.passNumber}</div>
                <div>Date: ${new Date(pass.createdAt).toLocaleDateString()}</div>
                <div>Authorized By: ${pass.authorizedBy || 'Admin'}</div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 50px;">Sl No.</th>
                        <th>Description of Material</th>
                        <th style="width: 80px;">Unit</th>
                        <th style="width: 80px;">Qty</th>
                        <th>Receiver / Vehicle</th>
                        <th>Store Name</th>
                        <th style="width: 150px;">Sign of Store Officer</th>
                        <th style="width: 150px;">Sign of Security</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td>Multiple Items (See Table Below)</td>
                        <td>-</td>
                        <td>-</td>
                        <td>${pass.deliveryPersonName} / ${pass.vehicleNo}</td>
                        <td>${pass.storeName || 'N/A'}</td>
                        <td></td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
            <h3 style="margin-top:20px;">Itemized Details:</h3>
            <table>
                <thead><tr><th style="width: 50px;">No.</th><th>Item Name</th><th style="width: 80px;">Unit</th><th style="width: 80px;">Qty</th><th>Category</th></tr></thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            <script>window.print();</script>
            </body></html>
        `);
        printWindow.document.close();
    };

    const printRGPPass = (pass) => {
        const printWindow = window.open('', '_blank');
        const itemsHtml = (pass.items || []).map((item, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${item.itemname}</td>
                <td>${item.unit}</td>
                <td>${item.deliveredQuantity}</td>
                <td>${pass.expectedDateOfReturn ? new Date(pass.expectedDateOfReturn).toLocaleDateString() : 'N/A'}</td>
                <td>Pending</td>
            </tr>`).join('');

        printWindow.document.write(`
            <html><head><title>RGP Register</title>
            <style>
                @page { size: landscape; margin: 10mm; }
                body { font-family: 'Arial', sans-serif; padding: 10px; }
                .title { text-align: center; font-size: 24px; font-weight: bold; color: #b71c1c; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #000; padding: 8px; text-align: center; font-size: 12px; }
                th { background: #ffebee; }
                .meta { display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: bold; }
            </style>
            </head><body>
            <div class="title">RETURNABLE GATE PASS (RGP) REGISTER</div>
            <div class="meta">
                <div>Pass Number: ${pass.passNumber}</div>
                <div>Origin Store: ${pass.storeName || 'N/A'}</div>
                <div>Vehicle/Person: ${pass.vehicleNo} / ${pass.deliveryPersonName}</div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th rowspan="2">Sl No</th>
                        <th rowspan="2">Item Name</th>
                        <th rowspan="2">Unit</th>
                        <th rowspan="2">Qty Sent</th>
                        <th rowspan="2">Expected Return Date</th>
                        <th colspan="3">Return Details</th>
                        <th rowspan="2">Purpose</th>
                    </tr>
                    <tr>
                        <th>Date</th>
                        <th>Qty Recv</th>
                        <th>Balance</th>
                    </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            <div style="margin-top: 30px; display: flex; justify-content: space-between;">
                <div style="border-top: 1px solid #000; width: 250px; text-align: center;">Security Sign & Stamp</div>
                <div style="border-top: 1px solid #000; width: 250px; text-align: center;">Authorized By: ${pass.authorizedBy || ''}</div>
            </div>
            <script>window.print();</script>
            </body></html>
        `);
        printWindow.document.close();
    };

    const columns = [
        { field: 'poid', headerName: 'PO Number', width: 200 },
        { field: 'storename', headerName: 'Store Name', width: 200 },
        { 
            field: 'vendorname', 
            headerName: 'Vendor', 
            width: 250, 
            valueGetter: (params) => params.row.vendorname || params.row.vendor || 'N/A'
        },
        { field: 'localOrderType', headerName: 'Type', width: 150, renderCell: (params) => (
            <Chip 
                label={params.value || 'Standard PO'} 
                color={params.value ? "secondary" : "primary"} 
                size="small" 
                variant="outlined" 
            />
        )},
        { field: 'postatus', headerName: 'Status', width: 150, renderCell: (params) => (
            <Chip 
                label={params.value} 
                color={params.value === 'Approved' || params.value === 'Auto Approved' ? "success" : "warning"} 
                size="small" 
            />
        )},
        { 
            field: 'createdAt', 
            headerName: 'Date', 
            width: 130, 
            valueFormatter: (params) => {
                const dt = params?.value || params?.row?.updatedate || params?.row?.date;
                return dt ? new Date(dt).toLocaleDateString('en-GB') : 'N/A';
            } 
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <Button 
                    variant="contained" 
                    size="small" 
                    onClick={() => handleOpenPassModal(params.row)}
                >
                    Generate Pass
                </Button>
            )
        }
    ];

    const historyColumns = [
        { field: 'passNumber', headerName: 'Pass No', width: 180 },
        { field: 'poid', headerName: 'PO No', width: 150 },
        { field: 'storeName', headerName: 'Store Name', width: 150 },
        { field: 'vendorName', headerName: 'Vendor', width: 200 },
        { field: 'passType', headerName: 'Direction', width: 120 },
        { field: 'returnCategory', headerName: 'Category', width: 120 },
        { field: 'vehicleNo', headerName: 'Vehicle', width: 120 },
        { field: 'createdAt', headerName: 'Date', width: 180, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString('en-GB') : 'N/A' },
        {
            field: 'actions', headerName: 'Print', width: 120, renderCell: (params) => (
                <Button variant="outlined" size="small" onClick={() => handlePrint(params.row)}>
                    Print
                </Button>
            )
        }
    ];

    const qcColumns = [
        { field: 'inspectionId', headerName: 'Inspection ID', width: 180 },
        { field: 'grnNo', headerName: 'GRN No', width: 160 },
        { field: 'storeName', headerName: 'Store Name', width: 160 },
        { field: 'partyName', headerName: 'Vendor/Party', width: 220 },
        { field: 'inspectionDate', headerName: 'QC Date', width: 130, valueFormatter: (p) => p.value ? new Date(p.value).toLocaleDateString() : '' },
        { field: 'actions', headerName: 'Actions', width: 150, renderCell: (p) => <Button variant="contained" size="small" onClick={() => handleOpenPassModal(p.row)}>Create Return Pass</Button> }
    ];

    return (
        <Box sx={{ p: 3, pt: 10, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1a237e' }}>
                Gateway Security Station
            </Typography>

            <Paper sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} indicatorColor="primary" textColor="primary">
                    <Tab label="Inward Shipments" />
                    <Tab label="Gate Pass History" />
                </Tabs>
            </Paper>

            {tabValue === 0 && (
                <Box>
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={3}>
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
                                    <Grid item xs={12} md={3}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Order Group</InputLabel>
                                            <Select value={orderType} label="Order Group" onChange={(e) => setOrderType(e.target.value)}>
                                                <MenuItem value="PO">Standard PO</MenuItem>
                                                <MenuItem value="NPO">NPO (Local)</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    {orderType === 'NPO' && (
                                        <Grid item xs={12} md={3}>
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
                                <Grid item xs={12} md={3}>
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
                            <Grid item>
                                <Button variant="outlined" onClick={fetchApprovedPOs}>Refresh</Button>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper sx={{ height: 500, width: '100%' }}>
                        <DataGrid 
                            rows={passDirection === 'Inward' ? approvedPOs : qualityChecks} 
                            columns={passDirection === 'Inward' ? columns : qcColumns} 
                            loading={loading} 
                            disableRowSelectionOnClick 
                        />
                    </Paper>
                </Box>
            )}

            {tabValue === 1 && (
                <Paper sx={{ height: 600, width: '100%' }}>
                    <DataGrid rows={gatewayPasses} columns={historyColumns} loading={loading} />
                </Paper>
            )}

            {/* Gate Pass Generation Modal */}
            <Dialog open={openPassModal} onClose={() => setOpenPassModal(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#1a237e', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Generate {passDirection} Gate Pass {passDirection === 'Outward' ? `(${outwardCategory})` : ''}
                    <IconButton onClick={() => setOpenPassModal(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">PO Number:</Typography>
                            <Typography variant="h6">{selectedPO?.poid}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">Vendor:</Typography>
                            <Typography variant="h6">{selectedPO?.vendorname || selectedPO?.vendor}</Typography>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Vehicle No" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} required />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Driver/Person Name" value={driverName} onChange={(e) => setDriverName(e.target.value)} required />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Contact No" value={contactNo} onChange={(e) => setContactNo(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Invoice / DC No" value={dcInvoiceNo} onChange={(e) => setDcInvoiceNo(e.target.value)} required />
                        </Grid>
                        {passDirection === 'Outward' && (
                            <>
                                <Grid item xs={12}><Typography variant="subtitle2" sx={{ mt: 1, color: 'secondary.main' }}>Outward Details ({outwardCategory})</Typography></Grid>
                                
                                {outwardCategory === 'Internal' && (
                                    <>
                                        <Grid item xs={12} md={4}><TextField fullWidth label="Shift From" size="small" value={shiftFrom} onChange={e => setShiftFrom(e.target.value)} /></Grid>
                                        <Grid item xs={12} md={4}><TextField fullWidth label="Shift To" size="small" value={shiftTo} onChange={e => setShiftTo(e.target.value)} /></Grid>
                                        <Grid item xs={12} md={4}><TextField fullWidth label="Total Trip" size="small" value={totalTrip} onChange={e => setTotalTrip(e.target.value)} /></Grid>
                                    </>
                                )}

                                <Grid item xs={12} md={4}>
                                    <TextField 
                                        fullWidth 
                                        size="small" 
                                        label="Material Taken By" 
                                        value={materialTakenBy} 
                                        onChange={e => setMaterialTakenBy(e.target.value)} 
                                    />
                                </Grid>

                                <Grid item xs={12} md={4}><TextField fullWidth label="Authorized By" size="small" value={authorizedBy} onChange={e => setAuthorizedBy(e.target.value)} /></Grid>
                                
                                {outwardCategory === 'RGP' && (
                                    <>
                                        <Grid item xs={12} md={4}><TextField fullWidth type="date" label="Expected Date of Return" InputLabelProps={{ shrink: true }} size="small" value={expectedDateOfReturn} onChange={e => setExpectedDateOfReturn(e.target.value)} /></Grid>
                                        <Grid item xs={12} md={12}><TextField fullWidth label="Purpose" size="small" value={purpose} onChange={e => setPurpose(e.target.value)} /></Grid>
                                    </>
                                )}
                            </>
                        )}

                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Remark Type</InputLabel>
                                <Select value={remarkType} label="Remark Type" onChange={(e) => setRemarkType(e.target.value)}>
                                    <MenuItem value="Countable">Countable</MenuItem>
                                    <MenuItem value="Non Countable">Non Countable</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>Items Checklist</Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableRow>
                                            <TableCell>Item Name</TableCell>
                                            <TableCell>Code</TableCell>
                                            <TableCell align="right">Expected Qty</TableCell>
                                            <TableCell align="right" sx={{ width: 150 }}>Received Qty</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {poItems.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{item.itemname}</TableCell>
                                                <TableCell>{item.itemcode}</TableCell>
                                                <TableCell align="right">{item.expectedQuantity} {item.unit}</TableCell>
                                                <TableCell align="right">
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        value={item.deliveredQuantity}
                                                        onChange={(e) => {
                                                            const newItems = [...poItems];
                                                            newItems[idx].deliveredQuantity = e.target.value;
                                                            setPoItems(newItems);
                                                        }}
                                                        sx={{ width: 80 }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField fullWidth multiline rows={2} label="Security Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenPassModal(false)}>Cancel</Button>
                    <Button variant="contained" color="primary" size="large" onClick={handleCreatePass}>Confirm & Generate Pass</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GatewaySecurityDashboardds2;
