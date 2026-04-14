import { TextField, Button, Box, Card, CardContent, Typography, Container, MenuItem, Select, InputLabel, FormControl, Stack, Grid, CircularProgress, Alert, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import ListAltIcon from '@mui/icons-material/ListAlt';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TimeSlotForm() {
    const [data, setData] = useState({
        day: '',
        startTime: '',
        endTime: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [slots, setSlots] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);

    // Keeping original logic for colid
    const colid = -global1.colid;

    const fetchSlots = async () => {
        setTableLoading(true);
        try {
            const res = await ep1.get(`/ttGetTimeSlots?colid=${colid}`);
            setSlots(res.data.map(s => ({ ...s, id: s._id })));
        } catch (error) {
            console.error("Error fetching time slots:", error);
        } finally {
            setTableLoading(false);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, []);
  
    const submit = async () => {
        setLoading(true);
        setSuccess(false);
        try {
            await ep1.post('/ttAddTimeSlot', { colid, ...data });
            setSuccess(true);
            setData({ day: '', startTime: '', endTime: '' });
            fetchSlots();
        } catch (error) {
            console.error("Error adding time slot:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this time slot?")) {
            try {
                await ep1.get(`/ttDeleteTimeSlot?id=${id}`);
                fetchSlots();
            } catch (error) {
                console.error("Error deleting time slot:", error);
            }
        }
    };

    const processRowUpdate = async (newRow) => {
        try {
            const { id, ...updateData } = newRow;
            await ep1.post('/ttUpdateTimeSlot', { _id: id, ...updateData });
            fetchSlots();
            return newRow;
        } catch (error) {
            console.error("Error updating time slot:", error);
            return newRow;
        }
    };

    const columns = [
        { field: 'day', headerName: 'Day', width: 150, editable: true, type: 'singleSelect', valueOptions: DAYS },
        { field: 'startTime', headerName: 'Start Time', width: 150, editable: true },
        { field: 'endTime', headerName: 'End Time', width: 150, editable: true },
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
            <Card elevation={6} sx={{ borderRadius: 3, background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', maxWidth: 600, mx: 'auto', width: '100%' }}>
                <Box sx={{ p: 3, background: 'linear-gradient(90deg, #1976d2 0%, #0d47a1 100%)', color: 'white' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <AccessTimeIcon fontSize="large" />
                        <Typography variant="h5" fontWeight="bold">Manage Time Slots</Typography>
                    </Stack>
                </Box>
                <CardContent sx={{ p: 4 }}>
                    {success && <Alert severity="success" sx={{ mb: 3 }}>Time slot saved successfully!</Alert>}
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Day</InputLabel>
                                <Select
                                    value={data.day}
                                    onChange={e => setData({ ...data, day: e.target.value })}
                                    label="Day"
                                >
                                    {DAYS.map((day) => (
                                        <MenuItem key={day} value={day}>
                                            {day}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Start Time"
                                type="time"
                                InputLabelProps={{ shrink: true }}
                                value={data.startTime}
                                onChange={e => setData({ ...data, startTime: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="End Time"
                                type="time"
                                InputLabelProps={{ shrink: true }}
                                value={data.endTime}
                                onChange={e => setData({ ...data, endTime: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={submit}
                                disabled={loading || !data.day || !data.startTime || !data.endTime}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                sx={{
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
                                {loading ? 'Saving...' : 'Save Time Slot'}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card elevation={4} sx={{ borderRadius: 3 }}>
                <Box sx={{ p: 2, background: '#f5f5f5', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ListAltIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">Saved Time Slots</Typography>
                </Box>
                <Box sx={{ height: 400, width: '100%' }}>
                    <DataGrid
                        rows={slots}
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