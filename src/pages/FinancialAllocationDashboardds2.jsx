import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Tabs, Tab, Paper, Grid, TextField, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';

const FinancialAllocationDashboardds2 = () => {
    const [tabValue, setTabValue] = useState(0);
    const [budgets, setBudgets] = useState([]);
    const [cashAccounts, setCashAccounts] = useState([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(false);

    // Budget Form
    const [openBudgetModal, setOpenBudgetModal] = useState(false);
    const [headName, setHeadName] = useState('');
    const [headType, setHeadType] = useState('Departmental');
    const [allocatedBudget, setAllocatedBudget] = useState('');
    const [financialYear, setFinancialYear] = useState('2024-2025');

    // Cash Form
    const [openCashModal, setOpenCashModal] = useState(false);
    const [selectedStore, setSelectedStore] = useState('');
    const [cashAmount, setCashAmount] = useState('');

    useEffect(() => {
        if (!global1.colid && localStorage.getItem('colid')) {
            global1.colid = localStorage.getItem('colid');
            global1.user = localStorage.getItem('user');
        }

        fetchData();
        fetchStores();
    }, [tabValue]);

    const fetchData = async () => {
        setLoading(true);
        if (tabValue === 0) await fetchBudgets();
        if (tabValue === 1) await fetchCashAccounts();
        setLoading(false);
    };

    const fetchBudgets = async () => {
        try {
            const res = await ep1.get(`/api/v2/getstorebudgets2?colid=${global1.colid}`);
            setBudgets((res.data.data || []).map(b => ({ ...b, id: b._id })));
        } catch (e) { console.error("Error fetching budgets", e); }
    };

    const fetchStores = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallstoredesi2?colid=${global1.colid}`);
            const data = res.data.data.stores || res.data.data || [];
            setStores(data);
        } catch (e) { console.error("Error fetching stores", e); }
    }

    const fetchCashAccounts = async () => {
        try {
            const res = await ep1.get(`/api/v2/getstorecashaccounts2?colid=${global1.colid}`);
            setCashAccounts((res.data.data || []).map(c => ({ ...c, id: c._id })));
        } catch (e) { console.error("Error fetching cash accounts", e); }
    };

    const handleCreateBudget = async () => {
        if (!headName || !allocatedBudget || !financialYear) return alert("Fill all fields");
        try {
            await ep1.post('/api/v2/addstorebudget2', {
                headName, headType, allocatedBudget: Number(allocatedBudget), financialYear,
                allocatedBy: global1.user || 'Admin', colid: global1.colid
            });
            alert("Budget Allocated Successfully");
            setOpenBudgetModal(false);
            fetchBudgets();
        } catch (e) { console.error(e); alert("Failed to allocate budget"); }
    };

    const handleAllocateCash = async () => {
        if (!selectedStore || !cashAmount) return alert("Select Store and Amount");
        const storeObj = stores.find(s => s._id === selectedStore);
        try {
            await ep1.post('/api/v2/addcashaccountbalance2', {
                storeid: selectedStore,
                storeName: storeObj ? storeObj.storename : 'Unknown Store',
                balance: Number(cashAmount),
                allocatedBy: global1.user || 'Admin',
                colid: global1.colid
            });
            alert("Cash Refilled Successfully");
            setOpenCashModal(false);
            fetchCashAccounts();
        } catch (e) { console.error(e); alert("Failed to refill cash"); }
    };

    const budgetCols = [
        { field: 'headName', headerName: 'Budget Head', width: 200 },
        { field: 'headType', headerName: 'Type', width: 150 },
        { field: 'allocatedBudget', headerName: 'Total Allocated', width: 150 },
        { field: 'utilizedBudget', headerName: 'Utilized', width: 150 },
        { field: 'availableBudget', headerName: 'Available Balance', width: 150 },
        { field: 'financialYear', headerName: 'FY', width: 120 },
    ];

    const cashCols = [
        { field: 'storeName', headerName: 'Store Name', width: 250 },
        { field: 'balance', headerName: 'Current Balance (Local Cash)', width: 250 },
        { field: 'lastRefillDate', headerName: 'Last Refill', width: 200, valueFormatter: (p) => new Date(p.value).toLocaleString() },
    ];

    return (
        <Box p={3} sx={{ height: '85vh', width: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4">Financial Allocations (Higher Authority)</Typography>
                <Box>
                    <Button variant="contained" color="primary" onClick={() => setOpenBudgetModal(true)} sx={{ mr: 2 }}>
                        Allocate New Budget
                    </Button>
                    <Button variant="contained" color="secondary" onClick={() => setOpenCashModal(true)}>
                        Refill Store Cash Account
                    </Button>
                </Box>
            </Box>

            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
                <Tab label="Operational Budgets" />
                <Tab label="Store Local Cash Accounts" />
            </Tabs>

            {tabValue === 0 && (
                <Paper sx={{ height: 600, width: '100%' }}>
                    <DataGrid rows={budgets} columns={budgetCols} loading={loading} />
                </Paper>
            )}

            {tabValue === 1 && (
                <Paper sx={{ height: 600, width: '100%' }}>
                    <DataGrid rows={cashAccounts} columns={cashCols} loading={loading} />
                </Paper>
            )}

            {/* Budget Modal */}
            <Dialog open={openBudgetModal} onClose={() => setOpenBudgetModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Allocate Organizational Budget</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Budget Head Name" size="small" value={headName} onChange={e => setHeadName(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Head Type</InputLabel>
                                <Select value={headType} onChange={e => setHeadType(e.target.value)} label="Head Type">
                                    <MenuItem value="Departmental">Departmental</MenuItem>
                                    <MenuItem value="General">General</MenuItem>
                                    <MenuItem value="Capital">Capital (Capex)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Financial Year" size="small" value={financialYear} onChange={e => setFinancialYear(e.target.value)} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth type="number" label="Total Amount (₹)" size="small" value={allocatedBudget} onChange={e => setAllocatedBudget(e.target.value)} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBudgetModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateBudget}>Allocate Budget</Button>
                </DialogActions>
            </Dialog>

            {/* Cash Modal */}
            <Dialog open={openCashModal} onClose={() => setOpenCashModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Refill Store Cash Account (Local Purchases)</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Select Store</InputLabel>
                                <Select value={selectedStore} onChange={e => setSelectedStore(e.target.value)} label="Select Store">
                                    {stores.map(s => <MenuItem key={s._id} value={s._id}>{s.storename}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth type="number" label="Refill Amount (₹)" size="small" value={cashAmount} onChange={e => setCashAmount(e.target.value)} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCashModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleAllocateCash}>Refill Cash</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FinancialAllocationDashboardds2;
