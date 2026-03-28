import React, { useState, useEffect } from 'react';
import { 
    Container, Typography, TextField, Button, Box, Paper, Grid, 
    Alert, CircularProgress, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, IconButton, Dialog, 
    DialogTitle, DialogContent, DialogActions, Chip, Divider,
    Tooltip
} from '@mui/material';
import { 
    Save, ArrowBack, Edit, Code, Info, 
    AddCircle, Delete, Image as ImageIcon 
} from '@mui/icons-material';
import ep1 from '../api/ep1';
import { useNavigate } from 'react-router-dom';
import global1 from './global1';

const ViewmChallanConfig = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [configs, setConfigs] = useState([]);
    const [formData, setFormData] = useState({
        colid: global1.colid || '',
        configName: '',
        bankName: '',
        accountNo: '',
        branch: '',
        institutionName: '',
        address: '',
        logo: '',
        session: ''
    });

    // Template State
    const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
    const [templateData, setTemplateData] = useState({
        configName: '',
        templateHtml: '',
        orientation: 'landscape',
        copies: 1
    });
    const [savingTemplate, setSavingTemplate] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const colid = global1.colid;
            const response = await ep1.get(`/api/v2/getchallanconfig?colid=${colid}`);
            if (response.data.status === 'Success' && response.data.data) {
                setConfigs(response.data.data);
                if (response.data.data.length > 0) {
                    setFormData(response.data.data[0]);
                }
            }
        } catch (err) {
            console.error('Error fetching config:', err);
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const response = await ep1.post('/api/v2/savechallanconfig', formData);
            if (response.data.status === 'Success') {
                setSuccess(true);
                fetchConfig();
            } else {
                setError('Failed to save configuration');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenTemplate = async (config) => {
        setTemplateData({ ...templateData, configName: config.configName, templateHtml: '' });
        setOpenTemplateDialog(true);
        
        try {
            const res = await ep1.get(`/api/v2/getChallanTemplate?colid=${global1.colid}&configName=${config.configName}`);
            if (res.data.status === 'Success' && res.data.data) {
                setTemplateData(res.data.data);
            }
        } catch (err) {
            console.error('No template found or error:', err);
        }
    };

    const handleSaveTemplate = async () => {
        setSavingTemplate(true);
        try {
            const response = await ep1.post('/api/v2/saveChallanTemplate', {
                ...templateData,
                colid: global1.colid
            });
            if (response.data.status === 'Success') {
                alert('Template saved successfully!');
                setOpenTemplateDialog(false);
            }
        } catch (err) {
            alert('Error saving template: ' + (err.response?.data?.message || err.message));
        } finally {
            setSavingTemplate(false);
        }
    };

    const PlaceholdersList = () => (
        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f0f7ff', border: '1px solid #1a73e8' }}>
            <Box display="flex" alignItems="center" mb={1} gap={1}>
                <Info color="primary" />
                <Typography variant="subtitle2" fontWeight="bold">Accepted Placeholders</Typography>
            </Box>
            <Typography variant="caption" display="block" color="textSecondary" mb={1}>
                Copy and paste these tags into your HTML template. They will be replaced with real data at runtime.
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5}>
                {['NAME', 'MOBILE', 'REGNO', 'PROGRAM', 'YEAR', 'AMOUNT', 'AMOUNT_WORDS', 'FEE_ITEM', 'FEE_GROUP', 'BANK', 'ACCOUNT_NO', 'BRANCH', 'INSTITUTION', 'DATE'].map(tag => (
                    <Chip key={tag} label={`{{${tag}}}`} size="small" variant="outlined" clickable onClick={() => {
                        setTemplateData(prev => ({ ...prev, templateHtml: prev.templateHtml + `{{${tag}}}` }));
                    }} />
                ))}
            </Box>
        </Paper>
    );

    if (fetching) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/payment-mode-landing')}
                sx={{ mb: 2 }}
            >
                Back to Portal
            </Button>

            <Grid container spacing={3}>
                {/* Form Section */}
                <Grid item xs={12} md={5}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                        <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
                            Configure Bank Details
                        </Typography>
                        <Typography variant="body2" color="textSecondary" mb={3}>
                            Set up institutional bank accounts for challan generation.
                        </Typography>

                        {success && <Alert severity="success" sx={{ mb: 2 }}>Saved!</Alert>}
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="Configuration Name" name="configName" value={formData.configName} onChange={handleChange} required size="small" />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="Institution Name" name="institutionName" value={formData.institutionName} onChange={handleChange} required size="small" />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="Institution Address" name="address" value={formData.address} onChange={handleChange} multiline rows={2} required size="small" />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField 
                                        fullWidth 
                                        label="Logo URL" 
                                        name="logo" 
                                        value={formData.logo} 
                                        onChange={handleChange} 
                                        placeholder="https://example.com/logo.png"
                                        size="small"
                                        InputProps={{
                                            startAdornment: <ImageIcon sx={{ color: 'action.active', mr: 1, fontSize: 20 }} />,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} required size="small" />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Account Number" name="accountNo" value={formData.accountNo} onChange={handleChange} required size="small" />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Branch" name="branch" value={formData.branch} onChange={handleChange} required size="small" />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Session" name="session" value={formData.session} onChange={handleChange} required size="small" />
                                </Grid>
                                <Grid item xs={12}>
                                    <Box mt={1} display="flex" gap={1}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            startIcon={<Save />}
                                            disabled={loading}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            {loading ? 'Saving...' : 'Save Config'}
                                        </Button>
                                        <Button 
                                            variant="outlined" 
                                            onClick={() => setFormData({ colid: global1.colid, configName: '', bankName: '', accountNo: '', branch: '', institutionName: '', address: '', logo: '', session: '' })}
                                            startIcon={<AddCircle />}
                                        >
                                            Reset
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </Grid>

                {/* Table Section */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Existing Configurations
                        </Typography>
                        <TableContainer sx={{ border: '1px solid #eee', borderRadius: 2 }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#fafafa' }}>
                                    <TableRow>
                                        <TableCell>Config Name</TableCell>
                                        <TableCell>Institution/Bank</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {configs.map((row, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell sx={{ fontWeight: 'bold' }}>{row.configName}</TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{row.institutionName}</Typography>
                                                <Typography variant="caption" color="textSecondary">{row.bankName} - {row.accountNo}</Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box display="flex" justifyContent="center" gap={1}>
                                                    <Tooltip title="Edit Bank Details">
                                                        <IconButton color="primary" onClick={() => setFormData(row)}>
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Manage HTML Template">
                                                        <Button 
                                                            variant="contained" 
                                                            size="small" 
                                                            color="secondary"
                                                            startIcon={<Code />}
                                                            onClick={() => handleOpenTemplate(row)}
                                                            sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                                                        >
                                                            Template
                                                        </Button>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {configs.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center" sx={{ py: 3 }}>No configurations found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Template Dialog */}
            <Dialog 
                open={openTemplateDialog} 
                onClose={() => setOpenTemplateDialog(false)} 
                maxWidth="lg" 
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ bgcolor: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Code color="secondary" />
                        <Typography variant="h6">Modern Challan Template: <strong>{templateData.configName}</strong></Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Grid container spacing={3} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} lg={4}>
                            <PlaceholdersList />
                            <Box mt={3}>
                                <Typography variant="subtitle2" gutterBottom fontWeight="bold">Print Settings</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField 
                                            select 
                                            fullWidth 
                                            label="Orientation" 
                                            size="small"
                                            value={templateData.orientation}
                                            SelectProps={{ native: true }}
                                            onChange={(e) => setTemplateData({...templateData, orientation: e.target.value})}
                                        >
                                            <option value="landscape">Landscape</option>
                                            <option value="portrait">Portrait</option>
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField 
                                            type="number" 
                                            fullWidth 
                                            label="Copies" 
                                            size="small"
                                            value={templateData.copies}
                                            onChange={(e) => setTemplateData({...templateData, copies: parseInt(e.target.value)})}
                                            inputProps={{ min: 1, max: 4 }}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                        <Grid item xs={12} lg={8}>
                            <Typography variant="subtitle2" gutterBottom fontWeight="bold">HTML/CSS Template</Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={18}
                                variant="outlined"
                                placeholder={`<div style="font-family: Arial;">\n  <h1>{{INSTITUTION}}</h1>\n  <p>Student: {{NAME}}</p>\n</div>`}
                                value={templateData.templateHtml}
                                onChange={(e) => setTemplateData({...templateData, templateHtml: e.target.value})}
                                inputProps={{ 
                                    sx: { 
                                        fontFamily: 'monospace', 
                                        fontSize: '0.875rem', 
                                        bgcolor: '#2d2d2d', 
                                        color: '#f8f8f2',
                                        '&::placeholder': { color: '#666' }
                                    } 
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa', borderTop: '1px solid #eee' }}>
                    <Button onClick={() => setOpenTemplateDialog(false)} color="inherit">Cancel</Button>
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        onClick={handleSaveTemplate} 
                        disabled={savingTemplate}
                        startIcon={<Save />}
                    >
                        {savingTemplate ? 'Saving...' : 'Save Template'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ViewmChallanConfig;
