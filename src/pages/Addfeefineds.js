import React, { useRef, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from '@mui/material';
import ep1 from '../api/ep1';
import global1 from './global1';

function AddUserModal({ open, handleClose, fetchViewPage }) {
    const departmentref = useRef();
    const categoryref = useRef();
    const fineamountref = useRef();

    const colid = global1.colid;
    // const user = global1.user;
    // const token = global1.token;

    const handleAdd = async () => {
        const department = departmentref.current.value;
        const category = categoryref.current.value;
        const fineamount = fineamountref.current.value;

        if (!department || !category || !fineamount) {
            alert("Please fill all fields");
            return;
        }

        const response = await ep1.post('/api/v2/addfeefineds', {
            department: department,
            category: category,
            fineamount: fineamount,
            colid: colid
        });

        if (response.data.status === 'success' || response.status === 201) {
            alert('Added Successfully');
            fetchViewPage();
            handleClose();
        } else {
            alert('Failed to add');
        }
    };

    return (
        <Dialog fullScreen open={open} onClose={handleClose}>
            <DialogTitle>Add Fee Fine</DialogTitle>
            <DialogContent>
                <p>Department</p>
                <TextField id="department" type="text" sx={{ width: "100%" }} variant="outlined" inputRef={departmentref} />
                <br /><br />

                <p>Category</p>
                <TextField id="category" type="text" sx={{ width: "100%" }} variant="outlined" inputRef={categoryref} />
                <br /><br />

                <p>Fine Amount</p>
                <TextField id="fineamount" type="number" sx={{ width: "100%" }} variant="outlined" inputRef={fineamountref} />
                <br /><br />

            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleAdd} color="primary">
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default AddUserModal;
