import { TextField, Button, Box, Card, CardContent, Typography, Container, MenuItem, Select, InputLabel, FormControl, Chip, Stack, CircularProgress, Alert, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TFacultyForm() {
  const [name, setName] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [faculties, setFaculties] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  const colid = global1.colid;

  const fetchFaculties = async () => {
    setTableLoading(true);
    try {
      const res = await ep1.get(`/ttGetFaculties?colid=${colid}`);
      setFaculties(res.data.map(f => ({ ...f, id: f._id })));
    } catch (error) {
      console.error("Error fetching faculties:", error);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  const submit = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      await ep1.post('/ttAddFaculty', {
        name,
        colid,
        availableDays: selectedDays
      });
      setSuccess(true);
      setName('');
      setSelectedDays([]);
      fetchFaculties();
    } catch (error) {
      console.error("Error adding faculty:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this faculty?")) {
      try {
        await ep1.get(`/ttDeleteFaculty?id=${id}`);
        fetchFaculties();
      } catch (error) {
        console.error("Error deleting faculty:", error);
      }
    }
  };

  const processRowUpdate = async (newRow) => {
    try {
      const { id, ...updateData } = newRow;
      await ep1.post('/ttUpdateFaculty', { _id: id, ...updateData });
      fetchFaculties();
      return newRow;
    } catch (error) {
      console.error("Error updating faculty:", error);
      return newRow;
    }
  };

  const columns = [
    { field: 'name', headerName: 'Faculty Name', flex: 1, editable: true },
    { 
      field: 'availableDays', 
      headerName: 'Available Days', 
      flex: 1.5, 
      editable: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {params.value.map((day) => (
            <Chip key={day} label={day} size="small" variant="outlined" />
          ))}
        </Box>
      ),
      // Note: Editing complex types like arrays in DataGrid simple setup is tricky,
      // but we'll enable editable:true for the text representation if needed.
    },
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
              <PersonAddIcon fontSize="large" />
              <Typography variant="h5" fontWeight="bold">Faculty Registration</Typography>
            </Stack>
          </Box>
          <CardContent sx={{ p: 4 }}>
            {success && <Alert severity="success" sx={{ mb: 3 }}>Faculty registered successfully!</Alert>}
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Faculty Name"
                variant="outlined"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter full name"
              />

              <FormControl fullWidth variant="outlined">
                <InputLabel>Available Days</InputLabel>
                <Select
                  multiple
                  value={selectedDays}
                  onChange={e => setSelectedDays(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                  label="Available Days"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} color="primary" variant="outlined" size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {DAYS.map((day) => (
                    <MenuItem key={day} value={day}>
                      {day}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={submit}
                disabled={loading || !name || selectedDays.length === 0}
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
                {loading ? 'Saving...' : 'Register Faculty'}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Card elevation={4} sx={{ borderRadius: 3 }}>
          <Box sx={{ p: 2, background: '#f5f5f5', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">Faculty List</Typography>
          </Box>
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={faculties}
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