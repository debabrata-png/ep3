import ep1 from '../api/ep1';
import React, { useEffect, useState } from 'react';
import global1 from './global1';
import { Button, Box, Paper, Container, Grid } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddUserModal from './Addfeefineds';
import EditUserModal from './Editfeefineds';
import DeleteUserModal from '../Crud/Delete';

function ViewPage() {
    const [rows, setRows] = useState([]);
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedUser, setSelectedUser] = useState();

    // Initial state matching the model
    const [newUser, setNewUser] = useState({
        department: '',
        colid: global1.colid,
        category: '',
        fineamount: ''
    });

    const user = global1.user;
    const token = global1.token;
    const colid = global1.colid;

    const columns = [
        { field: 'department', headerName: 'Department', width: 250 },
        { field: 'category', headerName: 'Category', width: 200 },
        { field: 'fineamount', headerName: 'Fine Amount', width: 200 },
        {
            field: 'actions', headerName: 'Actions', width: 300, renderCell: (params) => {
                return (
                    <Box>
                        <Button
                            onClick={(e) => handleOpenEdit(params.row)}
                            variant="contained"
                            color="primary"
                            sx={{ mr: 1 }}
                        >
                            Edit
                        </Button>
                        <Button
                            onClick={(e) => handleOpenDelete(params.row)}
                            variant="contained"
                            color="secondary"
                        >
                            Delete
                        </Button>
                    </Box>
                );
            }
        }
    ];

    const fetchViewPage = async () => {
        // Assuming getallfeefineds or similar endpoint exists or reuse generic getall pattern if applicable
        // Based on router: /api/v2/getallfeefineds
        const response = await ep1.get('/api/v2/getallfeefineds', {
            params: {
                token: token,
                colid: colid,
                user: user
            }
        });
        // Ensure we map validation or structure if needed, or if API returns plain array
        if (response.data && response.data.data && response.data.data.classes) {
            setRows(response.data.data.classes);
        }
    };

    useEffect(() => {
        fetchViewPage();
    }, []);

    const handleOpenAdd = () => {
        setOpenAdd(true);
    };

    const handleCloseAdd = () => {
        setOpenAdd(false);
        setNewUser({
            department: '',
            colid: colid,
            category: '',
            fineamount: ''
        });
    };

    const handleOpenEdit = (user) => {
        setSelectedUser(user);
        setOpenEdit(true);
    };

    const handleCloseEdit = () => {
        setOpenEdit(false);
        setSelectedUser(null);
    };

    const handleOpenDelete = (user) => {
        setSelectedUser(user);
        setOpenDelete(true);
    };

    const handleCloseDelete = () => {
        setOpenDelete(false);
        setSelectedUser(null);
    };

    const handleDeleteUser = async () => {
        // deletefeefineds endpoint
        const response = await ep1.get('/api/v2/deletefeefineds', {
            params: {
                id: selectedUser._id,
                token: token,
                user: user
            }
        });
        if (response.data.status === 'success' || response.status === 204) {
            fetchViewPage();
            handleCloseDelete();
        } else {
            alert('Failed to delete');
        }
    };

    const handleInputChange = (event, field) => {
        const { value } = event.target;
        if (openAdd) {
            setNewUser({ ...newUser, [field]: value });
        } else if (openEdit) {
            setSelectedUser({ ...selectedUser, [field]: value });
        }
    };

    const simpleAddUser = async () => {
        // This is passed to AddModal but AddModal in example has its own submit logic 'searchapi'
        // We can implement 'handleAddUser' to be called by child or just child calls API.
        // In Addmroles.js, it calls API directly.
        // We will try to make Addfeefineds call API directly too.
        fetchViewPage();
        handleCloseAdd();
    }

    const simpleEditUser = async () => {
        fetchViewPage();
        handleCloseEdit();
    }

    return (
        <React.Fragment>
            <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" marginBottom={4} marginTop={2}>
                    <Button
                        variant="contained"
                        color="success"
                        style={{ padding: '5px 10px', marginRight: '4px', fontSize: '12px', height: '30px', width: '80px' }}
                        onClick={handleOpenAdd}
                    >
                        Add
                    </Button>
                    <Button onClick={fetchViewPage}
                        variant="contained"
                        color="secondary"
                        style={{ padding: '5px 10px', fontSize: '12px', height: '30px', width: '80px' }}
                    >
                        Refresh
                    </Button>
                </Box>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper elevation={5} sx={{ p: 2, display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <DataGrid
                                getRowId={(row) => row._id}
                                rows={rows}
                                columns={columns}
                                initialState={{
                                    pagination: {
                                        paginationModel: {
                                            pageSize: 10,
                                        },
                                    },
                                }}
                                pageSizeOptions={[10]}
                                disableRowSelectionOnClick
                            />

                            {/* Modals */}
                            {openAdd && (
                                <AddUserModal
                                    open={openAdd}
                                    handleClose={handleCloseAdd}
                                    fetchViewPage={fetchViewPage}
                                />
                            )}

                            {openEdit && (
                                <EditUserModal
                                    open={openEdit}
                                    handleClose={handleCloseEdit}
                                    selectedUser={selectedUser}
                                    fetchViewPage={fetchViewPage}
                                />
                            )}

                            {openDelete && (
                                <DeleteUserModal
                                    open={openDelete}
                                    handleClose={handleCloseDelete}
                                    handleDeleteUser={handleDeleteUser}
                                    selectedUser={selectedUser}
                                />
                            )}

                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </React.Fragment>
    );
}

export default ViewPage;
