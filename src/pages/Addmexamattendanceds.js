import React, { useRef } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from '@mui/material';
import ep1 from '../api/ep1';
import global1 from '../pages/global1';

function AddUserModal({ open, handleClose, handleInputChange, handleAddUser, newUser }) {
    const studentnameref = useRef();
    const studentregnoref = useRef();
    const programref = useRef();
    const programcoderef = useRef();
    const courseref = useRef();
    const coursecoderef = useRef();
    const examref = useRef();
    const examcoderef = useRef();
    const yearref = useRef();
    const roomnameref = useRef();
    const buildingnameref = useRef();
    const examdateref = useRef();
    const examtimeref = useRef();
    const statusref = useRef();

    const colid = global1.colid;
    const user = global1.user;
    const name = global1.name;
    const token = global1.token;

    const searchapi = async () => {
        const response = await ep1.get('/api/v2/createexamattendancedsrecord', {
            params: {
                user, token, colid, name,
                studentname: studentnameref.current.value,
                studentregno: studentregnoref.current.value,
                program: programref.current.value,
                programcode: programcoderef.current.value,
                course: courseref.current.value,
                coursecode: coursecoderef.current.value,
                exam: examref.current.value,
                examcode: examcoderef.current.value,
                year: yearref.current.value,
                roomname: roomnameref.current.value,
                buildingname: buildingnameref.current.value,
                examdate: examdateref.current.value,
                examtime: examtimeref.current.value,
                status: statusref.current.value || 'Present'
            }
        });
        handleClose();
    };

    return (
        <Dialog fullScreen open={open} onClose={handleClose}>
            <DialogTitle>Add Exam Attendance</DialogTitle>
            <DialogContent>
                <TextField type="text" sx={{ width: "100%" }} label="Student Name" variant="outlined" inputRef={studentnameref} /><br /><br />
                <TextField type="text" sx={{ width: "100%" }} label="Registration No" variant="outlined" inputRef={studentregnoref} /><br /><br />
                <TextField type="text" sx={{ width: "100%" }} label="Program" variant="outlined" inputRef={programref} /><br /><br />
                <TextField type="text" sx={{ width: "100%" }} label="Program Code" variant="outlined" inputRef={programcoderef} /><br /><br />
                <TextField type="text" sx={{ width: "100%" }} label="Course" variant="outlined" inputRef={courseref} /><br /><br />
                <TextField type="text" sx={{ width: "100%" }} label="Course Code" variant="outlined" inputRef={coursecoderef} /><br /><br />
                <TextField type="text" sx={{ width: "100%" }} label="Exam" variant="outlined" inputRef={examref} /><br /><br />
                <TextField type="text" sx={{ width: "100%" }} label="Exam Code" variant="outlined" inputRef={examcoderef} /><br /><br />
                <TextField type="text" sx={{ width: "100%" }} label="Academic Year" variant="outlined" inputRef={yearref} /><br /><br />
                <TextField type="text" sx={{ width: "100%" }} label="Room Name" variant="outlined" inputRef={roomnameref} /><br /><br />
                <TextField type="text" sx={{ width: "100%" }} label="Building Name" variant="outlined" inputRef={buildingnameref} /><br /><br />
                <TextField type="date" sx={{ width: "100%" }} label="Exam Date" variant="outlined" inputRef={examdateref} InputLabelProps={{ shrink: true }} /><br /><br />
                <TextField type="text" sx={{ width: "100%" }} label="Exam Time" variant="outlined" inputRef={examtimeref} /><br /><br />
                <TextField type="text" sx={{ width: "100%" }} label="Status (Present/Absent)" variant="outlined" inputRef={statusref} /><br /><br />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">Cancel</Button>
                <Button onClick={searchapi} color="primary">Add</Button>
            </DialogActions>
        </Dialog>
    );
}

export default AddUserModal;
