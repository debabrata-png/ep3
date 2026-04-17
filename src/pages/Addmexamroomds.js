import React, { useRef } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from '@mui/material';
import ep1 from '../api/ep1';
import global1 from '../pages/global1';

function AddUserModal({ open, handleClose, handleInputChange, handleAddUser, newUser }) {
    const examref = useRef();
    const examcoderef = useRef();
    const yearref = useRef();
    const roomnameref = useRef();
    const buildingnameref = useRef();
    const examdateref = useRef();

    const colid = global1.colid;
    const user = global1.user;
    const name = global1.name;
    const token = global1.token;

    const searchapi = async () => {
        const exam = examref.current.value;
        const examcode = examcoderef.current.value;
        const year = yearref.current.value;
        const roomname = roomnameref.current.value;
        const buildingname = buildingnameref.current.value;
        const examdate = examdateref.current.value;

        const response = await ep1.get('/api/v2/createexamroomdsrecord', {
            params: {
                user: user, token: token, colid: colid, name: name,
                exam: exam, examcode: examcode, year: year,
                roomname: roomname, buildingname: buildingname,
                examdate: examdate, status: 'Submitted'
            }
        });
        handleClose();
    };

    return (
        <Dialog fullScreen open={open} onClose={handleClose}>
            <DialogTitle>Add Exam Room</DialogTitle>
            <DialogContent>
                <TextField type="text" sx={{ width: "100%" }} label="Exam" variant="outlined" inputRef={examref} /><br /><br />
                <TextField type="text" sx={{ width: "100%" }} label="Exam Code" variant="outlined" inputRef={examcoderef} /><br /><br />
                <TextField type="text" sx={{ width: "100%" }} label="Academic Year" variant="outlined" inputRef={yearref} /><br /><br />
                <TextField type="text" sx={{ width: "100%" }} label="Room Name" variant="outlined" inputRef={roomnameref} /><br /><br />
                <TextField type="text" sx={{ width: "100%" }} label="Building Name" variant="outlined" inputRef={buildingnameref} /><br /><br />
                <TextField type="date" sx={{ width: "100%" }} label="Exam Date" variant="outlined" inputRef={examdateref} InputLabelProps={{ shrink: true }} /><br /><br />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">Cancel</Button>
                <Button onClick={searchapi} color="primary">Add</Button>
            </DialogActions>
        </Dialog>
    );
}

export default AddUserModal;
