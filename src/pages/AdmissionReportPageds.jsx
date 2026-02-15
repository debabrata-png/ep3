import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    TextField,
    Button
} from '@mui/material';
import { Download } from '@mui/icons-material';
import ep1 from '../api/ep1';
import global1 from './global1';
import * as XLSX from 'xlsx';
import AdminLayout from '../components/AdminLayout';

const AdmissionReportPageds = () => {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState({});

    // States for manual input (fields not in DB yet)
    const [approvedSeats, setApprovedSeats] = useState({
        UG: 0, PG: 0, Integrated: 0, PhD: 0, Diploma: 0, Certificate: 0
    });
    const [studyingStudents, setStudyingStudents] = useState({
        UG: 0, PG: 0, Integrated: 0, PhD: 0, Diploma: 0, Certificate: 0
    });

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const response = await ep1.get('/api/v2/universityadmissionreportds', {
                params: { colid: global1.colid }
            });

            if (response.data && response.data.success) {
                setReportData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching admission report:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleManualInputChange = (category, field, value) => {
        if (category === 'approvedSeats') {
            setApprovedSeats({ ...approvedSeats, [field]: value });
        } else {
            setStudyingStudents({ ...studyingStudents, [field]: value });
        }
    };

    const exportToExcel = () => {
        const data = [
            ["Madhya Pradesh Private University Regulatory Commission, Bhopal"],
            ["Numerical information of students for session 2024-25"],
            // Headers
            [
                "Name of the private university",
                "Total number of approved seats for admission in first year", "", "", "", "", "",
                "Number of students admitted in the first year in session 2024-2025", "", "", "", "", "",
                "Total number of students studying in the university (All Sem/Year)", "", "", "", "", ""
            ],
            [
                "",
                "UG", "PG", "Integrated (5 Year)", "Ph.D.", "Diploma", "Certificate",
                "UG", "PG", "Integrated (5 Year)", "Ph.D.", "Diploma", "Certificate",
                "UG", "PG", "Integrated (5 Year)", "Ph.D.", "Diploma", "Certificate"
            ],
            // Data Row
            [
                "People's University",
                approvedSeats.UG, approvedSeats.PG, approvedSeats.Integrated, approvedSeats.PhD, approvedSeats.Diploma, approvedSeats.Certificate,
                reportData['UG'] || 0, reportData['PG'] || 0, reportData['Integrated (5 Year)'] || 0, reportData['Ph.D.'] || 0, reportData['Diploma'] || 0, reportData['Certificate'] || 0,
                studyingStudents.UG, studyingStudents.PG, studyingStudents.Integrated, studyingStudents.PhD, studyingStudents.Diploma, studyingStudents.Certificate
            ]
        ];

        const ws = XLSX.utils.aoa_to_sheet(data);

        // Merges
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 18 } }, // Title 1
            { s: { r: 1, c: 0 }, e: { r: 1, c: 18 } }, // Title 2
            { s: { r: 2, c: 1 }, e: { r: 2, c: 6 } },  // Approved Seats Header
            { s: { r: 2, c: 7 }, e: { r: 2, c: 12 } }, // Admitted Students Header
            { s: { r: 2, c: 13 }, e: { r: 2, c: 18 } } // Studying Students Header
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Admission Report");
        XLSX.writeFile(wb, "University_Admission_Data_2024_25.xlsx");
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    const categories = ['UG', 'PG', 'Integrated (5 Year)', 'Ph.D.', 'Diploma', 'Certificate'];

    return (
        <AdminLayout title="University Admission Report">
            <Box sx={{ p: 3 }}>
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5" component="div">
                                University Admission Report (2024-25)
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<Download />}
                                onClick={exportToExcel}
                            >
                                Export to Excel
                            </Button>
                        </Box>

                        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                            <Table bordered size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell rowSpan={2} sx={{ fontWeight: 'bold' }}>Name of the Private University</TableCell>
                                        <TableCell colSpan={6} align="center" sx={{ fontWeight: 'bold', bgcolor: '#e3f2fd' }}>Total number of approved seats for admission in first year</TableCell>
                                        <TableCell colSpan={6} align="center" sx={{ fontWeight: 'bold', bgcolor: '#e8f5e9' }}>Number of students admitted in the first year in session 2024-2025</TableCell>
                                        <TableCell colSpan={6} align="center" sx={{ fontWeight: 'bold', bgcolor: '#fff3e0' }}>Total number of students studying in the university (All Sem/Year)</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        {/* Approved Seats Headers */}
                                        {categories.map(cat => <TableCell key={`h1-${cat}`} align="center" sx={{ bgcolor: '#e3f2fd' }}>{cat}</TableCell>)}
                                        {/* Admitted Students Headers */}
                                        {categories.map(cat => <TableCell key={`h2-${cat}`} align="center" sx={{ bgcolor: '#e8f5e9' }}>{cat}</TableCell>)}
                                        {/* Studying Students Headers */}
                                        {categories.map(cat => <TableCell key={`h3-${cat}`} align="center" sx={{ bgcolor: '#fff3e0' }}>{cat}</TableCell>)}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>People's University</TableCell>

                                        {/* Approved Seats Inputs */}
                                        {categories.map(cat => (
                                            <TableCell key={`as-${cat}`}>
                                                <TextField
                                                    type="number"
                                                    variant="standard"
                                                    size="small"
                                                    value={approvedSeats[cat] || 0}
                                                    onChange={(e) => handleManualInputChange('approvedSeats', cat, e.target.value)}
                                                    inputProps={{ style: { textAlign: 'center' } }}
                                                />
                                            </TableCell>
                                        ))}

                                        {/* Admitted Students (Read-only from DB) */}
                                        {categories.map(cat => (
                                            <TableCell key={`adm-${cat}`} align="center" sx={{ fontWeight: 'bold' }}>
                                                {reportData[cat] || 0}
                                            </TableCell>
                                        ))}

                                        {/* Studying Students Inputs */}
                                        {categories.map(cat => (
                                            <TableCell key={`ss-${cat}`}>
                                                <TextField
                                                    type="number"
                                                    variant="standard"
                                                    size="small"
                                                    value={studyingStudents[cat] || 0}
                                                    onChange={(e) => handleManualInputChange('studyingStudents', cat, e.target.value)}
                                                    inputProps={{ style: { textAlign: 'center' } }}
                                                />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Box>
        </AdminLayout>
    );
};

export default AdmissionReportPageds;
