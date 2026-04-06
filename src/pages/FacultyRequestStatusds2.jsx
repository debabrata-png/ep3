import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    Button
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';
import { createRoot } from 'react-dom/client';
import FacultyRequisitionPrintTemplate from './FacultyRequisitionPrintTemplate';

const FacultyRequestStatusds2 = () => {
    const [requests, setRequests] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await ep1.get(`/api/v2/getallrequisationds2?colid=${global1.colid}`);
            // Filter by user
            const allRequests = response.data.data.requisitions || [];
            // Assuming 'user' field in request matches global1.user
            const myRequests = allRequests.filter(req => req.user === global1.user || req.faculty === global1.name);
            setRequests(myRequests.map(r => ({ ...r, id: r._id })));
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'warning';
            case 'Allotted': return 'success';
            case 'Purchasing': return 'info';
            case 'Delivered': return 'primary';
            default: return 'default';
        }
    };

    const handlePrint = async () => {
        const itemsToPrint = requests.filter(r => selectedRows.includes(r.id));
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
                    indentNumber={itemsToPrint[0]?.indentNumber || "________________"}
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

    // Dynamic Columns
    const generateColumns = (data) => {
        if (!data || data.length === 0) return [];
        const keys = Object.keys(data[0]);
        return keys
            .filter(key => key !== '_id' && key !== 'colid' && key !== 'id' && key !== '__v')
            .map(key => {
                const colDef = {
                    field: key,
                    headerName: key.charAt(0).toUpperCase() + key.slice(1),
                    width: 150
                };

                if (key.toLowerCase().includes('date')) {
                    colDef.valueFormatter = (params) => {
                        if (!params.value) return 'N/A';
                        const date = new Date(params.value);
                        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-GB');
                    };
                }

                if (key === 'reqstatus') {
                    colDef.renderCell = (params) => (
                        <Chip
                            label={params.value || 'Pending'}
                            color={getStatusColor(params.value)}
                            variant="outlined"
                            size="small"
                        />
                    );
                }

                return colDef;
            });
    };

    const columns = generateColumns(requests);

    return (
        <Box p={3} sx={{ height: '85vh', width: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" gutterBottom>
                    My Requisition Status
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

            <Paper sx={{ height: '100%', width: '100%' }}>
                <DataGrid
                    rows={requests}
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

export default FacultyRequestStatusds2;
