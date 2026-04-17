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

    const searchapi = async (invigilatorname, invigilatoremail, exam, examcode, year, roomname, buildingname, examdate, examtime) => {
        await ep1.get('/api/v2/createexaminvigilatordsrecord', {
            params: { user, token, colid, name: name, invigilatorname, invigilatoremail, exam, examcode, year, roomname, buildingname, examdate, examtime, status: 'Submitted' }
        });
    };

    const onfilechange = (event) => { setSelectedFile(event.target.files[0]); };

    const processfile = async () => {
        var rownumber = 1;
        await readXlsxFile(selectedFile).then((rows) => {
            rows.shift();
            rows.forEach((row) => {
                rownumber++;
                if (!row[0]) { f1 += 'row ' + rownumber + '-Invigilator Name,'; return; }
                if (!row[1]) { f1 += 'row ' + rownumber + '-Email,'; return; }
                if (!row[2]) { f1 += 'row ' + rownumber + '-Exam,'; return; }
                if (!row[4]) { f1 += 'row ' + rownumber + '-Year,'; return; }
                searchapi(row[0], row[1], row[2], row[3] || '', row[4], row[5] || '', row[6] || '', row[7] || '', row[8] || '');
            });
        });
        setLink(f1);
        alert('Valid rows will be updated. Please click Refresh to view data.');
    };

    return (
        <Dialog fullScreen open={open} onClose={handleClose}>
            <DialogTitle>Bulk Upload - Exam Invigilators</DialogTitle>
            <DialogContent>
                Upload Excel with columns: invigilatorname, invigilatoremail, exam, examcode, year, roomname, buildingname, examdate, examtime<br /><br />
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
