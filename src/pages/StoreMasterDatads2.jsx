import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Tabs, Tab, Paper, Button, Grid, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem,
    FormControl, InputLabel, CircularProgress, Backdrop, IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import * as XLSX from 'xlsx';
import ep1 from '../api/ep1';
import global1 from './global1';

const StoreMasterDatads2 = () => {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    
    // Data States
    const [itemTypes, setItemTypes] = useState([]);
    const [itemCategories, setItemCategories] = useState([]);
    const [itemUnits, setItemUnits] = useState([]);
    const [items, setItems] = useState([]);

    // Dialog States
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState('create');
    const [currentContext, setCurrentContext] = useState('item');
    const [currentItem, setCurrentItem] = useState({});
    const [bulkLoading, setBulkLoading] = useState(false);
    const [bulkMessage, setBulkMessage] = useState("");

    useEffect(() => {
        fetchInitialData();
    }, [tabValue]);

    const fetchInitialData = async () => {
        setLoading(true);
        if (tabValue === 0) { setCurrentContext('item'); await fetchItems(); }
        if (tabValue === 1) { setCurrentContext('category'); await fetchCategories(); }
        if (tabValue === 2) { setCurrentContext('type'); await fetchTypes(); }
        setLoading(false);
    };

    const fetchItems = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallitemmasterds2?colid=${global1.colid}`);
            setItems((res.data.data.items || res.data.data || []).map(r => ({ ...r, id: r._id })));
            // Also fetch deps
            fetchCategories(); fetchTypes(); fetchUnits();
        } catch (e) { console.error(e); }
    };

    const fetchCategories = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallitemcategoryds2?colid=${global1.colid}`);
            setItemCategories((res.data.data.items || res.data.data || []).map(r => ({ ...r, id: r._id })));
        } catch (e) { console.error(e); }
    };

    const fetchTypes = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallitemtypeds2?colid=${global1.colid}`);
            setItemTypes((res.data.data.itemTypes || res.data.data || []).map(r => ({ ...r, id: r._id })));
        } catch (e) { console.error(e); }
    };

    const fetchUnits = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallitemunitds2?colid=${global1.colid}`);
            setItemUnits((res.data.data.items || res.data.data || []).map(r => ({ ...r, id: r._id })));
        } catch (e) { console.error(e); }
    };

    const handleFormSubmit = async () => {
        try {
            const payload = { ...currentItem, colid: global1.colid, user: global1.user };
            if (currentContext === 'item') {
                payload.name = currentItem.itemname;
                if (formMode === 'create') await ep1.post('/api/v2/additemmasterds2', payload);
                else await ep1.post(`/api/v2/updateitemmasterds2?id=${currentItem._id}`, payload);
                fetchItems();
            } else if (currentContext === 'category') {
                payload.categoryname = currentItem.name;
                if (formMode === 'create') await ep1.post('/api/v2/additemcategoryds2', payload);
                else await ep1.post(`/api/v2/updateitemcategoryds2?id=${currentItem._id}`, payload);
                fetchCategories();
            } else if (currentContext === 'type') {
                payload.name = currentItem.itemtype;
                if (formMode === 'create') await ep1.post('/api/v2/additemtypeds2', payload);
                else await ep1.post(`/api/v2/updateitemtypeds2?id=${currentItem._id}`, payload);
                fetchTypes();
            }
            alert("Saved successfully");
            setFormOpen(false);
        } catch (e) { console.error(e); alert("Failed to save"); }
    };

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                setBulkLoading(true);
                let success = 0;
                for (let i = 0; i < data.length; i++) {
                    setBulkMessage(`Uploading ${i+1}/${data.length}...`);
                    try {
                        const payload = { ...data[i], colid: global1.colid, user: global1.user };
                        
                        // Context-specific mapping
                        if (currentContext === 'item') {
                            payload.name = data[i].itemname || data[i].name;
                            await ep1.post('/api/v2/additemmasterds2', payload);
                        } else if (currentContext === 'category') {
                            payload.categoryname = data[i].categoryname || data[i].name;
                            await ep1.post('/api/v2/additemcategoryds2', payload);
                        } else if (currentContext === 'type') {
                            payload.name = data[i].itemtype || data[i].name;
                            await ep1.post('/api/v2/additemtypeds2', payload);
                        }
                        
                        success++;
                    } catch (err) { console.error("Row error:", err); }
                }
                alert(`Upload complete. Successfully uploaded ${success} items.`);
                fetchInitialData();
            } catch (err) { console.error(err); alert("Error parsing file"); }
            finally { setBulkLoading(false); }
        };
        reader.readAsBinaryString(file);
        e.target.value = null;
    };

    const handleDownloadTemplate = () => {
        let headers = [];
        let filename = "";
        
        if (currentContext === 'item') {
            headers = [{ itemname: 'Example Item', itemcode: 'ITEM01', category: 'Stationery', itemtype: 'Consumable', unit: 'Pcs' }];
            filename = "Item_Master_Template.xlsx";
        } else if (currentContext === 'category') {
            headers = [{ name: 'Stationery', description: 'Office supplies like pens, paper' }];
            filename = "Category_Template.xlsx";
        } else if (currentContext === 'type') {
            headers = [{ itemtype: 'Consumable', description: 'Items that are used up and need replacement' }];
            filename = "Type_Template.xlsx";
        }
        
        const ws = XLSX.utils.json_to_sheet(headers);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, filename);
    };

    const handleEdit = (row) => {
        setCurrentItem(row);
        setFormMode('edit');
        setFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        try {
            if (currentContext === 'item') {
                await ep1.get(`/api/v2/deleteitemmasterds2?id=${id}`);
            } else if (currentContext === 'category') {
                await ep1.get(`/api/v2/deleteitemcategoryds2?id=${id}`);
            } else if (currentContext === 'type') {
                await ep1.get(`/api/v2/deleteitemtypeds2?id=${id}`);
            }
            alert("Deleted successfully");
            fetchInitialData();
        } catch (e) {
            console.error(e);
            alert("Failed to delete record");
        }
    };

    const actionColumn = {
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        sortable: false,
        renderCell: (params) => (
            <Box>
                <IconButton color="primary" onClick={() => handleEdit(params.row)} size="small">
                    <EditIcon fontSize="small" />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(params.row._id || params.row.id)} size="small">
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Box>
        )
    };

    const columns = {
        item: [
            { field: 'itemname', headerName: 'Item Name', width: 200 },
            { field: 'itemcode', headerName: 'Code', width: 120 },
            { field: 'category', headerName: 'Category', width: 150 },
            { field: 'itemtype', headerName: 'Type', width: 150 },
            { field: 'unit', headerName: 'Unit', width: 100 },
            { field: 'status', headerName: 'Status', width: 120 },
            actionColumn
        ],
        category: [
            { field: 'name', headerName: 'Category Name', width: 250 },
            { field: 'description', headerName: 'Description', width: 350 },
            { field: 'status', headerName: 'Status', width: 150 },
            actionColumn
        ],
        type: [
            { field: 'itemtype', headerName: 'Type Name', width: 250 },
            { field: 'description', headerName: 'Description', width: 350 },
            { field: 'status', headerName: 'Status', width: 150 },
            actionColumn
        ]
    };

    return (
        <Box p={3} sx={{ pt: 10 }}>
            <Backdrop sx={{ color: '#fff', zIndex: 2000 }} open={bulkLoading}>
                <Box textAlign="center"><CircularProgress color="inherit" /><Typography sx={{ mt: 2 }}>{bulkMessage}</Typography></Box>
            </Backdrop>

            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#1a237e' }}>Store Master Data</Typography>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
                <Tab label="Item Master" />
                <Tab label="Categories" />
                <Tab label="Types" />
            </Tabs>

            <Box sx={{ mb: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" color="success" startIcon={<DownloadIcon />} onClick={handleDownloadTemplate}>
                    Download {currentContext.charAt(0).toUpperCase() + currentContext.slice(1)} Template
                </Button>
                <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
                    Bulk {currentContext.charAt(0).toUpperCase() + currentContext.slice(1)} Upload 
                    <input type="file" hidden accept=".xlsx,.xls" onChange={handleBulkUpload} />
                </Button>
                <Button variant="contained" onClick={() => { setFormMode('create'); setCurrentItem({}); setFormOpen(true); }}>Add New</Button>
            </Box>

            <Paper sx={{ height: 600 }}>
                <DataGrid rows={tabValue === 0 ? items : (tabValue === 1 ? itemCategories : itemTypes)} columns={columns[currentContext]} loading={loading} />
            </Paper>

            <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{formMode === 'create' ? 'Add' : 'Edit'} {currentContext.toUpperCase()}</DialogTitle>
                <DialogContent dividers>
                    {currentContext === 'item' && (
                        <Grid container spacing={2}>
                            <Grid item xs={12}><TextField fullWidth label="Item Name" value={currentItem.itemname || ''} onChange={e => setCurrentItem({...currentItem, itemname: e.target.value})} /></Grid>
                            <Grid item xs={12}><TextField fullWidth label="Item Code" value={currentItem.itemcode || ''} onChange={e => setCurrentItem({...currentItem, itemcode: e.target.value})} /></Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth><InputLabel>Category</InputLabel>
                                    <Select value={currentItem.category || ''} label="Category" onChange={e => setCurrentItem({...currentItem, category: e.target.value})}>
                                        {itemCategories.map(c => <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth><InputLabel>Type</InputLabel>
                                    <Select value={currentItem.itemtype || ''} label="Type" onChange={e => setCurrentItem({...currentItem, itemtype: e.target.value})}>
                                        {itemTypes.map(t => <MenuItem key={t.id} value={t.itemtype}>{t.itemtype}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    )}
                    {currentContext === 'category' && <TextField fullWidth label="Category Name" value={currentItem.name || ''} onChange={e => setCurrentItem({...currentItem, name: e.target.value})} />}
                    {currentContext === 'type' && <TextField fullWidth label="Type Name" value={currentItem.itemtype || ''} onChange={e => setCurrentItem({...currentItem, itemtype: e.target.value})} />}
                </DialogContent>
                <DialogActions><Button onClick={() => setFormOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleFormSubmit}>Save</Button></DialogActions>
            </Dialog>
        </Box>
    );
};

export default StoreMasterDatads2;
