import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Select,
    MenuItem,
    Card,
    CardContent,
    Grid,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { createRoot } from 'react-dom/client';
import ep1 from '../api/ep1';
import global1 from './global1';
import FacultyRequisitionPrintTemplate from './FacultyRequisitionPrintTemplate';

const FacultyCreateRequestds2 = () => {
    const [stores, setStores] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedStore, setSelectedStore] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [approvalOption, setApprovalOption] = useState('HOI');
    const [remark, setRemark] = useState('');
    const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
    const [indentNumber, setIndentNumber] = useState('');
    const [userDepartments, setUserDepartments] = useState([]);
    const [selectedDeptId, setSelectedDeptId] = useState('');

    const generateIndentNumber = (prefix = "INDDS") => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const date = String(now.getDate()).padStart(2, '0');
        const random = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}/${year}${month}${date}${random}`;
    };

    // Fetch initial data
    useEffect(() => {
        fetchStores();
        fetchItems();
        fetchDepartments();
    }, []);

    // Update indent number when department changes
    useEffect(() => {
        if (selectedDeptId && userDepartments.length > 0) {
            const dept = userDepartments.find(d => d._id === selectedDeptId);
            const prefix = dept?.institutionshort ? `INDDS${dept.institutionshort}` : "INDDS";
            setIndentNumber(generateIndentNumber(prefix));
        } else {
            setIndentNumber(generateIndentNumber("INDDS"));
        }
    }, [selectedDeptId, userDepartments]);

    const fetchStores = async () => {
        try {
            const response = await ep1.get(`/api/v2/getmystoresds2?colid=${global1.colid}&user=${global1.user}`);
            const myStores = response.data.data.stores.map(s => ({ _id: s.storeid, storename: s.store })) || [];
            setStores(myStores);

            // Auto-select if only one store is assigned
            if (myStores.length === 1) {
                setSelectedStore(myStores[0]._id);
            }
        } catch (error) {
            console.error('Error fetching stores:', error);
        }
    };

    const fetchItems = async () => {
        try {
            const response = await ep1.get(`/api/v2/getallitemmasterds2?colid=${global1.colid}`);
            setItems(response.data.data.items || []);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await ep1.post('/api/v2/getdepartmentindentds', { colid: global1.colid });
            if (response.data.success) {
                // Filter departments where current user is the creator
                const myDepts = response.data.data.filter(d => d.creatoruserid === global1.user);
                setUserDepartments(myDepts);
                // Auto-select if there's only one
                if (myDepts.length === 1) {
                    setSelectedDeptId(myDepts[0]._id);
                }
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const [cartItems, setCartItems] = useState([]);

    const handleRequestClick = (item) => {
        setSelectedItem(item);
        setOpenModal(true);
    };

    const handleAddToCart = () => {
        if (!selectedItem || !selectedStore || !quantity || !selectedDeptId) {
            alert('Please fill all fields, including Department');
            return;
        }

        const storeObj = stores.find(s => s._id === selectedStore);
        const deptObj = userDepartments.find(d => d._id === selectedDeptId);

        const newItem = {
            id: Date.now(), // Local key for DataGrid
            faculty: global1.name,
            facultyid: global1.user,
            itemcode: selectedItem.itemcode,
            itemname: selectedItem.itemname,
            quantity: Number(quantity),
            reqdate: new Date(),
            storeid: selectedStore,
            storename: storeObj?.storename || 'Unknown',
            departmentname: deptObj?.departmentname || 'Unknown',
            hoiapproveruserid: deptObj?.hoiapproveruserid || '',
            ahoiapproveruserid: deptObj?.ahoiapproveruserid || '',
            hoiApproverName: deptObj?.hoiapprovername || '',
            ahoiApproverName: deptObj?.ahoiapprovername || '',
            reqstatus: 'Pending Approval', // Default to Pending Approval as per workflow
            year: new Date().getFullYear().toString(),
            colid: global1.colid,
            user: global1.user,
            name: global1.name,
            approvalOption: approvalOption
        };

        setCartItems([...cartItems, newItem]);
        setOpenModal(false);
        setQuantity('');
        setSelectedItem(null);
        // Do NOT clear selectedStore, so user can add more from same store seamlessly
    };

    const handleRemoveFromCart = (id) => {
        setCartItems(cartItems.filter(item => (item.id || item.tempId) !== id));
    };

    const handleSubmitAll = async () => {
        if (cartItems.length === 0) {
            alert('Your cart is empty.');
            return;
        }
        setOpenSubmitDialog(true);
    };

    const handleConfirmSubmit = async () => {
        try {
            await Promise.all(cartItems.map(item => {
                const { id, tempId, ...apiPayload } = item; // Remove local ID keys before sending
                apiPayload.remark = remark; // Attach the remark from global state
                apiPayload.indentNumber = indentNumber; // Attach the newly formatted indent number
                return ep1.post('/api/v2/addrequisationds12', apiPayload);
            }));
            alert('All requisitions submitted successfully!');
            setCartItems([]);
            setOpenSubmitDialog(false);
            setRemark(''); // Clear remark for next session

            // Re-generate indent number for next batch using same prefix
            const dept = userDepartments.find(d => d._id === selectedDeptId);
            const prefix = dept?.institutionshort ? `INDDS${dept.institutionshort}` : "INDDS";
            setIndentNumber(generateIndentNumber(prefix));
        } catch (error) {
            console.error('Error submitting requisitions:', error);
            alert('Failed to submit some requisitions.');
        }
    };

    const handlePrint = async (itemsToPrint) => {
        if (!itemsToPrint || itemsToPrint.length === 0) {
            alert("No items to print.");
            return;
        }
        try {
            const configRes = await ep1.get(`/api/v2/getprconfigds2?colid=${global1.colid}`);
            const instConfig = configRes.data?.data || {};

            const printWindow = window.open('', '', 'width=900,height=700');
            const container = printWindow.document.createElement('div');
            printWindow.document.body.appendChild(container);

            const selectedDept = userDepartments.find(d => d._id === selectedDeptId);

            const root = createRoot(container);
            root.render(
                <FacultyRequisitionPrintTemplate
                    items={itemsToPrint}
                    instituteName={instConfig.institutionname}
                    instituteAddress={instConfig.address}
                    institutePhone={instConfig.phone}
                    indentNumber={indentNumber}
                    department={selectedDept?.departmentname || ""}
                    remark={remark}
                    name={global1.name}
                />
            );

            // Wait for render
            setTimeout(() => {
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }, 1000);

        } catch (error) {
            console.error("Error fetching institute details for print:", error);
            alert("Failed to print requisition.");
        }
    };

    const filteredItems = !selectedStore ? [] : items.filter(item =>
        (item.itemname && item.itemname.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.itemcode && item.itemcode.toLowerCase().includes(searchQuery.toLowerCase()))
    ).map(item => ({ ...item, id: item._id }));

    // Define Columns
    const searchColumns = [
        { field: 'itemname', headerName: 'Item Name', width: 200 },
        { field: 'itemcode', headerName: 'Item Code', width: 150 },
        { field: 'itemtype', headerName: 'Type', width: 150 },
        {
            field: 'action',
            headerName: 'Action',
            width: 150,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleRequestClick(params.row)}
                >
                    Add
                </Button>
            )
        }
    ];

    const cartColumns = [
        { field: 'storename', headerName: 'Store', width: 180 },
        { field: 'itemname', headerName: 'Item Name', width: 200 },
        { field: 'itemcode', headerName: 'Item Code', width: 150 },
        { field: 'quantity', headerName: 'Qty', width: 100 },
        {
            field: 'action',
            headerName: 'Remove',
            width: 150,
            renderCell: (params) => (
                <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleRemoveFromCart(params.row.id || params.row.tempId)}
                >
                    X
                </Button>
            )
        }
    ];

    return (
        <Box p={3} sx={{ height: '90vh', backgroundColor: '#f4f6f8' }}>
            <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
                Create Material Requisition
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, height: 'calc(100% - 60px)' }}>
                {/* Left Panel: Selection */}
                <Box sx={{ flex: 1, minWidth: 0, height: '100%' }}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" gutterBottom color="textSecondary">
                                1. Select Items
                            </Typography>

                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Select Store</InputLabel>
                                        <Select
                                            value={selectedStore}
                                            label="Select Store"
                                            onChange={(e) => setSelectedStore(e.target.value)}
                                        >
                                            {stores.map((store) => (
                                                <MenuItem key={store._id} value={store._id}>
                                                    {store.storename}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth size="small" required error={!selectedDeptId}>
                                        <InputLabel>Select Department</InputLabel>
                                        <Select
                                            value={selectedDeptId}
                                            label="Select Department"
                                            onChange={(e) => setSelectedDeptId(e.target.value)}
                                        >
                                            {userDepartments.map((dept) => (
                                                <MenuItem key={dept._id} value={dept._id}>
                                                    {dept.departmentname}
                                                </MenuItem>
                                            ))}
                                            {userDepartments.length === 0 && (
                                                <MenuItem disabled>No departments configured for you</MenuItem>
                                            )}
                                        </Select>
                                        {userDepartments.length === 0 && (
                                            <Typography variant="caption" color="error" sx={{ px: 2 }}>
                                                Ask admin to configure your department in 'Department Indent'
                                            </Typography>
                                        )}
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Approval Option</InputLabel>
                                        <Select
                                            value={approvalOption}
                                            label="Approval Option"
                                            onChange={(e) => setApprovalOption(e.target.value)}
                                        >
                                            <MenuItem value="HOI">HOI/AI Approve</MenuItem>
                                            <MenuItem value="Manual">Manual Approve (AI)</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Search Items (Name or Code)"
                                        variant="outlined"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        disabled={!selectedStore}
                                        helperText={!selectedStore ? "Select a store first" : ""}
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
                                <DataGrid
                                    rows={filteredItems}
                                    columns={searchColumns}
                                    initialState={{
                                        pagination: {
                                            paginationModel: { pageSize: 25 }
                                        }
                                    }}
                                    pageSizeOptions={[10, 25, 50, 100]}
                                    disableRowSelectionOnClick
                                    hideFooterSelectedRowCount
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                {/* Right Panel: Cart */}
                <Box sx={{ flex: 1, minWidth: 0, height: '100%' }}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6" color="textSecondary">
                                    2. Your Request Cart
                                </Typography>
                                <Box>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handlePrint(cartItems)}
                                        disabled={cartItems.length === 0}
                                        size="medium"
                                        sx={{ mr: 1 }}
                                    >
                                        Print
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={handleSubmitAll}
                                        disabled={cartItems.length === 0}
                                        size="medium"
                                    >
                                        Submit All ({cartItems.length})
                                    </Button>
                                </Box>
                            </Box>

                            <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
                                <DataGrid
                                    rows={cartItems}
                                    columns={cartColumns}
                                    initialState={{
                                        pagination: {
                                            paginationModel: { pageSize: 25 }
                                        }
                                    }}
                                    pageSizeOptions={[10, 25, 50, 100]}
                                    disableRowSelectionOnClick
                                    hideFooterSelectedRowCount
                                    getRowId={(row) => row.id || row.tempId}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* Quantity Dialog */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)}>
                <DialogTitle>Add {selectedItem?.itemname} to Cart</DialogTitle>
                <DialogContent sx={{ pt: 2, minWidth: 300 }}>
                    <Typography variant="body2" gutterBottom color="textSecondary">
                        Store: {stores.find(s => s._id === selectedStore)?.storename}
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Quantity Required"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button onClick={handleAddToCart} variant="contained" color="primary">
                        Add to Cart
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Submit All Confirmation Dialog with Remark */}
            <Dialog open={openSubmitDialog} onClose={() => setOpenSubmitDialog(false)}>
                <DialogTitle>Confirm Submission</DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>
                        Are you sure you want to submit {cartItems.length} request(s)?
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        margin="dense"
                        label="Remark (Highly Recommended)"
                        placeholder="e.g. For Establishment Section Registrar office PU"
                        variant="outlined"
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSubmitDialog(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmSubmit} color="primary" variant="contained">
                        Confirm & Submit
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default FacultyCreateRequestds2;
