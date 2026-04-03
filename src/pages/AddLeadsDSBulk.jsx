import React, { useState } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    Box,
    Typography,
    Alert,
    LinearProgress,
    IconButton,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Download as DownloadIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import readXlsxFile from 'read-excel-file';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ep1 from '../api/ep1';
import global1 from './global1';

const AddLeadsDSBulk = ({ open, handleClose, refreshData }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState({ success: 0, failed: 0, errors: [] });

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setResults({ success: 0, failed: 0, errors: [] });
            setProgress(0);
        }
    };

    const downloadTemplate = () => {
        const templateData = [
            {
                'Name': 'John Doe',
                'Phone': '9876543210',
                'Email': 'john@example.com',
                'Category': 'General',
                'Source': 'Website',
                'City': 'New York',
                'State': 'NY',
                'Institution': 'University A',
                'Program Type': 'Undergraduate',
                'Program': 'Computer Science',
                'Assigned To': 'counselor@example.com'
            }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Leads Template');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, 'leads_bulk_template.xlsx');
    };

    const processFile = async () => {
        if (!selectedFile) {
            alert('Please select a file first.');
            return;
        }

        setIsUploading(true);
        setResults({ success: 0, failed: 0, errors: [] });

        try {
            const rows = await readXlsxFile(selectedFile);
            const headers = rows[0];
            const dataRows = rows.slice(1);
            const total = dataRows.length;

            let successCount = 0;
            let failedCount = 0;
            const errorList = [];

            for (let i = 0; i < dataRows.length; i++) {
                const row = dataRows[i];
                const leadData = {
                    colid: global1.colid,
                    user: global1.user,
                    name: row[0],
                    phone: row[1] ? String(row[1]) : '',
                    email: row[2],
                    category: row[3],
                    source: row[4],
                    city: row[5],
                    state: row[6],
                    institution: row[7],
                    program_type: row[8],
                    program: row[9],
                    assignedto: row[10]
                };

                try {
                    const response = await ep1.post('/api/v2/createleadds', leadData);
                    if (response.data.success) {
                        successCount++;
                    } else {
                        failedCount++;
                        errorList.push(`Row ${i + 2}: ${response.data.message || 'Unknown error'}`);
                    }
                } catch (err) {
                    failedCount++;
                    errorList.push(`Row ${i + 2}: ${err.response?.data?.message || err.message}`);
                }

                setProgress(Math.round(((i + 1) / total) * 100));
            }

            setResults({ success: successCount, failed: failedCount, errors: errorList });
            if (refreshData) refreshData();
        } catch (err) {
            console.error('Error processing file:', err);
            alert('Failed to process Excel file. Please ensure it is in the correct format.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onClose={isUploading ? null : handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Bulk Lead Upload
                {!isUploading && (
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                )}
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        1. Download the Excel template to ensure your data is in the correct format.
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={downloadTemplate}
                        sx={{ mt: 1, textTransform: 'none' }}
                    >
                        Download Template
                    </Button>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        2. Upload your Excel file with lead data.
                    </Typography>
                    <input
                        accept=".xlsx, .xls"
                        style={{ display: 'none' }}
                        id="bulk-lead-file"
                        type="file"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                    <label htmlFor="bulk-lead-file">
                        <Button
                            variant="contained"
                            component="span"
                            startIcon={<UploadIcon />}
                            disabled={isUploading}
                            sx={{ mt: 1, textTransform: 'none', bgcolor: '#1565c0' }}
                        >
                            {selectedFile ? selectedFile.name : 'Select Excel File'}
                        </Button>
                    </label>
                </Box>

                {isUploading && (
                    <Box sx={{ width: '100%', mt: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            Processing leads: {progress}%
                        </Typography>
                        <LinearProgress variant="determinate" value={progress} />
                    </Box>
                )}

                {(results.success > 0 || results.failed > 0) && !isUploading && (
                    <Box sx={{ mt: 2 }}>
                        <Alert severity={results.failed > 0 ? 'warning' : 'success'}>
                            Upload Complete: {results.success} succeeded, {results.failed} failed.
                        </Alert>
                        {results.errors.length > 0 && (
                            <Box sx={{ mt: 1, maxHeight: 150, overflow: 'auto', p: 1, bgcolor: '#fff5f5', borderRadius: 1 }}>
                                {results.errors.map((err, idx) => (
                                    <Typography key={idx} variant="caption" display="block" color="error">
                                        • {err}
                                    </Typography>
                                ))}
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={isUploading}>
                    {results.success > 0 || results.failed > 0 ? 'Close' : 'Cancel'}
                </Button>
                <Button
                    onClick={processFile}
                    variant="contained"
                    disabled={!selectedFile || isUploading}
                    sx={{ bgcolor: '#1565c0' }}
                >
                    Start Upload
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddLeadsDSBulk;
