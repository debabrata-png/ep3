import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Autocomplete } from '@mui/material';
import ep1 from '../api/ep1';
import global1 from '../pages/global1';

function AddUserModal({ open, handleClose, handleInputChange, handleAddUser, newUser }) {
    const examref = useRef();
    const examcoderef = useRef();
    const yearref = useRef();
    const examdateref = useRef();
    const examtimeref = useRef();

    const [rooms, setRooms] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);

    const colid = global1.colid;
    const user = global1.user;
    const name = global1.name;
    const token = global1.token;

    useEffect(() => {
        if (open) {
            fetchRooms();
            fetchUsers();
        }
    }, [open]);

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

    const fetchUsers = async () => {
        try {
            const response = await ep1.get('/api/v2/ds1getalluser', {
                params: { colid, limit: 1000 }
            });
            if (response.data && response.data.data) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };

    const searchapi = async () => {
        const response = await ep1.get('/api/v2/createexaminvigilatordsrecord', {
            params: {
                user, token, colid, name,
                invigilatorname: selectedUser ? selectedUser.name : '',
                invigilatoremail: selectedUser ? selectedUser.email : '',
                exam: examref.current.value,
                examcode: examcoderef.current.value,
                year: yearref.current.value,
                roomname: selectedRoom ? selectedRoom.roomname : '',
                buildingname: selectedRoom ? selectedRoom.buildingname : '',
                examdate: examdateref.current.value,
                examtime: examtimeref.current.value,
                status: 'Submitted'
            }
        });
        handleClose();
    };

    return (
        <Dialog fullScreen open={open} onClose={handleClose}>
            <DialogTitle>Add Exam Invigilator</DialogTitle>
            <DialogContent>
                <br/>
                <Autocomplete
                    options={users}
                    getOptionLabel={(option) => `${option.name} (${option.email})`}
                    onChange={(event, newValue) => { setSelectedUser(newValue); }}
                    renderInput={(params) => <TextField {...params} label="Search Invigilator (Name or Email)" variant="outlined" sx={{ width: "100%" }} />}
                /><br />
                <TextField type="text" sx={{ width: "100%" }} label="Invigilator Email" variant="outlined" value={selectedUser ? selectedUser.email : ''} disabled /><br /><br />
                
                <TextField type="text" sx={{ width: "100%" }} label="Exam" variant="outlined" inputRef={examref} /><br /><br />
                <TextField type="text" sx={{ width: "100%" }} label="Exam Code" variant="outlined" inputRef={examcoderef} /><br /><br />
                <TextField type="text" sx={{ width: "100%" }} label="Academic Year" variant="outlined" inputRef={yearref} /><br /><br />
                
                <Autocomplete
                    options={rooms}
                    getOptionLabel={(option) => `${option.roomname} - ${option.buildingname}`}
                    onChange={(event, newValue) => { setSelectedRoom(newValue); }}
                    renderInput={(params) => <TextField {...params} label="Select Room Name" variant="outlined" sx={{ width: "100%" }} />}
                /><br />
                <TextField type="text" sx={{ width: "100%" }} label="Building Name" variant="outlined" value={selectedRoom ? selectedRoom.buildingname : ''} disabled /><br /><br />
                
                <TextField type="date" sx={{ width: "100%" }} label="Exam Date" variant="outlined" inputRef={examdateref} InputLabelProps={{ shrink: true }} /><br /><br />
                <TextField type="text" sx={{ width: "100%" }} label="Exam Time" variant="outlined" inputRef={examtimeref} /><br /><br />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">Cancel</Button>
                <Button onClick={searchapi} color="primary">Add</Button>
            </DialogActions>
        </Dialog>
    );
}

export default AddUserModal;
