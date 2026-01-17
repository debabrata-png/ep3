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
  Divider,
  MenuItem
} from '@mui/material';
import { Search, Print } from '@mui/icons-material';
import ep1 from '../api/ep1';
import global1 from './global1';

const StudentMarksheetViewPageds = () => {
  const [regno, setRegno] = useState('');
  const [semester, setSemester] = useState('');
  const [academicyear, setAcademicyear] = useState('');
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Dynamic options from User table
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch semesters and years on component mount
  useEffect(() => {
    fetchSemestersAndYears();
  }, []);

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

  const fetchMarks = async () => {
    if (!regno) {
      showSnackbar('Please enter registration number', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await ep1.get('/api/v2/getstudentmarks9ds', {
        params: { 
          colid: global1.colid, 
          regno, 
          semester, 
          academicyear 
        }
      });
      
      if (response.data.success) {
        setMarks(response.data.data);
        if (response.data.data.length === 0) {
          showSnackbar('No marks found for this student', 'info');
        }
      }
    } catch (error) {
      console.error('Error fetching marks:', error);
      showSnackbar('Failed to fetch marks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
        Student Marksheet View (Class 9-10)
      </Typography>

      {/* Search Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Registration Number"
                value={regno}
                onChange={(e) => setRegno(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchMarks()}
              />
            </Grid>
            <Grid item xs={12} md={2}>
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
            <Grid item xs={12} md={2}>
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
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={fetchMarks}
                disabled={loading || !semester || !academicyear}
                fullWidth
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Marksheet Display */}
      {marks.length > 0 && (
        <Card>
          <CardContent>
            {/* Student Info */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5">
                {marks[0].studentname} - {marks[0].regno}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Class: {semester} | Academic Year: {academicyear}
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Term 1 Marks */}
            <Typography variant="h6" gutterBottom color="primary">
              Term I Marks
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Subject</strong></TableCell>
                    <TableCell align="center"><strong>Periodic Test</strong></TableCell>
                    <TableCell align="center"><strong>Notebook</strong></TableCell>
                    <TableCell align="center"><strong>Enrichment</strong></TableCell>
                    <TableCell align="center"><strong>Mid Exam</strong></TableCell>
                    <TableCell align="center"><strong>Total (100)</strong></TableCell>
                    <TableCell align="center"><strong>Grade</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {marks.map(mark => (
                    <TableRow key={mark._id}>
                      <TableCell>{mark.subjectname}</TableCell>
                      <TableCell align="center">{mark.term1periodictestobtained || '-'}</TableCell>
                      <TableCell align="center">{mark.term1notebookobtained || '-'}</TableCell>
                      <TableCell align="center">{mark.term1enrichmentobtained || '-'}</TableCell>
                      <TableCell align="center">{mark.term1midexamobtained || '-'}</TableCell>
                      <TableCell align="center"><strong>{mark.term1total || 0}</strong></TableCell>
                      <TableCell align="center">
                        <Chip label={mark.term1grade || 'N/A'} color="primary" size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Term 2 Marks */}
            <Typography variant="h6" gutterBottom color="primary">
              Term II Marks
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Subject</strong></TableCell>
                    <TableCell align="center"><strong>Periodic Test</strong></TableCell>
                    <TableCell align="center"><strong>Notebook</strong></TableCell>
                    <TableCell align="center"><strong>Enrichment</strong></TableCell>
                    <TableCell align="center"><strong>Annual Exam</strong></TableCell>
                    <TableCell align="center"><strong>Total (100)</strong></TableCell>
                    <TableCell align="center"><strong>Grade</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {marks.map(mark => (
                    <TableRow key={mark._id}>
                      <TableCell>{mark.subjectname}</TableCell>
                      <TableCell align="center">{mark.term2periodictestobtained || '-'}</TableCell>
                      <TableCell align="center">{mark.term2notebookobtained || '-'}</TableCell>
                      <TableCell align="center">{mark.term2enrichmentobtained || '-'}</TableCell>
                      <TableCell align="center">{mark.term2annualexamobtained || '-'}</TableCell>
                      <TableCell align="center"><strong>{mark.term2total || 0}</strong></TableCell>
                      <TableCell align="center">
                        <Chip label={mark.term2grade || 'N/A'} color="secondary" size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Print Button */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" startIcon={<Print />} onClick={handlePrint}>
                Print Marksheet
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Snackbar */}
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

export default StudentMarksheetViewPageds;
