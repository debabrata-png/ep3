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

const AdmissionCourseWiseReportPageds = () => {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);

    // State for manual "Sanctioned Seats" input
    // Key: `${institution}-${program}`, Value: Number
    const [sanctionedSeats, setSanctionedSeats] = useState({});

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const response = await ep1.get('/api/v2/admissioncoursewisereportds', {
                params: { colid: global1.colid }
            });

            if (response.data && response.data.success) {
                setReportData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching course-wise admission report:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSeatChange = (institution, program, value) => {
        const key = `${institution}-${program}`;
        setSanctionedSeats(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const calculateVacantSeats = (sanctioned, admitted) => {
        const s = parseInt(sanctioned) || 0;
        const a = parseInt(admitted) || 0;
        const vacant = s - a;
        return vacant < 0 ? 0 : vacant; // No negative vacant seats
    };

    const exportToExcel = () => {
        const data = [
            ["Updated course-wise information of admission in the first year for the session 2025-26 in private universities"],
            [
                "Name of the university",
                "Name of the Constituent Unit",
                "S.No.",
                "Name of the course",
                "Total sanctioned seat capacity in the first year",
                "Total number of students admitted until date",
                "Number of vacant seats"
            ]
        ];

        reportData.forEach((row, index) => {
            const key = `${row.institution}-${row.program}`;
            const sanctioned = sanctionedSeats[key] || '';
            const admitted = row.admittedCount || 0;
            const vacant = calculateVacantSeats(sanctioned, admitted);

            data.push([
                "People's University",           // Static
                row.institution || '-',          // Constituent Unit
                index + 1,                       // S.No.
                row.program || '-',              // Course Name
                sanctioned,                      // Sanctioned Seats
                admitted,                        // Admitted
                vacant                           // Vacant Seats
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(data);

        // Merge Title Row
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Course-wise Report");
        XLSX.writeFile(wb, "Admission_Info_Course_Wise_2025_26.xlsx");
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <AdminLayout title="Course-wise Admission Report">
            <Box sx={{ p: 3 }}>
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5" component="div">
                                Course-wise Admission Report (2025-26)
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<Download />}
                                onClick={exportToExcel}
                            >
                                Export to Excel
                            </Button>
                        </Box>

                        <TableContainer component={Paper}>
                            <Table bordered size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Name of the University</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Name of the Constituent Unit</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>S.No.</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Name of the Course</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Total Sanctioned Seat Capacity</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Total Admitted</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Number of Vacant Seats</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reportData.map((row, index) => {
                                        const key = `${row.institution}-${row.program}`;
                                        const sanctioned = sanctionedSeats[key] || '';
                                        const admitted = row.admittedCount || 0;
                                        const vacant = calculateVacantSeats(sanctioned, admitted);

                                        return (
                                            <TableRow key={index} hover>
                                                <TableCell>People's University</TableCell>
                                                <TableCell>{row.institution}</TableCell>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{row.program}</TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type="number"
                                                        variant="standard"
                                                        size="small"
                                                        value={sanctioned}
                                                        onChange={(e) => handleSeatChange(row.institution, row.program, e.target.value)}
                                                        placeholder="Enter Capacity"
                                                        inputProps={{ style: { textAlign: 'center' } }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">{admitted}</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 'bold', color: vacant > 0 ? 'green' : 'red' }}>
                                                    {vacant}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {reportData.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                No admission data found matching criteria.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Box>
        </AdminLayout>
    );
};

export default AdmissionCourseWiseReportPageds;
