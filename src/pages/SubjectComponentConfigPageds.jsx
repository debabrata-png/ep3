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
  FormControlLabel,
  Switch,
  Grid,
  Alert,
  Snackbar,
  MenuItem
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import ep1 from '../api/ep1';
import global1 from './global1';

const SubjectComponentConfigPageds = () => {
  const [semester, setSemester] = useState('');
  const [academicyear, setAcademicyear] = useState('');
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Dynamic options from User table
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    subjectcode: '',
    subjectname: '',
    semester: '',
    academicyear: '',
    term1periodictestmax: 10,
    term1notebookmax: 5,
    term1enrichmentmax: 5,
    term1midexammax: 80,
    term2periodictestmax: 10,
    term2notebookmax: 5,
    term2enrichmentmax: 5,
    term2annualexammax: 80,
    term1periodictestactive: true,
    term1notebookactive: true,
    term1enrichmentactive: true,
    term1midexamactive: true,
    term2periodictestactive: true,
    term2notebookactive: true,
    term2enrichmentactive: true,
    term2annualexamactive: true,
    isactive: true
  });

  // Fetch semesters and years on component mount
  useEffect(() => {
    fetchSemestersAndYears();
  }, []);

  useEffect(() => {
    if (semester && academicyear) {
      fetchConfigs();
    }
  }, [semester, academicyear]);

  const fetchSemestersAndYears = async () => {
    try {
      const response = await ep1.get('/api/v2/getdistinctsemestersandyears9ds', {
        params: { colid: global1.colid }
      });
      
      if (response.data.success) {
        setAvailableSemesters(response.data.semesters);
        setAvailableYears(response.data.admissionyears);
        
        // Set default values
        if (response.data.semesters.length > 0) {
          setSemester(response.data.semesters[0]);
        }
        if (response.data.admissionyears.length > 0) {
          setAcademicyear(response.data.admissionyears[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching semesters and years:', error);
      showSnackbar('Failed to fetch semesters and years', 'error');
    }
  };

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const response = await ep1.get('/api/v2/listsubjectconfig9ds', {
        params: { 
          colid: global1.colid, 
          semester, 
          academicyear 
        }
      });
      if (response.data.success) {
        setConfigs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching configs:', error);
      showSnackbar('Failed to fetch configurations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (config = null) => {
    if (config) {
      setFormData(config);
      setEditMode(true);
    } else {
      setFormData({
        subjectcode: '',
        subjectname: '',
        semester: semester,
        academicyear: academicyear,
        term1periodictestmax: 10,
        term1notebookmax: 5,
        term1enrichmentmax: 5,
        term1midexammax: 80,
        term2periodictestmax: 10,
        term2notebookmax: 5,
        term2enrichmentmax: 5,
        term2annualexammax: 80,
        term1periodictestactive: true,
        term1notebookactive: true,
        term1enrichmentactive: true,
        term1midexamactive: true,
        term2periodictestactive: true,
        term2notebookactive: true,
        term2enrichmentactive: true,
        term2annualexamactive: true,
        isactive: true
      });
      setEditMode(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
  };

  const handleSave = async () => {
    if (!formData.subjectcode || !formData.subjectname) {
      showSnackbar('Please fill subject code and name', 'warning');
      return;
    }

    try {
      const response = await ep1.post(
        '/api/v2/createorupdatesubjectconfig9ds',
        formData,
        {
          params: {
            colid: global1.colid,
            user: global1.user
          }
        }
      );
      
      if (response.data.success) {
        showSnackbar(response.data.message, 'success');
        fetchConfigs();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error saving config:', error);
      showSnackbar('Failed to save configuration', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this configuration?')) return;

    try {
      const response = await ep1.get('/api/v2/deletesubjectconfig9ds', {
        params: { id }
      });
      
      if (response.data.success) {
        showSnackbar('Configuration deleted successfully', 'success');
        fetchConfigs();
      }
    } catch (error) {
      console.error('Error deleting config:', error);
      showSnackbar('Failed to delete configuration', 'error');
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
        Subject Component Configuration (Class 9-10)
      </Typography>

      {/* Filters */}
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
                {availableSemesters.map((sem) => (
                  <MenuItem key={sem} value={sem}>
                    {sem}
                  </MenuItem>
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
                {availableYears.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                fullWidth
                disabled={!semester || !academicyear}
              >
                Add Subject
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Configs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Subject Code</strong></TableCell>
              <TableCell><strong>Subject Name</strong></TableCell>
              <TableCell><strong>Term 1 Components</strong></TableCell>
              <TableCell><strong>Term 2 Components</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Loading...</TableCell>
              </TableRow>
            ) : configs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No configurations found</TableCell>
              </TableRow>
            ) : (
              configs.map((config) => (
                <TableRow key={config._id}>
                  <TableCell>{config.subjectcode}</TableCell>
                  <TableCell>{config.subjectname}</TableCell>
                  <TableCell>
                    {config.term1periodictestactive && `PT(${config.term1periodictestmax}) `}
                    {config.term1notebookactive && `NB(${config.term1notebookmax}) `}
                    {config.term1enrichmentactive && `EN(${config.term1enrichmentmax}) `}
                    {config.term1midexamactive && `ME(${config.term1midexammax})`}
                  </TableCell>
                  <TableCell>
                    {config.term2periodictestactive && `PT(${config.term2periodictestmax}) `}
                    {config.term2notebookactive && `NB(${config.term2notebookmax}) `}
                    {config.term2enrichmentactive && `EN(${config.term2enrichmentmax}) `}
                    {config.term2annualexamactive && `AE(${config.term2annualexammax})`}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(config)}
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(config._id)}
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog remains same as before */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Subject Configuration' : 'Add Subject Configuration'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Subject Code"
                value={formData.subjectcode}
                onChange={(e) => setFormData({ ...formData, subjectcode: e.target.value })}
                disabled={editMode}
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

            {/* Term 1 Components */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" sx={{ mt: 2 }}>Term 1 Components</Typography>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Periodic Test Max"
                value={formData.term1periodictestmax}
                onChange={(e) => setFormData({ ...formData, term1periodictestmax: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.term1periodictestactive}
                    onChange={(e) => setFormData({ ...formData, term1periodictestactive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Notebook Max"
                value={formData.term1notebookmax}
                onChange={(e) => setFormData({ ...formData, term1notebookmax: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.term1notebookactive}
                    onChange={(e) => setFormData({ ...formData, term1notebookactive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Enrichment Max"
                value={formData.term1enrichmentmax}
                onChange={(e) => setFormData({ ...formData, term1enrichmentmax: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.term1enrichmentactive}
                    onChange={(e) => setFormData({ ...formData, term1enrichmentactive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Mid Exam Max"
                value={formData.term1midexammax}
                onChange={(e) => setFormData({ ...formData, term1midexammax: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.term1midexamactive}
                    onChange={(e) => setFormData({ ...formData, term1midexamactive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>

            {/* Term 2 Components */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" sx={{ mt: 2 }}>Term 2 Components</Typography>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Periodic Test Max"
                value={formData.term2periodictestmax}
                onChange={(e) => setFormData({ ...formData, term2periodictestmax: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.term2periodictestactive}
                    onChange={(e) => setFormData({ ...formData, term2periodictestactive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Notebook Max"
                value={formData.term2notebookmax}
                onChange={(e) => setFormData({ ...formData, term2notebookmax: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.term2notebookactive}
                    onChange={(e) => setFormData({ ...formData, term2notebookactive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Enrichment Max"
                value={formData.term2enrichmentmax}
                onChange={(e) => setFormData({ ...formData, term2enrichmentmax: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.term2enrichmentactive}
                    onChange={(e) => setFormData({ ...formData, term2enrichmentactive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Annual Exam Max"
                value={formData.term2annualexammax}
                onChange={(e) => setFormData({ ...formData, term2annualexammax: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.term2annualexamactive}
                    onChange={(e) => setFormData({ ...formData, term2annualexamactive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

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

export default SubjectComponentConfigPageds;
