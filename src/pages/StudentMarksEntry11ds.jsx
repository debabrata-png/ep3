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
    MenuItem,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TableSortLabel,
    InputAdornment,
    Switch,
    FormControlLabel
} from '@mui/material';
import { Save, Search } from '@mui/icons-material';
import ep1 from '../api/ep1';
import global1 from './global1';

const StudentMarksEntry11ds = () => {
    const [semester, setSemester] = useState('11');
    const [academicyear, setAcademicyear] = useState('2025-2026');
    const [section, setSection] = useState('');

    // Filter States for Dropdown approach
    const [term, setTerm] = useState('unit');
    const [component, setComponent] = useState('unitpremidobtain');

    // Data states
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [marksMap, setMarksMap] = useState({}); // Map of regno-subjectcode -> FULL marks object

    // Working Days Dialog
    const [openWorkingDaysDialog, setOpenWorkingDaysDialog] = useState(false);
    const [workingDaysInput, setWorkingDaysInput] = useState('');

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Search and Sort State
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [remarksOptions, setRemarksOptions] = useState([]);

    // Debounce search query
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500); // 500ms debounce

        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Dynamic options
    const [availableSemesters, setAvailableSemesters] = useState([]);
    const [availableYears, setAvailableYears] = useState([]);
    const [availableSections, setAvailableSections] = useState([]);

    // Component configurations matching backend model fields
    const componentOptions = {
        unit: [
            { value: 'unitpremidobtain', label: 'Pre-Mid (Unit)' },
            { value: 'unitpostmidobtain', label: 'Post-Mid (Unit)' }
        ],
        halfyearly: [
            { value: 'halfyearlythobtain', label: 'Theory (Half Yearly)' },
            { value: 'halfyearlypracticalobtain', label: 'Practical (Half Yearly)' }
        ],
        annual: [
            { value: 'annualthobtain', label: 'Theory (Annual)' },
            { value: 'annualpracticalobtain', label: 'Practical (Annual)' }
        ],
        attendance: [
            { value: 'term1totalpresentdays', label: 'Term I Present Days' },
            { value: 'term2totalpresentdays', label: 'Term II Present Days' }
        ]
    };

    // Mapping for Max Marks fields in Subject Config
    const maxMarksMap = {
        'unitpremidobtain': 'unitpremid',
        'unitpostmidobtain': 'unitpostmid',
        'halfyearlythobtain': 'halfyearlyth',
        'halfyearlypracticalobtain': 'halfyearlypractical',
        'annualthobtain': 'annualth',
        'annualpracticalobtain': 'annualpractical',
        'term1totalpresentdays': '',
        'term2totalpresentdays': ''
    };

    useEffect(() => {
        fetchSemestersAndYears();
    }, []);

    // Re-fetch sections from User table whenever semester changes
    useEffect(() => {
        if (semester) {
            fetchSectionsBySemester(semester);
        }
    }, [semester]);

    // Auto-select first component when term changes
    useEffect(() => {
        if (term === 'remarks') {
            setComponent('teacherremarks');
        } else if (componentOptions[term] && componentOptions[term].length > 0) {
            setComponent(componentOptions[term][0].value);
        }
    }, [term]);

    useEffect(() => {
        // Wait until section is fetched before fetching data
        if (semester && academicyear && section) {
            fetchData();
        }
    }, [semester, academicyear, section, debouncedSearchQuery, term, component]); // Add term and component if they affect rendering

    const fetchSemestersAndYears = async () => {
        try {
            const response = await ep1.get('/api/v2/getdistinctsemestersandyears9ds', {
                params: { colid: global1.colid }
            });
            if (response.data.success) {
                setAvailableSemesters(response.data.semesters || []);
                setAvailableYears(response.data.admissionyears || []);
                // Sections will be fetched dynamically via fetchSectionsBySemester
            }
        } catch (error) {
            console.error('Error fetching semesters/years:', error);
            showSnackbar('Failed to fetch filter data', 'error');
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
                if (secs.length > 0 && (!section || !secs.includes(section))) {
                    setSection(secs[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await ep1.get('/api/v2/getstudentsandsubjectsformarks11ds', {
                params: {
                    colid: global1.colid,
                    semester,
                    academicyear,
                    section,
                    term, // Pass term to backend
                    search: debouncedSearchQuery
                }
            });

            if (response.data.success) {
                setStudents(response.data.students || []);
                const fetchedSubjects = response.data.subjects || [];
                setSubjects(fetchedSubjects);

                // Process existing marks
                const marks = response.data.marks || [];
                const newMarksMap = {};

                // PRE-INITIALIZE the map for all students and subjects to ensure colid/semester/etc are present
                const fetchedStudents = response.data.students || [];
                fetchedStudents.forEach(s => {
                    const allCols = (term === 'attendance') ? [{ subjectcode: 'ATTENDANCE', subjectname: 'ATTENDANCE' }] : fetchedSubjects;
                    allCols.forEach(sub => {
                        const key = `${s.regno}_${sub.subjectcode}`;
                        newMarksMap[key] = {
                            colid: Number(global1.colid),
                            regno: s.regno,
                            semester,
                            academicyear,
                            section,
                            subjectcode: sub.subjectcode,
                            subjectname: sub.subjectname || sub.name || '',
                            studentname: s.name,
                            user: global1.user,
                            teacherremarks: '',
                            promotedclass: '',
                            newsessiondate: ''
                        };
                    });
                });

                const componentToAbsentField = {
                    'unitpremidobtain': 'unitpremidabsent',
                    'unitpostmidobtain': 'unitpostmidabsent',
                    'halfyearlythobtain': 'halfyearlythabsent',
                    'halfyearlypracticalobtain': 'halfyearlypracticalabsent',
                    'annualthobtain': 'annualthabsent',
                    'annualpracticalobtain': 'annualpracticalabsent'
                };
                const currentAbsentField = componentToAbsentField[component];

                // Merge existing marks into the pre-initialized map
                marks.forEach(m => {
                    let codeToUse = m.subjectcode;
                    const matchedSub = fetchedSubjects.find(sub => 
                        sub.subjectcode === m.subjectcode || 
                        (sub.subjectname && sub.subjectname.toUpperCase() === String(m.subjectcode).toUpperCase())
                    );
                    if (matchedSub) {
                        codeToUse = matchedSub.subjectcode;
                    }

                    const key = `${m.regno}_${codeToUse}`;
                    newMarksMap[key] = {
                        ...(newMarksMap[key] || {}), // Keep pre-initialized fields
                        ...m,
                        isgrace: m.isgrace || false,
                        isabsent: currentAbsentField ? (m[currentAbsentField] || false) : false,
                        teacherremarks: m.teacherremarks || '',
                        promotedclass: m.promotedclass || '',
                        newsessiondate: m.newsessiondate ? m.newsessiondate.split('T')[0] : ''
                    };
                });
                setMarksMap(newMarksMap);
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

            // Special handling for rollno if it's numeric in string form
            if (sortConfig.key === 'rollno') {
                const numA = parseInt(valA) || 0;
                const numB = parseInt(valB) || 0;
                if (numA !== numB) return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [students, searchQuery, sortConfig]);

    const handleMarkChange = (regno, subject, field, value) => {
        const subcode = subject.subjectcode;
        const key = `${regno}_${subcode}`;
        const existing = marksMap[key] || {};

        const componentToAbsentField = {
            'unitpremidobtain': 'unitpremidabsent',
            'unitpostmidobtain': 'unitpostmidabsent',
            'halfyearlythobtain': 'halfyearlythabsent',
            'halfyearlypracticalobtain': 'halfyearlypracticalabsent',
            'annualthobtain': 'annualthabsent',
            'annualpracticalobtain': 'annualpracticalabsent'
        };

        const updateData = {
            ...existing,
            regno,
            colid: global1.colid,
            semester,
            academicyear,
            section,
            studentname: existing.studentname || students.find(s => s.regno === regno)?.name,
            subjectcode: subject.subjectcode,
            subjectname: subject.subjectname,
            user: global1.user,
            [field]: value
        };

        if (field === 'isabsent') {
            const specificAbsentField = componentToAbsentField[component];
            if (specificAbsentField) {
                updateData[specificAbsentField] = value;
            }
        }

        setMarksMap(prev => ({
            ...prev,
            [key]: updateData
        }));
    };

    const handleRemarkChange = (regno, remarkValue) => {
        const newMarksMap = { ...marksMap };
        const cols = term === 'attendance' ? [{ subjectcode: 'ATTENDANCE' }] : subjects;
        cols.forEach(sub => {
            const key = `${regno}_${sub.subjectcode}`;
            const existing = newMarksMap[key] || {};
            newMarksMap[key] = {
                ...existing,
                regno,
                colid: global1.colid,
                semester,
                academicyear,
                section,
                teacherremarks: remarkValue
            };
        });
        setMarksMap(newMarksMap);
    };

    const handlePromotionChange = (regno, promoValue) => {
        const newMarksMap = { ...marksMap };
        const cols = term === 'attendance' ? [{ subjectcode: 'ATTENDANCE' }] : subjects;
        cols.forEach(sub => {
            const key = `${regno}_${sub.subjectcode}`;
            const existing = newMarksMap[key] || {};
            newMarksMap[key] = {
                ...existing,
                regno,
                colid: global1.colid,
                semester,
                academicyear,
                section,
                promotedclass: promoValue
            };
        });
        setMarksMap(newMarksMap);
    };

    const handleSessionDateChange = (regno, dateValue) => {
        const newMarksMap = { ...marksMap };
        const cols = term === 'attendance' ? [{ subjectcode: 'ATTENDANCE' }] : subjects;
        cols.forEach(sub => {
            const key = `${regno}_${sub.subjectcode}`;
            const existing = newMarksMap[key] || {};
            newMarksMap[key] = {
                ...existing,
                regno,
                colid: global1.colid,
                semester,
                academicyear,
                section,
                newsessiondate: dateValue
            };
        });
        setMarksMap(newMarksMap);
    };

    const handleSave = async () => {
        // If Attendance, check for Working Days
        if (term === 'attendance') {
            // We can ask user to input it once.
            setOpenWorkingDaysDialog(true);
            return;
        }
        await submitMarks();
    };

    const submitMarks = async (extraData = null) => {
        setSaving(true);
        try {
            let payloadMarks = [];

            if (term === 'attendance') {
                // Construct payload for attendance
                // We will send a special subjectcode 'ATTENDANCE' to backend
                const workingDaysField = component === 'term1totalpresentdays' ? 'term1totalworkingdays' : 'term2totalworkingdays';
                const workingDaysVal = extraData ? extraData.workingDays : 0;

                payloadMarks = students.map(s => {
                    const key = `${s.regno}_ATTENDANCE`;
                    const markObj = marksMap[key] || {};
                    const attVal = markObj[component];

                    if (attVal !== undefined && attVal !== '') {
                        const payload = {
                            colid: global1.colid,
                            regno: s.regno,
                            semester: semester,
                            academicyear: academicyear,
                            name: s.name, // Use student listing for name
                            studentname: s.name,
                            user: global1.user,
                            subjectcode: 'ATTENDANCE', // Special code
                            [component]: attVal,
                            [workingDaysField]: workingDaysVal
                        };
                        return payload;
                    }
                    return null;
                }).filter(Boolean);
                console.log('Attendance Payload:', payloadMarks);

            } else {
                // Send all loaded marks data to ensure consistency
                payloadMarks = Object.values(marksMap);
            }

            if (payloadMarks.length === 0) {
                showSnackbar('No marks/data to save', 'warning');
                setSaving(false);
                return;
            }

            const response = await ep1.post('/api/v2/savemarks11ds', { marksData: payloadMarks });

            if (response.data.success) {
                showSnackbar('Saved successfully', 'success');
                fetchData(); // Refresh to recalculate
            }
        } catch (error) {
            console.error('Error saving marks:', error);
            showSnackbar('Failed to save marks', 'error');
        } finally {
            setSaving(false);
            setOpenWorkingDaysDialog(false);
        }
    };

    const handleWorkingDaysConfirm = () => {
        if (!workingDaysInput || Number(workingDaysInput) <= 0) {
            showSnackbar('Please enter valid working days', 'error');
            return;
        }
        submitMarks({ workingDays: Number(workingDaysInput) });
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Helper to get value
    const getVal = (regno, subjectcode, field = component) => {
        const key = `${regno}_${subjectcode}`;
        const val = marksMap[key]?.[field];
        return (val !== undefined && val !== null) ? val : '';
    };

    // Determine header columns
    const columns = term === 'attendance'
        ? [{ subjectcode: 'ATTENDANCE', subjectname: 'Attendance' }]
        : subjects;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Class 11 & 12 Marks Entry
            </Typography>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        {/* Filters Row 1 */}
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
                                label="Section"
                                value={section}
                                onChange={(e) => setSection(e.target.value)}
                            >
                                {availableSections.map((sec) => (
                                    <MenuItem key={sec} value={sec}>{sec}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Filters Row 2 - Component Selection */}
                        <Grid item xs={12} md={2}>
                            <TextField
                                select
                                fullWidth
                                label="Term"
                                value={term}
                                onChange={(e) => setTerm(e.target.value)}
                            >
                                <MenuItem value="unit">Unit Test</MenuItem>
                                <MenuItem value="halfyearly">Half Yearly</MenuItem>
                                <MenuItem value="annual">Annual</MenuItem>
                                <MenuItem value="attendance">Attendance</MenuItem>
                                <MenuItem value="remarks">Teacher Remarks</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={2}>
                            <TextField
                                select
                                fullWidth
                                label="Component"
                                value={component}
                                onChange={(e) => setComponent(e.target.value)}
                                disabled={term === 'remarks'}
                            >
                                {term !== 'remarks' && componentOptions[term]?.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                                {term === 'remarks' && <MenuItem value="teacherremarks">Teacher Remarks</MenuItem>}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Search Students"
                                placeholder="Search Name/Reg No/Roll No"
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

                        <Grid item xs={12} md={1} sx={{ textAlign: 'right' }}>
                            <Button
                                variant="contained"
                                startIcon={<Save />}
                                onClick={handleSave}
                                disabled={loading || saving || students.length === 0}
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ maxHeight: '70vh' }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ backgroundColor: '#e0e0e0', zIndex: 10, minWidth: 200, fontWeight: 'bold' }}>
                                    <TableSortLabel
                                        active={sortConfig.key === 'name'}
                                        direction={sortConfig.key === 'name' ? sortConfig.direction : 'asc'}
                                        onClick={() => handleRequestSort('name')}
                                    >
                                        Student Info (Name)
                                    </TableSortLabel>
                                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                cursor: 'pointer',
                                                color: sortConfig.key === 'rollno' ? 'primary.main' : 'text.secondary',
                                                fontWeight: sortConfig.key === 'rollno' ? 'bold' : 'normal',
                                                '&:hover': { textDecoration: 'underline' }
                                            }}
                                            onClick={() => handleRequestSort('rollno')}
                                        >
                                            Sort by Roll No
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                cursor: 'pointer',
                                                color: sortConfig.key === 'regno' ? 'primary.main' : 'text.secondary',
                                                fontWeight: sortConfig.key === 'regno' ? 'bold' : 'normal',
                                                '&:hover': { textDecoration: 'underline' }
                                            }}
                                            onClick={() => handleRequestSort('regno')}
                                        >
                                            Sort by Reg No
                                        </Typography>
                                    </Box>
                                </TableCell>
                                {component !== 'teacherremarks' && columns.map((subject) => (
                                    <TableCell
                                        key={subject.subjectcode}
                                        align="center"
                                        sx={{ backgroundColor: '#f5f5f5', minWidth: 100, borderLeft: '1px solid #ddd' }}
                                    >
                                        <Box sx={{ fontWeight: 'bold' }}>{subject.subjectname}</Box>
                                        {term !== 'attendance' && (
                                            <>
                                                <Typography variant="caption" color="textSecondary">{subject.subjectcode}</Typography>
                                                <Typography variant="caption" display="block" color="primary" sx={{ mt: 0.5 }}>
                                                    Max: {subject[maxMarksMap[component]] || '-'}
                                                </Typography>
                                            </>
                                        )}
                                     </TableCell>
                                 ))}
                                 {component === 'teacherremarks' && (
                                     <TableCell align="center" sx={{ backgroundColor: '#f5f5f5', minWidth: 250, borderLeft: '1px solid #ddd' }}>
                                         <Box sx={{ fontWeight: 'bold' }}>Teacher Remarks</Box>
                                     </TableCell>
                                 )}
                             </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAndSortedStudents.map((student) => (
                                <TableRow key={student.regno} hover>
                                    <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: '#fff', zIndex: 5, borderRight: '1px solid #eee' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{student.name}</Typography>
                                         <Typography variant="caption" color="textSecondary">{student.rollno} | {student.regno}</Typography>
                                     </TableCell>
                                     {component !== 'teacherremarks' && columns.map((subject) => (
                                         <TableCell key={`${student.regno}-${subject.subjectcode}`} align="center" sx={{ borderLeft: '1px solid #ddd', p: 1 }}>
                                             <TextField
                                                 size="small"
                                                 type="number"
                                                 variant="outlined"
                                                 value={getVal(student.regno, subject.subjectcode)}
                                                 onChange={(e) => handleMarkChange(student.regno, subject, component, e.target.value)}
                                                 inputProps={{
                                                     style: { textAlign: 'center', padding: '5px' }
                                                 }}
                                                 sx={{
                                                     width: '80px',
                                                     '& .MuiOutlinedInput-root': {
                                                         '& fieldset': { borderColor: getVal(student.regno, subject.subjectcode) ? '#1976d2' : '#e0e0e0' }
                                                     }
                                                 }}
                                             />
                                             <Box sx={{ mt: 1 }}>
                                                 {(term === 'annual' && (component === 'annualthobtain' || component === 'annualpracticalobtain')) && (
                                                     <FormControlLabel
                                                         control={
                                                             <Switch
                                                                 size="small"
                                                                 checked={getVal(student.regno, subject.subjectcode, 'isgrace') || false}
                                                                 onChange={(e) => handleMarkChange(student.regno, subject, 'isgrace', e.target.checked)}
                                                                 color="secondary"
                                                             />
                                                         }
                                                         label={<Typography variant="caption" sx={{ fontSize: '0.6rem' }}>Grace</Typography>}
                                                         labelPlacement="end"
                                                         sx={{ m: 0 }}
                                                     />
                                                 )}
                                                 {term !== 'attendance' && (
                                                     <FormControlLabel
                                                         control={
                                                             <Switch
                                                                 size="small"
                                                                 checked={getVal(student.regno, subject.subjectcode, 'isabsent') || false}
                                                                 onChange={(e) => handleMarkChange(student.regno, subject, 'isabsent', e.target.checked)}
                                                                 color="error"
                                                             />
                                                         }
                                                         label={<Typography variant="caption" sx={{ fontSize: '0.6rem' }}>Absent</Typography>}
                                                         labelPlacement="end"
                                                         sx={{ m: 0, ml: (term === 'annual' && (component === 'annualthobtain' || component === 'annualpracticalobtain')) ? 1 : 0 }}
                                                     />
                                                 )}
                                             </Box>
                                         </TableCell>
                                     ))}
                                     {component === 'teacherremarks' && (
                                         <TableCell align="center" sx={{ borderLeft: '1px solid #ddd', p: 1 }}>
                                             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                 <TextField
                                                     fullWidth
                                                     multiline
                                                     maxRows={3}
                                                     size="small"
                                                     label="Teacher Remarks"
                                                     placeholder="Enter Remarks"
                                                     value={columns.length > 0 ? (marksMap[`${student.regno}_${columns[0].subjectcode}`]?.teacherremarks || '') : ''}
                                                     onChange={(e) => handleRemarkChange(student.regno, e.target.value)}
                                                     sx={{ minWidth: 250 }}
                                                 />
                                                 <Box sx={{ display: 'flex', gap: 1 }}>
                                                     <TextField
                                                         fullWidth
                                                         size="small"
                                                         label="Promoted to Class"
                                                         value={columns.length > 0 ? (marksMap[`${student.regno}_${columns[0].subjectcode}`]?.promotedclass || '') : ''}
                                                         onChange={(e) => handlePromotionChange(student.regno, e.target.value)}
                                                     />
                                                     <TextField
                                                         type="date"
                                                         fullWidth
                                                         size="small"
                                                         label="Session Start On"
                                                         InputLabelProps={{ shrink: true }}
                                                         value={columns.length > 0 ? (marksMap[`${student.regno}_${columns[0].subjectcode}`]?.newsessiondate || '') : ''}
                                                         onChange={(e) => handleSessionDateChange(student.regno, e.target.value)}
                                                     />
                                                 </Box>
                                             </Box>
                                         </TableCell>
                                     )}
                                 </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Working Days Dialog */}
            <Dialog open={openWorkingDaysDialog} onClose={() => setOpenWorkingDaysDialog(false)}>
                <DialogTitle>Enter Total Working Days</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter the total working days for this term to save with the attendance.
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

export default StudentMarksEntry11ds;
