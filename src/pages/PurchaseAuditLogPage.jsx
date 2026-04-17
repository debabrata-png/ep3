import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    Stack,
    Tooltip,
    IconButton,
    CircularProgress
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
    ShoppingCartOutlined as PurchaseIcon,
    Refresh as RefreshIcon,
    History as HistoryIcon
} from '@mui/icons-material';
import ep1 from '../api/ep1';
import global1 from './global1';

const PurchaseAuditLogPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        fetchLogs();
    }, [refreshTrigger]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await ep1.get(`/api/v2/getpurchaseauditlogs?colid=${global1.colid}`);
            if (response.data.success) {
                setLogs(response.data.data.map((log, index) => ({
                    ...log,
                    id: log._id || index,
                    timestamp: new Date(log.timestamp).toLocaleString()
                })));
            }
        } catch (error) {
            console.error("Error fetching purchase logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { field: 'timestamp', headerName: 'Timestamp', width: 200 },
        { 
            field: 'action', 
            headerName: 'Action', 
            width: 120,
            renderCell: (params) => {
                let color = 'default';
                if (['CREATE', 'SUBMIT', 'APPROVE'].includes(params.value)) color = 'success';
                if (params.value === 'UPDATE') color = 'primary';
                if (['DELETE', 'REJECT'].includes(params.value)) color = 'error';
                return <Chip label={params.value} color={color} size="small" variant="outlined" />;
            }
        },
        { 
            field: 'module', 
            headerName: 'Module', 
            width: 150,
            renderCell: (params) => (
                <Chip 
                    label={params.value === 'MRN_CONFIG' ? 'MRN Config' : 'Requisition'} 
                    size="small" 
                    variant="contained" 
                    color="secondary"
                    sx={{ fontSize: '0.7rem' }}
                />
            )
        },
        { field: 'username', headerName: 'User Name', width: 180 },
        { field: 'useremail', headerName: 'User Email', width: 220 },
        { 
            field: 'details', 
            headerName: 'Details', 
            flex: 1,
            minWidth: 300,
            renderCell: (params) => (
                <Tooltip title={JSON.stringify(params.value, null, 2)} placement="left">
                    <Typography variant="body2" sx={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem'
                    }}>
                        {JSON.stringify(params.value)}
                    </Typography>
                </Tooltip>
            )
        }
    ];

    return (
        <Box p={3} sx={{ height: '90vh', bgcolor: '#f1f4f9' }}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <HistoryIcon color="secondary" sx={{ fontSize: 32 }} />
                        <Typography variant="h5" fontWeight="bold">Purchase Audit Logs</Typography>
                        <Chip label="PR & MRN" size="small" sx={{ ml: 1, fontWeight: 600 }} />
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <IconButton onClick={() => setRefreshTrigger(p => p + 1)} disabled={loading} color="primary">
                            <RefreshIcon />
                        </IconButton>
                    </Stack>
                </Box>

                <Box sx={{ height: 'calc(100% - 80px)', width: '100%' }}>
                    <DataGrid
                        rows={logs}
                        columns={columns}
                        loading={loading}
                        slots={{ toolbar: GridToolbar }}
                        slotProps={{
                            toolbar: {
                                showQuickFilter: true,
                            },
                        }}
                        pageSizeOptions={[10, 25, 50, 100]}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 25 } },
                            sorting: { sortModel: [{ field: 'timestamp', sort: 'desc' }] }
                        }}
                        disableRowSelectionOnClick
                        sx={{
                            '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8f9fa' },
                            '& .MuiDataGrid-cell': { borderBottom: '1px solid #f0f0f0' },
                            border: 'none'
                        }}
                    />
                </Box>
            </Paper>
        </Box>
    );
};

export default PurchaseAuditLogPage;
