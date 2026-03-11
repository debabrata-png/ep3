import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, TextField, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, Tabs, Tab, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import global1 from './global1';
import ep1 from '../api/ep1';

const LocalPurchaseManagerds2 = () => {
    const [tabValue, setTabValue] = useState(0);

    // Cash Accounts Data
    const [cashAccounts, setCashAccounts] = useState([]);
    const [stores, setStores] = useState([]);
    const [openCashModal, setOpenCashModal] = useState(false);
    const [cashForm, setCashForm] = useState({ storeid: '', balance: '', approvalThreshold: 5000 });

    // Head Types Data
    const [headTypes, setHeadTypes] = useState([]);
    const [openHeadTypeModal, setOpenHeadTypeModal] = useState(false);
    const [headTypeName, setHeadTypeName] = useState('');

    // Budget Heads Data
    const [budgets, setBudgets] = useState([]);
    const [openBudgetModal, setOpenBudgetModal] = useState(false);
    const [budgetForm, setBudgetForm] = useState({ headName: '', headType: '', storeid: '', allocatedBudget: '', financialYear: '' });

    // Pending LPOs Data
    const [pendingLPOs, setPendingLPOs] = useState([]);
    const [allLPOs, setAllLPOs] = useState([]);

    useEffect(() => {
        fetchStores();
        fetchHeadTypes();
    }, []);

    useEffect(() => {
        if (tabValue === 0) fetchCashAccounts();
        if (tabValue === 1) fetchBudgets();
        if (tabValue === 2) fetchHeadTypes();
        if (tabValue === 3) fetchPendingLPOs();
        if (tabValue === 4) fetchAllLPOs();
    }, [tabValue]);

    // Data Fetchers
    const fetchStores = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallstoremasterds2?colid=${global1.colid}`);
            setStores(res.data.data.stores || []);
        } catch (e) { console.error(e); }
    };

    const fetchCashAccounts = async () => {
        try {
            const res = await ep1.get(`/api/v2/getstorecashaccounts2?colid=${global1.colid}`);
            setCashAccounts(res.data.data.map(ca => ({ ...ca, id: ca._id })));
        } catch (e) { console.error(e); }
    };

    const fetchHeadTypes = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallheadtypeds2?colid=${global1.colid}`);
            setHeadTypes(res.data.data.map(ht => ({ ...ht, id: ht._id })));
        } catch (e) { console.error(e); }
    };

    const fetchBudgets = async () => {
        try {
            const res = await ep1.get(`/api/v2/getstorebudgets2?colid=${global1.colid}`);
            setBudgets(res.data.data.map(b => ({ ...b, id: b._id })));
        } catch (e) { console.error(e); }
    };

    const fetchPendingLPOs = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallstorepoorderds2?colid=${global1.colid}`);
            const pos = res.data.data.poOrders || [];
            setPendingLPOs(pos.filter(po => po.poType === 'Local' && po.postatus === 'Pending Approval').map(p => ({ ...p, id: p._id })));
        } catch (e) { console.error(e); }
    };

    const fetchAllLPOs = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallstorepoorderds2?colid=${global1.colid}`);
            const pos = res.data.data.poOrders || [];
            setAllLPOs(pos.filter(po => po.poType === 'Local').map(p => ({ ...p, id: p._id })));
        } catch (e) { console.error(e); }
    };

    // Handlers
    const handleSaveCash = async () => {
        try {
            const store = stores.find(s => s._id === cashForm.storeid);
            if (!store) return alert("Select Store");

            // Add or set cash account - adjust backend to handle thresholds or just rely on API balance adds (needs an update API for thresholds later, but for now just refill)
            // Currently backend adds to balance. Let's send the threshold as well.
            await ep1.post('/api/v2/addcashaccountbalance2', {
                storeid: cashForm.storeid,
                storeName: store.name || store.storename,
                colid: global1.colid,
                balance: Number(cashForm.balance),
                approvalThreshold: Number(cashForm.approvalThreshold),
                allocatedBy: global1.name || global1.user
            });
            setOpenCashModal(false);
            fetchCashAccounts();
        } catch (e) { alert(e.response?.data?.message || 'Error'); }
    };

    const handleSaveHeadType = async () => {
        try {
            await ep1.post('/api/v2/addheadtypeds2', { name: headTypeName, colid: global1.colid });
            setOpenHeadTypeModal(false);
            setHeadTypeName('');
            fetchHeadTypes();
        } catch (e) { alert(e.response?.data?.message || 'Error'); }
    };

    const handleDeleteHeadType = async (id) => {
        if (!window.confirm("Delete this Head Type?")) return;
        try {
            await ep1.post(`/api/v2/deleteheadtypeds2?id=${id}`);
            fetchHeadTypes();
        } catch (e) { console.error(e); }
    };

    const handleSaveBudget = async () => {
        try {
            await ep1.post('/api/v2/addstorebudget2', {
                ...budgetForm,
                allocatedBudget: Number(budgetForm.allocatedBudget),
                allocatedBy: global1.name || global1.user,
                colid: global1.colid
            });
            setOpenBudgetModal(false);
            fetchBudgets();
        } catch (e) { alert(e.response?.data?.message || 'Error'); }
    };

    const handleApproveLPO = async (poid) => {
        if (!window.confirm("Approve this Local Purchase?")) return;
        try {
            const res = await ep1.post('/api/v2/approvelpo2', {
                poid, colid: global1.colid, approvedBy: global1.name || global1.user
            });
            const actualAmt = res.data.data.actualAmount;

            // Deduct cash automatically upon approval
            await ep1.post('/api/v2/deductcashforlocalpo2', {
                poid, colid: global1.colid, actualAmount: actualAmt
            });
            alert("LPO Approved & Cash Deducted");
            fetchPendingLPOs();
        } catch (e) { alert(e.response?.data?.message || 'Error'); }
    };

    const handleRejectLPO = async (poid) => {
        const remarks = window.prompt("Rejection Remarks?");
        if (remarks === null) return;
        try {
            await ep1.post('/api/v2/rejectlpo2', {
                poid, colid: global1.colid, rejectedBy: global1.name || global1.user, remarks
            });
            fetchPendingLPOs();
        } catch (e) { alert(e.response?.data?.message || 'Error'); }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 10, bgcolor: '#f5f5f5', minHeight: '100vh' }}>

                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Higher Authority - Local Purchase Manager
                </Typography>

                <Paper sx={{ p: 2, mb: 2 }}>
                    <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} textColor="primary" indicatorColor="primary">
                        <Tab label="Store Cash Accounts" />
                        <Tab label="Budget Heads" />
                        <Tab label="Head Types Master" />
                        <Tab label="Pending LPOs" />
                        <Tab label="All LPOs" />
                    </Tabs>
                </Paper>

                {/* Tab 0 - Cash Accounts */}
                {tabValue === 0 && (
                    <Box>
                        <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpenCashModal(true)}>
                            Refill / Setup Cash Account
                        </Button>
                        <DataGrid
                            autoHeight
                            rows={cashAccounts}
                            columns={[
                                { field: 'storeName', headerName: 'Store', width: 250 },
                                { field: 'balance', headerName: 'Available Balance (₹)', width: 200 },
                                { field: 'approvalThreshold', headerName: 'Auto-Approve Threshold (₹)', width: 200 },
                                { field: 'lastRefillDate', headerName: 'Last Updated', width: 200, valueFormatter: (params) => new Date(params.value).toLocaleDateString('en-GB') },
                                { field: 'allocatedBy', headerName: 'Allocated By', width: 200 }
                            ]}
                        />
                    </Box>
                )}

                {/* Tab 1 - Budgets */}
                {tabValue === 1 && (
                    <Box>
                        <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpenBudgetModal(true)}>
                            Allocate New Budget
                        </Button>
                        <DataGrid
                            autoHeight
                            rows={budgets}
                            columns={[
                                { field: 'storeName', headerName: 'Store', width: 200 },
                                { field: 'headName', headerName: 'Budget Head', width: 200 },
                                { field: 'headType', headerName: 'Head Type', width: 150 },
                                { field: 'financialYear', headerName: 'FY', width: 120 },
                                { field: 'allocatedBudget', headerName: 'Allocated (₹)', width: 150 },
                                { field: 'utilizedBudget', headerName: 'Utilized (₹)', width: 150 },
                                { field: 'availableBudget', headerName: 'Available (₹)', width: 150 }
                            ]}
                        />
                    </Box>
                )}

                {/* Tab 2 - Head Types */}
                {tabValue === 2 && (
                    <Box>
                        <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpenHeadTypeModal(true)}>
                            Add Head Type
                        </Button>
                        <DataGrid
                            autoHeight
                            rows={headTypes}
                            columns={[
                                { field: 'name', headerName: 'Head Type Name', width: 300 },
                                { field: 'createdAt', headerName: 'Created Date', width: 200, valueFormatter: (params) => new Date(params.value).toLocaleDateString('en-GB') },
                                {
                                    field: 'actions', headerName: 'Actions', width: 150, renderCell: (params) => (
                                        <IconButton color="error" onClick={() => handleDeleteHeadType(params.row._id)}><DeleteIcon /></IconButton>
                                    )
                                }
                            ]}
                        />
                    </Box>
                )}

                {/* Tab 3 - Pending LPOs */}
                {tabValue === 3 && (
                    <Box>
                        <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                            These Local Purchases require higher authority approval because they exceed the store's auto-approval threshold or their actual amount was updated to be higher than estimated.
                        </Typography>
                        <DataGrid
                            autoHeight
                            rows={pendingLPOs}
                            columns={[
                                { field: 'poid', headerName: 'LPO Number', width: 150 },
                                { field: 'storename', headerName: 'Store', width: 200 },
                                { field: 'vendorname', headerName: 'Vendor', width: 200 },
                                { field: 'price', headerName: 'Approx Amt (₹)', width: 150 },
                                { field: 'actualAmount', headerName: 'Actual Amt (₹)', width: 150 },
                                {
                                    field: 'actions', headerName: 'Action', width: 200, renderCell: (params) => (
                                        <Box>
                                            <IconButton color="success" onClick={() => handleApproveLPO(params.row.poid)}><CheckCircleIcon /></IconButton>
                                            <IconButton color="error" onClick={() => handleRejectLPO(params.row.poid)}><CancelIcon /></IconButton>
                                        </Box>
                                    )
                                }
                            ]}
                        />
                    </Box>
                )}

                {/* Tab 4 - All LPOs */}
                {tabValue === 4 && (
                    <Box>
                        <DataGrid
                            autoHeight
                            rows={allLPOs}
                            columns={[
                                { field: 'poid', headerName: 'LPO Number', width: 150 },
                                { field: 'storename', headerName: 'Store', width: 150 },
                                { field: 'vendorname', headerName: 'Vendor', width: 150 },
                                { field: 'actualAmount', headerName: 'Final Amt (₹)', width: 130 },
                                { field: 'postatus', headerName: 'Status', width: 150 },
                                { field: 'date', headerName: 'Date', width: 120, valueFormatter: (params) => new Date(params.value).toLocaleDateString('en-GB') }
                            ]}
                        />
                    </Box>
                )}
            </Box>

            {/* Modals */}
            <Dialog open={openCashModal} onClose={() => setOpenCashModal(false)}>
                <DialogTitle>Refill Store Cash Account</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Store</InputLabel>
                        <Select
                            value={cashForm.storeid}
                            label="Store"
                            onChange={(e) => setCashForm({ ...cashForm, storeid: e.target.value })}
                        >
                            {stores.map(s => <MenuItem key={s._id} value={s._id}>{s.name || s.storename}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField fullWidth label="Amount to Add (₹)" type="number" margin="normal"
                        value={cashForm.balance} onChange={(e) => setCashForm({ ...cashForm, balance: e.target.value })} />
                    <TextField fullWidth label="Auto-Approve Threshold (₹)" type="number" margin="normal"
                        value={cashForm.approvalThreshold} onChange={(e) => setCashForm({ ...cashForm, approvalThreshold: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCashModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveCash}>Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openHeadTypeModal} onClose={() => setOpenHeadTypeModal(false)}>
                <DialogTitle>Add Head Type</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label="Head Type Name" margin="normal"
                        value={headTypeName} onChange={(e) => setHeadTypeName(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenHeadTypeModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveHeadType}>Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openBudgetModal} onClose={() => setOpenBudgetModal(false)}>
                <DialogTitle>Allocate Budget</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Store</InputLabel>
                        <Select
                            value={budgetForm.storeid}
                            label="Store"
                            onChange={(e) => {
                                const st = stores.find(s => s._id === e.target.value);
                                setBudgetForm({ ...budgetForm, storeid: e.target.value, storeName: st?.name || st?.storename });
                            }}
                        >
                            {stores.map(s => <MenuItem key={s._id} value={s._id}>{s.name || s.storename}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField fullWidth label="Budget Head Name" margin="normal"
                        value={budgetForm.headName} onChange={(e) => setBudgetForm({ ...budgetForm, headName: e.target.value })} />
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Head Type</InputLabel>
                        <Select
                            value={budgetForm.headType}
                            label="Head Type"
                            onChange={(e) => setBudgetForm({ ...budgetForm, headType: e.target.value })}
                        >
                            {headTypes.map(ht => <MenuItem key={ht._id} value={ht.name}>{ht.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField fullWidth label="Financial Year (e.g., 2025-26)" margin="normal"
                        value={budgetForm.financialYear} onChange={(e) => setBudgetForm({ ...budgetForm, financialYear: e.target.value })} />
                    <TextField fullWidth label="Allocated Budget (₹)" type="number" margin="normal"
                        value={budgetForm.allocatedBudget} onChange={(e) => setBudgetForm({ ...budgetForm, allocatedBudget: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBudgetModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveBudget}>Allocate</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LocalPurchaseManagerds2;
