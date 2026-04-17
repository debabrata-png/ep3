import ep1 from '../api/ep1';
import React, { useEffect, useState } from 'react';
import global1 from './global1';
import { Button, Box, Paper, Container, Grid, Switch, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AddUserModal from './Addmexamattendanceds';
import AddUserModalBulk from './Addmexamattendancebulkds';
import ExportUserModal from './Export';
import { DataGrid } from '@mui/x-data-grid';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';

function ViewPage() {
    const [rows, setRows] = useState([]);
    const [results, setResults] = useState([]);
    const [second, setSecond] = useState([]);
    const [openAdd, setOpenAdd] = useState(false);
    const [openAddBulk, setOpenAddBulk] = useState(false);
    const [openExport, setOpenExport] = useState(false);
    const [newUser, setNewUser] = useState({});

    // Filter states
    const [filterData, setFilterData] = useState([]);
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [examCodes, setExamCodes] = useState([]);
    const [selectedExamCode, setSelectedExamCode] = useState('');
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState('');

    const user = global1.user;
    const token = global1.token;
    const colid = global1.colid;
    const name = global1.name;

    const toggleAttendance = async (e, row) => {
        const isPresentNow = e.target.checked;
        
        // Optimistic UI update
        const updatedRows = rows.map(r => r._id === row._id ? { ...r, ispresent: isPresentNow ? 'true' : 'false' } : r);
        setRows(updatedRows);
        
        await ep1.post('/api/v2/upsertattendance', {
            colid, user, token, name,
            studentname: row.studentname, studentregno: row.studentregno,
            program: row.program, programcode: row.programcode,
            course: row.course, coursecode: row.coursecode,
            exam: row.exam, examcode: row.examcode, year: row.year,
            roomname: row.roomname, buildingname: row.buildingname,
            examdate: row.examdate, examtime: row.examtime,
            ispresent: isPresentNow
        });
        getgraphdata();
        getgraphdatasecond();
    };

    const columns = [
        { field: 'studentname', headerName: 'Student Name', width: 180 },
        { field: 'studentregno', headerName: 'Reg No', width: 130 },
        { field: 'program', headerName: 'Program', width: 150 },
        { field: 'course', headerName: 'Course', width: 150 },
        { field: 'exam', headerName: 'Exam', width: 150 },
        { field: 'year', headerName: 'Year', width: 100 },
        { field: 'roomname', headerName: 'Room', width: 120 },
        { field: 'buildingname', headerName: 'Building', width: 120 },
        { field: 'ispresent', headerName: 'Attendance', width: 130, renderCell: (params) => (
            <Box display="flex" alignItems="center">
                <Switch 
                    checked={params.row.ispresent === 'true' || params.row.ispresent === true}
                    onChange={(e) => toggleAttendance(e, params.row)}
                    color="success"
                />
                <Typography variant="body2">{params.row.ispresent === 'true' || params.row.ispresent === true ? 'Present' : 'Absent'}</Typography>
            </Box>
        ) }
    ];

    const fetchFilters = async () => {
        try {
            const response = await ep1.get('/api/v2/getexamadmitfilters', { params: { colid } });
            if (response.data && response.data.data) {
                const data = response.data.data;
                setFilterData(data);
                const distinctYears = [...new Set(data.map(item => item.year).filter(Boolean))];
                setYears(distinctYears);
            }
        } catch (err) { console.error(err); }
    };

    const fetchRooms = async () => {
        try {
            const response = await ep1.get('/api/v2/getexamroomdsrecords', {
                params: { colid, user, token, name }
            });
            if (response.data && response.data.data && response.data.data.classes) {
                setRooms(response.data.data.classes);
            }
        } catch (error) {
            console.error("Error fetching rooms", error);
        }
    };

    const fetchViewPage = async () => {
        // Pass filter arguments to narrow down the attendance list
        const response = await ep1.get('/api/v2/getexamroomattendancelist', { 
            params: { token, colid, user, year: selectedYear, examcode: selectedExamCode, exam: selectedExam, roomname: selectedRoom } 
        });
        setRows(response.data.data || []);
    };

    const getgraphdata = async () => {
        const response = await ep1.get('/api/v2/getexamattendancedscountbyyear', { params: { token, colid, user } });
        setResults(response.data.data.classes || []);
    };

    const getgraphdatasecond = async () => {
        const response = await ep1.get('/api/v2/getexamattendancedscountbyprogram', { params: { token, colid, user } });
        setSecond(response.data.data.classes || []);
    };

    useEffect(() => { 
        fetchFilters();
        fetchRooms();
        getgraphdata(); 
        getgraphdatasecond(); 
    }, []);

    useEffect(() => {
        fetchViewPage();
    }, [selectedYear, selectedExamCode, selectedExam, selectedRoom]);

    const handleYearChange = (e) => {
        const y = e.target.value;
        setSelectedYear(y);
        setSelectedExamCode('');
        setSelectedExam('');
        const codesForYear = [...new Set(filterData.filter(item => item.year === y).map(item => item.examcode).filter(Boolean))];
        setExamCodes(codesForYear);
    };

    const handleExamCodeChange = (e) => {
        const excode = e.target.value;
        setSelectedExamCode(excode);
        setSelectedExam('');
        const examsForCode = [...new Set(filterData.filter(item => item.year === selectedYear && item.examcode === excode).map(item => item.exam).filter(Boolean))];
        setExams(examsForCode);
    };

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'ExamAttendanceDS');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, 'ExamAttendanceDS_data.xlsx');
        setOpenExport(false);
    };

    return (
        <React.Fragment>
            <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" marginBottom={4} marginTop={2}>
                    <Button variant="contained" color="success" style={{ padding: '5px 10px', marginRight: '4px', fontSize: '12px', height: '30px', width: '80px' }} onClick={() => setOpenAdd(true)}>Add</Button>
                    <Button variant="contained" color="success" style={{ padding: '5px 10px', marginRight: '4px', fontSize: '12px', height: '30px', width: '80px' }} onClick={() => setOpenAddBulk(true)}>Bulk</Button>
                    <Button variant="contained" color="primary" style={{ padding: '5px 10px', fontSize: '12px', marginRight: '4px', height: '30px', width: '80px' }} onClick={() => setOpenExport(true)}>Export</Button>
                    <Button onClick={() => { fetchViewPage(); getgraphdata(); getgraphdatasecond(); }} variant="contained" color="secondary" style={{ padding: '5px 10px', fontSize: '12px', height: '30px', width: '80px' }}>Refresh</Button>
                </Box>
                
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <div style={{ textAlign: 'center' }}>Program wise count</div><br />
                        <BarChart xAxis={[{ id: 'barCategories', data: second.map((l) => l._id || ''), scaleType: 'band', colorMap: { type: 'piecewise', thresholds: [], colors: ['#F6C179', '#C27F1D', '#A6B0A3', '#EDDBAC', '#A6DAEE'] } }]} series={[{ data: second.map((l) => parseInt(l.total_attendance)) }]} width={500} height={300} />
                    </Grid>
                    <Grid item xs={6}>
                        <div style={{ textAlign: 'center' }}>Year wise count</div><br />
                        <PieChart colors={['#D1A3B4', '#BBD1A3', '#A3C4D1', '#EDDBAC', '#A6DAEE']} series={[{ data: results.map((l, i) => ({ id: i, value: parseInt(l.total_attendance), label: l._id || '' })) }]} width={400} height={250} />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Paper elevation={5} sx={{ p: 2, mb: 3, display: 'flex', gap: 2 }}>
                            <FormControl sx={{ minWidth: 150 }}>
                                <InputLabel>Academic Year</InputLabel>
                                <Select value={selectedYear} onChange={handleYearChange} label="Academic Year">
                                    <MenuItem value=""><em>All</em></MenuItem>
                                    {years.map((y, i) => <MenuItem key={i} value={y}>{y}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <FormControl sx={{ minWidth: 150 }} disabled={!selectedYear}>
                                <InputLabel>Exam Code</InputLabel>
                                <Select value={selectedExamCode} onChange={handleExamCodeChange} label="Exam Code">
                                    <MenuItem value=""><em>All</em></MenuItem>
                                    {examCodes.map((c, i) => <MenuItem key={i} value={c}>{c}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <FormControl sx={{ minWidth: 150 }} disabled={!selectedExamCode}>
                                <InputLabel>Exam</InputLabel>
                                <Select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} label="Exam">
                                    <MenuItem value=""><em>All</em></MenuItem>
                                    {exams.map((ex, i) => <MenuItem key={i} value={ex}>{ex}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <FormControl sx={{ minWidth: 200 }}>
                                <InputLabel>Exam Room</InputLabel>
                                <Select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} label="Exam Room">
                                    <MenuItem value=""><em>All Rooms</em></MenuItem>
                                    {rooms.map((r, i) => <MenuItem key={i} value={r.roomname}>{r.roomname} ({r.buildingname})</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Paper>
                        
                        <Paper elevation={5} sx={{ p: 2, display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <DataGrid getRowId={(row) => row._id} rows={rows} columns={columns}
                                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                                pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick />
                            <AddUserModal open={openAdd} handleClose={() => setOpenAdd(false)} />
                            <AddUserModalBulk open={openAddBulk} handleClose={() => setOpenAddBulk(false)} />
                            <ExportUserModal open={openExport} handleClose={() => setOpenExport(false)} handleExport={handleExport} />
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </React.Fragment>
    );
}

export default ViewPage;
