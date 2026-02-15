import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    Grid,
    Snackbar,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    MenuItem,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import { Save } from '@mui/icons-material';
import ep1 from '../api/ep1';
import global1 from './global1';

const StudentMarksEntry11ds = () => {
    const [semester, setSemester] = useState('11');
    const [academicyear, setAcademicyear] = useState('2025-2026');
    const [section, setSection] = useState('A');

    // Filter States for Dropdown approach
    const [term, setTerm] = useState('unit');
    const [component, setComponent] = useState('unitpremidobtain');

    // Data states
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [marksMap, setMarksMap] = useState({}); // Map of regno-subjectcode -> FULL marks object

    // Working Days Dialog
    const [openWorkingDaysDialog, setOpenWorkingDaysDialog] = useState(false);
    const [workingDaysInput, setWorkingDaysInput] = useState('');

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Dynamic options
    const [availableSemesters, setAvailableSemesters] = useState([]);
    const [availableYears, setAvailableYears] = useState([]);
    const [availableSections, setAvailableSections] = useState([]);

    // Component configurations matching backend model fields
    const componentOptions = {
        unit: [
            { value: 'unitpremidobtain', label: 'Pre-Mid (Unit)' },
            { value: 'unitpostmidobtain', label: 'Post-Mid (Unit)' }
        ],
        halfyearly: [
            { value: 'halfyearlythobtain', label: 'Theory (Half Yearly)' },
            { value: 'halfyearlypracticalobtain', label: 'Practical (Half Yearly)' }
        ],
        annual: [
            { value: 'annualthobtain', label: 'Theory (Annual)' },
            { value: 'annualpracticalobtain', label: 'Practical (Annual)' }
        ],
        attendance: [
            { value: 'term1totalpresentdays', label: 'Term I Present Days' },
            { value: 'term2totalpresentdays', label: 'Term II Present Days' }
        ]
    };

    // Mapping for Max Marks fields in Subject Config
    const maxMarksMap = {
        'unitpremidobtain': 'unitpremid',
        'unitpostmidobtain': 'unitpostmid',
        'halfyearlythobtain': 'halfyearlyth',
        'halfyearlypracticalobtain': 'halfyearlypractical',
        'annualthobtain': 'annualth',
        'annualpracticalobtain': 'annualpractical',
        'term1totalpresentdays': '',
        'term2totalpresentdays': ''
    };

    useEffect(() => {
        fetchSemestersAndYears();
    }, []);

    // Auto-select first component when term changes
    useEffect(() => {
        if (componentOptions[term] && componentOptions[term].length > 0) {
            setComponent(componentOptions[term][0].value);
        }
    }, [term]);

    useEffect(() => {
        if (semester && academicyear && section) {
            fetchData();
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

                // Set defaults
                if (!semester && response.data.semesters.length > 0) setSemester(response.data.semesters[0]);
                if (!academicyear && response.data.admissionyears.length > 0) setAcademicyear(response.data.admissionyears[0]);
                if (!section && response.data.sections.length > 0) setSection(response.data.sections[0]);
            }
        } catch (error) {
            console.error('Error fetching semesters/years:', error);
            showSnackbar('Failed to fetch filter data', 'error');
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await ep1.get('/api/v2/getstudentsandsubjectsformarks11ds', {
                params: {
                    colid: global1.colid,
                    semester,
                    academicyear,
                    section,
                    term // Pass term to backend
                }
            });

            if (response.data.success) {
                setStudents(response.data.students || []);
                setSubjects(response.data.subjects || []);

                // Process existing marks
                const marks = response.data.marks || [];
                const newMarksMap = {};

                marks.forEach(m => {
                    const key = `${m.regno}-${m.subjectcode}`;
                    newMarksMap[key] = m;
                });
                setMarksMap(newMarksMap);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            showSnackbar('Failed to fetch data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkChange = (regno, subject, value) => {
        const key = `${regno}-${subject.subjectcode}`;
        const existing = marksMap[key] || {};

        setMarksMap(prev => ({
            ...prev,
            [key]: {
                ...existing,
                colid: global1.colid,
                semester,
                academicyear,
                section,
                regno,
                studentname: existing.studentname || students.find(s => s.regno === regno)?.name,
                subjectcode: subject.subjectcode,
                subjectname: subject.subjectname,
                user: global1.user,
                [component]: value // Update ONLY the current component field
            }
        }));
    };

    const handleSave = async () => {
        // If Attendance, check for Working Days
        if (term === 'attendance') {
            const workingDaysField = component === 'term1attendance' ? 'term1workingdays' : 'term2workingdays';
            // Check if working days is set for at least one student or globally?
            // Usually working days is same for class. 
            // We can ask user to input it once.
            setOpenWorkingDaysDialog(true);
            return;
        }
        await submitMarks();
    };

    const submitMarks = async (extraData = null) => {
        setSaving(true);
        try {
            let payloadMarks = [];

            if (term === 'attendance') {
                // Construct payload for attendance
                // We will send a special subjectcode 'ATTENDANCE' to backend
                const workingDaysField = component === 'term1totalpresentdays' ? 'term1totalworkingdays' : 'term2totalworkingdays';
                const workingDaysVal = extraData ? extraData.workingDays : 0;

                payloadMarks = students.map(s => {
                    const key = `${s.regno}-ATTENDANCE`;
                    const markObj = marksMap[key] || {};
                    const attVal = markObj[component];
                    // Also need working days.
                    // If we have per-student working days, use valid one, else use global.
                    // But simpler: just send what we have.

                    if (attVal !== undefined && attVal !== '') {
                        const payload = {
                            colid: global1.colid,
                            regno: s.regno,
                            semester: semester,
                            academicyear: academicyear,
                            name: s.name, // Use student listing for name
                            studentname: s.name,
                            user: global1.user,
                            subjectcode: 'ATTENDANCE', // Special code
                            [component]: attVal,
                            [workingDaysField]: workingDaysVal
                        };
                        return payload;
                    }
                    return null;
                }).filter(Boolean);
                console.log('Attendance Payload:', payloadMarks);

            } else {
                // Send all loaded marks data to ensure consistency
                payloadMarks = Object.values(marksMap);
            }

            if (payloadMarks.length === 0) {
                showSnackbar('No marks/data to save', 'warning');
                setSaving(false);
                return;
            }

            const response = await ep1.post('/api/v2/savemarks11ds', { marksData: payloadMarks });

            if (response.data.success) {
                showSnackbar('Saved successfully', 'success');
                fetchData(); // Refresh to recalculate
            }
        } catch (error) {
            console.error('Error saving marks:', error);
            showSnackbar('Failed to save marks', 'error');
        } finally {
            setSaving(false);
            setOpenWorkingDaysDialog(false);
        }
    };

    const handleWorkingDaysConfirm = () => {
        if (!workingDaysInput || Number(workingDaysInput) <= 0) {
            showSnackbar('Please enter valid working days', 'error');
            return;
        }
        submitMarks({ workingDays: Number(workingDaysInput) });
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Helper to get value
    const getVal = (regno, subjectcode) => {
        const key = `${regno}-${subjectcode}`;
        return marksMap[key]?.[component] || '';
    };

    // Determine header columns
    const columns = term === 'attendance'
        ? [{ subjectcode: 'ATTENDANCE', subjectname: 'Attendance' }]
        : subjects;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Class 11 & 12 Marks Entry
            </Typography>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        {/* Filters Row 1 */}
                        <Grid item xs={12} md={2}>
                            <TextField
                                select
                                fullWidth
                                label="Semester/Class"
                                value={semester}
                                onChange={(e) => setSemester(e.target.value)}
                            >
                                {availableSemesters.map((sem) => (
                                    <MenuItem key={sem} value={sem}>{sem}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <TextField
                                select
                                fullWidth
                                label="Academic Year"
                                value={academicyear}
                                onChange={(e) => setAcademicyear(e.target.value)}
                            >
                                {availableYears.map((year) => (
                                    <MenuItem key={year} value={year}>{year}</MenuItem>
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
                                {availableSections.map((sec) => (
                                    <MenuItem key={sec} value={sec}>{sec}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Filters Row 2 - Component Selection */}
                        <Grid item xs={12} md={2}>
                            <TextField
                                select
                                fullWidth
                                label="Term"
                                value={term}
                                onChange={(e) => setTerm(e.target.value)}
                            >
                                <MenuItem value="unit">Unit Test</MenuItem>
                                <MenuItem value="halfyearly">Half Yearly</MenuItem>
                                <MenuItem value="annual">Annual</MenuItem>
                                <MenuItem value="attendance">Attendance</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={2}>
                            <TextField
                                select
                                fullWidth
                                label="Component"
                                value={component}
                                onChange={(e) => setComponent(e.target.value)}
                            >
                                {componentOptions[term]?.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={2} sx={{ textAlign: 'right' }}>
                            <Button
                                variant="contained"
                                startIcon={<Save />}
                                onClick={handleSave}
                                disabled={loading || saving || students.length === 0}
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ maxHeight: '70vh' }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ backgroundColor: '#e0e0e0', zIndex: 10, minWidth: 200, fontWeight: 'bold' }}>
                                    Student Info
                                </TableCell>
                                {columns.map((subject) => (
                                    <TableCell
                                        key={subject.subjectcode}
                                        align="center"
                                        sx={{ backgroundColor: '#f5f5f5', minWidth: 100, borderLeft: '1px solid #ddd' }}
                                    >
                                        <Box sx={{ fontWeight: 'bold' }}>{subject.subjectname}</Box>
                                        {term !== 'attendance' && (
                                            <>
                                                <Typography variant="caption" color="textSecondary">{subject.subjectcode}</Typography>
                                                <Typography variant="caption" display="block" color="primary" sx={{ mt: 0.5 }}>
                                                    Max: {subject[maxMarksMap[component]] || '-'}
                                                </Typography>
                                            </>
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow key={student.regno} hover>
                                    <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: '#fff', zIndex: 5, borderRight: '1px solid #eee' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{student.name}</Typography>
                                        <Typography variant="caption" color="textSecondary">{student.rollno} | {student.regno}</Typography>
                                    </TableCell>
                                    {columns.map((subject) => (
                                        <TableCell key={`${student.regno}-${subject.subjectcode}`} align="center" sx={{ borderLeft: '1px solid #ddd', p: 1 }}>
                                            <TextField
                                                size="small"
                                                type="number"
                                                variant="outlined"
                                                value={getVal(student.regno, subject.subjectcode)}
                                                onChange={(e) => handleMarkChange(student.regno, subject, e.target.value)}
                                                inputProps={{
                                                    style: { textAlign: 'center', padding: '5px' }
                                                }}
                                                sx={{
                                                    width: '80px',
                                                    '& .MuiOutlinedInput-root': {
                                                        '& fieldset': { borderColor: getVal(student.regno, subject.subjectcode) ? '#1976d2' : '#e0e0e0' }
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Working Days Dialog */}
            <Dialog open={openWorkingDaysDialog} onClose={() => setOpenWorkingDaysDialog(false)}>
                <DialogTitle>Enter Total Working Days</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter the total working days for this term to save with the attendance.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Total Working Days"
                        type="number"
                        fullWidth
                        variant="standard"
                        value={workingDaysInput}
                        onChange={(e) => setWorkingDaysInput(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenWorkingDaysDialog(false)}>Cancel</Button>
                    <Button onClick={handleWorkingDaysConfirm} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StudentMarksEntry11ds;
