import React, { useState } from 'react';
import ep1 from '../api/ep1';
import * as XLSX from 'xlsx';
import studentsData from '../students_classwise.json';
import { 
    Container, Paper, Typography, Button, Box, LinearProgress, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow 
} from '@mui/material';

const RankAuditTool = () => {
    const [status, setStatus] = useState('Idle');
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const colid = sessionStorage.getItem('colid') || 3052;
    const academicYear = "2025-26";

    const runAudit = async () => {
        setIsProcessing(true);
        setStatus('Starting Audit...');
        setResults([]);
        
        const allResults = [];
        const classes = Object.keys(studentsData);
        let totalProcessed = 0;
        const totalStudents = Object.values(studentsData).reduce((acc, curr) => acc + curr.length, 0);

        for (const semester of classes) {
            const students = studentsData[semester];
            setStatus(`Processing Class: ${semester}`);
            
            for (const student of students) {
                try {
                    const endpoint = getEndpoint(semester);
                    const res = await ep1.get(endpoint, {
                        params: {
                            colid: Number(colid),
                            regno: student.regno,
                            semester: semester,
                            academicyear: academicYear
                        }
                    });

                    if (res.data) {
                        const d = res.data.data || res.data; 
                        if (d && (d.percentage !== undefined || d.overallPercentage !== undefined)) {
                            allResults.push({
                                'Class': semester,
                                'Reg No': student.regno,
                                'Roll No': student.rollno || '-',
                                'Name': student.name,
                                'System Percentage': d.percentage || d.overallPercentage || 0,
                                'System Grade': d.overallGrade || d.grade || '-',
                                'System Rank': d.rank || '-'
                            });
                        }
                    }
                } catch (err) {
                    console.error(`Error for ${student.regno}:`, err);
                }
                
                totalProcessed++;
                setProgress(Math.round((totalProcessed / totalStudents) * 100));
            }
        }

        setResults(allResults);
        setStatus(allResults.length > 0 ? 'Audit Complete! Ready to Download.' : 'Audit Complete, but NO results were found.');
        setIsProcessing(false);
    };

    const getEndpoint = (semester) => {
        const sem = semester.toLowerCase();
        if (sem.includes('xi') || sem.includes('11') || sem.includes('xii') || sem.includes('12')) return '/api/v2/getMarksheetPDFData11ds';
        if (sem.includes('ix') || sem.includes('9') || sem.includes('x') || sem.includes('10')) return '/api/v2/getmarksheetpdfdata9top5ds';
        return '/api/v2/getmarksheetpdfdata9ds';
    };

    const downloadExcel = () => {
        const ws = XLSX.utils.json_to_sheet(results);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Official Rank Audit");
        XLSX.writeFile(wb, `Official_Frontend_Rank_Audit_3052_${new Date().getTime()}.xlsx`);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 5 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>Frontend Rank Audit Tool</Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                    Capture exactly what the system calculates for every student.
                </Typography>

                <Box sx={{ my: 3 }}>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={runAudit} 
                        disabled={isProcessing}
                        sx={{ mr: 2 }}
                    >
                        {isProcessing ? 'Processing...' : 'Run Full Audit'}
                    </Button>
                    {(!isProcessing && results.length > 0) && (
                        <Button variant="contained" color="success" onClick={downloadExcel}>
                            Download Audit Excel ({results.length} found)
                        </Button>
                    )}
                </Box>

                {isProcessing && (
                    <Box sx={{ width: '100%', mb: 3 }}>
                        <Typography variant="caption">{status} ({progress}%)</Typography>
                        <LinearProgress variant="determinate" value={progress} sx={{ mt: 1, height: 10, borderRadius: 5 }} />
                    </Box>
                )}

                <Typography variant="h6" sx={{ mt: 4 }}>Status: {status}</Typography>

                {results.length > 0 && (
                    <TableContainer sx={{ maxHeight: 400, mt: 2 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Class</TableCell>
                                    <TableCell>Reg No</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Percentage</TableCell>
                                    <TableCell>Rank</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {results.slice(0, 10).map((row, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{row.Class}</TableCell>
                                        <TableCell>{row['Reg No']}</TableCell>
                                        <TableCell>{row.Name}</TableCell>
                                        <TableCell>{row['System Percentage']}</TableCell>
                                        <TableCell>{row['System Rank']}</TableCell>
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

export default RankAuditTool;
