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
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import ep1 from '../api/ep1';
import global1 from './global1';

const SubjectComponentConfig11ds = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);
    const [semester, setSemester] = useState('11'); // Default to 11
    const [academicyear, setAcademicyear] = useState('2025-2026'); // Default
    const [section, setSection] = useState(''); // Section = Stream (A=Science, B=Commerce, C=Arts)

    const [availableSemesters, setAvailableSemesters] = useState([]);
    const [availableYears, setAvailableYears] = useState([]);
    const [availableSections, setAvailableSections] = useState([]);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [formData, setFormData] = useState({
        name: '',
        subjectcode: '',
        subjectname: '',
        unitpremid: 50,
        unitpostmid: 50,
        halfyearlyth: 70,
        halfyearlypractical: 30,
        annualth: 70,
        annualpractical: 30,
        isadditional: false,
        iscompulsory: false
    });

    useEffect(() => {
        fetchSemestersAndYears();
    }, []);

    useEffect(() => {
        if (semester && academicyear) {
            fetchSubjects();
        }
    }, [semester, academicyear, section]);

    // Re-fetch sections from User table whenever semester changes
    useEffect(() => {
        if (semester) {
            fetchSectionsBySemester(semester);
        }
    }, [semester]);

    const fetchSemestersAndYears = async () => {
        try {
            const response = await ep1.get('/api/v2/getdistinctsemestersandyears9ds', {
                params: { colid: global1.colid }
            });
            if (response.data.success) {
                setAvailableSemesters(response.data.semesters || []);
                setAvailableYears(response.data.admissionyears || []);
                const sem = response.data.semesters?.[0] || semester;
                if (!semester && sem) setSemester(sem);
                if (!academicyear && response.data.admissionyears.length > 0) setAcademicyear(response.data.admissionyears[0]);
                // sections will be fetched by the semester useEffect
            }
        } catch (error) {
            console.error('Error fetching semesters/years:', error);
            showSnackbar('Failed to fetch filter data', 'error');
        }
    };

    // Fetch sections from User table filtered by the selected semester
    const fetchSectionsBySemester = async (sem) => {
        try {
            const response = await ep1.get('/api/v2/getdistinctsectionsbyclass9ds', {
                params: { colid: global1.colid, semester: sem }
            });
            if (response.data.success) {
                const secs = response.data.sections || [];
                setAvailableSections(secs);
                // Auto-select first section if current selection not in list
                if (secs.length > 0 && !secs.includes(section)) {
                    setSection(secs[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    };

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const response = await ep1.get('/api/v2/getsubjectsfromconfig11ds', {
                params: {
                    colid: global1.colid,
                    semester,
                    academicyear,
                    section  // Pass section to get stream-specific subjects
                }
            });
            if (response.data.success) {
                setSubjects(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
            showSnackbar('Failed to fetch subjects', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (subject = null) => {
        if (subject) {
            setEditMode(true);
            setSelectedSubjectId(subject._id);
            setFormData({
                name: subject.name,
                subjectcode: subject.subjectcode,
                subjectname: subject.subjectname,
                unitpremid: subject.unitpremid,
                unitpostmid: subject.unitpostmid,
                halfyearlyth: subject.halfyearlyth,
                halfyearlypractical: subject.halfyearlypractical,
                annualth: subject.annualth,
                annualpractical: subject.annualpractical,
                isadditional: subject.isadditional || false,
                iscompulsory: subject.iscompulsory || false
            });
        } else {
            setEditMode(false);
            setSelectedSubjectId(null);
            setFormData({
                name: '',
                subjectcode: '',
                subjectname: '',
                unitpremid: 50,
                unitpostmid: 50,
                halfyearlyth: 70,
                halfyearlypractical: 30,
                annualth: 70,
                annualpractical: 30,
                isadditional: false,
                iscompulsory: false
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSave = async () => {
        if (!formData.subjectname || !formData.subjectcode) {
            showSnackbar('Subject Name and Code are required', 'warning');
            return;
        }

        try {
            let response;
            const payload = {
                colid: global1.colid,
                user: global1.user,
                semester,
                academicyear,
                section,  // Include section/stream
                ...formData,
                name: formData.subjectname
            };

            if (editMode && selectedSubjectId) {
                response = await ep1.post('/api/v2/subjectcomponentconfig11ds/save', {
                    id: selectedSubjectId,
                    ...payload
                });
            } else {
                response = await ep1.post('/api/v2/subjectcomponentconfig11ds/save', payload);
            }

            if (response.data.success) {
                showSnackbar('Subject saved successfully', 'success');
                fetchSubjects();
                handleCloseDialog();
            }
        } catch (error) {
            console.error('Error saving subject:', error);
            showSnackbar('Failed to save subject', 'error');
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Class 11 & 12 Subject Configuration
            </Typography>

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
                                label="Section (Stream)"
                                value={section}
                                onChange={(e) => setSection(e.target.value)}
                            >
                                {availableSections.map((sec) => (
                                    <MenuItem key={sec} value={sec}>{sec}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => handleOpenDialog()}
                                disabled={!semester || !academicyear || !section}
                            >
                                Add Subject
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell>Subject Code</TableCell>
                            <TableCell>Subject Name</TableCell>
                            <TableCell align="center">Section</TableCell>
                            <TableCell align="center">Unit (Pre+Post)</TableCell>
                            <TableCell align="center">Half Yearly (Th+Pr)</TableCell>
                            <TableCell align="center">Annual (Th+Pr)</TableCell>
                            <TableCell align="center">Additional</TableCell>
                            <TableCell align="center">Compulsory</TableCell>
                            <TableCell align="center">Last Updated</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {subjects.map((subject) => (
                            <TableRow key={subject._id}>
                                <TableCell>{subject.subjectcode}</TableCell>
                                <TableCell>{subject.subjectname}</TableCell>
                                <TableCell align="center">{subject.section || '-'}</TableCell>
                                <TableCell align="center">{subject.unitpremid} + {subject.unitpostmid}</TableCell>
                                <TableCell align="center">{subject.halfyearlyth} + {subject.halfyearlypractical}</TableCell>
                                <TableCell align="center">{subject.annualth} + {subject.annualpractical}</TableCell>
                                <TableCell align="center">{subject.isadditional ? 'Yes' : 'No'}</TableCell>
                                <TableCell align="center">{subject.iscompulsory ? 'Yes' : 'No'}</TableCell>
                                <TableCell align="center">
                                    {subject.updatedAt
                                        ? new Date(subject.updatedAt).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                        : subject.updatedat
                                            ? new Date(subject.updatedat).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                            : '-'}
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton onClick={() => handleOpenDialog(subject)} color="primary">
                                        <Edit />
                                    </IconButton>
                                    {/* Delete not implemented yet */}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>{editMode ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Subject Code"
                                value={formData.subjectcode}
                                onChange={(e) => setFormData({ ...formData, subjectcode: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Subject Name"
                                value={formData.subjectname}
                                onChange={(e) => setFormData({ ...formData, subjectname: e.target.value })}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ mt: 2 }}>Unit Test Max Marks</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Pre-Mid"
                                value={formData.unitpremid}
                                onChange={(e) => setFormData({ ...formData, unitpremid: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Post-Mid"
                                value={formData.unitpostmid}
                                onChange={(e) => setFormData({ ...formData, unitpostmid: e.target.value })}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ mt: 2 }}>Half Yearly Max Marks</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Theory"
                                value={formData.halfyearlyth}
                                onChange={(e) => setFormData({ ...formData, halfyearlyth: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Practical"
                                value={formData.halfyearlypractical}
                                onChange={(e) => setFormData({ ...formData, halfyearlypractical: e.target.value })}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ mt: 2 }}>Annual Exam Max Marks</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Theory"
                                value={formData.annualth}
                                onChange={(e) => setFormData({ ...formData, annualth: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Practical"
                                value={formData.annualpractical}
                                onChange={(e) => setFormData({ ...formData, annualpractical: e.target.value })}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.isadditional}
                                        onChange={(e) => setFormData({ ...formData, isadditional: e.target.checked })}
                                    />
                                }
                                label="Is Additional Subject?"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.iscompulsory}
                                        onChange={(e) => setFormData({ ...formData, iscompulsory: e.target.checked })}
                                    />
                                }
                                label="Is Compulsory Subject?"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" color="primary">Save</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SubjectComponentConfig11ds;
