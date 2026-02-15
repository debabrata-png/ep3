import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Button // Added
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import FileDownloadIcon from '@mui/icons-material/FileDownload'; // Added
import * as XLSX from 'xlsx';                              // Added
import ep1 from '../api/ep1';
import global1 from './global1';

const PurchaseCellInventoryds = () => {
    const [inventory, setInventory] = useState([]);
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState('All');

    useEffect(() => {
        fetchStores();
        fetchInventory();
    }, []);

    const fetchStores = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallstoremasterds?colid=${global1.colid}`);
            setStores(res.data.data.stores || []);
        } catch (error) { console.error("Error fetching stores", error); }
    };

    const fetchInventory = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallstoreitemds?colid=${global1.colid}`);
            const items = res.data.data.storeItems || [];
            setInventory(items.map(i => ({ ...i, id: i._id })));
        } catch (error) { console.error("Error fetching inventory", error); }
    };

    const filteredInventory = selectedStore === 'All'
        ? inventory
        : inventory.filter(i => i.storeid === selectedStore);

    const columns = [
        { field: 'storeid', headerName: 'Store ID', width: 150 },
        { field: 'storename', headerName: 'Store', width: 200 },
        { field: 'name', headerName: 'Entry Name', width: 150 }, // Often 'Manual Stock Add'
        { field: 'itemname', headerName: 'Item Name', width: 200 },
        { field: 'itemcode', headerName: 'Code', width: 120 },
        { field: 'category', headerName: 'Category', width: 120 },
        { field: 'unit', headerName: 'Unit', width: 100 },
        { field: 'quantity', headerName: 'Available Qty', width: 150 },
        { field: 'type', headerName: 'Type', width: 150 },
        { field: 'user', headerName: 'User', width: 150 },
        {
            field: 'status', headerName: 'Status', width: 120, renderCell: (params) => (
                <Chip
                    label={params.value || 'N/A'} // Added 'N/A' fallback just in case
                    color={params.value === 'Available' ? 'success' : 'default'}
                    size="small"
                />
            )
        }
    ];

    const handleExport = () => {
        if (!filteredInventory || filteredInventory.length === 0) {
            alert("No data to export");
            return;
        }

        // Filter out unwanted fields
        const unwantedFields = ['_id', 'id', 'colid', 'user', 'createdAt', 'updatedAt', '__v'];
        const cleanRows = filteredInventory.map(row => {
            const newRow = { ...row };
            unwantedFields.forEach(f => delete newRow[f]);
            return newRow;
        });

        const ws = XLSX.utils.json_to_sheet(cleanRows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "StoreInventory");
        XLSX.writeFile(wb, `StoreInventory_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>Purchase Cell - Store Inventory Overview</Typography>

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormControl sx={{ minWidth: 300 }}>
                    <InputLabel>Filter by Store</InputLabel>
                    <Select
                        value={selectedStore}
                        label="Filter by Store"
                        onChange={(e) => setSelectedStore(e.target.value)}
                    >
                        <MenuItem value="All">All Stores</MenuItem>
                        {stores.map(s => <MenuItem key={s._id} value={s._id}>{s.storename}</MenuItem>)}
                    </Select>
                </FormControl>

                <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExport}>
                    Export
                </Button>
            </Box>

            <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={filteredInventory}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25]}
                    disableSelectionOnClick
                />
            </Paper>
        </Box>
    );
};

export default PurchaseCellInventoryds;
