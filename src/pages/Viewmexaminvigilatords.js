import ep1 from '../api/ep1';
import React, { useEffect, useState } from 'react';
import global1 from './global1';
import { Button, Box, Paper, Container, Grid } from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AddUserModal from './Addmexaminvigilatords';
import AddUserModalBulk from './Addmexaminvigilatorbulkds';
import EditUserModal from '../Crud/Edit';
import DeleteUserModal from '../Crud/Delete';
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
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openExport, setOpenExport] = useState(false);
    const [selectedUser, setSelectedUser] = useState();
    const [newUser, setNewUser] = useState({});

    const user = global1.user;
    const token = global1.token;
    const colid = global1.colid;

    const onButtonClick = async (e, row) => {
        e.stopPropagation();
        const response = await ep1.get('/api/v2/deleteexaminvigilatordsrecord', { params: { id: row._id, token, user } });
        alert(response.data.status);
        await fetchViewPage();
    };

    const columns = [
        { field: 'invigilatorname', headerName: 'Invigilator Name', width: 200, editable: true, valueFormatter: (params) => params.value || '' },
        { field: 'invigilatoremail', headerName: 'Email', width: 200, editable: true, valueFormatter: (params) => params.value || '' },
        { field: 'exam', headerName: 'Exam', width: 150, editable: true, valueFormatter: (params) => params.value || '' },
        { field: 'examcode', headerName: 'Exam Code', width: 130, editable: true, valueFormatter: (params) => params.value || '' },
        { field: 'year', headerName: 'Year', width: 100, editable: true, valueFormatter: (params) => params.value || '' },
        { field: 'roomname', headerName: 'Room', width: 120, editable: true, valueFormatter: (params) => params.value || '' },
        { field: 'buildingname', headerName: 'Building', width: 120, editable: true, valueFormatter: (params) => params.value || '' },
        { field: 'examtime', headerName: 'Exam Time', width: 120, editable: true, valueFormatter: (params) => params.value || '' },
        { field: 'status', headerName: 'Status', width: 100, editable: true, valueFormatter: (params) => params.value || '' },
        { field: 'actions', headerName: 'Actions', width: 100, renderCell: (params) => (<Button onClick={(e) => onButtonClick(e, params.row)} variant="contained">Delete</Button>) }
    ];

    const fetchViewPage = async () => {
        const response = await ep1.get('/api/v2/getexaminvigilatordsrecords', { params: { token, colid, user } });
        setRows(response.data.data.classes);
    };

    const getgraphdata = async () => {
        const response = await ep1.get('/api/v2/getexaminvigilatordscountbyyear', { params: { token, colid, user } });
        setResults(response.data.data.classes);
    };

    const getgraphdatasecond = async () => {
        const response = await ep1.get('/api/v2/getexaminvigilatordscountbybuilding', { params: { token, colid, user } });
        setSecond(response.data.data.classes);
    };

    const refreshpage = async () => { fetchViewPage(); getgraphdata(); getgraphdatasecond(); };
    useEffect(() => { fetchViewPage(); getgraphdata(); getgraphdatasecond(); }, []);

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'ExamInvigilatorDS');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, 'ExamInvigilatorDS_data.xlsx');
        setOpenExport(false);
    };

    const handleOpenAdd = () => setOpenAdd(true);
    const handleOpenAddBulk = () => setOpenAddBulk(true);
    const handleCloseAdd = () => { setOpenAdd(false); setNewUser({}); };
    const handleCloseAddBulk = () => { setOpenAddBulk(false); setNewUser({}); };

    const handleOpenEdit1 = async (updatedRow) => {
        await ep1.post('/api/v2/updateexaminvigilatordsrecord', {
            id: updatedRow._id, user: updatedRow.user, token, name: updatedRow.name, colid,
            invigilatorname: updatedRow.invigilatorname, invigilatoremail: updatedRow.invigilatoremail,
            exam: updatedRow.exam, examcode: updatedRow.examcode, year: updatedRow.year,
            roomname: updatedRow.roomname, buildingname: updatedRow.buildingname,
            examdate: updatedRow.examdate, examtime: updatedRow.examtime, status: updatedRow.status
        });
        await fetchViewPage();
    };

    const handleInputChange = () => {};
    const handleAddUser = () => handleCloseAdd();
    const handleEditUser = () => { setOpenEdit(false); setSelectedUser(null); };
    const handleDeleteUser = () => { setOpenDelete(false); setSelectedUser(null); };

    return (
        <React.Fragment>
            <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" marginBottom={4} marginTop={2}>
                    <Button variant="contained" color="success" style={{ padding: '5px 10px', marginRight: '4px', fontSize: '12px', height: '30px', width: '80px' }} onClick={handleOpenAdd}>Add</Button>
                    <Button variant="contained" color="success" style={{ padding: '5px 10px', marginRight: '4px', fontSize: '12px', height: '30px', width: '80px' }} onClick={handleOpenAddBulk}>Bulk</Button>
                    <Button variant="contained" color="primary" style={{ padding: '5px 10px', fontSize: '12px', marginRight: '4px', height: '30px', width: '80px' }} onClick={() => setOpenExport(true)}>Export</Button>
                    <Button onClick={refreshpage} variant="contained" color="secondary" style={{ padding: '5px 10px', fontSize: '12px', height: '30px', width: '80px' }}>Refresh</Button>
                </Box>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <div style={{ textAlign: 'center' }}>Building wise count</div><br />
                        <BarChart xAxis={[{ id: 'barCategories', data: second.map((l) => l._id || ''), scaleType: 'band', colorMap: { type: 'piecewise', thresholds: [], colors: ['#F6C179', '#C27F1D', '#A6B0A3', '#EDDBAC', '#A6DAEE'] } }]} series={[{ data: second.map((l) => parseInt(l.total_attendance)) }]} width={500} height={300} />
                    </Grid>
                    <Grid item xs={6}>
                        <div style={{ textAlign: 'center' }}>Year wise count</div><br />
                        <PieChart colors={['#D1A3B4', '#BBD1A3', '#A3C4D1', '#EDDBAC', '#A6DAEE']} series={[{ data: results.map((l, i) => ({ id: i, value: parseInt(l.total_attendance), label: l._id || '' })) }]} width={400} height={250} />
                    </Grid>
                    <Grid item xs={12}>
                        <Paper elevation={5} sx={{ p: 2, display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <DataGrid getRowId={(row) => row._id} rows={rows} columns={columns}
                                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                                processRowUpdate={(updatedRow) => handleOpenEdit1(updatedRow)}
                                pageSizeOptions={[10]} disableRowSelectionOnClick />
                            <AddUserModal open={openAdd} handleClose={handleCloseAdd} handleInputChange={handleInputChange} handleAddUser={handleAddUser} newUser={newUser} />
                            <AddUserModalBulk open={openAddBulk} handleClose={handleCloseAddBulk} />
                            <EditUserModal open={openEdit} handleClose={() => { setOpenEdit(false); setSelectedUser(null); }} handleInputChange={handleInputChange} handleEditUser={handleEditUser} selectedUser={selectedUser} />
                            <DeleteUserModal open={openDelete} handleClose={() => { setOpenDelete(false); setSelectedUser(null); }} handleDeleteUser={handleDeleteUser} selectedUser={selectedUser} />
                            <ExportUserModal open={openExport} handleClose={() => setOpenExport(false)} handleExport={handleExport} />
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </React.Fragment>
    );
}

export default ViewPage;
