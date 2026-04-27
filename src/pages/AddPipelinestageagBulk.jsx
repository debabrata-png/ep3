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

const AddPipelinestageagBulk = ({ open, handleClose, refreshData }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentRow, setCurrentRow] = useState(0);
    const [totalRows, setTotalRows] = useState(0);
    const [results, setResults] = useState({ success: 0, failed: 0, errors: [] });

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setResults({ success: 0, failed: 0, errors: [] });
            setProgress(0);
            setCurrentRow(0);
            setTotalRows(0);
        }
    };

    const downloadTemplate = () => {
        const templateData = [
            {
                'Stage Name': 'Lead Assigned',
                'Description': 'When a lead is assigned to a counselor',
                'Status (Active/Inactive)': 'Active',
                'Final Stage (Yes/No)': 'No'
            },
            {
                'Stage Name': 'Admitted',
                'Description': 'Lead successfully admitted',
                'Status (Active/Inactive)': 'Active',
                'Final Stage (Yes/No)': 'Yes'
            }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Pipeline Stages Template');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, 'pipeline_stages_bulk_template.xlsx');
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
            const dataRows = rows.slice(1); // Skip header
            const total = dataRows.length;
            setTotalRows(total);

            let successCount = 0;
            let failedCount = 0;
            const errorList = [];

            for (let i = 0; i < dataRows.length; i++) {
                setCurrentRow(i + 1);
                const row = dataRows[i];
                
                // Mapping: Name, Description, Status, FinalStage
                const stagename = row[0];
                if (!stagename) {
                    failedCount++;
                    errorList.push(`Row ${i + 2}: Stage Name is required.`);
                    continue;
                }

                const payload = {
                    stagename: stagename,
                    description: row[1] || '',
                    isactive: String(row[2]).toLowerCase() === 'active' || row[2] === true || String(row[2]).toLowerCase() === 'yes',
                    is_final_stage: String(row[3]).toLowerCase() === 'yes' || row[3] === true,
                    colid: global1.colid,
                    user: global1.user,
                    name: global1.name,
                };

                try {
                    const response = await ep1.post('/api/v2/createpipelinestageag', payload);
                    if (response.data.status === 'Success' || response.data.success) {
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
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 }}>
                Bulk Pipeline Stages Upload
                {!isUploading && (
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                )}
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Step 1: Download Template
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Download the Excel template to ensure your data is in the correct format.
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={downloadTemplate}
                        sx={{ mt: 1, textTransform: 'none', borderRadius: 2 }}
                    >
                        Download Template
                    </Button>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Step 2: Upload Data
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Select your completed Excel file to start importing stages.
                    </Typography>
                    <input
                        accept=".xlsx, .xls"
                        style={{ display: 'none' }}
                        id="bulk-stage-file"
                        type="file"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                    <label htmlFor="bulk-stage-file">
                        <Button
                            variant="contained"
                            component="span"
                            startIcon={<UploadIcon />}
                            disabled={isUploading}
                            sx={{ mt: 1, textTransform: 'none', bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' }, borderRadius: 2 }}
                        >
                            {selectedFile ? selectedFile.name : 'Select Excel File'}
                        </Button>
                    </label>
                </Box>

                {isUploading && (
                    <Box sx={{ width: '100%', mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                Uploading Data...
                            </Typography>
                            <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                                Row {currentRow} of {totalRows} ({progress}%)
                            </Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
                    </Box>
                )}

                {(results.success > 0 || results.failed > 0) && !isUploading && (
                    <Box sx={{ mt: 2 }}>
                        <Alert severity={results.failed > 0 ? 'warning' : 'success'} sx={{ borderRadius: 2 }}>
                            Upload Complete: <strong>{results.success}</strong> succeeded, <strong>{results.failed}</strong> failed.
                        </Alert>
                        {results.errors.length > 0 && (
                            <Box sx={{ mt: 1, maxHeight: 150, overflow: 'auto', p: 2, bgcolor: '#fff5f5', borderRadius: 2, border: '1px solid #fed7d7' }}>
                                <Typography variant="subtitle2" color="error" gutterBottom>Errors:</Typography>
                                {results.errors.map((err, idx) => (
                                    <Typography key={idx} variant="caption" display="block" color="error" sx={{ mb: 0.5 }}>
                                        • {err}
                                    </Typography>
                                ))}
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={handleClose} disabled={isUploading} color="inherit">
                    {results.success > 0 || results.failed > 0 ? 'Close' : 'Cancel'}
                </Button>
                <Button
                    onClick={processFile}
                    variant="contained"
                    disabled={!selectedFile || isUploading}
                    sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' }, borderRadius: 2 }}
                >
                    Start Upload
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddPipelinestageagBulk;
