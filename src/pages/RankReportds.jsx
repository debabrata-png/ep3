import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container, Typography, Paper, Grid, TextField, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, MenuItem, Box, CircularProgress
} from '@mui/material';
import { useSnackbar } from 'notistack';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import ep1 from '../api/ep1';

const RankReportds = () => {
    const { enqueueSnackbar } = useSnackbar();

    // State variables
    const [academicYears, setAcademicYears] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [sections, setSections] = useState([]);

    // Selected filters
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedSection, setSelectedSection] = useState('');

    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    const colid = sessionStorage.getItem('colid');

    useEffect(() => {
        fetchMetadata();
    }, []);

    const fetchMetadata = async () => {
        try {
            // Fetch distinct academic years, semesters from existing API
            // Using the new API created for class 9 marks to get distinct years/semesters
            // Or we can just use class list API. For now, assuming basic dropdown fetch or static options.
            const res = await ep1.get(`/api/v2/getdistinctsemestersandyears9ds?colid=${colid}`);
            if (res.data && res.data.success) {
                setAcademicYears(res.data.admissionyears || []);
                setSemesters(res.data.semesters || []);
                setSections(res.data.sections || []);
            }

        } catch (error) {
            console.error("Error fetching metadata:", error);
            enqueueSnackbar("Failed to load filter options", { variant: 'error' });
        }
    };

    const handleGenerateReport = async () => {
        if (!selectedYear || !selectedSemester || !selectedSection) {
            enqueueSnackbar('Please select Year, Class/Semester, and Section', { variant: 'warning' });
            return;
        }

        setLoading(true);
        try {
            const res = await ep1.get(`/api/v2/getrankreportds`, {
                params: {
                    colid,
                    academicyear: selectedYear,
                    semester: selectedSemester,
                    section: selectedSection
                }
            });

            if (res.data.success) {
                setReportData(res.data.data);
                if (res.data.data.length === 0) {
                    enqueueSnackbar('No records found for the selected criteria.', { variant: 'info' });
                }
            } else {
                enqueueSnackbar(res.data.message || 'Failed to fetch rank report.', { variant: 'error' });
            }
        } catch (error) {
            console.error(error);
            enqueueSnackbar('Error generating rank report', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadExcel = () => {
        if (reportData.length === 0) return;
        const ws = XLSX.utils.json_to_sheet(reportData.map(row => ({
            'Rank': row.rank,
            'Roll No': row.rollno,
            'Admission No': row.admissionno,
            'Name': row.name,
            'Total Marks': row.total,
            'Percentage': row.percentage
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Rank Report");
        XLSX.writeFile(wb, `Rank_Report_${selectedSemester}_${selectedSection}_${selectedYear}.xlsx`);
    };

    const handleDownloadPDF = () => {
        if (reportData.length === 0) return;

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Rank Report", 14, 22);
        doc.setFontSize(11);
        doc.text(`Academic Year: ${selectedYear} | Class: ${selectedSemester} | Section: ${selectedSection}`, 14, 30);

        const tableColumn = ["Rank", "Roll No", "Admission No", "Name", "Total Marks", "Percentage"];
        const tableRows = [];

        reportData.forEach(row => {
            const rowData = [
                row.rank,
                row.rollno || '-',
                row.admissionno,
                row.name,
                row.total,
                row.percentage
            ];
            tableRows.push(rowData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 35,
        });

        doc.save(`Rank_Report_${selectedSemester}_${selectedSection}_${selectedYear}.pdf`);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Section-wise Rank Report
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <TextField
                            select
                            fullWidth
                            label="Academic Year"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            {academicYears.map(year => (
                                <MenuItem key={year} value={year}>{year}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            select
                            fullWidth
                            label="Class / Semester"
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                        >
                            {semesters.map(sem => (
                                <MenuItem key={sem} value={sem}>{sem}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            select
                            fullWidth
                            label="Section"
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                        >
                            {sections.map(sec => (
                                <MenuItem key={sec} value={sec}>{sec}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={handleGenerateReport}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Generate Report'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {reportData.length > 0 && (
                <Paper sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Report Results</Typography>
                        <Box>
                            <Button variant="outlined" sx={{ mr: 1 }} onClick={handleDownloadExcel}>
                                Download Excel
                            </Button>
                            <Button variant="outlined" color="secondary" onClick={handleDownloadPDF}>
                                Download PDF
                            </Button>
                        </Box>
                    </Box>

                    <TableContainer>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell><strong>Rank</strong></TableCell>
                                    <TableCell><strong>Roll No</strong></TableCell>
                                    <TableCell><strong>Admission No</strong></TableCell>
                                    <TableCell><strong>Name</strong></TableCell>
                                    <TableCell><strong>Total Marks</strong></TableCell>
                                    <TableCell><strong>Percentage</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reportData.map((row, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell>{row.rank}</TableCell>
                                        <TableCell>{row.rollno || '-'}</TableCell>
                                        <TableCell>{row.admissionno}</TableCell>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>{row.total}</TableCell>
                                        <TableCell>{row.percentage}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
        </Container>
    );
};

export default RankReportds;
