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
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Snackbar,
    Alert,
    MenuItem
} from '@mui/material';
import { Delete, Add, Edit } from '@mui/icons-material';
import ep1 from '../api/ep1';
import global1 from './global1';

const CoScholasticActivityConfigds = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedActivityId, setSelectedActivityId] = useState(null);
    const [semester, setSemester] = useState('');
    const [academicyear, setAcademicyear] = useState('');
    const [availableSemesters, setAvailableSemesters] = useState([]);
    const [availableYears, setAvailableYears] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [formData, setFormData] = useState({
        code: '',
        activityname: '',
        description: ''
    });

    useEffect(() => {
        fetchSemestersAndYears();
    }, []);

    useEffect(() => {
        if (semester && academicyear) {
            fetchActivities();
        } else {
            setActivities([]);
        }
    }, [semester, academicyear]);

    const fetchSemestersAndYears = async () => {
        try {
            const response = await ep1.get('/api/v2/getdistinctsemestersandyears9ds', {
                params: { colid: global1.colid }
            });
            if (response.data.success) {
                setAvailableSemesters(response.data.semesters || []);
                setAvailableYears(response.data.admissionyears || []);
            }
        } catch (error) {
            console.error('Error fetching semesters/years:', error);
            showSnackbar('Failed to fetch filter data', 'error');
        }
    };

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const response = await ep1.get('/api/v2/coscholastic/activities', {
                params: { colid: global1.colid, semester, academicyear }
            });
            if (response.data.success) {
                setActivities(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
            showSnackbar('Failed to fetch activities', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (activity = null) => {
        if (activity) {
            setFormData({ code: activity.code || '', activityname: activity.activityname, description: activity.description || '' });
            setEditMode(true);
            setSelectedActivityId(activity._id);
        } else {
            setFormData({ code: '', activityname: '', description: '' });
            setEditMode(false);
            setSelectedActivityId(null);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSave = async () => {
        if (!formData.activityname) {
            showSnackbar('Please enter activity name', 'warning');
            return;
        }

        try {
            let response;
            if (editMode && selectedActivityId) {
                // Update existing activity
                response = await ep1.post(`/api/v2/coscholastic/activity/update`, {
                    id: selectedActivityId,
                    semester,
                    academicyear,
                    ...formData
                });
            } else {
                // Create new activity
                response = await ep1.post('/api/v2/coscholastic/activity', {
                    colid: global1.colid,
                    user: global1.user,
                    semester,
                    academicyear,
                    ...formData
                });
            }

            if (response.data.success) {
                showSnackbar(editMode ? 'Activity updated successfully' : 'Activity added successfully', 'success');
                fetchActivities();
                handleCloseDialog();
            }
        } catch (error) {
            console.error('Error saving activity:', error);
            showSnackbar(error.response?.data?.message || 'Failed to save activity', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this activity?')) return;

        try {
            const response = await ep1.post(`/api/v2/coscholastic/activity/delete`, { id });
            if (response.data.success) {
                showSnackbar('Activity deleted successfully', 'success');
                fetchActivities();
            }
        } catch (error) {
            console.error('Error deleting activity:', error);
            showSnackbar('Failed to delete activity', 'error');
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Co-Scholastic Activities Configuration
            </Typography>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <TextField
                                select
                                label="Semester"
                                fullWidth
                                value={semester}
                                onChange={(e) => setSemester(e.target.value)}
                            >
                                {availableSemesters.map((sem) => (
                                    <MenuItem key={sem} value={sem}>{sem}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                select
                                label="Academic Year"
                                fullWidth
                                value={academicyear}
                                onChange={(e) => setAcademicyear(e.target.value)}
                            >
                                {availableYears.map((year) => (
                                    <MenuItem key={year} value={year}>{year}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<Add />}
                                onClick={() => handleOpenDialog()}
                                disabled={!semester || !academicyear}
                                fullWidth
                            >
                                Add Activity
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>



            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Activity Code</strong></TableCell>
                            <TableCell><strong>Activity Name</strong></TableCell>
                            <TableCell><strong>Description</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center">Loading...</TableCell>
                            </TableRow>
                        ) : activities.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center">No activities found</TableCell>
                            </TableRow>
                        ) : (
                            activities.map((activity) => (
                                <TableRow key={activity._id}>
                                    <TableCell>{activity.code || '-'}</TableCell>
                                    <TableCell>{activity.activityname}</TableCell>
                                    <TableCell>{activity.description}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleOpenDialog(activity)} color="primary">
                                            <Edit />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(activity._id)} color="error">
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{editMode ? 'Edit Activity' : 'Add New Activity'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Activity Code (Optional)"
                        fullWidth
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Activity Name"
                        fullWidth
                        value={formData.activityname}
                        onChange={(e) => setFormData({ ...formData, activityname: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSave} color="primary" variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

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

export default CoScholasticActivityConfigds;
