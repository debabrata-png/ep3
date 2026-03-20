import ep1 from '../api/ep1';
import React, { useEffect, useState } from 'react';
import global1 from './global1';
import { 
    Button, Box, Grid, Dialog, DialogTitle, 
    DialogContent, DialogActions, TextField, Typography 
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';

function ViewFeesprovds() {
    const [rows, setRows] = useState([]);
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openBulk, setOpenBulk] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [formData, setFormData] = useState({
        name: '', user: '', programcode: '', feegroup: '', semester: '', 
        feeeitem: '', academicyear: '', feecategory: '', studtype: '', 
        domicile: '', feetype: '', classdate: dayjs().format('YYYY-MM-DD'), 
        amount: 0, status: 'Active', colid: global1.colid
    });
    const [file, setFile] = useState(null);

    const colid = global1.colid;

    const fetchFeesprovds = async () => {
        try {
            const response = await ep1.post('/api/v2/getfeesprovds', { colid });
            if (response.data.success) {
                setRows(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchFeesprovds();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAdd = async () => {
        try {
            await ep1.post('/api/v2/createfeesprovds', { ...formData, colid });
            setOpenAdd(false);
            fetchFeesprovds();
        } catch (error) {
            alert("Error adding record: " + error.message);
        }
    };

    const handleEdit = async () => {
        try {
            await ep1.post('/api/v2/updatefeesprovds', { 
                id: selectedRow._id, 
                colid, 
                updates: formData 
            });
            setOpenEdit(false);
            fetchFeesprovds();
        } catch (error) {
            alert("Error updating record: " + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            try {
                await ep1.post('/api/v2/deletefeesprovds', { id, colid });
                fetchFeesprovds();
            } catch (error) {
                alert("Error deleting record: " + error.message);
            }
        }
    };

    const handleBulkUpload = async () => {
        if (!file) {
            alert("Please select a file first");
            return;
        }
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('colid', colid);

        try {
            await ep1.post('/api/v2/bulkfeesprovds', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setOpenBulk(false);
            fetchFeesprovds();
            alert("Bulk upload successful");
        } catch (error) {
            alert("Error in bulk upload: " + error.message);
        }
    };

    const handleExport = () => {
        window.open(`${global1.backend_url}/api/v2/exportfeesprovds?colid=${colid}`, '_blank');
    };

    const handleDownloadTemplate = () => {
        window.open(`${global1.backend_url}/api/v2/templatefeesprovds`, '_blank');
    };

    const columns = [
        { field: 'name', headerName: 'Name', width: 150 },
        { field: 'user', headerName: 'User/Email', width: 180 },
        { field: 'programcode', headerName: 'Program', width: 120 },
        { field: 'feegroup', headerName: 'Fee Group', width: 120 },
        { field: 'semester', headerName: 'Semester', width: 100 },
        { field: 'feeeitem', headerName: 'Fee Item', width: 150 },
        { field: 'academicyear', headerName: 'Academic Year', width: 120 },
        { field: 'feecategory', headerName: 'Category', width: 120 },
        { field: 'amount', headerName: 'Amount', width: 100, type: 'number' },
        { field: 'classdate', headerName: 'Due Date', width: 150, valueFormatter: (params) => dayjs(params.value).format('DD-MM-YYYY') },
        { field: 'status', headerName: 'Status', width: 100 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            renderCell: (params) => (
                <Box>
                    <Button 
                        size="small" 
                        variant="outlined" 
                        color="primary" 
                        sx={{ mr: 1 }}
                        onClick={() => {
                            setSelectedRow(params.row);
                            setFormData(params.row);
                            setOpenEdit(true);
                        }}
                    >
                        Edit
                    </Button>
                    <Button 
                        size="small" 
                        variant="outlined" 
                        color="error"
                        onClick={() => handleDelete(params.row._id)}
                    >
                        Delete
                    </Button>
                </Box>
            )
        }
    ];

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="h5">Fees Provisioning</Typography>
                <Box>
                    <Button variant="contained" color="success" sx={{ mr: 1, fontSize: '12px' }} onClick={() => {
                        setFormData({
                            name: '', user: '', programcode: '', feegroup: '', semester: '', 
                            feeeitem: '', academicyear: '', feecategory: '', studtype: '', 
                            domicile: '', feetype: '', classdate: dayjs().format('YYYY-MM-DD'), 
                            amount: 0, status: 'Active', colid: global1.colid
                        });
                        setOpenAdd(true);
                    }}>
                        Add New
                    </Button>
                    <Button variant="contained" color="info" sx={{ mr: 1, fontSize: '12px' }} onClick={() => setOpenBulk(true)}>
                        Bulk Upload
                    </Button>
                    <Button variant="outlined" color="primary" sx={{ mr: 1, fontSize: '12px' }} onClick={handleDownloadTemplate}>
                        Template
                    </Button>
                    <Button variant="outlined" color="secondary" sx={{ fontSize: '12px' }} onClick={handleExport}>
                        Export
                    </Button>
                </Box>
            </Box>

            <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid 
                    rows={rows} 
                    columns={columns} 
                    getRowId={(row) => row._id}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 10 } },
                    }}
                />
            </Box>

            {/* Add Dialog */}
            <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Fee Provisioning</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}><TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleInputChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="User/Email" name="user" value={formData.user} onChange={handleInputChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Program Code" name="programcode" value={formData.programcode} onChange={handleInputChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Fee Group" name="feegroup" value={formData.feegroup} onChange={handleInputChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Semester" name="semester" value={formData.semester} onChange={handleInputChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Fee Item" name="feeeitem" value={formData.feeeitem} onChange={handleInputChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Academic Year" name="academicyear" value={formData.academicyear} onChange={handleInputChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Fee Category" name="feecategory" value={formData.feecategory} onChange={handleInputChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Student Type" name="studtype" value={formData.studtype} onChange={handleInputChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Domicile" name="domicile" value={formData.domicile} onChange={handleInputChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Fee Type" name="feetype" value={formData.feetype} onChange={handleInputChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth type="date" label="Due Date" name="classdate" InputLabelProps={{ shrink: true }} value={formData.classdate} onChange={handleInputChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth type="number" label="Amount" name="amount" value={formData.amount} onChange={handleInputChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Status" name="status" value={formData.status} onChange={handleInputChange} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleAdd}>Add</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Fee Provisioning</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}><TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleInputChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="User/Email" name="user" value={formData.user} onChange={handleInputChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Program Code" name="programcode" value={formData.programcode} onChange={handleInputChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Fee Group" name="feegroup" value={formData.feegroup} onChange={handleInputChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Semester" name="semester" value={formData.semester} onChange={handleInputChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Fee Item" name="feeeitem" value={formData.feeeitem} onChange={handleInputChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Academic Year" name="academicyear" value={formData.academicyear} onChange={handleInputChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Fee Category" name="feecategory" value={formData.feecategory} onChange={handleInputChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Student Type" name="studtype" value={formData.studtype} onChange={handleInputChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Domicile" name="domicile" value={formData.domicile} onChange={handleInputChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Fee Type" name="feetype" value={formData.feetype} onChange={handleInputChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth type="date" label="Due Date" name="classdate" InputLabelProps={{ shrink: true }} value={formData.classdate ? dayjs(formData.classdate).format('YYYY-MM-DD') : ''} onChange={handleInputChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth type="number" label="Amount" name="amount" value={formData.amount} onChange={handleInputChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Status" name="status" value={formData.status} onChange={handleInputChange} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleEdit}>Update</Button>
                </DialogActions>
            </Dialog>

            {/* Bulk Upload Dialog */}
            <Dialog open={openBulk} onClose={() => setOpenBulk(false)}>
                <DialogTitle>Bulk Upload Fees Provisioning</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <input type="file" accept=".xlsx, .xls" onChange={(e) => setFile(e.target.files[0])} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBulk(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleBulkUpload}>Upload</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default ViewFeesprovds;
