import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Card,
    CardContent
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ep1 from '../api/ep1';
import global1 from './global1';

const RfpAiAnalysisds = () => {
    const [rfps, setRfps] = useState([]);
    const [selectedRfp, setSelectedRfp] = useState('');
    const [userPrompt, setUserPrompt] = useState('Evaluate the vendors based on technical competency and cost-effectiveness. Show the result in a comparison table.');
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [error, setError] = useState(null);
    const [fetchingRfps, setFetchingRfps] = useState(true);

    useEffect(() => {
        fetchRfps();
    }, []);

    const fetchRfps = async () => {
        // Fallback to localStorage if global1.colid is not yet populated
        const colid = global1.colid || localStorage.getItem('colid');
        
        if (!colid) {
            console.warn('colid is missing, skipping RFP fetch');
            setFetchingRfps(false);
            return;
        }
        try {
            setFetchingRfps(true);
            const response = await ep1.get(`/api/v2/getallrfps?colid=${colid}`);
            // Matching the backend response structure: { success: true, data: rfps }
            if (response.data.success) {
                setRfps(response.data.data || []);
            } else if (response.data.status === 'success') {
                // Secondary fallback for different API patterns
                setRfps(response.data.data.items || response.data.data || []);
            }
            setFetchingRfps(false);
        } catch (err) {
            console.error('Error fetching RFPs:', err);
            setError('Failed to load RFPs. Please try again.');
            setFetchingRfps(false);
        }
    };

    const handleAnalyze = async () => {
        const colid = global1.colid || localStorage.getItem('colid');
        
        if (!selectedRfp) {
            setError('Please select an RFP to analyze.');
            return;
        }

        if (!colid) {
            setError('Institution identifier (colid) is missing. Please log in again.');
            return;
        }

        setLoading(true);
        setError(null);
        setReport(null);

        try {
            const response = await ep1.post(`/api/v2/analyze-rfp-ai`, {
                rfpid: selectedRfp,
                colid: colid,
                userPrompt: userPrompt
            });

            if (response.data.success) {
                setReport(response.data.data.report);
            } else {
                setError(response.data.message || 'AI Analysis failed.');
            }
        } catch (err) {
            console.error('Analysis error:', err);
            setError(err.response?.data?.message || 'An error occurred during AI analysis. Ensure Gemini API key is configured.');
        } finally {
            setLoading(false);
        }
    };

    // Helper to extract segments if user wants a structured table, 
    // but since we don't have react-markdown, we'll just show the raw text with pre-wrap
    // or try a simple regex to detect the table part.

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <AutoAwesomeIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                    <Typography variant="h4" fontWeight="bold">
                        AI RFP Vendor Scoring
                    </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Generate intelligent, comparative reports for your RFP submissions using Gemini 2.0.
                    AI evaluates technical proposals and financial quotes to score each vendor.
                </Typography>

                <Card variant="outlined" sx={{ mb: 4, bgcolor: 'background.default' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Analysis Configuration
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <FormControl fullWidth size="medium">
                                <InputLabel>Select RFP</InputLabel>
                                <Select
                                    value={selectedRfp}
                                    onChange={(e) => setSelectedRfp(e.target.value)}
                                    label="Select RFP"
                                >
                                    {fetchingRfps ? (
                                        <MenuItem disabled><CircularProgress size={20} sx={{ mr: 1 }} /> Loading...</MenuItem>
                                    ) : (
                                        rfps.map((rfp) => (
                                            <MenuItem key={rfp._id} value={rfp._id}>
                                                {rfp.title}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Analysis Focus / Custom Prompt"
                                variant="outlined"
                                value={userPrompt}
                                onChange={(e) => setUserPrompt(e.target.value)}
                                placeholder="E.g., Which vendor has the best delivery timeline? Compare technical specs in detail."
                            />

                            <Button
                                variant="contained"
                                size="large"
                                startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <AutoAwesomeIcon />}
                                disabled={loading}
                                onClick={handleAnalyze}
                                sx={{ py: 1.5, fontWeight: 'bold' }}
                            >
                                {loading ? 'Analyzing Submissions...' : 'Generate AI Analysis Report'}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                {error && (
                    <Alert severity="error" sx={{ mb: 4 }}>
                        {error}
                    </Alert>
                )}

                {report && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h5" gutterBottom fontWeight="bold">
                            Analysis Results
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 3,
                                bgcolor: '#f8fafc',
                                borderLeft: '5px solid #3b82f6',
                                borderRadius: 1
                            }}
                        >
                            <Typography
                                variant="body1"
                                component="div"
                                sx={{
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'Roboto, sans-serif',
                                    fontSize: '1.05rem',
                                    lineHeight: 1.6,
                                    '& code': {
                                        bgcolor: '#e2e8f0',
                                        px: 0.5,
                                        borderRadius: 0.5
                                    }
                                }}
                            >
                                {report}
                            </Typography>
                        </Paper>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={() => window.print()}
                            >
                                Export as PDF
                            </Button>
                            <Button
                                variant="text"
                                onClick={() => {
                                    navigator.clipboard.writeText(report);
                                    alert('Report copied to clipboard!');
                                }}
                            >
                                Copy Text
                            </Button>
                        </Box>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default RfpAiAnalysisds;
