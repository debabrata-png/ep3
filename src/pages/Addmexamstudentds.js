import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Select, MenuItem, InputLabel, FormControl, Autocomplete } from '@mui/material';
import ep1 from '../api/ep1';
import global1 from '../pages/global1';

function AddUserModal({ open, handleClose, handleInputChange, handleAddUser, newUser }) {
    const examdateref = useRef();
    const examtimeref = useRef();

    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');

    const [filterData, setFilterData] = useState([]);
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [examCodes, setExamCodes] = useState([]);
    const [selectedExamCode, setSelectedExamCode] = useState('');
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');

    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);

    const colid = global1.colid;
    const user = global1.user;
    const name = global1.name;
    const token = global1.token;

    useEffect(() => {
        if (open) {
            fetchFilters();
            fetchRooms();
        }
    }, [open]);

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

    const loadStudents = async () => {
        try {
            if (!selectedExamCode && !selectedYear) return;
            const response = await ep1.get('/api/v2/getexamadmitstudentsds', {
                params: { colid: colid, examcode: selectedExamCode, year: selectedYear }
            });
            if (response.data.status === 'success') {
                setStudents(response.data.data.students);
            }
        } catch (err) { console.error(err); }
    };

    const searchapi = async () => {
        const student = students.find(s => s.regno === selectedStudent);
        if (!student) { alert('Please select a student'); return; }

        if (!selectedExam || !selectedExamCode || !selectedYear) {
            alert('Please select Year, Exam Code, and Exam');
            return;
        }

        const response = await ep1.get('/api/v2/createexamstudentdsrecord', {
            params: {
                user: user, token: token, colid: colid, name: name,
                studentname: student.student, studentregno: student.regno,
                program: student.program, programcode: student.programcode,
                course: student.course, coursecode: student.coursecode,
                exam: selectedExam, examcode: selectedExamCode,
                year: selectedYear, roomname: selectedRoom ? selectedRoom.roomname : '',
                buildingname: selectedRoom ? selectedRoom.buildingname : '',
                examdate: examdateref.current.value, examtime: examtimeref.current.value,
                status: 'Submitted'
            }
        });
        handleClose();
    };

    return (
        <Dialog fullScreen open={open} onClose={handleClose}>
            <DialogTitle>Add Exam Room Student</DialogTitle>
            <DialogContent>
                <br/>
                <FormControl sx={{ width: "100%", mb: 3 }}>
                    <InputLabel>Academic Year</InputLabel>
                    <Select value={selectedYear} onChange={handleYearChange} label="Academic Year">
                        {years.map((y, i) => <MenuItem key={i} value={y}>{y}</MenuItem>)}
                    </Select>
                </FormControl>

                <FormControl sx={{ width: "100%", mb: 3 }} disabled={!selectedYear}>
                    <InputLabel>Exam Code</InputLabel>
                    <Select value={selectedExamCode} onChange={handleExamCodeChange} label="Exam Code">
                        {examCodes.map((c, i) => <MenuItem key={i} value={c}>{c}</MenuItem>)}
                    </Select>
                </FormControl>

                <FormControl sx={{ width: "100%", mb: 3 }} disabled={!selectedExamCode}>
                    <InputLabel>Exam</InputLabel>
                    <Select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} label="Exam">
                        {exams.map((ex, i) => <MenuItem key={i} value={ex}>{ex}</MenuItem>)}
                    </Select>
                </FormControl>

                <Button variant="contained" color="secondary" onClick={loadStudents} disabled={!selectedExamCode || !selectedYear} sx={{ mb: 3 }}>
                    Load Students from Admit
                </Button>

                <FormControl sx={{ width: "100%", mb: 3 }} disabled={students.length === 0}>
                    <InputLabel>Select Student</InputLabel>
                    <Select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} label="Select Student">
                        {students.map((s, i) => (
                            <MenuItem key={i} value={s.regno}>{s.student} - {s.regno} ({s.program})</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Autocomplete
                    options={rooms}
                    getOptionLabel={(option) => `${option.roomname} - ${option.buildingname}`}
                    value={selectedRoom}
                    onChange={(event, newValue) => { setSelectedRoom(newValue); }}
                    renderInput={(params) => <TextField {...params} label="Select Room Name" variant="outlined" sx={{ width: "100%", mb: 3 }} />}
                />
                
                <TextField type="text" sx={{ width: "100%", mb: 3 }} label="Building Name" variant="outlined" value={selectedRoom ? selectedRoom.buildingname : ''} disabled />
                <TextField type="date" sx={{ width: "100%", mb: 3 }} label="Exam Date" variant="outlined" inputRef={examdateref} InputLabelProps={{ shrink: true }} />
                <TextField type="text" sx={{ width: "100%", mb: 3 }} label="Exam Time" variant="outlined" inputRef={examtimeref} />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">Cancel</Button>
                <Button onClick={searchapi} color="primary">Add</Button>
            </DialogActions>
        </Dialog>
    );
}

export default AddUserModal;
