import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, TextField, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ep1 from '../api/ep1';
import global1 from './global1';

const LocalGRNds2 = () => {
    const [gatePasses, setGatePasses] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // GRN Modal State
    const [openGRNModal, setOpenGRNModal] = useState(false);
    const [selectedPass, setSelectedPass] = useState(null);
    const [grnRemarks, setGrnRemarks] = useState('');
    const [receivedBy, setReceivedBy] = useState(global1.name || global1.user || '');

    useEffect(() => {
        fetchOpenGatePasses();
    }, []);

    const fetchOpenGatePasses = async () => {
        setLoading(true);
        try {
            const res = await ep1.get(`/api/v2/getallgatewaypasses2?colid=${global1.colid}`);
            const passes = res.data.data || [];
            // Filter: Inward, Open, and associated with a Local PO (or keep it broad for all PO types that use this flow)
            // But specifically for Local GRN, we want those that are Inward and Open.
            setGatePasses(passes.filter(p => p.passType === 'Inward' && p.status === 'Open').map(p => ({ ...p, id: p._id })));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenGRN = (pass) => {
        setSelectedPass(pass);
        setGrnRemarks('');
        setOpenGRNModal(true);
    };

    const handleSubmitGRN = async () => {
        if (!selectedPass) return;
        try {
            const date = new Date();
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const uniq = String(Date.now()).slice(-4);
            const grnNo = `GRN-${yyyy}${mm}${uniq}`;

            const grnData = {
                grnNo: grnNo,
                lpoId: selectedPass.poid,
                gatePassNumber: selectedPass.passNumber, // New linking field
                storeid: selectedPass.storeId || '', // Assumes storeId was saved in Gate Pass
                storeName: selectedPass.storeName || '',
                vendorName: selectedPass.vendorName,
                items: selectedPass.items.map(i => ({
                    itemname: i.itemname,
                    quantity: i.deliveredQuantity,
                    unit: i.unit,
                    remarks: i.remarks
                })),
                receivedBy: receivedBy,
                colid: global1.colid
            };

            await ep1.post('/api/v2/addlocalgrnds2', grnData);
            
            alert(`Local GRN ${grnNo} Created Successfully!`);
            setOpenGRNModal(false);
            fetchOpenGatePasses();
        } catch (e) {
            console.error(e);
            alert("Failed to create GRN: " + (e.response?.data?.message || e.message));
        }
    };

    const columns = [
        { field: 'passNumber', headerName: 'Pass #', width: 150 },
        { field: 'poid', headerName: 'Order/PO #', width: 150 },
        { field: 'npoType', headerName: 'Order Type', width: 130, renderCell: (params) => (
            <Chip label={params.value || (params.row.orderType === 'PO' ? 'Standard PO' : 'N/A')} color="primary" variant="outlined" size="small" />
        )},
        { field: 'vendorName', headerName: 'Vendor', width: 200 },
        { field: 'dcInvoiceNo', headerName: 'DC/Inv No', width: 150 },
        { field: 'remarkType', headerName: 'Rmk Type', width: 130 },
        { field: 'createdAt', headerName: 'Date', width: 180, valueFormatter: (params) => new Date(params.value).toLocaleString('en-GB') },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <Button 
                    variant="contained" 
                    size="small" 
                    startIcon={<ReceiptIcon />}
                    onClick={() => handleOpenGRN(params.row)}
                >
                    Create GRN
                </Button>
            )
        }
    ];

    return (
        <Box sx={{ p: 3, pt: 10, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#1a237e' }}>
                Local GRN Management (Gate Pass Based)
            </Typography>

            <Paper sx={{ height: 600, width: '100%', borderRadius: 2 }}>
                <DataGrid
                    rows={gatePasses}
                    columns={columns}
                    loading={loading}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    disableRowSelectionOnClick
                />
            </Paper>

            {/* GRN Creation Modal */}
            <Dialog open={openGRNModal} onClose={() => setOpenGRNModal(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#1a237e', color: 'white' }}>
                    Generate Local GRN - Pass #{selectedPass?.passNumber}
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">Vendor</Typography>
                            <Typography variant="body1"><b>{selectedPass?.vendorName}</b></Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">Order Ref</Typography>
                            <Typography variant="body1"><b>{selectedPass?.poid} ({selectedPass?.orderType})</b></Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">DC / Invoice No</Typography>
                            <Typography variant="body1"><b>{selectedPass?.dcInvoiceNo}</b></Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">Remark Type</Typography>
                            <Typography variant="body1"><b>{selectedPass?.remarkType}</b></Typography>
                        </Grid>
                    </Grid>

                    <Typography variant="h6" sx={{ mb: 2 }}>Received Items</Typography>
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell><b>Item Name</b></TableCell>
                                    <TableCell><b>Unit</b></TableCell>
                                    <TableCell align="right"><b>Delivered Qty</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selectedPass?.items?.map((item, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{item.itemname}</TableCell>
                                        <TableCell>{item.unit}</TableCell>
                                        <TableCell align="right">{item.deliveredQuantity}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TextField 
                        fullWidth 
                        label="Received By" 
                        sx={{ mt: 3 }} 
                        value={receivedBy} 
                        onChange={(e) => setReceivedBy(e.target.value)} 
                    />
                    <TextField 
                        fullWidth 
                        label="Internal Remarks" 
                        multiline 
                        rows={2} 
                        sx={{ mt: 2 }} 
                        value={grnRemarks} 
                        onChange={(e) => setGrnRemarks(e.target.value)} 
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenGRNModal(false)}>Cancel</Button>
                    <Button variant="contained" color="success" onClick={handleSubmitGRN} sx={{ px: 4 }}>
                        Save & Send to Quality Check
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LocalGRNds2;
