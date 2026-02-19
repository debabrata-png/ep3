import React, { useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Select, MenuItem } from '@mui/material';
import ep1 from '../api/ep1';
import global1 from '../pages/global1';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

function EditRoleListds({ open, handleClose, fetchViewPage, editUser }) {
    // State for form fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [department, setDepartment] = useState("");
    const [role, setRole] = useState("");
    const [gender, setGender] = useState("");
    const [category, setCategory] = useState("");

    const {
        transcript,
        listening,
        resetTranscript
    } = useSpeechRecognition();

    // Init state when editUser changes or modal opens
    useEffect(() => {
        if (editUser && open) {
            setName(editUser.name || "");
            setEmail(editUser.email || "");
            setPhone(editUser.phone || "");
            setDepartment(editUser.department || "");
            setRole(editUser.role || "");
            setGender(editUser.gender || "");
            setCategory(editUser.category || "");
            setPassword(editUser.password || ""); // Pre-fill password
        }
    }, [editUser, open]);

    const setFieldFromTranscript = (setter) => {
        if (transcript) {
            setter(transcript);
        }
    };

    const handleUpdate = async () => {
        try {
            const params = {
                name,
                email,
                phone,
                department,
                role,
                gender,
                category,
            };

            // Only update password if provided
            if (password) {
                params.password = password;
            }

            const response = await ep1.post(`/api/v2/ds1updateuser?id=${editUser._id}`, params);

            if (response.status === 200) {
                fetchViewPage();
                handleClose();
                alert('User updated successfully');
            } else {
                alert('Update failed: ' + response.data.message);
            }

        } catch (error) {
            console.error("Error updating user:", error);
            alert('Error updating user');
        }
    };

    return (
        <Dialog fullScreen open={open} onClose={handleClose}>
            <DialogTitle>Edit User</DialogTitle>
            <DialogContent>
                <p>Microphone: {listening ? 'on' : 'off'}</p>
                <button onClick={SpeechRecognition.startListening}>Start</button>
                <button onClick={SpeechRecognition.stopListening}>Stop</button>
                <button onClick={resetTranscript}>Reset</button>
                <p>{transcript}</p>

                <button onClick={() => setFieldFromTranscript(setName)}>Set Name</button>
                <button onClick={() => setFieldFromTranscript(setEmail)}>Set Email</button>
                <button onClick={() => setFieldFromTranscript(setPhone)}>Set Phone</button>
                <button onClick={() => setFieldFromTranscript(setPassword)}>Set Password</button>
                <button onClick={() => setFieldFromTranscript(setDepartment)}>Set Department</button>

                <br /><br />

                <p>Name</p>
                <TextField
                    type="text"
                    sx={{ width: "100%" }}
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                /><br /><br />

                <p>Email</p>
                <TextField
                    type="text"
                    sx={{ width: "100%" }}
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                /><br /><br />

                <p>Phone</p>
                <TextField
                    type="text"
                    sx={{ width: "100%" }}
                    variant="outlined"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                /><br /><br />

                <p>Password</p>
                <TextField
                    type="text"
                    sx={{ width: "100%" }}
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                /><br /><br />

                <p>Department</p>
                <TextField
                    type="text"
                    sx={{ width: "100%" }}
                    variant="outlined"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                /><br /><br />

                <p>Role</p>
                <Select
                    sx={{ width: "100%" }}
                    displayEmpty
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                >
                    <MenuItem value="">
                        <em>Select role</em>
                    </MenuItem>
                    <MenuItem value="Store">Store Incharge</MenuItem>
                    <MenuItem value="AO">AO</MenuItem>
                    <MenuItem value="OE">Office Executive</MenuItem>
                    <MenuItem value="CMA">Competent Authority</MenuItem>
                    <MenuItem value="PE">Purchase Executive</MenuItem>
                    <MenuItem value="SPE">Sr. Purchase Executive</MenuItem>
                </Select>
                <br /><br />

                <p>Gender</p>
                <TextField
                    type="text"
                    sx={{ width: "100%" }}
                    variant="outlined"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                /><br /><br />

                <p>Category</p>
                <TextField
                    type="text"
                    sx={{ width: "100%" }}
                    variant="outlined"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                /><br /><br />

            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleUpdate} color="primary">
                    Update
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default EditRoleListds;
