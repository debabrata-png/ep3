import React, { useRef, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import ep1 from '../api/ep1';
import global1 from '../pages/global1';
import readXlsxFile from 'read-excel-file';

function AddUserModalBulk({ open, handleClose }) {
    const [selectedFile, setSelectedFile] = useState();
    const [link, setLink] = useState('');
    const colid = global1.colid;
    const user = global1.user;
    const name = global1.name;
    const token = global1.token;
    var f1 = '';

    const searchapi = async (exam, examcode, year, roomname, buildingname, examdate) => {
        await ep1.get('/api/v2/createexamroomdsrecord', {
            params: {
                user: user, token: token, colid: colid, name: name,
                exam, examcode, year, roomname, buildingname, examdate,
                status: 'Submitted'
            }
        });
    };

    const onfilechange = (event) => { setSelectedFile(event.target.files[0]); };

    const processfile = async () => {
        var rownumber = 1;
        await readXlsxFile(selectedFile).then((rows) => {
            rows.shift();
            rows.forEach((row) => {
                rownumber++;
                if (!row[0]) { f1 += 'row ' + rownumber + '-Exam,'; return; }
                if (!row[1]) { f1 += 'row ' + rownumber + '-Exam Code,'; return; }
                if (!row[2]) { f1 += 'row ' + rownumber + '-Year,'; return; }
                if (!row[3]) { f1 += 'row ' + rownumber + '-Room Name,'; return; }
                if (!row[4]) { f1 += 'row ' + rownumber + '-Building Name,'; return; }
                if (isNaN(new Date(row[5]))) { f1 += 'row ' + rownumber + '-Exam Date,'; return; }
                searchapi(row[0], row[1], row[2], row[3], row[4], row[5]);
            });
        });
        setLink(f1);
        alert('Valid rows will be updated. Please click Refresh to view data.');
    };

    return (
        <Dialog fullScreen open={open} onClose={handleClose}>
            <DialogTitle>Bulk Upload - Exam Rooms</DialogTitle>
            <DialogContent>
                Upload Excel with columns: exam, examcode, year, roomname, buildingname, examdate<br /><br />
                Date must be in mm/dd/yyyy format.<br /><br />
                <input type="file" onChange={onfilechange} /><br /><br />
                <p>Error list</p>{link}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">Close</Button>
                <Button onClick={processfile} color="primary">Upload</Button>
            </DialogActions>
        </Dialog>
    );
}

export default AddUserModalBulk;
