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
  MenuItem
} from '@mui/material';
import { Save, Download, Upload } from '@mui/icons-material';
import ep1 from '../api/ep1';
import global1 from './global1';
import * as XLSX from 'xlsx';

const BulkMarksEntryPageds = () => {
  const [semester, setSemester] = useState('');
  const [academicyear, setAcademicyear] = useState('');
  const [term, setTerm] = useState('term1');
  const [componentname, setComponentname] = useState('term1periodictest');
  
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Dynamic options from User table
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Component options
  const componentOptions = {
    term1: [
      { value: 'term1periodictest', label: 'Term I Periodic Test' },
      { value: 'term1notebook', label: 'Term I Notebook' },
      { value: 'term1enrichment', label: 'Term I Enrichment' },
      { value: 'term1midexam', label: 'Term I Mid Exam' }
    ],
    term2: [
      { value: 'term2periodictest', label: 'Term II Periodic Test' },
      { value: 'term2notebook', label: 'Term II Notebook' },
      { value: 'term2enrichment', label: 'Term II Enrichment' },
      { value: 'term2annualexam', label: 'Term II Annual Exam' }
    ]
  };

  // Fetch semesters and years on component mount
  useEffect(() => {
    fetchSemestersAndYears();
  }, []);

  useEffect(() => {
    if (term === 'term1') {
      setComponentname('term1periodictest');
    } else {
      setComponentname('term2periodictest');
    }
  }, [term]);

  useEffect(() => {
    if (semester && academicyear && term && componentname) {
      fetchData();
    }
  }, [semester, academicyear, term, componentname]);

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await ep1.get('/api/v2/getstudentsandsubjectsformarks9ds', {
        params: { 
          colid: global1.colid, 
          semester, 
          academicyear, 
          term, 
          componentname 
        }
      });
      
      if (response.data.success) {
        setStudents(response.data.students);
        setSubjects(response.data.subjects);
        
        // Build marks map from existing marks
        const existingMarks = response.data.existingmarks || [];
        const marksMap = {};
        
        existingMarks.forEach(mark => {
          const key = `${mark.regno}_${mark.subjectcode}`;
          marksMap[key] = mark.obtainedmarks || 0;
        });
        
        setMarksData(marksMap);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (regno, subjectcode, value) => {
    const key = `${regno}_${subjectcode}`;
    setMarksData({
      ...marksData,
      [key]: value === '' ? '' : Number(value)
    });
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    try {
      // Prepare marks array
      const marksArray = [];
      
      students.forEach(student => {
        subjects.forEach(subject => {
          const key = `${student.regno}_${subject.subjectcode}`;
          const obtained = marksData[key];
          
          if (obtained !== undefined && obtained !== '') {
            marksArray.push({
              regno: student.regno,
              studentname: student.name,
              subjectcode: subject.subjectcode,
              subjectname: subject.subjectname,
              obtained: Number(obtained)
            });
          }
        });
      });

      if (marksArray.length === 0) {
        showSnackbar('No marks to save', 'warning');
        setSaving(false);
        return;
      }

      const response = await ep1.post('/api/v2/bulksavemarksbycomponent9ds', {
        colid: Number(global1.colid),
        user: global1.user,
        semester,
        academicyear,
        componentname,
        marks: marksArray
      });

      if (response.data.success) {
        showSnackbar(`Successfully saved ${marksArray.length} marks`, 'success');
        fetchData();
      }
    } catch (error) {
      console.error('Error saving marks:', error);
      showSnackbar('Failed to save marks', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadTemplate = () => {
    const data = [];
    
    students.forEach(student => {
      subjects.forEach(subject => {
        const key = `${student.regno}_${subject.subjectcode}`;
        data.push({
          Regno: student.regno,
          StudentName: student.name,
          SubjectCode: subject.subjectcode,
          SubjectName: subject.subjectname,
          MaxMarks: subject.maxmarks,
          ObtainedMarks: marksData[key] || ''
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Marks');
    XLSX.writeFile(wb, `${componentname}_${semester}_${academicyear}.xlsx`);
  };

  const handleUploadExcel = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const newMarksData = { ...marksData };
        
        jsonData.forEach(row => {
          const key = `${row.Regno}_${row.SubjectCode}`;
          if (row.ObtainedMarks !== undefined && row.ObtainedMarks !== '') {
            newMarksData[key] = Number(row.ObtainedMarks);
          }
        });

        setMarksData(newMarksData);
        showSnackbar('Excel data uploaded successfully', 'success');
      } catch (error) {
        console.error('Error reading Excel:', error);
        showSnackbar('Failed to read Excel file', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
    
    // Reset file input
    event.target.value = '';
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
        Bulk Marks Entry (Class 9-10)
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
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
              <TextField
                select
                fullWidth
                label="Term"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              >
                <MenuItem value="term1">Term 1</MenuItem>
                <MenuItem value="term2">Term 2</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Component"
                value={componentname}
                onChange={(e) => setComponentname(e.target.value)}
              >
                {componentOptions[term].map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={handleDownloadTemplate}
                  disabled={loading || students.length === 0}
                  size="small"
                >
                  Excel
                </Button>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<Upload />}
                  disabled={loading}
                  size="small"
                >
                  Upload
                  <input
                    type="file"
                    hidden
                    accept=".xlsx,.xls"
                    onChange={handleUploadExcel}
                  />
                </Button>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                  onClick={handleSaveMarks}
                  disabled={loading || saving || students.length === 0}
                >
                  Save
                </Button>
              </Box>
            </Grid>
          </Grid>
          
          {subjects.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                <strong>Active Subjects:</strong> {subjects.length} subjects | <strong>Students:</strong> {students.length}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Marks Entry Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : students.length === 0 || subjects.length === 0 ? (
        <Alert severity="info">No data available. Please configure subjects first.</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 100, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 3 }}>
                  Reg No
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 150, position: 'sticky', left: 100, bgcolor: 'background.paper', zIndex: 3 }}>
                  Student Name
                </TableCell>
                {subjects.map(subject => (
                  <TableCell key={subject.subjectcode} sx={{ fontWeight: 'bold', minWidth: 120 }}>
                    {subject.subjectname}
                    <Chip label={`Max: ${subject.maxmarks}`} size="small" sx={{ ml: 1 }} />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map(student => (
                <TableRow key={student.regno}>
                  <TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                    {student.regno}
                  </TableCell>
                  <TableCell sx={{ position: 'sticky', left: 100, bgcolor: 'background.paper', zIndex: 1 }}>
                    {student.name}
                  </TableCell>
                  {subjects.map(subject => {
                    const key = `${student.regno}_${subject.subjectcode}`;
                    const value = marksData[key] || '';
                    const maxMarks = subject.maxmarks;
                    const isInvalid = value !== '' && (Number(value) < 0 || Number(value) > maxMarks);

                    return (
                      <TableCell key={subject.subjectcode}>
                        <TextField
                          type="number"
                          size="small"
                          value={value}
                          onChange={(e) => handleMarkChange(student.regno, subject.subjectcode, e.target.value)}
                          inputProps={{ min: 0, max: maxMarks, step: 0.5 }}
                          error={isInvalid}
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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

export default BulkMarksEntryPageds;
