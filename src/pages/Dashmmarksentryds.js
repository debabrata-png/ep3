import ep1 from '../api/ep1';
import React, { useEffect, useState } from 'react';
import global1 from './global1';
import { Button, Box, Paper, Container, Grid, FormControl, InputLabel, Select, MenuItem, Typography, TextField } from '@mui/material';
import { DataGrid, GridCellEditStopReasons } from '@mui/x-data-grid';

function MarksEntryPage() {
    const [rows, setRows] = useState([]);
    
    // Filter cascade states
    const [filterData, setFilterData] = useState([]);
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [programs, setPrograms] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState('');
    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('');
    const [courseCodes, setCourseCodes] = useState([]);
    const [selectedCourseCode, setSelectedCourseCode] = useState('');
    const [examCodes, setExamCodes] = useState([]);
    const [selectedExamCode, setSelectedExamCode] = useState('');
    
    // Extracted Display names for saving
    const [selectedProgramName, setSelectedProgramName] = useState('');
    const [selectedCourseName, setSelectedCourseName] = useState('');

    // Tabulation configuration defaults
    const [thmax, setThmax] = useState('100');
    const [iatmax, setIatmax] = useState('50');

    const user = global1.user;
    const token = global1.token;
    const colid = global1.colid;
    const name = global1.name;

    const fetchFilters = async () => {
        try {
            const response = await ep1.get('/api/v2/getcoursefiltersformarks', { params: { colid } });
            if (response.data && response.data.data) {
                const data = response.data.data;
                setFilterData(data);
                const distinctYears = [...new Set(data.map(item => item.year).filter(Boolean))];
                setYears(distinctYears);
            }
        } catch (err) { console.error("Error fetching filters", err); }
    };

    useEffect(() => { 
        fetchFilters();
    }, []);

    const handleYearChange = (e) => {
        const y = e.target.value;
        setSelectedYear(y);
        setSelectedProgram(''); setSelectedSemester(''); setSelectedCourseCode(''); setSelectedExamCode('');
        
        const progs = [...new Set(filterData.filter(item => item.year === y).map(item => item.programcode).filter(Boolean))];
        setPrograms(progs);
    };

    const handleProgramChange = (e) => {
        const p = e.target.value;
        setSelectedProgram(p);
        setSelectedSemester(''); setSelectedCourseCode(''); setSelectedExamCode('');
        
        const sems = [...new Set(filterData.filter(item => item.year === selectedYear && item.programcode === p).map(item => item.semester).filter(Boolean))];
        setSemesters(sems);
        
        const rec = filterData.find(item => item.programcode === p);
        if (rec) setSelectedProgramName(rec.program);
    };

    const handleSemesterChange = (e) => {
        const s = e.target.value;
        setSelectedSemester(s);
        setSelectedCourseCode(''); setSelectedExamCode('');
        
        const cCodes = [...new Set(filterData.filter(item => item.year === selectedYear && item.programcode === selectedProgram && item.semester === s).map(item => item.coursecode).filter(Boolean))];
        setCourseCodes(cCodes);
    };

    const handleCourseChange = (e) => {
        const c = e.target.value;
        setSelectedCourseCode(c);
        setSelectedExamCode('');
        
        const exCodes = [...new Set(filterData.filter(item => item.year === selectedYear && item.programcode === selectedProgram && item.semester === selectedSemester && item.coursecode === c).map(item => item.examcode).filter(Boolean))];
        setExamCodes(exCodes);
        
        const rec = filterData.find(item => item.coursecode === c);
        if (rec) setSelectedCourseName(rec.course);
    };

    const handleLoadSheet = async () => {
        if (!selectedYear || !selectedExamCode || !selectedCourseCode || !selectedProgram) return;

        const response = await ep1.get('/api/v2/getmarksentrysheet', { 
            params: { colid, year: selectedYear, examcode: selectedExamCode, programcode: selectedProgram, semester: selectedSemester, coursecode: selectedCourseCode } 
        });
        setRows(response.data.data || []);
    };

    const handleSaveMarks = async () => {
        if (rows.length === 0) {
            alert('No marks data to save. Load students first.');
            return;
        }

        try {
            const payload = {
                colid, user, token,
                year: selectedYear,
                examcode: selectedExamCode,
                programcode: selectedProgram,
                program: selectedProgramName,
                semester: selectedSemester,
                coursecode: selectedCourseCode,
                course: selectedCourseName,
                thmax,
                iatmax,
                marksData: rows
            };

            const response = await ep1.post('/api/v2/savemarksentrysheet', payload);
            if (response.data && response.data.status === 'success') {
                alert(response.data.message);
            } else {
                alert('Save encountered an issue: ' + (response.data.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Error saving marks:', err);
            alert('Error saving marks.');
        }
    };

    const processRowUpdate = (newRow) => {
        // Ensure values being saved into DataGrid state are properly tracked
        const updatedRow = { ...newRow };
        setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    };

    const columns = [
        { field: 'name', headerName: 'Student Name', width: 220, editable: false },
        { field: 'regno', headerName: 'Reg No', width: 140, editable: false },
        { field: 'midtermscore', headerName: 'MidTerm Score', width: 130, editable: true, type: 'number', headerAlign: 'left', align: 'left' },
        { field: 'assignmentmarks', headerName: 'Assignment', width: 110, editable: true, type: 'number', headerAlign: 'left', align: 'left' },
        { field: 'presentationmarks', headerName: 'Presentation', width: 120, editable: true, type: 'number', headerAlign: 'left', align: 'left' },
        { field: 'testmarks', headerName: 'Test', width: 100, editable: true, type: 'number', headerAlign: 'left', align: 'left' },
        { field: 'attendancemarks', headerName: 'Attendance', width: 110, editable: true, type: 'number', headerAlign: 'left', align: 'left' },
        { field: 'extmarks', headerName: 'Ext Marks (or Absent)', width: 180, editable: true, headerAlign: 'left', align: 'left', description: 'Enter Absent instead of numbers if student was absent' },
    ];

    return (
        <React.Fragment>
            <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={4} marginTop={2}>
                    <Typography variant="h5">Marks Entry & Tabulation Prep</Typography>
                    <Button variant="contained" color="success" onClick={handleSaveMarks} size="large">Save All Marks to Tabulation</Button>
                </Box>
                
                <Paper elevation={5} sx={{ p: 2, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <FormControl sx={{ minWidth: 150 }}>
                        <InputLabel>Academic Year</InputLabel>
                        <Select value={selectedYear} onChange={handleYearChange} label="Academic Year">
                            {years.map((y, i) => <MenuItem key={i} value={y}>{y}</MenuItem>)}
                        </Select>
                    </FormControl>
                    
                    <FormControl sx={{ minWidth: 150 }} disabled={!selectedYear}>
                        <InputLabel>Program Code</InputLabel>
                        <Select value={selectedProgram} onChange={handleProgramChange} label="Program Code">
                            {programs.map((p, i) => <MenuItem key={i} value={p}>{p}</MenuItem>)}
                        </Select>
                    </FormControl>
                    
                    <FormControl sx={{ minWidth: 150 }} disabled={!selectedProgram}>
                        <InputLabel>Semester</InputLabel>
                        <Select value={selectedSemester} onChange={handleSemesterChange} label="Semester">
                            {semesters.map((s, i) => <MenuItem key={i} value={s}>{s}</MenuItem>)}
                        </Select>
                    </FormControl>
                    
                    <FormControl sx={{ minWidth: 150 }} disabled={!selectedSemester}>
                        <InputLabel>Course Code</InputLabel>
                        <Select value={selectedCourseCode} onChange={handleCourseChange} label="Course Code">
                            {courseCodes.map((c, i) => <MenuItem key={i} value={c}>{c}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 150 }} disabled={!selectedCourseCode}>
                        <InputLabel>Exam Code</InputLabel>
                        <Select value={selectedExamCode} onChange={(e) => setSelectedExamCode(e.target.value)} label="Exam Code">
                            {examCodes.map((ec, i) => <MenuItem key={i} value={ec}>{ec}</MenuItem>)}
                        </Select>
                    </FormControl>
                    
                    <Button variant="contained" color="primary" onClick={handleLoadSheet} disabled={!selectedExamCode} sx={{ ml: 'auto' }}>Load Students</Button>
                </Paper>

                <Paper elevation={5} sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Typography variant="body1" fontWeight="bold">Tabulation Configuration (exammarks1ds):</Typography>
                    <TextField label="Theory Max Marks (thmax)" variant="outlined" size="small" type="number" value={thmax} onChange={e => setThmax(e.target.value)} />
                    <TextField label="Internal Max Marks (iatmax)" variant="outlined" size="small" type="number" value={iatmax} onChange={e => setIatmax(e.target.value)} />
                </Paper>

                <Paper elevation={5} sx={{ height: 600, width: '100%' }}>
                    <DataGrid 
                        rows={rows} 
                        columns={columns}
                        processRowUpdate={processRowUpdate}
                        onProcessRowUpdateError={(error) => console.log('Row update error:', error)}
                        experimentalFeatures={{ newEditingApi: true }}
                        disableRowSelectionOnClick
                    />
                </Paper>
            </Container>
        </React.Fragment>
    );
}

export default MarksEntryPage;
