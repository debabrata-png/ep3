import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, TextField, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, IconButton, MenuItem,
    Select, FormControl, InputLabel, Autocomplete, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ep1 from '../api/ep1';
import global1 from './global1';

const LocalPurchaseds2 = () => {
    const [loading, setLoading] = useState(false);
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [allItems, setAllItems] = useState([]);
    const [budgetHeads, setBudgetHeads] = useState([]);
    const [myCashBalance, setMyCashBalance] = useState(0);
    const [approvalThreshold, setApprovalThreshold] = useState(5000);

    const [orderType, setOrderType] = useState('LPO'); // LPO, Cash Memo, Imprest
    const [vendor, setVendor] = useState('');
    const [budgetHead, setBudgetHead] = useState('');
    const [approxAmount, setApproxAmount] = useState('');
    
    const [cart, setCart] = useState([]);
    const [currentItem, setCurrentItem] = useState(null);
    const [currentQty, setCurrentQty] = useState('');
    const [currentUnit, setCurrentUnit] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Mapped Stores
            const mapRes = await ep1.get(`/api/v2/getallstoreuserds2?colid=${global1.colid}`);
            const mappings = mapRes.data.data.storeUsers || [];
            const userMappings = mappings.filter(m => m.user === global1.user || m.userid === global1.user);
            
            const storeRes = await ep1.get(`/api/v2/getallstoremasterds2?colid=${global1.colid}`);
            const allStores = storeRes.data.data.stores || [];
            
            let myStores = [];
            if (userMappings.length > 0) {
                const allowedIds = userMappings.map(m => m.storeid);
                myStores = allStores.filter(s => allowedIds.includes(s._id));
            } else {
                myStores = allStores; // Admin fallback
            }
            setStores(myStores);
            if (myStores.length > 0) setSelectedStore(myStores[0]);

            // 2. Fetch All Items for dropdown
            const itemRes = await ep1.get(`/api/v2/getallitemmasterds2?colid=${global1.colid}`);
            setAllItems(itemRes.data.data.items || []);

        } catch (e) {
            console.error(e);
            alert("Error loading initial data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedStore) {
            fetchStoreContext(selectedStore._id);
        }
    }, [selectedStore]);

    const fetchStoreContext = async (storeid) => {
        try {
            // Cash Balance & Threshold
            const cashRes = await ep1.get(`/api/v2/getstorecashaccounts2?colid=${global1.colid}&storeid=${storeid}`);
            const account = cashRes.data.data?.[0];
            setMyCashBalance(account ? account.balance : 0);
            setApprovalThreshold(account ? (account.approvalThreshold || 5000) : 5000);

            // Budgets
            const budgetRes = await ep1.get(`/api/v2/getstorebudgets2?colid=${global1.colid}&storeid=${storeid}`);
            setBudgetHeads(budgetRes.data.data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddToCart = () => {
        if (!currentItem || !currentQty) return;
        const newItem = {
            itemid: currentItem._id,
            itemcode: currentItem.itemcode,
            itemname: currentItem.itemname,
            quantity: Number(currentQty),
            unit: currentUnit || currentItem.unit || 'Nos',
            type: currentItem.itemtype
        };
        setCart([...cart, newItem]);
        setCurrentItem(null);
        setCurrentQty('');
        setCurrentUnit('');
    };

    const handleRemoveFromCart = (index) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const handleSubmitOrder = async () => {
        if (!selectedStore) return alert("Select Store");
        if (!vendor || !budgetHead || !approxAmount || cart.length === 0) {
            return alert("Please fill all fields and add at least one item.");
        }

        const amount = Number(approxAmount);
        const requiresApproval = amount > approvalThreshold;

        // Validation for Auto-Approval
        if (!requiresApproval && amount > myCashBalance) {
            return alert("Insufficient Cash Balance in Store Account for Auto-Approval.");
        }

        try {
            const yyyy = new Date().getFullYear();
            const mm = String(new Date().getMonth() + 1).padStart(2, '0');
            const uniq = String(Date.now()).slice(-4);
            const lpoNum = `PU-${yyyy}${mm}${uniq}`;

            const poPayload = {
                name: `${orderType}-${lpoNum}`,
                vendorname: vendor,
                vendor: vendor,
                year: yyyy.toString(),
                poid: lpoNum,
                postatus: requiresApproval ? 'Pending Approval' : 'Auto Approved',
                poType: 'Local',
                localOrderType: orderType, // New field: LPO, Cash Memo, Imprest
                deliveryType: 'Direct Local',
                colid: global1.colid,
                user: global1.user,
                price: amount,
                netprice: amount,
                actualAmount: 0,
                creatorName: global1.name || global1.user,
                storeid: selectedStore._id,
                storename: selectedStore.storename || selectedStore.name,
                budgetHeadId: budgetHead
            };

            await ep1.post('/api/v2/addstorepoorderds2', poPayload);

            if (!requiresApproval) {
                // Deduct cash automatically
                await ep1.post('/api/v2/deductcashforlocalpo2', {
                    poid: lpoNum,
                    colid: global1.colid,
                    actualAmount: amount
                });
            }

            // Create inventory entry (placeholder) and PO Item record
            for (const item of cart) {
                // 1. Add to Store PO Items (so it shows in Gate Pass checklist)
                await ep1.post('/api/v2/addstorepoitemsds2', {
                    colid: global1.colid,
                    user: global1.user,
                    name: global1.name || global1.user,
                    poid: lpoNum,
                    itemid: item.itemid,
                    itemcode: item.itemcode,
                    itemname: item.itemname,
                    unit: item.unit,
                    quantity: item.quantity,
                    price: amount / cart.length / item.quantity, // Rough estimate of unit price
                    netprice: amount / cart.length, // Rough estimate of total for this item
                    remarks: `Local Purchase: ${lpoNum}`
                });

                // 2. Add to Store Item tracking
                await ep1.post('/api/v2/addstoreitemds2', {
                    colid: global1.colid,
                    user: global1.user,
                    name: global1.name || global1.user,
                    storeid: selectedStore._id,
                    storename: selectedStore.storename || selectedStore.name,
                    itemid: item.itemid,
                    itemcode: item.itemcode,
                    itemname: item.itemname,
                    quantity: 0, // Increases after GRN
                    type: item.type,
                    status: requiresApproval ? 'Awaiting Approval' : 'Awaiting Delivery (GRN)',
                    remarks: `${orderType}: ${lpoNum}`
                });
            }

            alert(requiresApproval ? `${orderType} Created & Sent for Approval (Excceeds ₹${approvalThreshold})` : `${orderType} Auto-Approved & Cash Deducted.`);
            
            // Reset Form
            setCart([]);
            setVendor('');
            setBudgetHead('');
            setApproxAmount('');
        } catch (e) {
            console.error(e);
            alert("Failed to create order: " + (e.response?.data?.message || e.message));
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 3, pt: 10, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#1a237e' }}>
                Local Purchase Management
            </Typography>

            <Grid container spacing={3}>
                {/* Left Panel: Details */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Order Information</Typography>
                        
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Mapped Store</InputLabel>
                            <Select
                                value={selectedStore?._id || ''}
                                label="Mapped Store"
                                onChange={(e) => setSelectedStore(stores.find(s => s._id === e.target.value))}
                            >
                                {stores.map(s => <MenuItem key={s._id} value={s._id}>{s.name || s.storename}</MenuItem>)}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Order Type</InputLabel>
                            <Select
                                value={orderType}
                                label="Order Type"
                                onChange={(e) => setOrderType(e.target.value)}
                            >
                                <MenuItem value="LPO">Local Purchase Order (LPO)</MenuItem>
                                <MenuItem value="Cash Memo">Cash Memo</MenuItem>
                                <MenuItem value="Imprest">Imprest</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField fullWidth label="Vendor Name" value={vendor} onChange={(e) => setVendor(e.target.value)} sx={{ mb: 2 }} />

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Budget Head</InputLabel>
                            <Select
                                value={budgetHead}
                                label="Budget Head"
                                onChange={(e) => setBudgetHead(e.target.value)}
                            >
                                {budgetHeads.map(b => (
                                    <MenuItem key={b._id} value={b._id}>
                                        {b.headName} (Avail: ₹{b.availableBudget})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Estimated/Approx Amount (₹)"
                            type="number"
                            value={approxAmount}
                            onChange={(e) => setApproxAmount(e.target.value)}
                            sx={{ mb: 3 }}
                        />

                        <Box sx={{ p: 2, bgcolor: '#e8eaf6', borderRadius: 1 }}>
                            <Typography variant="body2"><b>Store Cash Balance:</b> ₹{myCashBalance}</Typography>
                            <Typography variant="body2"><b>Auto-Approve Limit:</b> ₹{approvalThreshold}</Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* Right Panel: Items Cart */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Item Selection</Typography>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={6}>
                                <Autocomplete
                                    options={allItems}
                                    getOptionLabel={(option) => `${option.itemname} (${option.itemcode})`}
                                    value={currentItem}
                                    onChange={(e, val) => setCurrentItem(val)}
                                    renderInput={(params) => <TextField {...params} label="Search Item" />}
                                />
                            </Grid>
                            <Grid item xs={6} sm={2}>
                                <TextField label="Qty" type="number" fullWidth value={currentQty} onChange={(e) => setCurrentQty(e.target.value)} />
                            </Grid>
                            <Grid item xs={6} sm={2}>
                                <TextField label="Unit" fullWidth value={currentUnit} onChange={(e) => setCurrentUnit(e.target.value)} />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <Button variant="contained" fullWidth sx={{ height: '56px' }} onClick={handleAddToCart}>Add</Button>
                            </Grid>
                        </Grid>

                        <TableContainer sx={{ mb: 3, maxHeight: 400 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><b>Item Name</b></TableCell>
                                        <TableCell><b>Code</b></TableCell>
                                        <TableCell><b>Qty</b></TableCell>
                                        <TableCell><b>Unit</b></TableCell>
                                        <TableCell align="right"><b>Action</b></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {cart.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{row.itemname}</TableCell>
                                            <TableCell>{row.itemcode}</TableCell>
                                            <TableCell>{row.quantity}</TableCell>
                                            <TableCell>{row.unit}</TableCell>
                                            <TableCell align="right">
                                                <IconButton color="error" onClick={() => handleRemoveFromCart(index)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {cart.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">No items added to cart</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            fullWidth
                            sx={{ py: 1.5, fontWeight: 'bold' }}
                            onClick={handleSubmitOrder}
                        >
                            Generate {orderType}
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default LocalPurchaseds2;
