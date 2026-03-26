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
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TableSortLabel,
  InputAdornment,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Save, Download, Upload, Search } from '@mui/icons-material';
import ep1 from '../api/ep1';
import global1 from './global1';
import * as XLSX from 'xlsx';

const BulkMarksEntryPageds = () => {
  const [semester, setSemester] = useState('');
  const [academicyear, setAcademicyear] = useState('');
  const [section, setSection] = useState('');
  const [term, setTerm] = useState('term1');
  const [componentname, setComponentname] = useState('term1periodictest');
  const [remarksOptions, setRemarksOptions] = useState([]);

  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Dynamic options from User table
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);

  // Working Days State
  const [openWorkingDaysDialog, setOpenWorkingDaysDialog] = useState(false);
  const [workingDaysInput, setWorkingDaysInput] = useState('');
  const [existingWorkingDays, setExistingWorkingDays] = useState(0);
  // Inline editable working days (shown in filter bar when attendance component selected)
  const [workingDaysValue, setWorkingDaysValue] = useState('');

  // Search and Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'regno', direction: 'asc' });

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Component options
  const componentOptions = {
    term1: [
      { value: 'term1periodictest', label: 'Term I Periodic Test' },
      { value: 'term1notebook', label: 'Term I Notebook' },
      { value: 'term1enrichment', label: 'Term I Enrichment' },
      { value: 'term1midexam', label: 'Term I Mid Exam' },
      { value: 'term1totalpresentdays', label: 'Term I Present Days' }
    ],
    term2: [
      { value: 'term2periodictest', label: 'Term II Periodic Test' },
      { value: 'term2notebook', label: 'Term II Notebook' },
      { value: 'term2enrichment', label: 'Term II Enrichment' },
      { value: 'term2annualexam', label: 'Term II Annual Exam' },
      { value: 'term2totalpresentdays', label: 'Term II Present Days' }
    ]
  };
  const remarksOption = { value: 'teacherremarks', label: 'Teacher Remarks' };

  // Fetch semesters and years on component mount
  useEffect(() => {
    fetchSemestersAndYears();
  }, []);

  useEffect(() => {
    if (term === 'term1') {
      setComponentname('term1periodictest');
    } else if (term === 'term2') {
      setComponentname('term2periodictest');
    } else if (term === 'remarks') {
      setComponentname('teacherremarks');
    }
  }, [term]);

  useEffect(() => {
    if (semester) {
      fetchSections();
    }
  }, [semester]);

  useEffect(() => {
    if (semester && academicyear && term && componentname) {
      fetchData();
    }
  }, [semester, academicyear, term, componentname, section, debouncedSearchQuery]);

  const fetchSections = async () => {
    try {
      const response = await ep1.get('/api/v2/getdistinctsectionsbyclass9ds', {
        params: { colid: global1.colid, semester }
      });
      if (response.data.success) {
        setAvailableSections(response.data.sections || []);
        // Reset section if not in new list
        if (section && !response.data.sections.includes(section)) {
          setSection('');
        }
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchSemestersAndYears = async () => {
    try {
      const response = await ep1.get('/api/v2/getdistinctsemestersandyears9ds', {
        params: { colid: global1.colid }
      });

      if (response.data.success) {
        setAvailableSemesters(response.data.semesters);
        setAvailableYears(response.data.admissionyears);
        // Sections will be fetched by the useEffect on semester change

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

  const fetchRemarks = async () => {
    try {
      const response = await ep1.get('/api/v2/getremarksds', {
        params: { colid: global1.colid }
      });
      if (response.data.success) {
        setRemarksOptions(response.data.remarks || []);
      }
    } catch (error) {
      console.error('Error fetching remarks:', error);
    }
  };

  const fetchData = async () => {
    if (!componentname) return;
    setLoading(true);
    try {
      const response = await ep1.get('/api/v2/getstudentsandsubjectsformarks9ds', {
        params: {
          colid: global1.colid,
          semester,
          academicyear,
          section,
          term,
          componentname,
          search: debouncedSearchQuery
        }
      });

      if (response.data.success) {
        setStudents(response.data.students);
        setSubjects(response.data.subjects);

        // Build marks map from existing marks
        const existingMarks = response.data.existingmarks || [];
        const marksMap = {};

        // PRE-INITIALIZE the map for all students and subjects
        const fetchedStudents = response.data.students || [];
        fetchedStudents.forEach(s => {
          const allCols = (componentname.includes('presentdays')) ? [{ subjectcode: 'ATTENDANCE' }] : (response.data.subjects || []);
          allCols.forEach(sub => {
            const key = `${s.regno}_${sub.subjectcode}`;
            marksMap[key] = {
              value: '',
              isgrace: false,
              isabsent: false,
              teacherremarks: '',
              promotedclass: '',
              newsessiondate: '',
              status: 'active'
            };
          });
        });

        const componentToAbsentField = {
          'term1periodictest': 'term1periodictestabsent',
          'term1midexam': 'term1midexamabsent',
          'term2periodictest': 'term2periodictestabsent',
          'term2annualexam': 'term2annualexamabsent'
        };
        const currentAbsentField = componentToAbsentField[componentname];

        // Merge existing marks into the pre-initialized map (Note: backend for 9ds already uses obtainedmarks mapping)
        existingMarks.forEach(mark => {
          const key = `${mark.regno}_${mark.subjectcode}`;
          marksMap[key] = {
            ...(marksMap[key] || {}),
            value: mark.obtainedmarks !== undefined ? mark.obtainedmarks : '',
            isgrace: mark.isgrace || false,
            isabsent: mark.isabsent || false,
            teacherremarks: mark.teacherremarks || '',
            promotedclass: mark.promotedclass || '',
            newsessiondate: mark.newsessiondate ? mark.newsessiondate.split('T')[0] : '',
            status: mark.status || 'active'
          };
        });

        setMarksData(marksMap);

        // Check existing working days if it's an attendance component
        if (componentname.includes('presentdays')) {
          const isTerm1 = componentname.includes('term1');
          const workingDaysField = isTerm1 ? 'term1totalworkingdays' : 'term2totalworkingdays';

          let maxWorking = 0;
          if (response.data.existingmarks && response.data.existingmarks.length > 0) {
            // Find max working days among existing records to see if it's set
            response.data.existingmarks.forEach(m => {
              if (m[workingDaysField] > maxWorking) {
                maxWorking = m[workingDaysField];
              }
            });
          }
          setExistingWorkingDays(maxWorking);
          // Pre-fill inline field with existing value
          setWorkingDaysValue(maxWorking > 0 ? String(maxWorking) : '');
        } else {
          setExistingWorkingDays(0);
          setWorkingDaysValue('');
        }

        // Special handling for teacherremarks mode
        if (componentname === 'teacherremarks') {
          // If in remarks mode, we still need one 'dummy' subject to show the column per student
          // Or we can just let the existing subjects be, but typically one is enough
          // However, the current logic fetches ALL subjects. I'll leave it as is for now
          // so the table projects subjects, and the remarks column is appended.
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedStudents = React.useMemo(() => {
    let result = [...students];

    // Sort
    result.sort((a, b) => {
      let valA = a[sortConfig.key] || '';
      let valB = b[sortConfig.key] || '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [students, searchQuery, sortConfig]);

  const handleMarkChange = (regno, subjectcode, value) => {
    const key = `${regno}_${subjectcode}`;
    const current = marksData[key] || { value: '', isgrace: false, isabsent: false, status: 'active' };
    setMarksData({
      ...marksData,
      [key]: { ...current, value: value === '' ? '' : Number(value) }
    });
  };

  const handleGraceToggle = (regno, subjectcode, checked) => {
    const key = `${regno}_${subjectcode}`;
    const current = marksData[key] || { value: '', isgrace: false, isabsent: false, status: 'active' };
    setMarksData({
      ...marksData,
      [key]: { ...current, isgrace: checked }
    });
  };

  const handleAbsentToggle = (regno, subjectcode, checked) => {
    const key = `${regno}_${subjectcode}`;
    const current = marksData[key] || { value: '', isgrace: false, isabsent: false, status: 'active' };
    setMarksData({
      ...marksData,
      [key]: { ...current, isabsent: checked }
    });
  };

  const handleRemarkChange = (regno, remarkValue) => {
    const newMarksData = { ...marksData };
    subjects.forEach(subject => {
      const key = `${regno}_${subject.subjectcode}`;
      const current = newMarksData[key] || { value: '', isgrace: false, isabsent: false, status: 'active' };
      newMarksData[key] = { ...current, teacherremarks: remarkValue };
    });
    setMarksData(newMarksData);
  };

  const handlePromotionChange = (regno, promotedValue) => {
    const newMarksData = { ...marksData };
    subjects.forEach(subject => {
      const key = `${regno}_${subject.subjectcode}`;
      const current = newMarksData[key] || { value: '', isgrace: false, isabsent: false, status: 'active' };
      newMarksData[key] = { ...current, promotedclass: promotedValue };
    });
    setMarksData(newMarksData);
  };

  const handleSessionDateChange = (regno, dateValue) => {
    const newMarksData = { ...marksData };
    subjects.forEach(subject => {
      const key = `${regno}_${subject.subjectcode}`;
      const current = newMarksData[key] || { value: '', isgrace: false, isabsent: false, status: 'active' };
      newMarksData[key] = { ...current, newsessiondate: dateValue };
    });
    setMarksData(newMarksData);
  };

  const handleSaveMarks = async () => {
    // For attendance components, always include working days in payload
    if (componentname.includes('presentdays')) {
      const wdVal = Number(workingDaysValue);
      if (!workingDaysValue || wdVal <= 0) {
        // Fallback to dialog if inline field is empty
        setWorkingDaysInput('');
        setOpenWorkingDaysDialog(true);
        return;
      }
      const isTerm1 = componentname.includes('term1');
      const workingDaysField = isTerm1 ? 'term1totalworkingdays' : 'term2totalworkingdays';
      await submitMarks({ [workingDaysField]: wdVal });
      return;
    }

    await submitMarks();
  };

  const submitMarks = async (extraData = null) => {
    setSaving(true);
    try {
      // Prepare marks array
      const marksArray = [];

      students.forEach(student => {
        subjects.forEach(subject => {
          const key = `${student.regno}_${subject.subjectcode}`;
          const markEntry = marksData[key];

          if (markEntry && (
            markEntry.value !== undefined && markEntry.value !== '' ||
            markEntry.isgrace ||
            markEntry.isabsent ||
            markEntry.teacherremarks ||
            markEntry.promotedclass ||
            markEntry.newsessiondate
          )) {
            marksArray.push({
              regno: student.regno,
              studentname: student.name,
              subjectcode: subject.subjectcode,
              subjectname: subject.subjectname,
              obtained: markEntry.value === '' ? 0 : Number(markEntry.value),
              isgrace: markEntry.isgrace || false, // Include grace status
              isabsent: markEntry.isabsent || false, // Include absent status
              teacherremarks: markEntry.teacherremarks || '',
              promotedclass: markEntry.promotedclass || '',
              newsessiondate: markEntry.newsessiondate || '',
              status: markEntry.status || 'active'
            });
          }
        });
      });

      if (marksArray.length === 0) {
        showSnackbar('No marks to save', 'warning');
        setSaving(false);
        return;
      }

      const payload = {
        colid: Number(global1.colid),
        user: global1.user,
        semester,
        academicyear,
        componentname,
        marks: marksArray
      };

      if (extraData) {
        payload.extraUpdates = extraData;
      }

      const response = await ep1.post('/api/v2/bulksavemarksbycomponent9ds', payload);

      if (response.data.success) {
        showSnackbar(`Successfully saved ${marksArray.length} marks`, 'success');
        // Update local existing working days if we just set them
        if (extraData) {
          const isTerm1 = componentname.includes('term1');
          const workingDaysField = isTerm1 ? 'term1totalworkingdays' : 'term2totalworkingdays';
          if (extraData[workingDaysField]) {
            setExistingWorkingDays(extraData[workingDaysField]);
            setWorkingDaysValue(String(extraData[workingDaysField]));
          }
        }
        fetchData();
      }
    } catch (error) {
      console.error('Error saving marks:', error);
      showSnackbar('Failed to save marks', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleWorkingDaysConfirm = () => {
    if (!workingDaysInput || Number(workingDaysInput) <= 0) {
      showSnackbar('Please enter valid working days', 'error');
      return;
    }

    setOpenWorkingDaysDialog(false);
    // Sync the inline field with the dialog value
    setWorkingDaysValue(workingDaysInput);

    const isTerm1 = componentname.includes('term1');
    const workingDaysField = isTerm1 ? 'term1totalworkingdays' : 'term2totalworkingdays';

    submitMarks({ [workingDaysField]: Number(workingDaysInput) });
  };

  const handleDownloadTemplate = () => {
    const data = [];

    students.forEach(student => {
      subjects.forEach(subject => {
        const key = `${student.regno}_${subject.subjectcode}`;
        const markEntry = marksData[key];
        data.push({
          Regno: student.regno,
          StudentName: student.name,
          SubjectCode: subject.subjectcode,
          SubjectName: subject.subjectname,
          MaxMarks: subject.maxmarks,
          ObtainedMarks: markEntry?.value || '',
          IsGrace: markEntry?.isgrace ? 'Yes' : 'No',
          IsAbsent: markEntry?.isabsent ? 'Yes' : 'No'
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
            newMarksData[key] = {
              value: Number(row.ObtainedMarks),
              isgrace: row.IsGrace?.toLowerCase() === 'yes' || false,
              isabsent: row.IsAbsent?.toLowerCase() === 'yes' || false,
              status: 'active'
            };
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

  const getCellValue = (regno, subjectcode, field) => {
    const key = `${regno}_${subjectcode}`;
    return marksData[key]?.[field];
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
                <MenuItem value="remarks">Teacher Remarks</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Component"
                value={componentname}
                onChange={(e) => setComponentname(e.target.value)}
                disabled={term === 'remarks'}
                size="small"
              >
                {term !== 'remarks' && componentOptions[term]?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
                {term === 'remarks' && <MenuItem value="teacherremarks">Teacher Remarks</MenuItem>}
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
                <MenuItem value="">All Sections</MenuItem>
                {availableSections.map((sec) => (
                  <MenuItem key={sec} value={sec}>
                    {sec}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Inline Working Days field — visible only for attendance components */}
            {componentname.includes('presentdays') && (
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Total Working Days"
                  type="number"
                  value={workingDaysValue}
                  onChange={(e) => setWorkingDaysValue(e.target.value)}
                  inputProps={{ min: 1, step: 1 }}
                  helperText={existingWorkingDays > 0 ? `Currently set: ${existingWorkingDays}` : 'Required'}
                  error={!workingDaysValue || Number(workingDaysValue) <= 0}
                />
              </Grid>
            )}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Search Students"
                placeholder="Search by Name, Reg No, or Roll No"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
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
                <TableCell sx={{ fontWeight: 'bold', minWidth: 120, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 3 }}>
                  <TableSortLabel
                    active={sortConfig.key === 'regno'}
                    direction={sortConfig.key === 'regno' ? sortConfig.direction : 'asc'}
                    onClick={() => handleRequestSort('regno')}
                  >
                    Reg No
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 200, position: 'sticky', left: 120, bgcolor: 'background.paper', zIndex: 3 }}>
                  <TableSortLabel
                    active={sortConfig.key === 'name'}
                    direction={sortConfig.key === 'name' ? sortConfig.direction : 'asc'}
                    onClick={() => handleRequestSort('name')}
                  >
                    Student Name
                  </TableSortLabel>
                </TableCell>
                {componentname !== 'teacherremarks' && subjects.map(subject => (
                  <TableCell key={subject.subjectcode} sx={{ fontWeight: 'bold', minWidth: 120 }}>
                    {subject.subjectname}
                    <Chip label={`Max: ${subject.maxmarks}`} size="small" sx={{ ml: 1 }} />
                  </TableCell>
                ))}
                {componentname === 'teacherremarks' && (
                  <TableCell sx={{ fontWeight: 'bold', minWidth: 300 }}>
                    Teacher Remarks
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedStudents.map(student => (
                <TableRow key={student.regno}>
                  <TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                    {student.regno}
                  </TableCell>
                  <TableCell sx={{ position: 'sticky', left: 120, bgcolor: 'background.paper', zIndex: 1 }}>
                    {student.name}
                  </TableCell>
                  {componentname !== 'teacherremarks' && subjects.map(subject => {
                    const key = `${student.regno}_${subject.subjectcode}`;
                    const markEntry = marksData[key] || { value: '', isgrace: false, isabsent: false, status: 'active' };
                    const value = markEntry.value;
                    const isGrace = markEntry.isgrace;
                    const isAbsent = markEntry.isabsent;
                    const maxMarks = componentname.includes('presentdays')
                      ? (Number(workingDaysValue) || (subject.maxmarks || 500))
                      : subject.maxmarks;
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
                        {(componentname === "term2annualexam" || !(componentname.toLowerCase().includes('notebook') || componentname.toLowerCase().includes('enrichment') || componentname.toLowerCase().includes('presentdays'))) && (
                          <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column' }}>
                            {componentname === "term2annualexam" && (
                              <FormControlLabel
                                control={
                                  <Switch
                                    size="small"
                                    checked={isGrace}
                                    onChange={(e) => handleGraceToggle(student.regno, subject.subjectcode, e.target.checked)}
                                    color="secondary"
                                  />
                                }
                                label={<Typography variant="caption" sx={{ fontSize: '0.6rem' }}>Grace</Typography>}
                                labelPlacement="end"
                                sx={{ m: 0 }}
                              />
                            )}
                            {!(componentname.toLowerCase().includes('notebook') || componentname.toLowerCase().includes('enrichment') || componentname.toLowerCase().includes('presentdays')) && (
                              <FormControlLabel
                                control={
                                  <Switch
                                    size="small"
                                    checked={isAbsent}
                                    onChange={(e) => handleAbsentToggle(student.regno, subject.subjectcode, e.target.checked)}
                                    color="error"
                                  />
                                }
                                label={<Typography variant="caption" sx={{ fontSize: '0.6rem' }}>Absent</Typography>}
                                labelPlacement="end"
                                sx={{ m: 0 }}
                              />
                            )}
                          </Box>
                        )}
                      </TableCell>
                    );
                  })}
                  {componentname === 'teacherremarks' && (
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <TextField
                          fullWidth
                          multiline
                          maxRows={3}
                          size="small"
                          placeholder="Enter Remarks"
                          label="Teacher Remarks"
                          value={subjects.length > 0 ? (marksData[`${student.regno}_${subjects[0].subjectcode}`]?.teacherremarks || '') : ''}
                          onChange={(e) => handleRemarkChange(student.regno, e.target.value)}
                          sx={{ minWidth: 250 }}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Promoted to Class"
                          label="Promoted to Class"
                          value={subjects.length > 0 ? (marksData[`${student.regno}_${subjects[0].subjectcode}`]?.promotedclass || '') : ''}
                          onChange={(e) => handlePromotionChange(student.regno, e.target.value)}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          type="date"
                          label="Session Start On"
                          InputLabelProps={{ shrink: true }}
                          value={subjects.length > 0 ? (marksData[`${student.regno}_${subjects[0].subjectcode}`]?.newsessiondate || '') : ''}
                          onChange={(e) => handleSessionDateChange(student.regno, e.target.value)}
                        />
                      </Box>
                    </TableCell>
                  )}
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

      {/* Working Days Dialog */}
      <Dialog open={openWorkingDaysDialog} onClose={() => setOpenWorkingDaysDialog(false)}>
        <DialogTitle>Enter Total Working Days</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Total working days data is missing for this term. Please enter the total working days to save with the attendance.
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

export default BulkMarksEntryPageds;
