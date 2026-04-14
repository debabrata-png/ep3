import { TextField, Button, Box, Card, CardContent, Typography, Container, Stack, Grid, CircularProgress, Alert, InputAdornment, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import BookIcon from '@mui/icons-material/Book';
import SchoolIcon from '@mui/icons-material/School';
import LayersIcon from '@mui/icons-material/Layers';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewListIcon from '@mui/icons-material/ViewList';

export default function TSubjectLoadForm() {
    const [data, setData] = useState({
        facultyId: '',
        subject: '',
        program: '',
        semester: '',
        classesPerWeek: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [loads, setLoads] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);

    const colid = global1.colid;

    const fetchLoads = async () => {
        setTableLoading(true);
        try {
            const res = await ep1.get(`/ttGetSubjectLoads?colid=${colid}`);
            setLoads(res.data.map(l => ({ ...l, id: l._id })));
        } catch (error) {
            console.error("Error fetching subject loads:", error);
        } finally {
            setTableLoading(false);
        }
    };

    useEffect(() => {
        fetchLoads();
    }, []);
  
    const submit = async () => {
        setLoading(true);
        setSuccess(false);
        try {
            await ep1.post('/ttAddSubjectLoad', { colid, ...data });
            setSuccess(true);
            setData({
                facultyId: '',
                subject: '',
                program: '',
                semester: '',
                classesPerWeek: ''
            });
            fetchLoads();
        } catch (error) {
            console.error("Error adding subject load:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this subject load?")) {
            try {
                await ep1.get(`/ttDeleteSubjectLoad?id=${id}`);
                fetchLoads();
            } catch (error) {
                console.error("Error deleting subject load:", error);
            }
        }
    };

    const processRowUpdate = async (newRow) => {
        try {
            const { id, ...updateData } = newRow;
            await ep1.post('/ttUpdateSubjectLoad', { _id: id, ...updateData });
            fetchLoads();
            return newRow;
        } catch (error) {
            console.error("Error updating subject load:", error);
            return newRow;
        }
    };

    const columns = [
        { field: 'facultyId', headerName: 'Faculty ID', width: 120, editable: true },
        { field: 'subject', headerName: 'Subject', flex: 1, editable: true },
        { field: 'program', headerName: 'Program', width: 120, editable: true },
        { field: 'semester', headerName: 'Sem', width: 80, editable: true },
        { field: 'classesPerWeek', headerName: 'L/W', width: 80, editable: true, type: 'number' },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            renderCell: (params) => (
                <IconButton onClick={() => handleDelete(params.id)} color="error">
                    <DeleteIcon />
                </IconButton>
            ),
        },
    ];
  
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Stack spacing={4}>
            <Card elevation={6} sx={{ borderRadius: 3, background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', maxWidth: 800, mx: 'auto', width: '100%' }}>
                <Box sx={{ p: 3, background: 'linear-gradient(90deg, #1976d2 0%, #0d47a1 100%)', color: 'white' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <AssignmentIcon fontSize="large" />
                        <Typography variant="h5" fontWeight="bold">Faculty Subject Assignment</Typography>
                    </Stack>
                </Box>
                <CardContent sx={{ p: 4 }}>
                    {success && <Alert severity="success" sx={{ mb: 3 }}>Subject load assigned successfully!</Alert>}
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Faculty ID"
                                placeholder="e.g. 6050..."
                                value={data.facultyId}
                                onChange={e => setData({ ...data, facultyId: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Subject Name"
                                placeholder="e.g. Mathematics"
                                value={data.subject}
                                onChange={e => setData({ ...data, subject: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <BookIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Program"
                                placeholder="e.g. B.Tech"
                                value={data.program}
                                onChange={e => setData({ ...data, program: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SchoolIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Semester"
                                placeholder="e.g. 4"
                                value={data.semester}
                                onChange={e => setData({ ...data, semester: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LayersIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Classes per Week"
                                type="number"
                                placeholder="e.g. 4"
                                value={data.classesPerWeek}
                                onChange={e => setData({ ...data, classesPerWeek: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EventRepeatIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={submit}
                                    disabled={loading || Object.values(data).some(v => !v)}
                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                    sx={{
                                        px: 6,
                                        py: 1.5,
                                        borderRadius: 2,
                                        fontWeight: 'bold',
                                        background: 'linear-gradient(90deg, #1976d2 0%, #0d47a1 100%)',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                                        },
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    {loading ? 'Saving...' : 'Save Assignment'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card elevation={4} sx={{ borderRadius: 3 }}>
                <Box sx={{ p: 2, background: '#f5f5f5', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ViewListIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">Subject Load List</Typography>
                </Box>
                <Box sx={{ height: 400, width: '100%' }}>
                    <DataGrid
                        rows={loads}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        loading={tableLoading}
                        processRowUpdate={processRowUpdate}
                        experimentalFeatures={{ newEditingApi: true }}
                        disableRowSelectionOnClick
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-cell:focus': {
                                outline: 'none',
                            },
                        }}
                    />
                </Box>
            </Card>
        </Stack>
      </Container>
    );
}