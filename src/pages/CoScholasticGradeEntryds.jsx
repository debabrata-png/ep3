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
    CircularProgress,
    MenuItem
} from '@mui/material';
import { Save } from '@mui/icons-material';
import ep1 from '../api/ep1';
import global1 from './global1';

const CoScholasticGradeEntryds = () => {
    const [semester, setSemester] = useState('');
    const [academicyear, setAcademicyear] = useState('');
    const [section, setSection] = useState('');

    const [students, setStudents] = useState([]);
    const [activities, setActivities] = useState([]);
    const [gradeMap, setGradeMap] = useState({}); // regno -> activityId -> { term1, term2 }

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [availableSemesters, setAvailableSemesters] = useState([]);
    const [availableYears, setAvailableYears] = useState([]);
    const [availableSections, setAvailableSections] = useState([]);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchSemestersAndYears();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchSemestersAndYears = async () => {
        try {
            const response = await ep1.get('/api/v2/getdistinctsemestersandyears9ds', {
                params: { colid: global1.colid }
            });

            if (response.data.success) {
                setAvailableSemesters(response.data.semesters);
                setAvailableYears(response.data.admissionyears);
                setAvailableSections(response.data.sections || []);

                if (response.data.semesters.length > 0) setSemester(response.data.semesters[0]);
                if (response.data.admissionyears.length > 0) setAcademicyear(response.data.admissionyears[0]);
            }
        } catch (error) {
            console.error('Error fetching semesters:', error);
            showSnackbar('Failed to fetch semesters', 'error');
        }
    };

    const handleFetchData = async () => {
        if (!semester || !academicyear) return;
        setLoading(true);
        try {
            const response = await ep1.get('/api/v2/coscholastic/entry-data', {
                params: {
                    colid: global1.colid,
                    semester,
                    academicyear,
                    section
                }
            });

            if (response.data.success) {
                setStudents(response.data.students);
                setActivities(response.data.activities);
                setGradeMap(response.data.gradeMap || {});
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            showSnackbar('Failed to fetch data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGradeChange = (regno, activityId, term, value) => {
        setGradeMap(prev => ({
            ...prev,
            [regno]: {
                ...prev[regno],
                [activityId]: {
                    ...(prev[regno]?.[activityId] || {}),
                    [term]: value.toUpperCase()
                }
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const gradesData = [];

            // Flatten map to array for sending
            Object.keys(gradeMap).forEach(regno => {
                Object.keys(gradeMap[regno]).forEach(activityId => {
                    const g = gradeMap[regno][activityId];
                    if (g.term1 || g.term2) {
                        gradesData.push({
                            regno,
                            activityId,
                            term1: g.term1,
                            term2: g.term2
                        });
                    }
                });
            });

            if (gradesData.length === 0) {
                showSnackbar('No grades entered to save', 'warning');
                setSaving(false);
                return;
            }

            const response = await ep1.post('/api/v2/coscholastic/grades', {
                colid: global1.colid,
                semester,
                academicyear,
                gradesData
            });

            if (response.data.success) {
                showSnackbar('Grades saved successfully', 'success');
            }
        } catch (error) {
            console.error('Error saving grades:', error);
            showSnackbar('Failed to save grades', 'error');
        } finally {
            setSaving(false);
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Co-Scholastic Grades Entry
            </Typography>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                            <TextField
                                select
                                fullWidth
                                label="Semester"
                                value={semester}
                                onChange={(e) => setSemester(e.target.value)}
                            >
                                {availableSemesters.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
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
                                {availableYears.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                select
                                fullWidth
                                label="Section"
                                value={section}
                                onChange={(e) => setSection(e.target.value)}
                            >
                                <MenuItem value="">All Sections</MenuItem>
                                {availableSections.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Button
                                variant="contained"
                                onClick={handleFetchData}
                                disabled={loading || !semester || !academicyear}
                            >
                                Fetch Data
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {loading ? (
                <CircularProgress />
            ) : students.length > 0 && activities.length > 0 ? (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                            onClick={handleSave}
                            disabled={saving}
                        >
                            Save Grades
                        </Button>
                    </Box>
                    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 3 }}>Reg No</TableCell>
                                    <TableCell sx={{ position: 'sticky', left: 100, bgcolor: 'background.paper', zIndex: 3 }}>Name</TableCell>
                                    {activities.map(act => (
                                        <TableCell key={act._id} align="center" colSpan={2} sx={{ borderLeft: '1px solid #e0e0e0' }}>
                                            {act.activityname}
                                        </TableCell>
                                    ))}
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 3 }}></TableCell>
                                    <TableCell sx={{ position: 'sticky', left: 100, bgcolor: 'background.paper', zIndex: 3 }}></TableCell>
                                    {activities.map(act => (
                                        <React.Fragment key={act._id}>
                                            <TableCell align="center" sx={{ borderLeft: '1px solid #e0e0e0' }}>Term 1</TableCell>
                                            <TableCell align="center">Term 2</TableCell>
                                        </React.Fragment>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {students.map(student => (
                                    <TableRow key={student.regno}>
                                        <TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>{student.regno}</TableCell>
                                        <TableCell sx={{ position: 'sticky', left: 100, bgcolor: 'background.paper', zIndex: 1 }}>{student.name}</TableCell>
                                        {activities.map(act => {
                                            const g = (gradeMap[student.regno] && gradeMap[student.regno][act._id]) || {};
                                            return (
                                                <React.Fragment key={act._id}>
                                                    <TableCell sx={{ borderLeft: '1px solid #e0e0e0', p: 0.5 }}>
                                                        <TextField
                                                            size="small"
                                                            value={g.term1 || ''}
                                                            onChange={(e) => handleGradeChange(student.regno, act._id, 'term1', e.target.value)}
                                                            inputProps={{ style: { textAlign: 'center', textTransform: 'uppercase' }, maxLength: 2 }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ p: 0.5 }}>
                                                        <TextField
                                                            size="small"
                                                            value={g.term2 || ''}
                                                            onChange={(e) => handleGradeChange(student.regno, act._id, 'term2', e.target.value)}
                                                            inputProps={{ style: { textAlign: 'center', textTransform: 'uppercase' }, maxLength: 2 }}
                                                        />
                                                    </TableCell>
                                                </React.Fragment>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            ) : (
                <Alert severity="info">Click "Fetch Data" to load students and activities. Ensure activities are configured first.</Alert>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CoScholasticGradeEntryds;
