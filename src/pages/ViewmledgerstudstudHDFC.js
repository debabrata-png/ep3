import ep1 from '../api/ep1';
import React, { useEffect, useState, useRef } from 'react';
import global1 from './global1';
import { Button, Box, Paper, Container, Grid } from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AddUserModal from './Addmledgerstudstud';
import AddUserModalBulk from './Addmledgerstudbulkstud';
import EditUserModal from '../Crud/Edit';
import DeleteUserModal from '../Crud/Delete';
import ExportUserModal from './Export';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';
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
    const [newUser, setNewUser] = useState({
        coursecode: '', coursetitle: '', year: '', coursetype: '', duration: '', offeredtimes: '', imagelink: '', studentsenrolled: '',
        price: '', category: '', department: '', coursehours: '', totalstudents: '', studentscompleted: '', dateadded: ''
    });

    const user = global1.user;
    const token = global1.token;
    const colid = global1.colid;
    const name = global1.name;

    const regno = global1.regno;

    // HDFC Integration Constants
    const backendURL = ep1.defaults.baseURL;
    const frontendURL = window.location.origin;

    const handleDeleteClick = async (id) => {
        alert(id);
        const response = await ep1.get('/api/v2/deleteaddoncbyfac', {
            params: {
                id: id,
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZGVtb0BjYW1wdXMudGVjaG5vbG9neSIsImNvbGlkIjoiMzAiLCJpYXQiOjE3MTY3ODk5NTEsImV4cCI6MTcxNzUwOTk1MX0.eXO0DAHibVppz9hj2LkIEE3nMY8xPNxg1OmasdRus1s",
                user: "demo@campus.technology"
            }

        });
        alert(response.data.status);
        const a = await fetchViewPage();
    };

    const onButtonClickpay = async (e, row) => {
        // alert('Payment is not enabled');
        e.stopPropagation();

        if (!row.amount || row.amount <= 0) {
            alert('Invalid amount for payment');
            return;
        }

        const isConfirmed = window.confirm(`Are you sure you want to pay ₹${row.amount} for ${row.feeeitem}?`);
        if (!isConfirmed) {
            return;
        }

        // Open a new window immediately to avoid popup blockers
        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write('Please wait, redirecting to payment gateway...');
        }

        const paymentData = {
            name: global1.name || "",
            user: global1.user || "",
            colid: global1.colid || 1,
            studentName: global1.name || row.student || "",
            regno: row.regno || global1.regno || "",
            studentEmail: global1.email || global1.user || "", // Fallback to user (often email)
            studentPhone: global1.phone || global1.mobile || "0000000000", // Fallback if missing
            originalAmount: row.amount,
            paymentType: "SEMESTER_FEE", // Defaulting to Semester Fee as it's a ledger
            paymentPurpose: row.feeeitem || "Fee Payment",
            academicYear: row.academicyear || "2024-25",
            semester: row.semester || "",
            course: "", // Not explicitly in row, leaving empty
            department: "", // Not explicitly in row
            programcode: "", // Not explicitly in row
            admissionyear: "", // Not explicitly in row
            couponCode: "",
            feegroup: row.feegroup || "",
            feeitem: row.feeeitem || "",
            feecategory: row.feecategory || "",
            installment: row.installment || "",
            // Dynamic URLs
            frontendCallbackUrl: `${frontendURL}/hdfcpaymentcallbackds`,
            backendReturnUrl: `${backendURL}/api/v2/hdfcpaymentorderds/return`,
            comments: `Payment for ${row.feeeitem}`,
            notes: ""
        };

        try {
            const orderResponse = await ep1.post("/api/v2/hdfcpaymentorderds/create", paymentData);

            if (!orderResponse.data.success) {
                if (newWindow) newWindow.close();
                alert(orderResponse.data.message || "Failed to create order");
                return;
            }

            const { paymenturl } = orderResponse.data.data;

            if (paymenturl) {
                if (newWindow) {
                    newWindow.location.href = paymenturl;
                } else {
                    // Fallback if popup blocked (though unlikely with early open)
                    window.location.href = paymenturl;
                }
            } else {
                if (newWindow) newWindow.close();
                alert("Failed to get payment URL from server");
            }
        } catch (err) {
            if (newWindow) newWindow.close();
            console.error("Payment Error:", err);
            alert(err.response?.data?.message || err.message || "Failed to initiate payment");
        }
    }

    const onButtonClick = async (e, row) => {
        e.stopPropagation();
        //do whatever you want with the row
        //alert(row._id);
        const response = await ep1.get('/api/v2/deleteledgerstudbyfac', {
            params: {
                id: row._id,
                token: token,
                user: user
            }

        });
        alert(response.data.status);
        const a = await fetchViewPage();
    };

    const columns = [
        // { field: '_id', headerName: 'ID' },

        {
            field: 'academicyear',
            headerName: 'Academic year',
            type: 'dropdown',
            width: 200,
            editable: false,
            valueFormatter: (params) => {
                if (params.value) {
                    return params.value;
                } else {
                    return '';
                }
            }
        },
        {
            field: 'student',
            headerName: 'Student',
            type: 'text',
            width: 200,
            editable: false,
            valueFormatter: (params) => {
                if (params.value) {
                    return params.value;
                } else {
                    return '';
                }
            }
        },
        {
            field: 'regno',
            headerName: 'Reg no',
            type: 'text',
            width: 200,
            editable: false,
            valueFormatter: (params) => {
                if (params.value) {
                    return params.value;
                } else {
                    return '';
                }
            }
        },
        {
            field: 'feegroup',
            headerName: 'Fee group',
            type: 'text',
            width: 200,
            editable: false,
            valueFormatter: (params) => {
                if (params.value) {
                    return params.value;
                } else {
                    return '';
                }
            }
        },
        {
            field: 'semester',
            headerName: 'Semester',
            type: 'text',
            width: 200,
            editable: false,
            valueFormatter: (params) => {
                if (params.value) {
                    return params.value;
                } else {
                    return '';
                }
            }
        },
        {
            field: 'feeeitem',
            headerName: 'Fee item',
            type: 'text',
            width: 200,
            editable: false,
            valueFormatter: (params) => {
                if (params.value) {
                    return params.value;
                } else {
                    return '';
                }
            }
        },
        {
            field: 'feecategory',
            headerName: 'Fee category',
            type: 'text',
            width: 200,
            editable: false,
            valueFormatter: (params) => {
                if (params.value) {
                    return params.value;
                } else {
                    return '';
                }
            }
        },
        {
            field: 'classdate',
            headerName: 'Due date',
            type: 'date',
            width: 200,
            editable: false,
            valueGetter: (params) => {
                if (!params.value) {
                    return new Date();
                }
                return new Date(params.value);
            },
            valueFormatter: params => dayjs(params?.value).format('DD/MM/YYYY'),
        },
        {
            field: 'amount',
            headerName: 'Amount',
            type: 'number',
            width: 200,
            editable: false,
            valueFormatter: (params) => {
                if (params.value) {
                    return params.value;
                } else {
                    return '';
                }
            }
        },
        {
            field: 'paymode',
            headerName: 'Pay mode',
            type: 'text',
            width: 200,
            editable: false,
            valueFormatter: (params) => {
                if (params.value) {
                    return params.value;
                } else {
                    return '';
                }
            }
        },
        {
            field: 'paydetails',
            headerName: 'Pay details',
            type: 'text',
            width: 200,
            editable: false,
            valueFormatter: (params) => {
                if (params.value) {
                    return params.value;
                } else {
                    return '';
                }
            }
        },
        {
            field: 'installment',
            headerName: 'Installment',
            type: 'text',
            width: 200,
            editable: false,
            valueFormatter: (params) => {
                if (params.value) {
                    return params.value;
                } else {
                    return '';
                }
            }
        },
        {
            field: 'status',
            headerName: 'Status',
            type: 'text',
            width: 200,
            editable: false,
            valueFormatter: (params) => {
                if (params.value) {
                    return params.value;
                } else {
                    return '';
                }
            }
        },


        {
            field: 'actions', headerName: 'Actions', width: 100, renderCell: (params) => {
                const isPaid = rows.some(r =>
                    r.amount === -params.row.amount &&
                    r.feeeitem === params.row.feeeitem &&
                    (r.status === 'paid' || r.type === 'negative')
                );

                return (
                    <Button
                        onClick={(e) => onButtonClickpay(e, params.row)}
                        variant="contained"
                        disabled={isPaid}
                    >
                        {isPaid ? 'Paid' : 'Pay'}
                    </Button>
                );
            }
        }
    ];


    const coursetitleref = useRef();

    const fetchViewPage = async () => {
        const response = await ep1.get('/api/v2/getledgerstudstudbyfac', {
            params: {
                token: token,
                colid: colid,
                user: user,
                regno: regno
            }
        });
        setRows(response.data.data.classes);
    };

    const getgraphdata = async () => {
        const response = await ep1.get('/api/v2/getledgerstudcountbystud', {
            params: {
                token: token,
                colid: colid,
                user: user,
                regno: regno
            }
        });
        setResults(response.data.data.classes);
    };



    const getgraphdatasecond = async () => {
        const response = await ep1.get('/api/v2/getledgerstudsecondbystud', {
            params: {
                token: token,
                colid: colid,
                user: user,
                regno: regno
            }
        });
        setSecond(response.data.data.classes);
    };

    const refreshpage = async () => {
        fetchViewPage();
        getgraphdata();
        getgraphdatasecond();
    }

    useEffect(() => {
        fetchViewPage();
        // getgraphdata();
        // getgraphdatasecond();
    }, []);

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'ViewPage');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, 'ViewPage_data.xlsx');
        setOpenExport(false);
    };

    const handleOpenAdd = () => {
        setOpenAdd(true);
    };

    const handleOpenAddBulk = () => {
        setOpenAddBulk(true);
    };

    const handleCloseAdd = () => {
        setOpenAdd(false);
        setNewUser({
            coursecode: '', coursetitle: '', year: '', coursetype: '', duration: '', offeredtimes: '', imagelink: '',
            price: '', category: '', department: '', coursehours: '', totalstudents: '', studentscompleted: '', studentsenrolled: '', dateadded: ''
        });
    };

    const handleCloseAddBulk = () => {
        setOpenAddBulk(false);
        setNewUser({
            coursecode: '', coursetitle: '', year: '', coursetype: '', duration: '', offeredtimes: '', imagelink: '',
            price: '', category: '', department: '', coursehours: '', totalstudents: '', studentscompleted: '', studentsenrolled: '', dateadded: ''
        });
    };

    const handleOpenEdit = (user) => {
        global1.coursetitle = user.coursetitle;
        global1.coursecode = user.coursecode;
        global1.duration = user.duration;
        global1.coursetype = user.coursetype;
        global1.dateadded = user.dateadded;
        setSelectedUser(user);
        setOpenEdit(true);

        //alert(user.coursetitle);

    };



    const handleOpenEdit1 = async (user) => {

        //const title=titleref.current.value;
        const academicyear = user.academicyear;
        const student = user.student;
        const regno = user.regno;
        const feegroup = user.feegroup;
        const semester = user.semester;
        const feeeitem = user.feeeitem;
        const feecategory = user.feecategory;
        const classdate = new Date(user.classdate);
        const amount = user.amount;
        const paymode = user.paymode;
        const paydetails = user.paydetails;
        const installment = user.installment;
        const status = user.status;

        //alert(coursetitle + ' - ' + studentscompleted);


        const response = await ep1.get('/api/v2/updateledgerstudbyfac', {
            params: {
                id: user._id,
                user: user.user,
                token: token,
                name: user.name,
                colid: colid,
                academicyear: academicyear,
                student: student,
                regno: regno,
                feegroup: feegroup,
                semester: semester,
                feeeitem: feeeitem,
                feecategory: feecategory,
                classdate: classdate,
                amount: amount,
                paymode: paymode,
                paydetails: paydetails,
                installment: installment,
                status: status,

                status1: 'Submitted',
                comments: ''

            }
        });



        const a = await fetchViewPage();

        //alert(response.data.status);


        //alert(user.coursetitle);

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

    const handleAddUser = () => {
        const newUserId = rows.length ? rows[rows.length - 1]._id + 1 : 1;
        const newRow = { ...newUser, _id: newUserId };
        setRows([...rows, newRow]);
        handleCloseAdd();
    };

    const handleEditUser = () => {
        const updatedRows = rows.map((row) =>
            row._id === selectedUser._id ? { ...selectedUser } : row
        );
        setRows(updatedRows);
        handleCloseEdit();
    };

    const handleDeleteUser = () => {
        const updatedRows = rows.filter((row) => row._id !== selectedUser._id);
        setRows(updatedRows);
        handleCloseDelete();
    };

    const handleInputChange = (event, field) => {
        const { value } = event.target;
        if (openAdd) {
            setNewUser({ ...newUser, [field]: value });
        } else if (openEdit) {
            setSelectedUser({ ...selectedUser, [field]: value });
        }
    };

    return (
        <React.Fragment>
            <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" marginBottom={4} marginTop={2}>

                    {/* <Button
             variant="contained"
             color="success"
             style={{ padding: '5px 10px', marginRight: '4px', fontSize: '12px', height: '30px', width: '80px' }}
             onClick={handleOpenAdd}
           >
             Add 
           </Button>
           <Button
             variant="contained"
             color="success"
             style={{ padding: '5px 10px', marginRight: '4px', fontSize: '12px', height: '30px', width: '80px' }}
             onClick={handleOpenAddBulk}
           >
             Bulk
           </Button> */}
                    <Button
                        variant="contained"
                        color="primary"
                        style={{ padding: '5px 10px', fontSize: '12px', marginRight: '4px', height: '30px', width: '80px' }}
                        onClick={() => setOpenExport(true)}
                    >
                        Export
                    </Button>

                    <Button onClick={refreshpage}
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
                            {/* <h1>Table Component</h1> */}



                            <DataGrid getRowId={(row) => row._id}

                                rows={rows}
                                columns={columns}

                                initialState={{
                                    pagination: {
                                        paginationModel: {
                                            pageSize: 10,
                                        },
                                    },
                                }}
                                processRowUpdate={(updatedRow, originalRow) =>
                                    handleOpenEdit1(updatedRow)
                                }
                                pageSizeOptions={[10]}
                                disableRowSelectionOnClick
                            />
                            {/* add button handler */}
                            <AddUserModal
                                open={openAdd}
                                handleClose={handleCloseAdd}
                                handleInputChange={handleInputChange}
                                handleAddUser={handleAddUser}
                                newUser={newUser}
                            />

                            <AddUserModalBulk
                                open={openAddBulk}
                                handleClose={handleCloseAddBulk}
                                handleInputChange={handleInputChange}
                                handleAddUser={handleAddUser}
                                newUser={newUser}
                            />

                            <EditUserModal
                                open={openEdit}
                                handleClose={handleCloseEdit}
                                handleInputChange={handleInputChange}
                                handleEditUser={handleEditUser}
                                selectedUser={selectedUser}
                            />

                            <DeleteUserModal
                                open={openDelete}
                                handleClose={handleCloseDelete}
                                handleDeleteUser={handleDeleteUser}
                                selectedUser={selectedUser}
                            />

                            <ExportUserModal
                                open={openExport}
                                handleClose={() => setOpenExport(false)}
                                handleExport={handleExport}
                            />
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </React.Fragment>
    );
}

export default ViewPage;
