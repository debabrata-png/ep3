import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Paper, Tabs, Tab, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ep1 from '../api/ep1';
import global1 from './global1';

const FeesGenerationds = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [feeData, setFeeData] = useState([]);

    // Student Form State
    const [regno, setRegno] = useState('');

    // Program Form State
    const [programcode, setProgramcode] = useState('');
    const [academicyear, setAcademicyear] = useState('');

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
        setMessage('');
        setError('');
        setFeeData([]);
    };

    const handleGenerateStudentFee = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await ep1.post('/api/v2/generatefeeforstudentds', null, {
                params: {
                    regno,
                    colid: global1.colid,
                    name: global1.name,
                    user: global1.user
                }
            });
            setMessage(response.data.message || 'Fees generated successfully.');
            setFeeData(response.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Error generating fees.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateProgramFee = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await ep1.post('/api/v2/generatefeeforprogramds', null, {
                params: {
                    programcode,
                    academicyear,
                    colid: global1.colid,
                    name: global1.name,
                    user: global1.user
                }
            });
            setMessage(response.data.message || 'Fees generated successfully.');
            setFeeData(response.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Error generating fees.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Fees Generation
                </Typography>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={tabIndex} onChange={handleTabChange} aria-label="fees generation tabs">
                        <Tab label="Generate for Student" />
                        <Tab label="Generate for Program" />
                    </Tabs>
                </Box>

                {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {tabIndex === 0 && (
                    <Box component="form" onSubmit={handleGenerateStudentFee}>
                        <TextField
                            fullWidth
                            label="Registration Number (regno)"
                            value={regno}
                            onChange={(e) => setRegno(e.target.value)}
                            margin="normal"
                            required
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                            disabled={loading || !regno}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Generate Fee for Student'}
                        </Button>
                    </Box>
                )}

                {tabIndex === 1 && (
                    <Box component="form" onSubmit={handleGenerateProgramFee}>
                        <TextField
                            fullWidth
                            label="Program Code"
                            value={programcode}
                            onChange={(e) => setProgramcode(e.target.value)}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Academic Year"
                            value={academicyear}
                            onChange={(e) => setAcademicyear(e.target.value)}
                            margin="normal"
                            required
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                            disabled={loading || !programcode || !academicyear}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Generate Fee for Program'}
                        </Button>
                    </Box>
                )}

                {feeData.length > 0 && (
                    <TableContainer component={Paper} sx={{ mt: 4, maxHeight: 400 }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Student</TableCell>
                                    <TableCell>Reg No</TableCell>
                                    <TableCell>Fee Group</TableCell>
                                    <TableCell>Fee Item</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Semester</TableCell>
                                    <TableCell>Academic Year</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Due Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {feeData.map((row, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell>{row.student}</TableCell>
                                        <TableCell>{row.regno}</TableCell>
                                        <TableCell>{row.feegroup}</TableCell>
                                        <TableCell>{row.feeitem}</TableCell>
                                        <TableCell>{row.amount}</TableCell>
                                        <TableCell>{row.type}</TableCell>
                                        <TableCell>{row.semester}</TableCell>
                                        <TableCell>{row.academicyear}</TableCell>
                                        <TableCell>{row.status}</TableCell>
                                        <TableCell>{row.duedate ? new Date(row.duedate).toLocaleDateString() : ''}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Container>
    );
};

export default FeesGenerationds;
