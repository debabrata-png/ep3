import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Chip,
    Stack,
    Tab,
    Tabs
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';
import { createRoot } from 'react-dom/client';
import FacultyRequisitionPrintTemplate from './FacultyRequisitionPrintTemplate';

const FacultyRequestApprovalds2 = () => {
    const [allRequests, setAllRequests] = useState([]);
    const [displayRequests, setDisplayRequests] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentTab, setCurrentTab] = useState(0);

    useEffect(() => {
        fetchRequests();
    }, [refreshTrigger, currentTab]);

    const fetchRequests = async () => {
        try {
            const response = await ep1.get(`/api/v2/getallrequisationds12?colid=${global1.colid}`);
            const data = response.data.data.requisitions || [];
            setAllRequests(data);

            if (currentTab === 0) {
                // Pending Tab
                const pending = data.filter(req => {
                    if (req.reqstatus !== 'Pending Approval') return false;
                    
                    const isHOI = req.hoiapproveruserid === global1.user;
                    const isAHOI = req.ahoiapproveruserid === global1.user;

                    if (!isHOI && !isAHOI) return false;

                    if (isAHOI) {
                        // AHOI sees it if it's manual and they haven't approved yet
                        return req.approvalOption === 'Manual' && !req.ahoiApproved;
                    }
                    if (isHOI) {
                        // HOI sees it if they haven't approved yet
                        return !req.hoiApproved;
                    }
                    return true;
                });
                setDisplayRequests(pending.map(r => ({ ...r, id: r._id })));
            } else {
                // History Tab
                const history = data.filter(req => req.reqstatus === 'Approved' || req.reqstatus === 'Rejected');
                setDisplayRequests(history.map(r => ({ ...r, id: r._id })));
            }
        } catch (error) {
            console.error('Error fetching staging requests:', error);
        }
    };

    const handleApprove = async (row) => {
        try {
            const isHOI = row.hoiapproveruserid === global1.user;
            const isAHOI = row.ahoiapproveruserid === global1.user;
            
            // Determine the role to send to backend based on which field matched
            const approverRole = isAHOI ? 'AHOI' : 'HOI';

            await ep1.post('/api/v2/approverequisationds12', { 
                id: row.id, 
                approverRole: approverRole,
                approverName: global1.name 
            });
            setRefreshTrigger(prev => prev + 1);
            alert(`Approved as ${approverRole}`);
        } catch (error) {
            console.error('Error approving request:', error);
            alert('Failed to approve request');
        }
    };

    const handleReject = async (id) => {
        try {
            await ep1.post('/api/v2/rejectrequisationds12', { id });
            setRefreshTrigger(prev => prev + 1);
            alert('Request Rejected');
        } catch (error) {
            console.error('Error rejecting request:', error);
            alert('Failed to reject request');
        }
    };

    const handlePrint = async () => {
        const itemsToPrint = displayRequests.filter(r => selectedRows.includes(r.id));
        if (!itemsToPrint || itemsToPrint.length === 0) {
            alert("No items selected to print.");
            return;
        }
        try {
            const configRes = await ep1.get(`/api/v2/getprconfigds2?colid=${global1.colid}`);
            const instConfig = configRes.data?.data || {};
            
            const printWindow = window.open('', '', 'width=900,height=700');
            const container = printWindow.document.createElement('div');
            printWindow.document.body.appendChild(container);

            const root = createRoot(container);
            root.render(
                <FacultyRequisitionPrintTemplate 
                    items={itemsToPrint}
                    instituteName={instConfig.institutionname}
                    instituteAddress={instConfig.address}
                    institutePhone={instConfig.phone}
                    indentNumber={itemsToPrint[0]?.indentNumber || `INDDS/ ${Date.now()}`}
                    department={itemsToPrint[0]?.departmentname || ""}
                    remark={itemsToPrint[0]?.remark || ''}
                />
            );

            // Wait for render
            setTimeout(() => {
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }, 1000);

        } catch (error) {
            console.error("Error fetching institute details for print:", error);
            alert("Failed to print requisition.");
        }
    };

    const columns = [
        { field: 'faculty', headerName: 'Faculty', width: 130 },
        { field: 'itemname', headerName: 'Item Name', width: 150 },
        { field: 'quantity', headerName: 'Qty', width: 80 },
        { field: 'storename', headerName: 'Store', width: 130 },
        { 
            field: 'approvalOption', 
            headerName: 'Path', 
            width: 100,
            renderCell: (params) => (
                <Chip 
                    label={params.value} 
                    size="small" 
                    color={params.value === 'Manual' ? 'secondary' : 'default'} 
                />
            )
        },
        {
            field: 'hoiApproved',
            headerName: 'HOI Status',
            width: 130,
            renderCell: (params) => (
                <Box>
                    <Chip 
                        label={params.value ? "Approved" : "Pending"} 
                        color={params.value ? "success" : "warning"} 
                        size="small"
                        variant="outlined"
                    />
                    {params.row.hoiApproverName && (
                        <Typography variant="caption" display="block" sx={{ fontSize: '0.65rem' }}>
                            {params.row.hoiApproverName}
                        </Typography>
                    )}
                </Box>
            )
        },
        {
            field: 'ahoiApproved',
            headerName: 'AHOI Status',
            width: 130,
            renderCell: (params) => (
                params.row.approvalOption === 'Manual' ? (
                    <Box>
                        <Chip 
                            label={params.value ? "Approved" : "Pending"} 
                            color={params.value ? "success" : "warning"} 
                            size="small"
                            variant="outlined"
                        />
                        {params.row.ahoiApproverName && (
                            <Typography variant="caption" display="block" sx={{ fontSize: '0.65rem' }}>
                                {params.row.ahoiApproverName}
                            </Typography>
                        )}
                    </Box>
                ) : <Typography variant="caption" color="text.secondary">N/A</Typography>
            )
        },
        {
            field: 'reqstatus',
            headerName: 'Overall Status',
            width: 130,
            renderCell: (params) => (
                <Chip 
                    label={params.value} 
                    color={params.value === 'Approved' ? 'success' : params.value === 'Rejected' ? 'error' : 'primary'}
                    size="small"
                />
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 180,
            renderCell: (params) => (
                currentTab === 0 ? (
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleApprove(params.row)}
                        >
                            Approve
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleReject(params.row.id)}
                        >
                            Reject
                        </Button>
                    </Stack>
                ) : null
            )
        }
    ];

    return (
        <Box p={3} sx={{ height: '85vh', width: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" gutterBottom>
                    Faculty Request Approval
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handlePrint} 
                    disabled={selectedRows.length === 0}
                >
                    Print Selected ({selectedRows.length})
                </Button>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
                    <Tab label={`Pending Requests (${allRequests.filter(req => {
                        if (req.reqstatus !== 'Pending Approval') return false;
                        const isHOI = req.hoiapproveruserid === global1.user;
                        const isAHOI = req.ahoiapproveruserid === global1.user;
                        if (!isHOI && !isAHOI) return false;
                        if (isAHOI) return req.approvalOption === 'Manual' && !req.ahoiApproved;
                        if (isHOI) return !req.hoiApproved;
                        return true;
                    }).length})`} />
                    <Tab label="Approval History" />
                </Tabs>
            </Box>

            <Paper sx={{ height: '70%', width: '100%' }}>
                <DataGrid
                    rows={displayRequests}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    checkboxSelection
                    onRowSelectionModelChange={(newSelection) => {
                        setSelectedRows(newSelection);
                    }}
                    rowSelectionModel={selectedRows}
                    disableSelectionOnClick
                />
            </Paper>
        </Box>
    );
};

export default FacultyRequestApprovalds2;
