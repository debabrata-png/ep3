import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Paper, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Card, CardContent, Grid, Divider } from '@mui/material';
import ep1 from '../api/ep1';
import global1 from './global1';

const PRApprovalds = () => {
    const [prs, setPrs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Reject dialog
    const [openReject, setOpenReject] = useState(false);
    const [selectedPR, setSelectedPR] = useState(null);
    const [remarks, setRemarks] = useState('');

    useEffect(() => { 
        fetchPRsForApproval(); 
    }, []);

    const fetchPRsForApproval = async () => {
        try {
            setLoading(true);
            const userEmail = global1.user;
            if (!userEmail) {
                console.error("No user email found in global1");
                return;
            }
            const res = await ep1.get(`/api/v2/getPRsForApproval2?colid=${global1.colid}&user_email=${userEmail}`);
            setPrs(res.data.data || []);
        } catch (e) { 
            console.error("Error fetching PRs for approval:", e); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Are you sure you want to approve this PR?')) return;
        try {
            const res = await ep1.post('/api/v2/verifyPRStep2', {
                id: id,
                user_email: global1.user,
                user_name: global1.name
            });
            if (res.data.success) {
                alert(res.data.message);
                fetchPRsForApproval();
            } else {
                alert(res.data.message || "Approval failed");
            }
        } catch (e) {
            console.error(e);
            alert(e.response?.data?.message || "Error during approval");
        }
    };

    const handleReject = async () => {
        if (!remarks) return alert("Please provide rejection remarks");
        try {
            const res = await ep1.post('/api/v2/rejectPR2', {
                id: selectedPR._id,
                user_email: global1.user,
                user_name: global1.name,
                remarks: remarks
            });
            if (res.data.success) {
                alert("PR Rejected");
                setOpenReject(false);
                setRemarks('');
                fetchPRsForApproval();
            }
        } catch (e) {
            console.error(e);
            alert(e.response?.data?.message || "Error during rejection");
        }
    };

    if (loading) return <Box p={3}><Typography>Loading pending PRs...</Typography></Box>;

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>PR Approval Dashboard</Typography>
                <Button variant="outlined" size="small" onClick={fetchPRsForApproval}>Refresh List</Button>
            </Box>

            {prs.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>No Purchase Requisitions found pending your approval.</Alert>
            )}

            <Grid container spacing={3}>
                {prs.map((pr) => (
                    <Grid item xs={12} key={pr._id}>
                        <Card elevation={3} sx={{ borderRadius: 2 }}>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                    <Box>
                                        <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>{pr.itemname}</Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Req Date: {pr.reqdate ? new Date(pr.reqdate).toLocaleDateString() : 'N/A'} | Store: {pr.store || 'N/A'}
                                        </Typography>
                                    </Box>
                                    <Box textAlign="right">
                                        <Chip label={`Level ${pr.currentStep}`} color="secondary" size="small" sx={{ mr: 1 }} />
                                        <Chip label={pr.reqstatus} color="warning" size="small" />
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 1.5 }} />

                                <Grid container spacing={2}>
                                    <Grid item xs={6} md={3}>
                                        <Typography variant="caption" color="textSecondary">Quantity</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{pr.quantity}</Typography>
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <Typography variant="caption" color="textSecondary">Requested By</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{pr.name || pr.user || 'N/A'}</Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Box display="flex" justifyContent="flex-end" gap={2} mt={{ xs: 2, md: 0 }}>
                                            <Button 
                                                variant="contained" 
                                                color="success" 
                                                size="small"
                                                onClick={() => handleApprove(pr._id)}
                                                sx={{ px: 3 }}
                                            >
                                                Approve
                                            </Button>
                                            <Button 
                                                variant="contained" 
                                                color="error" 
                                                size="small"
                                                onClick={() => {
                                                    setSelectedPR(pr);
                                                    setOpenReject(true);
                                                }}
                                                sx={{ px: 3 }}
                                            >
                                                Reject
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Rejection Dialog */}
            <Dialog open={openReject} onClose={() => setOpenReject(false)} fullWidth maxWidth="xs">
                <DialogTitle>Reject Requisition</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        Please provide a reason for rejecting the request for {selectedPR?.itemname}.
                    </Typography>
                    <TextField 
                        label="Rejection Remarks" 
                        fullWidth 
                        margin="normal" 
                        multiline 
                        rows={3} 
                        value={remarks} 
                        onChange={e => setRemarks(e.target.value)} 
                        placeholder="Enter reason here..."
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenReject(false)}>Cancel</Button>
                    <Button onClick={handleReject} variant="contained" color="error">Confirm Reject</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PRApprovalds;
