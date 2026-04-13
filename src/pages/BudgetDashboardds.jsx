import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Paper, MenuItem, Select, InputLabel, FormControl, Chip, IconButton, Collapse, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ep1 from '../api/ep1';
import global1 from './global1';

const BudgetDashboardds = () => {
    const [budgets, setBudgets] = useState([]);
    const [budgetTypes, setBudgetTypes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [itemCategories, setItemCategories] = useState([]);
    const [budgetGroups, setBudgetGroups] = useState([]);
    const [userDepartments, setUserDepartments] = useState([]);

    // Budget form
    const [openBudget, setOpenBudget] = useState(false);
    const [editBudgetId, setEditBudgetId] = useState(null);
    const [budgetForm, setBudgetForm] = useState({ budgetname: '', year: '', department: '', budgettype: '', remarks: '' });

    // Category form
    const [openCat, setOpenCat] = useState(false);
    const [editCatId, setEditCatId] = useState(null);
    const [catForm, setCatForm] = useState({ groupname: '', category: '', amount: '', budgettype: '', remarks: '' });
    const [selectedBudgetId, setSelectedBudgetId] = useState(null);
    const [selectedBudgetName, setSelectedBudgetName] = useState('');
    const [selectedBudgetDept, setSelectedBudgetDept] = useState('');

    // Expanded budget row for viewing categories
    const [expandedBudgetId, setExpandedBudgetId] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState([]);

    useEffect(() => {
        fetchBudgets();
        fetchBudgetTypes();
        fetchItemCategories();
        fetchBudgetGroups();
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await ep1.post('/api/v2/getdepartmentindentds', { colid: global1.colid });
            if (response.data.success) {
                setUserDepartments(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchBudgetGroups = async () => {
        try {
            const res = await ep1.get(`/api/v2/getbudgetgroupsdistinct?colid=${global1.colid}`);
            setBudgetGroups(res.data.data.items || []);
        } catch (e) { console.error(e); }
    };

    const fetchCategoriesByGroup = async (groupName) => {
        try {
            const res = await ep1.get(`/api/v2/getbudgetcategoriesbygroup?colid=${global1.colid}&groupname=${groupName}`);
            setItemCategories(res.data.data.items || []);
        } catch (e) { console.error(e); }
    };

    const fetchBudgets = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallbudgetpods?colid=${global1.colid}`);
            const items = res.data?.data?.items || [];
            setBudgets(items.map(i => ({ ...i, id: i._id })));
        } catch (e) { console.error(e); }
    };

    const fetchBudgetTypes = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallbudgettypeds?colid=${global1.colid}`);
            const items = res.data?.data?.items || [];
            setBudgetTypes(items.filter(t => t.isactive !== false));
        } catch (e) { console.error(e); }
    };

    const fetchItemCategories = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallitemcategoryds?colid=${global1.colid}`);
            setItemCategories(res.data?.data?.items || []);
        } catch (e) { console.error(e); }
    };

    const fetchCategoriesForBudget = async (budgetId) => {
        try {
            const res = await ep1.get(`/api/v2/getbudgetpocatdsbybudgetid?budgetid=${budgetId}&colid=${global1.colid}`);
            setExpandedCategories(res.data?.data?.items || []);
        } catch (e) { console.error(e); }
    };

    // Budget CRUD
    const handleSaveBudget = async () => {
        const payload = {
            ...budgetForm,
            department: global1.department,
            colid: global1.colid,
            user: global1.user,
            name: global1.user,
            institution: global1.institution
        };
        try {
            if (editBudgetId) await ep1.post(`/api/v2/updatebudgetpods?id=${editBudgetId}`, payload);
            else await ep1.post('/api/v2/addbudgetpods', payload);
            setOpenBudget(false); fetchBudgets();
            setBudgetForm({ budgetname: '', year: '', department: '', budgettype: '', remarks: '' });
            setEditBudgetId(null);
        } catch (e) { console.error(e); }
    };

    const handleDeleteBudget = async (id) => {
        if (window.confirm('Delete this budget and all its categories?')) {
            await ep1.get(`/api/v2/deletebudgetpods?id=${id}`);
            fetchBudgets();
            if (expandedBudgetId === id) { setExpandedBudgetId(null); setExpandedCategories([]); }
        }
    };

    const handleSubmitForApproval = async (id) => {
        if (window.confirm('Submit this budget for approval?')) {
            try {
                await ep1.post(`/api/v2/submitbudgetforapproval?id=${id}&colid=${global1.colid}`);
                fetchBudgets();
                alert('Budget submitted for approval successfully');
            } catch (e) { alert('Error: ' + (e.response?.data?.message || e.message)); }
        }
    };

    // Category CRUD
    const handleOpenAddCategory = (budgetId, budgetName) => {
        const parentBudget = budgets.find(b => b.id === budgetId);
        setSelectedBudgetId(budgetId);
        setSelectedBudgetName(budgetName);
        setSelectedBudgetDept(parentBudget?.department || '');
        setCatForm({ groupname: '', category: '', amount: '', budgettype: '', remarks: '' });
        setEditCatId(null);
        setOpenCat(true);
        fetchItemCategories(); // Reset to all until group is selected
    };

    const handleSaveCategory = async () => {
        const payload = {
            ...catForm, amount: Number(catForm.amount),
            colid: global1.colid, user: global1.user, name: global1.user,
            budgetid: selectedBudgetId, budgetname: selectedBudgetName,
            department: global1.department,
            institution: global1.institution
        };
        try {
            if (editCatId) await ep1.post(`/api/v2/updatebudgetpocatds?id=${editCatId}`, payload);
            else await ep1.post('/api/v2/addbudgetpocatds', payload);
            setOpenCat(false); fetchBudgets();
            if (expandedBudgetId === selectedBudgetId) fetchCategoriesForBudget(selectedBudgetId);
        } catch (e) { console.error(e); }
    };

    const handleDeleteCategory = async (catId) => {
        if (window.confirm('Delete this budget category?')) {
            await ep1.get(`/api/v2/deletebudgetpocatds?id=${catId}`);
            fetchBudgets();
            if (expandedBudgetId) fetchCategoriesForBudget(expandedBudgetId);
        }
    };

    const handleToggleExpand = (budgetId) => {
        if (expandedBudgetId === budgetId) {
            setExpandedBudgetId(null);
            setExpandedCategories([]);
        } else {
            setExpandedBudgetId(budgetId);
            fetchCategoriesForBudget(budgetId);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Draft': return 'default';
            case 'Pending': return 'warning';
            case 'Approved': return 'success';
            case 'Rejected': return 'error';
            default: return 'default';
        }
    };

    const columns = [
        {
            field: 'expand', headerName: '', width: 50, renderCell: (p) => (
                <IconButton size="small" onClick={() => handleToggleExpand(p.row.id)}>
                    {expandedBudgetId === p.row.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
            )
        },
        { field: 'budgetname', headerName: 'Budget Name', width: 200 },
        { field: 'year', headerName: 'Year', width: 100 },
        { field: 'department', headerName: 'Department', width: 150 },
        { field: 'budgettype', headerName: 'Budget Type', width: 130 },
        { field: 'amount', headerName: 'Total Amount', width: 130, renderCell: (p) => `₹ ${(p.value || 0).toLocaleString()}` },
        { field: 'categoryCount', headerName: 'Categories', width: 100 },
        { field: 'status', headerName: 'Status', width: 110, renderCell: (p) => <Chip label={p.value || 'Draft'} color={getStatusColor(p.value)} size="small" /> },
        {
            field: 'actions', headerName: 'Actions', width: 400, renderCell: (p) => (
                <Box>
                    <Button size="small" onClick={() => handleOpenAddCategory(p.row.id, p.row.budgetname)}>+ Category</Button>
                    {(p.row.status === 'Draft' || !p.row.status) && (
                        <>
                            <Button size="small" onClick={() => {
                                setEditBudgetId(p.row.id);
                                setBudgetForm({ budgetname: p.row.budgetname || '', year: p.row.year || '', department: p.row.department || '', budgettype: p.row.budgettype || '', remarks: p.row.remarks || '' });
                                setOpenBudget(true);
                            }}>Edit</Button>
                            <Button size="small" color="error" onClick={() => handleDeleteBudget(p.row.id)}>Delete</Button>
                            <Button size="small" color="primary" variant="outlined" onClick={() => handleSubmitForApproval(p.row.id)}>Submit</Button>
                        </>
                    )}
                </Box>
            )
        }
    ];

    return (
        <Box p={3}>
            <Typography variant="h5" gutterBottom>Budget Management</Typography>
            <Button variant="contained" sx={{ mb: 2 }} onClick={() => { setOpenBudget(true); setEditBudgetId(null); setBudgetForm({ budgetname: '', year: '', department: global1.department || '', budgettype: '', remarks: '' }) }}>
                Create New Budget
            </Button>

            <Paper sx={{ width: '100%' }}>
                <DataGrid rows={budgets} columns={columns} autoHeight pageSize={10} rowsPerPageOptions={[10, 25, 50]} />
            </Paper>

            {/* Expanded Categories Section */}
            {expandedBudgetId && (
                <Paper sx={{ mt: 2, p: 3 }} elevation={2}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Budget Categories for: {budgets.find(b => b.id === expandedBudgetId)?.budgetname}
                    </Typography>
                    <TableContainer sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                        <Table size="medium">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#1976d2' }}>
                                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Group</TableCell>
                                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Category</TableCell>
                                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Amount</TableCell>
                                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Budget Type</TableCell>
                                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Status</TableCell>
                                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Remarks</TableCell>
                                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {expandedCategories.map((cat, idx) => (
                                    <TableRow key={cat._id} sx={{ backgroundColor: idx % 2 === 0 ? '#fafafa' : '#fff' }}>
                                        <TableCell align="center">{cat.groupname || '—'}</TableCell>
                                        <TableCell align="center">{cat.category}</TableCell>
                                        <TableCell align="center">₹ {(cat.amount || 0).toLocaleString()}</TableCell>
                                        <TableCell align="center">{cat.budgettype}</TableCell>
                                        <TableCell align="center">{cat.status || '—'}</TableCell>
                                        <TableCell align="center">{cat.remarks || '—'}</TableCell>
                                        <TableCell align="center">
                                            <Button size="small" onClick={() => {
                                                const parentBudget = budgets.find(b => b.id === cat.budgetid);
                                                setEditCatId(cat._id);
                                                setSelectedBudgetId(cat.budgetid);
                                                setSelectedBudgetName(cat.budgetname);
                                                setSelectedBudgetDept(cat.department || parentBudget?.department || '');
                                                setCatForm({ groupname: cat.groupname || '', category: cat.category || '', amount: cat.amount || '', budgettype: cat.budgettype || '', remarks: cat.remarks || '' });
                                                if (cat.groupname) fetchCategoriesByGroup(cat.groupname);
                                                setOpenCat(true);
                                            }}>Edit</Button>
                                            <Button size="small" color="error" onClick={() => handleDeleteCategory(cat._id)}>Delete</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {expandedCategories.length === 0 && (
                                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3, color: '#999' }}>No categories added yet</TableCell></TableRow>
                                )}
                                {expandedCategories.length > 0 && (
                                    <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                                        <TableCell align="center" sx={{ fontWeight: 700 }}>Total</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700 }}>₹ {expandedCategories.reduce((s, c) => s + (c.amount || 0), 0).toLocaleString()}</TableCell>
                                        <TableCell colSpan={5}></TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Approval Status Section */}
                    {(() => {
                        const expandedBudget = budgets.find(b => b.id === expandedBudgetId);
                        if (expandedBudget && expandedBudget.approvedby && expandedBudget.approvedby.length > 0) {
                            return (
                                <Box mt={4}>
                                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Approval Status</Typography>
                                        <Chip
                                            label={`Final Status: ${expandedBudget.status || 'Draft'}`}
                                            color={getStatusColor(expandedBudget.status)}
                                            size="small"
                                        />
                                        {expandedBudget.finallevel && (
                                            <Chip label={`Final Level: ${expandedBudget.finallevel}`} variant="outlined" size="small" />
                                        )}
                                    </Box>
                                    <TableContainer sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                        <Table size="medium">
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: '#388e3c' }}>
                                                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Level</TableCell>
                                                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Approver Name</TableCell>
                                                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Status</TableCell>
                                                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Approved Date</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {expandedBudget.approvedby.map((a, idx) => (
                                                    <TableRow key={idx} sx={{ backgroundColor: idx % 2 === 0 ? '#fafafa' : '#fff' }}>
                                                        <TableCell align="center">Level {a.levelofapproval}</TableCell>
                                                        <TableCell align="center">{a.approvername}</TableCell>
                                                        <TableCell align="center">
                                                            <Chip
                                                                label={a.status || 'Pending'}
                                                                color={a.status === 'Approved' ? 'success' : a.status === 'Rejected' ? 'error' : 'default'}
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {a.date ? new Date(a.date).toLocaleString() : '—'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            );
                        }
                        return null;
                    })()}
                </Paper>
            )}

            {/* Budget Form Dialog */}
            <Dialog open={openBudget} onClose={() => setOpenBudget(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editBudgetId ? 'Edit' : 'Create'} Budget</DialogTitle>
                <DialogContent>
                    <TextField label="Budget Name" fullWidth margin="normal" value={budgetForm.budgetname} onChange={e => setBudgetForm({ ...budgetForm, budgetname: e.target.value })} />
                    <TextField label="Year (e.g. 2025-26)" fullWidth margin="normal" value={budgetForm.year} onChange={e => setBudgetForm({ ...budgetForm, year: e.target.value })} />
                    <TextField
                        fullWidth label="Institution"
                        value={global1.institution || ''}
                        disabled
                        margin="normal"
                    />
                    <TextField
                        fullWidth label="Department"
                        value={global1.department || ''}
                        disabled
                        margin="normal"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Budget Type</InputLabel>
                        <Select value={budgetForm.budgettype} label="Budget Type" onChange={e => setBudgetForm({ ...budgetForm, budgettype: e.target.value })}>
                            {budgetTypes.map(t => <MenuItem key={t._id} value={t.budgettypename}>{t.budgettypename}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField label="Remarks" fullWidth margin="normal" value={budgetForm.remarks} onChange={e => setBudgetForm({ ...budgetForm, remarks: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBudget(false)}>Cancel</Button>
                    <Button onClick={handleSaveBudget} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Category Form Dialog */}
            <Dialog open={openCat} onClose={() => setOpenCat(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editCatId ? 'Edit' : 'Add'} Budget Category — {selectedBudgetName}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Budget Group</InputLabel>
                        <Select
                            value={catForm.groupname}
                            label="Budget Group"
                            onChange={e => {
                                const group = e.target.value;
                                setCatForm({ ...catForm, groupname: group, category: '' });
                                fetchCategoriesByGroup(group);
                            }}
                        >
                            {budgetGroups.map((g, idx) => <MenuItem key={idx} value={g}>{g}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal" disabled={!catForm.groupname}>
                        <InputLabel>Category</InputLabel>
                        <Select value={catForm.category} label="Category" onChange={e => setCatForm({ ...catForm, category: e.target.value })}>
                            {itemCategories.map((c, idx) => {
                                const val = typeof c === 'string' ? c : (c.categoryname || c.name);
                                return <MenuItem key={idx} value={val}>{val}</MenuItem>;
                            })}
                        </Select>
                    </FormControl>
                    <TextField label="Amount" fullWidth margin="normal" type="number" value={catForm.amount} onChange={e => setCatForm({ ...catForm, amount: e.target.value })} />

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Budget Type</InputLabel>
                        <Select value={catForm.budgettype} label="Budget Type" onChange={e => setCatForm({ ...catForm, budgettype: e.target.value })}>
                            {budgetTypes.map(t => <MenuItem key={t._id} value={t.budgettypename}>{t.budgettypename}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth label="Institution"
                        value={global1.institution || ''}
                        disabled
                        margin="normal"
                    />
                    <TextField label="Remarks" fullWidth margin="normal" value={catForm.remarks} onChange={e => setCatForm({ ...catForm, remarks: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCat(false)}>Cancel</Button>
                    <Button onClick={handleSaveCategory} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
export default BudgetDashboardds;
