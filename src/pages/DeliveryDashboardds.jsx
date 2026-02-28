import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';

import GRNTemplate from './GRNTemplate';
import { createRoot } from 'react-dom/client';

const DeliveryDashboardds = () => {
    const [approvedPOs, setApprovedPOs] = useState([]); // Force update
    const [loading, setLoading] = useState(false);
    const [selectedPO, setSelectedPO] = useState(null);
    const [poItems, setPoItems] = useState([]);
    const [openDeliveryModal, setOpenDeliveryModal] = useState(false);

    // Delivery Update State
    const [deliveryUpdates, setDeliveryUpdates] = useState({}); // { itemId: { received, returned, remarks } }
    const [docLink, setDocLink] = useState('');
    const [deliveryNote, setDeliveryNote] = useState('');

    // New Fields for GRN Format (Challan & Bill)
    const [challanNo, setChallanNo] = useState('');
    const [challanDate, setChallanDate] = useState('');
    const [billNo, setBillNo] = useState('');
    const [billDate, setBillDate] = useState('');

    useEffect(() => {
        // Restore global1 if missing
        if (!global1.colid && localStorage.getItem('colid')) {
            global1.colid = localStorage.getItem('colid');
            global1.user = localStorage.getItem('user');
            global1.name = localStorage.getItem('name');
        }
        fetchApprovedPOs();
    }, []);

    const fetchApprovedPOs = async () => {
        setLoading(true);
        try {
            // 1. Fetch User's Store Mappings
            const mapRes = await ep1.get(`/api/v2/getallstoreuserds?colid=${global1.colid}`);
            const mappings = mapRes.data.data.storeUsers || [];
            const userMappings = mappings.filter(m => m.user === global1.user);
            const userIsMapped = userMappings.length > 0;
            const allowedStoreIds = userMappings.map(m => m.storeid);
            const allowedStoreNames = userMappings.map(m => m.store);

            // 2. Fetch POs where status is Approved (or Partially Delivered?)
            const res = await ep1.get(`/api/v2/getallstorepoorderds?colid=${global1.colid}`);
            const allPOs = res.data.data.poOrders || [];

            // 3. Filter only Approved ones AND filter by Allowed Stores
            let approved = allPOs.filter(po => po.postatus === 'Approved' || po.postatus === 'Partially Delivered');

            if (userIsMapped) {
                approved = approved.filter(po =>
                    allowedStoreIds.includes(po.storeid) || allowedStoreNames.includes(po.storename)
                );
            }

            setApprovedPOs(approved.map(po => ({ ...po, id: po._id })));
        } catch (error) {
            console.error("Error fetching POs or store mappings:", error);
        }
        setLoading(false);
    };

    const handleOpenDelivery = async (po) => {
        setSelectedPO(po);
        setOpenDeliveryModal(true);
        setDeliveryUpdates({});
        setDocLink('');
        setDeliveryNote('');

        // Reset Challan/Bill fields
        setChallanNo('');
        setChallanDate('');
        setBillNo('');
        setBillDate('');

        try {
            const res = await ep1.get(`/api/v2/getallstorepoitemsds?colid=${global1.colid}`);
            const allItems = res.data.data.poItems || [];
            const myItems = allItems.filter(i => i.poid === po.poid);
            setPoItems(myItems);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateChange = (itemId, field, value) => {
        setDeliveryUpdates(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                [field]: value
            }
        }));
    };

    const submitDelivery = async () => {
        try {
            // 1. Update Each Item & Create Delivery Record
            for (const item of poItems) {
                const update = deliveryUpdates[item._id];
                if (update) {
                    // Create Delivery Record
                    await ep1.post('/api/v2/adddeliverydsds', {
                        name: item.itemname,
                        user: global1.user,
                        colid: global1.colid,
                        store: item.store || 'Main Store', // Default or fetch
                        storeid: item.storeid || '0',
                        poid: selectedPO.poid,
                        po: selectedPO.poid,
                        item: item.itemname,
                        itemcode: item.itemcode || '000',
                        delivered: update.received || '0',
                        accepted: update.received || '0', // Assuming accepted = received for now
                        return: update.returned || '0',
                        doclink: docLink,
                        deldate: new Date()
                    });
                }
            }

            // 2. Update PO Status
            await ep1.post(`/api/v2/updatestorepoorderds?id=${selectedPO._id}`, {
                postatus: 'Delivered', // Or check for partial
                deliveryNote: deliveryNote,
                doclink: docLink,
                colid: global1.colid
            });

            alert('Delivery Recorded Successfully');
            setOpenDeliveryModal(false);
            fetchApprovedPOs();

        } catch (error) {
            console.error('Error recording delivery:', error);
            alert('Failed to record delivery');
        }
    };

    const handlePrintGRN = (po, fromDialog = false) => {
        // Generate GRN Number: YYYY-MM-DD-Random
        const date = new Date();
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(1000 + Math.random() * 9000);
        // Prefix matching the example image somewhat or default
        const grnNumber = `GRNCSPU/ ${yyyy}${mm}${dd}${random}`;

        const printProcess = async () => {
            let itemsToPrint = [];

            if (fromDialog) {
                // Use current state from modal (Live Data)
                itemsToPrint = poItems.map(item => {
                    const update = deliveryUpdates[item._id] || {};
                    // Determine Price with Fallback
                    const finalPrice = item.price ? Number(item.price) :
                        (item.unitPriceWithTax ? Number(item.unitPriceWithTax) :
                            (item.total && item.quantity ? (Number(item.total) / Number(item.quantity)) : 0)
                        );

                    return {
                        ...item,
                        // Use entered values, or default to quantity/0
                        receivedQty: update.received ? Number(update.received) : item.quantity,
                        returnedQty: update.returned ? Number(update.returned) : 0,
                        // Use robustly determined price
                        unitPrice: finalPrice
                    };
                });
            } else {
                // Fetch from backend logic (Fallback)
                itemsToPrint = poItems;
                itemsToPrint = itemsToPrint.map(item => ({
                    ...item,
                    unitPrice: item.price || 0
                }));
            }

            // Gather Extra Data from Inputs
            const extraData = {
                challanNo,
                challanDate,
                billNo,
                billDate,
                deliveryNote
            };

            const printWindow = window.open('', '', 'height=800,width=800');
            printWindow.document.write('<html><head><title>Print GRN</title>');
            printWindow.document.write('</head><body><div id="print-root"></div></body></html>');
            printWindow.document.close();

            const root = createRoot(printWindow.document.getElementById('print-root'));
            root.render(<GRNTemplate poData={po} items={itemsToPrint} grnNumber={grnNumber} extraData={extraData} />);

            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
            }, 1000);
        };

        printProcess();
    };


    const generateColumns = (data) => {
        if (!data || data.length === 0) return [];
        const keys = Object.keys(data[0]);
        return keys
            .filter(key => key !== '_id' && key !== 'colid' && key !== 'id' && key !== '__v'
                && key !== 'approvalLog' && key !== 'doclink')
            .map(key => ({
                field: key,
                headerName: key.charAt(0).toUpperCase() + key.slice(1),
                width: 150
            }));
    };

    const columns = generateColumns(approvedPOs);
    // Action Column
    columns.push({
        field: 'actions',
        headerName: 'Actions',
        width: 250,
        renderCell: (params) => (
            <Box>
                <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    onClick={() => handleOpenDelivery(params.row)}
                    sx={{ mr: 1 }}
                >
                    Quality Check / Receive
                </Button>
            </Box>
        )
    });

    // Attachment Link Column
    columns.push({
        field: 'doclink',
        headerName: 'Attachment Link',
        width: 200,
        renderCell: (params) => (
            params.row.doclink ?
                <a href={params.row.doclink} target="_blank" rel="noopener noreferrer">View Attachment</a>
                : 'N/A'
        )
    });


    return (
        <Box p={3} sx={{ height: '85vh', width: '100%' }}>
            <Typography variant="h4" gutterBottom>Delivery & Quality Dashboard</Typography>
            <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={approvedPOs}
                    columns={columns}
                    pageSizeOptions={[10, 25, 50]}
                />
            </Paper>

            <Dialog open={openDeliveryModal} onClose={() => setOpenDeliveryModal(false)} maxWidth="md" fullWidth>
                <DialogTitle>Receive Delivery: {selectedPO?.poid}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>

                        {/* Challan & Bill Inputs */}
                        <Grid item xs={6} md={3}>
                            <TextField
                                label="Challan No"
                                fullWidth
                                size="small"
                                value={challanNo}
                                onChange={e => setChallanNo(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField
                                type="date"
                                label="Challan Date"
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                size="small"
                                value={challanDate}
                                onChange={e => setChallanDate(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField
                                label="Bill No"
                                fullWidth
                                size="small"
                                value={billNo}
                                onChange={e => setBillNo(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField
                                type="date"
                                label="Bill Date"
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                size="small"
                                value={billDate}
                                onChange={e => setBillDate(e.target.value)}
                            />
                        </Grid>


                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>Items Quality Check</Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Item</TableCell>
                                            <TableCell>Ordered Qty</TableCell>
                                            <TableCell>Unit Price</TableCell>
                                            <TableCell>Accepted Qty</TableCell>
                                            <TableCell>Returned Qty</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {poItems.map((item) => (
                                            <TableRow key={item._id}>
                                                <TableCell>{item.itemname}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                {/* Show Price - Robust Fallback */}
                                                <TableCell>
                                                    {item.price ? item.price :
                                                        (item.unitPriceWithTax ? item.unitPriceWithTax :
                                                            (item.total && item.quantity ? (item.total / item.quantity).toFixed(2) : 0)
                                                        )
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={deliveryUpdates[item._id]?.received || ''}
                                                        onChange={(e) => handleUpdateChange(item._id, 'received', e.target.value)}
                                                        inputProps={{ min: 0, max: item.quantity }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={deliveryUpdates[item._id]?.returned || ''}
                                                        onChange={(e) => handleUpdateChange(item._id, 'returned', e.target.value)}
                                                        inputProps={{ min: 0, max: item.quantity }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Delivery Note / Remarks"
                                fullWidth
                                multiline
                                rows={2}
                                value={deliveryNote}
                                onChange={(e) => setDeliveryNote(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Attachment Link"
                                fullWidth
                                placeholder="https://..."
                                value={docLink}
                                onChange={(e) => setDocLink(e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeliveryModal(false)}>Cancel</Button>
                    <Button
                        onClick={() => handlePrintGRN(selectedPO, true)}
                        variant="outlined"
                        color="secondary"
                    >
                        Print GRN
                    </Button>
                    <Button onClick={submitDelivery} variant="contained" color="success">Confirm Delivery</Button>
                </DialogActions>
            </Dialog >
        </Box >
    );
};

export default DeliveryDashboardds;
