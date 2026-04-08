import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Paper, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import ep1 from '../api/ep1';
import global1 from './global1';

const BudgetApprovalds = () => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit category amount dialog
    const [openEdit, setOpenEdit] = useState(false);
    const [editCatId, setEditCatId] = useState(null);
    const [editAmount, setEditAmount] = useState('');

    // Approve/Reject dialog
    const [openAction, setOpenAction] = useState(false);
    const [actionBudgetId, setActionBudgetId] = useState(null);
    const [actionLevel, setActionLevel] = useState('');
    const [actionType, setActionType] = useState('');
    const [actionRemarks, setActionRemarks] = useState('');

    // Add category dialog for approvers with create access
    const [openCat, setOpenCat] = useState(false);
    const [catForm, setCatForm] = useState({ category: '', amount: '', budgettype: '', remarks: '' });
    const [selectedBudgetId, setSelectedBudgetId] = useState(null);
    const [selectedBudgetName, setSelectedBudgetName] = useState('');
    const [budgetTypes, setBudgetTypes] = useState([]);
    const [itemCategories, setItemCategories] = useState([]);

    useEffect(() => { 
        fetchBudgetsForApproval(); 
        fetchBudgetTypes();
        fetchItemCategories();
    }, []);

    const fetchBudgetsForApproval = async () => {
        try {
            setLoading(true);
            const res = await ep1.get(`/api/v2/getbudgetsforapproval?colid=${global1.colid}&useremail=${global1.user}`);
            setBudgets(res.data.data.items || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchBudgetTypes = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallbudgettypeds?colid=${global1.colid}`);
            setBudgetTypes(res.data.data.items.filter(t => t.isactive !== false));
        } catch (e) { console.error(e); }
    };

    const fetchItemCategories = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallitemcategoryds?colid=${global1.colid}`);
            setItemCategories(res.data.data.items);
        } catch (e) { console.error(e); }
    };

    const handleUpdateCategoryAmount = async () => {
        try {
            await ep1.post(`/api/v2/updatebudgetpocatdsamount?id=${editCatId}`, { amount: Number(editAmount) });
            setOpenEdit(false);
            fetchBudgetsForApproval();
        } catch (e) { console.error(e); }
    };

    const handleOpenAddCategory = (budgetId, budgetName) => {
        setSelectedBudgetId(budgetId);
        setSelectedBudgetName(budgetName);
        setCatForm({ category: '', amount: '', budgettype: '', remarks: '' });
        setOpenCat(true);
    };

    const handleSaveCategory = async () => {
        const payload = {
            ...catForm, amount: Number(catForm.amount),
            colid: global1.colid, user: global1.user, name: global1.user,
            budgetid: selectedBudgetId, budgetname: selectedBudgetName
        };
        try {
            await ep1.post('/api/v2/addbudgetpocatds', payload);
            setOpenCat(false);
            fetchBudgetsForApproval();
        } catch (e) { console.error(e); }
    };

    const handleDeleteCategory = async (catId) => {
        if (window.confirm('Delete this budget category?')) {
            await ep1.get(`/api/v2/deletebudgetpocatds?id=${catId}`);
            fetchBudgetsForApproval();
        }
    };

    const handleApproveReject = async () => {
        try {
            await ep1.post(`/api/v2/approvebudgetpods?id=${actionBudgetId}`, {
                levelofapproval: actionLevel,
                status: actionType,
                remarks: actionRemarks
            });
            setOpenAction(false);
            setActionRemarks('');
            fetchBudgetsForApproval();
            alert(`Budget ${actionType.toLowerCase()} successfully`);
        } catch (e) { console.error(e); }
    };

    const openApproveReject = (budgetId, level, type) => {
        setActionBudgetId(budgetId);
        setActionLevel(level);
        setActionType(type);
        setActionRemarks('');
        setOpenAction(true);
    };

    if (loading) return <Box p={3}><Typography>Loading...</Typography></Box>;

    return (
        <Box p={3}>
            <Typography variant="h5" gutterBottom>Budget Approval</Typography>

            {budgets.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>No budgets pending your approval.</Alert>
            )}

            {budgets.map((budget) => (
                <Paper key={budget._id} sx={{ p: 3, mb: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box>
                            <Typography variant="h6">{budget.budgetname}</Typography>
                            <Typography variant="body2" color="textSecondary">
                                Year: {budget.year} | Department: {budget.department} | Type: {budget.budgettype || '-'}
                            </Typography>
                        </Box>
                        <Box>
                            <Chip label={`Total: ₹ ${(budget.amount || 0).toLocaleString()}`} color="primary" sx={{ mr: 1 }} />
                            <Chip label={budget.status} color="warning" size="small" />
                        </Box>
                    </Box>

                    {budget.approverConfig?.iscreateaccess && (
                        <Box mb={2}>
                            <Button size="small" variant="outlined" onClick={() => handleOpenAddCategory(budget._id, budget.budgetname)}>
                                + Add Category
                            </Button>
                        </Box>
                    )}

                    {/* Approval History */}
                    {budget.approvedby && budget.approvedby.length > 0 && (
                        <Box mb={2}>
                            <Typography variant="subtitle2" gutterBottom>Approval Status:</Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                                {budget.approvedby.map((a, idx) => (
                                    <Chip key={idx} label={`L${a.levelofapproval}: ${a.approvername} — ${a.status}`}
                                        color={a.status === 'Approved' ? 'success' : a.status === 'Rejected' ? 'error' : 'default'}
                                        size="small" variant="outlined" />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* Categories Table */}
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Category</strong></TableCell>
                                    <TableCell><strong>Amount</strong></TableCell>
                                    <TableCell><strong>Budget Type</strong></TableCell>
                                    <TableCell><strong>Remarks</strong></TableCell>
                                    {(budget.approverConfig?.iseditaccess || budget.approverConfig?.isdeleteaccess) && (
                                        <TableCell><strong>Actions</strong></TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(budget.categories || []).map((cat) => (
                                    <TableRow key={cat._id}>
                                        <TableCell>{cat.category}</TableCell>
                                        <TableCell>₹ {(cat.amount || 0).toLocaleString()}</TableCell>
                                        <TableCell>{cat.budgettype}</TableCell>
                                        <TableCell>{cat.remarks}</TableCell>
                                        {(budget.approverConfig?.iseditaccess || budget.approverConfig?.isdeleteaccess) && (
                                            <TableCell>
                                                {budget.approverConfig?.iseditaccess && (
                                                    <Button size="small" onClick={() => { setEditCatId(cat._id); setEditAmount(cat.amount || ''); setOpenEdit(true); }}>
                                                        Edit Amount
                                                    </Button>
                                                )}
                                                {budget.approverConfig?.isdeleteaccess && (
                                                    <Button size="small" color="error" onClick={() => handleDeleteCategory(cat._id)}>Delete</Button>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                                {(budget.categories || []).length > 0 && (
                                    <TableRow>
                                        <TableCell><strong>Total</strong></TableCell>
                                        <TableCell><strong>₹ {(budget.categories || []).reduce((s, c) => s + (c.amount || 0), 0).toLocaleString()}</strong></TableCell>
                                        <TableCell colSpan={3}></TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Approve / Reject Buttons */}
                    <Box mt={2} display="flex" gap={1}>
                        <Button variant="contained" color="success"
                            onClick={() => openApproveReject(budget._id, budget.approverConfig?.levelofapproval, 'Approved')}>
                            Approve
                        </Button>
                        <Button variant="contained" color="error"
                            onClick={() => openApproveReject(budget._id, budget.approverConfig?.levelofapproval, 'Rejected')}>
                            Reject
                        </Button>
                    </Box>
                </Paper>
            ))}

            {/* Edit Category Amount Dialog */}
            <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
                <DialogTitle>Edit Category Amount</DialogTitle>
                <DialogContent>
                    <TextField label="Amount" fullWidth margin="normal" type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
                    <Button onClick={handleUpdateCategoryAmount} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Approve/Reject Dialog */}
            <Dialog open={openAction} onClose={() => setOpenAction(false)}>
                <DialogTitle>{actionType === 'Approved' ? 'Approve' : 'Reject'} Budget</DialogTitle>
                <DialogContent>
                    <TextField label="Remarks" fullWidth margin="normal" multiline rows={3} value={actionRemarks} onChange={e => setActionRemarks(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAction(false)}>Cancel</Button>
                    <Button onClick={handleApproveReject} variant="contained" color={actionType === 'Approved' ? 'success' : 'error'}>
                        {actionType === 'Approved' ? 'Approve' : 'Reject'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Category Form Dialog */}
            <Dialog open={openCat} onClose={() => setOpenCat(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Budget Category — {selectedBudgetName}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Category</InputLabel>
                        <Select value={catForm.category} label="Category" onChange={e => setCatForm({ ...catForm, category: e.target.value })}>
                            {itemCategories.map(c => <MenuItem key={c._id} value={c.categoryname || c.name}>{c.categoryname || c.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField label="Amount" fullWidth margin="normal" type="number" value={catForm.amount} onChange={e => setCatForm({ ...catForm, amount: e.target.value })} />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Budget Type</InputLabel>
                        <Select value={catForm.budgettype} label="Budget Type" onChange={e => setCatForm({ ...catForm, budgettype: e.target.value })}>
                            {budgetTypes.map(t => <MenuItem key={t._id} value={t.budgettypename}>{t.budgettypename}</MenuItem>)}
                        </Select>
                    </FormControl>
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
export default BudgetApprovalds;
