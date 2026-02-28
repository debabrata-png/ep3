import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Grid,
    Alert,
    Snackbar,
    Chip,
    CircularProgress,
    MenuItem,
    Tooltip
} from '@mui/material';
import { Save, School, Warning } from '@mui/icons-material';
import ep1 from '../api/ep1';
import global1 from './global1';

/**
 * Compartment / Supplementary Exam Marks Entry
 * Works for both Class 6-10 (classGroup="9ds") and Class 11-12 (classGroup="11ds")
 * 
 * Key design principle:
 *  - Original marks are NEVER modified
 *  - Only `compartmentobtained` field is written per failing subject
 *  - Subject stays in the Compartment table in the report card regardless of supplementary score
 */
const CompartmentMarksEntryds = ({ classGroup = '9ds' }) => {
    const is11ds = classGroup === '11ds';

    const [semester, setSemester] = useState('');
    const [academicyear, setAcademicyear] = useState('');
    const [section, setSection] = useState('');

    const [students, setStudents] = useState([]);
    const [marksData, setMarksData] = useState({}); // key: regno_subjectcode → value

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [availableSemesters, setAvailableSemesters] = useState([]);
    const [availableYears, setAvailableYears] = useState([]);
    const [availableSections, setAvailableSections] = useState([]);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchSemestersAndYears();
    }, []);

    useEffect(() => {
        if (semester && academicyear) {
            fetchCompartmentStudents();
        }
    }, [semester, academicyear, section]);

    const fetchSemestersAndYears = async () => {
        try {
            const response = await ep1.get('/api/v2/getdistinctsemestersandyears9ds', {
                params: { colid: global1.colid }
            });
            if (response.data.success) {
                setAvailableSemesters(response.data.semesters || []);
                setAvailableYears(response.data.admissionyears || []);
                setAvailableSections(response.data.sections || []);
                if (response.data.semesters?.length > 0) setSemester(response.data.semesters[0]);
                if (response.data.admissionyears?.length > 0) setAcademicyear(response.data.admissionyears[0]);
            }
        } catch (error) {
            showSnackbar('Failed to fetch filter data', 'error');
        }
    };

    const fetchCompartmentStudents = async () => {
        setLoading(true);
        setStudents([]);
        setMarksData({});
        try {
            const endpoint = is11ds
                ? '/api/v2/getcompartmentstudents11ds'
                : '/api/v2/getcompartmentstudents9ds';

            const response = await ep1.get(endpoint, {
                params: { colid: global1.colid, semester, academicyear, section }
            });

            if (response.data.success) {
                const studentsData = response.data.students || [];
                setStudents(studentsData);

                // Pre-populate existing compartment marks
                const newMarksData = {};
                studentsData.forEach(student => {
                    student.failedSubjects.forEach(sub => {
                        const key = `${student.regno}_${sub.subjectcode}`;
                        newMarksData[key] = sub.compartmentobtained !== null && sub.compartmentobtained !== ''
                            ? sub.compartmentobtained : '';
                    });
                });
                setMarksData(newMarksData);
            }
        } catch (error) {
            showSnackbar('Failed to fetch compartment students', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkChange = (regno, subjectcode, value) => {
        const key = `${regno}_${subjectcode}`;
        setMarksData(prev => ({
            ...prev,
            [key]: value === '' ? '' : value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const marksArray = [];
            students.forEach(student => {
                student.failedSubjects.forEach(sub => {
                    const key = `${student.regno}_${sub.subjectcode}`;
                    const value = marksData[key];
                    marksArray.push({
                        regno: student.regno,
                        subjectcode: sub.subjectcode,
                        compartmentobtained: (value !== '' && value !== undefined && value !== null) ? Number(value) : null
                    });
                });
            });

            if (marksArray.length === 0) {
                showSnackbar('No marks to save', 'warning');
                setSaving(false);
                return;
            }

            const endpoint = is11ds
                ? '/api/v2/savecompartmentmarks11ds'
                : '/api/v2/savecompartmentmarks9ds';

            const response = await ep1.post(endpoint, {
                colid: Number(global1.colid),
                semester,
                academicyear,
                marks: marksArray
            });

            if (response.data.success) {
                showSnackbar('Compartment marks saved successfully!', 'success');
                fetchCompartmentStudents(); // Refresh
            }
        } catch (error) {
            showSnackbar('Failed to save marks', 'error');
        } finally {
            setSaving(false);
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Count total failed subjects in the loaded data
    const totalFailedSubjects = students.reduce((sum, s) => sum + s.failedSubjects.length, 0);

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Warning color="warning" />
                <Typography variant="h4">
                    Compartment / Supplementary Marks Entry {is11ds ? '(Class 11-12)' : '(Class 6-10)'}
                </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 2 }}>
                <strong>Note:</strong> Only subjects where the student scored below 33 (Grade E) appear here.
                Entering marks here will <strong>not</strong> change the original report card marks.
                The subject will continue to appear in the "Compartment Examination" table in the report card.
            </Alert>

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={2}>
                            <TextField
                                select
                                fullWidth
                                label="Semester/Class"
                                value={semester}
                                onChange={(e) => setSemester(e.target.value)}
                            >
                                {availableSemesters.map(s => (
                                    <MenuItem key={s} value={s}>{s}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                select
                                fullWidth
                                label="Academic Year"
                                value={academicyear}
                                onChange={(e) => setAcademicyear(e.target.value)}
                            >
                                {availableYears.map(y => (
                                    <MenuItem key={y} value={y}>{y}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <TextField
                                select
                                fullWidth
                                label="Section"
                                value={section}
                                onChange={(e) => setSection(e.target.value)}
                            >
                                <MenuItem value="">All Sections</MenuItem>
                                {availableSections.map(s => (
                                    <MenuItem key={s} value={s}>{s}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Button
                                variant="outlined"
                                onClick={fetchCompartmentStudents}
                                disabled={loading || !semester || !academicyear}
                                fullWidth
                            >
                                Load Students
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Button
                                variant="contained"
                                color="warning"
                                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                                onClick={handleSave}
                                disabled={loading || saving || students.length === 0}
                                fullWidth
                            >
                                Save Supplementary Marks
                            </Button>
                        </Grid>
                    </Grid>

                    {students.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="textSecondary">
                                <strong>Students with failing subjects:</strong> {students.length} &nbsp;|&nbsp;
                                <strong>Total failing subjects:</strong> {totalFailedSubjects}
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Main Table */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                </Box>
            ) : students.length === 0 ? (
                <Alert severity="success" icon={<School />}>
                    {semester && academicyear
                        ? 'No students with failing subjects found for this selection. All students have passed!'
                        : 'Select a semester and academic year, then click "Load Students".'}
                </Alert>
            ) : (
                <TableContainer component={Paper}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#fff3cd' }}>
                                <TableCell sx={{ fontWeight: 'bold', minWidth: 120, bgcolor: '#fff3e0' }}>Reg No.</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', minWidth: 180, bgcolor: '#fff3e0' }}>Student Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fff3e0' }}>Failed Subject</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#ffccbc', minWidth: 140 }}>
                                    Original Score (out of 100)
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#c8e6c9', minWidth: 180 }}>
                                    Supplementary Marks Obtained (out of 100)
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#fff3e0', minWidth: 100 }}>
                                    Status
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.map((student, sIdx) =>
                                student.failedSubjects.map((sub, subIdx) => {
                                    const key = `${student.regno}_${sub.subjectcode}`;
                                    const suppMarks = marksData[key];
                                    const hasSuppMarks = suppMarks !== '' && suppMarks !== null && suppMarks !== undefined;
                                    const suppPassed = hasSuppMarks && Number(suppMarks) >= 33;

                                    return (
                                        <TableRow
                                            key={key}
                                            sx={{
                                                bgcolor: subIdx % 2 === 0 ? '#fff8e1' : '#ffffff',
                                                '&:hover': { bgcolor: '#f0f4ff' }
                                            }}
                                        >
                                            {subIdx === 0 && (
                                                <>
                                                    <TableCell rowSpan={student.failedSubjects.length} sx={{ fontWeight: 'bold', verticalAlign: 'top', pt: 2 }}>
                                                        {student.regno}
                                                    </TableCell>
                                                    <TableCell rowSpan={student.failedSubjects.length} sx={{ verticalAlign: 'top', pt: 2 }}>
                                                        {student.studentname}
                                                    </TableCell>
                                                </>
                                            )}
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{sub.subjectname}</Typography>
                                                    <Typography variant="caption" color="textSecondary">{sub.subjectcode}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={`${sub.originalScore} / 100`}
                                                    color="error"
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Enter marks obtained in supplementary/compartment exam">
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={suppMarks}
                                                        onChange={(e) => handleMarkChange(student.regno, sub.subjectcode, e.target.value)}
                                                        inputProps={{ min: 0, max: 100, step: 1 }}
                                                        sx={{
                                                            width: 110,
                                                            '& .MuiOutlinedInput-root': {
                                                                bgcolor: hasSuppMarks ? (suppPassed ? '#e8f5e9' : '#ffebee') : '#fff',
                                                                '& fieldset': {
                                                                    borderColor: hasSuppMarks ? (suppPassed ? '#4caf50' : '#f44336') : '#e0e0e0',
                                                                    borderWidth: hasSuppMarks ? 2 : 1
                                                                }
                                                            }
                                                        }}
                                                        placeholder="0-100"
                                                    />
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell align="center">
                                                {hasSuppMarks ? (
                                                    <Chip
                                                        label={suppPassed ? 'PASS' : 'FAIL'}
                                                        color={suppPassed ? 'success' : 'error'}
                                                        size="small"
                                                    />
                                                ) : (
                                                    <Chip label="Not Entered" size="small" variant="outlined" />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CompartmentMarksEntryds;
