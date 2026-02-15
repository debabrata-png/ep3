import React, { useRef, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from '@mui/material';
import ep1 from '../api/ep1';
import global1 from './global1';

function EditUserModal({ open, handleClose, selectedUser, fetchViewPage }) {
    const departmentref = useRef();
    const categoryref = useRef();
    const fineamountref = useRef();

    // const colid = global1.colid;

    useEffect(() => {
        if (selectedUser) {
            // We can set default values via defaultValue in fields or manually setting if refs allow, 
            // but controlled inputs or defaultValue with key change is easier. 
            // Using defaultValue with key logic or refs manipulation is fine. 
            // Material UI TextField inputRef works well.
            // We will rely on defaultValue but we need to ensure component re-renders or we set values manually?
            // Actually, since selectedUser changes, passing it as defaultValue only works if component unmounts.
            // Better to set values directly via ref if using uncontrolled.
        }
    }, [selectedUser]);

    const handleEdit = async () => {
        const department = departmentref.current.value;
        const category = categoryref.current.value;
        const fineamount = fineamountref.current.value;

        if (!department || !category || !fineamount) {
            alert("Please fill all fields");
            return;
        }

        const response = await ep1.post('/api/v2/updatefeefineds', {
            department: department,
            category: category,
            fineamount: fineamount,
            // colid: colid, // Usually updates might not change colid, or keep it same
        }, {
            params: {
                id: selectedUser._id
            }
        });

        if (response.data.status === 'success' || response.status === 200) {
            alert('Updated Successfully');
            fetchViewPage();
            handleClose();
        } else {
            alert('Failed to update');
        }
    };

    return (
        <Dialog fullScreen open={open} onClose={handleClose}>
            <DialogTitle>Edit Fee Fine</DialogTitle>
            <DialogContent>
                <p>Department</p>
                <TextField id="department" type="text" sx={{ width: "100%" }} variant="outlined" inputRef={departmentref} defaultValue={selectedUser?.department} key={selectedUser?._id + 'dept'} />
                <br /><br />

                <p>Category</p>
                <TextField id="category" type="text" sx={{ width: "100%" }} variant="outlined" inputRef={categoryref} defaultValue={selectedUser?.category} key={selectedUser?._id + 'cat'} />
                <br /><br />

                <p>Fine Amount</p>
                <TextField id="fineamount" type="number" sx={{ width: "100%" }} variant="outlined" inputRef={fineamountref} defaultValue={selectedUser?.fineamount} key={selectedUser?._id + 'amt'} />
                <br /><br />

            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleEdit} color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default EditUserModal;
