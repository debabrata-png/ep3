
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Autocomplete, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import ep1 from '../api/ep1';
import global1 from './global1';

const StoreUserAccessds = () => {
    const [users, setUsers] = useState([]);
    const [stores, setStores] = useState([]);
    const [mappings, setMappings] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedStore, setSelectedStore] = useState(null);

    useEffect(() => {
        // Restore global context if needed
        if (!global1.colid && localStorage.getItem('colid')) {
            global1.colid = localStorage.getItem('colid');
            global1.user = localStorage.getItem('user');
        }

        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch All Users (for dropdown)
            // Assuming endpoint exists, otherwise fallback to text input or specific role users
            // Using getallusers or similar. If not available, we might need to rely on typed input or fetch from a known user endpoint.
            // Let's try fetching 'getallusers' or 'getallstoreuserds' (existing mappings)
            // Ideally we need a list of ALL potential users. 
            // I will use a generic fetch for now, or if fails, rely on manual entry if specific user endpoint is restricted.
            // Converting to simple list for Autocomplete.
            const userRes = await ep1.post('/api/v2/getallusers', { colid: global1.colid });
            // If getallusers is POST and returns { data: [...] }
            setUsers(userRes.data.data || []);

            // 2. Fetch Stores
            const storeRes = await ep1.get(`/api/v2/getallstoremasterds?colid=${global1.colid}`);
            setStores(storeRes.data.data.stores || []);

            // 3. Fetch Existing Mappings
            const mapRes = await ep1.get(`/api/v2/getallstoreuserds?colid=${global1.colid}`);
            setMappings(mapRes.data.data.storeUsers || []);

        } catch (error) {
            console.error("Error fetching data:", error);
        }
        setLoading(false);
    };

    const handleAddMapping = async () => {
        if (!selectedUser || !selectedStore) {
            alert("Please select both a User and a Store.");
            return;
        }

        try {
            const payload = {
                name: selectedUser.name || selectedUser.username, // User's Name
                user: selectedUser.username || selectedUser.email, // User's ID/Email (matches global1.user)
                userid: selectedUser._id, // Optional but good for ref
                store: selectedStore.storename,
                storeid: selectedStore._id,
                colid: global1.colid,

                // Fields required by model but maybe redundant for logic
                storeuser: selectedUser.username || selectedUser.email,
                level: '1' // Default level
            };

            await ep1.post('/api/v2/addstoreuserds', payload);
            alert("Access Granted Successfully");
            fetchData(); // Refresh list
            setSelectedUser(null);
            setSelectedStore(null);
        } catch (error) {
            console.error("Error adding mapping:", error);
            alert("Failed to grant access.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to revoke this access?")) return;
        try {
            await ep1.get(`/api/v2/deletestoreuserds?id=${id}`);
            fetchData();
        } catch (error) {
            console.error("Error deleting mapping:", error);
            alert("Failed to revoke access.");
        }
    };

    const columns = [
        { field: 'name', headerName: 'User Name', width: 200 },
        { field: 'user', headerName: 'User Email/ID', width: 250 },
        { field: 'store', headerName: 'Assigned Store', width: 250 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            renderCell: (params) => (
                <IconButton color="error" onClick={() => handleDelete(params.row._id)}>
                    <DeleteIcon />
                </IconButton>
            )
        }
    ];

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>Store User Access Control</Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Grant Access</Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <Autocomplete
                            options={users}
                            getOptionLabel={(option) => `${option.name} (${option.username || option.email})`}
                            value={selectedUser}
                            onChange={(event, newValue) => setSelectedUser(newValue)}
                            renderInput={(params) => <TextField {...params} label="Select User" />}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Autocomplete
                            options={stores}
                            getOptionLabel={(option) => option.storename}
                            value={selectedStore}
                            onChange={(event, newValue) => setSelectedStore(newValue)}
                            renderInput={(params) => <TextField {...params} label="Select Store" />}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={handleAddMapping}
                            disabled={!selectedUser || !selectedStore}
                        >
                            Grant Access
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ height: 500, width: '100%' }}>
                <DataGrid
                    rows={mappings}
                    columns={columns}
                    getRowId={(row) => row._id}
                    loading={loading}
                    pageSizeOptions={[10, 25]}
                />
            </Paper>
        </Box>
    );
};

export default StoreUserAccessds;
