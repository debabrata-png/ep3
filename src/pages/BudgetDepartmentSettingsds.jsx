import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Switch, Alert, Button, CircularProgress } from '@mui/material';
import ep1 from '../api/ep1';
import global1 from './global1';

const BudgetDepartmentSettingsds = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const response = await ep1.post('/api/v2/getbudgetdepartmentsettingsds', { colid: global1.colid });
            if (response.data.success) {
                setDepartments(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
            setMsg({ type: 'error', text: 'Error fetching departments' });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFreeze = async (deptId, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            const res = await ep1.post('/api/v2/toggledepartmentfrozen', { 
                id: deptId, 
                isfrozen: newStatus,
                colid: global1.colid 
            });

            if (res.data.success) {
                setDepartments(prev => 
                    prev.map(d => d._id === deptId ? { ...d, isfrozen: newStatus } : d)
                );
                setMsg({ type: 'success', text: res.data.message });
                setTimeout(() => setMsg({ type: '', text: '' }), 3000);
            }
        } catch (error) {
            console.error('Error toggling freeze:', error);
            setMsg({ type: 'error', text: 'Failed to update department status' });
        }
    };

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                        Department Budget Settings
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Manage budget creation permissions for individual departments.
                    </Typography>
                </Box>
                <Button variant="outlined" onClick={fetchDepartments} size="small">Refresh List</Button>
            </Box>

            {msg.text && (
                <Alert severity={msg.type || 'info'} sx={{ mb: 2 }}>
                    {msg.text}
                </Alert>
            )}

            {loading ? (
                <Box display="flex" justifyContent="center" py={10}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Department Name</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Institution</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>Freeze Budget Creation</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {departments.map((dept) => (
                                <TableRow key={dept._id} hover>
                                    <TableCell sx={{ fontWeight: 500 }}>{dept.departmentname}</TableCell>
                                    <TableCell>{dept.institution}</TableCell>
                                    <TableCell align="center">
                                        <Switch
                                            checked={dept.isfrozen || false}
                                            onChange={() => handleToggleFreeze(dept._id, dept.isfrozen)}
                                            color="error"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Box 
                                                sx={{ 
                                                    width: 8, height: 8, borderRadius: '50%', 
                                                    bgcolor: dept.isfrozen ? 'error.main' : 'success.main' 
                                                }} 
                                            />
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: dept.isfrozen ? 'error.main' : 'success.main' }}>
                                                {dept.isfrozen ? 'FROZEN' : 'ACTIVE'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {departments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                                        No departments found for this institution.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default BudgetDepartmentSettingsds;
