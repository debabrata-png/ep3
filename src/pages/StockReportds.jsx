import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Breadcrumbs,
    Card,
    Divider,
    Button
} from '@mui/material';
import { Inventory, Download } from '@mui/icons-material';
import global1 from './global1';
import ep1 from '../api/ep1';
import * as XLSX from 'xlsx';

const StockReportds = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stockData, setStockData] = useState([]);

    const colid = global1.colid;
    const user = global1.user;

    useEffect(() => {
        const fetchStockReport = async () => {
            try {
                setLoading(true);
                const response = await ep1.get('/api/v2/getstockreportds2', {
                    params: { colid, user }
                });

                if (response.data.success) {
                    setStockData(response.data.data);
                } else {
                    setError('Failed to fetch stock data');
                }
            } catch (err) {
                console.error('Error fetching stock report:', err);
                setError('An error occurred while fetching the stock report.');
            } finally {
                setLoading(false);
            }
        };

        if (colid && user) {
            fetchStockReport();
        } else {
            setError('Missing user or college information.');
            setLoading(false);
        }
    }, [colid, user]);

    const handleDownloadExcel = () => {
        if (!stockData || stockData.length === 0) {
            alert('No data to export');
            return;
        }

        // Prepare rows
        const rows = stockData.map((item, index) => ({
            'Sr.No': index + 1,
            'Category': item.category || '-',
            'Item Name': item.itemname || '-',
            'Type': item.type || '-',
            'Item Code': item.itemcode || '-',
            'Stock (Qty)': item.quantity ?? 0,
            'Store': item.storename || '-',
            'Status': item.status || '-'
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);

        // Column widths
        worksheet['!cols'] = [
            { wch: 6 }, { wch: 18 }, { wch: 25 }, { wch: 15 },
            { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 15 }
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Report');

        const fileName = `Stock_Report_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4, maxWidth: '1200px', margin: '0 auto' }}>
            {/* Breadcrumbs */}
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Inventory sx={{ mr: 0.5 }} fontSize="inherit" />
                    Stock Report
                </Typography>
            </Breadcrumbs>

            <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ p: 3, background: 'linear-gradient(90deg, #1976d2 0%, #0d47a1 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold">
                            Stock Inventory Report
                        </Typography>
                        <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
                            Current stock levels for your assigned stores
                        </Typography>
                    </Box>

                    {/* Download Excel Button */}
                    <Button
                        variant="contained"
                        startIcon={<Download />}
                        onClick={handleDownloadExcel}
                        disabled={stockData.length === 0}
                        sx={{
                            backgroundColor: '#fff',
                            color: '#1976d2',
                            fontWeight: 'bold',
                            '&:hover': { backgroundColor: '#e3f2fd' },
                            '&:disabled': { backgroundColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.6)' }
                        }}
                    >
                        Download Excel
                    </Button>
                </Box>

                <Divider />

                <Box sx={{ p: 3 }}>
                    {error ? (
                        <Alert severity="error">{error}</Alert>
                    ) : stockData.length === 0 ? (
                        <Alert severity="info" variant="outlined">No stock data available for the selected criteria.</Alert>
                    ) : (
                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                            <Table stickyHeader aria-label="stock report table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', color: '#1976d2' }}>Sr.No</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', color: '#1976d2' }}>Category</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', color: '#1976d2' }}>ItemName</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', color: '#1976d2' }}>Type</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', color: '#1976d2' }}>Item Code</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', color: '#1976d2' }}>Stock</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', color: '#1976d2' }}>Store</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {stockData.map((item, index) => (
                                        <TableRow
                                            key={item._id || index}
                                            hover
                                            sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}
                                        >
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{item.category || '-'}</TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>{item.itemname || '-'}</TableCell>
                                            <TableCell>
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        px: 1.5,
                                                        py: 0.5,
                                                        borderRadius: 1,
                                                        fontSize: '0.875rem',
                                                        backgroundColor: item.type === 'Consumable' ? '#e3f2fd' : '#f1f8e9',
                                                        color: item.type === 'Consumable' ? '#1976d2' : '#388e3c'
                                                    }}
                                                >
                                                    {item.type || '-'}
                                                </Box>
                                            </TableCell>
                                            <TableCell>{item.itemcode || '-'}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                                {item.quantity ?? 0}
                                            </TableCell>
                                            <TableCell>{item.storename || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>

                <Box sx={{ p: 2, textAlign: 'right', backgroundColor: '#fcfcfc' }}>
                    <Typography variant="caption" color="text.secondary">
                        Generated on: {new Date().toLocaleString()}
                    </Typography>
                </Box>
            </Card>

            <style dangerouslySetInnerHTML={{
                __html: `
                .MuiTableCell-root {
                    padding: 14px 16px;
                }
                .MuiTableRow-hover:hover {
                    background-color: #f0f7ff !important;
                    transition: background-color 0.2s ease;
                }
            `}} />
        </Box>
    );
};

export default StockReportds;
