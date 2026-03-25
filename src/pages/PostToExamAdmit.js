import React, { useState, useEffect } from 'react';
import { Button, Box, Paper, Container, Grid, Typography, TextField, MenuItem, Select, InputLabel, FormControl, Backdrop, CircularProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const mdTheme = createTheme();

function PostToExamAdmit() {
    const [rows, setRows] = useState([]);
    const [year, setYear] = useState('');
    const [programCode, setProgramCode] = useState('');
    const [semester, setSemester] = useState('');
    const [exam, setExam] = useState('');
    const [examCode, setExamCode] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Distinct dropdown options
    const [yearOptions, setYearOptions] = useState([]);
    const [programCodeOptions, setProgramCodeOptions] = useState([]);
    const [semesterOptions, setSemesterOptions] = useState([]);

    const user = global1.user;
    const token = global1.token;
    const colid = global1.colid;

    const columns = [
        { field: 'student', headerName: 'Student Name', width: 200 },
        { field: 'regno', headerName: 'Reg. No', width: 150 },
        { field: 'program', headerName: 'Program', width: 150 },
        { field: 'programcode', headerName: 'Program Code', width: 150 },
        { field: 'course', headerName: 'Course', width: 200 },
        { field: 'coursecode', headerName: 'Course Code', width: 150 },
        { field: 'semester', headerName: 'Semester', width: 130 }
    ];

    useEffect(() => {
        const fetchDistinctValues = async () => {
            try {
                const response = await ep1.get('/api/v2/getclassenrdistinctvalues', {
                    params: { 
                        colid: colid,
                        year: year,
                        programcode: programCode
                    }
                });
                
                if (response.data && response.data.status === 'success') {
                    setYearOptions(response.data.data.years || []);
                    setProgramCodeOptions(response.data.data.programcodes || []);
                    setSemesterOptions(response.data.data.semesters || []);
                }
            } catch (error) {
                console.error('Error fetching distinct values:', error);
            }
        };

        if (colid) {
            fetchDistinctValues();
        }
    }, [colid, year, programCode]);

    const handleYearChange = (e) => {
        setYear(e.target.value);
        setProgramCode('');
        setSemester('');
    };

    const handleProgramCodeChange = (e) => {
        setProgramCode(e.target.value);
        setSemester('');
    };

    const fetchStudents = async () => {
        if (!year || !programCode || !semester) {
            alert('Please select Year, Program Code, and Semester to filter students.');
            return;
        }

        setLoading(true);
        try {
            const response = await ep1.get('/api/v2/getclassenrstudents', {
                params: {
                    colid: colid,
                    year: year,
                    programcode: programCode,
                    semester: semester,
                    token: token,
                    user: user
                }
            });

            if (response.data && response.data.data) {
                // Ensure unique IDs for DataGrid
                const dataWithIds = response.data.data.map((item, index) => ({
                    ...item,
                    id: item._id || index
                }));
                setRows(dataWithIds);
                if (dataWithIds.length === 0) {
                    alert('No students found for the given criteria.');
                }
            }
        } catch (error) {
            console.error('Error fetching students', error);
            alert('Failed to fetch students. Please try again.');
        }
        setLoading(false);
    };

    const postToExamAdmit = async () => {
        if (rows.length === 0) {
            alert('No students to post. Please fetch students first.');
            return;
        }
        if (!exam || !examCode) {
            alert('Please provide Exam and Exam Code before posting.');
            return;
        }

        setLoading(true);
        try {
            const response = await ep1.post('/api/v2/postclassenrtoexamadmit', {
                colid: colid,
                user: user,
                token: token,
                exam: exam,
                examcode: examCode,
                students: rows
            });

            if (response.data && response.data.status === 'success') {
                alert(response.data.message);
            } else {
                alert('An error occurred while posting data.');
            }
        } catch (error) {
            console.error('Error posting to exam admit', error);
            alert('Failed to post students. Please check the network block and try again.');
        }
        setLoading(false);
    };

    return (
        <ThemeProvider theme={mdTheme}>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h5" gutterBottom>
                        Post Students to Exam Admit
                    </Typography>

                    <Grid container spacing={3} sx={{ mt: 1, mb: 2 }}>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel>Year (e.g., 2023-2024)</InputLabel>
                                <Select
                                    value={year}
                                    label="Year (e.g., 2023-2024)"
                                    onChange={handleYearChange}
                                >
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    {yearOptions.map((option, index) => (
                                        <MenuItem key={index} value={option}>{option}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth disabled={!year}>
                                <InputLabel>Program Code</InputLabel>
                                <Select
                                    value={programCode}
                                    label="Program Code"
                                    onChange={handleProgramCodeChange}
                                >
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    {programCodeOptions.map((option, index) => (
                                        <MenuItem key={index} value={option.programcode || option}>
                                            {option.program ? `${option.program} (${option.programcode})` : option}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth disabled={!programCode}>
                                <InputLabel>Semester</InputLabel>
                                <Select
                                    value={semester}
                                    label="Semester"
                                    onChange={(e) => setSemester(e.target.value)}
                                >
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    {semesterOptions.map((option, index) => (
                                        <MenuItem key={index} value={option}>{option}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 4 }}>
                        <Button variant="contained" color="primary" onClick={fetchStudents}>
                            Fetch Students
                        </Button>
                    </Box>

                    <Grid container spacing={3} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Exam"
                                value={exam}
                                onChange={(e) => setExam(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Exam Code"
                                value={examCode}
                                onChange={(e) => setExamCode(e.target.value)}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 4 }}>
                        <Button variant="contained" color="secondary" onClick={postToExamAdmit}>
                            Post to Exam Admit
                        </Button>
                    </Box>

                    <Box sx={{ height: 400, width: '100%' }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            pageSize={5}
                            rowsPerPageOptions={[5, 10, 20]}
                            disableSelectionOnClick
                        />
                    </Box>

                    <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
                        <CircularProgress color="inherit" />
                    </Backdrop>
                </Paper>
            </Container>
        </ThemeProvider>
    );
}

export default PostToExamAdmit;
