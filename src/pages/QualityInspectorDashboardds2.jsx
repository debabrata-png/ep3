import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Tabs, Tab, Paper, Grid, TextField, Button, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody,
    TableCell, TableHead, TableRow, Chip, CircularProgress, Backdrop, MenuItem
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';

import S3 from 'react-aws-s3';
window.Buffer = window.Buffer || require("buffer").Buffer;

const QualityInspectorDashboardds2 = () => {
    const [tabValue, setTabValue] = useState(0);
    const [pendingGRNs, setPendingGRNs] = useState([]);
    const [completedChecks, setCompletedChecks] = useState([]);
    const [loading, setLoading] = useState(false);

    // Inspection modal state
    const [openModal, setOpenModal] = useState(false);
    const [currentGRN, setCurrentGRN] = useState(null);
    const [inspectionItems, setInspectionItems] = useState([]);

    // All fillable QC form fields
    const [billNo, setBillNo] = useState('');
    const [billDate, setBillDate] = useState('');
    const [challanNo, setChallanNo] = useState('');
    const [challanDate, setChallanDate] = useState('');
    const [woPoNo, setWoPoNo] = useState('');
    const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);
    const [invoiceAmount, setInvoiceAmount] = useState('');
    const [advanceDeduction, setAdvanceDeduction] = useState('0');
    const [paymentDetails, setPaymentDetails] = useState('');
    const [corporateDirectorName, setCorporateDirectorName] = useState('');
    const [executiveName, setExecutiveName] = useState('');
    const [returnType, setReturnType] = useState('NRGP'); // 'RGP' or 'NRGP'

    // Document link + upload
    const [documentLink, setDocumentLink] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // S3 config from global1
    const s3Config = {
        bucketName: global1.bucket,
        region: global1.region,
        accessKeyId: global1.username,
        secretAccessKey: global1.password,
    };

    useEffect(() => { fetchData(); }, [tabValue]); // eslint-disable-line

    const fetchData = async () => {
        setLoading(true);
        if (tabValue === 0) await fetchPendingGRNs();
        if (tabValue === 1) await fetchCompletedChecks();
        setLoading(false);
    };

    const fetchPendingGRNs = async () => {
        try {
            const res = await ep1.get(`/api/v2/getpendinggrnds2?colid=${global1.colid}`);
            setPendingGRNs((res.data.data || []).map(g => ({ ...g, id: g._id })));
        } catch (e) { console.error(e); }
    };

    const fetchCompletedChecks = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallqualitycheckds2?colid=${global1.colid}`);
            setCompletedChecks((res.data.data || []).map(q => ({ ...q, id: q._id })));
        } catch (e) { console.error(e); }
    };

    const handleOpenInspection = (grn) => {
        setCurrentGRN(grn);
        setBillNo('');
        setBillDate('');
        setChallanNo(grn.dcInvoiceNo || '');
        setChallanDate('');
        setWoPoNo(grn.poid || '');
        setInspectionDate(new Date().toISOString().split('T')[0]);
        setInvoiceAmount(grn.billAmount || '');
        setAdvanceDeduction('0');
        setPaymentDetails('');
        setCorporateDirectorName('');
        setExecutiveName(global1.name || '');
        setDocumentLink('');
        setSelectedFile(null);

        const mappedItems = (grn.items || []).map(item => ({
            itemid: item.itemid,
            itemname: item.itemname,
            unit: item.unit,
            expectedQuantity: item.expectedQuantity,
            deliveredQuantity: item.deliveredQuantity,
            grnQuantity: item.grnQuantity || item.deliveredQuantity,
            acceptedQuantity: item.grnQuantity || item.deliveredQuantity,
            rejectedQuantity: 0,
            remarks: ''
        }));
        setInspectionItems(mappedItems);
        setOpenModal(true);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...inspectionItems];
        newItems[index][field] = value;
        if (field === 'acceptedQuantity') {
            newItems[index].rejectedQuantity = Number(newItems[index].grnQuantity) - Number(value);
        }
        if (field === 'rejectedQuantity') {
            newItems[index].acceptedQuantity = Number(newItems[index].grnQuantity) - Number(value);
        }
        setInspectionItems(newItems);
    };

    const handleFileSelect = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUploadToS3 = () => {
        if (!selectedFile) {
            alert('Please select a file first');
            return;
        }
        if (!global1.username) {
            alert('Please configure AWS settings under Settings - AWS config');
            return;
        }
        setUploading(true);
        const ReactS3Client = new S3(s3Config);
        const dt1 = new Date();
        const month = dt1.getMonth() + 1;
        const dt2 = month + '-' + dt1.getFullYear() + '-' + dt1.getDate() + '-' + dt1.getMinutes() + dt1.getSeconds();
        const newFileName = dt2 + '-' + selectedFile.name;

        ReactS3Client
            .uploadFile(selectedFile, newFileName)
            .then(data => {
                setDocumentLink(data.location);
                alert('File uploaded successfully!');
                setUploading(false);
            })
            .catch(err => {
                alert('Upload failed: ' + err);
                setUploading(false);
            });
    };

    const handleSubmitInspection = async () => {
        if (!currentGRN) return;
        try {
            const payload = {
                grnNo: currentGRN.grnNo,
                poid: currentGRN.poid,
                colid: global1.colid,
                billNo, billDate, challanNo, challanDate, woPoNo,
                inspectionDate,
                inspectorName: global1.name || 'QA Inspector',
                items: inspectionItems,
                invoiceAmount: Number(invoiceAmount),
                advanceDeduction: Number(advanceDeduction),
                paymentDetails,
                corporateDirectorName, executiveName,
                documentLink,
                returnType
            };
            await ep1.post('/api/v2/addqualitycheckds2', payload);
            alert('Inspection submitted successfully.');
            setOpenModal(false);
            fetchPendingGRNs();
        } catch (err) {
            console.error(err);
            alert('Failed to submit inspection: ' + (err.response?.data?.error || err.message));
        }
    };

    const handlePrintQC = (qc) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html><head><title>Quality Inspection Report</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; font-size: 13px; }
                h2 { text-align: center; margin-bottom: 4px; }
                .subtitle { text-align: center; color: #555; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 12px; }
                th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; }
                th { background: #f0f0f0; }
                .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 12px 0; }
                .field { display: flex; flex-direction: column; }
                .label { font-size: 11px; color: #555; }
                .value { font-weight: 600; border-bottom: 1px solid #333; min-height: 20px; }
                .sig-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 40px; text-align: center; }
                .sig-box { border-top: 1px solid #333; padding-top: 4px; font-size: 12px; }
            </style>
            </head><body>
            <h2>Quality Inspection Report</h2>
            <p class="subtitle">Inspection ID: ${qc.inspectionId || 'N/A'}</p>
            <div class="grid2">
                <div class="field"><span class="label">Inspection Date</span><span class="value">${qc.inspectionDate ? new Date(qc.inspectionDate).toLocaleDateString('en-GB') : ''}</span></div>
                <div class="field"><span class="label">Inspector</span><span class="value">${qc.inspectorName}</span></div>
                <div class="field"><span class="label">GRN No</span><span class="value">${qc.grnNo}</span></div>
                <div class="field"><span class="label">GRN Date</span><span class="value">${qc.grnDate ? new Date(qc.grnDate).toLocaleDateString('en-GB') : ''}</span></div>
                <div class="field"><span class="label">W.O / P.O No</span><span class="value">${qc.woPoNo || qc.poid || ''}</span></div>
                <div class="field"><span class="label">Party Name</span><span class="value">${qc.partyName || ''}</span></div>
                <div class="field"><span class="label">Bill No</span><span class="value">${qc.billNo || ''}</span></div>
                <div class="field"><span class="label">Bill Date</span><span class="value">${qc.billDate ? new Date(qc.billDate).toLocaleDateString('en-GB') : ''}</span></div>
                <div class="field"><span class="label">Challan No</span><span class="value">${qc.challanNo || ''}</span></div>
                <div class="field"><span class="label">Challan Date</span><span class="value">${qc.challanDate ? new Date(qc.challanDate).toLocaleDateString('en-GB') : ''}</span></div>
                <div class="field"><span class="label">Gate Pass No</span><span class="value">${qc.gatePassNumber || ''}</span></div>
                <div class="field"><span class="label">Store Name</span><span class="value">${qc.storeName || ''}</span></div>
                <div class="field"><span class="label">Status</span><span class="value">${qc.status}</span></div>
                <div class="field"><span class="label">Document Link</span><span class="value">${qc.documentLink ? '<a href="' + qc.documentLink + '">' + qc.documentLink + '</a>' : 'N/A'}</span></div>
            </div>
            <table>
                <thead><tr><th>Sr.No</th><th>Item Description</th><th>Unit</th><th>PO Qty</th><th>Delivered Qty</th><th>GRN Qty</th><th>Accepted Qty</th><th>Rejected Qty</th><th>Remarks</th></tr></thead>
                <tbody>${(qc.items || []).map((item, i) => `
                    <tr>
                        <td>${i + 1}</td>
                        <td>${item.itemname}</td>
                        <td>${item.unit}</td>
                        <td>${item.expectedQuantity}</td>
                        <td>${item.deliveredQuantity}</td>
                        <td>${item.grnQuantity || '-'}</td>
                        <td>${item.acceptedQuantity}</td>
                        <td>${item.rejectedQuantity}</td>
                        <td>${item.remarks || ''}</td>
                    </tr>`).join('')}
                </tbody>
            </table>
            <div class="grid2" style="margin-top:16px;">
                <div class="field"><span class="label">Invoice Amount</span><span class="value">₹${qc.invoiceAmount || 0}</span></div>
                <div class="field"><span class="label">Advance / Deduction</span><span class="value">₹${qc.advanceDeduction || 0}</span></div>
                <div class="field"><span class="label">Net Payable Amount</span><span class="value">₹${qc.netPayableAmount || 0}</span></div>
                <div class="field"><span class="label">Payment Details</span><span class="value">${qc.paymentDetails || ''}</span></div>
            </div>
            <div class="sig-row">
                <div class="sig-box">${qc.corporateDirectorName || ''}<br/>Corporate Director</div>
                <div class="sig-box">${qc.executiveName || ''}<br/>Executive</div>
                <div class="sig-box">${qc.inspectorName}<br/>Quality Inspector</div>
            </div>
            <script>window.print();</script>
            </body></html>
        `);
        printWindow.document.close();
    };

    const netPayable = Number(invoiceAmount || 0) - Number(advanceDeduction || 0);

    const pendingColumns = [
        { field: "storeName", headerName: "Store", width: 140 },
        { field: 'grnNo', headerName: 'GRN No', width: 160 },
        { field: 'gatePassNumber', headerName: 'Gate Pass', width: 140 },
        { field: 'poid', headerName: 'PO ID', width: 140 },
        { field: 'vendorName', headerName: 'Vendor', width: 160 },
        { field: 'grnDate', headerName: 'GRN Date', width: 110, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString('en-GB') : '' },
        { field: 'status', headerName: 'Status', width: 110, renderCell: (p) => <Chip label={p.value} color="warning" size="small" /> },
        {
            field: 'actions', headerName: 'Action', width: 140,
            renderCell: (p) => (
                <Button variant="contained" size="small" onClick={() => handleOpenInspection(p.row)}>Inspect</Button>
            )
        }
    ];

    const completedColumns = [
        { field: "storeName", headerName: "Store", width: 140 },
        { field: 'inspectionId', headerName: 'Inspection ID', width: 160 },
        { field: 'grnNo', headerName: 'GRN No', width: 140 },
        { field: 'partyName', headerName: 'Party', width: 140 },
        { field: 'billNo', headerName: 'Bill No', width: 110 },
        { field: 'challanNo', headerName: 'Challan No', width: 110 },
        { field: 'status', headerName: 'Status', width: 130, renderCell: (p) => <Chip label={p.value} color={p.value === 'Accepted' ? 'success' : 'warning'} size="small" /> },
        { field: 'netPayableAmount', headerName: 'Net Payable (₹)', width: 130 },
        {
            field: 'documentLink', headerName: 'Document', width: 120,
            renderCell: (p) => p.value ? <a href={p.value} target="_blank" rel="noreferrer" style={{ color: '#1976d2' }}>View</a> : '—'
        },
        {
            field: 'actions', headerName: 'Actions', width: 130,
            renderCell: (p) => <Button size="small" variant="outlined" onClick={() => handlePrintQC(p.row)}>Print</Button>
        }
    ];

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>Quality Inspection Dashboard</Typography>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3 }}>
                <Tab label="Pending Inspection (GRNs)" />
                <Tab label="Completed Inspections" />
            </Tabs>

            {tabValue === 0 && (
                <Paper sx={{ height: 500, width: '100%' }}>
                    <DataGrid rows={pendingGRNs} columns={pendingColumns} loading={loading} pageSizeOptions={[10, 25]} />
                </Paper>
            )}

            {tabValue === 1 && (
                <Paper sx={{ height: 500, width: '100%' }}>
                    <DataGrid rows={completedChecks} columns={completedColumns} loading={loading} pageSizeOptions={[10, 25]} />
                </Paper>
            )}

            {/* Upload progress backdrop */}
            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={uploading}>
                <CircularProgress color="inherit" />
            </Backdrop>

            {/* QC Inspection Modal */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="lg" fullWidth>
                <DialogTitle>Quality Inspection — GRN: {currentGRN?.grnNo}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        {/* Header fields */}
                        <Grid item xs={12}><Typography variant="subtitle1" fontWeight={600}>Inspection Details</Typography><Divider /></Grid>
                        <Grid item xs={6} md={3}><TextField fullWidth label="Inspection Date" type="date" size="small" value={inspectionDate} onChange={(e) => setInspectionDate(e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={6} md={3}><TextField fullWidth label="W.O / P.O No" size="small" value={woPoNo} onChange={(e) => setWoPoNo(e.target.value)} /></Grid>
                        <Grid item xs={6} md={3}><TextField fullWidth label="GRN No" size="small" value={currentGRN?.grnNo || ''} InputProps={{ readOnly: true }} /></Grid>
                        <Grid item xs={6} md={3}><TextField fullWidth label="GRN Date" type="date" size="small" value={currentGRN?.grnDate ? new Date(currentGRN.grnDate).toISOString().split('T')[0] : ''} InputProps={{ readOnly: true }} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={6} md={3}><TextField fullWidth label="Party Name" size="small" value={currentGRN?.partyName || currentGRN?.vendorName || ''} InputProps={{ readOnly: true }} /></Grid>
                        <Grid item xs={6} md={3}><TextField fullWidth label="Gate Pass No" size="small" value={currentGRN?.gatePassNumber || ''} InputProps={{ readOnly: true }} /></Grid>
                        <Grid item xs={6} md={3}>
                            <TextField fullWidth select label="Return Category" size="small" value={returnType} onChange={(e) => setReturnType(e.target.value)}>
                                <MenuItem value="RGP">RGP (Returnable)</MenuItem>
                                <MenuItem value="NRGP">NRGP (Non-Returnable)</MenuItem>
                            </TextField>
                        </Grid>

                        {/* Bill */}
                        <Grid item xs={12}><Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1 }}>Bill & Challan</Typography><Divider /></Grid>
                        <Grid item xs={6} md={3}><TextField fullWidth label="Bill No" size="small" value={billNo} onChange={(e) => setBillNo(e.target.value)} /></Grid>
                        <Grid item xs={6} md={3}><TextField fullWidth label="Bill Date" type="date" size="small" value={billDate} onChange={(e) => setBillDate(e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={6} md={3}><TextField fullWidth label="Challan No" size="small" value={challanNo} onChange={(e) => setChallanNo(e.target.value)} /></Grid>
                        <Grid item xs={6} md={3}><TextField fullWidth label="Challan Date" type="date" size="small" value={challanDate} onChange={(e) => setChallanDate(e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>

                        {/* Items Table */}
                        <Grid item xs={12}><Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1 }}>Item Inspection</Typography><Divider /></Grid>
                        <Grid item xs={12}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell>Sr.</TableCell>
                                        <TableCell>Item Description</TableCell>
                                        <TableCell>Unit</TableCell>
                                        <TableCell>PO Qty</TableCell>
                                        <TableCell>GRN Qty</TableCell>
                                        <TableCell>Accepted Qty</TableCell>
                                        <TableCell>Rejected Qty</TableCell>
                                        <TableCell>Remarks</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {inspectionItems.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{idx + 1}</TableCell>
                                            <TableCell>{item.itemname}</TableCell>
                                            <TableCell>{item.unit}</TableCell>
                                            <TableCell>{item.expectedQuantity}</TableCell>
                                            <TableCell>{item.grnQuantity}</TableCell>
                                            <TableCell>
                                                <TextField type="number" size="small" sx={{ width: 80 }} value={item.acceptedQuantity}
                                                    onChange={(e) => handleItemChange(idx, 'acceptedQuantity', e.target.value)}
                                                    inputProps={{ min: 0, max: item.grnQuantity }} />
                                            </TableCell>
                                            <TableCell>
                                                <TextField type="number" size="small" sx={{ width: 80 }} value={item.rejectedQuantity}
                                                    onChange={(e) => handleItemChange(idx, 'rejectedQuantity', e.target.value)}
                                                    inputProps={{ min: 0, max: item.grnQuantity }} />
                                            </TableCell>
                                            <TableCell>
                                                <TextField size="small" sx={{ width: 120 }} value={item.remarks}
                                                    onChange={(e) => handleItemChange(idx, 'remarks', e.target.value)} placeholder="Remarks" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Grid>

                        {/* Financial */}
                        <Grid item xs={12}><Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1 }}>Financial Details</Typography><Divider /></Grid>
                        <Grid item xs={6} md={3}><TextField fullWidth label="Invoice Amount (₹)" type="number" size="small" value={invoiceAmount} onChange={(e) => setInvoiceAmount(e.target.value)} /></Grid>
                        <Grid item xs={6} md={3}><TextField fullWidth label="Advance / Deduction (₹)" type="number" size="small" value={advanceDeduction} onChange={(e) => setAdvanceDeduction(e.target.value)} /></Grid>
                        <Grid item xs={6} md={3}><TextField fullWidth label="Net Payable Amount (₹)" size="small" value={netPayable} InputProps={{ readOnly: true }} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="Payment Details" size="small" multiline rows={2} value={paymentDetails} onChange={(e) => setPaymentDetails(e.target.value)} /></Grid>

                        {/* Document Link & Upload */}
                        <Grid item xs={12}><Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1 }}>Document Attachment</Typography><Divider /></Grid>
                        <Grid item xs={12} md={5}>
                            <TextField fullWidth label="Document Link" size="small" value={documentLink} onChange={(e) => setDocumentLink(e.target.value)} placeholder="Paste link or upload file below" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Button variant="outlined" component="label" size="small" sx={{ mr: 1, height: 40 }}>
                                {selectedFile ? selectedFile.name : 'Choose File'}
                                <input type="file" hidden onChange={handleFileSelect} />
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Button variant="contained" color="secondary" size="small" sx={{ height: 40 }} onClick={handleUploadToS3} disabled={!selectedFile || uploading}>
                                {uploading ? 'Uploading...' : 'Upload to S3'}
                            </Button>
                        </Grid>

                        {/* Signatures */}
                        <Grid item xs={12}><Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1 }}>Signatories</Typography><Divider /></Grid>
                        <Grid item xs={6} md={4}><TextField fullWidth label="Corporate Director Name" size="small" value={corporateDirectorName} onChange={(e) => setCorporateDirectorName(e.target.value)} /></Grid>
                        <Grid item xs={6} md={4}><TextField fullWidth label="Executive Name" size="small" value={executiveName} onChange={(e) => setExecutiveName(e.target.value)} /></Grid>
                        <Grid item xs={6} md={4}><TextField fullWidth label="Inspector Name" size="small" value={global1.name || ''} InputProps={{ readOnly: true }} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmitInspection}>Submit Inspection</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QualityInspectorDashboardds2;
