import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, TextField, Button, Divider, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
    CircularProgress, Backdrop
} from '@mui/material';
import { DataGrid, GridToolbarContainer, GridToolbarQuickFilter, GridToolbarExport, GridToolbarFilterButton } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import ep1 from '../api/ep1';
import global1 from './global1';

import S3 from 'react-aws-s3';
window.Buffer = window.Buffer || require("buffer").Buffer;

function CustomToolbar() {
    return (
        <GridToolbarContainer sx={{ p: 1, gap: 1 }}>
            <GridToolbarQuickFilter sx={{ flex: 1 }} />
            <GridToolbarFilterButton />
            <GridToolbarExport />
        </GridToolbarContainer>
    );
}

const ManualQualityCheckds2 = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stores, setStores] = useState([]);

    // Form state
    const [deliveredToStore, setDeliveredToStore] = useState('');
    const [vendorName, setVendorName] = useState('');
    const [material, setMaterial] = useState('');
    const [invoiceNo, setInvoiceNo] = useState('');
    const [chalanNo, setChalanNo] = useState('');
    const [modeOfSupply, setModeOfSupply] = useState('');
    const [supplyRemark, setSupplyRemark] = useState('');
    const [dateOfQualityCheck, setDateOfQualityCheck] = useState(new Date().toISOString().split('T')[0]);
    const [initiatedBy, setInitiatedBy] = useState('');
    const [remark, setRemark] = useState('');
    const [documentLink, setDocumentLink] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Edit state
    const [editOpen, setEditOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editDeliveredToStore, setEditDeliveredToStore] = useState('');
    const [editVendorName, setEditVendorName] = useState('');
    const [editMaterial, setEditMaterial] = useState('');
    const [editInvoiceNo, setEditInvoiceNo] = useState('');
    const [editChalanNo, setEditChalanNo] = useState('');
    const [editModeOfSupply, setEditModeOfSupply] = useState('');
    const [editSupplyRemark, setEditSupplyRemark] = useState('');
    const [editDateOfQualityCheck, setEditDateOfQualityCheck] = useState('');
    const [editInitiatedBy, setEditInitiatedBy] = useState('');
    const [editRemark, setEditRemark] = useState('');
    const [editDocumentLink, setEditDocumentLink] = useState('');
    const [editSelectedFile, setEditSelectedFile] = useState(null);
    const [editUploading, setEditUploading] = useState(false);

    // S3 config from global1
    const s3Config = {
        bucketName: global1.bucket,
        region: global1.region,
        accessKeyId: global1.username,
        secretAccessKey: global1.password,
    };

    useEffect(() => { fetchData(); fetchStores(); }, []); // eslint-disable-line

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await ep1.get(`/api/v2/getallmanualqcds2?user=${global1.user}&colid=${global1.colid}`);
            setRows((res.data.data || []).map(r => ({ ...r, id: r._id })));
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const fetchStores = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallstoremasterds2?colid=${global1.colid}`);
            setStores(res.data.data?.stores || []);
        } catch (e) { console.error(e); }
    };

    const resetForm = () => {
        setDeliveredToStore(''); setVendorName(''); setMaterial('');
        setInvoiceNo(''); setChalanNo(''); setModeOfSupply('');
        setSupplyRemark(''); setDateOfQualityCheck(new Date().toISOString().split('T')[0]);
        setInitiatedBy(''); setRemark(''); setDocumentLink(''); setSelectedFile(null);
    };

    const uploadToS3 = (file, setLink, setIsUploading) => {
        if (!file) { alert('Please select a file first'); return; }
        if (!global1.username) { alert('Please configure AWS settings under Settings - AWS config'); return; }
        setIsUploading(true);
        const ReactS3Client = new S3(s3Config);
        const dt1 = new Date();
        const month = dt1.getMonth() + 1;
        const dt2 = month + '-' + dt1.getFullYear() + '-' + dt1.getDate() + '-' + dt1.getMinutes() + dt1.getSeconds();
        const newFileName = dt2 + '-' + file.name;
        ReactS3Client.uploadFile(file, newFileName)
            .then(data => { setLink(data.location); alert('File uploaded successfully!'); setIsUploading(false); })
            .catch(err => { alert('Upload failed: ' + err); setIsUploading(false); });
    };

    const handleAdd = async () => {
        try {
            await ep1.post('/api/v2/addmanualqcds2', {
                deliveredToStore, vendorName, material, invoiceNo, chalanNo,
                modeOfSupply, supplyRemark, dateOfQualityCheck, initiatedBy,
                remark, documentLink, name: global1.name, user: global1.user, colid: global1.colid
            });
            resetForm();
            fetchData();
        } catch (err) {
            alert('Failed to add: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this record?')) return;
        try {
            await ep1.get(`/api/v2/deletemanualqcds2?id=${id}`);
            fetchData();
        } catch (err) {
            alert('Failed to delete: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleEditOpen = (row) => {
        setEditId(row._id);
        setEditDeliveredToStore(row.deliveredToStore || '');
        setEditVendorName(row.vendorName || '');
        setEditMaterial(row.material || '');
        setEditInvoiceNo(row.invoiceNo || '');
        setEditChalanNo(row.chalanNo || '');
        setEditModeOfSupply(row.modeOfSupply || '');
        setEditSupplyRemark(row.supplyRemark || '');
        setEditDateOfQualityCheck(row.dateOfQualityCheck ? new Date(row.dateOfQualityCheck).toISOString().split('T')[0] : '');
        setEditInitiatedBy(row.initiatedBy || '');
        setEditRemark(row.remark || '');
        setEditDocumentLink(row.documentLink || '');
        setEditSelectedFile(null);
        setEditOpen(true);
    };

    const handleEditSave = async () => {
        try {
            await ep1.post('/api/v2/updatemanualqcds2', {
                _id: editId,
                deliveredToStore: editDeliveredToStore,
                vendorName: editVendorName,
                material: editMaterial,
                invoiceNo: editInvoiceNo,
                chalanNo: editChalanNo,
                modeOfSupply: editModeOfSupply,
                supplyRemark: editSupplyRemark,
                dateOfQualityCheck: editDateOfQualityCheck,
                initiatedBy: editInitiatedBy,
                remark: editRemark,
                documentLink: editDocumentLink
            });
            setEditOpen(false);
            fetchData();
        } catch (err) {
            alert('Failed to update: ' + (err.response?.data?.error || err.message));
        }
    };

    const handlePrint = (row) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html><head><title>Manual Quality Check Report</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; font-size: 13px; }
                h2 { text-align: center; margin-bottom: 4px; }
                .subtitle { text-align: center; color: #555; margin-bottom: 20px; }
                .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 12px 0; }
                .field { display: flex; flex-direction: column; }
                .label { font-size: 11px; color: #555; }
                .value { font-weight: 600; border-bottom: 1px solid #333; min-height: 20px; }
                .sig-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 40px; text-align: center; }
                .sig-box { border-top: 1px solid #333; padding-top: 4px; font-size: 12px; }
            </style>
            </head><body>
            <h2>Manual Quality Check Report</h2>
            <p class="subtitle">Sr. No: ${row.srno || 'N/A'}</p>
            <div class="grid2">
                <div class="field"><span class="label">Sr. No</span><span class="value">${row.srno || ''}</span></div>
                <div class="field"><span class="label">Delivered To Store</span><span class="value">${row.deliveredToStore || ''}</span></div>
                <div class="field"><span class="label">Name of Vendor</span><span class="value">${row.vendorName || ''}</span></div>
                <div class="field"><span class="label">Material</span><span class="value">${row.material || ''}</span></div>
                <div class="field"><span class="label">Invoice No</span><span class="value">${row.invoiceNo || ''}</span></div>
                <div class="field"><span class="label">Chalan No</span><span class="value">${row.chalanNo || ''}</span></div>
                <div class="field"><span class="label">Mode of Supply</span><span class="value">${row.modeOfSupply || ''}</span></div>
                <div class="field"><span class="label">Supply Remark</span><span class="value">${row.supplyRemark || ''}</span></div>
                <div class="field"><span class="label">Date of Quality Check</span><span class="value">${row.dateOfQualityCheck ? new Date(row.dateOfQualityCheck).toLocaleDateString('en-GB') : ''}</span></div>
                <div class="field"><span class="label">Initiated By</span><span class="value">${row.initiatedBy || ''}</span></div>
                <div class="field"><span class="label">Remark</span><span class="value">${row.remark || ''}</span></div>
                <div class="field"><span class="label">Document Link</span><span class="value">${row.documentLink ? '<a href="' + row.documentLink + '">' + row.documentLink + '</a>' : 'N/A'}</span></div>
                <div class="field"><span class="label">Name</span><span class="value">${row.name || ''}</span></div>
                <div class="field"><span class="label">User</span><span class="value">${row.user || ''}</span></div>
            </div>
            <div class="sig-row">
                <div class="sig-box">${row.name || ''}<br/>Prepared By</div>
                <div class="sig-box"><br/>Verified By</div>
                <div class="sig-box"><br/>Authorized Signature</div>
            </div>
            <script>window.print();</script>
            </body></html>
        `);
        printWindow.document.close();
    };

    const formatDate = (v) => v ? new Date(v).toLocaleDateString('en-GB') : '';

    const columns = [
        { field: 'srno', headerName: 'Sr. No', width: 80 },
        { field: 'deliveredToStore', headerName: 'Delivered To Store', width: 150 },
        { field: 'vendorName', headerName: 'Vendor Name', width: 150 },
        { field: 'material', headerName: 'Material', width: 140 },
        { field: 'invoiceNo', headerName: 'Invoice No', width: 120 },
        { field: 'chalanNo', headerName: 'Chalan No', width: 120 },
        { field: 'modeOfSupply', headerName: 'Mode of Supply', width: 130 },
        { field: 'supplyRemark', headerName: 'Supply Remark', width: 140 },
        { field: 'dateOfQualityCheck', headerName: 'Date of QC', width: 120, valueFormatter: (v) => formatDate(v) },
        { field: 'initiatedBy', headerName: 'Initiated By', width: 130 },
        { field: 'remark', headerName: 'Remark', width: 140 },
        {
            field: 'documentLink', headerName: 'Document Link', width: 150,
            renderCell: (p) => p.value ? <a href={p.value} target="_blank" rel="noreferrer" style={{ color: '#1976d2' }}>View Document</a> : ''
        },
        { field: 'name', headerName: 'Name', width: 130 },
        { field: 'user', headerName: 'User', width: 150 },
        {
            field: 'actions', headerName: 'Actions', width: 150, sortable: false, filterable: false,
            renderCell: (p) => (
                <Box>
                    <IconButton size="small" color="primary" onClick={() => handleEditOpen(p.row)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(p.row._id)}><DeleteIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="info" onClick={() => handlePrint(p.row)}><PrintIcon fontSize="small" /></IconButton>
                </Box>
            )
        }
    ];

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>Manual Quality Check</Typography>

            {/* Upload backdrop */}
            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={uploading || editUploading}>
                <CircularProgress color="inherit" />
            </Backdrop>

            {/* Add Form */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Add New Quality Check</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth select label="Delivered To Store" size="small"
                            value={deliveredToStore} onChange={(e) => setDeliveredToStore(e.target.value)}
                        >
                            {stores.map((s) => (
                                <MenuItem key={s._id} value={s.storename}>{s.storename}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField fullWidth label="Name of Vendor" size="small" value={vendorName} onChange={(e) => setVendorName(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField fullWidth label="Material" size="small" value={material} onChange={(e) => setMaterial(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField fullWidth label="Invoice No" size="small" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField fullWidth label="Chalan No" size="small" value={chalanNo} onChange={(e) => setChalanNo(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField fullWidth label="Mode of Supply" size="small" value={modeOfSupply} onChange={(e) => setModeOfSupply(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField fullWidth label="Supply Remark" size="small" value={supplyRemark} onChange={(e) => setSupplyRemark(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField fullWidth label="Date of Quality Check" type="date" size="small" value={dateOfQualityCheck} onChange={(e) => setDateOfQualityCheck(e.target.value)} InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField fullWidth label="Initiated By" size="small" value={initiatedBy} onChange={(e) => setInitiatedBy(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField fullWidth label="Remark" size="small" value={remark} onChange={(e) => setRemark(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField fullWidth label="Name" size="small" value={global1.name || ''} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField fullWidth label="User" size="small" value={global1.user || ''} InputProps={{ readOnly: true }} />
                    </Grid>

                    {/* Document Link + Upload */}
                    <Grid item xs={12}><Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1 }}>Document Attachment</Typography><Divider /></Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Document Link" size="small" value={documentLink} onChange={(e) => setDocumentLink(e.target.value)} placeholder="Paste link or upload file" />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button variant="outlined" component="label" size="small" sx={{ height: 40 }}>
                            {selectedFile ? selectedFile.name : 'Choose File'}
                            <input type="file" hidden onChange={(e) => setSelectedFile(e.target.files[0])} />
                        </Button>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button variant="contained" color="secondary" size="small" sx={{ height: 40 }} onClick={() => uploadToS3(selectedFile, setDocumentLink, setUploading)} disabled={!selectedFile || uploading}>
                            {uploading ? 'Uploading...' : 'Upload to S3'}
                        </Button>
                    </Grid>

                    <Grid item xs={12}>
                        <Button variant="contained" onClick={handleAdd}>Add Quality Check</Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Data Table */}
            <Paper sx={{ height: 550, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    slots={{ toolbar: CustomToolbar }}
                    slotProps={{ toolbar: { showQuickFilter: true } }}
                    disableRowSelectionOnClick
                />
            </Paper>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Edit Quality Check</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth select label="Delivered To Store" size="small"
                                value={editDeliveredToStore} onChange={(e) => setEditDeliveredToStore(e.target.value)}
                            >
                                {stores.map((s) => (
                                    <MenuItem key={s._id} value={s.storename}>{s.storename}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Name of Vendor" size="small" value={editVendorName} onChange={(e) => setEditVendorName(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Material" size="small" value={editMaterial} onChange={(e) => setEditMaterial(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Invoice No" size="small" value={editInvoiceNo} onChange={(e) => setEditInvoiceNo(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Chalan No" size="small" value={editChalanNo} onChange={(e) => setEditChalanNo(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Mode of Supply" size="small" value={editModeOfSupply} onChange={(e) => setEditModeOfSupply(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Supply Remark" size="small" value={editSupplyRemark} onChange={(e) => setEditSupplyRemark(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Date of Quality Check" type="date" size="small" value={editDateOfQualityCheck} onChange={(e) => setEditDateOfQualityCheck(e.target.value)} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Initiated By" size="small" value={editInitiatedBy} onChange={(e) => setEditInitiatedBy(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Remark" size="small" value={editRemark} onChange={(e) => setEditRemark(e.target.value)} />
                        </Grid>

                        {/* Document Link + Upload in Edit */}
                        <Grid item xs={12}><Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1 }}>Document Attachment</Typography><Divider /></Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Document Link" size="small" value={editDocumentLink} onChange={(e) => setEditDocumentLink(e.target.value)} placeholder="Paste link or upload file" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Button variant="outlined" component="label" size="small" sx={{ height: 40 }}>
                                {editSelectedFile ? editSelectedFile.name : 'Choose File'}
                                <input type="file" hidden onChange={(e) => setEditSelectedFile(e.target.files[0])} />
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Button variant="contained" color="secondary" size="small" sx={{ height: 40 }} onClick={() => uploadToS3(editSelectedFile, setEditDocumentLink, setEditUploading)} disabled={!editSelectedFile || editUploading}>
                                {editUploading ? 'Uploading...' : 'Upload to S3'}
                            </Button>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleEditSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManualQualityCheckds2;
